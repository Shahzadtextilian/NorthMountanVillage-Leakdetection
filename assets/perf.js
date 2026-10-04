/**
 * Lightweight performance helper for deferred iframe loading & smooth visual rendering.
 * Executed with 'defer' attribute to eliminate main-thread blocking.
 */
(function() {
  function initPerf() {
    if ('IntersectionObserver' in window) {
      var lazyIframes = document.querySelectorAll('iframe[data-src]');
      if (lazyIframes.length > 0) {
        var observer = new IntersectionObserver(function(entries, obs) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              var iframe = entry.target;
              if (iframe.dataset.src) {
                iframe.src = iframe.dataset.src;
                iframe.removeAttribute('data-src');
              }
              obs.unobserve(iframe);
            }
          });
        }, { rootMargin: '300px 0px' });

        lazyIframes.forEach(function(iframe) {
          observer.observe(iframe);
        });
      }
    } else {
      var fallbackIframes = document.querySelectorAll('iframe[data-src]');
      for (var i = 0; i < fallbackIframes.length; i++) {
        fallbackIframes[i].src = fallbackIframes[i].getAttribute('data-src');
        fallbackIframes[i].removeAttribute('data-src');
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPerf);
  } else {
    initPerf();
  }
})();
