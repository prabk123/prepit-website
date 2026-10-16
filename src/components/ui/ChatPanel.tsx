import Image from "next/image";

export type ChatPanelMessage = {
  /** The message as the nutritionist sends it. */
  text: string;
  /** The quick replies the app shows under it. */
  replies?: string[];
  /** A short line above the bubble, e.g. "8:40 am, before you asked". */
  note?: string;
};

type ChatPanelProps = {
  messages: ChatPanelMessage[];
  /** Under the panel, e.g. that the numbers are examples. */
  caption?: string;
  className?: string;
};

/**
 * Messages from the nutritionist, set the way the app's Nutritionist chat
 * shows them: the header with the PrepIt mark, white bubbles on the light
 * grey screen, quick replies as pills. The text is the app's own wording,
 * so the site shows the nutritionist talking rather than naming features.
 */
export default function ChatPanel({ messages, caption, className }: ChatPanelProps) {
  return (
    <figure className={`flex w-full min-w-0 flex-col gap-4 ${className ?? ""}`}>
      <div className="flex flex-col gap-5 rounded-card border border-line bg-surface-raised p-5 sm:p-6">
        <div className="flex items-center justify-center gap-2.5">
          <span className="relative h-7 w-7 overflow-hidden rounded-[8px]">
            <Image src="/logo.png" alt="" fill sizes="28px" className="object-contain" />
          </span>
          <span className="font-display text-card-title text-ink">Nutritionist</span>
        </div>
        {messages.map((message) => (
          <div key={message.text} className="flex flex-col items-start gap-2">
            {message.note && <p className="text-small text-ink-muted">{message.note}</p>}
            <p className="max-w-[95%] rounded-bubble rounded-bl-bubble-tail bg-surface px-4 py-3 text-small text-ink sm:px-5 sm:py-4 sm:text-body text-pretty">
              {message.text}
            </p>
            {message.replies && message.replies.length > 0 && (
              <ul aria-label="Quick replies" className="flex flex-wrap gap-2 pt-1">
                {message.replies.map((reply) => (
                  <li
                    key={reply}
                    className="rounded-control border border-line-strong bg-surface px-4 py-2 text-small font-medium text-ink"
                  >
                    {reply}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      {caption && <figcaption className="text-small text-ink-faint">{caption}</figcaption>}
    </figure>
  );
}
