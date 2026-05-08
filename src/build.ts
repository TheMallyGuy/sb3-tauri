import { testInstallation } from "./check"
import chalk from 'chalk'
import { applyPatch, readJson, TauriConfig } from "./tauri-helper";

export const build = async (pathToSb3: string, identifier?: string, appName?: string, width?: number, height?: string) => {
    console.log("Stand by, we're getting things ready!!")

    await testInstallation()

    console.log('\n')
    console.log("Building app")

    console.log("Creating new patch")

    const tauri = "./tauri-bin/src-tauri/"

    const data: TauriConfig = await readJson(tauri)

    await applyPatch(data)

    console.log("Done!")
}