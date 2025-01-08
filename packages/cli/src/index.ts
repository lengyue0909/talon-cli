#!/usr/bin/env node
import create from "@talon-cli/create";
import { Command } from "commander";
import fse from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pkgJson = fse.readJSONSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../package.json")
);

const program = new Command();

program
  .name("talon-cli")
  .description("Talon CLI 脚手架")
  .version(pkgJson.version);

program
  .command("create")
  .description("创建项目")
  .action(async () => {
    await create();
  });

program.parse(process.argv);
