import { testInstallation } from "./check"
import chalk from 'chalk'
import { applyPatch, buildApp, installDeps, readJson, saveJson, setIcon, TauriConfig, config } from "./tauri-helper";
import { readFileSync, writeFileSync, mkdirSync, fstat } from "fs";
import { join } from "path";
import fs from 'node:fs'
import https from "node:https"

const SCAFFOLDING_VERSION = '3.12.0'; // pin this, never use @latest

function generateHtml(sb3Buffer: Buffer, width: number, height: number, scaffolding_type: string): string {
    const base64 = sb3Buffer.toString('base64');
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
    #project { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="project"></div>
  <script src="./${scaffolding_type}"></script>
  <script>
    const base64 = "${base64}";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const scaffolding = new Scaffolding.Scaffolding();
    scaffolding.width = ${width};
    scaffolding.height = ${height};
    scaffolding.resizeMode = 'dynamic-resize';
    scaffolding.setup();
    scaffolding.appendTo(document.getElementById('project'));

    scaffolding.loadProject(bytes.buffer)
      .then(() => scaffolding.start())
      .catch(console.error);
  </script>
</body>
</html>`;
}

async function get_packager(tauri_bin: string) {
  const packagerUrl =
    `https://cdn.jsdelivr.net/npm/@turbowarp/packager@${SCAFFOLDING_VERSION}/dist/scaffolding/scaffolding-full.js`;

  const dest = join(
    tauri_bin,
    "src",
    "scaffolding-full.js"
  );

  return new Promise<void>((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    https.get(packagerUrl, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      res.pipe(file);

      file.on("finish", () => {
        file.close();
        resolve();
      });
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });

    file.on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

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
    const bin = "./tauri-bin"
    const data: TauriConfig = await readJson(tauri)
    const patch = await applyPatch(data, identifier, appName, width, height)
    await saveJson(tauri, patch)

    console.log(chalk.blue("⚙ Installing dependencies..."))
    await installDeps(bin)
    await get_packager(bin)

    console.log(chalk.blue("⚙ Setting icon..."))
    await setIcon(iconPath ?? './templates/sb32Tauri.svg', tauri)

    console.log(chalk.blue("⚙ Packaging..."))
    const sb3Buffer = readFileSync(pathToSb3);
    const resolvedWidth = width ?? 480;
    const resolvedHeight = height ?? 360;
    const html = generateHtml(sb3Buffer, resolvedWidth, resolvedHeight, "scaffolding-full.js");

    const outDir = "./tauri-bin/src";
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "index.html"), html);

    console.log(chalk.blue("⚙ Building app..."))
    await buildApp(tauri)

    console.log('\n')
    console.log(chalk.green.bold("✔ Done!"))
}