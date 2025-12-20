import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogBySlug, getAllBlogSlugs, getRecentBlogs } from "@/lib/notion";
import BlogContent from "@/components/BlogContent";
import BlogCard from "@/components/BlogCard";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt || post.title,
    openGraph: {
      title: `${post.title} | PrepIt`,
      description: post.excerpt || post.title,
      url: `/${post.slug}`,
      images: post.coverImage
        ? [
            {
              url: post.coverImage,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | PrepIt`,
      description: post.excerpt || post.title,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRecentBlogs(3, post.id);

  const formattedDate = new Date(post.publishedDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <>
      {/* Article Header */}
      <article className="mt-16 flex w-full flex-col items-center bg-white">
        {/* Hero Image */}
        {post.coverImage && (
          <div className="relative aspect-[16/9] w-full max-w-[1200px] overflow-hidden rounded-2xl sm:aspect-[21/9]">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>
        )}

        {/* Article Content Container */}
        <div className="w-full px-4 py-10 lg:px-14 lg:py-20">
          <div className="mx-auto w-full max-w-[800px]">
            {/* Breadcrumb */}
            <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[var(--grey-60)]">
              <Link href="/" className="hover:opacity-70">
                Home
              </Link>
              <span>/</span>
              <Link href="/blog" className="hover:opacity-70">
                Blog
              </Link>
              <span className="hidden sm:inline">/</span>
              <span className="hidden truncate text-[var(--black-100)] sm:inline">
                {post.title}
              </span>
            </nav>

            {/* Title */}
            <h1
              className="mb-6 text-[32px] font-semibold leading-tight sm:text-[40px] lg:text-[56px] lg:leading-[64px]"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="mb-10 flex flex-wrap items-center gap-3 border-b border-[var(--grey-10)] pb-6 text-sm text-[var(--grey-60)] sm:gap-4 sm:text-base">
              <time dateTime={post.publishedDate}>{formattedDate}</time>
              {post.readTime && (
                <>
                  <span>•</span>
                  <span>{post.readTime} min read</span>
                </>
              )}
            </div>

            {/* Article Content */}
            <BlogContent content={post.content} />

            {/* Share Buttons */}
            <div className="mt-12 border-t border-[var(--grey-10)] pt-8">
              <p className="mb-4 text-base font-bold">Share this article:</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    post.title
                  )}&url=${encodeURIComponent(
                    `https://prepit.app/${post.slug}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-[var(--grey-5)] px-3 py-2 text-sm font-bold transition-opacity hover:opacity-70 sm:px-4"
                  aria-label="Share on Twitter"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="hidden sm:inline">Twitter</span>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    `https://prepit.app/${post.slug}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-[var(--grey-5)] px-3 py-2 text-sm font-bold transition-opacity hover:opacity-70 sm:px-4"
                  aria-label="Share on Facebook"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="hidden sm:inline">Facebook</span>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    `https://prepit.app/${post.slug}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-[var(--grey-5)] px-3 py-2 text-sm font-bold transition-opacity hover:opacity-70 sm:px-4"
                  aria-label="Share on LinkedIn"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="hidden sm:inline">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="flex w-full flex-col items-center bg-[var(--grey-5)] px-4 py-16 lg:px-20 lg:py-24">
          <div className="w-full max-w-[1200px]">
            <h2
              className="mb-12 text-center text-[32px] font-semibold leading-tight lg:text-[40px]"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              More from our blog
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
