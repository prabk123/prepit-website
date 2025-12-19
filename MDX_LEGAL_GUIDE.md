# MDX Legal Pages Guide

All legal pages are now set up with **MDX files** containing placeholder content that you can easily edit!

## ✅ What's Been Created

### MDX Files (Ready to Edit)

All files are in `src/content/legal/`:

1. **terms-and-conditions.mdx** - Terms and Conditions
2. **privacy-policy.mdx** - Privacy Policy
3. **cookie-policy.mdx** - Cookie Policy
4. **refund-policy.mdx** - Refund Policy
5. **subscription-policy.mdx** - Subscription Policy

## 📝 How to Edit MDX Files

### File Structure

Each MDX file has frontmatter at the top and markdown content below:

```mdx
---
title: "Your Page Title"
effectiveDate: "December 17, 2025"
---

### 1. Section Title

Your content here with **bold text**, _italic text_, and [links](https://example.com).

You can use all markdown features:

- Bullet points
- **Bold** and _italic_
- `code snippets`
- > Blockquotes

### 2. Another Section

More content...
```

### Markdown Features Supported

✅ **Bold text**: `**bold**` → **bold**
✅ _Italic text_: `*italic*` → _italic_
✅ Links: `[link text](url)` → [link text](url)
✅ Bullet lists: Start lines with `- ` or `* `
✅ Numbered lists: Start lines with `1. `, `2. `, etc.
✅ Code: Use \`backticks\` for inline code
✅ Headers: Use `###` for section titles (auto-numbered)
✅ **Tables**: Full markdown table support (see below)

### Section Numbering

Sections are automatically numbered! Just use `###` headers:

```mdx
### Agreement to Terms

### User Responsibilities

### Privacy Policy
```

Becomes:

1. Agreement to Terms
2. User Responsibilities
3. Privacy Policy

## 🎯 How to Replace Placeholder Content

### Step 1: Open the MDX file

```
src/content/legal/terms-and-conditions.mdx
```

### Step 2: Keep the frontmatter, replace content

```mdx
---
title: "Terms and Conditions"
effectiveDate: "December 17, 2025"
---

### Your First Section from PDF

Copy your content from the PDF here.

You can use **bold**, _italic_, and all markdown features.

### Your Second Section

More content...
```

### Step 3: Save and refresh

Changes appear immediately! Just save the file and refresh your browser.

## 📋 Quick Copy Template

For each section from your PDF:

```mdx
### Section Title Here

First paragraph of content.

Second paragraph with **bold text** if needed.

- Bullet point one
- Bullet point two
- Bullet point three

Another paragraph after the list.
```

## 📊 Tables in MDX

You can create tables using standard markdown syntax:

```mdx
| Column 1 | Column 2 | Column 3 |
| :------- | :------- | :------- |
| Row 1    | Data     | More     |
| Row 2    | Data     | More     |
```

**Example:**

```mdx
### Cookie Types

| Category               | Purpose                | Necessity    |
| :--------------------- | :--------------------- | :----------- |
| **Strictly Necessary** | Login and security     | **Required** |
| **Functional**         | Remember your settings | **Optional** |
| **Analytics**          | Track app performance  | **Optional** |
```

Tables are automatically styled with:

- Gray header background
- Bordered rows
- Hover effect on rows
- Responsive design

## 🧪 Test Your Pages

Visit these URLs to see your changes:

- http://localhost:3000/terms-and-conditions
- http://localhost:3000/privacy-policy
- http://localhost:3000/cookie-policy
- http://localhost:3000/refund-policy
- http://localhost:3000/subscription-policy

## 💡 Tips

1. **Keep frontmatter** - Don't delete the `---` sections at the top
2. **Use ### for sections** - Not ## or ####
3. **Preserve formatting** - Bold, italic, and lists from your PDFs
4. **No manual numbering** - Sections are numbered automatically
5. **Test as you go** - Save and refresh to see changes

## 📁 File Locations

```
src/
├── content/
│   └── legal/
│       ├── terms-and-conditions.mdx     ← Edit this
│       ├── privacy-policy.mdx            ← Edit this
│       ├── cookie-policy.mdx             ← Edit this
│       ├── refund-policy.mdx             ← Edit this
│       └── subscription-policy.mdx       ← Edit this
└── lib/
    └── loadMDX.ts                        ← Handles loading (don't edit)
```

## 🎨 Styling

All styling is already handled! The MDX content will automatically have:

- Proper typography (24px section titles, 16px body text)
- Correct spacing (40px between sections)
- Bold and italic formatting preserved
- Links styled and functional
- Lists with proper bullets

## ✨ Benefits of MDX

- ✅ **Easy to edit** - Just edit text files
- ✅ **Preserves formatting** - Bold, italic, lists all work
- ✅ **Auto-numbered sections** - No manual numbering needed
- ✅ **Instant updates** - Save file, refresh browser
- ✅ **Version control friendly** - Easy to track changes in git

## 🚀 Ready to Go!

Your legal pages are live with placeholder content. Simply:

1. Open an MDX file
2. Replace placeholder content with your actual legal text
3. Save and refresh

That's it! 🎉
