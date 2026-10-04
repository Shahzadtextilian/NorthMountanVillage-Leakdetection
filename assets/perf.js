/**
 * High-performance on-demand Map loader and asset optimizer.
 * Executed with 'defer' attribute to eliminate main-thread blocking.
 */
window.loadInteractiveMap = function(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var iframe = document.createElement('iframe');
  iframe.src = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2168.259567651518!2d-112.12345799100474!3d33.584565142173!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872b6c15368c8683%3A0xa42a4714d96a5298!2s2810%20W%20Sahuaro%20Dr%2C%20Phoenix%2C%20AZ%2085029%2C%20USA!5e1!3m2!1sen!2sua!4v1790956994805!5m2!1sen!2sua';
  iframe.width = '100%';
  iframe.height = '100%';
  iframe.style.border = '0';
  iframe.style.position = 'absolute';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.allowFullscreen = true;
  iframe.loading = 'lazy';
  iframe.title = 'Google Maps location of Leak Detection Pro at 2810 W Sahuaro Dr, Phoenix, AZ 85029';
  iframe.referrerPolicy = 'no-referrer-when-downgrade';

  container.innerHTML = '';
  container.className = 'map-container';
  container.appendChild(iframe);
};
