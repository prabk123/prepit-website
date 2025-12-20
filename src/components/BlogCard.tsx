import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/types/notion";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const formattedDate = new Date(post.publishedDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <Link href={`/${post.slug}`} className="group block">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col gap-3 p-6">
          {/* Meta Information */}
          <div className="flex items-center gap-3 text-sm text-[var(--grey-60)]">
            <time dateTime={post.publishedDate}>{formattedDate}</time>
            {post.readTime && (
              <>
                <span>•</span>
                <span>{post.readTime} min read</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3
            className="text-[24px] font-bold leading-tight transition-opacity group-hover:opacity-70 lg:text-[28px]"
            style={{ fontFamily: "var(--font-brand)" }}
          >
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="flex-1 text-base leading-relaxed text-[var(--grey-60)] lg:text-lg">
              {post.excerpt}
            </p>
          )}

          {/* Read More Link */}
          <div className="mt-2 flex items-center gap-2 text-sm font-bold text-[var(--black-100)]">
            <span>Read more</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform group-hover:translate-x-1"
            >
              <path
                d="M6 3L11 8L6 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
}

