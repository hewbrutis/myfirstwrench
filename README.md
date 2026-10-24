# My First Wrench

Static site for **myfirstwrench.com** — Raz’s driveway car lessons for teens and kids.

Local HTML/CSS/JS only. No Render. No backend. No paid services.

## How to change prices and offerings

**Edit one file: `offerings.json`.**

Do not edit the HTML for a price, a package name, an include line, or the contact email. The pages fetch `offerings.json` and fill themselves.

### Change a price

Open `offerings.json`. Find the package. Change the number.

```
"id": "oil-lesson",
"name": "Oil Lesson",
"price": 85,
```

`85` means **$85**. Save. Refresh the site. Home, Packages, Book, and the form dropdown all follow.

Live menu (23 Oct 2026): Oil Lesson $85 / Core 3 $230 / Full Basics $360.

### Change the contact email

```
"contact": {
  "email": "myfirstwrench@gmail.com",
  "cta": "Message Raz to book"
}
```

Footer, mailto, and the booking form all read this.

## Preview locally

Browsers block `fetch("offerings.json")` from a raw `file://` page. Use a tiny local server, then open the URL it prints.

## Cloudflare Pages

- Framework preset: None
- Build command: (leave empty)
- Output directory: `/` of this folder

Custom domain: myfirstwrench.com.

Until Cloudflare Forms is wired, the book form opens a mailto to the address in `offerings.json`.

Do not put Stripe keys or a server in this folder.

## Files

- `offerings.json` — prices, packages, email (edit this)
- `index.html` — home
- `about.html` — mission
- `packages.html` — packages, jobs, FAQ
- `savings.html` — shop vs driveway math
- `lessons.html` — redirects to packages.html
- `book.html` — contact form
- `css/styles.css`
- `js/site.js`
- `assets/favicon.svg`
- `404.html`, `_headers`
