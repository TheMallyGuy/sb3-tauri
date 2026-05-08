import { exec } from "child_process";


function testInstallation() {
    try {
        exec("rustup", (error, stdout, stderr) => {
            if (error) {
                console.log("You don't have Rustup installed. Please Follow Tauri Prerequisites and then try again.")
            }
        })

    } catch (error) {
        console.log(`Someting went wrong during checking your installation. Please make sure that you have met Tauri's prerequisites! \n Tauri Prerequisites : https://tauri.app/start/prerequisites \n Logs : ${error}`)
        return
    }
}