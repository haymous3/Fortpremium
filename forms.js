/* =========================================================
   Fortpremium International — short forms (volunteer + contact)

   Any <form data-fs="volunteers|general"> is posted to FormSubmit's
   AJAX endpoint and reports its result inline, with no page navigation.
   (The application form at #/apply cannot use this path — it carries a
   file attachment, which FormSubmit only accepts on a full page POST.)

   Recipients come from SITE_DATA.formEmails, falling back to
   SITE_DATA.apply.recipientEmail. Exposes window.SITE_FORMS.mount(),
   which app.js calls after every route render.
   ========================================================= */
(function () {
  'use strict';

  var AJAX = 'https://formsubmit.co/ajax/';

  function D() { return window.SITE_DATA || {}; }

  function recipientFor(kind) {
    var d = D();
    var specific = (d.formEmails || {})[kind] || '';
    var fallback = (d.apply && d.apply.recipientEmail) || '';
    return String(specific || fallback).trim();
  }

  function status(el, cls, msg) {
    if (!el) return;
    el.className = 'form-status ' + cls;
    el.textContent = msg;
  }

  /* First control that fails native validation, or null. */
  function firstInvalid(form) {
    var ctrls = form.querySelectorAll('input, textarea, select');
    for (var i = 0; i < ctrls.length; i++) {
      if (!ctrls[i].disabled && !ctrls[i].checkValidity()) return ctrls[i];
    }
    return null;
  }

  function wire(form) {
    if (form.getAttribute('data-fs-wired')) return;
    form.setAttribute('data-fs-wired', '1');

    var kind = form.getAttribute('data-fs');
    var btn = form.querySelector('button[type="submit"]') || form.querySelector('button');
    var note = form.querySelector('.form-status');
    var label = btn ? btn.textContent : '';

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();

      var to = recipientFor(kind);
      if (!to) {
        status(note, 'bad', 'This form is not connected yet — set formEmails in data.js.');
        return;
      }

      var bad = firstInvalid(form);
      if (bad) {
        status(note, 'bad', bad.validationMessage || 'Please check the fields above.');
        try { bad.focus(); } catch (e) {}
        return;
      }

      var fd = new FormData(form);
      fd.append('_subject', form.getAttribute('data-subject') || 'New website submission');
      fd.append('_template', 'table');
      fd.append('_captcha', 'false');

      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      status(note, 'sending', 'Sending…');

      window.fetch(AJAX + encodeURIComponent(to), {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: fd
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        status(note, 'ok', form.getAttribute('data-success') || 'Thank you — your message has been sent.');
      }).catch(function () {
        status(note, 'bad', 'Sorry, that did not send. Please try again, or call us on 080 2388 2300.');
      }).then(function () {
        if (btn) { btn.disabled = false; btn.textContent = label; }
      });
    });
  }

  /* CTAs that jump to a block further down the same page. A plain href
     cannot do this — the site routes on the hash, so "#volunteer" would
     be read as a route. */
  function wireJumps() {
    var els = document.querySelectorAll('[data-scroll]');
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        if (el.getAttribute('data-scroll-wired')) return;
        el.setAttribute('data-scroll-wired', '1');
        el.addEventListener('click', function () {
          var target = document.getElementById(el.getAttribute('data-scroll'));
          if (!target) return;
          if (target.scrollIntoView) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          var focusable = target.querySelector('input, textarea, select');
          if (focusable) { try { focusable.focus({ preventScroll: true }); } catch (e) {} }
        });
      })(els[i]);
    }
  }

  window.SITE_FORMS = {
    mount: function () {
      var forms = document.querySelectorAll('form[data-fs]');
      for (var i = 0; i < forms.length; i++) wire(forms[i]);
      wireJumps();
    }
  };
})();
