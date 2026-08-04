# Fortpremium International — Website

Separated static site (HTML + CSS + JS). No build step, no framework.

## Files
- `index.html` — page shell: header/nav, footer, and the routed `<main>` container.
- `styles.css` — all styling (class-based).
- `app.js` — hash-based router + page renderers + mobile menu. No dependencies.
- `data.js` — all site content (team, programmes, jobs, partners, etc.). Edit copy here.
- `apply.js` — the multi-step programme application form (`#/apply`).
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
- **Partner logos**: **Pearson** is a local file (`assets/pearson.jpg`); **NYSC** and **WAEC** are hotlinked from Wikimedia Commons; **NECO** is hotlinked from Wikipedia (`upload.wikimedia.org`, a non-free logo file). Swap the hotlinked ones for your own logo files in `assets/` and update `data.js`.

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

Open `data.js`, find the `apply:` block, and set `recipientEmail` to the address
that should receive applications:

```js
apply: {
  recipientEmail: 'admissions@fortpremium.com',   // <-- set this
```

While it is empty the form still renders and can be filled in, but shows a
notice and refuses to submit — deliberately, so nobody fills in ten minutes of
answers that go nowhere.

### How delivery works

Submissions go to **[FormSubmit.co](https://formsubmit.co)** — free, no account,
no API key, no backend to host.

1. Set `recipientEmail` as above and upload the site.
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

### Editing the form

- **Cohorts, qualifications, learning modes, experience levels** — the `apply`
  block in `data.js`. Update `cohorts` each intake.
- **Tech tracks** — pulled automatically from each programme's `skills` array,
  so adding a skill to a programme adds it as a selectable track.
- **States and LGAs** — `ng-lga.js` (37 states incl. FCT, 774 LGAs). Worth a
  spot-check against the current INEC listing before launch, as a few LGA names
  have more than one accepted spelling.
