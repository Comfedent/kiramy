(() => {
  "use strict";

  const path = window.location.pathname;
  const isZh = path === "/zh" || path.startsWith("/zh/");
  const slug = (path.split("/").pop() || "").replace(".html", "");
  const T = (en, zh) => (isZh ? zh : en);

  const copy = {
    "income-tax": {
      title: T("Next Steps", "下一步"),
      lede: T(
        "Use this result as a planning estimate, then confirm your real filing position with LHDN or e-Filing.",
        "把这个结果当作规划估算，然后通过 LHDN 或 e-Filing 核对真实报税情况。"
      ),
      cards: [
        [
          T("Review assumptions", "查看假设"),
          T(
            "Check the tax year, relief caps, rebates, zakat treatment, and situations this simplified calculator does not cover.",
            "核对税务年度、减免上限、回扣、zakat 处理方式，以及这个简化计算器没有覆盖的情况。"
          ),
        ],
        [
          T("Prepare documents", "整理文件"),
          T(
            "EA form, PCB/MTD paid, EPF statement, insurance, medical, SSPN, zakat, education, lifestyle and other relief receipts.",
            "EA 表格、PCB/MTD 扣税、EPF 记录、保险、医疗、SSPN、zakat、教育、生活方式和其他减免收据。"
          ),
        ],
        [
          T("Official check", "官方核对"),
          T(
            "Verify through LHDN MyTax or e-Filing before treating the amount as final.",
            "把金额当作最终结果前，请通过 LHDN MyTax 或 e-Filing 核对。"
          ),
        ],
      ],
      actions: [
        { type: "assumptions", label: T("See assumptions", "查看使用假设") },
        { type: "print", label: T("Print / save tax summary", "打印 / 保存税务摘要"), primary: true },
        { href: "https://mytax.hasil.gov.my/", label: T("Open LHDN MyTax ↗", "打开 LHDN MyTax ↗") },
      ],
    },
    "home-loan": {
      title: T("Next Steps", "下一步"),
      lede: T(
        "A monthly instalment is only one part of a housing decision. Compare affordability, financing terms, and upfront costs before requesting quotes.",
        "月供只是买房决策的一部分。申请报价前，也要比较负担能力、融资条款和前期费用。"
      ),
      income: true,
      cards: [
        [
          T("Compare the full offer", "比较完整方案"),
          T(
            "Interest rate, lock-in period, MRTA/MLTA insurance, legal fees, valuation fees, and approval terms can change the real cost.",
            "利率、锁定期、MRTA/MLTA 保险、律师费、估价费和批准条款都会改变真实成本。"
          ),
        ],
        [
          T("Scenario to test next", "下一步比较场景"),
          T(
            "Change the down payment, interest rate, and tenure one at a time to see what drives the monthly payment most.",
            "逐项调整首付、利率和年限，观察哪一个假设最影响月供。"
          ),
        ],
      ],
      actions: [
        { type: "print", label: T("Print home-loan budget summary", "打印房贷预算摘要"), primary: true },
        { type: "recalculate", label: T("Compare another scenario", "比较另一个场景") },
      ],
    },
    epf: {
      title: T("Next Steps", "下一步"),
      lede: T(
        "Long-term retirement projections depend heavily on assumptions. Try more than one dividend and salary-growth scenario before relying on a single number.",
        "长期退休预测高度依赖假设。不要只看一个数字，请尝试不同股息率和薪资成长场景。"
      ),
      cards: [
        [
          T("Projection assumptions", "预测假设"),
          T(
            "The estimate assumes steady salary growth, selected contribution rates, and a constant dividend rate over time.",
            "估算假设薪资稳定成长、采用所选缴纳比例，并长期维持同一个股息率。"
          ),
        ],
        [
          T("Return sensitivity", "回报率敏感度"),
          T(
            "Small changes in long-term dividend assumptions can create large differences by retirement age.",
            "长期股息率的小变化，可能在退休年龄时造成很大的结果差异。"
          ),
        ],
      ],
      actions: [
        { type: "print", label: T("Save / export retirement estimate", "保存 / 导出退休估算"), primary: true },
        { type: "recalculate", label: T("Try another return rate", "尝试另一个回报率") },
      ],
    },
    "stamp-duty": {
      title: T("Next Steps", "下一步"),
      lede: T(
        "This estimate helps you prepare for upfront property costs. It is not a final solicitor quote or LHDN assessment.",
        "这个估算帮助你提前准备买房前期费用，但它不等于最终律师报价或 LHDN 评估。"
      ),
      cards: [
        [
          T("Before buying checklist", "买房前费用 checklist"),
          T(
            "MOT stamp duty, loan duty, legal fees, disbursements, valuation, insurance, maintenance deposits, and moving costs.",
            "产权转让印花税、贷款协议印花税、律师费、杂费、估价、保险、维修基金/押金和搬家成本。"
          ),
        ],
        [
          T("Confirm eligibility", "确认资格"),
          T(
            "First-home exemptions, foreign-buyer treatment, dates, and instrument details can change the final amount.",
            "首购豁免、外国买家处理方式、日期和文件细节，都可能改变最终金额。"
          ),
        ],
      ],
      actions: [
        { type: "print", label: T("Print upfront-cost checklist", "打印买房前费用清单"), primary: true },
        { href: "https://www.hasil.gov.my/en/stamp-duty/", label: T("Check LHDN stamp duty ↗", "查看 LHDN 印花税 ↗") },
      ],
    },
    ptptn: {
      title: T("Next Steps", "下一步"),
      lede: T(
        "Use this as a repayment planning summary, then confirm your official balance, conversion status, and payment schedule with PTPTN.",
        "把它当作还款规划摘要，再向 PTPTN 核对官方余额、转换状态和还款安排。"
      ),
      cards: [
        [
          T("Repayment summary", "还款计划摘要"),
          T(
            "Keep the monthly payment, estimated duration, total interest, and total repayment together when comparing payment options.",
            "比较不同还款方案时，请同时查看每月还款、预计年限、总利息和总还款。"
          ),
        ],
        [
          T("Official balance first", "以官方余额为准"),
          T(
            "Your myPTPTN balance may include arrears, takaful, discounts, or conversion details that are not modelled here.",
            "myPTPTN 余额可能包含欠款、takaful、折扣或转换细节，这里没有完整建模。"
          ),
        ],
      ],
      actions: [
        { type: "print", label: T("Print repayment plan summary", "打印还款计划摘要"), primary: true },
        { href: "https://www.ptptn.gov.my/", label: T("Open PTPTN portal ↗", "打开 PTPTN 官网 ↗") },
      ],
    },
    "car-loan": {
      title: T("Next Steps", "下一步"),
      lede: T(
        "Do not stop at the monthly instalment. Review total interest, total repayment, and the running costs that come after the loan is approved.",
        "不要只看月供。还要查看总利息、总还款，以及贷款获批后持续发生的用车成本。"
      ),
      dynamic: "car",
      cards: [
        [
          T("Real ownership burden", "真实拥车负担"),
          T(
            "Insurance, road tax, maintenance, tyres, fuel, parking, tolls, and depreciation can matter as much as the instalment.",
            "保险、路税、维修、轮胎、油费、停车、过路费和折旧，可能和月供一样重要。"
          ),
        ],
        [
          T("Before buying checklist", "买车前负担 checklist"),
          T(
            "Test the budget with a higher fuel cost, one repair month, and a slower resale value before committing.",
            "承诺前，请用更高油费、一个维修月份和较低转售价值测试预算。"
          ),
        ],
      ],
      actions: [
        { type: "print", label: T("Print car affordability summary", "打印买车负担摘要"), primary: true },
        { type: "recalculate", label: T("Compare tenure options", "比较不同年限") },
      ],
    },
    "rent-vs-buy": {
      title: T("Next Steps", "下一步"),
      lede: T(
        "The result is not a universal answer. It says which option fits better under the assumptions you entered.",
        "结果不是永远正确的答案，而是在你输入的假设下，哪一个选择更适合。"
      ),
      cards: [
        [
          T("Change one assumption", "一次改变一个假设"),
          T(
            "Try another loan rate, rent growth rate, property appreciation rate, or holding period to see how fragile the answer is.",
            "换一个贷款利率、租金增长率、房产增值率或持有年限，看看结论是否稳定。"
          ),
        ],
        [
          T("Decision context", "决策背景"),
          T(
            "Job stability, family plans, location flexibility, maintenance risk, and cash buffer can matter more than the cheaper spreadsheet result.",
            "工作稳定性、家庭计划、地点灵活性、维修风险和现金缓冲，有时比表格里更便宜的选项更重要。"
          ),
        ],
      ],
      actions: [
        { type: "print", label: T("Print rent-vs-buy comparison", "打印租买比较摘要"), primary: true },
        { type: "recalculate", label: T("Change assumptions and compare again", "更换假设后再比较") },
      ],
    },
  };

  const config = copy[slug];
  const results = document.getElementById("results");
  if (!config || !results || results.querySelector(".calculator-next-steps")) return;

  const section = document.createElement("section");
  section.className = "calculator-next-steps";
  section.setAttribute("aria-labelledby", "next-steps-title");
  section.innerHTML =
    '<h3 id="next-steps-title">' + config.title + "</h3>" +
    "<p>" + config.lede + "</p>" +
    (config.income ? incomeBlock() : "") +
    dynamicBlock(config.dynamic) +
    '<div class="next-step-grid">' + config.cards.map(cardHtml).join("") + "</div>" +
    '<div class="next-step-actions">' + config.actions.map(actionHtml).join("") + "</div>";
  results.appendChild(section);

  const printSheet = document.createElement("section");
  printSheet.className = "calculator-print-sheet";
  printSheet.setAttribute("aria-hidden", "true");
  document.body.appendChild(printSheet);

  section.addEventListener("click", (event) => {
    const button = event.target.closest("[data-next-action]");
    if (!button) return;
    if (button.dataset.nextAction === "print") printSummary(printSheet, config.title);
    if (button.dataset.nextAction === "assumptions") scrollToAssumptions();
    if (button.dataset.nextAction === "recalculate") scrollToForm();
  });

  if (config.income) setupIncomeRatio(section);
  if (config.dynamic) setupDynamicNote(section, config.dynamic);

  function cardHtml(card) {
    return '<article class="next-step-card"><strong>' + card[0] + "</strong><p>" + card[1] + "</p></article>";
  }

  function actionHtml(action) {
    const classes = "next-step-button" + (action.primary ? " primary" : "");
    if (action.href) return '<a class="' + classes + '" href="' + action.href + '" target="_blank" rel="noreferrer">' + action.label + "</a>";
    return '<button class="' + classes + '" type="button" data-next-action="' + action.type + '">' + action.label + "</button>";
  }

  function incomeBlock() {
    return '<div class="next-step-income"><label for="nextIncome">' +
      T("Optional monthly income for affordability ratio", "可选：输入月收入以估算月供占比") +
      '</label><input id="nextIncome" inputmode="decimal" type="number" min="0" placeholder="' +
      T("e.g. 6000", "例如 6000") +
      '"><p>' +
      T("Enter income to see the instalment-to-income ratio.", "输入收入后，可查看月供约占收入多少。") +
      ' <span class="next-step-ratio" aria-live="polite"></span></p></div>';
  }

  function dynamicBlock(type) {
    if (type !== "car") return "";
    return '<p class="next-step-dynamic" aria-live="polite"></p>';
  }

  function setupIncomeRatio(root) {
    const input = root.querySelector("#nextIncome");
    const output = root.querySelector(".next-step-ratio");
    const update = () => {
      const income = Number(input.value || 0);
      const monthly = numberFromText(document.getElementById("monthly")?.textContent);
      const ratio = income > 0 && monthly > 0 ? Math.round((monthly / income) * 100) : 0;
      const nextText = ratio
        ? T("Monthly payment is about " + ratio + "% of that income.", "月供约占该收入的 " + ratio + "%。")
        : "";
      if (output.textContent !== nextText) output.textContent = nextText;
    };
    input.addEventListener("input", update);
    observeResults(update);
    update();
  }

  function setupDynamicNote(root, type) {
    const note = root.querySelector(".next-step-dynamic");
    const update = () => {
      if (type !== "car") return;
      const interest = document.getElementById("sInterest")?.textContent?.trim();
      const total = document.getElementById("sTotal")?.textContent?.trim();
      const nextText = interest && total && interest !== "-"
        ? T(
            "This scenario includes " + interest + " in flat-rate interest and " + total + " total repayment before ownership costs.",
            "这个场景包含 " + interest + " 固定利率利息，以及 " + total + " 总还款；这还未包括实际拥车成本。"
          )
        : "";
      if (note.textContent !== nextText) note.textContent = nextText;
    };
    observeResults(update);
    update();
  }

  function observeResults(callback) {
    const observer = new MutationObserver(callback);
    observer.observe(results, { childList: true, subtree: true, characterData: true });
  }

  function scrollToAssumptions() {
    const target = document.getElementById("method-title") || document.querySelector(".trust-panel");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToForm() {
    const target = document.querySelector(".calculator, form, .card");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    target?.querySelector?.("input, select, button")?.focus?.();
  }

  function printSummary(sheet, title) {
    const rows = collectSummaryRows();
    sheet.innerHTML = "<h1>" + title + "</h1><p>" +
      T("Generated in your browser. No data was uploaded.", "由当前浏览器生成，没有上传任何数据。") +
      "</p>" + rows.map((row) => '<div class="print-row">' + escapeHtml(row) + "</div>").join("") +
      "<p>" + T(
        "Check the official source or a qualified professional before making a financial decision.",
        "作出财务决定前，请通过官方来源或合格专业人士核对。"
      ) + "</p>";
    sheet.setAttribute("aria-hidden", "false");
    window.print();
  }

  window.addEventListener("afterprint", () => {
    printSheet.setAttribute("aria-hidden", "true");
  });

  function collectSummaryRows() {
    const rows = [];
    const pageTitle = document.querySelector("h1")?.textContent?.trim();
    if (pageTitle) rows.push(pageTitle);
    results.querySelectorAll(".card-title, .result-hero, .result-row, .stat-box, .verdict, .compare-card, .monthly-box").forEach((node) => {
      const text = node.textContent.replace(/\s+/g, " ").trim();
      if (text && !text.includes(config.title) && !rows.includes(text)) rows.push(text);
    });
    return rows.slice(0, 18);
  }

  function numberFromText(value = "") {
    return Number(String(value).replace(/[^0-9.-]/g, "")) || 0;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }
})();
