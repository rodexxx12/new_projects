(function () {
  'use strict';

  var DEFAULTS = {
    delay: 4000,
    speed: 600,
    desktop: 3,
    mobile: 1,
    space: 15
  };
  var waiting = new WeakSet();

  function numberValue(value, fallback, min, max) {
    var number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
  }

  function boolValue(value, fallback) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return fallback;
  }

  function initSlider(el) {
    if (!el) return;
    if (!window.Swiper) {
      if (!waiting.has(el)) {
        waiting.add(el);
        var attempts = 0;
        var timer = window.setInterval(function () {
          attempts += 1;
          if (window.Swiper) {
            window.clearInterval(timer);
            waiting.delete(el);
            initSlider(el);
          } else if (attempts >= 100) {
            window.clearInterval(timer);
            waiting.delete(el);
            console.error('Swiper Slider: Swiper.js did not load. Check the Swiper CDN request in Network.');
          }
        }, 100);
      }
      return;
    }

    if (el.swiper) el.swiper.destroy(true, true);

    var data = el.dataset || {};
    var slides = el.querySelectorAll('.swiper-slide').length;
    if (!slides) return;

    var effect = data.effect === 'fade' ? 'fade' : 'slide';
    var desktop = effect === 'fade' ? 1 : numberValue(data.desktop, DEFAULTS.desktop, 1, 10);
    var mobile = effect === 'fade' ? 1 : numberValue(data.mobile, DEFAULTS.mobile, 1, 10);
    var paginationType = ['bullets', 'fraction', 'progressbar'].indexOf(data.pagination) >= 0
      ? data.pagination
      : 'none';

    var options = {
      loop: boolValue(data.loop, true) && slides > 1,
      speed: numberValue(data.speed, DEFAULTS.speed, 0, 10000),
      effect: effect,
      fadeEffect: { crossFade: true },
      slidesPerView: mobile,
      spaceBetween: numberValue(data.space, DEFAULTS.space, 0, 200),
      breakpoints: { 768: { slidesPerView: desktop } },
      autoplay: boolValue(data.autoplay, false)
        ? { delay: numberValue(data.delay, DEFAULTS.delay, 500, 60000), disableOnInteraction: false }
        : false
    };

    if (boolValue(data.arrows, false)) {
      var next = el.querySelector('.swiper-button-next');
      var previous = el.querySelector('.swiper-button-prev');
      if (next && previous) options.navigation = { nextEl: next, prevEl: previous };
    }

    if (paginationType !== 'none') {
      var pagination = el.querySelector('.swiper-pagination');
      if (pagination) {
        options.pagination = { el: pagination, type: paginationType, clickable: paginationType === 'bullets' };
      }
    }

    new window.Swiper(el, options);
  }

  function initWithin(root) {
    if (!root) return;
    if (root.matches && root.matches('.swiper-slider')) initSlider(root);
    if (root.querySelectorAll) root.querySelectorAll('.swiper-slider').forEach(initSlider);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initWithin(document); }, { once: true });
  } else {
    initWithin(document);
  }

  document.addEventListener('shopify:section:load', function (event) {
    initWithin(event.target);
  });
})();
