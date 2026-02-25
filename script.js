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
      if (!el) return;

      // учитываем высоту фиксированного хедера, чтобы секция встала ровно под ним
      var header = document.querySelector('.header');
      var headerOffset = header ? header.offsetHeight : 0;
      var rect = el.getBoundingClientRect();
      var targetTop = rect.top + window.pageYOffset - headerOffset;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
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

  // Cases slider: по одному слайду, без повтора — только 4 карточки (3 кейса + CTA), в конце листать нельзя
  var casesSlider = document.getElementById('cases-slider');
  var casesTrack = casesSlider && casesSlider.querySelector('.cases-track');
  var casesPrev = document.querySelector('.cases-slider-prev');
  var casesNext = document.querySelector('.cases-slider-next');
  if (casesSlider && casesTrack && casesPrev && casesNext) {
    var gap = 32; // var(--space-4)
    var allCards = casesTrack.querySelectorAll('.case-card');
    var count = allCards.length; // 4: 3 кейса + CTA

    function getCardWidth(i) {
      return allCards[i] ? allCards[i].offsetWidth : 320;
    }

    function getStep() {
      return getCardWidth(0) + gap;
    }

    function getScrollPosForIndex(index) {
      var pos = 0;
      for (var i = 0; i < index; i++) pos += getCardWidth(i) + gap;
      return pos;
    }

    function getMaxScrollLeft() {
      return getScrollPosForIndex(count - 1);
    }

    function updateCasesButtons() {
      var left = Math.round(casesSlider.scrollLeft);
      var lastCardPos = getMaxScrollLeft();
      var maxScroll = casesSlider.scrollWidth - casesSlider.clientWidth;
      var atStart = left <= 5;
      var atEnd = left >= lastCardPos - 5 || left >= maxScroll - 5;
      casesPrev.disabled = atStart;
      casesNext.disabled = atEnd;
    }

    casesSlider.addEventListener('scrollend', updateCasesButtons);
    casesSlider.addEventListener('scroll', function () {
      clearTimeout(casesSlider._btnT);
      casesSlider._btnT = setTimeout(updateCasesButtons, 100);
    });
    setTimeout(updateCasesButtons, 100);

    var casesCharacterWrap = document.getElementById('cases-character-wrap');
    var casesFlipShowMs = 320;
    var casesTransitionMs = 350;
    var casesBlockMs = casesFlipShowMs + casesTransitionMs;
    var isCasesFlipping = false;

    function triggerCasesFlip() {
      if (!casesCharacterWrap || isCasesFlipping) return;
      isCasesFlipping = true;
      casesCharacterWrap.classList.remove('is-flipping-next');
      casesCharacterWrap.classList.add('is-flipping');
      setTimeout(function () {
        casesCharacterWrap.classList.remove('is-flipping');
      }, casesFlipShowMs);
      setTimeout(function () {
        isCasesFlipping = false;
      }, casesBlockMs);
    }

    function triggerCasesFlipNext() {
      if (!casesCharacterWrap || isCasesFlipping) return;
      isCasesFlipping = true;
      casesCharacterWrap.classList.remove('is-flipping');
      casesCharacterWrap.classList.add('is-flipping-next');
      setTimeout(function () {
        casesCharacterWrap.classList.remove('is-flipping-next');
      }, casesFlipShowMs);
      setTimeout(function () {
        isCasesFlipping = false;
      }, casesBlockMs);
    }

    casesPrev.addEventListener('click', function () {
      if (isCasesFlipping || casesPrev.disabled) return;
      var step = getStep();
      var left = casesSlider.scrollLeft;
      var target = Math.max(0, left - step);
      casesSlider.scrollTo({ left: target, behavior: 'smooth' });
      triggerCasesFlip();
    });

    casesNext.addEventListener('click', function () {
      if (casesNext.disabled || isCasesFlipping) return;
      var step = getStep();
      var left = casesSlider.scrollLeft;
      var maxLeft = getMaxScrollLeft();
      var target = Math.min(left + step, maxLeft);
      casesSlider.scrollTo({ left: target, behavior: 'smooth' });
      triggerCasesFlipNext();
      if (target >= maxLeft - 5) {
        setTimeout(updateCasesButtons, 450);
      }
    });
  }

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

  // Final section: subtle parallax on atmo layer
  var finalSection = document.querySelector('.final-section');
  var finalAtmo = document.querySelector('.final-atmo');
  if (!prefersReducedMotion && finalSection && finalAtmo) {
    window.addEventListener('scroll', function () {
      requestAnimationFrame(function () {
        var rect = finalSection.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        var viewportCenter = window.innerHeight / 2;
        var offset = (viewportCenter - center) * 0.03;
        finalAtmo.style.transform = 'translateY(' + Math.round(offset) + 'px)';
      });
    }, { passive: true });
  }

  // Scroll reveal with stagger
  var revealEls = document.querySelectorAll('.section-head, .card, .benefit-card, .flow-step, .case-card, .why-item, .price-card, .faq-item, .pain-content, .benefits-character, .pain-character, .final-section .reveal');
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

  // Final CTA: ripple effect on click
  var finalCta = document.querySelector('.js-final-cta');
  if (finalCta) {
    finalCta.addEventListener('click', function (e) {
      var rect = this.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var ripple = document.createElement('span');
      ripple.className = 'final-cta-ripple';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      this.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 600);
    });
  }

  // FAQ accordion: только один открыт, плавный max-height
  var faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length) {
    var currentOpen = null;

    faqItems.forEach(function (item) {
      var btn = item.querySelector('.faq-question');
      var answer = item.querySelector('.faq-answer');
      var answerInner = item.querySelector('.faq-answer-inner');
      if (!btn || !answer || !answerInner) return;

      // ensure all collapsed on init
      answer.style.maxHeight = '0px';

      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');

        // закрываем ранее открытый
        if (currentOpen && currentOpen !== item) {
          var openAnswer = currentOpen.querySelector('.faq-answer');
          if (openAnswer) openAnswer.style.maxHeight = '0px';
          currentOpen.classList.remove('is-open');
        }

        if (isOpen) {
          // закрываем текущий
          answer.style.maxHeight = '0px';
          item.classList.remove('is-open');
          currentOpen = null;
        } else {
          // открываем текущий
          var h = answerInner.offsetHeight;
          answer.style.maxHeight = h + 'px';
          item.classList.add('is-open');
          currentOpen = item;
        }
      });
    });

    // Пересчёт высоты для открытого при ресайзе
    window.addEventListener('resize', function () {
      if (!currentOpen) return;
      var ans = currentOpen.querySelector('.faq-answer');
      var inner = currentOpen.querySelector('.faq-answer-inner');
      if (!ans || !inner) return;
      ans.style.maxHeight = inner.offsetHeight + 'px';
    });
  }

  // Экосистема: при уходе курсора с кнопки перезапуск блика и биения с нуля (синхронность не сбивается)
  var ecosystemBlock = document.querySelector('.why-ecosystem');
  var ecosystemCta = document.querySelector('.why-ecosystem-cta');
  if (ecosystemBlock && ecosystemCta) {
    ecosystemCta.addEventListener('mouseleave', function () {
      ecosystemBlock.classList.add('why-ecosystem-anim-off');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          ecosystemBlock.classList.remove('why-ecosystem-anim-off');
        });
      });
    });
  }
})();
