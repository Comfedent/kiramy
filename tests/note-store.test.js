const test = require("node:test");
const assert = require("node:assert/strict");
const Store = require("../projects/shiye-notes/note-store.js");

test("createNote creates a complete note and keeps supplied values", () => {
  const note = Store.createNote({ id: "a", title: "标题", content: "内容", pinned: true });
  assert.equal(note.id, "a");
  assert.equal(note.title, "标题");
  assert.equal(note.pinned, true);
  assert.ok(!Number.isNaN(Date.parse(note.createdAt)));
});

test("sortNotes puts pinned notes first, then newest notes", () => {
  const notes = [
    Store.createNote({ id: "old", updatedAt: "2025-01-01T00:00:00Z" }),
    Store.createNote({ id: "new", updatedAt: "2025-03-01T00:00:00Z" }),
    Store.createNote({ id: "pin", pinned: true, updatedAt: "2024-01-01T00:00:00Z" }),
  ];
  assert.deepEqual(Store.sortNotes(notes).map((n) => n.id), ["pin", "new", "old"]);
});

test("searchNotes searches title and content without case sensitivity", () => {
  const notes = [
    Store.createNote({ id: "a", title: "Meeting Notes", content: "Friday" }),
    Store.createNote({ id: "b", title: "购物", content: "牛奶和咖啡" }),
  ];
  assert.deepEqual(Store.searchNotes(notes, "meeting").map((n) => n.id), ["a"]);
  assert.deepEqual(Store.searchNotes(notes, "咖啡").map((n) => n.id), ["b"]);
  assert.equal(Store.searchNotes(notes, "缺失").length, 0);
});

test("updateNote edits only the selected note", () => {
  const notes = [Store.createNote({ id: "a" }), Store.createNote({ id: "b" })];
  const result = Store.updateNote(notes, "b", { title: "更新" }, "2026-01-01T00:00:00Z");
  assert.equal(result.changed, true);
  assert.equal(result.notes[0].title, "");
  assert.equal(result.notes[1].title, "更新");
  assert.equal(result.notes[1].updatedAt, "2026-01-01T00:00:00Z");
});

test("removeNote deletes only matching id", () => {
  const notes = [Store.createNote({ id: "a" }), Store.createNote({ id: "b" })];
  assert.deepEqual(Store.removeNote(notes, "a").map((n) => n.id), ["b"]);
});

test("serialize and deserialize round-trip valid notes and survive bad data", () => {
  const notes = [Store.createNote({ id: "safe", title: "保留" })];
  assert.deepEqual(Store.deserialize(Store.serialize(notes)), notes);
  assert.deepEqual(Store.deserialize("{broken"), []);
  assert.deepEqual(Store.deserialize('{"unexpected":true}'), []);
});

test("export data uses a portable Shiye Notes JSON format", () => {
  const notes = [Store.createNote({ id: "safe", title: "Backup" })];
  const exported = Store.createExport(notes, "2026-06-21T00:00:00.000Z");
  assert.equal(exported.type, Store.EXPORT_TYPE);
  assert.equal(exported.version, Store.EXPORT_VERSION);
  assert.equal(exported.exportedAt, "2026-06-21T00:00:00.000Z");
  assert.deepEqual(exported.notes.map((note) => note.id), ["safe"]);
});

test("import rejects malformed JSON without throwing", () => {
  const parsed = Store.parseImport("{bad");
  assert.equal(parsed.ok, false);
  assert.match(parsed.error, /valid JSON/);
});

test("merge import keeps existing notes and adds imported notes", () => {
  const existing = [Store.createNote({ id: "existing", title: "Keep me" })];
  const incoming = [Store.createNote({ id: "incoming", title: "Bring me" })];
  const merged = Store.mergeNotes(existing, incoming, "2026-06-21T00:00:00.000Z");
  assert.deepEqual(new Set(merged.map((note) => note.id)), new Set(["existing", "incoming"]));
});

test("wordStats counts Chinese characters and latin words", () => {
  assert.deepEqual(Store.wordStats("你好 hello world"), { chars: 14, words: 4, minutes: 1 });
  assert.deepEqual(Store.wordStats(""), { chars: 0, words: 0, minutes: 1 });
});
