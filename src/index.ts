import { program } from 'commander';
import { build } from './build';
import * as fs from 'fs';
import * as path from 'path';

program
    .name("tauri-sb3")
    .version(JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), { encoding: 'utf-8' })).version)
    .action(async () => {
        console.log("world hello! type --help to see how to use sb3-tauri")
    })


program
    .command("build")
    .description("build a .sb3 to a Tauri app.")
    .requiredOption("--sb3 <path to sb3>")
    .option("--identifier <identifier>", "identifier for the app, e.g com.mally.my-scratch-project ")
    .option("--name <name>", "name for the app, e.g my new scratch game")
    .option("--width <number>", "change width of the app")
    .option("--height <number>", "change the height of the app")
    .option("--icon <path to icon>", "change the icon of the app (svg, png)")
    .option("--package-manager <manager>", "package manager to use (pnpm, npm, yarn)")
    .action(async (option) => {
        build(option.sb3, option.identifier, option.name, option.width, option.height, option.icon, option.packageManager)
    })

program.parse(process.argv);

