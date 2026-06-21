(() => {
  const path = window.location.pathname;
  const isChinese = path === "/zh" || path.startsWith("/zh/");
  const preferred = localStorage.getItem("kira-language");

  const englishPath = isChinese ? (path.replace(/^\/zh(?=\/|$)/, "") || "/") : path;
  const chinesePath = isChinese ? path : `/zh${path === "/" ? "/" : path}`;

  if (preferred === "zh" && !isChinese) {
    window.location.replace(`${chinesePath}${window.location.search}${window.location.hash}`);
    return;
  }
  if (preferred === "en" && isChinese) {
    window.location.replace(`${englishPath}${window.location.search}${window.location.hash}`);
    return;
  }

  const style = document.createElement("style");
  style.textContent = `
    .kira-language-switch{position:fixed;right:18px;bottom:18px;z-index:9999;display:inline-flex;align-items:center;gap:7px;padding:10px 14px;border:1px solid rgba(20,30,27,.22);border-radius:999px;background:rgba(255,253,247,.94);color:#17372f;font:700 12px/1.2 system-ui,sans-serif;text-decoration:none;box-shadow:0 9px 30px rgba(18,40,32,.16);backdrop-filter:blur(14px)}
    .kira-language-switch:hover{transform:translateY(-1px);box-shadow:0 12px 34px rgba(18,40,32,.2)}
    .kira-language-switch span{opacity:.45}
    @media(max-width:560px){.kira-language-switch{right:12px;bottom:12px;padding:9px 12px}}
  `;
  document.head.appendChild(style);

  const link = document.createElement("a");
  link.className = "kira-language-switch";
  link.href = isChinese ? englishPath : chinesePath;
  link.setAttribute("aria-label", isChinese ? "Switch to English" : "切换为中文");
  link.innerHTML = isChinese ? `中文 <span>/</span> EN` : `EN <span>/</span> 中文`;
  link.addEventListener("click", () => localStorage.setItem("kira-language", isChinese ? "en" : "zh"));
  document.body.appendChild(link);

  const dynamicZh = [
    [/^You have (RM .+) of breathing room\.$/, "你每月有 $1 的可支配余量。"],
    [/^Your plan has a (RM .+) monthly gap\.$/, "你的计划每月有 $1 的缺口。"],
    [/^That is (.+) of take-home pay available for savings or flexibility each month\.$/, "这相当于到手收入的 $1，可用于储蓄或灵活开支。"],
    [/^At this pace, your (RM .+) emergency fund is about (.+) months? away\.$/, "按当前速度，距离 $1 应急基金目标约还有 $2 个月。"],
    [/^Move (RM .+) to savings right after payday, not at month-end\.$/, "发薪后立即将 $1 转入储蓄，而不是等到月底。"],
    [/^(\d+) yrs$/, "$1 年"],
    [/^At age (\d+) · In (\d+) years$/, "$1 岁退休 · 距今 $2 年"],
    [/^Based on 20-year drawdown · (.+) ÷ 240 months$/, "按 20 年提取期估算 · $1 ÷ 240 个月"],
    [/^(RM[\d,.]+) \/ month$/, "$1 / 月"],
    [/^(\d+)y (\d+)m$/, "$1 年 $2 个月"],
    [/^(\d+) months total$/, "共 $1 个月"],
    [/^💡 Tip: Paying (RM[\d,.]+)\/month instead would clear your loan (\d+) months earlier and save (RM[\d,.]+) in interest\.$/, "💡 提示：若改为每月偿还 $1，可提前 $2 个月还清，并节省 $3 利息。"],
    [/^Over (\d+) years, the better option is$/, "未来 $1 年，更合适的选择是"],
    [/^You save (RM[\d,.]+) compared to renting$/, "与租房相比可节省 $1"],
    [/^You save (RM[\d,.]+) compared to buying$/, "与买房相比可节省 $1"],
  ];
  const exactZh = {
    "Strong foundation": "基础稳健", "Workable plan": "计划可行", "Needs breathing room": "需要更多余量", "Reset the pressure": "需要重新调整",
    "You have room to build.": "你还有成长空间。", "It works, but it is tight.": "可以维持，但较为紧张。", "This is a strong start.": "这是一个稳健的开始。", "The numbers need a reset.": "这些数字需要重新调整。",
    "Automate your first transfer": "自动完成第一笔转账", "Wait before buying a car": "暂缓购车", "Keep commitments light": "保持较低固定负担", "Name the finish line": "明确目标终点", "Close the monthly gap": "先填补每月缺口",
    "First payslip decoded": "看懂第一张工资单", "First RM 1,000": "第一个 RM 1,000", "Emergency fund": "应急基金", "Next big decision": "下一个重要决定",
    "Plan saved on this device": "计划已保存在此设备", "No saved plan yet — let’s make one": "还没有已保存的计划——现在开始制定",
    "Buying": "买房", "Renting": "租房",
    "✓ First-time buyer exemption applied — full stamp duty waiver on MOT and loan agreement (valid until Dec 2027).": "✓ 已应用首购族豁免——产权转让文件与贷款协议印花税全免（有效至 2027 年 12 月）。",
    "⚠ Foreign buyer flat rate of 8% applied on MOT (effective 1 Jan 2026).": "⚠ 已按外国买家 8% 的统一税率计算产权转让印花税（2026 年 1 月 1 日起生效）。",
  };
  const notesEn = {
    "返回作品集": "Back to portfolio", "笔记列表": "Notes list", "关闭笔记列表": "Close notes list", "新建笔记": "New note", "搜索你的笔记…": "Search your notes...", "全部笔记": "All notes", "已保存至本机": "Saved on this device", "清空": "Clear", "笔记编辑器": "Notes editor", "打开笔记列表": "Open notes list", "我的笔记": "My notes", "已保存": "Saved", "置顶笔记": "Pin note", "删除笔记": "Delete note", "无标题笔记": "Untitled note", "笔记标题": "Note title", "笔记内容": "Note content", "从这里开始记录…": "Start writing here...", "灵感不必完整，先写下来。": "Ideas do not need to be complete. Write them down first.", "还没有笔记": "No notes yet", "新建一页，记下此刻。": "Create a page and capture this moment.",
  };

  const translateText = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return value;
    let translated = isChinese ? exactZh[trimmed] : notesEn[trimmed];
    if (!translated && isChinese) {
      for (const [pattern, replacement] of dynamicZh) {
        if (pattern.test(trimmed)) { translated = trimmed.replace(pattern, replacement); break; }
      }
    }
    if (!translated) return value;
    return value.replace(trimmed, translated);
  };

  const translateTree = (root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (node.parentElement?.closest("script,style,code,pre")) return;
      node.nodeValue = translateText(node.nodeValue);
    });
  };

  if (isChinese || path.includes("/projects/shiye-notes/")) {
    translateTree(document.body);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) node.nodeValue = translateText(node.nodeValue);
        else if (node.nodeType === Node.ELEMENT_NODE) translateTree(node);
      }));
    });
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
  }
})();
