import { exec } from "child_process";
import { promisify } from "util";
import { config } from './tauri-helper';

const execPromise = promisify(exec);

async function checkDependency(command: string, name: string): Promise<boolean> {
  try {
    const { stdout } = await execPromise(`${command} --version`);
    console.log(`${name} is installed! (${stdout.trim()})`);
    return true;
  } catch {
    console.log(
      `${name} is not installed or not in PATH.\n` +
      `Tauri Prerequisites: https://tauri.app/start/prerequisites`
    );
    return false;
  }
}

export async function testInstallation() {
  const results = await Promise.all([
    checkDependency("rustup", "rustup"),
    checkDependency(config.packageManager, config.packageManager),
  ]);

  if (results.every(Boolean)) {
    console.log("Health check complete with no errors.");
  } else {
    console.log("Health check failed. Please install the missing dependencies and try again.");
  }
}