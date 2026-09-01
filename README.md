# Veloura profile directory

The application described below is implemented in this repository. See [SETUP.md](SETUP.md) for environment configuration, administrator creation, local startup, optional clearly marked demo data, verification, and production notes.

## Original product specification

Build a production-ready, modern, premium **location-based profile directory website** using:

* Node.js
* Express.js
* EJS
* MongoDB with Mongoose
* Cloudinary for image storage
* HTML5
* CSS3
* Vanilla JavaScript
* Bootstrap 5 or Tailwind CSS only if it improves the design without adding unnecessary complexity

Do NOT use React, Vite, Next.js, or another frontend framework.

## 1. PROJECT GOAL

Create a highly polished, mobile-first directory platform where users can discover profiles by city and category.

There must be **NO booking/order system**.

The primary conversion action on a profile should be:

**“Chat on WhatsApp”**

The WhatsApp button should open WhatsApp using the profile's stored WhatsApp number.

The platform must be designed as a compliant directory and include appropriate moderation, reporting, age/consent safeguards, privacy protections, and prohibited-content controls according to applicable laws and platform policies.

---

# 2. DESIGN DIRECTION

The website must look like a **premium modern luxury directory**, not like an old-fashioned classifieds website.

The first impression should be:

* Premium
* Elegant
* Modern
* Trustworthy
* Visually attractive
* Clean
* Fast
* Mobile-friendly
* High-end

Use a sophisticated visual system with carefully selected colors that feel attractive and comfortable to look at.

Suggested direction:

* Deep charcoal / near-black foundation
* Warm champagne/gold accent for premium elements
* Soft neutral backgrounds
* White/cream typography where appropriate
* Subtle gradients
* Soft shadows
* Elegant borders
* Large high-quality imagery
* Rounded cards
* Subtle glass/blur effects where appropriate
* Excellent spacing and typography

Do NOT overuse gradients, animations, glowing effects, or gold.

The UI should feel expensive and refined.

Use a strong font pairing such as Inter + Playfair Display or another modern premium combination.

Use CSS variables for the entire design system so colors can easily be changed later.

---

# 3. RESPONSIVE DESIGN

The entire website must be responsive.

Optimize specifically for:

* Mobile
* Tablet
* Laptop
* Large desktop

Mobile experience is extremely important.

Cards, filters, navigation, image galleries, buttons and typography must adapt properly.

Avoid horizontal scrolling.

---

# 4. PUBLIC WEBSITE STRUCTURE

Create these pages:

### Home

`/`

Sections:

1. Premium hero section
2. Search by city
3. Search by category
4. Featured/VVIP profiles
5. VIP profiles
6. HOT profiles
7. Popular cities
8. Popular categories
9. Recently added profiles
10. Trust/safety information
11. Footer

Hero should have a large elegant heading and a powerful search interface:

* Select city
* Select category
* Search button

Use beautiful profile cards.

---

# 5. CITY PAGES

Create SEO-friendly dynamic city pages:

```text
/delhi
/mumbai
/bangalore
/pune
...
```

The actual cities must come dynamically from MongoDB.

Each city page should display:

* City name
* Unique SEO heading
* Introductory city content
* Featured profiles
* VVIP profiles
* VIP profiles
* HOT profiles
* Normal profiles
* Categories available in that city
* Pagination
* Breadcrumbs

Do NOT hardcode city names.

---

# 6. CATEGORY PAGES

Create:

```text
/category/:categorySlug
```

Example:

```text
/category/bhabhi
```

Categories must be managed completely from the admin panel.

Admin must be able to:

* Create
* Read
* Update
* Delete
* Enable/disable
* Change slug
* Change description
* Set SEO title
* Set SEO description

---

# 7. CITY + CATEGORY SEO PAGES

This is extremely important.

Create dynamic pages:

```text
/:citySlug/:categorySlug
```

Example:

```text
/delhi/bhabhi
/mumbai/bhabhi
```

These pages must show ONLY relevant profiles matching:

* Selected city
* Selected category

Do not redirect these users to the homepage.

If a user arrives from Google directly on:

```text
/delhi/bhabhi
```

they should immediately see the Delhi + selected category listings.

Only generate/index pages that contain useful, meaningful listings/content. Avoid creating thousands of thin or empty SEO pages.

---

# 8. PROFILE PAGES

Create:

```text
/profile/:profileSlug
```

Profile page should include:

* Large image gallery
* Main profile image
* Thumbnail gallery
* Profile name
* City
* Category
* VIP/VVIP/HOT badge
* Description
* Relevant profile information
* WhatsApp CTA
* Optional phone CTA
* Report profile button
* Related profiles
* Breadcrumbs

The main CTA should be:

### Chat on WhatsApp

Generate the WhatsApp link safely from the stored number.

Do not expose unnecessary sensitive information.

---

# 9. PROFILE CARD DESIGN

Create beautiful premium profile cards.

Each card should contain:

* High-quality image
* Profile name
* City
* Category
* Badge
* Short description
* WhatsApp CTA
* View Profile CTA

Badge hierarchy:

```text
VVIP
VIP
HOT
NORMAL
```

Make VVIP visually premium but not excessively flashy.

Use subtle hover animations.

Images should use:

* Proper aspect ratio
* `object-fit: cover`
* Lazy loading
* Responsive sizing
* Modern rounded corners

---

# 10. ADMIN PANEL

Create a secure admin dashboard.

Routes:

```text
/admin
/admin/login
/admin/profiles
/admin/profiles/create
/admin/profiles/edit/:id
/admin/categories
/admin/cities
/admin/media
/admin/settings
/admin/reports
```

Admin dashboard must be clean, modern and extremely easy to operate.

---

# 11. ADMIN PROFILE CRUD

Full CRUD is mandatory.

### CREATE

Admin can create a profile with:

* Name
* Slug
* City
* Category
* Description
* Phone
* WhatsApp number
* Badge
* Featured status
* Publication status
* Photos
* SEO title
* SEO description

### READ

Admin can:

* Search profiles
* Filter by city
* Filter by category
* Filter by badge
* Filter by status
* Sort by newest/oldest
* View profile

### UPDATE

Admin can modify every profile field.

### DELETE

Support deletion with confirmation.

Prefer soft-delete where appropriate so accidental deletion can be recovered.

---

# 12. IMAGE MANAGEMENT

Use Cloudinary.

Do NOT store image binary data in MongoDB.

MongoDB should store Cloudinary metadata such as:

* URL
* Public ID
* Profile ID
* Main image status
* Sort order

Admin must be able to:

* Upload multiple images
* Change main image
* Reorder images
* Delete image
* Replace image

Validate:

* File type
* File size
* Image dimensions
* Upload count

Optimize images automatically using Cloudinary transformations.

---

# 13. CATEGORY CRUD

Admin can:

* Add category
* Edit category
* Delete category
* Enable/disable category
* Change category slug
* Add category description
* Set SEO title
* Set SEO description

---

# 14. CITY CRUD

Admin can:

* Add city
* Edit city
* Delete city
* Enable/disable city
* Change slug
* Add city description
* Set SEO title
* Set SEO description

---

# 15. BADGES / TAGS

Support:

```text
NORMAL
HOT
VIP
VVIP
```

Admin can assign badge to any profile.

Also allow a future-ready system for additional tags without changing the database architecture.

---

# 16. FEATURED PROFILES

Admin can mark profiles as:

```text
Featured = true/false
```

Featured profiles should appear in selected sections on the homepage and relevant city/category pages.

---

# 17. SEARCH & FILTER

Create a fast search system.

Users should be able to search:

* City
* Category
* Profile name

Filters:

* City
* Category
* Badge
* Featured

Use pagination.

Do not load thousands of profiles into the browser at once.

Use MongoDB indexes for frequently searched fields.

---

# 18. SEO — VERY IMPORTANT

SEO must be treated as a core feature, not an afterthought.

Every indexable page must have unique:

* `<title>`
* Meta description
* Canonical URL
* H1
* Open Graph title
* Open Graph description
* Open Graph image
* Twitter card metadata where appropriate

Create dynamic SEO metadata from MongoDB.

---

# 19. SEO URL STRUCTURE

Use clean URLs:

```text
/
/delhi
/mumbai
/category/bhabhi
/delhi/bhabhi
/profile/profile-name
```

Use lowercase slugs.

Do not use:

```text
/profile?id=123
/page.php?id=123
```

for public profile pages.

---

# 20. SITEMAP

Create dynamic:

```text
/sitemap.xml
```

Include:

* Homepage
* Published city pages
* Active category pages
* Valid city/category pages
* Published profile pages

Do not include:

* Draft pages
* Deleted profiles
* Hidden profiles
* Empty/thin pages

Also create:

```text
/robots.txt
```

---

# 21. STRUCTURED DATA

Implement appropriate JSON-LD structured data where valid and supported.

Potential types include:

* WebSite
* BreadcrumbList
* ProfilePage where appropriate
* ItemList for listing pages

Do NOT add misleading or unsupported schema markup.

---

# 22. INTERNAL LINKING

Create strong internal linking:

Home
→ Cities
→ City
→ Categories
→ City + Category
→ Profiles
→ Related profiles

Every profile page should link to:

* Its city page
* Its category page
* Relevant related profiles

Every city page should link to relevant categories.

---

# 23. SEO CONTENT MANAGEMENT

Admin should be able to edit:

### City SEO

* SEO Title
* Meta Description
* H1
* Intro Content

### Category SEO

* SEO Title
* Meta Description
* H1
* Description

### City + Category

Generate sensible metadata dynamically, while allowing admin override if needed.

### Profile SEO

* SEO Title
* Meta Description
* OG image

Avoid duplicate metadata.

---

# 24. GOOGLE SEO QUALITY

Do NOT promise or hardcode “#1 Google ranking”.

Build for strong technical SEO:

* Fast loading
* Mobile-first
* Semantic HTML
* Clean URLs
* Server-rendered HTML through EJS
* Unique useful content
* Internal linking
* Canonicals
* Sitemap
* Robots.txt
* Structured data
* Image optimization
* Good Core Web Vitals

Only index pages that provide genuine value.

---

# 25. DATABASE

Use MongoDB + Mongoose.

Create models approximately:

```text
Admin
Profile
ProfileImage
Category
City
Report
SeoPage
```

Profile model should support:

```text
name
slug
city
category
description
phone
whatsapp
badge
featured
status
images
seoTitle
seoDescription
createdAt
updatedAt
```

Use references where appropriate.

Add MongoDB indexes for:

* slug
* city
* category
* badge
* status
* featured

Ensure public queries only return published profiles.

---

# 26. SECURITY

Implement:

* Secure admin authentication
* Password hashing
* Session-based authentication
* HTTP-only cookies
* CSRF protection where applicable
* Helmet
* Rate limiting
* Input validation
* MongoDB query sanitization
* XSS protection
* Secure headers
* File upload validation
* Admin authorization middleware
* Environment variables
* No secrets in source code

Create:

```text
.env
```

for:

```text
MONGODB_URI
SESSION_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

Never commit `.env`.

---

# 27. MODERATION & SAFETY

Because this is a sensitive directory category, include:

* Report Profile
* Admin moderation
* Publish/unpublish control
* Prohibited-content handling
* Age/consent safeguards
* Privacy-conscious profile fields
* Clear terms/privacy pages
* Abuse/spam protection

Do not implement features intended to facilitate exploitation, trafficking, coercion, or illegal activity.

---

# 28. PERFORMANCE

Optimize for speed.

Use:

* Server-side rendered EJS pages
* Lazy-loaded images
* Cloudinary optimized images
* Pagination
* MongoDB indexes
* HTTP caching where appropriate
* Minified CSS/JS in production
* Compression
* Efficient database queries

Avoid unnecessary frontend JavaScript.

---

# 29. ERROR PAGES

Create attractive:

```text
404
500
403
```

pages matching the site's design.

---

# 30. LEGAL / INFORMATION PAGES

Create:

```text
/about
/contact
/privacy-policy
/terms
/report
```

Keep the footer professional.

---

# 31. CODE QUALITY

Use a clean architecture:

```text
project/
│
├── app.js
├── package.json
├── .env
│
├── config/
│   ├── db.js
│   └── cloudinary.js
│
├── models/
│   ├── Admin.js
│   ├── Profile.js
│   ├── Category.js
│   ├── City.js
│   ├── ProfileImage.js
│   └── Report.js
│
├── controllers/
│
├── routes/
│   ├── public.js
│   ├── admin.js
│   ├── profiles.js
│   ├── categories.js
│   └── cities.js
│
├── middleware/
│
├── views/
│   ├── layouts/
│   ├── partials/
│   ├── public/
│   └── admin/
│
├── public/
│   ├── css/
│   ├── js/
│   └── images/
│
└── utils/
```

Use controllers/services where useful instead of putting all logic inside routes.

---

# 32. UI DETAILS

Use:

* Elegant navigation
* Sticky header
* Beautiful hero section
* Premium cards
* Smooth hover states
* Skeleton loading where useful
* Toast notifications in admin
* Confirmation modals
* Empty states
* Pagination
* Breadcrumbs
* Mobile navigation drawer
* Accessible buttons
* Proper focus states
* Good contrast
* Responsive image galleries

Do not make the interface visually noisy.

---

# 33. IMPORTANT IMPLEMENTATION RULE

Do not create fake data and pretend the functionality works.

Build the actual:

* MongoDB connection
* Mongoose models
* Express routes
* CRUD APIs
* EJS rendering
* Cloudinary upload
* Admin authentication
* Search
* Filtering
* Pagination
* SEO metadata
* Sitemap
* Robots.txt
* WhatsApp links

Use seed/demo data only if clearly marked as demo data.

---

# 34. DEVELOPMENT PROCESS

Implement in this order:

### Phase 1

Project setup + Express + EJS + MongoDB

### Phase 2

Admin authentication

### Phase 3

Profile CRUD

### Phase 4

Category CRUD

### Phase 5

City CRUD

### Phase 6

Cloudinary image management

### Phase 7

Public homepage

### Phase 8

City/category/profile pages

### Phase 9

Search/filter/pagination

### Phase 10

SEO system + sitemap + robots

### Phase 11

Security + validation + moderation

### Phase 12

Performance optimization + final responsive polish

---

# 35. FINAL REQUIREMENT

The final website should feel like a **real production-grade premium directory**, not a basic CRUD demo.

Prioritize:

1. Beautiful UI
2. Excellent mobile experience
3. Fast performance
4. Strong technical SEO
5. Clean URLs
6. Easy admin management
7. Reliable CRUD
8. Secure authentication
9. Cloudinary image management
10. Direct WhatsApp conversion

Before finishing, test:

* Creating a profile
* Editing a profile
* Deleting a profile
* Uploading/replacing/deleting images
* Creating/editing/deleting category
* Creating/editing/deleting city
* Assigning HOT/VIP/VVIP
* Publishing/unpublishing
* WhatsApp button
* City pages
* Category pages
* City + category pages
* Profile pages
* Search
* Filters
* Pagination
* Sitemap
* Robots.txt
* Canonical URLs
* Mobile responsiveness
* 404/500 pages
* Admin authentication
* Unauthorized admin access

Do not stop after creating the UI. Connect all functionality end-to-end and make the application runnable locally with clear setup instructions.
