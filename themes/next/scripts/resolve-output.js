#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");

function resolveConfigPath(rawPath) {
  if (!rawPath) {
    throw new Error("Config path is required.");
  }

  return path.isAbsolute(rawPath)
    ? rawPath
    : path.resolve(process.cwd(), rawPath);
}

function loadConfig(configPath) {
  const file = fs.readFileSync(configPath, "utf8");
  return yaml.load(file);
}

function resolveOutput(configPath, config) {
  if (!config || !config.planet || !config.planet.output) {
    throw new Error(
      "planet.output is missing in configuration. Please specify an output directory."
    );
  }

  const basePath = path.dirname(configPath);
  const outputDir = path.resolve(basePath, config.planet.output);
  const dataPath = path.join(outputDir, "data.json");

  return {
    basePath,
    outputDir,
    dataPath,
  };
}

function main(rawPath) {
  const configPath = resolveConfigPath(rawPath);
  const config = loadConfig(configPath);
  return resolveOutput(configPath, config);
}

module.exports = {
  main,
  resolveConfigPath,
  loadConfig,
  resolveOutput,
};

if (require.main === module) {
  try {
    const configPath = process.argv[2];
    const result = main(configPath || "./config.yml");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
