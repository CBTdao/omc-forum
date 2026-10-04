/* DCF — Decentralized Compute Tracker: workload filter.
   Progressive enhancement only: the full table is in the HTML and works with
   JavaScript disabled. This just shows/hides rows by their data-focus tag. */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var bar = document.getElementById("filterBar");
    var body = document.getElementById("trackerBody");
    if (!bar || !body) return;

    var rows = Array.prototype.slice.call(body.querySelectorAll("tr"));
    var btns = Array.prototype.slice.call(bar.querySelectorAll(".filter-btn"));

    function apply(filter) {
      rows.forEach(function (tr) {
        var focus = (tr.getAttribute("data-focus") || "").split(/\s+/);
        var show = filter === "all" || focus.indexOf(filter) !== -1;
        tr.classList.toggle("is-hidden", !show);
      });
      btns.forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-filter") === filter);
      });
    }

    bar.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest(".filter-btn") : null;
      if (!btn || !bar.contains(btn)) return;
      apply(btn.getAttribute("data-filter"));
    });
  });
})();
