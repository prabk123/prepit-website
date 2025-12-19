# Legal Pages Setup Guide

All legal pages have been created with the correct structure following the Figma design. You now need to populate them with content from your PDF files.

## Created Pages

1. ✅ `/terms-and-conditions` - Terms and Conditions
2. ✅ `/privacy-policy` - Privacy Policy
3. ✅ `/cookie-policy` - Cookie Policy
4. ✅ `/refund-policy` - Refund Policy
5. ✅ `/subscription-policy` - Subscription Policy

## How to Add Content

Each page uses the `LegalPage` component which accepts sections with this structure:

```typescript
{
  title: "Section Title",
  content: [
    "First paragraph...",
    "Second paragraph...",
    "Third paragraph..."
  ]
}
```

### Steps to Populate Content:

1. **Open the PDF file** from the `legals/` folder
2. **Open the corresponding page file**:

   - `src/app/terms-and-conditions/page.tsx`
   - `src/app/privacy-policy/page.tsx`
   - `src/app/cookie-policy/page.tsx`
   - `src/app/refund-policy/page.tsx`
   - `src/app/subscription-policy/page.tsx`

3. **Copy content from PDF** and add sections following this pattern:

```typescript
const sections: LegalSection[] = [
  {
    title: "First Section Title",
    content: ["Paragraph one from the PDF.", "Paragraph two from the PDF."],
  },
  {
    title: "Second Section Title",
    content: ["Another paragraph from the PDF."],
  },
  // Add more sections as needed
];
```

### Example

Looking at the Figma design, the Terms of Service section was structured like this:

```typescript
{
  title: "Agreement to Terms",
  content: [
    "By using this app, you agree to comply with these Terms of Service...",
    "You are responsible for maintaining the security of your account...",
    "We may update, modify, or discontinue parts of the app...",
  ],
}
```

Each section will be automatically numbered (1., 2., 3., etc.) by the component.

## Styling

The pages follow the Figma design with:

- **Page Title**: 40px, semibold, Clash Display font
- **Section Titles**: 24px, extrabold (H2)
- **Body Text**: 16px, regular, 24px line-height
- **Spacing**: 40px between sections

## Testing

After adding content, visit these URLs to verify:

- http://localhost:3000/terms-and-conditions
- http://localhost:3000/privacy-policy
- http://localhost:3000/cookie-policy
- http://localhost:3000/refund-policy
- http://localhost:3000/subscription-policy

## Footer Links

The footer has been updated to link to:

- Terms → `/terms-and-conditions`
- Privacy → `/privacy-policy`
- Contact → `/contact`
