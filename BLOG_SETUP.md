# Blog Setup Guide

## ✅ Implementation Complete

The blog section has been successfully implemented with the following features:

### What's Been Built

1. **Notion Data Sources Integration** (`src/lib/notion.ts`)
   - Full integration with Notion Data Sources API
   - Functions to fetch published blogs, get blog by slug, and retrieve all slugs
   - Automatic excerpt generation and read time calculation
   - Markdown content extraction from Notion properties

2. **Blog Components**
   - `BlogCard.tsx` - Reusable card component for blog listings
   - `BlogContent.tsx` - Markdown renderer with custom styling

3. **Blog Pages**
   - `/blog` - Blog index page with grid layout
   - `/{slug}` - Dynamic blog post pages with SSG
   - Related posts section
   - Social sharing buttons (Twitter, Facebook, LinkedIn)

4. **Navigation & Footer**
   - Blog links added to main navigation (desktop & mobile)
   - Blog link added to footer under "Explore" section

5. **SEO & Metadata**
   - Dynamic sitemap generation including all blog posts
   - OpenGraph and Twitter card metadata for each post
   - Proper meta descriptions and titles

6. **Styling**
   - Blog-specific CSS extending existing design patterns
   - Consistent with PrepIt's design system (Clash Display + DM Sans fonts)
   - Responsive grid layouts matching feature section

7. **Image Optimization**
   - Next.js Image component configured for Notion-hosted images
   - Remote patterns for all Notion CDN domains

## 🔧 Required Setup

### 1. Environment Variables

Create or update your `.env.local` file with:

```env
NOTION_TOKEN=secret_xxx
NOTION_DATA_SOURCE_ID=xxx
```

**How to get these values:**

#### NOTION_TOKEN
1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Give it a name (e.g., "PrepIt Blog")
4. Select the workspace
5. Copy the "Internal Integration Token"

#### NOTION_DATA_SOURCE_ID
Option 1 (Recommended):
1. Open your blog database in Notion
2. Click the "..." menu in the top right
3. Go to "Manage data sources"
4. Click "Copy data source ID"

Option 2:
1. Get your database ID from the URL
2. Use the Notion API to retrieve data sources:
   ```bash
   curl -X GET https://api.notion.com/v1/databases/{database_id} \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Notion-Version: 2022-06-28"
   ```
3. Find the `data_sources` array in the response

### 2. Notion Database Setup

Your Notion database should have these properties:

| Property Name | Type | Description | Required |
|--------------|------|-------------|----------|
| Title | Title | Blog post title | ✅ Yes |
| Slug | Rich Text | URL slug (e.g., "my-first-post") | ✅ Yes |
| Status | Select | Status with "Published" option | ✅ Yes |
| Image | Files & Media | Cover image for the post (or use page cover) | ⚠️ Optional (but recommended) |
| Last Updated | Date | Publication/update date | ⚠️ Optional (falls back to created_time) |

**Important:** 
- Property names are **case-sensitive** and must match exactly
- The "Status" property must have a "Published" option
- Only posts with Status = "Published" will appear on the website
- **Content is written in the page body** (not a property!) - just write your blog post normally in Notion
- The page body content is automatically converted to Markdown
- Supports: headings, paragraphs, lists, code blocks, quotes, images, and dividers
- **Cover image**: Add an image to the "Image" property OR set a page cover (the Image property takes priority)

### 3. Share Database with Integration

1. Open your blog database in Notion
2. Click "Share" in the top right
3. Search for your integration name
4. Click "Invite"

## 🔧 Customizing Property Names (Optional)

If your Notion database uses different property names, you can customize them in `src/lib/notion.ts`:

```typescript
// Look for these lines around line 155:
const title = extractTitle(properties.Title || properties.title);
const slug = extractRichText(properties.Slug || properties.slug);
const status = extractSelect(properties.Status || properties.status);
const publishedDate = extractDate(properties["Last Updated"] || properties.Date) || entry.created_time;
```

You can add your custom property names:
```typescript
const title = extractTitle(properties.Title || properties.title || properties.Name);
const slug = extractRichText(properties.Slug || properties.slug || properties.URL);
const publishedDate = extractDate(properties["Your Custom Date Name"] || properties["Last Updated"]);
// etc.
```

**Note:** The code already supports "Last Updated" as the date property name!

## 🧪 Testing

### 1. Test Build Locally

```bash
# Install dependencies (already done)
yarn install

# Build the site
yarn build

# Start production server
yarn start
```

Visit:
- http://localhost:3000/blog - Blog index
- http://localhost:3000/{your-slug} - Individual post

### 2. Test Development Mode

```bash
yarn dev --turbopack
```

### 3. Verify Sitemap

After building, check:
- http://localhost:3000/sitemap.xml

Should include:
- `/blog` entry
- All published blog post entries

## 📝 Creating Your First Blog Post

1. In Notion, create a new page in your blog database
2. Fill in the required properties:
   - **Title**: "My First Blog Post"
   - **Slug**: "my-first-post"
   - **Status**: Select "Published"
   - **Image**: Upload a cover image (optional but recommended)
     - Option A: Add an image to the "Image" property
     - Option B: Set a page cover (click "Add cover" at the top of the page)
     - The Image property takes priority if both are set
   - **Last Updated**: Set publication date (optional)
3. **Write your content in the page body** - just type normally in Notion:
   - Use headings (Heading 1, Heading 2, Heading 3)
   - Add paragraphs, bullet lists, numbered lists
   - Insert code blocks, quotes, images
   - Add dividers
   - Everything will be automatically converted to Markdown!
4. Save the page
5. Rebuild your site: `yarn build`
6. Visit: `http://localhost:3000/my-first-post`

## 🎨 Content Support

The blog automatically converts Notion blocks to Markdown. Supported Notion block types:

- **Headings**: Heading 1, 2, and 3 (converted to `#`, `##`, `###`)
- **Paragraphs**: Regular text (converted to plain paragraphs)
- **Bullet Lists**: Bulleted list items (converted to `- item`)
- **Numbered Lists**: Numbered list items (converted to `1. item`)
- **Code Blocks**: Code blocks with language syntax (converted to ` ```language `)
- **Quotes**: Quote blocks (converted to `> quote`)
- **Images**: Inline images with captions (converted to `![caption](url)`)
- **Dividers**: Horizontal dividers (converted to `---`)

Just write naturally in Notion and the content will be automatically converted!

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard:
   - `NOTION_TOKEN`
   - `NOTION_DATA_SOURCE_ID`
   - `NEXT_PUBLIC_SITE_URL` (your production URL)
4. Deploy!

**Note:** The site uses Static Site Generation (SSG), so you'll need to redeploy when you publish new blog posts. You can:
- Set up automatic deployments via Notion webhooks
- Use Vercel's deploy hooks
- Manually trigger rebuilds

## 🔍 Troubleshooting

### "Could not find sort property with name or id: Date"
This error means the property names in your Notion database don't match exactly. The code now handles this gracefully by sorting in JavaScript instead.

**Solution:**
- The latest code doesn't require a "Date" property to sort
- If you see this error, refresh/rebuild and it should work
- Posts will be sorted by their `publishedDate` (which falls back to `created_time`)

### "No blog posts available"
- Check that posts have Status = "Published" (case-sensitive!)
- Verify environment variables are set correctly
- Ensure database is shared with your integration
- Check terminal for error messages
- Verify property names match exactly (Title, Slug, Status)
- **Make sure you've written content in the page body** (not in a property!)

### "Could not find property" errors
- **Property names are case-sensitive!** 
- Check that your Notion properties match: `Title`, `Slug`, `Status`
- Content comes from the page body, not a property
- You can modify property name mappings in `src/lib/notion.ts` if yours are different

### Images not loading
- **Cover images**: Add an image to the "Image" property OR set a page cover
  - The code checks the "Image" property first, then falls back to page cover
  - At least one should be set for best results
- Verify image domains are configured in `next.config.ts` (already done)
- Check that images are properly uploaded to Notion
- Look for CORS or 403 errors in browser console
- Ensure the "Image" property type is "Files & media" (not Text or URL)
- Notion-hosted images have expiring URLs - they're valid for ~1 hour, then regenerated automatically

### Build errors
- Ensure `NOTION_TOKEN` and `NOTION_DATA_SOURCE_ID` are set
- Check that all required properties exist in Notion database (Title, Slug, Status)
- Verify you've written content in the page body
- Verify Notion API version compatibility
- Make sure database is shared with your integration

## 📚 File Structure

```
src/
├── app/
│   ├── blog/
│   │   └── page.tsx          # Blog index page
│   ├── [slug]/
│   │   └── page.tsx          # Dynamic blog post page
│   └── sitemap.ts            # Updated with blog routes
├── components/
│   ├── BlogCard.tsx          # Blog card component
│   └── BlogContent.tsx       # Markdown renderer
├── lib/
│   └── notion.ts             # Notion API integration
└── types/
    └── notion.ts             # TypeScript types
```

## 🎯 Next Steps

1. Set up environment variables
2. Create your Notion database with required properties
3. Share database with your integration
4. Create your first blog post
5. Test locally with `yarn build && yarn start`
6. Deploy to production

## 📖 Resources

- [Notion API Documentation](https://developers.notion.com/reference/intro)
- [Data Sources API](https://developers.notion.com/reference/retrieve-a-data-source)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [React Markdown](https://github.com/remarkjs/react-markdown)

---

**Need help?** Check the console logs for detailed error messages during build/runtime.

