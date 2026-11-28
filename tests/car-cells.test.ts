import assert from "node:assert/strict";
import test from "node:test";
import type { Robot } from "../src/data/roster";
import { carCellRuns, carWorkRuns } from "../src/lib/car-cells.ts";
import { parseCars, computeCarStats } from "../src/data/roster.ts";

const robot = (name: string, group: string | undefined, names: string[]): Robot => ({ name, group, lead: names, crew: {} });
const names = (r: Robot) => r.lead;

test("同一行相邻相同名单合并，包括跨项目分类的相同任务", () => {
  const cars = [robot("A", "步兵", ["甲", "乙"]), robot("B", "步兵", ["甲", "乙"]), robot("C", "哨兵", ["甲", "乙"])];
  assert.deepEqual(carCellRuns(cars, names), [
    { start: 0, span: 3, names: ["甲", "乙"] },
  ]);
});

test("负责人可以跨项目合并，只合并完全相同且相邻的名单", () => {
  const cars = [robot("飞镖", undefined, ["甲"]), robot("无人机", undefined, ["乙"]), robot("雷达", undefined, ["乙"]), robot("裁判", undefined, ["丙"])];
  assert.deepEqual(carCellRuns(cars, names).map(r => [r.start, r.span]), [[0, 1], [1, 2], [3, 1]]);
});

test("空列与不同名单均中断合并，不吞并或移动人员", () => {
  const cars = [robot("A", "步兵", ["甲"]), robot("B", "步兵", []), robot("C", "步兵", ["甲"]), robot("D", "步兵", ["乙"]), robot("E", "步兵", ["乙"])];
  assert.deepEqual(carCellRuns(cars, names).map(r => [r.start, r.span]), [[0, 1], [2, 1], [3, 2]]);
});

const jointRaw = (crew: Record<string, string[]>) => ({
  grades: ["2025级"],
  disciplines: [{name:"硬件",accent:"#123456"},{name:"电控",accent:"#654321"}],
  leadRow: {label:"负责人",accent:"#abcdef"},
  robots: [{name:"A",crew:{"2025级":crew}}],
});

test("联合任务可跨硬件和电控两行，且每车只统计一次", () => {
  const data = parseCars(jointRaw({"硬件+电控":["甲","乙"]}));
  assert.equal(computeCarStats(data).slots, 2);
  assert.deepEqual(carWorkRuns(data.robots,"2025级","硬件"), [{start:0,span:1,rowSpan:2,work:"硬件+电控",names:["甲","乙"]}]);
  assert.deepEqual(carWorkRuns(data.robots,"2025级","电控"), []);
});

test("相邻联合任务合为矩形，不吞并旁边同名的单一任务", () => {
  const cars: Robot[] = [
    {...robot("A",undefined,[]),crew:{"2025级":{"硬件+电控":["甲"]}}},
    {...robot("B",undefined,[]),crew:{"2025级":{"硬件+电控":["甲"]}}},
    {...robot("C",undefined,[]),crew:{"2025级":{"硬件":["甲"],"电控":["乙"]}}},
  ];
  assert.deepEqual(carWorkRuns(cars,"2025级","硬件").map(run=>[run.start,run.span,run.rowSpan]), [[0,2,2],[2,1,1]]);
  assert.deepEqual(carWorkRuns(cars,"2025级","电控").map(run=>[run.start,run.span,run.names]), [[2,1,["乙"]]]);
});

test("联合任务不能与单独硬件或电控重复覆盖", () => {
  assert.throws(()=>parseCars(jointRaw({"硬件+电控":["甲"],"电控":["乙"]})), /重复|覆盖/);
});
