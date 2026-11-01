"use client";

import { useEffect, useState } from "react";
import { PRIMARY_BUTTON_CLASS, TEXT_BUTTON_CLASS } from "@/components/ui/buttons";
import {
  consentText,
  MEDIA_PREFIX,
  PRIVACY_LABELS,
  type CreatorInfo,
  type QueuedReel,
} from "@/lib/tiktok/publisher";

type Phase = { kind: "idle" } | { kind: "posting" } | { kind: "processing"; publishId: string } | { kind: "done" } | { kind: "failed"; why: string };

const LABEL = "text-small font-bold text-ink";
const FIELD = "w-full rounded-button border border-line-strong bg-surface px-4 py-3 text-body text-ink";

export default function Publisher() {
  const [creator, setCreator] = useState<CreatorInfo | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [loadError, setLoadError] = useState("");
  const [queue, setQueue] = useState<QueuedReel[]>([]);
  const [reelId, setReelId] = useState("");
  const [title, setTitle] = useState("");
  const [privacy, setPrivacy] = useState("");
  const [allowComment, setAllowComment] = useState(false);
  const [allowDuet, setAllowDuet] = useState(false);
  const [allowStitch, setAllowStitch] = useState(false);
  const [disclose, setDisclose] = useState(false);
  const [yourBrand, setYourBrand] = useState(false);
  const [branded, setBranded] = useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    fetch("/api/tiktok/creator", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        setSignedIn(Boolean(j.signedIn));
        if (j.creator) setCreator(j.creator);
        if (j.error) setLoadError(j.error);
      })
      .catch(() => setSignedIn(false));
    fetch("/api/tiktok/queue", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((q) => setQueue(Array.isArray(q) ? q : []))
      .catch(() => setQueue([]));
  }, []);

  const reel = queue.find((q) => q.id === reelId) || null;
  function chooseReel(id: string) {
    setReelId(id);
    setDuration(0);
    setTitle(queue.find((q) => q.id === id)?.caption || "");
  }

  useEffect(() => {
    if (phase.kind !== "processing") return;
    const t = setInterval(async () => {
      const j = await fetch("/api/tiktok/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publishId: phase.publishId }),
      }).then((r) => r.json()).catch(() => ({}));
      if (j.status === "PUBLISH_COMPLETE") setPhase({ kind: "done" });
      else if (j.status === "FAILED") setPhase({ kind: "failed", why: j.failReason || "TikTok couldn't post it." });
    }, 5000);
    return () => clearInterval(t);
  }, [phase]);

  if (signedIn === null) return <p className="text-body text-ink-muted">Loading…</p>;

  if (!signedIn) {
    return (
      <div className="flex w-full flex-col gap-4">
        <h1 className="text-heading font-bold">PrepIt Publisher</h1>
        <p className="text-body text-ink-muted">
          Post PrepIt&apos;s approved reels to the PrepIt TikTok account. Sign in with the TikTok account you want to post to.
        </p>
        <a href="/api/tiktok/login" className={PRIMARY_BUTTON_CLASS}>Continue with TikTok</a>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="flex w-full flex-col gap-4">
        <p className="text-body">TikTok didn&apos;t return this account&apos;s posting options{loadError ? `: ${loadError}` : "."}</p>
        <form action="/api/tiktok/logout" method="post"><button className={TEXT_BUTTON_CLASS}>Sign out</button></form>
      </div>
    );
  }

  const brandingIncomplete = disclose && !yourBrand && !branded;
  const tooLong = duration > 0 && duration > creator.max_video_post_duration_sec;
  const canPost = phase.kind === "idle" && reel && privacy && !brandingIncomplete && !tooLong;
  const privacyOptions = creator.privacy_level_options.filter((p) => !(branded && p === "SELF_ONLY"));

  async function post() {
    if (!reel) return;
    setPhase({ kind: "posting" });
    const j = await fetch("/api/tiktok/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoUrl: MEDIA_PREFIX + reel.file,
        title,
        privacy,
        disableComment: !allowComment,
        disableDuet: !allowDuet,
        disableStitch: !allowStitch,
        brandOrganic: disclose && yourBrand,
        brandedContent: disclose && branded,
      }),
    }).then((r) => r.json()).catch(() => ({ error: "Couldn't reach the server." }));
    if (j.publishId) setPhase({ kind: "processing", publishId: j.publishId });
    else setPhase({ kind: "failed", why: j.error || "TikTok couldn't post it." });
  }

  return (
    <div className="flex w-full flex-col gap-6 text-left">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={creator.creator_avatar_url} alt="" width={44} height={44} className="rounded-full" />
        <div className="flex flex-col">
          <span className="text-small text-ink-muted">Posting to</span>
          <span className="text-body font-bold">{creator.creator_nickname} (@{creator.creator_username})</span>
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className={LABEL}>Reel</span>
        <select className={FIELD} value={reelId} onChange={(e) => chooseReel(e.target.value)}>
          <option value="">Choose a reel</option>
          {queue.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}
        </select>
      </label>

      {reel && (
        <video src={MEDIA_PREFIX + reel.file} controls playsInline onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} className="aspect-[9/16] w-full rounded-card bg-black" />
      )}
      {tooLong && (
        <p className="text-small" role="alert">This reel is longer than this account can post ({creator.max_video_post_duration_sec} seconds).</p>
      )}

      <label className="flex flex-col gap-2">
        <span className={LABEL}>Caption</span>
        <textarea className={FIELD} rows={5} maxLength={2200} value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>

      <label className="flex flex-col gap-2">
        <span className={LABEL}>Who can view this video</span>
        <select className={FIELD} value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
          <option value="">Choose</option>
          {privacyOptions.map((p) => <option key={p} value={p}>{PRIVACY_LABELS[p] || p}</option>)}
        </select>
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className={LABEL}>Allow users to</legend>
        <Check label="Comment" checked={allowComment} disabled={creator.comment_disabled} onChange={setAllowComment} />
        <Check label="Duet" checked={allowDuet} disabled={creator.duet_disabled} onChange={setAllowDuet} />
        <Check label="Stitch" checked={allowStitch} disabled={creator.stitch_disabled} onChange={setAllowStitch} />
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <Check label="Disclose video content" checked={disclose} onChange={(v) => { setDisclose(v); if (!v) { setYourBrand(false); setBranded(false); } }} />
        {disclose && (
          <div className="flex flex-col gap-2 pl-6">
            <Check label="Your brand: you are promoting yourself or your own business" checked={yourBrand} onChange={setYourBrand} />
            <Check label="Branded content: you are promoting another brand or a third party" checked={branded} onChange={(v) => { setBranded(v); if (v && privacy === "SELF_ONLY") setPrivacy(""); }} />
            {brandingIncomplete && <p className="text-small text-ink-muted">Choose at least one to disclose this video.</p>}
            {(yourBrand || branded) && (
              <p className="text-small text-ink-muted">
                Your video will be labeled &quot;{branded ? "Paid partnership" : "Promotional content"}&quot;.
              </p>
            )}
          </div>
        )}
      </fieldset>

      <p className="text-small text-ink-muted">{consentText(disclose && branded)}</p>

      <button type="button" className={PRIMARY_BUTTON_CLASS} disabled={!canPost} onClick={post}>
        {phase.kind === "posting" ? "Sending to TikTok…" : "Post to TikTok"}
      </button>

      {phase.kind === "processing" && (
        <p className="text-body" role="status">Sent. TikTok is processing the video; it can take a few minutes to appear on the profile.</p>
      )}
      {phase.kind === "done" && <p className="text-body" role="status">Posted to TikTok.</p>}
      {phase.kind === "failed" && <p className="text-body" role="alert">{phase.why}</p>}

      <form action="/api/tiktok/logout" method="post"><button className={TEXT_BUTTON_CLASS}>Sign out of TikTok</button></form>
    </div>
  );
}

function Check({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={`flex items-start gap-3 text-body ${disabled ? "text-ink-muted" : ""}`}>
      <input type="checkbox" className="mt-1 h-4 w-4" checked={checked && !disabled} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}{disabled ? " (turned off in your TikTok settings)" : ""}</span>
    </label>
  );
}
