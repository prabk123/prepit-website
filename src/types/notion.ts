export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string; // Markdown string from Notion
  coverImage: string;
  publishedDate: string;
  excerpt?: string;
  readTime?: number;
}

export interface NotionDataSourceEntry {
  id: string;
  properties: {
    [key: string]: any;
  };
  cover?: {
    type: string;
    [key: string]: any;
  } | null;
  created_time: string;
  last_edited_time: string;
}

