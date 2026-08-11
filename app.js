/* =========================================================
   Fortpremium International — app logic
   Hash-based router, page renderers, mobile menu.
   Content comes from window.SITE_DATA (data.js).
   ========================================================= */
(function () {
  'use strict';
  var D = window.SITE_DATA;

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  // Route link helper — anchors use hash routing so it works from file://
  function href(route) { return '#/' + route; }

  /* ---------- page renderers (return HTML strings) ---------- */

  function homePage() {
    var img = D.images.hero;
    return '' +
    '<div>' +
      // hero
      '<section class="container hero">' +
        '<div>' +
        '<div class="hero-tagline">Digital · Innovative · Capacity Development Hub</div>' +
        '<h1>Deliberate &amp; strategic digital impact.</h1>' +
        '<div class="badge-note"><span class="dot"></span>Aligned with Nigeria\'s National Digital Economy Policy</div>' +
          '<p class="hero-lead">A premier digital, innovative and capacity-development hub defining digital literacy in line with national standards — building Africa\'s next generation of tech leaders.</p>' +
          '<div class="hero-actions">' +
            '<a class="btn btn-primary" href="' + href('apply') + '">Get Started</a>' +
            '<a class="btn btn-ghost" href="' + href('programmes') + '">Explore Programmes →</a>' +
          '</div>' +
        '</div>' +
        '<div class="hero-media">' +
          '<div class="frame"><img src="' + img.src + '" alt="Learners at a Fortpremium training event" loading="lazy"/></div>' +
          '<div class="hero-float"><div class="big">100,000</div><div class="small">youth to empower</div></div>' +
        '</div>' +
      '</section>' +

      // stats
      '<section class="container section">' +
        '<div class="stats-band">' +
          '<h2>Impact by design</h2>' +
          '<p class="lead">A national mandate delivered through practical training, mentorship and measurable outcomes.</p>' +
          '<div class="stats-grid">' +
            D.stats.map(function (s) {
              return '<div class="stat" style="border-color:' + s.color + '"><div class="value">' + esc(s.value) + '</div><div class="label">' + esc(s.label) + '</div></div>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</section>' +

      // why
      '<section class="container section-lg">' +
        '<div class="head-block"><span class="eyebrow" style="color:var(--purple)">WHY FORTPREMIUM</span><h2>Closing the digital skills gap with intentional learning</h2></div>' +
        '<div class="cards-auto cards-why">' +
          D.why.map(function (w) {
            return '<div class="card"><div class="why-num" style="background:' + w.color + '">' + esc(w.num) + '</div><h3>' + esc(w.title) + '</h3><p>' + esc(w.body) + '</p></div>';
          }).join('') +
        '</div>' +
      '</section>' +

      // programmes preview
      '<section class="container section-lg">' +
        '<div class="split-head">' +
          '<div style="max-width:560px"><span class="eyebrow" style="color:var(--coral)">OUR PROGRAMMES</span><h2 class="section-title" style="margin-top:12px">Practical, mentor-led pathways</h2></div>' +
          '<a class="btn btn-ghost btn-sm" href="' + href('programmes') + '">View All →</a>' +
        '</div>' +
        '<div class="prog-grid">' + D.programmes.map(progCard).join('') + '</div>' +
      '</section>' +

      // stories
      '<section class="container section-lg">' +
        '<div class="stories-wrap">' +
          '<span class="eyebrow" style="color:var(--purple)">LEARNER STORIES</span><h2>Real people. Real momentum.</h2>' +
          '<div class="stories-grid">' +
            D.stories.map(function (t) {
              return '<div class="story"><p>"' + esc(t.quote) + '"</p><div class="who"><div class="avatar" style="background:' + t.color + '">' + esc(t.initials) + '</div><div><div class="name">' + esc(t.name) + '</div><div class="role">' + esc(t.role) + '</div></div></div></div>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</section>' +

      // gallery
      '<section class="container section">' +
        '<span class="eyebrow" style="color:var(--coral)">GALLERY</span>' +
        '<h2 class="section-title" style="margin-top:12px">Moments from our hub</h2>' +
        '<p class="section-intro">Training sessions, workshops and community events at Fortpremium.</p>' +
        '<div class="gallery-grid">' +
          D.gallery.map(function (g) {
            return '<div class="tile"><img src="' + g.src + '" alt="Fortpremium hub moment" loading="lazy"/></div>';
          }).join('') +
        '</div>' +
        '<p class="credit-line">Placeholder photos via Unsplash — ' +
          D.gallery.map(function (g) { return '<a href="' + g.href + '" target="_blank" rel="noopener">' + esc(g.credit) + '</a>'; }).join(', ') +
        '.</p>' +
      '</section>' +

      // CTA
      '<section class="container section-lg">' +
        '<div class="cta-band"><h2>Ready to get started?</h2><p>Join thousands of young innovators building meaningful tech careers with Fortpremium.</p><a class="btn" href="' + href('apply') + '">Apply for a Programme →</a></div>' +
      '</section>' +
    '</div>';
  }

  // Reusable "go to the application form" band, dropped at the end of pages
  // where a visitor is most likely to have decided they want to apply.
  function applyBand(title, body, label) {
    return '<section class="container section-lg">' +
      '<div class="cta-band"><h2>' + esc(title) + '</h2><p>' + esc(body) + '</p>' +
      '<a class="btn" href="' + href('apply') + '">' + esc(label) + ' →</a></div>' +
    '</section>';
  }

  function progCard(p) {
    return '<a class="prog-card" href="' + href('programme/' + p.id) + '">' +
      '<div class="prog-media"><img src="' + p.img + '" alt="' + esc(p.name) + '" loading="lazy"/><span class="pill-tag" style="background:' + p.color + '">' + esc(p.tag) + '</span></div>' +
      '<div class="prog-body"><h3>' + esc(p.name) + '</h3><p>' + esc(p.blurb) + '</p><span class="learn-more" style="color:' + p.color + '">Learn More →</span></div>' +
    '</a>';
  }
  function progCardTall(p) {
    return '<a class="prog-card" href="' + href('programme/' + p.id) + '">' +
      '<div class="prog-media tall"><img src="' + p.img + '" alt="' + esc(p.name) + '" loading="lazy"/><span class="pill-tag" style="background:' + p.color + '">' + esc(p.tag) + '</span></div>' +
      '<div class="prog-body"><h3>' + esc(p.name) + '</h3><p>' + esc(p.blurb) + '</p><span class="learn-more" style="color:' + p.color + '">Learn More →</span></div>' +
    '</a>';
  }

  function aboutPage() {
    var img = D.images.aboutWho;
    return '<div>' +
      '<section class="container about-hero" style="padding-top:clamp(40px,5vw,70px);padding-bottom:clamp(20px,3vw,40px)">' +
        '<span class="eyebrow" style="color:var(--purple)">ABOUT US</span>' +
        '<h1>Defining digital literacy in line with national standards</h1>' +
        '<p class="about-lead">We are a premier digital, innovative and capacity-development hub dedicated to redefining what it means to be digitally literate in Nigeria — moving beyond basic skills to high-impact technical education.</p>' +
      '</section>' +

      '<section class="container section">' +
        '<div class="two-col">' +
          '<div class="ratio-4-3"><img src="' + img.src + '" alt="Fortpremium classroom" loading="lazy"/></div>' +
          '<div><h2>Who we are</h2>' +
            '<p>FORTPREMIUM is a core driver of Nigeria\'s national-building agenda, strategically synchronized with the Federal Government\'s National Digital Economy Policy and Strategy (NDEPS).</p>' +
            '<p>We focus on high-impact technical education — instilling the ethical and leadership values necessary for sustainable national growth, and providing the intellectual and social tools young people need to thrive in a globalized, knowledge-based economy. We integrate our expertise across agriculture, property management and food services to keep digital literacy industry-based.</p>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="container section">' +
        '<div class="amv-grid">' +
          '<div class="amv dark"><div class="k" style="color:#ff9a4d">OUR AIM</div><p>Empower <strong style="color:#ff9a4d">100,000</strong> youths and teenagers with future-ready digital competencies and a deep understanding of computer systems to solve complex problems.</p></div>' +
          '<div class="amv light"><div class="k" style="color:var(--purple)">OUR MISSION</div><p>To model an approach that is solution- and goal-driven.</p></div>' +
          '<div class="amv light"><div class="k" style="color:var(--teal)">OUR VISION</div><p>To be a trusted, transformation-influencing partner.</p></div>' +
        '</div>' +
      '</section>' +

      '<section class="container section">' +
        '<h2 class="section-title">Our core values</h2>' +
        '<p class="section-intro">The principles that guide how we train and empower young people into the digital tech world.</p>' +
        '<div class="values-grid">' +
          D.values.map(function (v) {
            return '<div class="value"><div class="dot" style="background:' + v.color + '"></div><h3>' + esc(v.title) + '</h3><p>' + esc(v.body) + '</p></div>';
          }).join('') +
        '</div>' +
      '</section>' +

      '<section class="container section-lg">' +
        '<h2 class="section-title">Our objectives</h2>' +
        '<p class="section-intro">Upon successful completion of our programmes, students will be able to:</p>' +
        '<div class="obj-grid">' +
          D.objectives.map(function (o) {
            return '<div class="obj"><div class="n chip-num" style="background:' + o.color + '">' + esc(o.num) + '</div><div><h3>' + esc(o.title) + '</h3><p>' + esc(o.body) + '</p></div></div>';
          }).join('') +
        '</div>' +
      '</section>' +

      '<section class="partners-band">' +
        '<div class="container" style="padding-top:clamp(40px,5vw,72px);padding-bottom:clamp(40px,5vw,72px)">' +
          '<span class="eyebrow" style="color:var(--purple)">OUR PARTNER ORGANIZATIONS</span>' +
          '<h2 class="section-title" style="margin-top:12px">Trusted institutional partners</h2>' +
          '<p class="section-intro">We collaborate with leading national bodies and examination councils to deliver credible, standards-aligned digital education.</p>' +
          '<div class="partners-grid">' +
            D.partners.map(function (pt) {
              var box = pt.imgUrl
                ? '<div class="logo-box' + (pt.dark ? ' dark' : '') + '"><img src="' + pt.imgUrl + '" alt="' + esc(pt.name) + ' logo" loading="lazy"/></div>'
                : '<div class="logo-box empty"></div>';
              return '<div class="partner">' + box + '<div class="name">' + esc(pt.name) + '</div></div>';
            }).join('') +
          '</div>' +

          '<h2 class="section-title" style="margin-top:clamp(44px,5vw,64px)">Our clients</h2>' +
          '<p class="section-intro">Schools and institutions that trust Fortpremium to deliver digital literacy on-site.</p>' +
          '<div class="clients-grid">' +
            D.clients.map(function (cl) {
              return '<div class="client"><div class="n chip-num" style="background:' + cl.color + '">' + esc(cl.num) + '</div><div><div class="name">' + esc(cl.name) + '</div><div class="loc">' + esc(cl.location) + '</div></div></div>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</section>' +
      applyBand('Ready to build your digital future?', 'Join a Fortpremium programme and gain the practical, industry-aligned skills employers are hiring for.', 'Apply to a Programme') +
    '</div>';
  }

  function teamPage() {
    return '<div>' +
      '<section class="container page-hero" style="padding-top:clamp(40px,5vw,70px);padding-bottom:clamp(20px,3vw,36px)">' +
        '<span class="eyebrow" style="color:var(--purple)">MEET THE TEAM</span>' +
        '<h1>The Architects of Fortpremium</h1>' +
        '<p class="lead">A leadership team combining technical mastery, creative vision, and a deep commitment to social impact — driving Nigeria\'s digital nation-building agenda.</p>' +
      '</section>' +
      '<section class="container" style="padding-bottom:clamp(20px,3vw,30px)">' +
        '<div class="team-list">' +
          D.team.map(function (m) {
            var photo = m.img
              ? '<img src="' + m.img + '" alt="' + esc(m.name) + '"/>'
              : '';
            return '<div class="team-member">' +
              '<div class="team-photo-wrap"><div class="team-photo">' + photo +
                '<div class="badge" style="background:' + m.color + '">' + esc(m.initials) + '</div>' +
              '</div></div>' +
              '<div class="team-info"><h2>' + esc(m.name) + '</h2>' +
                '<div class="role-pill" style="background:' + m.color + '">' + esc(m.role) + '</div>' +
                '<div class="team-bio">' + m.bio.map(function (b) { return '<p>' + esc(b) + '</p>'; }).join('') + '</div>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</section>' +
      '<section class="container section">' +
        '<span class="eyebrow" style="color:var(--teal)">OUR NETWORK</span>' +
        '<h2 class="partners-title">Our Global Ecosystem Partners</h2>' +
        '<p class="partners-lead">The practitioners, collaborators, and advocates who extend Fortpremium\'s reach across the wider digital ecosystem.</p>' +
        '<div class="partner-grid">' +
          D.ecosystemPartners.map(function (p) {
            var media = p.img
              ? '<img src="' + p.img + '" alt="' + esc(p.name) + '" loading="lazy"/>'
              : '<span class="partner-initials">' + esc(p.initials) + '</span>';
            // Photoless partners get the colour on the tile itself; photographed
            // ones keep a neutral backdrop so the image is not tinted while loading.
            var bg = p.img ? '' : ' style="background:' + p.color + '"';
            return '<div class="partner-card">' +
              '<div class="partner-photo"' + bg + '>' + media + '</div>' +
              '<div class="partner-name">' + esc(p.name) + '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</section>' +
      applyBand('Learn from this team', 'Our programmes are led by the same practitioners you just met, plus a network of industry mentors.', 'Apply to a Programme') +
    '</div>';
  }

  function programmesPage() {
    return '<div>' +
      '<section class="container page-hero" style="padding-top:clamp(40px,5vw,70px);padding-bottom:clamp(20px,3vw,36px)">' +
        '<span class="eyebrow" style="color:var(--coral)">OUR PROGRAMMES</span>' +
        '<h1>Choose your path</h1>' +
        '<p class="lead">Each programme combines practical learning, mentorship, and project experience so learners can move from interest to real career direction.</p>' +
      '</section>' +
      '<section class="container" style="padding-bottom:clamp(20px,3vw,30px)">' +
        '<div class="prog-grid">' + D.programmes.map(progCardTall).join('') + '</div>' +
      '</section>' +
      applyBand('Found your path?', 'Applications take about 10 minutes. Tell us where you are now and we will help you choose the right track.', 'Start your application') +
    '</div>';
  }

  function detailPage(id) {
    var p = D.programmes.filter(function (x) { return x.id === id; })[0] || D.programmes[0];
    var others = D.programmes.filter(function (x) { return x.id !== p.id; }).slice(0, 3);
    return '<div>' +
      '<section class="detail-hero" style="background:' + p.color + '">' +
        '<div class="container" style="padding-top:clamp(30px,4vw,56px);padding-bottom:clamp(30px,4vw,56px)">' +
          '<a class="back" href="' + href('programmes') + '">← All Programmes</a>' +
          '<div class="tag">' + esc(p.tag) + '</div>' +
          '<h1>' + esc(p.name) + '</h1>' +
          '<p>' + esc(p.blurb) + '</p>' +
        '</div>' +
      '</section>' +
      '<section class="container" style="padding-top:clamp(36px,5vw,64px);padding-bottom:clamp(36px,5vw,64px)">' +
        '<div class="detail-body">' +
          '<div>' +
            '<h2>About this programme</h2>' +
            '<p>' + esc(p.long) + '</p>' +
            '<h3>In-demand skills offered</h3>' +
            '<div class="skills">' + p.skills.map(function (s) { return '<span class="skill">' + esc(s) + '</span>'; }).join('') + '</div>' +
            '<h3>What you\'ll gain</h3>' +
            '<div class="gains">' + p.points.map(function (pt) {
              return '<div class="gain"><div class="check" style="background:' + p.color + '">✓</div><span class="txt">' + esc(pt) + '</span></div>';
            }).join('') + '</div>' +
          '</div>' +
          '<div>' +
            '<div class="detail-aside">' +
              '<div class="thumb"><img src="' + p.img + '" alt="' + esc(p.name) + '" loading="lazy"/></div>' +
              '<div class="spec"><span class="k">Format</span><span class="v">' + esc(p.format) + '</span></div>' +
              '<div class="spec"><span class="k">Duration</span><span class="v">' + esc(p.duration) + '</span></div>' +
              '<div class="spec"><span class="k">Level</span><span class="v">' + esc(p.level) + '</span></div>' +
              '<a class="btn" style="background:' + p.color + '" href="' + href('apply/' + p.id) + '">Apply Now →</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +
      '<section class="container" style="padding-bottom:clamp(50px,6vw,80px)">' +
        '<h3 style="font-size:22px;margin-bottom:22px">Other programmes</h3>' +
        '<div class="other-grid">' +
          others.map(function (o) {
            return '<a class="other" href="' + href('programme/' + o.id) + '"><span class="pill-tag" style="background:' + o.color + '">' + esc(o.tag) + '</span><h4>' + esc(o.name) + '</h4><span class="learn-more" style="color:' + o.color + ';display:inline-block;margin-top:12px">Learn More →</span></a>';
          }).join('') +
        '</div>' +
      '</section>' +
    '</div>';
  }

  function involvedPage() {
    return '<div>' +
      '<section class="container page-hero" style="padding-top:clamp(40px,5vw,70px);padding-bottom:clamp(20px,3vw,36px)">' +
        '<span class="eyebrow" style="color:var(--teal)">GET INVOLVED</span>' +
        '<h1>Choose how you want to support us</h1>' +
        '<p class="lead">Whether you fund training, volunteer your expertise, sponsor a programme, or collaborate with us, every contribution helps build stronger pathways into the tech ecosystem.</p>' +
      '</section>' +
      // This page is about supporting us, not joining — send would-be learners
      // to the application form rather than letting them dead-end here.
      '<section class="container">' +
        '<div class="learner-note">' +
          '<div><strong>Want to join a programme yourself?</strong>' +
          '<span>This page is for supporters and partners. Learners apply here.</span></div>' +
          '<a class="btn btn-primary btn-sm" href="' + href('apply') + '">Apply to a Programme →</a>' +
        '</div>' +
      '</section>' +
      '<section class="container section">' +
        '<div class="involve-grid">' +
          D.involve.map(function (i) {
            var cta = i.scrollTo
              ? '<button type="button" class="cta" data-scroll="' + esc(i.scrollTo) + '" style="color:' + i.color + '">' + esc(i.cta) + ' →</button>'
              : '<a class="cta" href="' + href(i.route || 'contact') + '" style="color:' + i.color + '">' + esc(i.cta) + ' →</a>';
            return '<div class="involve"><div class="mark" style="background:' + i.color + '">' + esc(i.mark) + '</div><h3>' + esc(i.title) + '</h3><p>' + esc(i.body) + '</p>' + cta + '</div>';
          }).join('') +
        '</div>' +
      '</section>' +
      '<section class="container section-lg">' +
        '<div class="volunteer-band" id="volunteer">' +
          '<div><h2>Join 100+ volunteers</h2><p>Contributing time, expertise, and support to training programmes across Nigeria\'s six geopolitical zones.</p></div>' +
          '<form class="form-dark" data-fs="volunteers"' +
            ' data-subject="New volunteer sign-up — Fortpremium website"' +
            ' data-success="Thank you! We have your details and will be in touch about volunteering." novalidate>' +
            '<input name="Full Name" aria-label="Full name" placeholder="Full name" autocomplete="name" required/>' +
            '<input name="email" aria-label="Email address" placeholder="Email address" type="email" autocomplete="email" required/>' +
            '<button type="submit">Join as a Volunteer →</button>' +
            '<p class="form-status" role="status" aria-live="polite"></p>' +
          '</form>' +
        '</div>' +
      '</section>' +
    '</div>';
  }

  function careersPage() {
    return '<div>' +
      '<section class="container page-hero" style="padding-top:clamp(40px,5vw,70px);padding-bottom:clamp(20px,3vw,36px)">' +
        '<span class="eyebrow" style="color:var(--pink)">CAREERS</span>' +
        '<h1>Build your career, change lives</h1>' +
        '<p class="lead">Join a mission-driven team where your skills create lasting impact on Africa\'s tech future. We\'re hiring across programmes, partnerships, content, creative and documentation roles.</p>' +
      '</section>' +
      '<section class="container" style="padding-bottom:clamp(40px,5vw,60px)">' +
        '<div class="jobs">' +
          D.jobs.map(function (j) {
            return '<div class="job">' +
              '<div><div class="meta"><span class="pill-tag" style="background:' + j.tagColor + '">' + esc(j.tag) + '</span><span class="loc">' + esc(j.location) + '</span></div><h3>' + esc(j.title) + '</h3><p>' + esc(j.body) + '</p></div>' +
              // job roles are hired through Contact — the #/apply form is for programme applicants
              '<div class="apply"><div class="pay">' + esc(j.pay) + '</div><div class="type">' + esc(j.type) + '</div><a class="btn-pill-dark" href="' + href('contact') + '">Apply Now →</a></div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</section>' +
      '<section class="container" style="padding-bottom:clamp(50px,6vw,80px)">' +
        '<div class="careers-cta"><h2>Don\'t see the perfect role?</h2><p>We\'re always looking for talented people who share our passion for education and technology. Send us your resume and let\'s start a conversation.</p><a class="btn" href="' + href('contact') + '">Send Us Your Resume →</a></div>' +
      '</section>' +
    '</div>';
  }

  function contactPage() {
    return '<div>' +
      '<section class="container contact-hero" style="padding-top:clamp(40px,5vw,70px);padding-bottom:clamp(50px,6vw,80px)">' +
        '<span class="eyebrow" style="color:var(--blue)">CONTACT</span>' +
        '<h1>Let\'s talk</h1>' +
        '<p class="lead">Reach out for community collaborations, institutional training requests, media opportunities, or new ideas that unlock access and innovation.</p>' +
        '<div class="contact-grid">' +
          '<div class="contact-cards">' +
            '<div class="card-quiet contact-card"><div class="k">ADDRESS</div><p>First Floor, Oke-Afa Supershoppy Building,<br/>Oke Afa, Magboro, Ogun State, Nigeria.</p></div>' +
            '<div class="card-quiet contact-card"><div class="k">PHONE</div><div class="phones"><span>080 2388 2300</span><span>081 3257 3863</span><span>081 3004 7500</span></div></div>' +
          '</div>' +
          '<form class="form-light" data-fs="general"' +
            ' data-subject="New contact message — Fortpremium website"' +
            ' data-success="Thank you — your message has been sent. We will get back to you shortly." novalidate>' +
            '<h3>Send a message</h3>' +
            '<input name="Full Name" aria-label="Full name" placeholder="Full name" autocomplete="name" required/>' +
            '<input name="email" aria-label="Email address" placeholder="Email address" type="email" autocomplete="email" required/>' +
            '<input name="Subject" aria-label="Subject" placeholder="Subject" required/>' +
            '<textarea name="Message" aria-label="Your message" placeholder="Your message" rows="4" required></textarea>' +
            '<button type="submit">Send Message →</button>' +
            '<p class="form-status" role="status" aria-live="polite"></p>' +
          '</form>' +
        '</div>' +
      '</section>' +
    '</div>';
  }

  /* ---------- router ---------- */
  var routes = {
    home: homePage, about: aboutPage, team: teamPage, programmes: programmesPage,
    involved: involvedPage, careers: careersPage, contact: contactPage
  };
  // which nav item highlights for a given route key
  var activeFor = { programme: 'programmes' };

  function parseHash() {
    var h = (location.hash || '').replace(/^#\/?/, '');
    if (!h) return { key: 'home', param: null };
    var parts = h.split('/');
    return { key: parts[0], param: parts[1] || null };
  }

  function render() {
    var r = parseHash();
    var view = document.getElementById('view');
    var html;
    if (r.key === 'programme') html = detailPage(r.param);
    else if (r.key === 'apply' && window.APPLY_FORM) html = window.APPLY_FORM.page(r.param);
    else if (routes[r.key]) html = routes[r.key]();
    else html = homePage();
    view.innerHTML = html;

    // the application form wires up its own events once it is in the DOM
    if (r.key === 'apply' && window.APPLY_FORM) window.APPLY_FORM.mount();
    // volunteer / contact forms and any scroll-to CTAs on the new page
    if (window.SITE_FORMS) window.SITE_FORMS.mount();

    // highlight active nav
    var activeKey = activeFor[r.key] || r.key;
    var links = document.querySelectorAll('[data-route]');
    for (var i = 0; i < links.length; i++) {
      links[i].classList.toggle('active', links[i].getAttribute('data-route') === activeKey);
    }
    // close mobile menu on navigation
    closeMenu();
    window.scrollTo({ top: 0 });
  }

  /* ---------- mobile menu ---------- */
  function openState(open) {
    var burger = document.getElementById('hamburger');
    var menu = document.getElementById('mobileMenu');
    if (!burger || !menu) return;
    burger.classList.toggle('open', open);
    menu.classList.toggle('open', open);
  }
  function closeMenu() { openState(false); }
  function toggleMenu() {
    var menu = document.getElementById('mobileMenu');
    openState(!menu.classList.contains('open'));
  }

  /* ---------- boot ---------- */
  function boot() {
    document.getElementById('hamburger').addEventListener('click', toggleMenu);
    window.addEventListener('hashchange', render);
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
