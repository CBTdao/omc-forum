/* DCF i18n engine — default en, only explicit choice persists (same policy as omc.network / AITop) */
window.I18N = window.I18N || {};
(function () {
  var LS_KEY = "dcforum_lang";
  var DEFAULT = "en";

  function current() {
    var v = null;
    try { v = localStorage.getItem(LS_KEY); } catch (e) {}
    return v && window.I18N[v] ? v : DEFAULT;
  }

  function t(key) {
    var lang = current();
    var d = window.I18N[lang] || {};
    var fb = window.I18N[DEFAULT] || {};
    return d[key] !== undefined ? d[key] : (fb[key] !== undefined ? fb[key] : key);
  }

  function apply() {
    var lang = current();
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (window.I18N[lang] && window.I18N[lang][k] !== undefined) el.textContent = window.I18N[lang][k];
      else if (window.I18N[DEFAULT][k] !== undefined) el.textContent = window.I18N[DEFAULT][k];
    });
    document.documentElement.lang = lang;
    var sel = document.getElementById("langSelect");
    if (sel) sel.value = lang;
  }

  function set(lang, persist) {
    if (!window.I18N[lang]) return;
    if (persist) { try { localStorage.setItem(LS_KEY, lang); } catch (e) {} }
    apply();
    document.dispatchEvent(new CustomEvent("i18n:changed"));
  }

  window.i18nT = t;
  window.i18nSet = set;
  window.i18nLang = current;

  document.addEventListener("DOMContentLoaded", function () {
    var sel = document.getElementById("langSelect");
    if (sel) sel.addEventListener("change", function () { set(sel.value, true); });
    apply();
    document.dispatchEvent(new CustomEvent("i18n:changed"));
  });
})();
