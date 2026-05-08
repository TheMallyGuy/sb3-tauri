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
    .action(async (option) =>{
        build(option.sb3, option.identifier, option.name)
    })

program.parse(process.argv);

