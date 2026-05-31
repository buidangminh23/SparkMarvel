"use strict";

/**
 * Công cụ "Báo giá tức thì" trên trang Bảng giá — song ngữ VI/EN.
 * Đọc localStorage spark_lang để format giá theo locale + dùng nhãn/đơn vị đúng ngôn ngữ.
 * (Đổi ngôn ngữ sẽ reload trang nên lang luôn đúng tại thời điểm chạy.)
 * Mọi nhãn là chuỗi tĩnh tin cậy; không nhận input tự do -> không có rủi ro XSS.
 */
(function () {
  const onReady = (fn) => {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  };

  const lang = (() => {
    try { return window.localStorage.getItem("spark_lang") === "en" ? "en" : "vi"; } catch { return "vi"; }
  })();

  const TYPES = [
    { id: "landing", label: "Landing page", en: "Landing page", base: 5e6, incl: 1, perPage: 1.5e6 },
    { id: "website", label: "Website doanh nghiệp", en: "Business website", base: 12e6, incl: 8, perPage: 0.8e6 },
    { id: "webapp", label: "Web App / SaaS", en: "Web App / SaaS", base: 35e6, incl: 6, perPage: 2.5e6 },
    { id: "software", label: "Phần mềm quản lý", en: "Management software", base: 35e6, incl: 8, perPage: 2e6 },
    { id: "ai", label: "Chatbot / Sản phẩm AI", en: "Chatbot / AI product", base: 8e6, incl: 1, perPage: 1e6 },
  ];

  const FEATURES = [
    { id: "uiux", label: "Thiết kế UI/UX riêng", en: "Custom UI/UX design", add: 8e6 },
    { id: "i18n", label: "Đa ngôn ngữ", en: "Multi-language", add: 5e6 },
    { id: "auth", label: "Tài khoản & phân quyền", en: "Accounts & permissions", add: 12e6 },
    { id: "pay", label: "Thanh toán online", en: "Online payments", add: 8e6 },
    { id: "aibot", label: "Tích hợp AI / Chatbot", en: "AI / Chatbot integration", add: 8e6 },
    { id: "seo", label: "SEO nâng cao", en: "Advanced SEO", add: 5e6 },
    { id: "cms", label: "Quản trị nội dung (CMS)", en: "Content management (CMS)", add: 6e6 },
  ];

  const STR = lang === "en"
    ? {
        timelinePrefix: "Estimated timeline: ",
        weeks: ["1–2 weeks", "2–4 weeks", "4–8 weeks", "8–12 weeks"],
        typeLabel: "Project type",
        pagesLabel: "Pages/screens",
        quoteHeader: "Quote request from the estimator:",
        estimate: "Estimate: ",
      }
    : {
        timelinePrefix: "Thời gian dự kiến: ",
        weeks: ["1–2 tuần", "2–4 tuần", "4–8 tuần", "8–12 tuần"],
        typeLabel: "Loại dự án",
        pagesLabel: "Số trang/màn hình",
        quoteHeader: "Yêu cầu báo giá từ công cụ ước tính:",
        estimate: "Ước tính: ",
      };

  const LABEL_CLASS =
    "flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-cream px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-accent has-[:checked]:border-accent has-[:checked]:bg-accent-soft";

  const locale = lang === "en" ? "en-US" : "vi-VN";
  const roundTo = (n) => Math.round(n / 500000) * 500000;
  const vnd = (n) => roundTo(n).toLocaleString(locale) + "₫";
  const tLabel = (t) => (lang === "en" ? t.en : t.label);
  const fLabel = (f) => (lang === "en" ? f.en : f.label);
  const timeline = (total) => {
    if (total < 10e6) return STR.weeks[0];
    if (total < 25e6) return STR.weeks[1];
    if (total < 50e6) return STR.weeks[2];
    return STR.weeks[3];
  };

  onReady(() => {
    const root = document.querySelector("[data-estimator]");
    if (!root) return;

    const typesMount = root.querySelector("[data-types]");
    const featMount = root.querySelector("[data-features]");
    const pages = root.querySelector("[data-pages]");
    const pagesVal = root.querySelector("[data-pages-val]");
    const priceEl = root.querySelector("[data-price]");
    const timelineEl = root.querySelector("[data-timeline]");
    const summaryEl = root.querySelector("[data-summary]");
    const link = root.querySelector("[data-quote-link]");

    TYPES.forEach((t, i) => {
      const label = document.createElement("label");
      label.className = LABEL_CLASS;
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "est-type";
      input.value = t.id;
      input.className = "accent-accent";
      if (i === 0) input.checked = true;
      const span = document.createElement("span");
      span.textContent = tLabel(t);
      label.append(input, span);
      typesMount.appendChild(label);
    });

    FEATURES.forEach((f) => {
      const label = document.createElement("label");
      label.className = LABEL_CLASS;
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = f.id;
      input.className = "accent-accent";
      const span = document.createElement("span");
      span.textContent = fLabel(f);
      label.append(input, span);
      featMount.appendChild(label);
    });

    const compute = () => {
      const typeId = root.querySelector('input[name="est-type"]:checked').value;
      const type = TYPES.find((x) => x.id === typeId);
      const p = Number(pages.value);
      pagesVal.textContent = String(p);

      const extra = Math.max(0, p - type.incl) * type.perPage;
      const chosen = FEATURES.filter((f) => root.querySelector(`input[value="${f.id}"]`).checked);
      const addons = chosen.reduce((s, f) => s + f.add, 0);
      const total = type.base + extra + addons;

      priceEl.textContent = `${vnd(total)} – ${vnd(total * 1.3)}`;
      timelineEl.textContent = STR.timelinePrefix + timeline(total);

      const items = [`${STR.typeLabel}: ${tLabel(type)}`, `${STR.pagesLabel}: ${p}`];
      chosen.forEach((f) => items.push(fLabel(f)));
      summaryEl.replaceChildren();
      items.forEach((txt) => {
        const li = document.createElement("li");
        li.className = "flex gap-2";
        const dash = document.createElement("span");
        dash.className = "text-accent";
        dash.textContent = "—";
        const span = document.createElement("span");
        span.textContent = txt;
        li.append(dash, span);
        summaryEl.appendChild(li);
      });

      const summaryText =
        STR.quoteHeader +
        "\n- " +
        items.join("\n- ") +
        `\n- ${STR.estimate}${vnd(total)} – ${vnd(total * 1.3)} (${timeline(total)})`;
      link.href =
        "contact.html?service=" +
        encodeURIComponent(tLabel(type)) +
        "&est=" +
        encodeURIComponent(summaryText);
    };

    root.querySelectorAll('input[name="est-type"]').forEach((r) => r.addEventListener("change", compute));
    featMount.querySelectorAll("input").forEach((c) => c.addEventListener("change", compute));
    pages.addEventListener("input", compute);
    compute();

    if (window.location.hash === "#uoc-tinh") {
      window.setTimeout(() => root.scrollIntoView({ block: "start" }), 80);
    }
  });
})();
