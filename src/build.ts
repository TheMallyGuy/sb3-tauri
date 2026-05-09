import { testInstallation } from "./check"
import chalk from 'chalk'
import { applyPatch, buildApp, installDeps, readJson, saveJson, setIcon, TauriConfig } from "./tauri-helper";
import { readFileSync, writeFileSync } from "fs";
import { Packager, loadProject } from '@turbowarp/packager';
import { join } from "path";
import { config } from "./tauri-helper"

export const build = async (
    pathToSb3: string,
    identifier?: string,
    appName?: string,
    width?: number,
    height?: number,
    iconPath?: string,
    packageManager?: string,
) => {
    console.log(chalk.cyan.bold("Stand by, we're getting things ready!!"))

    config.packageManager = packageManager ?? 'npm'

    await testInstallation()
    console.log(chalk.cyan.bold("Building app"))
    console.log(chalk.blue("⚙ Creating new patch..."))

    const tauri = "./tauri-bin/src-tauri/"
    const data: TauriConfig = await readJson(tauri)
    const patch = await applyPatch(data, identifier, appName, width, height)
    await saveJson(tauri, patch)

    console.log(chalk.blue("⚙ Installing dependencies..."))
    await installDeps(tauri)

    console.log(chalk.blue("⚙ Setting icon..."))
    await setIcon(iconPath ?? './templates/sb32Tauri.svg', tauri)

    console.log(chalk.blue("⚙ Packaging..."))
    const sb3Buffer = readFileSync(pathToSb3);
    const loadedProject = await loadProject(sb3Buffer, () => { });
    const p = new Packager();

    p.project = loadedProject;
    p.options.target = 'html';

    const { data: html } = await p.package();
    writeFileSync(join("./tauri-bin/src/index.html"), html as string);

    console.log(chalk.blue("⚙ Building app..."))
    await buildApp(tauri)

    console.log('\n')
    console.log(chalk.green.bold("✔ Done!"))
}