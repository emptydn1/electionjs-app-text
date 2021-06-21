const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const url = require("url");

let win = null;

function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    title: "tool",
  });
  win.maximize();

  win.loadURL(
    url.format({
      protocol: "file",
      slashes: true,
      pathname: path.join(__dirname, "index.html"),
    })
  );
  
  win.webContents.openDevTools();
}

app.whenReady().then((_) => {
  createWindow();
  Menu.setApplicationMenu(null);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
