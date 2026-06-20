(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const elements = {
    sidebar: $("#sidebar"), backdrop: $("#sidebarBackdrop"), list: $("#notesList"), count: $("#noteCount"),
    search: $("#searchInput"), title: $("#titleInput"), content: $("#contentInput"), crumb: $("#crumbTitle"),
    updated: $("#updatedAt"), reading: $("#readingTime"), words: $("#wordCount"), chars: $("#charCount"),
    save: $("#saveState"), pin: $("#pinButton"), empty: $("#emptyState"), toast: $("#toast"),
  };

  const starterNotes = [
    NoteStore.createNote({
      id: "welcome-note", title: "欢迎来到拾页", pinned: true,
      content: "你好，这里是你的私人笔记空间。\n\n写下灵感、计划，或是今天不想忘记的小事。内容会自动保存在当前浏览器中，即使关掉页面也不会消失。\n\n小提示：按 N 可以快速新建笔记，Ctrl / ⌘ + K 可以开始搜索。",
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }),
    NoteStore.createNote({
      id: "ideas-note", title: "最近的灵感", content: "• 给阳台添一盆迷迭香\n• 周末去看新的摄影展\n• 做一个只收藏好句子的文件夹",
      createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString(),
    }),
  ];

  const ACTIVE_NOTE_KEY = "shiye-active-note-v1";
  let notes = loadNotes();
  const rememberedId = localStorage.getItem(ACTIVE_NOTE_KEY);
  let activeId = notes.some((note) => note.id === rememberedId)
    ? rememberedId
    : NoteStore.sortNotes(notes)[0]?.id || null;
  let saveTimer = null;
  let toastTimer = null;

  function loadNotes() {
    const stored = localStorage.getItem(NoteStore.STORAGE_KEY);
    return stored === null ? starterNotes : NoteStore.deserialize(stored);
  }

  function persist() {
    localStorage.setItem(NoteStore.STORAGE_KEY, NoteStore.serialize(notes));
    elements.save.textContent = "已保存";
    elements.save.classList.remove("saving");
  }

  function scheduleSave() {
    elements.save.textContent = "保存中…";
    elements.save.classList.add("saving");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persist, 320);
  }

  function activeNote() { return notes.find((note) => note.id === activeId); }

  function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
  }

  function displayTitle(note) { return note?.title.trim() || "无标题笔记"; }

  function excerpt(content) {
    return content.replace(/\s+/g, " ").trim() || "还没有内容，点击开始书写…";
  }

  function formatRelative(iso) {
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    if (diff < 60000) return "刚刚";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    const today = new Date();
    if (date.getFullYear() === today.getFullYear()) return `${date.getMonth() + 1}月${date.getDate()}日`;
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
  }

  function renderList() {
    const visible = NoteStore.searchNotes(notes, elements.search.value);
    elements.count.textContent = `${notes.length} 篇`;
    if (!visible.length) {
      elements.list.innerHTML = `<div class="no-results">${notes.length ? "没有找到相关笔记<br>换个关键词试试" : "这里还空着<br>写下第一篇吧"}</div>`;
      return;
    }
    elements.list.innerHTML = visible.map((note) => {
      const stats = NoteStore.wordStats(note.content);
      return `<article class="note-card ${note.id === activeId ? "active" : ""}" data-id="${escapeHTML(note.id)}" role="listitem" tabindex="0">
        <div class="note-card-head"><h3>${escapeHTML(displayTitle(note))}</h3>${note.pinned ? '<span class="pin-mark" title="已置顶">◆</span>' : ""}</div>
        <p>${escapeHTML(excerpt(note.content))}</p>
        <div class="note-card-meta"><span>${formatRelative(note.updatedAt)}</span><span>${stats.words} 字</span></div>
      </article>`;
    }).join("");
  }

  function renderEditor() {
    const note = activeNote();
    elements.empty.hidden = Boolean(note);
    if (!note) { renderList(); return; }
    elements.title.value = note.title;
    elements.content.value = note.content;
    elements.crumb.textContent = displayTitle(note);
    elements.updated.textContent = formatRelative(note.updatedAt);
    elements.pin.classList.toggle("pinned", note.pinned);
    elements.pin.setAttribute("aria-label", note.pinned ? "取消置顶" : "置顶笔记");
    updateStats(note.content);
    renderList();
  }

  function updateStats(content) {
    const stats = NoteStore.wordStats(content);
    elements.words.textContent = `${stats.words} 字`;
    elements.chars.textContent = `${stats.chars} 字符`;
    elements.reading.textContent = stats.minutes <= 1 ? "少于 1 分钟阅读" : `约 ${stats.minutes} 分钟阅读`;
  }

  function selectNote(id) {
    if (!notes.some((note) => note.id === id)) return;
    activeId = id;
    localStorage.setItem(ACTIVE_NOTE_KEY, activeId);
    renderEditor();
    closeSidebar();
  }

  function addNote() {
    const note = NoteStore.createNote();
    notes.push(note);
    activeId = note.id;
    localStorage.setItem(ACTIVE_NOTE_KEY, activeId);
    elements.search.value = "";
    persist();
    renderEditor();
    closeSidebar();
    requestAnimationFrame(() => elements.title.focus());
    showToast("已新建一页");
  }

  function editActive(patch) {
    const result = NoteStore.updateNote(notes, activeId, patch);
    if (!result.changed) return;
    notes = result.notes;
    const note = activeNote();
    elements.crumb.textContent = displayTitle(note);
    elements.updated.textContent = "刚刚";
    updateStats(note.content);
    renderList();
    scheduleSave();
  }

  function deleteActive() {
    const note = activeNote();
    if (!note) return;
    if (!confirm(`确定删除“${displayTitle(note)}”吗？此操作无法撤销。`)) return;
    notes = NoteStore.removeNote(notes, note.id);
    activeId = NoteStore.sortNotes(notes)[0]?.id || null;
    if (activeId) localStorage.setItem(ACTIVE_NOTE_KEY, activeId);
    else localStorage.removeItem(ACTIVE_NOTE_KEY);
    persist();
    renderEditor();
    showToast("笔记已删除");
  }

  function togglePin() {
    const note = activeNote();
    if (!note) return;
    const result = NoteStore.updateNote(notes, note.id, { pinned: !note.pinned });
    notes = result.notes;
    persist();
    renderEditor();
    showToast(note.pinned ? "已取消置顶" : "已置顶");
  }

  function clearAll() {
    if (!notes.length || !confirm("确定清空所有笔记吗？此操作无法撤销。")) return;
    notes = [];
    activeId = null;
    localStorage.removeItem(ACTIVE_NOTE_KEY);
    persist();
    renderEditor();
    showToast("已清空全部笔记");
  }

  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 1800);
  }

  function openSidebar() { elements.sidebar.classList.add("open"); elements.backdrop.classList.add("show"); }
  function closeSidebar() { elements.sidebar.classList.remove("open"); elements.backdrop.classList.remove("show"); }

  $("#newNoteButton").addEventListener("click", addNote);
  $("#emptyNewNote").addEventListener("click", addNote);
  $("#deleteButton").addEventListener("click", deleteActive);
  $("#pinButton").addEventListener("click", togglePin);
  $("#clearAllButton").addEventListener("click", clearAll);
  $("#openSidebar").addEventListener("click", openSidebar);
  $("#closeSidebar").addEventListener("click", closeSidebar);
  elements.backdrop.addEventListener("click", closeSidebar);
  elements.search.addEventListener("input", renderList);
  elements.title.addEventListener("input", (event) => editActive({ title: event.target.value }));
  elements.content.addEventListener("input", (event) => editActive({ content: event.target.value }));
  elements.list.addEventListener("click", (event) => {
    const card = event.target.closest(".note-card");
    if (card) selectNote(card.dataset.id);
  });
  elements.list.addEventListener("keydown", (event) => {
    const card = event.target.closest(".note-card");
    if (card && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); selectNote(card.dataset.id); }
  });
  document.addEventListener("keydown", (event) => {
    const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openSidebar(); elements.search.focus(); }
    if (!typing && !event.ctrlKey && !event.metaKey && event.key.toLowerCase() === "n") { event.preventDefault(); addNote(); }
    if (event.key === "Escape") closeSidebar();
  });
  window.addEventListener("beforeunload", () => { if (saveTimer) persist(); });

  renderEditor();
})();
