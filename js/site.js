// Shared behaviour for every page: reveal on scroll, footer clock, back-to-top, still mode for motion-sensitive visitors.
(function () {
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var reveals = document.querySelectorAll('.rv');
  function show(el) { el.classList.add('in'); }
  if (still || !('IntersectionObserver' in window)) {
    reveals.forEach(show);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { show(entry.target); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  if (still) {
    document.querySelectorAll('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });
  }

  var time = document.getElementById('clockTime');
  var date = document.getElementById('clockDate');
  if (time && date) {
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var tick = function () {
      var d = new Date();
      time.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
      date.textContent = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(',', '');
    };
    tick();
    setInterval(tick, 1000);
  }

  var toTop = document.getElementById('toTop');
  if (toTop) {
    var onScroll = function () { toTop.classList.toggle('show', scrollY > 400); };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    toTop.addEventListener('click', function () { scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' }); });
  }
})();
