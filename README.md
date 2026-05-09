<p align="center">
    <img src="/logo.png" width="380">
<p>

# sb3 to tauri

Turn any scratch (.sb3) or any forks into a tiny tauri app.

# usage
Follow the [Tauri's prerequisites](https://tauri.app/start/prerequisites/) to get started.

Once you have all Tauri's prerequisites, download the source code and install dependencies :

```
npm i
```

Use any package manager that you i'd like! In this example ill use npm.

Once you done, you can do something like : 

```
npm run sb3-tauri --sb3 './templates/Scratch Project.sb3' --identifier 'com.your-name.my-new-scratch-project' --name 'scratch game' --icon './templates/sb32Tauri.svg'
```

You can customize this command however you want it to be! Let me break it down for you :

`--sb3` : Path to your sb3.
`--identifier`: Your identifier for the app, this is not required (sb3-tauri automatically generate for you) but you should set your identifier to something you would.
`--name` : Name of the main window
`--icon` : Path to the icon you would use for the app
