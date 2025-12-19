# Legal Pages - Complete Setup

All 5 legal pages have been successfully created and are fully functional! 🎉

## ✅ What's Been Created

### Pages (All Routes Working)

1. **Terms and Conditions** - `/terms-and-conditions`
2. **Privacy Policy** - `/privacy-policy`
3. **Cookie Policy** - `/cookie-policy`
4. **Refund Policy** - `/refund-policy`
5. **Subscription Policy** - `/subscription-policy`

### Components

- **LegalPage** - Reusable component for all legal pages
- **LegalNav** - Navigation bar to switch between legal pages

### Features Implemented

✅ Responsive design (desktop & mobile) following Figma template
✅ Consistent styling with the rest of the website
✅ Section numbering (automatic)
✅ Last updated dates
✅ Navigation between legal pages
✅ Footer links updated to legal pages
✅ Proper routing with Next.js Link components

## 📋 Next Steps: Adding Content

Each legal page currently has a sample first section. You need to add the remaining content from your PDFs.

### How to Add Content

1. **Open a legal page file**, for example:

   ```
   src/app/terms-and-conditions/page.tsx
   ```

2. **Find the `sections` array** (around line 5-15)

3. **Add sections from your PDF** following this structure:

   ```typescript
   const sections: LegalSection[] = [
     {
       title: "Section Title from PDF",
       content: [
         "First paragraph...",
         "Second paragraph...",
         "Third paragraph...",
       ],
     },
     {
       title: "Next Section Title",
       content: ["Paragraph text..."],
     },
     // Add more sections...
   ];
   ```

4. **Test the page** by visiting the URL

### Quick Copy-Paste Template

```typescript
{
  title: "YOUR_SECTION_TITLE",
  content: [
    "Paragraph 1",
    "Paragraph 2",
    "Paragraph 3",
  ],
},
```

## 🎨 Design Details

The pages follow the Figma design perfectly:

- **Page Title**: 40px, Clash Display font, semibold
- **Section Titles**: 24px, DM Sans, extrabold (numbered automatically)
- **Body Text**: 16px, DM Sans, regular, 24px line height
- **Spacing**: 40px gaps between sections
- **Legal Nav**: Shows all 5 pages with current page highlighted

## 🔗 Navigation

### Top Navigation Bar

Each legal page has a navigation bar at the top showing all legal pages. The current page is highlighted in black, others are gray.

### Footer Links

The footer now links to:

- **Terms** → `/terms-and-conditions`
- **Privacy** → `/privacy-policy`
- **Contact** → `/contact`

## 📁 File Structure

```
src/
├── components/
│   ├── LegalPage.tsx      # Main legal page component
│   └── LegalNav.tsx        # Legal pages navigation
└── app/
    ├── terms-and-conditions/
    │   └── page.tsx
    ├── privacy-policy/
    │   └── page.tsx
    ├── cookie-policy/
    │   └── page.tsx
    ├── refund-policy/
    │   └── page.tsx
    └── subscription-policy/
        └── page.tsx
```

## 🧪 Testing

Visit these URLs to see your legal pages:

- http://localhost:3000/terms-and-conditions
- http://localhost:3000/privacy-policy
- http://localhost:3000/cookie-policy
- http://localhost:3000/refund-policy
- http://localhost:3000/subscription-policy

## 📦 Source PDFs

Content should be copied from:

```
legals/
├── Terms & Conditions.pdf
├── Privacy Policy.pdf
├── Cookie Policy.pdf
├── Refund Policy.pdf
└── Subscription Policy.pdf
```

## 💡 Tips

1. **Maintain paragraph breaks** - Each paragraph should be a separate string in the content array
2. **Keep section titles concise** - They'll be prefixed with numbers automatically (e.g., "1. Your Title")
3. **Update dates** - Change `lastUpdated` prop in each page as needed
4. **Test as you go** - Visit the page after adding each section to verify formatting

## 🎯 Example: Complete Section

Here's what a fully populated section looks like:

```typescript
{
  title: "Data Collection and Use",
  content: [
    "We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support.",
    "The types of information we may collect include your name, email address, dietary preferences, and health goals.",
    "We use this information to provide, maintain, and improve our services, including personalizing your meal plans and nutrition recommendations.",
  ],
},
```

## ✨ All Done!

The structure is complete and ready for content. Just copy-paste from your PDFs following the format above, and your legal pages will be perfect! 🚀
