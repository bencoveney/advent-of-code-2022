import fs from "fs/promises";
import { festive, Input, loadSolutions, PartAnswer } from "./utils.js";
import chalk from "chalk";

async function loadFile(name: string): Promise<Input | null> {
  try {
    const raw = (await fs.readFile(name, "utf8")).trimEnd();
    const allLines = raw.split("\n");
    const lines = allLines.filter((line) => !!line);
    const chars = lines[0]?.split("") || [];
    return { raw, allLines, lines, chars };
  } catch (e) {
    console.log(`${name} not found`);
    return null;
  }
}

async function loadInputs(
  solution: string
): Promise<[Input | null, Input | null]> {
  return [
    await loadFile(`./src/${solution.slice(0, 2)}.test.txt`),
    await loadFile(`./src/${solution.slice(0, 2)}.input.txt`),
  ];
}

function runPartAgainstInput(
  part: PartAnswer | undefined,
  input: Input | null,
  expected: any,
  name: string
): boolean {
  if (!part) {
    console.log(chalk.gray(`- ${name}: No part()`));
    return false;
  }
  if (!input || !input.raw) {
    console.log(chalk.gray(`- ${name}: No Input`));
    return false;
  }
  let result = undefined;
  try {
    result = part(input);
  } catch (e) {
    console.error((e && (e as Error).message) || e);
    result = chalk.redBright("err");
  }
  if (!result) {
    console.log(chalk.gray(`- ${name}: No Result`));
    return false;
  }
  const correct =
    expected === undefined
      ? chalk.gray("Unknown")
      : Object.is(result, expected)
      ? chalk.greenBright("Correct")
      : chalk.redBright(`Expected ${expected}`);
  console.log(`${chalk.gray(`- ${name}:`)} ${result} (${correct})`);
  return Object.is(result, expected);
}

function writeTitle(text: string) {
  console.log(`${festive("---")} ${chalk.underline(text)} ${festive("---")}`);
}

async function runSolution(solution: string) {
  writeTitle(solution);
  const [test, real] = await loadInputs(solution);
  const loadedSolution = await import(`./${solution}`);

  console.log("\nPart 1:");
  const part1TestPassed = runPartAgainstInput(
    loadedSolution.part1,
    test,
    loadedSolution.part1?.test,
    "Test"
  );
  part1TestPassed &&
    runPartAgainstInput(
      loadedSolution.part1,
      real,
      loadedSolution.part1?.real,
      "Real"
    );

  console.log("\nPart 2:");
  const part2TestPassed = runPartAgainstInput(
    loadedSolution.part2,
    test,
    loadedSolution.part2?.test,
    "Test"
  );
  part2TestPassed &&
    runPartAgainstInput(
      loadedSolution.part2,
      real,
      loadedSolution.part2?.real,
      "Real"
    );

  console.log("");
}

const solutions = await loadSolutions();
if (process.argv.includes("--all")) {
  await solutions.reduce(
    (prev, next) => prev.then(() => runSolution(next)),
    Promise.resolve()
  );
} else {
  await runSolution(solutions[solutions.length - 1]);
}
