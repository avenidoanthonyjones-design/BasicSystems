/* =========================================================
   BASIC SYSTEMS — site behaviour
   Mobile navigation, active-section highlighting,
   header shadow, reveal-on-scroll, public contact details.
   ========================================================= */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  var mobileQuery = window.matchMedia('(max-width: 960px)');

  /* ---------- Mobile navigation ---------- */
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Open menu';
    nav.classList.toggle('is-open', open);
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !header.contains(e.target)) setMenu(false);
    });

    var onBreakpoint = function (e) { if (!e.matches) setMenu(false); };
    if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', onBreakpoint);
    else mobileQuery.addListener(onBreakpoint); // Safari < 14
  }

  /* ---------- Header shadow on scroll ---------- */
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Active navigation item ---------- */
  var navLinks = document.querySelectorAll('[data-nav-link]');
  var sections = document.querySelectorAll('main section[data-nav]');

  function setActive(key) {
    navLinks.forEach(function (link) {
      var active = link.getAttribute('data-nav-link') === key;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var visible = new Map();
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.set(entry.target, entry.intersectionRect.height);
        else visible.delete(entry.target);
      });
      // When the page is scrolled to the bottom, the last section wins.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        setActive(sections[sections.length - 1].getAttribute('data-nav'));
        return;
      }
      var best = null, bestH = 0;
      visible.forEach(function (h, el) { if (h > bestH) { bestH = h; best = el; } });
      if (best) setActive(best.getAttribute('data-nav'));
    }, { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] });
    sections.forEach(function (s) { spy.observe(s); });
  } else {
    setActive('home');
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // Small stagger for siblings in the same grid
        var siblings = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('reveal'); });
        var index = siblings.indexOf(el);
        el.style.transitionDelay = Math.min(index, 5) * 60 + 'ms';
        el.classList.add('is-visible');
        revealer.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revealer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Public contact details (from js/config.js) ---------- */
  var cfg = (window.BASIC_SYSTEMS_CONFIG && window.BASIC_SYSTEMS_CONFIG.siteContact) || {};

  function item(iconId, text, href) {
    var li = document.createElement('li');
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    var use = document.createElementNS(svgNS, 'use');
    use.setAttribute('href', '#' + iconId);
    svg.appendChild(use);
    var label = document.createElement(href ? 'a' : 'span');
    if (href) label.href = href;
    label.textContent = text;
    li.appendChild(svg);
    li.appendChild(label);
    return li;
  }

  var details = [];
  if (cfg.email) details.push(['i-mail', cfg.email, 'mailto:' + cfg.email]);
  if (cfg.phone) details.push(['i-phone', cfg.phone, 'tel:' + cfg.phone.replace(/[^\d+]/g, '')]);
  if (cfg.address) details.push(['i-pin', cfg.address, null]);

  if (details.length) {
    document.querySelectorAll('[data-contact-details]').forEach(function (list) {
      details.forEach(function (d) { list.appendChild(item(d[0], d[1], d[2])); });
      list.hidden = false;
    });
  }
})();
