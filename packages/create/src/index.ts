import { select, input, confirm } from "@inquirer/prompts";
import path from "node:path";
import os from "node:os";
import fse from "fs-extra";
import { glob } from "glob";
import ora from "ora";
import ejs from "ejs";

import { NpmPackage } from "@talon-cli/utils";

async function create() {
  const projectTemplate = await select({
    message: "请选择项目模板",
    choices: [
      {
        name: "react 项目",
        value: "@talon-cli/template-react",
      },
      {
        name: "vue 项目",
        value: "@talon-cli/template-vue",
      },
    ],
  });

  let projectName = "";

  while (!projectName) {
    projectName = await input({ message: "请输入项目名" });
  }

  const targetPath = path.join(process.cwd(), projectName);

  if (fse.existsSync(targetPath)) {
    const empty = await confirm({
      message: "该目录不为空，是否清空？",
    });
    if (empty) {
      fse.emptyDirSync(targetPath);
    } else {
      process.exit(0);
    }
  }

  const pkg = new NpmPackage({
    name: projectTemplate,
    targetPath: path.join(os.homedir(), ".talon-cli-template"),
  });

  if (!(await pkg.exists())) {
    const spinner = ora("下载模板中...").start();
    await pkg.install();
    spinner.stop();
  } else {
    const spinner = ora("更新模板中...").start();
    await pkg.update();
    spinner.stop();
  }

  const spinner = ora("创建项目中...").start();

  const templatePath = path.join(pkg.npmFilePath, "template");

  fse.copySync(templatePath, targetPath);

  spinner.stop();

  const renderData: Record<string, any> = { projectName };
  const deleteFiles: string[] = [];

  const questionConfigPath = path.join(pkg.npmFilePath, "questions.json");

  if (fse.existsSync(questionConfigPath)) {
    const config = fse.readJSONSync(questionConfigPath);

    for (let key in config) {
      const res = await confirm({ message: "是否启用 " + key });
      renderData[key] = res;

      if (!res) {
        deleteFiles.push(...config[key].files);
      }
    }
  }

  const files = await glob("**", {
    cwd: targetPath,
    nodir: true,
    ignore: "node_modules/**",
  });

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(targetPath, files[i]);
    const renderResult = await ejs.renderFile(filePath, renderData);

    fse.writeFileSync(filePath, renderResult);
  }

  deleteFiles.forEach((item) => {
    fse.removeSync(path.join(targetPath, item));
  });
}

export default create;
