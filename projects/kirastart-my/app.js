const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const views = { home: $('#homeView'), planner: $('#plannerView'), result: $('#resultView') };
const form = $('#plannerForm');
let currentStep = 1;
let latestPlan = null;

const copyByStep = {
  1: ['Let\'s start with the money coming in.', 'No payslip yet? Use the salary from your offer letter. You can always change it later.', 'EPF and other deductions mean your take-home will be lower than your offer.'],
  2: ['Now for the part salary ads leave out.', 'Add the monthly costs that make your life work — from rent and food to the little things.', 'A budget is most useful when it includes fun. Leaving it out only makes the plan less honest.'],
  3: ['Give your future self a little structure.', 'Add the commitments you already have, then choose the safety net you want to build.', 'A first emergency fund does not need to be perfect. RM 1,000 is already a meaningful first milestone.']
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
  $('#stepLabel').textContent = `Step ${currentStep} of 3`;
  $('#stepProgress').style.width = `${currentStep * 33.333}%`;
  $('#previousButton').disabled = currentStep === 1;
  $('#nextButton').innerHTML = currentStep === 3 ? 'See my reality check <span>↗</span>' : 'Continue <span>→</span>';
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
  if (invalid) { $('#formError').textContent = 'Please enter a valid amount (0 is okay).'; invalid.focus(); return false; }
  if (currentStep === 1 && Number(form.elements.salary.value) < 500) { $('#formError').textContent = 'Enter a monthly salary of at least RM 500.'; form.elements.salary.focus(); return false; }
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
  return data;
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
    ? `You have <em id="headlineAmount">${money(p.leftover)}</em> of breathing room.`
    : `Your plan has a <em id="headlineAmount">${money(p.leftover)}</em> monthly gap.`;
  $('#resultSummary').textContent = positive ? `That is ${percent(p.savingsRate)} of take-home pay available for savings or flexibility each month.` : 'Your current costs are higher than your estimated take-home pay. The good news: now you can see the gap clearly.';
  $('#grossSalary').textContent = money(p.salary); $('#monthlyLeft').textContent = `${p.leftover < 0 ? '− ' : ''}${money(p.leftover)}`;
  $('#healthScore').textContent = p.score; $('#scoreBar').style.width = `${p.score}%`;
  $('#healthLabel').textContent = p.score >= 80 ? 'Strong foundation' : p.score >= 60 ? 'Workable plan' : p.score >= 40 ? 'Needs breathing room' : 'Reset the pressure';

  const deductions = p.epfAmount + p.socso + p.eis + p.tax;
  const rows = [
    ['Statutory deductions', deductions, '#7ee0bd'], ['Life essentials', p.essentials, '#ff8067'],
    ['Lifestyle', p.lifestyle, '#ffd35a'], ['PTPTN & car', p.commitments, '#8992d9']
  ];
  $('#breakdownBars').innerHTML = rows.map(([label,value,color]) => `<div class="breakdown-row"><span><i style="background:${color}"></i>${label}</span><div class="breakdown-track"><i style="width:${Math.min(100,value/p.salary*100)}%;background:${color}"></i></div><strong>− ${money(value)}</strong></div>`).join('');

  $('#essentialRatio').textContent = percent(p.essentialRatio); $('#ratioBar').style.width = `${Math.min(100,p.essentialRatio*100)}%`;
  $('#ratioBar').style.background = p.essentialRatio > .75 ? '#ff8067' : p.essentialRatio > .6 ? '#ffd35a' : '#7ee0bd';
  const verdict = getVerdict(p);
  $('#verdictTitle').textContent = verdict.title; $('#verdictCopy').textContent = verdict.copy; $('#verdictIcon').textContent = verdict.icon;
  $('#ratioNote').textContent = p.essentialRatio <= .6 ? 'Below 60% gives you useful flexibility.' : 'A useful long-term target is below 60% of take-home pay.';
  renderRecommendations(p); renderTimeline(p);
}

function getVerdict(p) {
  if (p.leftover < 0) return { icon:'!', title:'The numbers need a reset.', copy:`You are short by ${money(p.leftover)} each month. Focus first on one large cost — usually rent, transport or a car — rather than cutting every small joy.` };
  if (p.savingsRate < .1) return { icon:'→', title:'It works, but it is tight.', copy:'Your bills fit, but one surprise could knock the plan off course. Build a small buffer before taking on any new monthly commitment.' };
  if (p.savingsRate < .2) return { icon:'↗', title:'You have room to build.', copy:'Your plan has a healthy start. Automate part of your surplus and keep the rest available for real-life surprises.' };
  return { icon:'✓', title:'This is a strong start.', copy:'You have meaningful breathing room. Protect it by building your emergency fund before upgrading your lifestyle.' };
}

function renderRecommendations(p) {
  const items = [];
  if (p.leftover <= 0) items.push(['1','Close the monthly gap',`Find ${money(p.leftover)} in one or two big categories. Rent and car costs have the greatest leverage.`]);
  else items.push(['1','Automate your first transfer',`Move ${money(Math.max(50,Math.round(p.leftover*.7/10)*10))} to savings right after payday, not at month-end.`]);
  if (p.car > 0 && p.debtRatio > .2) items.push(['2','Recheck the car pressure',`Debt payments use ${percent(p.debtRatio)} of take-home pay. Aim to keep all commitments near 15–20%.`]);
  else if (p.car === 0 && p.leftover < 800) items.push(['2','Wait before buying a car','Your current breathing room is below RM 800. Test the budget for 3 months before adding an instalment.']);
  else items.push(['2','Keep commitments light',`Your current commitment ratio is ${percent(p.debtRatio)}. Preserve that flexibility while your income is still growing.`]);
  if (Number.isFinite(p.monthsToGoal)) items.push(['3','Name the finish line',`At this pace, your ${money(p.emergencyGoal)} emergency fund is about ${p.monthsToGoal || 0} month${p.monthsToGoal===1?'':'s'} away.`]);
  else items.push(['3','Start with RM 1,000','Pause the full emergency-fund goal. First create a positive monthly surplus, then aim for your first RM 1,000.']);
  $('#recommendations').innerHTML = items.map(([n,title,copy]) => `<div class="recommendation"><span>${n}</span><div><h3>${title}</h3><p>${copy}</p></div></div>`).join('');
}

function renderTimeline(p) {
  const safeMonth = n => Number.isFinite(n) ? Math.max(1, Math.min(36, n)) : 36;
  const milestones = [
    [1,'First payslip decoded',`${money(p.takeHome)} estimated take-home`],
    [safeMonth(p.monthsTo1k),'First RM 1,000',p.monthsTo1k <= 36 ? 'Your starter safety net' : 'Needs a positive monthly surplus'],
    [safeMonth(p.monthsToGoal),'Emergency fund',p.monthsToGoal <= 36 ? `${money(p.emergencyGoal)} target reached` : 'Beyond the current 36-month view'],
    [Math.min(36,Math.max(24,safeMonth(p.monthsToGoal)+6)),'Next big decision','Revisit car, home or investing']
  ];
  $('#timeline').innerHTML = milestones.map(([month,title,copy],i) => `<div class="milestone ${i>1?'future':''}"><i class="milestone-dot"></i><span>MONTH ${month}</span><h3>${title}</h3><p>${copy}</p></div>`).join('');
}

function savePlan() { localStorage.setItem('kirastart-plan', JSON.stringify(getValues())); toast('Plan saved on this device'); }
function loadPlan() {
  const raw = localStorage.getItem('kirastart-plan');
  if (!raw) { toast('No saved plan yet — let’s make one'); startPlanner(); return; }
  try { const data = JSON.parse(raw); Object.entries(data).forEach(([key,value]) => { if (!form.elements[key]) return; if (form.elements[key].type === 'checkbox') form.elements[key].checked = Boolean(value); else form.elements[key].value = value; }); startPlanner(); toast('Saved plan loaded'); } catch { localStorage.removeItem('kirastart-plan'); startPlanner(); }
}

function toast(message) { const el=$('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove('show'),2200); }
$('#saveDraftButton').addEventListener('click', savePlan); $('#saveResultButton').addEventListener('click', savePlan); $('#loadPlanButton').addEventListener('click', loadPlan);
$('#editPlanButton').addEventListener('click', () => showView('planner'));
$('#resetButton').addEventListener('click', () => { form.reset(); localStorage.removeItem('kirastart-plan'); currentStep=1; updateStep(); showView('planner'); toast('Fresh plan ready'); });
$('#copySummaryButton').addEventListener('click', async () => {
  if (!latestPlan) return;
  const text = `KiraStart MY plan\nGross salary: ${money(latestPlan.salary)}\nEstimated take-home: ${money(latestPlan.takeHome)}\nMonthly costs: ${money(latestPlan.totalOut)}\nMonthly breathing room: ${latestPlan.leftover<0?'-':''}${money(latestPlan.leftover)}\nPlan health: ${latestPlan.score}/100`;
  try { await navigator.clipboard.writeText(text); toast('Summary copied'); } catch { toast('Copy is not available in this browser'); }
});

window.addEventListener('hashchange', () => { if (location.hash === '#home') showView('home'); });
if (location.hash === '#planner') startPlanner(); else showView('home');
