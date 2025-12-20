import { Client } from "@notionhq/client";
import type { BlogPost, NotionDataSourceEntry } from "@/types/notion";

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DATA_SOURCE_ID = process.env.NOTION_DATA_SOURCE_ID!;

/**
 * Calculate estimated read time for content (words per minute: 200)
 */
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Generate excerpt from markdown content
 */
function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove markdown formatting
  const plainText = content
    .replace(/#{1,6}\s/g, "") // Remove headers
    .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.+?)\*/g, "$1") // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Remove links
    .replace(/`(.+?)`/g, "$1") // Remove code
    .replace(/\n+/g, " ") // Replace newlines with spaces
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).trim() + "...";
}

/**
 * Extract rich text content from Notion property
 */
function extractRichText(property: any): string {
  if (!property || !property.rich_text) return "";
  return property.rich_text.map((text: any) => text.plain_text).join("");
}

/**
 * Extract title from Notion property
 */
function extractTitle(property: any): string {
  if (!property || !property.title) return "";
  return property.title.map((text: any) => text.plain_text).join("");
}

/**
 * Extract select value from Notion property
 */
function extractSelect(property: any): string {
  if (!property || !property.select) return "";
  return property.select.name || "";
}

/**
 * Extract date from Notion property
 */
function extractDate(property: any): string {
  if (!property || !property.date) return "";
  return property.date.start || "";
}

/**
 * Extract files/images from Notion property
 */
function extractFiles(property: any): string {
  if (!property || !property.files || property.files.length === 0) return "";
  
  const firstFile = property.files[0];
  if (firstFile.type === "external") {
    return firstFile.external?.url || "";
  } else if (firstFile.type === "file") {
    return firstFile.file?.url || "";
  }
  
  return "";
}

/**
 * Extract cover image URL from Notion entry (checks both page cover and Image property)
 */
function extractCoverImage(entry: NotionDataSourceEntry): string {
  // First check the Image property
  const imageProperty = entry.properties.Image || entry.properties.image;
  if (imageProperty) {
    const imageUrl = extractFiles(imageProperty);
    if (imageUrl) return imageUrl;
  }

  // Fall back to page cover
  if (entry.cover) {
    if (entry.cover.type === "external") {
      return entry.cover.external?.url || "";
    } else if (entry.cover.type === "file") {
      return entry.cover.file?.url || "";
    }
  }

  return "";
}

/**
 * Convert Notion blocks to Markdown
 */
async function blocksToMarkdown(pageId: string): Promise<string> {
  try {
    const blocks = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });

    let markdown = "";

    for (const block of blocks.results) {
      const blockType = (block as any).type;
      const blockContent = (block as any)[blockType];

      if (!blockContent) continue;

      switch (blockType) {
        case "paragraph":
          const paraText = blockContent.rich_text?.map((t: any) => t.plain_text).join("") || "";
          if (paraText) markdown += paraText + "\n\n";
          break;

        case "heading_1":
          const h1Text = blockContent.rich_text?.map((t: any) => t.plain_text).join("") || "";
          if (h1Text) markdown += `# ${h1Text}\n\n`;
          break;

        case "heading_2":
          const h2Text = blockContent.rich_text?.map((t: any) => t.plain_text).join("") || "";
          if (h2Text) markdown += `## ${h2Text}\n\n`;
          break;

        case "heading_3":
          const h3Text = blockContent.rich_text?.map((t: any) => t.plain_text).join("") || "";
          if (h3Text) markdown += `### ${h3Text}\n\n`;
          break;

        case "bulleted_list_item":
          const bulletText = blockContent.rich_text?.map((t: any) => t.plain_text).join("") || "";
          if (bulletText) markdown += `- ${bulletText}\n`;
          break;

        case "numbered_list_item":
          const numberedText = blockContent.rich_text?.map((t: any) => t.plain_text).join("") || "";
          if (numberedText) markdown += `1. ${numberedText}\n`;
          break;

        case "code":
          const codeText = blockContent.rich_text?.map((t: any) => t.plain_text).join("") || "";
          const language = blockContent.language || "";
          if (codeText) markdown += `\`\`\`${language}\n${codeText}\n\`\`\`\n\n`;
          break;

        case "quote":
          const quoteText = blockContent.rich_text?.map((t: any) => t.plain_text).join("") || "";
          if (quoteText) markdown += `> ${quoteText}\n\n`;
          break;

        case "divider":
          markdown += "---\n\n";
          break;

        case "image":
          const imageUrl = blockContent.file?.url || blockContent.external?.url || "";
          const caption = blockContent.caption?.map((t: any) => t.plain_text).join("") || "";
          if (imageUrl) markdown += `![${caption}](${imageUrl})\n\n`;
          break;
      }
    }

    return markdown.trim();
  } catch (error) {
    console.error(`Error converting blocks to markdown for page ${pageId}:`, error);
    return "";
  }
}

/**
 * Convert Notion data source entry to BlogPost
 */
async function entryToBlogPost(entry: NotionDataSourceEntry): Promise<BlogPost | null> {
  try {
    const properties = entry.properties;

    const title = extractTitle(properties.Title || properties.title);
    const slug = extractRichText(properties.Slug || properties.slug);
    const status = extractSelect(properties.Status || properties.status);
    const publishedDate = extractDate(
      properties["Last Updated"] || 
      properties["last updated"] || 
      properties.Date || 
      properties.date
    ) || entry.created_time;
    const coverImage = extractCoverImage(entry);

    // Only return published posts
    if (status !== "Published") {
      return null;
    }

    // Fetch content from page blocks
    const content = await blocksToMarkdown(entry.id);

    if (!title || !content || !slug) {
      const missing = [];
      if (!title) missing.push("Title");
      if (!content) missing.push("Content (page body)");
      if (!slug) missing.push("Slug");
      console.warn(`Skipping entry ${entry.id}: missing required fields: ${missing.join(", ")}`);
      console.warn(`Available properties:`, Object.keys(properties).join(", "));
      return null;
    }

    return {
      id: entry.id,
      slug,
      title,
      content,
      coverImage,
      publishedDate,
      excerpt: generateExcerpt(content),
      readTime: calculateReadTime(content),
    };
  } catch (error) {
    console.error(`Error converting entry ${entry.id}:`, error);
    return null;
  }
}

/**
 * Fetch all published blog posts from Notion data source
 */
export async function getPublishedBlogs(): Promise<BlogPost[]> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: DATA_SOURCE_ID,
      filter: {
        property: "Status",
        select: {
          equals: "Published",
        },
      },
      // Note: Remove sorts if "Date" property doesn't exist in your Notion database
      // sorts: [
      //   {
      //     property: "Date",
      //     direction: "descending",
      //   },
      // ],
    });

    // Convert entries to blog posts (now async)
    const blogPostPromises = response.results.map((entry) =>
      entryToBlogPost(entry as NotionDataSourceEntry)
    );
    const blogPostsResults = await Promise.all(blogPostPromises);
    const blogPosts = blogPostsResults.filter((post): post is BlogPost => post !== null);

    // Sort by publishedDate in JavaScript (most recent first)
    blogPosts.sort((a, b) => {
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    });

    return blogPosts;
  } catch (error) {
    console.error("Error fetching published blogs:", error);
    return [];
  }
}

/**
 * Fetch a single blog post by slug
 */
export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: DATA_SOURCE_ID,
      filter: {
        and: [
          {
            property: "Status",
            select: {
              equals: "Published",
            },
          },
          {
            property: "Slug",
            rich_text: {
              equals: slug,
            },
          },
        ],
      },
    });

    if (response.results.length === 0) {
      return null;
    }

    return await entryToBlogPost(response.results[0] as NotionDataSourceEntry);
  } catch (error) {
    console.error(`Error fetching blog post with slug "${slug}":`, error);
    return null;
  }
}

/**
 * Get all blog slugs for static path generation
 */
export async function getAllBlogSlugs(): Promise<string[]> {
  try {
    const blogs = await getPublishedBlogs();
    return blogs.map((blog) => blog.slug);
  } catch (error) {
    console.error("Error fetching blog slugs:", error);
    return [];
  }
}

/**
 * Get recent blog posts (for related posts section)
 */
export async function getRecentBlogs(limit: number = 3, excludeId?: string): Promise<BlogPost[]> {
  try {
    const blogs = await getPublishedBlogs();
    
    // Filter out the excluded post if provided
    const filteredBlogs = excludeId 
      ? blogs.filter((blog) => blog.id !== excludeId) 
      : blogs;

    return filteredBlogs.slice(0, limit);
  } catch (error) {
    console.error("Error fetching recent blogs:", error);
    return [];
  }
}

