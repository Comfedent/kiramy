const test = require("node:test");
const assert = require("node:assert/strict");
const PlanStore = require("../projects/kirastart-my/plan-store.js");

test("export data uses a portable KiraStart plan JSON format", () => {
  const exported = PlanStore.createExport({ salary: 3500, rent: 900, epf: true }, "2026-06-21T00:00:00.000Z");
  assert.equal(exported.type, PlanStore.EXPORT_TYPE);
  assert.equal(exported.version, PlanStore.EXPORT_VERSION);
  assert.equal(exported.exportedAt, "2026-06-21T00:00:00.000Z");
  assert.equal(exported.plan.salary, 3500);
  assert.equal(exported.plan.rent, 900);
  assert.equal(exported.plan.epf, true);
});

test("import rejects malformed plan JSON without throwing", () => {
  const parsed = PlanStore.parseImport("{bad");
  assert.equal(parsed.ok, false);
  assert.match(parsed.error, /valid JSON/);
});

test("safeLoad recovers from malformed localStorage data", () => {
  const calls = [];
  const storage = {
    getItem(key) {
      assert.equal(key, PlanStore.STORAGE_KEY);
      return "{bad";
    },
    removeItem(key) {
      calls.push(key);
    },
  };
  const loaded = PlanStore.safeLoad(storage);
  assert.equal(loaded.ok, false);
  assert.equal(loaded.recovered, true);
  assert.deepEqual(calls, [PlanStore.STORAGE_KEY]);
});

test("valid import normalizes negative and missing values safely", () => {
  const parsed = PlanStore.parseImport(JSON.stringify({ type: PlanStore.EXPORT_TYPE, plan: { salary: "4200", rent: -1, epf: false } }));
  assert.equal(parsed.ok, true);
  assert.equal(parsed.plan.salary, 4200);
  assert.equal(parsed.plan.rent, 0);
  assert.equal(parsed.plan.epf, false);
  assert.equal(parsed.plan.food, 0);
});
