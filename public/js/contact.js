/* =========================================================
   BASIC SYSTEMS — contact form
   Validates input and, if an endpoint is configured in
   js/config.js, sends the inquiry as JSON. If no endpoint is
   configured, nothing is sent and the visitor is told so.
   ========================================================= */
(function () {
  'use strict';

  var form = document.getElementById('contact-form');
  if (!form) return;

  var settings = (window.BASIC_SYSTEMS_CONFIG && window.BASIC_SYSTEMS_CONFIG.contactForm) || {};
  var statusBox = form.querySelector('.form-status');
  var submitBtn = form.querySelector('button[type="submit"]');
  var submitLabel = submitBtn.querySelector('.btn-label');
  var serviceSelect = form.elements.service;

  var messages = {
    name: { valueMissing: 'Please enter your full name.' },
    email: {
      valueMissing: 'Please enter your email address.',
      typeMismatch: 'Please enter a valid email address, e.g. name@company.com.'
    },
    phone: { patternMismatch: 'Please enter a valid phone number (digits, spaces, +, -, parentheses).' },
    service: { valueMissing: 'Please choose the service you are interested in.' },
    message: {
      valueMissing: 'Please tell us a little about what you need.',
      tooShort: 'Please add a bit more detail (at least 10 characters).'
    }
  };

  /* ---------- Validation ---------- */
  function errorFor(field) {
    var v = field.validity;
    var m = messages[field.name] || {};
    if (v.valid) return '';
    if (v.valueMissing) return m.valueMissing || 'This field is required.';
    if (v.typeMismatch) return m.typeMismatch || 'Please check this value.';
    if (v.patternMismatch) return m.patternMismatch || 'Please check this value.';
    if (v.tooShort) return m.tooShort || 'This value is too short.';
    if (v.tooLong) return 'This value is too long.';
    return 'Please check this value.';
  }

  function showError(field) {
    var msg = errorFor(field);
    var box = document.getElementById(field.id + '-error');
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (box) {
      box.textContent = msg;
      if (msg) field.setAttribute('aria-describedby', box.id);
      else field.removeAttribute('aria-describedby');
    }
    return !msg;
  }

  var fields = Array.prototype.filter.call(form.elements, function (el) {
    return /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && el.name !== 'website';
  });

  fields.forEach(function (field) {
    // Validate on leave; re-validate live once a field has been flagged.
    field.addEventListener('blur', function () { if (field.value) showError(field); });
    field.addEventListener('input', function () {
      if (field.getAttribute('aria-invalid') === 'true') showError(field);
    });
    field.addEventListener('change', function () {
      if (field.getAttribute('aria-invalid') === 'true') showError(field);
    });
  });

  /* ---------- Pre-select service from "Ask about …" links ---------- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-service]');
    if (!link) return;
    var wanted = link.getAttribute('data-service');
    Array.prototype.some.call(serviceSelect.options, function (opt) {
      if (opt.value === wanted) { serviceSelect.value = wanted; showError(serviceSelect); return true; }
      return false;
    });
  });

  /* ---------- Status message ---------- */
  function setStatus(type, title, text) {
    statusBox.className = 'form-status is-' + type;
    statusBox.innerHTML = '';
    var strong = document.createElement('strong');
    strong.textContent = title;
    statusBox.appendChild(strong);
    statusBox.appendChild(document.createTextNode(text));
    statusBox.hidden = false;
  }

  function setBusy(busy) {
    submitBtn.disabled = busy;
    submitLabel.textContent = busy ? 'Sending…' : 'Send Inquiry';
  }

  /* ---------- Data ---------- */
  function collect() {
    var data = {
      name: form.elements.name.value.trim(),
      company: form.elements.company.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      service: serviceSelect.value,
      message: form.elements.message.value.trim(),
      subject: settings.subject || 'New website inquiry'
    };
    var extra = settings.extraFields || {};
    Object.keys(extra).forEach(function (k) { data[k] = extra[k]; });
    return data;
  }

  /**
   * Sends the inquiry to the configured endpoint.
   * Replace this function if your provider needs a different format.
   */
  function send(data) {
    var controller = 'AbortController' in window ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 15000) : null;
    return fetch(settings.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data),
      signal: controller ? controller.signal : undefined
    }).then(function (res) {
      if (timer) clearTimeout(timer);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res;
    }, function (err) {
      if (timer) clearTimeout(timer);
      throw err;
    });
  }

  /* ---------- Submit ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    statusBox.hidden = true;

    var firstInvalid = null;
    fields.forEach(function (field) {
      if (!showError(field) && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Honeypot filled → silently ignore (likely a bot).
    if (form.elements.website.value) return;

    if (!settings.endpoint) {
      setStatus('info', 'Online sending is not active yet.',
        ' Your inquiry has NOT been sent. The website\'s contact form has not been connected to an email service yet — please reach BASIC SYSTEMS through another channel for now.');
      return;
    }

    setBusy(true);
    send(collect()).then(function () {
      form.reset();
      fields.forEach(function (f) { f.removeAttribute('aria-invalid'); });
      setStatus('success', 'Thank you — your inquiry has been sent.',
        ' We\'ll review your message and get back to you.');
    }).catch(function () {
      setStatus('error', 'Your inquiry could not be sent.',
        ' Please check your connection and try again in a moment.');
    }).then(function () {
      setBusy(false);
    });
  });
})();
