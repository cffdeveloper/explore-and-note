import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link as LinkIcon, Paperclip, Trash2, Upload, ExternalLink, FileText, Save, Loader2 } from "lucide-react";

type Attachment = {
  id: string;
  item_id: string;
  kind: "link" | "file";
  title: string | null;
  url: string;
  storage_path: string | null;
  mime_type: string | null;
  size_bytes: number | null;
};

/**
 * AttachmentsPanel — notes + links + file uploads for ANY node id
 * (top-level topic, mid subtopic, or deepest leaf).
 */
export function AttachmentsPanel({ itemId, label }: { itemId: string; label: string }) {
  const [note, setNote] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoaded(false);
    setNote("");
    setAttachments([]);
    setSavedAt(null);
    (async () => {
      const [noteRes, attRes] = await Promise.all([
        supabase.from("item_notes").select("content").eq("item_id", itemId).maybeSingle(),
        supabase.from("item_attachments").select("*").eq("item_id", itemId).order("created_at", { ascending: false }),
      ]);
      setNote(noteRes.data?.content ?? "");
      setAttachments((attRes.data ?? []) as Attachment[]);
      setLoaded(true);
    })();
  }, [itemId]);

  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      await supabase.from("item_notes").upsert({ item_id: itemId, content: note }, { onConflict: "item_id" });
      setSaving(false);
      setSavedAt(Date.now());
    }, 600);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [note, loaded, itemId]);

  const addLink = async () => {
    if (!linkUrl.trim()) return;
    let url = linkUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    const { data, error } = await supabase
      .from("item_attachments")
      .insert({ item_id: itemId, kind: "link", url, title: linkTitle.trim() || url })
      .select()
      .single();
    if (!error && data) {
      setAttachments((a) => [data as Attachment, ...a]);
      setLinkUrl("");
      setLinkTitle("");
    }
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${itemId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("blueprint").upload(path, file, {
        contentType: file.type || undefined,
      });
      if (upErr) continue;
      const { data: pub } = supabase.storage.from("blueprint").getPublicUrl(path);
      const { data, error } = await supabase
        .from("item_attachments")
        .insert({
          item_id: itemId,
          kind: "file",
          url: pub.publicUrl,
          storage_path: path,
          title: file.name,
          mime_type: file.type || null,
          size_bytes: file.size,
        })
        .select()
        .single();
      if (!error && data) setAttachments((a) => [data as Attachment, ...a]);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeAttachment = async (att: Attachment) => {
    if (att.storage_path) {
      await supabase.storage.from("blueprint").remove([att.storage_path]);
    }
    await supabase.from("item_attachments").delete().eq("id", att.id);
    setAttachments((a) => a.filter((x) => x.id !== att.id));
  };

  const isImage = (a: Attachment) => a.mime_type?.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test(a.url);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl lg:text-3xl font-display font-semibold mb-1">{label}</h2>
        <p className="text-xs text-muted-foreground font-mono">{itemId}</p>
      </div>

      {/* Note editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] uppercase tracking-widest text-gold">Notes</label>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            {saving ? <><Loader2 size={10} className="animate-spin" />saving</> :
             savedAt ? <><Save size={10} />saved</> : null}
          </span>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write your thoughts, lessons, key takeaways…"
          className="w-full min-h-48 bg-input border border-border rounded-md p-3 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold resize-y"
        />
      </div>

      {/* Add link */}
      <div>
        <label className="text-[10px] uppercase tracking-widest text-gold flex items-center gap-1.5 mb-2">
          <LinkIcon size={11} /> Add Link
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            placeholder="Title (optional)"
            className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addLink()}
            placeholder="https://…"
            className="flex-[2] bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <button
            onClick={addLink}
            className="bg-gold text-ink px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
          >
            Add
          </button>
        </div>
      </div>

      {/* Upload */}
      <div>
        <label className="text-[10px] uppercase tracking-widest text-gold flex items-center gap-1.5 mb-2">
          <Paperclip size={11} /> Attach Files / Images / PDFs
        </label>
        <label className="flex items-center justify-center gap-2 border border-dashed border-border rounded-md py-6 text-sm text-muted-foreground hover:border-gold hover:text-foreground cursor-pointer transition-colors">
          {uploading ? <><Loader2 size={14} className="animate-spin" />Uploading…</> : <><Upload size={14} />Click to upload (multi-select OK)</>}
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>
      </div>

      {/* Attachments list */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {attachments.length} attachment{attachments.length === 1 ? "" : "s"}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map((a) => (
              <div key={a.id} className="group flex items-center gap-2 border border-border rounded-md p-2 bg-card/60">
                <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {isImage(a) ? (
                    <img src={a.url} alt="" className="w-full h-full object-cover" />
                  ) : a.kind === "link" ? (
                    <LinkIcon size={14} className="text-gold" />
                  ) : (
                    <FileText size={14} className="text-gold" />
                  )}
                </div>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex-1 min-w-0 text-sm hover:text-gold truncate flex items-center gap-1"
                  title={a.title || a.url}
                >
                  <span className="truncate">{a.title || a.url}</span>
                  <ExternalLink size={11} className="opacity-60 flex-shrink-0" />
                </a>
                <button
                  onClick={() => removeAttachment(a)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/20 hover:text-destructive rounded transition-opacity"
                  aria-label="Remove"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
