import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  return (
    <div className="blog-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1
              className="mb-6 text-[28px] font-bold leading-tight sm:text-[32px] lg:text-[40px]"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className="mb-4 mt-8 text-[24px] font-bold leading-tight sm:text-[28px] lg:text-[32px]"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-3 mt-6 text-[20px] font-bold leading-tight sm:text-[24px]">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mb-3 mt-4 text-[20px] font-bold leading-[30px]">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-base leading-[24px] lg:text-lg lg:leading-[27px]">
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="break-words text-[var(--black-100)] underline hover:opacity-70"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 ml-6 list-disc space-y-2 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-6 list-decimal space-y-2 pl-5">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-base leading-[24px] lg:text-lg lg:leading-[27px]">
              {children}
            </li>
          ),
          code: ({ className, children }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="rounded bg-[var(--grey-5)] px-[6px] py-[2px] text-[14px]">
                  {children}
                </code>
              );
            }
            return (
              <code className="block overflow-x-auto rounded-lg bg-[var(--grey-5)] p-4 text-[14px]">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-4 overflow-x-auto rounded-lg bg-[var(--grey-5)] p-4">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-4 border-l-4 border-[var(--grey-10)] pl-4 text-[var(--grey-60)]">
              {children}
            </blockquote>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt || ""}
              className="mb-4 h-auto w-full rounded-lg"
            />
          ),
          table: ({ children }) => (
            <div className="mb-4 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[600px] border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[var(--grey-5)]">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b-2 border-[var(--grey-10)] px-4 py-3 text-left font-bold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-[var(--grey-10)] px-4 py-3">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-[var(--grey-5)]">{children}</tr>
          ),
          hr: () => (
            <div className="my-8">
              <hr className="border-0 border-t border-[var(--grey-10)]" />
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
