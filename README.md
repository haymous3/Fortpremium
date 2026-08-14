# Fortpremium International — Website

Separated static site (HTML + CSS + JS). No build step, no framework.

## Files
- `index.html` — page shell: header/nav, footer, and the routed `<main>` container.
- `styles.css` — all styling (class-based).
- `app.js` — hash-based router + page renderers + mobile menu. No dependencies.
- `data.js` — all site content (team, programmes, jobs, partners, etc.). Edit copy here.
- `apply.js` — the multi-step programme application form (`#/apply`).
- `forms.js` — the short volunteer and contact forms (inline submit, no page reload).
- `ng-lga.js` — Nigerian states and their 774 LGAs, for the form's State → LGA dropdowns.
- `assets/` — team photos.

## Running it
Because the pages are loaded by JavaScript, open it through a web server (not by double-clicking the file), e.g.:

```
cd site
python3 -m http.server 8000
# then open http://localhost:8000
```

Or just upload the whole `site/` folder to any web host (Netlify, cPanel, GitHub Pages, etc.) — `index.html` is the entry point.

## Editing content
Open `data.js` — every page's text, list items, links and image URLs live there as plain JavaScript objects. Change the strings and refresh.

## Notes on images
- **Team photos** are local files in `assets/` (offline-safe).
- **Programme, hero and gallery images** are hotlinked from Unsplash — replace the `src`/`img` URLs in `data.js` with your own hosted images before launch.
- **Partner logos**: **Pearson**, **Resource Indeed**, **Kininso Creative** and **Kininso Koncepts** are local files in `assets/`; **NYSC** and **WAEC** are hotlinked from Wikimedia Commons; **NECO** is hotlinked from Wikipedia (`upload.wikimedia.org`, a non-free logo file). Swap the hotlinked ones for your own logo files in `assets/` and update `data.js`.
  - Set `dark: true` on a partner whose logo comes on a solid black background — the tile is painted black to match, instead of showing a black box on a white card.
  - Filenames containing spaces must be `%20`-encoded in `data.js` (e.g. `assets/Kinnso%20creative.jpg`).

## Two different "partners"
`data.js` has **two** separate lists, and they must not share a key name — a duplicate
key in the same object literal silently overwrites the earlier one:
- `partners` — institutional logos ("Trusted institutional partners", About page).
- `ecosystemPartners` — the people in "Our Global Ecosystem Partners" (Team page).

## Routes
`#/home` · `#/about` · `#/team` · `#/programmes` · `#/programme/<id>` · `#/involved` · `#/careers` · `#/contact` · `#/apply` · `#/apply/<programme-id>` · `#/apply/success`
Programme ids: `padi`, `tlai`, `femtech`, `k12`.

## Application form (`#/apply`)

Every **Apply Now** button on the site opens a six-step form: Personal Details →
Contact Details → Academic Background → Technical & Infrastructure Readiness →
Course & Logistics Preferences → Review & Submit. Opening it from a programme
page (`#/apply/padi`) preselects that programme.

Answers are autosaved to the visitor's browser (`localStorage`) as they type, so
closing the tab does not lose a half-filled form. The draft is cleared only once
the application actually goes through — not at submit time — so a failed send
does not wipe their answers. The passport photo is never saved to the draft;
browsers do not allow it.

### >>> Required before launch

Where each form is delivered is set in `data.js`:

```js
formEmails: {
  volunteers: 'info@fortpremium.ng',    // Get Involved sign-up
  general:    'hello@fortpremium.ng'    // Contact page messages
},

apply: {
  recipientEmail: 'info@fortpremium.ng',   // Application form
```

Contact messages go to **hello@**; the forms that collect someone's details —
the volunteer sign-up and the application form — go to **info@**. Either
`formEmails` entry falls back to `apply.recipientEmail` when left empty.

**Each distinct address needs its own one-time FormSubmit activation** (see
below) — so both `hello@` and `info@` must be activated once each.

While no address is set the forms still render and can be filled in, but show a
notice and refuse to submit — deliberately, so nobody fills in ten minutes of
answers that go nowhere.

### How delivery works

Submissions go to **[FormSubmit.co](https://formsubmit.co)** — free, no account,
no API key, no backend to host.

1. Upload the site with the addresses above set.
2. Submit the form once yourself. FormSubmit emails that address a one-time
   activation link.
3. Click the link. From then on every application arrives automatically, with
   the passport photograph attached and a table of all the answers.

**Nothing is delivered until you complete step 3.** Applicants also get an
automatic thank-you reply, and each submission carries a reference number
(`FPA-YYMMDD-NNNN`) shown to them on the confirmation screen.

Because the photo is a file attachment, the form does a normal page POST rather
than a background request — FormSubmit does not support attachments on its AJAX
endpoint. FormSubmit redirects back to `#/apply/success` afterwards.

To swap in a different provider (Web3Forms, Formspree, your own backend), change
`endpointBase` in `data.js`; the form posts standard `multipart/form-data`.

## The other two forms

The **volunteer sign-up** (Get Involved) and **message form** (Contact) also go
through FormSubmit, handled by `forms.js`. They carry no file attachment, so
they use FormSubmit's AJAX endpoint and report success or failure inline —
no page reload, and a failed send leaves the visitor's text in the fields.

They need the same one-time activation as the application form. Because the
contact form uses `hello@` and the volunteer form uses `info@`, each address
must be activated separately.

To add another form anywhere on the site, give it `data-fs`, a `.form-status`
paragraph, and `name` attributes:

```html
<form data-fs="general" data-subject="…" data-success="…" novalidate>
  <input name="Full Name" required/>
  <input name="email" type="email" required/>
  <button type="submit">Send</button>
  <p class="form-status" role="status" aria-live="polite"></p>
</form>
```

Name the email field exactly `email` — FormSubmit uses it as the reply-to
address, so you can reply straight from your inbox. Field names become the row
labels in the email you receive, so keep them human-readable.

### Editing the form

- **Cohorts, qualifications, learning modes, experience levels** — the `apply`
  block in `data.js`. Update `cohorts` each intake.
- **Tech tracks** — pulled automatically from each programme's `skills` array,
  so adding a skill to a programme adds it as a selectable track.
- **States and LGAs** — `ng-lga.js` (37 states incl. FCT, 774 LGAs). Worth a
  spot-check against the current INEC listing before launch, as a few LGA names
  have more than one accepted spelling.
