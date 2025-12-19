# Open Graph Image Creation Guide

## What You Need to Create

A social media preview image that appears when your website is shared on platforms like Twitter, Facebook, LinkedIn, etc.

---

## Image Specifications

### Required File

- **Filename:** `og-image.png`
- **Location:** `/public/og-image.png`
- **Dimensions:** 1200 x 630 pixels (1.91:1 aspect ratio)
- **Format:** PNG or JPG
- **File Size:** Under 1MB (recommended under 500KB)
- **Color Mode:** RGB

---

## Design Guidelines

### Content to Include

1. **App Name/Logo:** PrepIt logo prominently displayed
2. **Tagline/Value Proposition:** "Plan smarter. Eat better. Stress less." or "AI-Powered Meal Planning"
3. **Visual Element:** App screenshot, feature preview, or branded graphics
4. **Brand Colors:** Use your gradient (blue → purple → orange → yellow)

### Typography

- **Headline:** Minimum 60px font size
- **Subtext:** Minimum 40px font size
- **Use Your Brand Font:** ClashDisplay for headers
- **High Contrast:** Ensure text is readable on all backgrounds

### Safe Zones

- Keep important content **60px from all edges**
- Some platforms crop images, so don't place critical info near edges
- Test on multiple platforms to ensure nothing important is cut off

---

## Design Examples

### Option 1: App Screenshot Focus

```
┌─────────────────────────────────────┐
│  PrepIt                             │
│  [App Logo]                         │
│                                     │
│  Plan smarter.     [App Screenshot] │
│  Eat better.       [showing UI]     │
│  Stress less.                       │
│                                     │
│  AI-Powered Meal Planning           │
└─────────────────────────────────────┘
```

### Option 2: Feature Highlight

```
┌─────────────────────────────────────┐
│                                     │
│         [PrepIt Logo]               │
│                                     │
│   AI-Powered Meal Planning &        │
│   Nutrition Tracking                │
│                                     │
│   ✓ Smart Meal Plans                │
│   ✓ Calorie Tracking                │
│   ✓ Recipe Discovery                │
│                                     │
└─────────────────────────────────────┘
```

### Option 3: Visual Impact

```
┌─────────────────────────────────────┐
│                                     │
│  [Gradient Background]              │
│                                     │
│     PrepIt                          │
│     Plan smarter. Eat better.       │
│                                     │
│  [Food/Health Imagery]              │
│                                     │
└─────────────────────────────────────┘
```

---

## Tools for Creating

### Professional Tools

- **Figma** (Recommended) - Free, easy to use
- **Canva** - Templates available
- **Adobe Photoshop**
- **Sketch** (Mac only)

### Online Tools

- [Bannerbear](https://www.bannerbear.com/tools/og-image-generator/)
- [Social Image Generator](https://www.socialimages.app/)
- [OG Image Playground](https://og-playground.vercel.app/)
- [Canva Social Media Templates](https://www.canva.com/create/social-media-graphics/)

---

## Quick Figma Tutorial

1. **Create New File**

   - Create frame: 1200 x 630px
   - Name it "OG Image"

2. **Add Background**

   - Use your brand gradient or solid color
   - Consider using a subtle pattern or texture

3. **Add Logo**

   - Export your logo from `/public/logo.png`
   - Place in top-left with 60px margin
   - Size: 80-120px height

4. **Add Text**

   - Headline: "PrepIt - AI-Powered Meal Planning"
   - Use ClashDisplay or similar bold font
   - Font size: 72px
   - Line height: 1.2

5. **Add Visual Element**

   - Screenshot of your app
   - Feature preview
   - Or abstract branded graphics

6. **Export**
   - File > Export
   - Format: PNG
   - Quality: 2x (for retina displays)
   - Save as `og-image.png`

---

## Using Your Existing Assets

You already have great assets that you can repurpose:

### From Your Public Folder:

- `hero_image.png` - App preview
- `logo.png` - Brand logo
- `banner.png` - App banner
- Feature images 1-8 - UI previews

### Design Tips Using These:

1. Take your `hero_image.png` as the main visual
2. Add a colored overlay or gradient background
3. Add your logo and tagline text
4. Crop/resize to 1200x630px

---

## Testing Your Image

After creating your image:

1. **Place it in `/public/og-image.png`**

2. **Test on Social Platforms:**

   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

3. **Check for:**

   - Text is readable
   - No important content is cropped
   - Image loads quickly
   - Colors look good on different backgrounds
   - Represents your brand well

4. **Local Testing:**

   ```bash
   # Start your dev server
   npm run dev

   # Visit http://localhost:3000
   # View page source (Ctrl+U or Cmd+U)
   # Search for "og:image" to verify it's included
   ```

---

## Platform-Specific Considerations

### Twitter

- Supports 1200x630 (summary_large_image)
- Shows image below text
- Test with: https://cards-dev.twitter.com/validator

### Facebook

- Recommended: 1200x630
- Minimum: 600x315
- Will crop to fit
- Test with: https://developers.facebook.com/tools/debug/

### LinkedIn

- Recommended: 1200x627
- Your 1200x630 will work fine
- Test with: https://www.linkedin.com/post-inspector/

### Discord

- Uses Open Graph tags
- 1200x630 works perfectly

---

## Quick Template

If you want to create something quickly, use this Canva template approach:

1. Go to Canva.com
2. Create custom size: 1200 x 630 px
3. Use "Social Media" template category
4. Customize with:
   - Your brand colors
   - Your logo
   - Your tagline
   - Your app screenshot
5. Download as PNG
6. Save to `/public/og-image.png`

---

## Need Help?

If you're not comfortable with design:

- Hire a designer on Fiverr ($10-50)
- Use a template from Canva
- Ask your team's designer
- Use AI tools like Midjourney or DALL-E for background images

---

## Example Prompt for AI Image Generation

If using AI tools for background elements:

```
"Modern gradient background for a health and nutrition app,
soft colors transitioning from blue to purple to orange,
minimal design, clean aesthetic, 1200x630 pixels, no text"
```

Then add your logo and text in Figma/Canva.

---

## Final Checklist

- [ ] Image is 1200 x 630 pixels
- [ ] File saved as `/public/og-image.png`
- [ ] File size under 1MB
- [ ] Text is readable (test at small sizes)
- [ ] Logo is visible
- [ ] Brand colors are used
- [ ] Tested on Twitter Card Validator
- [ ] Tested on Facebook Debugger
- [ ] Looks good on mobile and desktop

---

Your Open Graph image is the first impression many people will have of your app when shared on social media. Take the time to make it look great! 🎨
