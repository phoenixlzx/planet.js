#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { main: resolveOutput } = require("./resolve-output");

function runNextBuild(env, args = []) {
  const result = spawnSync(
    "npm",
    ["run", "build", "--silent", ...args],
    {
      cwd: path.resolve(__dirname, ".."),
      stdio: "inherit",
      env: {
        ...process.env,
        ...env,
      },
    }
  );

  if (result.status !== 0) {
    throw new Error("Next.js build failed.");
  }
}

function copyDir(from, to) {
  fs.rmSync(to, { recursive: true, force: true });
  fs.mkdirSync(to, { recursive: true });

  fs.cpSync(from, to, {
    recursive: true,
    force: true,
    dereference: true,
  });
}

function run() {
  const argv = process.argv.slice(2);
  let rawConfigPath = "./config.yml";

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--config" && argv[i + 1]) {
      rawConfigPath = argv[i + 1];
      break;
    }
    if (arg && arg.startsWith("--config=")) {
      rawConfigPath = arg.split("=")[1];
      break;
    }
    if (!arg.startsWith("--")) {
      rawConfigPath = arg;
      break;
    }
  }

  const { outputDir, dataPath } = resolveOutput(rawConfigPath);

  if (!fs.existsSync(dataPath)) {
    throw new Error(
      `data.json not found at ${dataPath}. Run the planet command first (format=json).`
    );
  }

  const env = {
    PLANET_DATA_PATH: dataPath,
    PLANET_OUTPUT_DIR: outputDir,
  };

  console.log("[next] building static site...");
  runNextBuild(env);

  const exportDir = path.resolve(__dirname, "..", "out");
  if (!fs.existsSync(exportDir)) {
    throw new Error("Next.js export directory not found.");
  }

  console.log(`[next] copying output to ${outputDir}`);
  copyDir(exportDir, outputDir);

  console.log("[next] build complete.");
}

if (require.main === module) {
  try {
    run();
  } catch (error) {
    console.error(`[next] ${error.message}`);
    process.exit(1);
  }
}

module.exports = { run };
