(function () {
  'use strict';

  var easeOut = function (t) { return 1 - Math.pow(1 - t, 2); };

  function animateValue(el, end, ms, suffix, prefix) {
    suffix = suffix || '';
    prefix = prefix || '';
    var start = 0;
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / ms, 1);
      var value = Math.floor(easeOut(progress) * end);
      el.textContent = prefix + value + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = prefix + end + suffix;
    }
    requestAnimationFrame(step);
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#') return;
      e.preventDefault();
      var el = document.querySelector(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Benefit counters
  document.querySelectorAll('.benefit-num[data-count]').forEach(function (el) {
    var count = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.classList.contains('benefit-num-x') ? '' : (el.getAttribute('data-suffix') || '');
    var prefix = el.classList.contains('benefit-num-x') ? '×' : '';
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !el.dataset.animated) {
            el.dataset.animated = '1';
            animateValue(el, count, 1400, suffix, prefix);
          }
        });
      },
      { threshold: 0.3 }
    );
    obs.observe(el.closest('.benefit-card'));
  });

  // Case chart lines: animate stroke on scroll into view
  document.querySelectorAll('.case-chart-line').forEach(function (path) {
    var chart = path.closest('.case-chart');
    if (!chart) return;
    var length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) chart.classList.add('animated');
        });
      },
      { threshold: 0.2 }
    );
    obs.observe(chart.closest('.case-card'));
  });

  // Parallax: hero character and bg on scroll
  var hero = document.querySelector('.hero');
  var heroCharacter = document.querySelector('.hero-character');
  var heroWrap = document.querySelector('.hero-parallax-wrap');
  var heroGlows = document.querySelectorAll('.hero-glow');

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onScrollParallax() {
    if (prefersReducedMotion || !heroWrap) return;
    if (!hero) return;
    var rect = hero.getBoundingClientRect();
    var center = rect.top + rect.height / 2;
    var viewportCenter = window.innerHeight / 2;
    var offset = (viewportCenter - center) * 0.08;
    heroWrap.style.transform = 'translateY(' + Math.round(offset) + 'px)';
    if (heroGlows.length) {
      var glowOffset = (viewportCenter - center) * 0.05;
      heroGlows.forEach(function (g) {
        g.style.transform = 'translateY(' + Math.round(glowOffset) + 'px)';
      });
    }
  }

  if (!prefersReducedMotion) {
    window.addEventListener('scroll', function () { requestAnimationFrame(onScrollParallax); }, { passive: true });
    onScrollParallax();
  }

  // Scroll reveal with stagger
  var revealEls = document.querySelectorAll('.section-head, .card, .benefit-card, .flow-step, .case-card, .why-item, .price-card, .faq-item, .pain-chart, .pain-content, .benefits-character, .pain-character');
  var revealObs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
  );
  revealEls.forEach(function (el) {
    el.classList.add('reveal');
    revealObs.observe(el);
  });

  // Pain section chart bars in-view
  var painSection = document.querySelector('.pain');
  if (painSection) {
    var painObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) painSection.classList.add('in-view');
        });
      },
      { threshold: 0.25 }
    );
    painObs.observe(painSection);
  }

  // Mobile menu
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      nav.classList.toggle('nav-open');
      burger.classList.toggle('burger-open');
      document.body.classList.toggle('menu-open');
    });
  }
})();
