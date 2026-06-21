(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.NoteStore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const STORAGE_KEY = "shiye-notes-v1";
  const EXPORT_TYPE = "shiye-notes.export";
  const EXPORT_VERSION = 1;

  function createId() {
    return `note-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function createNote(input = {}) {
    const now = new Date().toISOString();
    return {
      id: input.id || createId(),
      title: typeof input.title === "string" ? input.title : "",
      content: typeof input.content === "string" ? input.content : "",
      pinned: Boolean(input.pinned),
      createdAt: input.createdAt || now,
      updatedAt: input.updatedAt || now,
    };
  }

  function normalizeNotes(value) {
    if (!Array.isArray(value)) return [];
    return value
      .filter((note) => note && typeof note === "object" && typeof note.id === "string")
      .map(createNote);
  }

  function createExport(notes, exportedAt = new Date().toISOString()) {
    return {
      type: EXPORT_TYPE,
      version: EXPORT_VERSION,
      exportedAt,
      notes: normalizeNotes(notes),
    };
  }

  function parseImport(raw) {
    try {
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(data)) return { ok: true, notes: normalizeNotes(data), warnings: ["legacy-array"] };
      if (!data || typeof data !== "object") return { ok: false, error: "Import file must be a JSON object." };
      if (data.type && data.type !== EXPORT_TYPE) return { ok: false, error: "This file is not a Shiye Notes export." };
      if (!Array.isArray(data.notes)) return { ok: false, error: "Import file must include a notes array." };
      return { ok: true, notes: normalizeNotes(data.notes), warnings: [] };
    } catch {
      return { ok: false, error: "Import file is not valid JSON." };
    }
  }

  function mergeNotes(existing, incoming, now = new Date().toISOString()) {
    const byId = new Map(normalizeNotes(existing).map((note) => [note.id, note]));
    normalizeNotes(incoming).forEach((note) => {
      if (!byId.has(note.id)) {
        byId.set(note.id, note);
        return;
      }
      const imported = createNote({
        ...note,
        id: `${note.id}-imported-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        title: note.title ? `${note.title} (imported)` : "Imported note",
        createdAt: now,
        updatedAt: now,
      });
      byId.set(imported.id, imported);
    });
    return sortNotes([...byId.values()]);
  }

  function sortNotes(notes) {
    return [...notes].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  function searchNotes(notes, query) {
    const needle = String(query || "").trim().toLocaleLowerCase();
    if (!needle) return sortNotes(notes);
    return sortNotes(notes).filter((note) =>
      `${note.title}\n${note.content}`.toLocaleLowerCase().includes(needle)
    );
  }

  function updateNote(notes, id, patch, now = new Date().toISOString()) {
    let changed = false;
    const next = notes.map((note) => {
      if (note.id !== id) return note;
      changed = true;
      return createNote({ ...note, ...patch, id: note.id, createdAt: note.createdAt, updatedAt: now });
    });
    return { notes: next, changed };
  }

  function removeNote(notes, id) {
    return notes.filter((note) => note.id !== id);
  }

  function serialize(notes) {
    return JSON.stringify(normalizeNotes(notes));
  }

  function deserialize(raw) {
    if (!raw) return [];
    try { return normalizeNotes(JSON.parse(raw)); }
    catch { return []; }
  }

  function wordStats(content) {
    const text = String(content || "").trim();
    const chars = Array.from(text).length;
    const han = text.match(/[\u3400-\u9fff]/g) || [];
    const latin = text.replace(/[\u3400-\u9fff]/g, " ").match(/[\p{L}\p{N}]+/gu) || [];
    const words = han.length + latin.length;
    return { chars, words, minutes: Math.max(1, Math.ceil(words / 300)) };
  }

  return { STORAGE_KEY, EXPORT_TYPE, EXPORT_VERSION, createNote, normalizeNotes, createExport, parseImport, mergeNotes, sortNotes, searchNotes, updateNote, removeNote, serialize, deserialize, wordStats };
});
