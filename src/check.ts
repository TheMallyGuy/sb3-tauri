import { exec } from "child_process";

export function testInstallation() { // more tests in the future
  exec("rustup --version", (error, stdout, stderr) => {
    if (error) {
      console.log(
        `You don't have Rustup installed. Please follow Tauri Prerequisites and then try again.\n` +
        `Tauri Prerequisites: https://tauri.app/start/prerequisites\n` +
        `Logs: ${stderr || error.message}`
      );
      return;
    }

    console.log(`Health check complete with no errors. (${stdout.trim()})`);
  });
}