# My First Wrench

Static site for **myfirstwrench.com** — Raz’s driveway car lessons for teens.

Driveway car lessons for teens.

Local HTML/CSS/JS only. No Render. No backend. No paid services.

## How to change prices and offerings

**Edit one file: `offerings.json`.**

Do not edit the HTML for a price, a package name, an include line, or the contact email. The pages fetch `offerings.json` and fill themselves.

### Change a price

Open `offerings.json`. Find the package. Change the number.

```
"id": "one-skill",
"name": "One Skill Session",
"price": 125,
```

`125` means **$125**. Save. Refresh the site. Home, Packages, Book, and the form dropdown all follow.


### Change what a package includes

Same file, same package. Edit `summary`, `hero`, `duration`, `tag`, or the `includes` list.

```
"duration": "90 min",
"summary": "Oil + filter on their car. This is the default visit, not â€œany job.â€",
"includes": [
  "Oil + filter, about 90 minutes",
  "On your vehicle, in your driveway"
]
```

Leave `"duration": ""` if you do not want a time on the price line.

### Add a new offering

1. Copy one object in the `packages` array.
2. Give it a new `"id"` â€” lowercase letters and hyphens only (`brake-clinic`).
3. Fill in `name`, `price`, `summary`, `hero`, `tag`, and `includes`.
4. Set `"featured": true` on the one package that should get the gold border. Keep the others `false`.
5. Save. Refresh. The home cards, packages page, and booking dropdown all pick it up.

Delete a package object to take it off the site.

### Change the contact email

```
"contact": {
  "email": "myfirstwrench@gmail.com",
  "cta": "Message Raz to book"
}
```

Footer, mailto, and the booking form all read this.

## Preview locally

Browsers block `fetch("offerings.json")` from a raw `file://` page. Use a tiny server:

```
node js/_serve.js
```

Then open the URL it prints (default http://127.0.0.1:8765). If that port is already taken by another copy of this site, run `set PORT=8780&& node js/_serve.js` so you are looking at this folder, not an old one.

## Drop this folder into the trusted project

Copy the whole `myfirstwrench/` folder as-is. Then GitHub, then Cloudflare Pages.

Suggested Cloudflare Pages settings:

- Framework preset: None
- Build command: (leave empty)
- Output directory: `/` of this folder (or `myfirstwrench` if this folder sits inside another repo)

Custom domain: myfirstwrench.com.

## Contact form

The book form has `name="book-a-session"` and `data-static-form-name="book-a-session"`.

Until Cloudflare Forms (or a Pages Function + email) is wired, submit opens a mailto to the address in `offerings.json` with the fields filled in, including year / make / model and VIN when they give them.

The year / make / model fields are searchable dropdowns. VIN is optional: paste 17 characters and the form looks it up through NHTSA in the browser (no backend).

Do not put Stripe keys or a server in this folder.

## Files

- `offerings.json` â€” prices, packages, email (edit this)
- `index.html` â€” home: hero, how it works, three price cards, book form
- `about.html` — mission and why Raz does this
- `packages.html` â€” full package details, jobs, other services, FAQ
- `savings.html` â€” shop vs driveway math (oil, pads, rotors)
- `lessons.html` â€” redirects to packages.html (old link)
- `book.html` â€” contact form with year / make / model + optional VIN
- `css/styles.css` â€” look
- `js/site.js` â€” loads offerings.json and fills the pages
- `js/_serve.js` â€” local preview only
- `assets/favicon.svg`
- `404.html`, `_headers`
