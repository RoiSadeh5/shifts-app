/**
 * Animations & micro-interactions for שכ״ש
 */
function countUp(el, targetNum, opts) {
  if (!el || typeof targetNum !== 'number') return;
  opts = opts || {};
  var duration = opts.duration || 600;
  var easing = opts.easing || function(t) { return t * (2 - t); };
  var formatter = opts.formatter || (function(n) { return '₪' + Math.round(n).toLocaleString(); });
  var from = parseFloat(el.dataset.countUpFrom) || 0;
  if (el.dataset.countUpFrom === undefined) from = 0;
  el.dataset.countUpFrom = String(targetNum);
  var start = performance.now();
  function step(now) {
    var elapsed = now - start;
    var progress = Math.min(elapsed / duration, 1);
    var eased = easing(progress);
    var current = from + (targetNum - from) * eased;
    el.textContent = formatter(current);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function staggerEntrance(container, itemSelector, opts) {
  if (!container) return;
  opts = opts || {};
  var items = container.querySelectorAll(itemSelector || '.shift-item');
  var delayStep = opts.delayStep || 50;
  var baseDelay = opts.baseDelay || 0;
  items.forEach(function(item, i) {
    item.style.animationDelay = (baseDelay + i * delayStep) + 'ms';
    item.style.animationFillMode = 'backwards';
    if (!item.classList.contains('stagger-in')) item.classList.add('stagger-in');
  });
}

function transitionPage(outPage, inPage, onComplete) {
  if (!outPage || !inPage) {
    if (onComplete) onComplete();
    return;
  }
  outPage.classList.add('page-out');
  inPage.classList.add('page-in');
  inPage.style.display = 'block';
  setTimeout(function() {
    outPage.classList.remove('active', 'page-out');
    inPage.classList.add('active');
    inPage.classList.remove('page-in');
    outPage.style.display = '';
    if (onComplete) onComplete();
  }, 150);
}
