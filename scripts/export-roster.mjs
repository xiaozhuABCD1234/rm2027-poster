import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const { groups } = JSON.parse(await readFile(new URL("public/data/tech.json", root), "utf8"));
const people = new Map();
const grades = [["g3", "大三"], ["g2", "大二"]];
for (const group of groups) {
  for (const sub of group.subs) {
    for (const [key, grade] of grades) {
      for (const name of sub[key]) {
        const person = people.get(name) ?? { name, grade, roles: [] };
        if (person.grade !== grade) throw new Error(`${name} 的年级不一致`);
        person.roles.push(group.name === sub.name ? group.name : `${group.name} / ${sub.name}`);
        people.set(name, person);
      }
    }
  }
}

const count = (group, key) => new Set(group.subs.flatMap(sub => sub[key])).size;
const gradeCount = grade => [...people.values()].filter(person => person.grade === grade).length;
const lines = [
  "# RM2027 技术组当前名单",
  "",
  `共 **${people.size} 人**：大三 **${gradeCount("大三")} 人**，大二 **${gradeCount("大二")} 人**。`,
  "",
  "人数按统计范围内的实际人员计算；跨组兼任会在相应组内分别列出，因此各大组人数之和不等于总人数。两页人员差异见[第二页名单对照](RM2027-第二页名单对照.md)。",
  "",
  "| 组别 | 大三 | 大二 | 人数 |",
  "| --- | ---: | ---: | ---: |",
  ...groups.map(group => `| ${group.name} | ${count(group, "g3")} | ${count(group, "g2")} | ${count(group, "g3") + count(group, "g2")} |`),
  "",
];
const text = [`RM2027 技术组当前名单`, `共 ${people.size} 人：大三 ${gradeCount("大三")} 人，大二 ${gradeCount("大二")} 人。`, ""];
for (const group of groups) {
  const title = `${group.name}（${count(group, "g3") + count(group, "g2")} 人）`;
  lines.push(`## ${title}`, "");
  text.push(title);
  for (const sub of group.subs) {
    if (sub.name !== group.name) {
      lines.push(`### ${sub.name}（${sub.g3.length + sub.g2.length} 人）`, "");
      text.push(`  ${sub.name}（${sub.g3.length + sub.g2.length} 人）`);
    }
    for (const [key, grade] of grades) {
      const row = `${grade}（${sub[key].length} 人）：${sub[key].join("、") || "暂无"}`;
      lines.push(`- ${row}`);
      text.push(`  ${row}`);
    }
    lines.push("");
  }
  text.push("");
}
lines.push("## 全体人员索引", "", "| 序号 | 姓名 | 年级 | 所属组别 |", "| ---: | --- | --- | --- |");
let index = 0;
for (const [, grade] of grades) {
  for (const person of people.values()) {
    if (person.grade !== grade) continue;
    lines.push(`| ${++index} | ${person.name} | ${person.grade} | ${person.roles.join("；")} |`);
  }
}
lines.push("", "数据来源：`public/data/tech.json`。修改数据后运行 `pnpm export:roster` 重新生成。", "");
const output = new URL("exports/", root);
await mkdir(output, { recursive: true });
for (const [extension, content] of [["md", lines.join("\n")], ["txt", text.join("\n")]]) {
  const file = new URL(`RM2027-技术组当前名单.${extension}`, output);
  await writeFile(file, content, "utf8");
  console.log(fileURLToPath(file));
}

// 同步生成两页对照，避免人员分配更新后仍保留旧的待分配名单。
const cars = JSON.parse(await readFile(new URL("public/data/cars.json", root), "utf8"));
const carPeople = new Map();
const gradeLabels = { "2024级": "大三", "2025级": "大二" };
let assignments = 0;
function addCarPerson(name, grade, role) {
  const person = carPeople.get(name) ?? { name, grades: new Set(), roles: [] };
  if (grade) person.grades.add(grade);
  person.roles.push(role);
  carPeople.set(name, person);
  assignments += 1;
}
for (const robot of cars.robots) {
  for (const [grade, disciplines] of Object.entries(robot.crew)) {
    for (const [discipline, names] of Object.entries(disciplines)) {
      for (const name of names) addCarPerson(name, gradeLabels[grade] ?? grade, `${robot.name}／${discipline.replaceAll("+", "＋")}`);
    }
  }
}
for (const robot of cars.robots) {
  const leads = Array.isArray(robot.lead) ? robot.lead : robot.lead ? [robot.lead] : [];
  for (const name of leads) addCarPerson(name, people.get(name)?.grade, `${robot.name}／负责人`);
}
const missing = [...people.values()].filter(person => !carPeople.has(person.name));
const extra = [...carPeople.values()].filter(person => !people.has(person.name));
const shared = [...people.keys()].filter(name => carPeople.has(name)).length;
const comparison = [
  "# RM2027 第二页名单对照", "",
  `第二页现有 **${carPeople.size} 人、${assignments} 人次、${cars.robots.length} 个车组**。人次按每台车的工作与负责人任务累计；硬件＋电控为一项联合任务，每人每车计一次。跨车共享任务仍分别统计。`, "",
  `第一页 ${people.size} 人，两页共有 ${shared} 人；第一页独有 ${missing.length} 人，第二页独有 ${extra.length} 人。`, "",
  `## 第一页有、第二页尚未出现的 ${missing.length} 人`, "",
  "| 姓名 | 年级 | 第一页所属组别 |", "| --- | --- | --- |",
  ...missing.map(person => `| ${person.name} | ${person.grade} | ${person.roles.join("；")} |`), "",
  `## 第二页有、第一页尚未出现的 ${extra.length} 人`, "",
  "| 姓名 | 年级 | 当前车组任务 |", "| --- | --- | --- |",
  ...extra.map(person => `| ${person.name} | ${[...person.grades].join("／") || "待确认"} | ${person.roles.join("；")} |`), "",
  "## 当前负责人", "", "| 车组 | 负责人 |", "| --- | --- |",
  ...cars.robots.map(robot => `| ${robot.name} | ${Array.isArray(robot.lead) ? robot.lead.join("、") : robot.lead || "未指定"} |`), "",
  "数据来源：`public/data/tech.json`、`public/data/cars.json`。运行 `pnpm export:roster` 更新本对照。", "",
];
const comparisonFile = new URL("RM2027-第二页名单对照.md", output);
await writeFile(comparisonFile, comparison.join("\n"), "utf8");
console.log(fileURLToPath(comparisonFile));
