import { testInstallation } from "./check"
import chalk from 'chalk'
import { applyPatch, buildApp, installDeps, readJson, saveJson, setIcon, TauriConfig, config } from "./tauri-helper";
import { readFileSync, writeFileSync, mkdirSync, fstat } from "fs";
import { join } from "path";
import fs from 'node:fs'
import https from "node:https"

const SCAFFOLDING_VERSION = '3.12.0';

interface ScaffoldingOptions {
  turboMode?: boolean;
  interpolation?: boolean;
  framerate?: number;
  highQualityRender?: boolean;
  maxClones?: number;
  fencing?: boolean;
  miscLimits?: boolean;
  accentColor?: string;
  username?: string;
  cloudDataEnabled?: boolean;
  resizeMode?: 'dynamic-resize' | 'preserve-ratio' | 'stretch';
  showLaunchScreen?: boolean;
  editableLists?: boolean;
}

function generateHtml(
  sb3Buffer: Buffer,
  width: number,
  height: number,
  scaffolding_type: string,
  options: ScaffoldingOptions = {}
): string {
  const base64 = sb3Buffer.toString('base64');

  const {
    turboMode = false,
    interpolation = false,
    framerate = 30,
    highQualityRender = false,
    maxClones = 300,
    fencing = true,
    miscLimits = true,
    accentColor = '#ff4c4c',
    username = 'player####',
    cloudDataEnabled = false,
    resizeMode = 'dynamic-resize',
    showLaunchScreen = true,
    editableLists = false,
  } = options;

  const usernameJs = username.includes('#')
    ? `"${username}".replace(/#/g, () => Math.floor(Math.random() * 10))`
    : `"${username}"`;

  const cloudProviderJs = cloudDataEnabled
    ? `
      try {
        scaffolding.addCloudProvider(
          new Scaffolding.Cloud.WebSocketProvider(
            ["wss://clouddata.turbowarp.org", "wss://clouddata.turbowarp.xyz"],
            "project"
          )
        );
      } catch (e) { console.error('Cloud provider failed:', e); }`
    : '';

  const launchScreenHtml = showLaunchScreen
    ? `
    <div id="launch" style="
      position:absolute;top:0;left:0;width:100%;height:100%;
      background:rgba(0,0,0,0.7);display:flex;align-items:center;
      justify-content:center;cursor:pointer;z-index:10;
    ">
      <div style="
        width:80px;height:80px;padding:16px;border-radius:100%;
        background:rgba(255,255,255,0.75);border:3px solid white;
        display:flex;justify-content:center;align-items:center;box-sizing:border-box;
      ">
        <svg viewBox="0 0 16.63 17.5" width="42" height="44">
          <defs><style>.cls-1,.cls-2{fill:#4cbf56;stroke:#45993d;stroke-linecap:round;stroke-linejoin:round;}.cls-2{stroke-width:1.5px;}</style></defs>
          <path class="cls-1" d="M.75,2A6.44,6.44,0,0,1,8.44,2h0a6.44,6.44,0,0,0,7.69,0V12.4a6.44,6.44,0,0,1-7.69,0h0a6.44,6.44,0,0,0-7.69,0"/>
          <line class="cls-2" x1="0.75" y1="16.75" x2="0.75" y2="0.75"/>
        </svg>
      </div>
    </div>`
    : '';

  const launchScreenJs = showLaunchScreen
    ? `
      const launch = document.getElementById('launch');
      launch.addEventListener('click', () => {
        launch.style.display = 'none';
        scaffolding.start();
      });`
    : `scaffolding.start();`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #000; color: #fff; font-family: sans-serif; }
    #project { width: 100%; height: 100%; position: relative; }
    #error-screen {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      display: none; flex-direction: column; align-items: center;
      justify-content: center; background: #000; z-index: 30; padding: 20px;
    }
    #error-message {
      font-family: monospace; max-width: 600px;
      white-space: pre-wrap; text-align: left;
    }
  </style>
</head>
<body>
  <div id="project">
    ${launchScreenHtml}
    <div id="error-screen">
      <h1>Error</h1>
      <pre id="error-message"></pre>
    </div>
  </div>

  <script src="./${scaffolding_type}"></script>
  <script>
    const errorScreen = document.getElementById('error-screen');
    const errorMessage = document.getElementById('error-message');

    const handleError = (err) => {
      console.error(err);
      errorScreen.style.display = 'flex';
      errorMessage.textContent = String(err) + '\\n' + (err?.stack || '');
    };

    try {
      const scaffolding = new Scaffolding.Scaffolding();
      scaffolding.width = ${width};
      scaffolding.height = ${height};
      scaffolding.resizeMode = '${resizeMode}';
      scaffolding.editableLists = ${editableLists};
      scaffolding.usePackagedRuntime = true;
      scaffolding.setup();
      scaffolding.appendTo(document.getElementById('project'));

      const vm = scaffolding.vm;
      window.scaffolding = scaffolding;
      window.vm = vm;
      window.Scratch = {
        vm,
        renderer: vm.renderer,
        audioEngine: vm.runtime.audioEngine,
        bitmapAdapter: vm.runtime.v2BitmapAdapter,
        videoProvider: vm.runtime.ioDevices.video.provider
      };

      scaffolding.setUsername(${usernameJs});
      scaffolding.setAccentColor('${accentColor}');
      ${cloudProviderJs}

      vm.setTurboMode(${turboMode});
      if (vm.setInterpolation) vm.setInterpolation(${interpolation});
      if (vm.setFramerate) vm.setFramerate(${framerate});
      if (vm.renderer.setUseHighQualityRender) vm.renderer.setUseHighQualityRender(${highQualityRender});
      if (vm.setRuntimeOptions) vm.setRuntimeOptions({
        fencing: ${fencing},
        miscLimits: ${miscLimits},
        maxClones: ${maxClones},
      });
      if (vm.setCompilerOptions) vm.setCompilerOptions({
        enabled: true,
        warpTimer: false,
      });
      if (vm.renderer.setMaxTextureDimension) vm.renderer.setMaxTextureDimension(2048);
      if (vm.runtime.setEnforcePrivacy) vm.runtime.setEnforcePrivacy(false);

      scaffolding.setExtensionSecurityManager({
        getSandboxMode: () => 'unsandboxed',
        canLoadExtensionFromProject: () => true,
      });

      const base64 = "${base64}";
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      scaffolding.loadProject(bytes.buffer)
        .then(() => {
          ${launchScreenJs}
        })
        .catch(handleError);

    } catch (e) {
      handleError(e);
    }
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
      fs.unlink(dest, () => { });
      reject(err);
    });

    file.on("error", (err) => {
      fs.unlink(dest, () => { });
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
  options?: ScaffoldingOptions,
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
  const html = generateHtml(sb3Buffer, resolvedWidth, resolvedHeight, "scaffolding-full.js", options ?? {});

  const outDir = "./tauri-bin/src";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html);

  console.log(chalk.blue("⚙ Building app..."))
  await buildApp(tauri)

  console.log('\n')
  console.log(chalk.green.bold("✔ Done!"))
}