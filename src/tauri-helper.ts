
import { readFile, writeFile } from "fs/promises"
import path from "path"
import { exec } from "child_process";


export type TauriConfig = { // jsut leave this on export might need later
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
        console.error(`Something went wrong: ${err}`)

        throw err
    }
}

export async function saveJson(
    jsonPath: string,
    content: TauriConfig
) {
    try {
        const tauri = path.join(jsonPath, "tauri.conf.json")

        await writeFile(
            tauri,
            JSON.stringify(content, null, 2),
            "utf-8"
        )

        console.log("Wrote patch! \n")
    } catch (err) {
        console.error(`Something went wrong: ${err}`)

        throw err
    }
}

export async function setIcon(iconFile: string, tauriBin: string) {
    exec(
        `pnpm tauri icon "${path.resolve(iconFile)}"`,
        {
            cwd: path.join(tauriBin)
        },
        (error, stdout, stderr) => {
            if (error) {
                console.error("Command failed")
                console.error(error.message)
                console.error(stderr)
                return
            }

            console.log(stdout)
        }
    )
    console.log("Wrote Icon");
}

export async function installDeps(tauriBin: string) {
        exec(
        `pnpm i`,
        {
            cwd: path.join(tauriBin)
        },
        (error, stdout, stderr) => {
            if (error) {
                console.error("Command failed")
                console.error(error.message)
                console.error(stderr)
                return
            }

            console.log(stdout)
        }
    )
    console.log("Installed all deps");
}

export async function applyPatch(patchFile: TauriConfig, identifier?: string, appName?: string, width?: number, height?: number): Promise<TauriConfig> {
    try {
        const uuid = uuidv4() // im sure 100% there is a much better way to do this

        patchFile.identifier = identifier ?? `com.mally.sb3-tauri.packaged-${uuid}`
        patchFile.productName = identifier ?? `sb3-tauri-${uuid}`

        patchFile.app.windows = [
            {
                title: "sb3 Tauri App",
                height: height ?? 489,
                width: height ?? 650
            }
        ]

        console.log(`Patched app with uuid : ${uuid}`)

        return patchFile as TauriConfig
    } catch (err) {
        console.log(`Something went wrong when creating patch : ${err}`)

        throw err
    }
}