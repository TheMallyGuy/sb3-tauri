import { testInstallation } from "./check"
import chalk from 'chalk'
import { applyPatch, readJson, saveJson, TauriConfig } from "./tauri-helper";
import { readFileSync, writeFileSync } from "fs";
import { Packager, loadProject } from '@turbowarp/packager';
import { join } from "path";

export const build = async (pathToSb3: string, identifier?: string, appName?: string, width?: number, height?: string) => {
    console.log("Stand by, we're getting things ready!!")

    await testInstallation()

    console.log('\n')
    console.log("Building app \n")

    console.log("Creating new patch \n")

    const tauri = "./tauri-bin/src-tauri/"

    const data: TauriConfig = await readJson(tauri)

    const patch = await applyPatch(data)

    await saveJson(tauri, patch)

    console.log("Packaging...\n")

    const sb3Buffer = readFileSync(pathToSb3);

    const loadedProject = await loadProject(sb3Buffer, () => { });

    const p = new Packager();
    
    p.project = loadedProject;
    
    p.options.target = 'html';

    const { data: html } = await p.package();
    
    writeFileSync(join("./tauri-bin/src/index.html"), html as string);
    
    console.log("\n");

    console.log("Done!")
}