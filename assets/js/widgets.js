"use strict";

/**
 * Spark Digital site widgets: floating AI chat assistant + exit-intent offer.
 * Self-injecting and dependency-free. Include once per page after main.js.
 */
(function () {
  const onReady = (fn) => {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  };
  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const safeStorage = {
    get(key) {
      try { return window.localStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, value); } catch { /* ignore */ }
    },
  };

  const KNOWLEDGE = [
    {
      keys: ["xin chào", "xin chao", "chào", "chao", "hello", "hi ", "alo", "hey"],
      reply: "Chào bạn! Mình là Spark AI. Mình có thể giúp gì về website, phần mềm hoặc sản phẩm AI của Spark Digital?",
    },
    {
      keys: ["giá", "gia", "báo giá", "bao gia", "chi phí", "chi phi", "bao nhiêu", "bao nhieu", "cost", "pricing"],
      reply: "Chi phí tùy quy mô: Landing page từ 5.000.000₫, Website doanh nghiệp từ 12.000.000₫, phần mềm & SaaS từ 35.000.000₫. Bạn xem bảng giá chi tiết hoặc gửi yêu cầu để nhận báo giá chính xác trong 24h nhé.",
      actions: [{ label: "Bảng giá", href: "pricing.html" }, { label: "Nhận báo giá", href: "contact.html" }],
    },
    {
      keys: ["ai", "trí tuệ", "tri tue", "chatbot", "voicebot", "tự động", "tu dong"],
      reply: "Bên mình có nhiều sản phẩm AI: Chatbot AI đa kênh, Trợ lý AI nội bộ, AI Phân tích & Dự báo, AI Tạo nội dung, Voicebot tổng đài...",
      actions: [{ label: "Xem sản phẩm AI", href: "products.html#ai" }],
    },
    {
      keys: ["sản phẩm", "san pham", "phần mềm", "phan mem", "quản lý", "quan ly", "crm", "kho", "nhân sự", "nhan su", "kế toán", "ke toan", "product"],
      reply: "Spark Digital có sẵn nhiều phần mềm quản lý: Bán hàng (POS), Kho (WMS), Nhân sự & Chấm công, Kế toán & Hóa đơn, CRM, Quản lý dự án — cùng các sản phẩm AI.",
      actions: [{ label: "Xem sản phẩm", href: "products.html" }],
    },
    {
      keys: ["dịch vụ", "dich vu", "service", "làm gì", "lam gi"],
      reply: "Spark Digital cung cấp: Thiết kế Website, Phát triển Phần mềm, Web App & SaaS, và SEO & Bảo trì.",
      actions: [{ label: "Xem dịch vụ", href: "services.html" }],
    },
    {
      keys: ["website", "web ", "trang web", "landing", "thương mại", "thuong mai"],
      reply: "Bên mình thiết kế website chuẩn SEO, tốc độ cao: landing page, web doanh nghiệp, thương mại điện tử — điểm PageSpeed trung bình 90+.",
      actions: [{ label: "Dịch vụ", href: "services.html" }, { label: "Dự án", href: "portfolio.html" }],
    },
    {
      keys: ["liên hệ", "lien he", "contact", "sđt", "sdt", "số điện thoại", "so dien thoai", "phone", "email", "gọi", "goi", "zalo"],
      reply: "Bạn liên hệ trực tiếp nhé: ĐT/Zalo 0384 741 350, email buidangminh.lh@gmail.com. Hoặc gửi yêu cầu qua form, bên mình phản hồi trong 24h.",
      actions: [{ label: "Gọi ngay", href: "tel:+84384741350" }, { label: "Gửi yêu cầu", href: "contact.html" }],
    },
    {
      keys: ["bao lâu", "bao lau", "thời gian", "thoi gian", "tiến độ", "tien do", "khi nào", "khi nao"],
      reply: "Thời gian thực hiện: landing page 5–7 ngày, website doanh nghiệp 2–4 tuần, phần mềm & SaaS từ 6 tuần tùy độ phức tạp.",
    },
    {
      keys: ["bảo hành", "bao hanh", "warranty", "hỗ trợ", "ho tro"],
      reply: "Mọi sản phẩm được bảo hành 12 tháng (gói Khởi đầu 6 tháng), bàn giao đầy đủ mã nguồn và hỗ trợ kỹ thuật.",
    },
    {
      keys: ["cảm ơn", "cam on", "thanks", "thank", "ok"],
      reply: "Rất vui được hỗ trợ bạn! Nếu cần tư vấn sâu hơn, bạn để lại yêu cầu nhé.",
      actions: [{ label: "Liên hệ", href: "contact.html" }],
    },
  ];

  const FALLBACK = {
    reply: "Mình chưa chắc hiểu ý bạn. Bạn có thể hỏi về giá, dịch vụ, sản phẩm AI, hoặc để lại liên hệ để được tư vấn trực tiếp.",
    actions: [{ label: "Liên hệ tư vấn", href: "contact.html" }],
  };

  const QUICK_REPLIES = ["Bảng giá", "Dịch vụ", "Sản phẩm AI", "Liên hệ"];

  function botReply(text) {
    const normalized = text.toLowerCase();
    for (const item of KNOWLEDGE) {
      if (item.keys.some((key) => normalized.includes(key))) {
        return { reply: item.reply, actions: item.actions || [] };
      }
    }
    return { reply: FALLBACK.reply, actions: FALLBACK.actions };
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function buildChat() {
    const launcher = el(
      "button",
      "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-accent py-3 pl-4 pr-5 text-sm font-semibold text-white shadow-lift transition-colors hover:bg-accent-hover"
    );
    launcher.id = "sparkChatBtn";
    launcher.setAttribute("aria-label", "Mở trợ lý AI Spark");
    launcher.setAttribute("aria-expanded", "false");
    launcher.innerHTML =
      '<span class="relative grid h-6 w-6 place-items-center">' +
      '<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h8M8 14h5M21 12a8 8 0 0 1-8 8H7l-4 3v-7a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/></svg>' +
      '<span class="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>' +
      "</span><span>Trợ lý AI</span>";

    const teaser = el(
      "div",
      "fixed bottom-[5.25rem] right-6 z-50 hidden max-w-[15rem] rounded-2xl rounded-br-sm border border-line bg-paper px-4 py-3 text-sm text-ink shadow-lift"
    );
    teaser.id = "sparkTeaser";
    teaser.innerHTML =
      '<button aria-label="Đóng" data-teaser-close class="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-ink text-cream">' +
      '<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path stroke-linecap="round" d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      "Cần tư vấn website hay phần mềm? Chat với mình nhé!";

    const panel = el(
      "section",
      "fixed bottom-24 right-6 z-50 hidden w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-lift"
    );
    panel.id = "sparkChatPanel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Trợ lý AI Spark Digital");
    panel.innerHTML =
      '<header class="flex items-center justify-between gap-3 bg-ink px-4 py-3 text-cream">' +
      '<div class="flex items-center gap-3">' +
      '<span class="grid h-9 w-9 place-items-center rounded-full bg-accent text-white"><svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13z"/></svg></span>' +
      '<div><p class="font-display text-sm font-bold leading-tight">Spark AI</p>' +
      '<p class="flex items-center gap-1.5 text-xs text-cream/60"><span class="h-1.5 w-1.5 rounded-full bg-green-400"></span>Đang trực tuyến</p></div></div>' +
      '<button id="sparkChatClose" aria-label="Đóng trợ lý" class="grid h-8 w-8 place-items-center rounded-full text-cream/70 transition-colors hover:bg-white/10 hover:text-white"><svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      "</header>" +
      '<div id="sparkChatLog" class="flex h-80 flex-col gap-3 overflow-y-auto bg-cream px-4 py-4" aria-live="polite"></div>' +
      '<div id="sparkQuick" class="flex flex-wrap gap-2 border-t border-line bg-paper px-4 pt-3"></div>' +
      '<form id="sparkChatForm" class="flex items-center gap-2 bg-paper p-3">' +
      '<label class="sr-only" for="sparkChatInput">Nhập câu hỏi</label>' +
      '<input id="sparkChatInput" autocomplete="off" placeholder="Nhập câu hỏi của bạn..." class="min-w-0 flex-1 rounded-full border border-line bg-cream px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent" />' +
      '<button type="submit" aria-label="Gửi" class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover"><svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/></svg></button>' +
      "</form>";

    document.body.append(launcher, teaser, panel);

    const log = panel.querySelector("#sparkChatLog");
    const quick = panel.querySelector("#sparkQuick");
    const form = panel.querySelector("#sparkChatForm");
    const input = panel.querySelector("#sparkChatInput");
    let greeted = false;

    const scrollDown = () => { log.scrollTop = log.scrollHeight; };

    const addUser = (text) => {
      const wrap = el("div", "flex justify-end");
      wrap.appendChild(el("div", "max-w-[80%] rounded-2xl rounded-br-sm bg-ink px-3.5 py-2 text-sm text-cream", text));
      log.appendChild(wrap);
      scrollDown();
    };

    const addBot = (text, actions) => {
      const wrap = el("div", "flex flex-col items-start gap-2");
      wrap.appendChild(el("div", "max-w-[85%] rounded-2xl rounded-bl-sm border border-line bg-paper px-3.5 py-2 text-sm text-ink", text));
      if (actions && actions.length) {
        const row = el("div", "flex flex-wrap gap-2");
        actions.forEach((a) => {
          const link = el("a", "rounded-full border border-accent px-3 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-white", a.label);
          link.href = a.href;
          row.appendChild(link);
        });
        wrap.appendChild(row);
      }
      log.appendChild(wrap);
      scrollDown();
    };

    const showTyping = () => {
      const wrap = el("div", "flex justify-start");
      wrap.id = "sparkTyping";
      wrap.innerHTML = '<div class="spark-typing flex gap-1 rounded-2xl rounded-bl-sm border border-line bg-paper px-3.5 py-3"><span></span><span></span><span></span></div>';
      log.appendChild(wrap);
      scrollDown();
    };
    const removeTyping = () => document.getElementById("sparkTyping")?.remove();

    const AI_ENDPOINT = "/api/chat";
    const GREETING = "Chào bạn! Mình là Spark AI. Mình có thể giúp gì về website, phần mềm hoặc sản phẩm AI của Spark Digital?";
    const history = [];
    let aiAvailable = true;

    const pushHistory = (role, content) => {
      history.push({ role, content });
      if (history.length > 12) history.splice(0, history.length - 12);
    };

    const aiReply = async () => {
      if (!aiAvailable) return null;
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 18000);
      try {
        const response = await fetch(AI_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });
        if (response.status === 404 || response.status === 503) {
          aiAvailable = false;
          return null;
        }
        if (!response.ok) return null;
        const data = await response.json().catch(() => ({}));
        return typeof data.reply === "string" && data.reply.trim() ? data.reply.trim() : null;
      } catch {
        return null;
      } finally {
        window.clearTimeout(timer);
      }
    };

    const respond = async (text) => {
      showTyping();
      const ai = await aiReply();
      if (ai) {
        removeTyping();
        addBot(ai, botReply(text).actions);
        pushHistory("assistant", ai);
        return;
      }
      const { reply, actions } = botReply(text);
      window.setTimeout(() => {
        removeTyping();
        addBot(reply, actions);
        pushHistory("assistant", reply);
      }, reducedMotion() ? 0 : 320);
    };

    const send = (text) => {
      const value = text.trim();
      if (!value) return;
      addUser(value);
      pushHistory("user", value);
      respond(value);
    };

    QUICK_REPLIES.forEach((label) => {
      const chip = el("button", "rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent", label);
      chip.type = "button";
      chip.addEventListener("click", () => send(label));
      quick.appendChild(chip);
    });

    const dismissTeaser = () => teaser.classList.add("hidden");

    const open = () => {
      panel.classList.remove("hidden");
      panel.classList.add("flex", "spark-anim-up");
      launcher.setAttribute("aria-expanded", "true");
      launcher.classList.add("hidden");
      dismissTeaser();
      if (!greeted) {
        greeted = true;
        addBot(GREETING, []);
        pushHistory("assistant", GREETING);
      }
      window.setTimeout(() => input.focus(), 60);
    };
    const close = () => {
      panel.classList.add("hidden");
      panel.classList.remove("flex");
      launcher.classList.remove("hidden");
      launcher.setAttribute("aria-expanded", "false");
      launcher.focus();
    };

    launcher.addEventListener("click", open);
    panel.querySelector("#sparkChatClose").addEventListener("click", close);
    teaser.addEventListener("click", (e) => {
      if (e.target.closest("[data-teaser-close]")) { dismissTeaser(); return; }
      open();
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      send(input.value);
      input.value = "";
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panel.classList.contains("hidden")) close();
    });

    if (!safeStorage.get("spark_chat_opened")) {
      window.setTimeout(() => {
        if (launcher.getAttribute("aria-expanded") !== "true") {
          teaser.classList.remove("hidden");
          teaser.classList.add("spark-anim-up");
        }
      }, 6000);
    }
    launcher.addEventListener("click", () => safeStorage.set("spark_chat_opened", "1"), { once: true });
  }

  function buildOffer() {
    const file = window.location.pathname.split("/").pop() || "index.html";
    if (file === "contact.html") return;

    const KEY = "spark_offer_seen";
    const last = Number(safeStorage.get(KEY) || 0);
    if (last && Date.now() - last < 7 * 24 * 60 * 60 * 1000) return;

    const overlay = el("div", "fixed inset-0 z-[60] hidden items-center justify-center p-4");
    overlay.id = "sparkOffer";
    overlay.innerHTML =
      '<div data-offer-close class="absolute inset-0 bg-ink/60 backdrop-blur-sm"></div>' +
      '<div role="dialog" aria-modal="true" aria-labelledby="sparkOfferTitle" class="spark-anim-up relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-paper shadow-lift">' +
      '<div class="bg-ink px-6 py-5 text-cream">' +
      '<p class="eyebrow text-accent">Ưu đãi đặc biệt</p>' +
      '<h2 id="sparkOfferTitle" class="mt-2 font-display text-2xl font-bold leading-tight">Tư vấn miễn phí + giảm 10% gói đầu tiên</h2>' +
      "</div>" +
      '<div class="px-6 py-6">' +
      '<p class="text-muted">Để lại yêu cầu hôm nay để nhận tư vấn miễn phí và ưu đãi 10% cho dự án đầu tiên cùng Spark Digital.</p>' +
      '<div class="mt-6 flex flex-col gap-3 sm:flex-row">' +
      '<a href="contact.html" class="flex-1 rounded-full bg-accent px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-accent-hover">Nhận ưu đãi ngay</a>' +
      '<button data-offer-close type="button" class="rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-sand">Để sau</button>' +
      "</div>" +
      '<p class="mt-3 text-center text-xs text-muted">Hoặc gọi ngay <a href="tel:+84384741350" class="font-semibold text-accent">0384 741 350</a></p>' +
      "</div>" +
      '<button data-offer-close aria-label="Đóng" class="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-cream/70 transition-colors hover:bg-white/10 hover:text-white"><svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      "</div>";
    document.body.appendChild(overlay);

    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      safeStorage.set(KEY, String(Date.now()));
      overlay.classList.remove("hidden");
      overlay.classList.add("flex");
      cleanup();
      window.setTimeout(() => overlay.querySelector("a")?.focus(), 60);
    };
    const close = () => {
      overlay.classList.add("hidden");
      overlay.classList.remove("flex");
    };

    const onMouseOut = (e) => {
      if (e.clientY <= 0 && !e.relatedTarget) show();
    };
    const timer = window.setTimeout(show, 35000);
    const cleanup = () => {
      document.removeEventListener("mouseout", onMouseOut);
      window.clearTimeout(timer);
    };

    document.addEventListener("mouseout", onMouseOut);
    overlay.addEventListener("click", (e) => {
      if (e.target.closest("[data-offer-close]")) close();
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !overlay.classList.contains("hidden")) close();
    });
  }

  function repositionBackToTop() {
    const btt = document.querySelector("[data-back-to-top]");
    if (btt) btt.style.bottom = "5.75rem";
  }

  onReady(() => {
    repositionBackToTop();
    buildChat();
    buildOffer();
  });
})();
