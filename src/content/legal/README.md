# Legal Content - MDX Files

This folder contains all legal page content in MDX format.

## Files

- `terms-and-conditions.mdx` - Terms and Conditions
- `privacy-policy.mdx` - Privacy Policy
- `cookie-policy.mdx` - Cookie Policy
- `refund-policy.mdx` - Refund Policy
- `subscription-policy.mdx` - Subscription Policy

## Editing

Each file has:

1. **Frontmatter** (between `---` lines) - Contains title and effective date
2. **Content** (below frontmatter) - Markdown with sections

### Example Structure

```mdx
---
title: "Your Title"
effectiveDate: "14 October 2026"
---

## First section

Your content here...

### A sub-section

More content...
```

Use sentence-case `##` headings for sections and `###` under them, never skipping a level. Pages are styled by `src/components/legal/legalMdxComponents.tsx` (the guides' Markdown styles; tables scroll inside their own box on phones), so don't add inline styles or bold headings.
