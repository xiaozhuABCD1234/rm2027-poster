import type { Robot } from "../data/roster";

export interface CarCellRun {
  start: number;
  span: number;
  names: string[];
}

export interface CarWorkRun extends CarCellRun {
  rowSpan: number;
  work: string;
}

export function carWorkRuns(robots: Robot[], grade: string, work: string): CarWorkRun[] {
  const runs: CarWorkRun[] = [];
  robots.forEach((robot, start) => {
    const crew = robot.crew[grade] ?? {};
    const key = Object.keys(crew).find(key => key === work || key.startsWith(`${work}+`));
    if (!key || !crew[key].length) return;
    const names = crew[key];
    const rowSpan = key.split("+").length;
    const last = runs[runs.length - 1];
    if (last && last.start + last.span === start && last.rowSpan === rowSpan && last.work === key &&
      names.length === last.names.length && names.every((name, i) => name === last.names[i])) {
      last.span += 1;
    } else {
      runs.push({ start, span: 1, rowSpan, work: key, names });
    }
  });
  return runs;
}

/** 合并只改变展示；每台车的数据和统计保持独立。 */
export function carCellRuns(
  robots: Robot[],
  readNames: (robot: Robot) => string[],
): CarCellRun[] {
  const runs: CarCellRun[] = [];
  robots.forEach((robot, start) => {
    const names = readNames(robot);
    if (!names.length) return;
    const last = runs[runs.length - 1];
    if (last && last.start + last.span === start &&
      names.length === last.names.length && names.every((name, i) => name === last.names[i])) {
      last.span += 1;
    } else {
      runs.push({ start, span: 1, names });
    }
  });
  return runs;
}
