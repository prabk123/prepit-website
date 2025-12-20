import type { Metadata } from "next";
import { getPublishedBlogs } from "@/lib/notion";
import BlogCard from "@/components/BlogCard";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Discover tips, recipes, and insights on meal planning, nutrition, and healthy eating from the PrepIt team.",
  openGraph: {
    title: "Blog | PrepIt",
    description:
      "Discover tips, recipes, and insights on meal planning, nutrition, and healthy eating from the PrepIt team.",
    url: "/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | PrepIt",
    description:
      "Discover tips, recipes, and insights on meal planning, nutrition, and healthy eating from the PrepIt team.",
  },
};

export default async function BlogPage() {
  const posts = await getPublishedBlogs();

  return (
    <>
      {/* Hero Section */}
      <section className="mt-16 flex w-full flex-col items-center bg-white px-4 py-10 lg:mt-16 lg:px-14 lg:py-20">
        <div className="flex w-full max-w-[1200px] flex-col items-center gap-8">
          {/* Heading */}
          <div className="flex flex-col items-center gap-4 text-center">
            <p
              className="bg-clip-text text-[28px] font-semibold leading-normal text-transparent"
              style={{
                fontFamily: "var(--font-brand)",
                WebkitTextFillColor: "transparent",
                backgroundImage:
                  "linear-gradient(90deg, rgba(128, 159, 249, 1) 0%, rgba(208, 147, 217, 1) 27.913%, rgba(243, 140, 97, 1) 55.826%, rgba(245, 204, 119, 1) 93.043%)",
                width: "fit-content",
              }}
            >
              Blog
            </p>
            <h1
              className="text-[40px] font-semibold leading-tight tracking-tight lg:text-[64px] lg:leading-[64px]"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              Latest from PrepIt
            </h1>
            <p className="max-w-[600px] text-base font-normal leading-relaxed text-[var(--grey-60)] lg:text-lg lg:leading-[27px]">
              Tips, recipes, and insights on meal planning, nutrition, and
              healthy eating.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="flex w-full flex-col items-center bg-white px-4 py-16 lg:px-20 lg:py-24">
        <div className="w-full max-w-[1200px]">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg text-[var(--grey-60)]">
                No blog posts available yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

