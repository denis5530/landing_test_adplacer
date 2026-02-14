(function () {
  'use strict';

  var duration = 400;
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 2); };

  function animateValue(el, end, ms) {
    var start = 0;
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / ms, 1);
      el.textContent = Math.floor(easeOut(progress) * end);
      if (progress < 1) requestAnimationFrame(step);
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

  // Hero mockup counter
  var mockupStat = document.querySelector('.mockup-stat-value[data-target]');
  if (mockupStat) {
    var target = parseInt(mockupStat.getAttribute('data-target'), 10);
    var heroObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !mockupStat.dataset.animated) {
            mockupStat.dataset.animated = '1';
            animateValue(mockupStat, target, 1800);
          }
        });
      },
      { threshold: 0.3 }
    );
    heroObs.observe(mockupStat.closest('.hero'));
  }

  // Scroll reveal
  var revealEls = document.querySelectorAll('.section-head, .card, .benefit-card, .flow-step, .case-card, .why-item, .price-card, .faq-item, .pain-chart, .pain-content');
  var revealObs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach(function (el) {
    el.classList.add('reveal');
    revealObs.observe(el);
  });

  // Pain section chart in-view
  var painSection = document.querySelector('.pain');
  if (painSection) {
    var painObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) painSection.classList.add('in-view');
        });
      },
      { threshold: 0.3 }
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
