# Plan: الملكة — Luxury Arabic Abaya Site

## Stack note
Project is already **Vite + React + TypeScript** (TanStack Start). No Flask exists — nothing to convert. I'll use the existing stack and add Framer Motion. Routing uses TanStack Router (file-based) which is functionally equivalent to React Router for this 2-page site.

## Scope
Two routes only, Arabic RTL throughout, no auth/cart/checkout/forms/popups.

- `/` — Landing
- `/product/$id` — Product detail

## Setup
1. Add deps: `framer-motion`, `lucide-react` (icons).
2. `src/routes/__root.tsx`: set `<html lang="ar" dir="rtl">`, add Google Fonts `<link>` for Cairo + Tajawal in head (per Tailwind v4 rules — never `@import` URL in CSS).
3. `src/styles.css`: register design tokens in `@theme` — gold palette (#C9A84C, #E8C97A, #8B6914), backgrounds (#0A0A0A, #111, #161616), text (#F5F0E8, #A89880, #6B5D4F), `--font-display: Cairo`. Override shadcn dark tokens to match.
4. Tailwind v4: utilities like `bg-gold`, `text-cream`, `border-gold/20` generated from tokens. No hardcoded hex in components.

## Data
`src/data/products.ts` — 6 products (id, name, fabric, price, originalPrice, badge, colors[], images[]). Used by both pages. Product page looks up by `id` param; unknown id → 404.

## Components (`src/components/`)
- `Navbar.tsx` — fixed, transparent→solid on scroll (framer `useScroll`), crown SVG + "الملكة", RTL nav links with underline expand, mobile slide-in sheet.
- `Hero.tsx` — 60/40 split, parallax image (framer `useTransform` on scroll Y), staggered word fade-up, two CTAs, trust row.
- `Marquee.tsx` — gold strip, infinite `animate x` loop.
- `FeaturedCollection.tsx` — header + filter tabs (animated underline) + 3-col grid of `ProductCard`s + "عرض المزيد".
- `ProductCard.tsx` — #161616 card, gold border on hover, image scale, badge, quick-view overlay slide-up, links to `/product/$id`.
- `WhyUs.tsx` — 4 cards with giant faded number, SVG icons, stagger-on-scroll via `whileInView`.
- `Spotlight.tsx` — 2 alternating 50/50 sections, stars, color dots, gold CTA + WhatsApp link.
- `Testimonials.tsx` — auto-sliding horizontal carousel (5 cards), gold quote mark.
- `InstagramGrid.tsx` — 6-image grid, gold overlay + IG icon on hover, follow button.
- `Footer.tsx` — 4 columns + bottom bar, gold top border, social circles, WhatsApp CTA.

## Pages
- `src/routes/index.tsx` — composes all landing sections in order; sets head meta (title/description/og).
- `src/routes/product.$id.tsx` — uses `Route.useParams()`, looks up product; renders:
  1. Gallery (left 60%): main image with hover-zoom, thumbnail row swaps main with fade.
  2. Details (right 40%): breadcrumb, availability + delivery badges, name, stars, price/original/savings, divider, humanized description, fabric/care details, color swatches, size note ("تفصيل حسب المقاس — تواصلي معنا"), WhatsApp order CTA (gold, full-width), share row.
  3. Below: "منتجات قد تعجبك" — 3 related cards from same data.
  - notFoundComponent for invalid id.
  - Own head() meta per product (title, og:title, og:image from product image).

## Animations
All via Framer Motion: `motion.div` with `initial/animate/whileInView`, staggered children via `variants` + `staggerChildren`, parallax via `useScroll`+`useTransform`, marquee via `animate={{x:["0%","-50%"]}} transition={{repeat:Infinity, ease:"linear", duration:20}}`.

## Content
All Arabic copy hardcoded per the user spec (humanized, Libya-specific: Tripoli/Benghazi/Misrata, Libyan Dinar "دينار"). Phone/WhatsApp use the spec's placeholder format.

## Images
Use Unsplash fashion/abaya URLs as placeholders (hero, products, spotlight, IG grid, testimonials avatars). Each product gets 4-5 image URLs for gallery.

## Out of scope (explicit per user)
No auth, no cart, no checkout, no newsletter, no cookie banner, no other pages, no backend.

## Files touched
- Add: framer-motion, lucide-react deps
- Edit: `src/styles.css`, `src/routes/__root.tsx`, `src/routes/index.tsx`
- New: `src/routes/product.$id.tsx`, `src/data/products.ts`, ~10 component files in `src/components/`
