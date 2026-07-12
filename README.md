# Zedstreetwear — React Export

React (Vite) implementation of the Zedstreetwear homepage design.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

Build for production: `npm run build` (output in `dist/`).

## Structure

```
src/
  main.jsx                 entry point
  App.jsx                  page assembly (section order)
  styles.css               all styles (BEM-ish class names, responsive)
  data.js                  products, categories, bundles, reviews, countdown target
  components/
    ImageBox.jsx           image or striped placeholder
    Navbar.jsx             sticky nav
    Hero.jsx               full-bleed hero
    BestSellers.jsx        auto-playing slider (pauses on hover)
    Categories.jsx         black-tint scroll carousel
    FeaturedDrop.jsx       live countdown
    Sections.jsx           Marquee, Manifesto, NewArrivals, Bundles, Lookbook,
                           Promo, Reviews, Press, Instagram, UspBar
    Footer.jsx             newsletter + links
```

## Adding your images

Put photos in `public/images/` and set the `image` fields in `src/data.js`,
e.g. `image: '/images/hoodie.jpg'`. For the hero/lookbook, pass `src` to the
`<ImageBox />` in the relevant component. Placeholders render automatically
where `image` is `null`.

## Notes

- Countdown target is set in `src/data.js` (`DROP_TARGET`) — replace with a
  real drop date for production.
- Colors: background `#fafafa`, ink `#111`, muted `#999`, borders `#e5e5e5`,
  black sections `#111`, bundles section `#f0f0ef`.
- Type: Helvetica Neue stack, uppercase headings, wide letter-spacing on labels.
- Responsive breakpoints at 1024px and 640px (see bottom of `styles.css`).
