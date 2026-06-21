(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.KiraStartPlanStore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const STORAGE_KEY = "kirastart-plan";
  const EXPORT_TYPE = "kirastart-my.plan";
  const EXPORT_VERSION = 1;
  const NUMERIC_FIELDS = [
    "salary", "rent", "food", "transport", "bills", "family", "lifestyle",
    "ptptnBalance", "ptptn", "car", "currentSavings", "emergencyGoal",
  ];
  const TEXT_FIELDS = ["city", "stage"];

  function normalizePlan(input = {}) {
    const plan = {};
    NUMERIC_FIELDS.forEach((key) => {
      const value = Number(input[key]);
      plan[key] = Number.isFinite(value) ? Math.max(0, value) : 0;
    });
    TEXT_FIELDS.forEach((key) => {
      if (typeof input[key] === "string" && input[key].trim()) plan[key] = input[key];
    });
    plan.epf = input.epf !== false;
    return plan;
  }

  function createExport(plan, exportedAt = new Date().toISOString()) {
    return {
      type: EXPORT_TYPE,
      version: EXPORT_VERSION,
      exportedAt,
      plan: normalizePlan(plan),
    };
  }

  function serializeExport(plan) {
    return JSON.stringify(createExport(plan), null, 2);
  }

  function parseImport(raw) {
    try {
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!data || typeof data !== "object") return { ok: false, error: "Import file must be a JSON object." };
      if (data.type && data.type !== EXPORT_TYPE) return { ok: false, error: "This file is not a KiraStart MY plan export." };
      const source = data.plan && typeof data.plan === "object" ? data.plan : data;
      const hasAnyKnownField = [...NUMERIC_FIELDS, ...TEXT_FIELDS, "epf"].some((key) => Object.prototype.hasOwnProperty.call(source, key));
      if (!hasAnyKnownField) return { ok: false, error: "Import file does not contain a recognizable plan." };
      return { ok: true, plan: normalizePlan(source) };
    } catch {
      return { ok: false, error: "Import file is not valid JSON." };
    }
  }

  function safeLoad(storage) {
    if (!storage) return { ok: false, plan: null };
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { ok: false, plan: null };
    const parsed = parseImport(raw);
    if (parsed.ok) return parsed;
    storage.removeItem(STORAGE_KEY);
    return { ok: false, plan: null, recovered: true };
  }

  return { STORAGE_KEY, EXPORT_TYPE, EXPORT_VERSION, NUMERIC_FIELDS, TEXT_FIELDS, normalizePlan, createExport, serializeExport, parseImport, safeLoad };
});
