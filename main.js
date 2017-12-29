const { app, BrowserWindow, Menu, Tray, dialog, ipcMain } = require('electron');
const data = require('./app/modules/data');

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
        icon: __dirname + "/app/assets/images/music_default.png"
    });
    let tray = new Tray(__dirname + "/app/assets/images/music_default.png");
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Item1', type: 'radio'},
        {label: 'Item2', type: 'radio'}
    ]);
    tray.setContextMenu(contextMenu);

    if (data.hasUser()) {
        console.log("[INFO] Loaded user " + data.getUser().name);
        mainWindow.loadURL(`${__dirname}/app/view/index/index.html`);
    } else {
        console.log("[INFO] Guest user detected! Showing welcome window.");
        mainWindow.loadURL(`${__dirname}/app/view/welcome/welcome.html`);
    }

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
