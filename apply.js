/* =========================================================
   Fortpremium International — programme application form
   Route: #/apply  ·  #/apply/<programme-id>  ·  #/apply/success

   A six-step form posted to FormSubmit.co (see SITE_DATA.apply in
   data.js for the recipient address and cohort options).

   All six steps are rendered at once and toggled with a class, so
   native inputs keep their own value/validity state — including the
   file input, which cannot be re-created without losing its file.

   Exposes window.APPLY_FORM = { page(param), mount() }.
   app.js calls page() to get HTML, then mount() once it is in the DOM.
   ========================================================= */
(function () {
  'use strict';

  var DRAFT_KEY = 'fp_apply_draft_v1';
  var REF_KEY = 'fp_apply_ref_v1';

  function D() { return window.SITE_DATA || {}; }
  function CFG() { return D().apply || {}; }
  function LGA() { return window.NG_LGA || {}; }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function slug(s) { return String(s).replace(/[^a-z0-9]+/gi, '_').toLowerCase(); }

  var STEPS = [
    { title: 'Personal Details', short: 'Personal', intro: 'Tell us who you are. Names must match your official identification.' },
    { title: 'Contact Details', short: 'Contact', intro: 'How we reach you about your application and your cohort.' },
    { title: 'Academic Background', short: 'Academic', intro: 'Your highest completed level of education.' },
    { title: 'Technical & Infrastructure Readiness', short: 'Readiness', intro: 'This helps us place you correctly and plan support — there are no wrong answers.' },
    { title: 'Course & Logistics Preferences', short: 'Preferences', intro: 'Choose the track and schedule that suit you best.' },
    { title: 'Review & Submit', short: 'Review', intro: 'Check everything below, then submit your application.' }
  ];

  /* ---------- field builders ---------- */

  function head(id, label, req) {
    return '<label for="' + id + '">' + esc(label) +
      (req ? '<span class="req" title="Required">*</span>' : '<span class="opt">optional</span>') +
      '</label>';
  }
  function hint(o) { return o.hint ? '<span class="hint">' + esc(o.hint) + '</span>' : ''; }
  function open(o) {
    return '<div class="fld' + (o.wide ? ' wide' : '') + '" data-label="' + esc(o.label) + '">';
  }

  function textField(o) {
    var id = 'f_' + slug(o.name);
    var a = ' id="' + id + '" name="' + esc(o.name) + '" type="' + (o.type || 'text') + '"' +
      (o.req ? ' required' : '') +
      (o.pattern ? ' pattern="' + o.pattern + '"' : '') +
      (o.title ? ' title="' + esc(o.title) + '"' : '') +
      (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : '') +
      (o.min ? ' min="' + o.min + '"' : '') + (o.max ? ' max="' + o.max + '"' : '') +
      (o.maxlength ? ' maxlength="' + o.maxlength + '"' : '') +
      (o.inputmode ? ' inputmode="' + o.inputmode + '"' : '') +
      (o.autocomplete ? ' autocomplete="' + o.autocomplete + '"' : '');
    return open(o) + head(id, o.label, o.req) + '<input' + a + '/>' + hint(o) + '<span class="err"></span></div>';
  }

  function areaField(o) {
    var id = 'f_' + slug(o.name);
    return open(o) + head(id, o.label, o.req) +
      '<textarea id="' + id + '" name="' + esc(o.name) + '" rows="' + (o.rows || 3) + '"' +
      (o.req ? ' required' : '') + (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : '') +
      '></textarea>' + hint(o) + '<span class="err"></span></div>';
  }

  function options(list, placeholder) {
    var out = '<option value="">' + esc(placeholder) + '</option>';
    for (var i = 0; i < list.length; i++) out += '<option value="' + esc(list[i]) + '">' + esc(list[i]) + '</option>';
    return out;
  }

  function selectField(o) {
    var id = 'f_' + slug(o.name);
    return open(o) + head(id, o.label, o.req) +
      '<select id="' + id + '" name="' + esc(o.name) + '"' + (o.req ? ' required' : '') +
      (o.disabled ? ' disabled' : '') + '>' +
      options(o.list || [], o.placeholder || 'Select…') + '</select>' +
      hint(o) + '<span class="err"></span></div>';
  }

  /* Radio cards. `list` items are {value, note} or plain strings. */
  function choiceField(o) {
    var out = open(o) + '<span class="grp-label">' + esc(o.label) +
      (o.req ? '<span class="req" title="Required">*</span>' : '') + '</span>' +
      hint(o) + '<div class="choices">';
    for (var i = 0; i < o.list.length; i++) {
      var it = o.list[i];
      var val = it.value == null ? it : it.value;
      var id = 'f_' + slug(o.name) + '_' + i;
      out += '<label class="choice" for="' + id + '">' +
        '<input type="radio" id="' + id + '" name="' + esc(o.name) + '" value="' + esc(val) + '"' +
        (o.req ? ' required' : '') + '/>' +
        '<span class="mark" aria-hidden="true"></span>' +
        '<span class="body"><span class="ttl">' + esc(val) + '</span>' +
        (it.note ? '<span class="sub">' + esc(it.note) + '</span>' : '') + '</span></label>';
    }
    return out + '</div><span class="err"></span></div>';
  }

  function checkField(o) {
    var id = 'f_' + slug(o.name);
    return open(o) +
      '<label class="checkline" for="' + id + '">' +
      '<input type="checkbox" id="' + id + '" name="' + esc(o.name) + '" value="Yes"' + (o.req ? ' required' : '') + '/>' +
      '<span class="box" aria-hidden="true"></span>' +
      '<span class="txt">' + esc(o.label) + (o.req ? '<span class="req">*</span>' : '') + '</span>' +
      '</label><span class="err"></span></div>';
  }

  /* The file input MUST be named "attachment" — that is the name
     FormSubmit looks for when attaching an upload to the email. */
  function photoField(o) {
    var mb = CFG().maxPhotoMB || 2;
    return open(o) +
      '<span class="grp-label">' + esc(o.label) + '<span class="req" title="Required">*</span></span>' +
      '<span class="hint">Clear, front-facing photo on a plain background. JPG or PNG, up to ' + mb + 'MB.</span>' +
      '<div class="photo-row">' +
        '<div class="photo-preview" id="photoPreview"><span>No photo selected</span></div>' +
        '<div class="photo-ctrl">' +
          '<input type="file" id="f_attachment" name="attachment" accept="image/png,image/jpeg" required/>' +
          '<label class="btn-file" for="f_attachment">Choose photo…</label>' +
          '<span class="photo-name" id="photoName">No file chosen</span>' +
        '</div>' +
      '</div><span class="err"></span></div>';
  }

  /* ---------- step content ---------- */

  function yearList() {
    var now = new Date().getFullYear(), out = [], y;
    for (y = now + 6; y >= 1965; y--) out.push(String(y));
    return out;
  }
  function stateList() {
    var k = Object.keys(LGA());
    k.sort();
    return k;
  }
  function todayISO() { return new Date().toISOString().slice(0, 10); }

  function stepPersonal() {
    return '<div class="fgrid">' +
      textField({ name: 'Surname', label: 'Surname', req: true, autocomplete: 'family-name', placeholder: 'As on your ID' }) +
      textField({ name: 'First Name', label: 'First Name', req: true, autocomplete: 'given-name' }) +
      textField({ name: 'Other Name', label: 'Other Name', autocomplete: 'additional-name' }) +
      textField({ name: 'Date of Birth', label: 'Date of Birth', req: true, type: 'date', max: todayISO(), min: '1940-01-01' }) +
      selectField({ name: 'Gender', label: 'Gender', req: true, list: CFG().genders || [] }) +
      textField({
        name: 'National Identification Number', label: 'National Identification Number (NIN)', req: true,
        pattern: '[0-9]{11}', maxlength: 11, inputmode: 'numeric',
        title: 'Your NIN is exactly 11 digits.', placeholder: '11 digits'
      }) +
      selectField({ name: 'State of Origin', label: 'State of Origin', req: true, list: stateList(), placeholder: 'Select state…' }) +
      selectField({ name: 'LGA of Origin', label: 'LGA of Origin', req: true, list: [], placeholder: 'Select your state first', disabled: true }) +
      selectField({ name: 'State of Residence', label: 'State of Residence', req: true, list: stateList(), placeholder: 'Select state…' }) +
      areaField({
        name: 'Current Residential Address', label: 'Current Residential Address', req: true, wide: true, rows: 3,
        placeholder: 'Street address, area, city'
      }) +
      photoField({ name: 'attachment', label: 'Digital Passport Photograph', wide: true }) +
    '</div>';
  }

  function stepContact() {
    var phone = '^[0-9+()\\-\\s]{7,20}$';
    var phoneTitle = 'Enter a valid phone number, e.g. 08023882300 or +2348023882300.';
    return '<div class="fgrid">' +
      textField({ name: 'email', label: 'Primary Email Address', req: true, type: 'email', wide: true, autocomplete: 'email', placeholder: 'you@example.com', hint: 'Your admission decision and cohort details are sent here.' }) +
      textField({ name: 'Primary Phone Number', label: 'Primary Phone Number', req: true, type: 'tel', pattern: phone, title: phoneTitle, autocomplete: 'tel', placeholder: '080 0000 0000' }) +
      textField({ name: 'Alternative Phone Number', label: 'Alternative Phone Number', type: 'tel', pattern: phone, title: phoneTitle, placeholder: '080 0000 0000' }) +
      textField({ name: 'Emergency Contact Name', label: 'Emergency Contact Name', req: true, placeholder: 'Full name of parent, guardian or next of kin' }) +
      textField({ name: 'Emergency Contact Phone Number', label: 'Emergency Contact Phone Number', req: true, type: 'tel', pattern: phone, title: phoneTitle, placeholder: '080 0000 0000' }) +
    '</div>';
  }

  function stepAcademic() {
    return '<div class="fgrid">' +
      selectField({ name: 'Highest Qualification Attained', label: 'Highest Qualification Attained', req: true, wide: true, list: CFG().qualifications || [] }) +
      textField({ name: 'Institution Attended', label: 'Institution Attended', req: true, placeholder: 'Name of school, polytechnic or university' }) +
      selectField({ name: 'Year of Graduation', label: 'Year of Graduation', req: true, list: yearList(), placeholder: 'Select year…', hint: 'Expecting to finish soon? Choose your expected year.' }) +
    '</div>';
  }

  function stepTech() {
    return '<div class="fgrid">' +
      choiceField({ name: 'Current Tech Experience Level', label: 'Current Tech Experience Level', req: true, wide: true, list: CFG().experienceLevels || [] }) +
      choiceField({ name: 'Laptop Ownership Status', label: 'Laptop Ownership Status', req: true, wide: true, list: CFG().laptopOptions || [] }) +
      '<div class="fld wide"><span class="grp-label">Internet &amp; Power Availability<span class="req" title="Required">*</span></span>' +
        '<span class="hint">Both confirmations are required — sessions are live and attendance is tracked.</span></div>' +
      checkField({ name: 'Internet Availability Confirmed', label: 'I have consistent access to an internet connection good enough for live online sessions.', req: true, wide: true }) +
      checkField({ name: 'Power Availability Confirmed', label: 'I have reliable access to power, or a backup source, to support my learning.', req: true, wide: true }) +
      textField({ name: 'LinkedIn Profile URL', label: 'LinkedIn Profile URL', type: 'url', placeholder: 'https://linkedin.com/in/…' }) +
      textField({ name: 'GitHub or Portfolio URL', label: 'GitHub or Portfolio URL', type: 'url', placeholder: 'https://github.com/…' }) +
    '</div>';
  }

  function stepCourse() {
    var progs = (D().programmes || []).map(function (p) { return p.name; });
    return '<div class="fgrid">' +
      selectField({ name: 'Preferred Programme', label: 'Preferred Programme', req: true, list: progs, placeholder: 'Select programme…' }) +
      selectField({ name: 'Preferred Tech Track', label: 'Preferred Tech Track / Course', req: true, list: [], placeholder: 'Select a programme first', disabled: true }) +
      choiceField({ name: 'Preferred Learning Mode', label: 'Preferred Learning Mode', req: true, wide: true, list: CFG().learningModes || [] }) +
      selectField({ name: 'Preferred Cohort', label: 'Preferred Cohort / Start Date', req: true, wide: true, list: CFG().cohorts || [], placeholder: 'Select cohort…' }) +
    '</div>';
  }

  function stepReview() {
    return '<div id="reviewOut" class="review"></div>' +
      '<div class="declare">' +
        checkField({
          name: 'Declaration Accepted', req: true, wide: true,
          label: 'I confirm that the information above is true and accurate, and I consent to Fortpremium International storing and processing it for the purpose of my application.'
        }) +
      '</div>';
  }

  var STEP_BODY = [stepPersonal, stepContact, stepAcademic, stepTech, stepCourse, stepReview];

  /* ---------- page shells ---------- */

  function stepper() {
    var out = '<ol class="stepper" aria-hidden="true">';
    for (var i = 0; i < STEPS.length; i++) {
      out += '<li class="sstep" data-i="' + i + '"><span class="bub">' + (i + 1) + '</span>' +
        '<span class="nm">' + esc(STEPS[i].short) + '</span></li>';
    }
    return out + '</ol>';
  }

  function formPage(preselectId) {
    var cfg = CFG();
    var action = cfg.recipientEmail ? cfg.endpointBase + cfg.recipientEmail : '';
    var body = '';
    for (var i = 0; i < STEPS.length; i++) {
      body += '<section class="fstep' + (i === 0 ? ' active' : '') + '" data-step="' + i + '">' +
        '<h2 class="fstep-title">' + esc(STEPS[i].title) + '</h2>' +
        '<p class="fstep-intro">' + esc(STEPS[i].intro) + '</p>' +
        STEP_BODY[i]() +
      '</section>';
    }

    return '<div>' +
      '<section class="container page-hero apply-hero">' +
        '<span class="eyebrow" style="color:var(--purple)">APPLICATION</span>' +
        '<h1>Apply for a Fortpremium programme</h1>' +
        '<p class="lead">It takes about 10 minutes. Your answers are saved in this browser as you go, so you can close the page and pick up where you left off.</p>' +
      '</section>' +

      '<section class="container apply-wrap" style="padding-bottom:clamp(50px,6vw,80px)">' +
        stepper() +
        '<div class="progress"><div class="bar" id="progBar"></div></div>' +
        '<p class="progress-note" id="progNote">Step 1 of ' + STEPS.length + '</p>' +

        '<form id="applyForm" class="apply-form" method="POST" enctype="multipart/form-data"' +
          (action ? ' action="' + esc(action) + '"' : '') + ' novalidate>' +
          '<input type="hidden" name="_template" value="table"/>' +
          '<input type="hidden" name="_captcha" value="false"/>' +
          '<input type="hidden" name="_subject" id="fSubject" value="New programme application"/>' +
          '<input type="hidden" name="_next" id="fNext" value=""/>' +
          '<input type="hidden" name="_autoresponse" value="Thank you for applying to Fortpremium International. We have received your application and our admissions team will review it and contact you by email. Please keep your application reference for any follow-up."/>' +
          '<input type="hidden" name="Application Reference" id="fRef" value=""/>' +
          '<input type="hidden" name="Submitted From" id="fSrc" value="' + esc(preselectId || 'direct') + '"/>' +

          body +

          '<div class="notice err-summary" id="formError" hidden></div>' +

          '<div class="form-nav">' +
            '<button type="button" class="btn btn-ghost" id="btnBack" hidden>← Back</button>' +
            '<button type="button" class="btn btn-primary" id="btnNext">Continue →</button>' +
            '<button type="submit" class="btn btn-primary" id="btnSubmit" hidden>Submit application →</button>' +
            '<button type="button" class="btn-clear" id="btnClear">Clear saved draft</button>' +
          '</div>' +
        '</form>' +
      '</section>' +
    '</div>';
  }

  function successPage() {
    var ref = '';
    try { ref = window.localStorage.getItem(REF_KEY) || ''; } catch (e) { ref = ''; }
    return '<div>' +
      '<section class="container apply-success">' +
        '<div class="tick">✓</div>' +
        '<h1>Application received</h1>' +
        '<p class="lead">Thank you for applying to Fortpremium International. A confirmation has been sent to the email address you provided.</p>' +
        (ref ? '<div class="refbox"><span class="k">Your application reference</span><span class="v">' + esc(ref) + '</span></div>' : '') +
        '<div class="next-steps">' +
          '<h2>What happens next</h2>' +
          '<ol>' +
            '<li>Our admissions team reviews your application and verifies your details.</li>' +
            '<li>Shortlisted applicants are contacted by email for a short placement conversation.</li>' +
            '<li>You receive your cohort confirmation, onboarding pack and class schedule.</li>' +
          '</ol>' +
        '</div>' +
        '<div class="hero-actions">' +
          '<a class="btn btn-primary" href="#/programmes">Explore programmes</a>' +
          '<a class="btn btn-ghost" href="#/home">Back to home →</a>' +
        '</div>' +
      '</section>' +
    '</div>';
  }

  /* ---------- behaviour ---------- */

  function mount() {
    var form = document.getElementById('applyForm');
    if (!form) return;

    var steps = form.querySelectorAll('.fstep');
    var dots = document.querySelectorAll('.stepper .sstep');
    var bar = document.getElementById('progBar');
    var note = document.getElementById('progNote');
    var back = document.getElementById('btnBack');
    var next = document.getElementById('btnNext');
    var submit = document.getElementById('btnSubmit');
    var errBox = document.getElementById('formError');
    var cur = 0;

    // Setup reminder for whoever is deploying — kept out of the visitor's way.
    if (!CFG().recipientEmail && window.console && console.warn) {
      console.warn('[Fortpremium] No application recipient set. Add apply.recipientEmail in data.js — submissions cannot be delivered until you do.');
    }

    /* -- where FormSubmit sends the applicant after posting -- */
    document.getElementById('fNext').value = location.href.split('#')[0] + '#/apply/success';

    /* -- reference number, shown on the success page -- */
    var ref = 'FPA-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' +
      String(Math.floor(Math.random() * 9000) + 1000);
    document.getElementById('fRef').value = ref;

    /* ---- dependent dropdowns ---- */
    var stateOrigin = form.querySelector('[name="State of Origin"]');
    var lgaSel = form.querySelector('[name="LGA of Origin"]');
    var progSel = form.querySelector('[name="Preferred Programme"]');
    var trackSel = form.querySelector('[name="Preferred Tech Track"]');

    function fill(sel, list, placeholder, keep) {
      var want = keep != null ? keep : sel.value;
      sel.innerHTML = options(list, placeholder);
      sel.disabled = !list.length;
      if (want) sel.value = want;
    }
    function syncLGA(keep) {
      var list = LGA()[stateOrigin.value] || [];
      fill(lgaSel, list, list.length ? 'Select LGA…' : 'Select your state first', keep);
    }
    function syncTracks(keep) {
      var p = (D().programmes || []).filter(function (x) { return x.name === progSel.value; })[0];
      var list = p ? p.skills.slice() : [];
      fill(trackSel, list, list.length ? 'Select track…' : 'Select a programme first', keep);
    }
    stateOrigin.addEventListener('change', function () { syncLGA(''); });
    progSel.addEventListener('change', function () { syncTracks(''); });

    /* ---- passport photo ---- */
    var photo = document.getElementById('f_attachment');
    var preview = document.getElementById('photoPreview');
    var pname = document.getElementById('photoName');
    var maxBytes = (CFG().maxPhotoMB || 2) * 1024 * 1024;
    var objectUrl = null;

    function clearPreview() {
      preview.textContent = '';
      var s = document.createElement('span');
      s.textContent = 'No photo selected';
      preview.appendChild(s);
      pname.textContent = 'No file chosen';
    }

    photo.addEventListener('change', function () {
      var f = photo.files && photo.files[0];
      if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = null; }
      if (!f) { clearPreview(); return; }
      if (f.size > maxBytes) {
        photo.value = '';
        clearPreview();
        showFieldError(photo, 'That photo is ' + (f.size / 1048576).toFixed(1) + 'MB. Please choose one under ' + (CFG().maxPhotoMB || 2) + 'MB.');
        return;
      }
      clearFieldError(photo);
      objectUrl = URL.createObjectURL(f);
      var img = document.createElement('img');
      img.src = objectUrl;
      img.alt = 'Passport photograph preview';
      preview.textContent = '';
      preview.appendChild(img);
      pname.textContent = f.name;
    });

    /* ---- tidy up loose URLs so type="url" does not reject them ---- */
    var urlFields = form.querySelectorAll('input[type="url"]');
    for (var u = 0; u < urlFields.length; u++) {
      urlFields[u].addEventListener('blur', function () {
        var v = this.value.trim();
        if (v && v.indexOf('://') === -1) this.value = 'https://' + v.replace(/^\/+/, '');
      });
    }

    /* ---- validation ---- */
    function fldOf(el) {
      var n = el;
      while (n && n !== form && !(n.classList && n.classList.contains('fld'))) n = n.parentNode;
      return n === form ? null : n;
    }
    function showFieldError(el, msg) {
      var f = fldOf(el);
      if (!f) return;
      f.classList.add('invalid');
      var e = f.querySelector('.err');
      if (e) e.textContent = msg;
    }
    function clearFieldError(el) {
      var f = fldOf(el);
      if (!f) return;
      f.classList.remove('invalid');
      var e = f.querySelector('.err');
      if (e) e.textContent = '';
    }

    function validateStep(i) {
      var sec = steps[i];
      var ctrls = sec.querySelectorAll('input, select, textarea');
      var firstBad = null, seen = {};
      for (var j = 0; j < ctrls.length; j++) {
        var el = ctrls[j];
        if (el.disabled || el.type === 'hidden') continue;
        if (el.type === 'radio') {
          if (seen[el.name]) continue;
          seen[el.name] = 1;
        }
        clearFieldError(el);
        if (el.checkValidity()) continue;
        var msg = el.validationMessage;
        if (el.type === 'radio') msg = 'Please choose one option.';
        else if (el.type === 'checkbox') msg = 'Please tick this to continue.';
        else if (el.type === 'file') msg = 'Please attach a passport photograph.';
        else if (el.validity.patternMismatch && el.title) msg = el.title;
        showFieldError(el, msg);
        if (!firstBad) firstBad = el;
      }
      if (firstBad) {
        var f = fldOf(firstBad);
        if (f && f.scrollIntoView) f.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (firstBad.type !== 'file' && firstBad.type !== 'radio') { try { firstBad.focus({ preventScroll: true }); } catch (e) {} }
        return false;
      }
      return true;
    }

    /* clear a field's error as soon as it becomes valid again */
    form.addEventListener('input', function (ev) {
      var el = ev.target;
      if (el.checkValidity && el.checkValidity()) clearFieldError(el);
      saveDraft();
    });
    form.addEventListener('change', function (ev) {
      var el = ev.target;
      if (el.checkValidity && el.checkValidity()) clearFieldError(el);
      saveDraft();
    });

    /* ---- review summary ---- */
    function valueOf(fld) {
      var r = fld.querySelector('input[type="radio"]:checked');
      if (r) return r.value;
      if (fld.querySelector('input[type="radio"]')) return '';
      var c = fld.querySelector('input[type="checkbox"]');
      if (c) return c.checked ? 'Yes' : 'No';
      var f = fld.querySelector('input[type="file"]');
      if (f) return f.files && f.files[0] ? f.files[0].name : '';
      var el = fld.querySelector('select, textarea, input');
      return el ? el.value : '';
    }

    function buildReview() {
      var out = '';
      for (var i = 0; i < steps.length - 1; i++) {
        var flds = steps[i].querySelectorAll('.fld[data-label]');
        var rows = '';
        for (var j = 0; j < flds.length; j++) {
          var label = flds[j].getAttribute('data-label');
          if (!label) continue;
          var v = valueOf(flds[j]);
          rows += '<div class="rrow"><span class="rk">' + esc(label) + '</span>' +
            '<span class="rv' + (v ? '' : ' empty') + '">' + esc(v || 'Not provided') + '</span></div>';
        }
        if (!rows) continue;
        out += '<div class="rgroup"><div class="rhead"><h3>' + esc(STEPS[i].title) + '</h3>' +
          '<button type="button" class="redit" data-goto="' + i + '">Edit</button></div>' + rows + '</div>';
      }
      document.getElementById('reviewOut').innerHTML = out;
    }

    /* ---- step navigation ---- */
    function go(i) {
      cur = i;
      for (var k = 0; k < steps.length; k++) steps[k].classList.toggle('active', k === i);
      for (var d = 0; d < dots.length; d++) {
        dots[d].classList.toggle('done', d < i);
        dots[d].classList.toggle('now', d === i);
      }
      bar.style.width = ((i + 1) / steps.length * 100) + '%';
      note.textContent = 'Step ' + (i + 1) + ' of ' + steps.length + ' — ' + STEPS[i].title;
      back.hidden = i === 0;
      var last = i === steps.length - 1;
      next.hidden = last;
      submit.hidden = !last;
      errBox.hidden = true;
      if (last) buildReview();
      var wrap = document.querySelector('.apply-wrap');
      if (wrap && wrap.scrollIntoView) wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    next.addEventListener('click', function () {
      if (validateStep(cur)) go(cur + 1);
      else flash('Please complete the highlighted fields before continuing.');
    });
    back.addEventListener('click', function () { go(cur - 1); });

    document.getElementById('reviewOut').addEventListener('click', function (ev) {
      var b = ev.target.closest ? ev.target.closest('.redit') : null;
      if (b) go(parseInt(b.getAttribute('data-goto'), 10));
    });

    function flash(msg) {
      errBox.textContent = msg;
      errBox.hidden = false;
    }

    /* ---- draft persistence (everything except the photo) ---- */
    function saveDraft() {
      var data = {};
      var ctrls = form.querySelectorAll('input, select, textarea');
      for (var i = 0; i < ctrls.length; i++) {
        var el = ctrls[i];
        if (!el.name || el.name.charAt(0) === '_' || el.type === 'file' || el.type === 'hidden') continue;
        if (el.type === 'radio') { if (el.checked) data[el.name] = el.value; }
        else if (el.type === 'checkbox') data[el.name] = el.checked;
        else data[el.name] = el.value;
      }
      try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch (e) {}
    }

    function loadDraft() {
      var data;
      try { data = JSON.parse(window.localStorage.getItem(DRAFT_KEY) || 'null'); } catch (e) { data = null; }
      if (!data) { syncLGA(''); syncTracks(''); return; }

      // parents before dependants, so the child lists exist before we set them
      if (data['State of Origin']) stateOrigin.value = data['State of Origin'];
      syncLGA(data['LGA of Origin'] || '');
      if (data['Preferred Programme']) progSel.value = data['Preferred Programme'];
      syncTracks(data['Preferred Tech Track'] || '');

      var ctrls = form.querySelectorAll('input, select, textarea');
      for (var i = 0; i < ctrls.length; i++) {
        var el = ctrls[i];
        if (!el.name || !(el.name in data) || el.type === 'file' || el.type === 'hidden') continue;
        if (el.type === 'radio') el.checked = (data[el.name] === el.value);
        else if (el.type === 'checkbox') el.checked = !!data[el.name];
        else if (el !== lgaSel && el !== trackSel) el.value = data[el.name];
      }
    }

    document.getElementById('btnClear').addEventListener('click', function () {
      if (!window.confirm('Clear everything you have entered and start over?')) return;
      try { window.localStorage.removeItem(DRAFT_KEY); } catch (e) {}
      form.reset();
      clearPreview();
      syncLGA(''); syncTracks('');
      var bad = form.querySelectorAll('.fld.invalid');
      for (var i = 0; i < bad.length; i++) bad[i].classList.remove('invalid');
      go(0);
    });

    /* ---- submit ---- */
    form.addEventListener('submit', function (ev) {
      if (!CFG().recipientEmail) {
        ev.preventDefault();
        flash('Sorry — we could not submit your application just now. Please call 080 2388 2300 or use the Contact page. Your answers stay saved on this device.');
        return;
      }
      // validate every step, not just the last one
      for (var i = 0; i < steps.length; i++) {
        if (!validateStep(i)) {
          ev.preventDefault();
          go(i);
          flash('Something on this step needs attention before you can submit.');
          return;
        }
      }
      var who = [
        form.querySelector('[name="Surname"]').value,
        form.querySelector('[name="First Name"]').value
      ].join(' ').trim();
      document.getElementById('fSubject').value =
        'Programme application — ' + (who || 'New applicant') + ' (' + ref + ')';

      // Stash the reference for the success page. The draft is deliberately
      // NOT cleared here — if the POST fails the applicant still has their
      // answers. It is cleared when the success page is actually reached.
      try { window.localStorage.setItem(REF_KEY, ref); } catch (e) {}

      submit.disabled = true;
      submit.textContent = 'Submitting…';
    });

    /* ---- boot ---- */
    loadDraft();

    // preselect the programme when arriving from a programme page (#/apply/<id>)
    var src = document.getElementById('fSrc').value;
    if (src && src !== 'direct') {
      var p = (D().programmes || []).filter(function (x) { return x.id === src; })[0];
      if (p && !progSel.value) { progSel.value = p.name; syncTracks(''); }
    }

    go(0);
  }

  /* ---------- public ---------- */
  window.APPLY_FORM = {
    page: function (param) {
      return param === 'success' ? successPage() : formPage(param);
    },
    mount: function () {
      if (document.getElementById('applyForm')) { mount(); return; }
      // Success view: the application went through, so the saved draft
      // has done its job and should not resurface in a later session.
      try { window.localStorage.removeItem(DRAFT_KEY); } catch (e) {}
    }
  };
})();
