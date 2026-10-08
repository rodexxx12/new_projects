(function () {
  function initSwiperSlider(el) {
    if (!el || !window.Swiper) return;
    if (el.swiper) el.swiper.destroy(true, true);

    var d = el.dataset;
    var isFade = d.effect === 'fade';
    var desktop = isFade ? 1 : parseInt(d.desktop, 10);
    var mobile = isFade ? 1 : parseInt(d.mobile, 10);

    var options = {
      loop: d.loop === 'true',
      speed: parseInt(d.speed, 10),
      effect: d.effect,
      fadeEffect: { crossFade: true },
      slidesPerView: mobile,
      spaceBetween: parseInt(d.space, 10),
      breakpoints: {
        768: { slidesPerView: desktop }
      },
      autoplay:
        d.autoplay === 'true'
          ? { delay: parseInt(d.delay, 10), disableOnInteraction: false }
          : false
    };

    if (d.arrows === 'true') {
      options.navigation = {
        nextEl: el.querySelector('.swiper-button-next'),
        prevEl: el.querySelector('.swiper-button-prev')
      };
    }

    if (d.pagination !== 'none') {
      options.pagination = {
        el: el.querySelector('.swiper-pagination'),
        type: d.pagination,
        clickable: true
      };
    }

    new Swiper(el, options);
  }

  function initAll() {
    document.querySelectorAll('.swiper-slider').forEach(initSwiperSlider);
  }

  // Initial page load (Swiper library is loaded with defer)
  if (document.readyState === 'complete') {
    initAll();
  } else {
    window.addEventListener('load', initAll);
  }

  // Theme Editor: re-init when a section is added or edited
  document.addEventListener('shopify:section:load', function (e) {
    var el = e.target.querySelector('.swiper-slider');
    if (el) initSwiperSlider(el);
  });
})();