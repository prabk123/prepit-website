# Content TODO

This file tracks what content needs to be added to complete the website.

## Legal Pages - Content Needed ⚠️

All legal page structures are created, but content needs to be copied from PDF files in `legals/` folder.

### 1. Terms and Conditions

- **File**: `src/app/terms-and-conditions/page.tsx`
- **Source PDF**: `legals/Terms & Conditions.pdf`
- **Status**: ⚠️ Sample content added, needs completion
- **Instructions**: Copy all sections from PDF, each section should have a title and content array

### 2. Privacy Policy

- **File**: `src/app/privacy-policy/page.tsx`
- **Source PDF**: `legals/Privacy Policy.pdf`
- **Status**: ⚠️ Sample content added, needs completion

### 3. Cookie Policy

- **File**: `src/app/cookie-policy/page.tsx`
- **Source PDF**: `legals/Cookie Policy.pdf`
- **Status**: ⚠️ Sample content added, needs completion

### 4. Refund Policy

- **File**: `src/app/refund-policy/page.tsx`
- **Source PDF**: `legals/Refund Policy.pdf`
- **Status**: ⚠️ Sample content added, needs completion

### 5. Subscription Policy

- **File**: `src/app/subscription-policy/page.tsx`
- **Source PDF**: `legals/Subscription Policy.pdf`
- **Status**: ⚠️ Sample content added, needs completion

## How to Complete

1. Open each PDF file in the `legals/` folder
2. Open the corresponding `.tsx` file in `src/app/[page-name]/page.tsx`
3. Look for the `TODO` comment in each file
4. Copy the content from the PDF and structure it as shown in the example section
5. Each section needs:
   ```typescript
   {
     title: "Section Title from PDF",
     content: [
       "First paragraph",
       "Second paragraph",
       // etc.
     ]
   }
   ```
6. Update the `lastUpdated` date if needed

## Testing URLs

After adding content, test these pages:

- http://localhost:3000/terms-and-conditions
- http://localhost:3000/privacy-policy
- http://localhost:3000/cookie-policy
- http://localhost:3000/refund-policy
- http://localhost:3000/subscription-policy

## Additional Pages Complete ✅

- ✅ Homepage (`/`)
- ✅ Contact page (`/contact`) - with Slack integration
- ✅ Auth link handler (`/auth/link`)
