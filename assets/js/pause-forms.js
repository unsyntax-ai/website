// Forms are paused: block submission and show how to reach us directly.
// To turn the forms back on, remove the script tag for this file from the pages.
(function () {
  var EMAIL = 'hello@unsyntax.ai';
  var PHONE = ''; // e.g. '+1 555 123 4567'

  function note() {
    var p = document.createElement('p');
    p.setAttribute('data-paused-note', '');
    p.style.cssText = 'margin:16px 0 0;font-size:14px;line-height:1.5;text-align:center;opacity:.85';
    var html = 'Online forms are paused for now. Please reach out directly: email <a href="mailto:' + EMAIL + '" style="color:#3b82f6;text-decoration:underline">' + EMAIL + '</a>';
    if (PHONE) html += ' or call <a href="tel:' + PHONE.replace(/[^+\d]/g, '') + '" style="color:#3b82f6;text-decoration:underline">' + PHONE + '</a>';
    p.innerHTML = html + '.';
    return p;
  }

  // Re-applied on every page change: the page's own scripts can redraw a form and drop our changes.
  function pause(form) {
    form.querySelectorAll('button:not([type=button])').forEach(function (b) {
      if (b.disabled) return;
      b.disabled = true;
      b.style.opacity = '.5';
      b.style.cursor = 'not-allowed';
    });
    var next = form.nextElementSibling;
    if (!next || !next.hasAttribute('data-paused-note')) form.insertAdjacentElement('afterend', note());
  }

  // Capture phase: stops the page's own submit handler (Enter key included).
  document.addEventListener('submit', function (e) { e.preventDefault(); e.stopImmediatePropagation(); }, true);

  function scan() { document.querySelectorAll('form').forEach(pause); }
  document.addEventListener('DOMContentLoaded', scan);
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
