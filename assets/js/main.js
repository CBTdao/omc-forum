/* DCF page chrome: reading progress + comments slot + year */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    /* reading progress (article pages) */
    var bar = document.getElementById("progress");
    if (bar) {
      var update = function () {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
      };
      window.addEventListener("scroll", update, { passive: true });
      update();
    }

    /* comments: giscus if configured, graceful fallback otherwise */
    var slot = document.getElementById("giscus-slot");
    if (slot) {
      var cfg = window.DCF_GISCUS;
      if (cfg && cfg.repo && cfg.repoId) {
        var s = document.createElement("script");
        s.src = "https://giscus.app/client.js";
        s.setAttribute("data-repo", cfg.repo);
        s.setAttribute("data-repo-id", cfg.repoId);
        s.setAttribute("data-category", cfg.category || "Comments");
        s.setAttribute("data-category-id", cfg.categoryId || "");
        s.setAttribute("data-mapping", "pathname");
        s.setAttribute("data-strict", "0");
        s.setAttribute("data-reactions-enabled", "1");
        s.setAttribute("data-emit-metadata", "0");
        s.setAttribute("data-theme", "light");
        s.setAttribute("data-lang", window.i18nLang() === "zh" ? "zh-CN" : "en");
        s.setAttribute("crossorigin", "anonymous");
        s.async = true;
        slot.innerHTML = "";
        slot.appendChild(s);
      } else {
        var fb = document.createElement("div");
        fb.className = "comments-fallback";
        fb.setAttribute("data-i18n", "comments.soon");
        fb.textContent = window.i18nT ? window.i18nT("comments.soon") : "";
        slot.appendChild(fb);
        if (window.i18nT) window.i18nSet(window.i18nLang(), false);
      }
    }

    var y = document.getElementById("yearNow");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
