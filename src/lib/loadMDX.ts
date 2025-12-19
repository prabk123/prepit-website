import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

interface LegalFrontmatter {
  title: string;
  effectiveDate?: string;
}

export async function loadMDX(filename: string) {
  const filePath = path.join(process.cwd(), "src/content/legal", filename);
  const source = fs.readFileSync(filePath, "utf-8");

  const { content, frontmatter } = await compileMDX<LegalFrontmatter>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  });

  return {
    title: frontmatter.title,
    effectiveDate: frontmatter.effectiveDate,
    content,
  };
}
