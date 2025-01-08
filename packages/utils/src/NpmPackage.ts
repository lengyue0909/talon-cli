// @ts-ignore
import npminstall from "npminstall";
import fse from "fs-extra";
import fs from "node:fs";
import path from "node:path";
import { getLatestVersion, getNpmRegistry } from "./versionUtils.js";

interface NpmPackageOptions {
  name: string;
  targetPath: string;
}

class NpmPackage {
  private name: string;
  private version = "";
  private targetPath: string;
  private storePath: string;

  constructor(options: NpmPackageOptions) {
    this.name = options.name;
    this.targetPath = options.targetPath;

    this.storePath = path.resolve(options.targetPath, "node_modules");
  }

  async prepare() {
    if (!fs.existsSync(this.targetPath)) {
      fse.mkdirpSync(this.targetPath);
    }

    const version = await getLatestVersion(this.name);
    this.version = version;
  }

  async install() {
    await this.prepare();

    await npminstall({
      root: this.targetPath,
      registry: getNpmRegistry(),
      pkgs: [{ name: this.name, version: this.version }],
    });
  }

  get npmFilePath() {
    return path.resolve(
      this.storePath,
      `./store/${this.name.replace("/", "+")}@${this.version}/node_modules/${
        this.name
      }`
    );
  }

  async exists() {
    await this.prepare();

    return fs.existsSync(this.npmFilePath);
  }

  async getPackageJson() {
    if (await this.exists()) {
      return fse.readJSONSync(path.resolve(this.npmFilePath, "package.json"));
    }

    return null;
  }

  async getLatestVersion() {
    return getLatestVersion(this.name);
  }

  async update() {
    const latestVersion = await getLatestVersion(this.name);
    return npminstall({
      root: this.targetPath,
      registry: getNpmRegistry(),
      pkgs: [{ name: this.name, version: latestVersion }],
    });
  }
}

export default NpmPackage;
