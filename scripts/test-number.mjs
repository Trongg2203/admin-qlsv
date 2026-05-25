// Lightweight, dependency-free unit test for utils/number.ts.
//
// The project has no jest runner configured, so this compiles the pure
// formatter on the fly and asserts the behaviour that fixes the height bug
// (180 must render "180", never "18"). Run with: npm run test:number
//
// If the team later adds jest, the same cases can move into a *.test.ts file.

import assert from "node:assert";
import { execSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = mkdtempSync(join(tmpdir(), "numtest-"));

try {
  execSync(
    `npx tsc utils/number.ts --outDir "${out}" --module commonjs --target es2019 --skipLibCheck`,
    { cwd: root, stdio: "inherit" },
  );

  const { formatDecimalDisplay: f } = require(join(out, "number.js"));

  const cases = [
    [180, 0, "180"], // the reported bug — must NOT become "18"
    [70, 2, "70"],
    [100, 0, "100"],
    [200, 0, "200"],
    [150, 0, "150"],
    [1500, 0, "1500"],
    [70.5, 2, "70.5"],
    [180.0, 2, "180"],
    [65, 2, "65"],
    [70.25, 1, "70.3"],
    ["180", 0, "180"],
    [0, 0, "0"],
    [null, 0, ""],
  ];

  for (const [value, dp, expected] of cases) {
    const got = f(value, { decimalPlaces: dp });
    assert.strictEqual(
      got,
      expected,
      `formatDecimalDisplay(${JSON.stringify(value)}, dp=${dp}) => ${JSON.stringify(got)}, expected ${JSON.stringify(expected)}`,
    );
  }

  assert.strictEqual(
    f(180, { decimalPlaces: 0 }),
    "180",
    "height 180 must render '180', never '18'",
  );

  console.log(`✓ utils/number.ts: ${cases.length} cases passed (180 -> "180").`);
} finally {
  rmSync(out, { recursive: true, force: true });
}
