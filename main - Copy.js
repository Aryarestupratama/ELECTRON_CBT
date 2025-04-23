const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

let win;

function createWindow(page) {
  win = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    kiosk: true,
    alwaysOnTop: true,
    resizable: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadURL(page);

  // Event: Jika jendela kehilangan fokus
  win.on('blur', () => {
    console.log('Aplikasi kehilangan fokus!'); // Debugging
    const loginPath = path.join(__dirname, 'login.html');
    win.loadURL('file://' + loginPath); // Arahkan ke halaman login
  });

  // Event: Jika jendela kembali fokus
  win.on('focus', () => {
    console.log('Aplikasi kembali fokus.'); // Debugging
  });
}

// Fungsi untuk menampilkan halaman loading terlebih dahulu
function showLoadingPage() {
  const loadingPath = path.join(__dirname, 'loading.html');
  createWindow('file://' + loadingPath);

  setTimeout(() => {
    const loginPath = path.join(__dirname, 'login.html');
    win.loadURL('file://' + loginPath);
  }, 3000); // Tunda 3 detik sebelum berpindah ke halaman login
}

function handleAltTabShortcut() {
  globalShortcut.register('Alt+Tab', () => {
    win.setFocusable(false); // Mengunci aplikasi
    console.log('Alt+Tab pressed, app is locked');
  });
}

app.whenReady().then(() => {
  showLoadingPage();
  handleAltTabShortcut();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      showLoadingPage();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
