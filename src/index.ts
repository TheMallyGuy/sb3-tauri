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


program.parse(process.argv);

