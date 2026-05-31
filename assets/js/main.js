"use strict";

(function loadI18n() {
  const s = document.createElement("script");
  s.src = "assets/js/i18n.js";
  (document.head || document.documentElement).appendChild(s);
})();

const onReady = (fn) => {
  if (document.readyState !== "loading") fn();
  else document.addEventListener("DOMContentLoaded", fn);
};

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initMobileMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    menu.classList.toggle("hidden", !open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("overflow-hidden", open);
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });
  menu.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => setOpen(false))
  );
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

function initActiveNav() {
  const file = window.location.pathname.split("/").pop() || "index.html";
  const current = file === "" ? "index.html" : file;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.getAttribute("data-nav") === current) {
      link.setAttribute("aria-current", "page");
    }
  });
}

function initScrollHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return;
  const scrolledClasses = [
    "bg-cream/85",
    "backdrop-blur-md",
    "border-b",
    "border-line",
    "shadow-soft",
  ];
  const onScroll = () => {
    const scrolled = window.scrollY > 12;
    scrolledClasses.forEach((cls) => header.classList.toggle(cls, scrolled));
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px 0px 0px" }
  );
  items.forEach((item) => observer.observe(item));
  window.setTimeout(() => items.forEach((item) => item.classList.add("is-visible")), 1500);
}

function animateCounter(el) {
  const target = Number(el.getAttribute("data-counter")) || 0;
  const suffix = el.getAttribute("data-suffix") || "";
  const duration = 1600;
  if (prefersReducedMotion()) {
    el.textContent = `${target}${suffix}`;
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = `${Math.round(eased * target)}${suffix}`;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length || !("IntersectionObserver" in window)) {
    counters.forEach(animateCounter);
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((counter) => observer.observe(counter));
}

function initTestimonials() {
  const root = document.querySelector("[data-testimonials]");
  if (!root) return;
  const slides = Array.from(root.querySelectorAll("[data-slide]"));
  const dots = Array.from(root.querySelectorAll("[data-dot]"));
  if (slides.length <= 1) return;
  let index = 0;
  let timer = null;

  const setDot = (i, active) => {
    dots[i]?.classList.toggle("bg-accent", active);
    dots[i]?.classList.toggle("w-8", active);
    dots[i]?.classList.toggle("bg-line", !active);
    dots[i]?.classList.toggle("w-2.5", !active);
  };

  const show = (next) => {
    slides[index].classList.add("hidden");
    setDot(index, false);
    index = (next + slides.length) % slides.length;
    slides[index].classList.remove("hidden");
    setDot(index, true);
  };

  const start = () => {
    if (prefersReducedMotion()) return;
    timer = window.setInterval(() => show(index + 1), 6000);
  };
  const stop = () => timer && window.clearInterval(timer);

  dots.forEach((dot, i) =>
    dot.addEventListener("click", () => {
      stop();
      show(i);
      start();
    })
  );
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  start();
}

function initPortfolioFilter() {
  const root = document.querySelector("[data-portfolio]");
  if (!root) return;
  const buttons = Array.from(root.querySelectorAll("[data-filter]"));
  const items = Array.from(root.querySelectorAll("[data-category]"));

  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter");
      buttons.forEach((b) => {
        const active = b === button;
        b.classList.toggle("bg-ink", active);
        b.classList.toggle("text-cream", active);
        b.classList.toggle("bg-paper", !active);
        b.classList.toggle("text-ink", !active);
        b.setAttribute("aria-pressed", String(active));
      });
      items.forEach((item) => {
        const show = filter === "all" || item.getAttribute("data-category") === filter;
        item.classList.toggle("hidden", !show);
      });
    })
  );
}

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;
  const status = form.querySelector("[data-form-status]");

  const showError = (field, message) => {
    const error = form.querySelector(`[data-error-for="${field.name}"]`);
    field.setAttribute("aria-invalid", "true");
    field.classList.add("border-red-400");
    if (error) error.textContent = message;
  };
  const clearError = (field) => {
    const error = form.querySelector(`[data-error-for="${field.name}"]`);
    field.removeAttribute("aria-invalid");
    field.classList.remove("border-red-400");
    if (error) error.textContent = "";
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[0-9+()\s.-]{8,15}$/;

  const ENDPOINT = "https://api.web3forms.com/submit";
  const REQUEST_TIMEOUT = 12000;
  const config = window.SPARK_CONFIG || {};
  const accessKey = config.web3formsAccessKey || "";
  const isConfigured = Boolean(accessKey) && accessKey !== "YOUR_WEB3FORMS_ACCESS_KEY";
  const button = form.querySelector('button[type="submit"]');

  const setStatus = (message, tone) => {
    const tones = { info: "text-ink", error: "text-red-600", success: "text-green-700" };
    status.textContent = message;
    status.className = `text-sm font-semibold ${tones[tone] || "text-muted"}`;
  };

  const isFormValid = () => {
    let valid = true;
    form.querySelectorAll("[data-required]").forEach((field) => {
      clearError(field);
      const value = field.value.trim();
      if (!value) {
        showError(field, "Vui lòng điền thông tin này.");
        valid = false;
        return;
      }
      if (field.type === "email" && !emailPattern.test(value)) {
        showError(field, "Email chưa hợp lệ.");
        valid = false;
      }
      if (field.name === "phone" && !phonePattern.test(value)) {
        showError(field, "Số điện thoại chưa hợp lệ.");
        valid = false;
      }
    });
    return valid;
  };

  const submitToWeb3Forms = async (payload) => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: payload,
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      return { ok: response.ok && data.success === true, message: data.message };
    } finally {
      window.clearTimeout(timer);
    }
  };

  const setSubmitting = (submitting) => {
    button.disabled = submitting;
    button.classList.toggle("opacity-70", submitting);
    button.classList.toggle("cursor-not-allowed", submitting);
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const honeypot = form.querySelector('[name="botcheck"]');
    if (honeypot && honeypot.checked) return;

    if (!isFormValid()) {
      setStatus("Vui lòng kiểm tra lại các trường được đánh dấu.", "error");
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    if (!isConfigured) {
      setStatus(
        "Form chưa được cấu hình access key. Vui lòng liên hệ qua điện thoại 0384 741 350 hoặc email.",
        "error"
      );
      return;
    }

    setSubmitting(true);
    setStatus("Đang gửi yêu cầu...", "info");

    const payload = new FormData(form);
    payload.append("access_key", accessKey);
    payload.append("subject", config.formSubject || "Yêu cầu mới từ website Spark Digital");

    try {
      const result = await submitToWeb3Forms(payload);
      if (result.ok) {
        form.reset();
        setStatus(
          "Đã gửi thành công! Spark Digital sẽ liên hệ lại trong vòng 24 giờ làm việc.",
          "success"
        );
      } else {
        setStatus(
          result.message || "Gửi không thành công. Vui lòng thử lại hoặc gọi 0384 741 350.",
          "error"
        );
      }
    } catch (error) {
      const aborted = error && error.name === "AbortError";
      setStatus(
        aborted
          ? "Mạng phản hồi chậm. Vui lòng thử lại hoặc gọi 0384 741 350."
          : "Không gửi được do lỗi kết nối. Vui lòng thử lại hoặc gọi 0384 741 350.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  });

  form.querySelectorAll("[data-required]").forEach((field) =>
    field.addEventListener("input", () => clearError(field))
  );
}

function initEstimatorPrefill() {
  const params = new URLSearchParams(window.location.search);
  const est = params.get("est");
  const service = params.get("service");
  if (!est && !service) return;
  const message = document.querySelector("#message");
  const select = document.querySelector("#service");
  if (message && est) {
    message.value = est;
    message.dispatchEvent(new Event("input"));
  }
  if (select && service) {
    const match = Array.from(select.options).some((o) => o.value === service);
    if (match) select.value = service;
  }
}

function initBackToTop() {
  const button = document.querySelector("[data-back-to-top]");
  if (!button) return;
  const onScroll = () => {
    const hidden = window.scrollY < 480;
    button.classList.toggle("opacity-0", hidden);
    button.classList.toggle("pointer-events-none", hidden);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  button.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" })
  );
}

function initYear() {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

onReady(() => {
  initMobileMenu();
  initActiveNav();
  initScrollHeader();
  initReveal();
  initCounters();
  initTestimonials();
  initPortfolioFilter();
  initContactForm();
  initEstimatorPrefill();
  initBackToTop();
  initYear();
});
