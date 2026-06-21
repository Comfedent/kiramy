const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const IS_ZH = location.pathname === '/zh' || location.pathname.startsWith('/zh/');
const T = (en, zh) => IS_ZH ? zh : en;

const views = { home: $('#homeView'), planner: $('#plannerView'), result: $('#resultView') };
const form = $('#plannerForm');
let currentStep = 1;
let latestPlan = null;

const copyByStep = {
  1: [T('Let\'s start with the money coming in.', '先从你的收入开始。'), T('No payslip yet? Use the salary from your offer letter. You can always change it later.', '还没有工资单？可以先填写录用通知中的薪资，之后随时修改。'), T('EPF and other deductions mean your take-home will be lower than your offer.', '扣除 EPF 等项目后，实际到手收入会低于录用薪资。')],
  2: [T('Now for the part salary ads leave out.', '接下来看看招聘广告不会写出的部分。'), T('Add the monthly costs that make your life work — from rent and food to the little things.', '填入维持日常生活的每月开支，从房租、饮食到各种小额费用。'), T('A budget is most useful when it includes fun. Leaving it out only makes the plan less honest.', '真实预算也应该包含娱乐开支，忽略它只会让计划失真。')],
  3: [T('Give your future self a little structure.', '为未来的自己建立一点结构。'), T('Add the commitments you already have, then choose the safety net you want to build.', '加入现有固定负担，并设定你希望建立的安全垫。'), T('A first emergency fund does not need to be perfect. RM 1,000 is already a meaningful first milestone.', '第一笔应急基金不必完美，RM 1,000 已经是很有意义的起点。')]
};

const cityPresets = {
  kl: { rent: 1100, transport: 280 }, penang: { rent: 850, transport: 250 }, johor: { rent: 850, transport: 270 },
  ipoh: { rent: 650, transport: 220 }, kk: { rent: 800, transport: 260 }, other: { rent: 750, transport: 240 }
};

const lifestylePresets = {
  lean: { food: 450, bills: 80, family: 100, lifestyle: 120 },
  balanced: { food: 650, bills: 120, family: 150, lifestyle: 250 },
  comfortable: { food: 850, bills: 180, family: 250, lifestyle: 450 }
};

function showView(name) {
  Object.values(views).forEach(view => view.classList.remove('active'));
  views[name].classList.add('active');
  document.body.scrollTop = document.documentElement.scrollTop = 0;
  history.replaceState(null, '', name === 'home' ? '#home' : `#${name}`);
}

function startPlanner() { currentStep = 1; updateStep(); showView('planner'); }
$$('[data-start]').forEach(button => button.addEventListener('click', startPlanner));
$$('[data-home]').forEach(button => button.addEventListener('click', () => showView('home')));

function updateStep() {
  $$('.form-step').forEach(step => step.classList.toggle('active', Number(step.dataset.step) === currentStep));
  $('#stepLabel').textContent = T(`Step ${currentStep} of 3`, `第 ${currentStep} 步，共 3 步`);
  $('#stepProgress').style.width = `${currentStep * 33.333}%`;
  $('#previousButton').disabled = currentStep === 1;
  $('#nextButton').innerHTML = currentStep === 3 ? T('See my reality check <span>↗</span>', '查看我的现实预算 <span>↗</span>') : T('Continue <span>→</span>', '继续 <span>→</span>');
  const copy = copyByStep[currentStep];
  $('#asideTitle').textContent = copy[0]; $('#asideCopy').textContent = copy[1]; $('#asideTip').textContent = copy[2];
  $('#formError').textContent = '';
}

$('#nextButton').addEventListener('click', () => {
  if (!validateStep()) return;
  if (currentStep < 3) { currentStep += 1; updateStep(); window.scrollTo(0, 0); }
  else { latestPlan = calculatePlan(getValues()); renderResult(latestPlan); showView('result'); }
});
$('#previousButton').addEventListener('click', () => { if (currentStep > 1) { currentStep -= 1; updateStep(); } });

function validateStep() {
  const inputs = $$(`.form-step[data-step="${currentStep}"] input[type="number"]`);
  const invalid = inputs.find(input => input.value === '' || Number(input.value) < 0);
  if (invalid) { $('#formError').textContent = T('Please enter a valid amount (0 is okay).', '请输入有效金额（可以填写 0）。'); invalid.focus(); return false; }
  if (currentStep === 1 && Number(form.elements.salary.value) < 500) { $('#formError').textContent = T('Enter a monthly salary of at least RM 500.', '请输入至少 RM 500 的月薪。'); form.elements.salary.focus(); return false; }
  return true;
}

form.elements.city.addEventListener('change', event => {
  const preset = cityPresets[event.target.value];
  form.elements.rent.value = preset.rent; form.elements.transport.value = preset.transport;
});

$$('[data-preset]').forEach(button => button.addEventListener('click', () => {
  $$('[data-preset]').forEach(item => item.classList.remove('selected')); button.classList.add('selected');
  Object.entries(lifestylePresets[button.dataset.preset]).forEach(([key, value]) => form.elements[key].value = value);
}));

function getValues() {
  const data = Object.fromEntries(new FormData(form).entries());
  ['salary','rent','food','transport','bills','family','lifestyle','ptptnBalance','ptptn','car','currentSavings','emergencyGoal'].forEach(key => data[key] = Math.max(0, Number(data[key] || 0)));
  data.epf = form.elements.epf.checked;
  return window.KiraStartPlanStore ? KiraStartPlanStore.normalizePlan(data) : data;
}

function applyPlanToForm(data) {
  const plan = window.KiraStartPlanStore ? KiraStartPlanStore.normalizePlan(data) : data;
  Object.entries(plan).forEach(([key,value]) => {
    if (!form.elements[key]) return;
    if (form.elements[key].type === 'checkbox') form.elements[key].checked = Boolean(value);
    else form.elements[key].value = value;
  });
}

function estimateAnnualTax(annualChargeable) {
  const bands = [[5000,0],[15000,.01],[15000,.03],[15000,.06],[20000,.11],[30000,.19],[150000,.25],[150000,.26],[200000,.28],[Infinity,.30]];
  let remaining = Math.max(0, annualChargeable), tax = 0;
  for (const [size, rate] of bands) { const amount = Math.min(remaining, size); tax += amount * rate; remaining -= amount; if (remaining <= 0) break; }
  return tax;
}

function calculatePlan(v) {
  const epf = v.epf ? v.salary * .11 : 0;
  const contributionWage = Math.min(v.salary, 6000);
  const socso = contributionWage * .005;
  const eis = contributionWage * .002;
  const annualRelief = 9000 + Math.min(epf * 12, 4000);
  const tax = estimateAnnualTax(Math.max(0, v.salary * 12 - annualRelief)) / 12;
  const takeHome = v.salary - epf - socso - eis - tax;
  const essentials = v.rent + v.food + v.transport + v.bills + v.family;
  const commitments = v.ptptn + v.car;
  const totalOut = essentials + v.lifestyle + commitments;
  const leftover = takeHome - totalOut;
  const essentialRatio = takeHome ? essentials / takeHome : 1;
  const debtRatio = takeHome ? commitments / takeHome : 1;
  const savingsRate = takeHome ? Math.max(0, leftover) / takeHome : 0;
  let score = 62;
  score += savingsRate >= .2 ? 20 : savingsRate >= .1 ? 12 : savingsRate > 0 ? 5 : -25;
  score += essentialRatio <= .6 ? 10 : essentialRatio <= .75 ? 3 : -10;
  score += debtRatio <= .15 ? 8 : debtRatio <= .25 ? 2 : -10;
  score = Math.max(5, Math.min(98, Math.round(score)));
  const monthlySaving = Math.max(0, leftover);
  const monthsToGoal = monthlySaving > 0 ? Math.ceil(Math.max(0, v.emergencyGoal - v.currentSavings) / monthlySaving) : Infinity;
  const monthsTo1k = monthlySaving > 0 ? Math.ceil(Math.max(0, 1000 - v.currentSavings) / monthlySaving) : Infinity;
  const monthsPtptn = v.ptptn > 0 ? Math.ceil(v.ptptnBalance / v.ptptn) : Infinity;
  return { ...v, epfAmount:epf, socso, eis, tax, takeHome, essentials, commitments, totalOut, leftover, essentialRatio, debtRatio, savingsRate, score, monthlySaving, monthsToGoal, monthsTo1k, monthsPtptn };
}

const money = value => `RM ${Math.round(Math.abs(value)).toLocaleString('en-MY')}`;
const percent = value => `${Math.round(value * 100)}%`;

function renderResult(p) {
  const positive = p.leftover >= 0;
  $('#resultTitle').innerHTML = positive
    ? T(`You have <em id="headlineAmount">${money(p.leftover)}</em> of breathing room.`, `你每月有 <em id="headlineAmount">${money(p.leftover)}</em> 的可支配余量。`)
    : T(`Your plan has a <em id="headlineAmount">${money(p.leftover)}</em> monthly gap.`, `你的计划每月有 <em id="headlineAmount">${money(p.leftover)}</em> 的缺口。`);
  $('#resultSummary').textContent = positive ? T(`That is ${percent(p.savingsRate)} of take-home pay available for savings or flexibility each month.`, `这相当于到手收入的 ${percent(p.savingsRate)}，可用于储蓄或灵活开支。`) : T('Your current costs are higher than your estimated take-home pay. The good news: now you can see the gap clearly.', '目前开支高于预计到手收入。好消息是：现在你已经能清楚看到缺口。');
  $('#grossSalary').textContent = money(p.salary); $('#monthlyLeft').textContent = `${p.leftover < 0 ? '− ' : ''}${money(p.leftover)}`;
  $('#healthScore').textContent = p.score; $('#scoreBar').style.width = `${p.score}%`;
  $('#healthLabel').textContent = p.score >= 80 ? T('Strong foundation', '基础稳健') : p.score >= 60 ? T('Workable plan', '计划可行') : p.score >= 40 ? T('Needs breathing room', '需要更多余量') : T('Reset the pressure', '需要重新调整');

  const deductions = p.epfAmount + p.socso + p.eis + p.tax;
  const rows = [
    [T('Statutory deductions', '法定扣款'), deductions, '#7ee0bd'], [T('Life essentials', '生活必需开支'), p.essentials, '#ff8067'],
    [T('Lifestyle', '生活方式'), p.lifestyle, '#ffd35a'], [T('PTPTN & car', 'PTPTN 与汽车'), p.commitments, '#8992d9']
  ];
  $('#breakdownBars').innerHTML = rows.map(([label,value,color]) => `<div class="breakdown-row"><span><i style="background:${color}"></i>${label}</span><div class="breakdown-track"><i style="width:${Math.min(100,value/p.salary*100)}%;background:${color}"></i></div><strong>− ${money(value)}</strong></div>`).join('');

  $('#essentialRatio').textContent = percent(p.essentialRatio); $('#ratioBar').style.width = `${Math.min(100,p.essentialRatio*100)}%`;
  $('#ratioBar').style.background = p.essentialRatio > .75 ? '#ff8067' : p.essentialRatio > .6 ? '#ffd35a' : '#7ee0bd';
  const verdict = getVerdict(p);
  $('#verdictTitle').textContent = verdict.title; $('#verdictCopy').textContent = verdict.copy; $('#verdictIcon').textContent = verdict.icon;
  $('#ratioNote').textContent = p.essentialRatio <= .6 ? T('Below 60% gives you useful flexibility.', '低于 60% 能为生活保留实用的灵活空间。') : T('A useful long-term target is below 60% of take-home pay.', '长期可以将目标设为到手收入的 60% 以下。');
  renderRecommendations(p); renderTimeline(p);
}

function getVerdict(p) {
  if (p.leftover < 0) return { icon:'!', title:T('The numbers need a reset.', '这些数字需要重新调整。'), copy:T(`You are short by ${money(p.leftover)} each month. Focus first on one large cost — usually rent, transport or a car — rather than cutting every small joy.`, `你每月缺少 ${money(p.leftover)}。先处理房租、交通或汽车等大额开支，而不是削减所有小乐趣。`) };
  if (p.savingsRate < .1) return { icon:'→', title:T('It works, but it is tight.', '可以维持，但较为紧张。'), copy:T('Your bills fit, but one surprise could knock the plan off course. Build a small buffer before taking on any new monthly commitment.', '当前账单可以覆盖，但一次意外开支就可能打乱计划。承担新的每月固定负担前，先建立一笔小缓冲。') };
  if (p.savingsRate < .2) return { icon:'↗', title:T('You have room to build.', '你还有成长空间。'), copy:T('Your plan has a healthy start. Automate part of your surplus and keep the rest available for real-life surprises.', '计划有一个健康的起点。将部分余量自动储蓄，其余留给现实生活中的意外情况。') };
  return { icon:'✓', title:T('This is a strong start.', '这是一个稳健的开始。'), copy:T('You have meaningful breathing room. Protect it by building your emergency fund before upgrading your lifestyle.', '你拥有可观的可支配余量。升级生活方式之前，先用它建立应急基金。') };
}

function renderRecommendations(p) {
  const items = [];
  if (p.leftover <= 0) items.push(['1',T('Close the monthly gap','先填补每月缺口'),T(`Find ${money(p.leftover)} in one or two big categories. Rent and car costs have the greatest leverage.`,`从一两个大项中找出 ${money(p.leftover)}，房租和汽车开支通常最有调整空间。`)]);
  else items.push(['1',T('Automate your first transfer','自动完成第一笔转账'),T(`Move ${money(Math.max(50,Math.round(p.leftover*.7/10)*10))} to savings right after payday, not at month-end.`,`发薪后立即将 ${money(Math.max(50,Math.round(p.leftover*.7/10)*10))} 转入储蓄，而不是等到月底。`)]);
  if (p.car > 0 && p.debtRatio > .2) items.push(['2',T('Recheck the car pressure','重新评估汽车压力'),T(`Debt payments use ${percent(p.debtRatio)} of take-home pay. Aim to keep all commitments near 15–20%.`,`债务还款占到手收入的 ${percent(p.debtRatio)}。尽量把全部固定负担控制在 15–20% 左右。`)]);
  else if (p.car === 0 && p.leftover < 800) items.push(['2',T('Wait before buying a car','暂缓购车'),T('Your current breathing room is below RM 800. Test the budget for 3 months before adding an instalment.','目前每月余量低于 RM 800。增加车贷之前，先按这个预算生活 3 个月。')]);
  else items.push(['2',T('Keep commitments light','保持较低固定负担'),T(`Your current commitment ratio is ${percent(p.debtRatio)}. Preserve that flexibility while your income is still growing.`,`目前固定负担比例为 ${percent(p.debtRatio)}。收入仍在增长时，请保留这份灵活性。`)]);
  if (Number.isFinite(p.monthsToGoal)) items.push(['3',T('Name the finish line','明确目标终点'),T(`At this pace, your ${money(p.emergencyGoal)} emergency fund is about ${p.monthsToGoal || 0} month${p.monthsToGoal===1?'':'s'} away.`,`按当前速度，距离 ${money(p.emergencyGoal)} 应急基金目标约还有 ${p.monthsToGoal || 0} 个月。`)]);
  else items.push(['3',T('Start with RM 1,000','先从 RM 1,000 开始'),T('Pause the full emergency-fund goal. First create a positive monthly surplus, then aim for your first RM 1,000.','暂缓完整应急基金目标。先实现每月正向结余，再完成第一个 RM 1,000。')]);
  $('#recommendations').innerHTML = items.map(([n,title,copy]) => `<div class="recommendation"><span>${n}</span><div><h3>${title}</h3><p>${copy}</p></div></div>`).join('');
}

function renderTimeline(p) {
  const safeMonth = n => Number.isFinite(n) ? Math.max(1, Math.min(36, n)) : 36;
  const milestones = [
    [1,T('First payslip decoded','看懂第一张工资单'),T(`${money(p.takeHome)} estimated take-home`,`预计到手 ${money(p.takeHome)}`)],
    [safeMonth(p.monthsTo1k),T('First RM 1,000','第一个 RM 1,000'),p.monthsTo1k <= 36 ? T('Your starter safety net','你的第一笔安全垫') : T('Needs a positive monthly surplus','需要先实现每月正向结余')],
    [safeMonth(p.monthsToGoal),T('Emergency fund','应急基金'),p.monthsToGoal <= 36 ? T(`${money(p.emergencyGoal)} target reached`,`达成 ${money(p.emergencyGoal)} 目标`) : T('Beyond the current 36-month view','超出当前 36 个月范围')],
    [Math.min(36,Math.max(24,safeMonth(p.monthsToGoal)+6)),T('Next big decision','下一个重要决定'),T('Revisit car, home or investing','重新评估汽车、住房或投资')]
  ];
  $('#timeline').innerHTML = milestones.map(([month,title,copy],i) => `<div class="milestone ${i>1?'future':''}"><i class="milestone-dot"></i><span>${T(`MONTH ${month}`,`第 ${month} 个月`)}</span><h3>${title}</h3><p>${copy}</p></div>`).join('');
}

function savePlan() {
  localStorage.setItem(KiraStartPlanStore.STORAGE_KEY, JSON.stringify(getValues()));
  toast(T('Plan saved in this browser only','计划只保存在当前浏览器'));
}
function loadPlan() {
  const saved = KiraStartPlanStore.safeLoad(localStorage);
  if (!saved.ok) {
    toast(saved.recovered ? T('Saved plan was damaged and has been reset','保存的计划已损坏，已重置') : T('No saved plan yet — let’s make one','还没有已保存的计划——现在开始制定'));
    startPlanner();
    return;
  }
  applyPlanToForm(saved.plan);
  startPlanner();
  toast(T('Saved plan loaded from this browser','已从当前浏览器加载保存计划'));
}

function toast(message) { const el=$('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove('show'),2200); }
function downloadJSON(filename, jsonText) {
  const blob = new Blob([jsonText], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}
function exportPlan(source = latestPlan || getValues()) {
  const stamp = new Date().toISOString().slice(0, 10);
  downloadJSON(`kirastart-my-plan-${stamp}.json`, KiraStartPlanStore.serializeExport(source));
  toast(T('Plan exported as JSON','计划已导出为 JSON'));
}
async function importPlanFromFile(file) {
  if (!file) return;
  const text = await file.text();
  $('#importPlanInput').value = '';
  const parsed = KiraStartPlanStore.parseImport(text);
  if (!parsed.ok) { toast(T('Import failed: invalid plan JSON','导入失败：计划 JSON 无效')); return; }
  applyPlanToForm(parsed.plan);
  latestPlan = null;
  savePlan();
  startPlanner();
  toast(T('Plan imported. Review the numbers before using it.','计划已导入。使用前请先检查数字。'));
}
function summaryText(p = latestPlan) {
  if (!p) return '';
  return [
    T('KiraStart MY plan', 'KiraStart MY 计划'),
    `${T('Gross salary','税前月薪')}: ${money(p.salary)}`,
    `${T('Estimated take-home','预计到手')}: ${money(p.takeHome)}`,
    `${T('Monthly costs','每月支出')}: ${money(p.totalOut)}`,
    `${T('Monthly breathing room','每月余量')}: ${p.leftover<0?'-':''}${money(p.leftover)}`,
    `${T('Plan health','计划健康度')}: ${p.score}/100`,
    T('Storage note: this data is saved only in the current browser unless you export a JSON backup.', '存储说明：除非导出 JSON 备份，否则数据只保存在当前浏览器。')
  ].join('\n');
}
$('#saveDraftButton').addEventListener('click', savePlan); $('#saveResultButton').addEventListener('click', savePlan); $('#loadPlanButton').addEventListener('click', loadPlan);
$('#exportDraftButton').addEventListener('click', () => exportPlan(getValues()));
$('#exportResultButton').addEventListener('click', () => exportPlan(latestPlan || getValues()));
$('#importPlanButton').addEventListener('click', () => $('#importPlanInput').click());
$('#importPlanHeroButton').addEventListener('click', () => $('#importPlanInput').click());
$('#importPlanInput').addEventListener('change', event => importPlanFromFile(event.target.files[0]));
$('#editPlanButton').addEventListener('click', () => showView('planner'));
$('#resetButton').addEventListener('click', () => { form.reset(); localStorage.removeItem(KiraStartPlanStore.STORAGE_KEY); currentStep=1; updateStep(); showView('planner'); toast(T('Fresh plan ready','新计划已准备好')); });
$('#printSummaryButton').addEventListener('click', () => { if (!latestPlan) return; window.print(); });
$('#copySummaryButton').addEventListener('click', async () => {
  if (!latestPlan) return;
  try { await navigator.clipboard.writeText(summaryText(latestPlan)); toast(T('Summary copied','摘要已复制')); } catch { toast(T('Copy is not available in this browser','当前浏览器无法复制')); }
});

window.addEventListener('hashchange', () => { if (location.hash === '#home') showView('home'); });
if (location.hash === '#planner') startPlanner(); else showView('home');
