(function () {
  'use strict';

  var DEFAULTS = {
    delay: 4000,
    speed: 600,
    desktop: 3,
    mobile: 1,
    space: 15
  };
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
      console.error('Swiper Slider: Swiper.js is unavailable. Check that swiper-bundle.min.js loaded before swiper-slider.js.');
      return;
    }

    if (el.swiper) return;

    var data = el.dataset || {};
    var slides = el.querySelectorAll('.swiper-slide').length;
    if (!slides) return;

    var effect = data.effect === 'fade' ? 'fade' : 'slide';
    var desktop = effect === 'fade' ? 1 : numberValue(data.desktop, DEFAULTS.desktop, 1, 10);
    var tablet = effect === 'fade' ? 1 : numberValue(data.tablet, desktop, 1, 10);
    var mobile = effect === 'fade' ? 1 : numberValue(data.mobile, DEFAULTS.mobile, 1, 10);
    var maxPerView = Math.max(desktop, tablet, mobile);
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var paginationType = ['bullets', 'fraction', 'progressbar'].indexOf(data.pagination) >= 0
      ? data.pagination
      : 'none';

    // Center zoom only works with the sliding effect (fade shows 1 slide at a time)
    var zoomRequested = boolValue(data.centerZoom, false) && effect === 'slide';
    if (zoomRequested && slides < maxPerView + 2) {
      console.warn('Swiper Slider: center zoom works best with at least ' + (maxPerView + 2) + ' slides (currently ' + slides + ').');
    }

    var options = {
      loop: boolValue(data.loop, true) && slides > maxPerView,
      centeredSlides: zoomRequested,
      speed: numberValue(data.speed, DEFAULTS.speed, 0, 10000),
      effect: effect,
      fadeEffect: { crossFade: true },
      slidesPerView: mobile,
      spaceBetween: numberValue(data.space, DEFAULTS.space, 0, 200),
      breakpoints: {
        750: { slidesPerView: tablet },
        990: { slidesPerView: desktop }
      },
      grabCursor: true,
      keyboard: { enabled: true },
      autoplay: (boolValue(data.autoplay, false) && !reduceMotion)
        ? {
            delay: numberValue(data.delay, DEFAULTS.delay, 500, 60000),
            disableOnInteraction: false,
            pauseOnMouseEnter: boolValue(data.pauseHover, true)
          }
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

    // Zoom only when the current screen shows 2+ slides.
    // With 1 slide per view (usually mobile) there are no "sides", so it stays off.
    function syncZoom(swiper) {
      var active = zoomRequested && Number(swiper.params.slidesPerView) > 1;
      swiper.el.classList.toggle('is-zoom-active', active);
    }

    options.on = { breakpoint: syncZoom, resize: syncZoom };

    var instance = new window.Swiper(el, options);
    syncZoom(instance);
  }

  function initWithin(root) {
    if (!root) return;
    if (root.matches && root.matches('.swiper-slider')) initSlider(root);
    if (root.querySelectorAll) root.querySelectorAll('.swiper-slider').forEach(initSlider);
  }

  function destroyWithin(root) {
    if (!root) return;
    var sliders = [];
    if (root.matches && root.matches('.swiper-slider')) sliders.push(root);
    if (root.querySelectorAll) sliders = sliders.concat(Array.prototype.slice.call(root.querySelectorAll('.swiper-slider')));
    sliders.forEach(function (el) {
      if (el.swiper) el.swiper.destroy(true, true);
    });
  }

  // Expose an initializer for theme code that inserts slider markup outside Shopify's editor events.
  window.initSwiperSliders = initWithin;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initWithin(document); }, { once: true });
  } else {
    initWithin(document);
  }

  document.addEventListener('shopify:section:load', function (event) {
    initWithin(event.target);
  });

  document.addEventListener('shopify:section:unload', function (event) {
    destroyWithin(event.target);
  });
})();
