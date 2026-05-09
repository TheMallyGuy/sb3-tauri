import { readFile, writeFile } from "fs/promises"
import path from "path"
import { exec } from "child_process";
import chalk from "chalk";

export const config = {
    packageManager: "pnpm"
}

export type TauriConfig = {
    productName: string
    identifier: string
    app: {
        windows: [
            {
                title: string
                width: number
                height: number
            }
        ]
    }
}

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

export async function readJson(jsonPath: string): Promise<TauriConfig> {
    try {
        const tauri = path.join(jsonPath, "tauri.conf.json")
        const text = await readFile(tauri, "utf-8")
        return JSON.parse(text) as TauriConfig
    } catch (err) {
        console.error(chalk.red(`✖ Something went wrong reading config: ${err}`))
        throw err
    }
}

export async function saveJson(jsonPath: string, content: TauriConfig) {
    try {
        const tauri = path.join(jsonPath, "tauri.conf.json")
        await writeFile(tauri, JSON.stringify(content, null, 2), "utf-8")
        console.log(chalk.green("✔ Wrote patch!"))
    } catch (err) {
        console.error(chalk.red(`✖ Something went wrong saving config: ${err}`))
        throw err
    }
}

function execAsync(command: string, cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        exec(command, { cwd: path.join(cwd) }, (error, stdout, stderr) => {
            if (error) {
                console.error(chalk.red("✖ Command failed"))
                console.error(chalk.red(error.message))
                if (stderr) console.error(chalk.yellow(stderr))
                reject(error)
                return
            }
            if (stdout) console.log(chalk.gray(stdout))
            resolve()
        })
    })
}

export async function setIcon(iconFile: string, tauriBin: string) {
    await execAsync(`${config.packageManager} tauri icon "${path.resolve(iconFile)}"`, tauriBin)
    console.log(chalk.green("✔ Wrote icon"))
}

export async function installDeps(tauriBin: string) {
    await execAsync(`${config.packageManager} i`, tauriBin)
    console.log(chalk.green("✔ Installed all deps"))
}

export async function buildApp(tauriBin: string) {
    await execAsync(`${config.packageManager} tauri build --no-bundle`, tauriBin)
    console.log(chalk.green("✔ Built"))
}

export async function applyPatch(
    patchFile: TauriConfig,
    identifier?: string,
    appName?: string,
    width?: number,
    height?: number
): Promise<TauriConfig> {
    try {
        const uuid = uuidv4()
        patchFile.identifier = identifier ?? `com.mally.sb3-tauri.packaged-${uuid}`
        patchFile.productName = appName ?? `sb3-tauri-${uuid}`
        patchFile.app.windows = [
            {
                title: appName ?? "sb3 Tauri App",
                width: width ?? 480,
                height: height ?? 360
            }
        ]
        console.log(chalk.cyan(`⚙ Patched app with uuid: ${chalk.bold(uuid)}`))
        return patchFile as TauriConfig
    } catch (err) {
        console.error(chalk.red(`✖ Something went wrong when creating patch: ${err}`))
        throw err
    }
}