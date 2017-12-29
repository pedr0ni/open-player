const { app, BrowserWindow, Menu, Tray, dialog, ipcMain } = require('electron');

let $TITLE = "open-player";

var start = Date.now();
console.log("[INFO] Initializing app...");

app.on('ready', () => {
    var ready = Date.now() - start;
    console.log("[INFO] App ready in "+ready+"ms !");
    let mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        maximizable: false,
        resizable: false,
        frame: false,
        icon: __dirname + "/app/assets/images/music_default.png",
        show: false
    });
    mainWindow.loadURL(`${__dirname}/app/view/index/index.html`);
    mainWindow.on('ready-to-show', ()=> {
        mainWindow.show();
    });

    let tray = new Tray(__dirname + "/app/assets/images/music_default.png");
});

app.on('window-all-closed', () => {
    app.quit();
});

ipcMain.on('dialog', (event,type,msg) => {
    if (type == "error") {
        dialog.showErrorBox($TITLE, msg);
    } else if (type == "msg") {
        dialog.showMessageBox({title: $TITLE, type: 'info', message: msg});
    }
});
