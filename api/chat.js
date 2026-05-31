/**
 * Vercel Serverless Function: trợ lý AI "Spark AI".
 * Gọi Vercel AI Gateway (OpenAI-compatible) — key đặt trong env, không lộ ra client.
 *
 * Bật AI thật: trên Vercel đặt env AI_GATEWAY_API_KEY (lấy ở vercel.com/dashboard -> AI Gateway).
 * Chưa cấu hình hoặc chạy tĩnh -> trả 503, client tự fallback về bot từ khóa.
 */
const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
const MODEL = "google/gemini-2.0-flash";
const MAX_HISTORY = 10;

const SYSTEM_PROMPT = [
  'Bạn là "Spark AI", trợ lý ảo của Spark Digital — studio thiết kế website & phát triển phần mềm tại Hà Nội.',
  "Dịch vụ: thiết kế website (landing, doanh nghiệp, TMĐT), web app & SaaS, phần mềm quản lý (bán hàng/kho/nhân sự/kế toán/CRM), sản phẩm AI (chatbot, trợ lý AI nội bộ, AI phân tích & dự báo, voicebot), SEO & bảo trì.",
  "Giá tham khảo: landing page từ 5.000.000đ, website doanh nghiệp từ 12.000.000đ, phần mềm & SaaS từ 35.000.000đ. Báo giá chính xác trong 24h. Bảo hành tới 12 tháng, bàn giao đầy đủ mã nguồn.",
  "Liên hệ: 0384 741 350 (Zalo), email buidangminh.lh@gmail.com.",
  "Trả lời bằng tiếng Việt, thân thiện, ngắn gọn (tối đa 4 câu). Nếu khách có nhu cầu, mời họ để lại liên hệ hoặc gửi yêu cầu báo giá. Chỉ tư vấn trong phạm vi dịch vụ của Spark Digital.",
].join(" ");

function sanitize(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "AI chưa được cấu hình" });
    return;
  }

  const history = sanitize(req.body && req.body.messages);
  if (!history.length) {
    res.status(400).json({ error: "Thiếu nội dung" });
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const upstream = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
        max_tokens: 320,
        temperature: 0.6,
      }),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      res.status(502).json({ error: "AI upstream error" });
      return;
    }

    const data = await upstream.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      res.status(502).json({ error: "AI trả về rỗng" });
      return;
    }
    res.status(200).json({ reply });
  } catch (error) {
    const aborted = error && error.name === "AbortError";
    res.status(aborted ? 504 : 500).json({ error: aborted ? "AI phản hồi chậm" : "Lỗi xử lý" });
  } finally {
    clearTimeout(timer);
  }
}
