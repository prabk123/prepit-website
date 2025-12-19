# SEO Implementation Guide for PrepIt

## ✅ What's Been Implemented

### 1. Server-Side Rendering & Metadata API

- ✅ Converted `layout.tsx` to a server component
- ✅ Added Next.js Metadata API with comprehensive SEO tags
- ✅ Implemented page-specific metadata for all routes
- ✅ Added Open Graph and Twitter Card tags
- ✅ Created client components for interactive elements (NavigationWrapper, Footer, DownloadCTA)

### 2. Technical SEO Files

- ✅ Created `sitemap.ts` - Auto-generated XML sitemap at `/sitemap.xml`
- ✅ Created `robots.ts` - Search engine crawler instructions at `/robots.txt`

### 3. Structured Data (JSON-LD)

- ✅ Added Organization schema
- ✅ Added MobileApplication schema
- ✅ Implemented in `layout.tsx` for site-wide presence

### 4. Page-Specific Metadata

All pages now have optimized metadata:

- ✅ Homepage (`/`)
- ✅ Contact page (`/contact`)
- ✅ Privacy Policy (`/privacy-policy`)
- ✅ Terms & Conditions (`/terms-and-conditions`)
- ✅ Cookie Policy (`/cookie-policy`)
- ✅ Refund Policy (`/refund-policy`)
- ✅ Subscription Policy (`/subscription-policy`)

---

## 🎯 Next Steps (Action Required)

### 1. Create Open Graph Images

You need to create social media preview images for better link sharing:

**Required Image:**

- **Filename:** `og-image.png`
- **Location:** `/public/og-image.png`
- **Dimensions:** 1200 x 630 pixels
- **Format:** PNG or JPG
- **File size:** < 1MB recommended

**Design Tips:**

- Include your app logo and branding
- Use a compelling headline (e.g., "AI-Powered Meal Planning")
- Keep text large and readable (minimum 60px font)
- Use high contrast colors
- Test how it looks on Twitter, LinkedIn, and Facebook

**Tools to Create:**

- Figma (recommended)
- Canva
- Adobe Photoshop
- Online: [Bannerbear](https://www.bannerbear.com/), [Placeit](https://placeit.net/)

**Reference Your Current Design:**

- Use your hero image (`/hero_image.png`) as inspiration
- Match your brand gradient colors
- Use your ClashDisplay font for headers

---

### 2. Set Environment Variables

Create a `.env.local` file in your project root:

```bash
# Your production URL (update this with your actual domain)
NEXT_PUBLIC_SITE_URL=https://prepit.app
```

**Important:**

- Update `https://prepit.app` with your actual production domain
- For local development, you can use `http://localhost:3000`
- This URL is used for:
  - Sitemap generation
  - Canonical URLs
  - Open Graph URLs
  - Structured data

---

### 3. Add Web App Manifest (PWA Support)

Create `/public/manifest.json`:

```json
{
  "name": "PrepIt - AI-Powered Meal Planning",
  "short_name": "PrepIt",
  "description": "Plan smarter, eat better, stress less",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/logo.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/logo.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Note:** You may need to create proper icon sizes (192x192 and 512x512) for optimal PWA support.

---

### 4. Update Social Media Links

In `src/app/layout.tsx`, update the `sameAs` array in the Organization schema with your actual social media URLs:

```typescript
sameAs: [
  "https://twitter.com/prepit",      // Add your Twitter
  "https://instagram.com/prepit",    // Add your Instagram
  "https://facebook.com/prepit",     // Add your Facebook
  "https://linkedin.com/company/prepit", // Add your LinkedIn
],
```

---

### 5. Google Search Console Setup

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property (domain or URL prefix)
3. Verify ownership (via DNS, HTML file, or Google Analytics)
4. Submit your sitemap: `https://your-domain.com/sitemap.xml`
5. Monitor:
   - Indexing status
   - Search performance
   - Mobile usability
   - Core Web Vitals

---

### 6. Google Analytics Setup (Optional)

If not already done:

1. Create a Google Analytics 4 property
2. Get your Measurement ID
3. Add to your site (Vercel Analytics already provides similar insights)

---

### 7. Test Your SEO Implementation

**Before Going Live:**

1. **Meta Tags Validator:**

   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

2. **Structured Data Testing:**

   - [Google Rich Results Test](https://search.google.com/test/rich-results)
   - [Schema.org Validator](https://validator.schema.org/)

3. **General SEO:**

   - [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
   - [PageSpeed Insights](https://pagespeed.web.dev/)

4. **Local Testing:**

   ```bash
   # Build your site
   npm run build

   # Test locally
   npm run start

   # Check these URLs:
   # http://localhost:3000/sitemap.xml
   # http://localhost:3000/robots.txt
   ```

---

## 📊 Monitoring & Maintenance

### Regular Tasks:

**Weekly:**

- Check Google Search Console for errors
- Monitor Core Web Vitals
- Review search performance metrics

**Monthly:**

- Update sitemap lastModified dates for changed content
- Review and optimize page titles/descriptions based on performance
- Check for broken links
- Monitor mobile usability

**Quarterly:**

- Audit keyword rankings
- Review competitor SEO strategies
- Update content based on search trends
- Check and update Open Graph images if needed

---

## 🔍 Additional Optimizations (Future)

### Content Enhancements:

- [ ] Add a blog for content marketing
- [ ] Create FAQ page/section (great for featured snippets)
- [ ] Add testimonials/reviews with Review schema
- [ ] Create "How It Works" page with more detailed content

### Technical Enhancements:

- [ ] Implement breadcrumb navigation with BreadcrumbList schema
- [ ] Add FAQ schema to relevant pages
- [ ] Create video sitemap if you add videos
- [ ] Implement hreflang tags if supporting multiple languages
- [ ] Add canonical tags for duplicate content prevention

### Performance:

- [ ] Optimize images (already using Next.js Image - ✅)
- [ ] Implement lazy loading for below-fold content
- [ ] Consider CDN for static assets (Vercel does this automatically - ✅)
- [ ] Monitor and improve Core Web Vitals scores

---

## 📚 Resources

- [Next.js Metadata Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

---

## ✨ Quick Verification Checklist

Before deploying to production:

- [ ] Created `og-image.png` (1200x630px) in `/public/`
- [ ] Set `NEXT_PUBLIC_SITE_URL` in environment variables
- [ ] Created `/public/manifest.json`
- [ ] Updated social media links in structured data
- [ ] Tested all pages load correctly
- [ ] Verified `/sitemap.xml` is accessible
- [ ] Verified `/robots.txt` is accessible
- [ ] Tested Open Graph preview on Twitter/Facebook
- [ ] Validated structured data with Google's tool
- [ ] Set up Google Search Console
- [ ] Submitted sitemap to Google Search Console

---

## 🚀 Deployment Notes

When you deploy to Vercel/production:

1. Make sure to add `NEXT_PUBLIC_SITE_URL` to your Vercel environment variables
2. Build and deploy
3. Test all the URLs above with your production domain
4. Submit sitemap to Google Search Console
5. Monitor indexing over the next few weeks

Good luck! Your PrepIt website is now SEO-optimized! 🎉
