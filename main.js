const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");
const axios = require("axios");
const path = require("path");

let win;
let currentUser = null;

function sendViolation(user, pelanggaran, poin = 10) {
  if (!user) {
    console.warn("⚠️ currentUser belum tersedia!");
    return;
  }

  axios
    .post("http://127.0.0.1:8000/api/violation", {
      user_id: user.id,
      nama: user.nama,
      nisn: user.nisn,
      pelanggaran,
      poin,
    })
    .then(() => {
      console.log("📌 Pelanggaran berhasil dikirim");
    })
    .catch((err) => {
      console.error("❌ Gagal kirim pelanggaran:", err.message);
    });
}

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
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });

  win.loadURL(page);

  function setupBlurDetection() {
    if (!win) return;

    win.on("blur", () => {
      if (currentUser) {
        sendViolation(currentUser, "Keluar dari aplikasi (Alt+Tab?)");
      } else {
        console.warn("⏳ currentUser belum tersedia, pelanggaran tidak dicatat!");
      }

      setTimeout(() => {
        win.focus();
      }, 100);
    });
  }

  // Saat user dikirim dari frontend Laravel
  ipcMain.on("user-logged-in", (event, user) => {
    currentUser = user;
    console.log("✅ currentUser diterima dari Laravel:", currentUser);
    setupBlurDetection(); // Setup blur setelah currentUser tersedia
  });

  win.on("closed", () => {
    win = null;
  });
}

// 🔒 Shortcut siswa diblokir
function blockAllShortcuts() {
  const shortcuts = ["Alt+Tab", "Alt+F4", "Ctrl+Esc", "Ctrl+Shift+Esc", "Ctrl+Alt+Delete", "Ctrl+W", "Ctrl+N", "Ctrl+R", "Ctrl+P", "Ctrl+L", "Win+Tab", "Meta+Tab", "Meta+E", "Meta+R"];

  shortcuts.forEach((shortcut) => {
    globalShortcut.register(shortcut, () => false);
  });

  console.log("🔒 Semua shortcut siswa diblokir!");
}

// 🔓 Shortcut keluar admin
function handleExitShortcut() {
  globalShortcut.register("Ctrl+Q", () => {
    console.log("🔓 Admin keluar dengan Ctrl+Q");
    app.quit();
  });
}

app.whenReady().then(() => {
  // Tampilkan intro.html terlebih dahulu
  createWindow(`file://${path.join(__dirname, "intro.html")}`);

  // Setelah 6 detik, pindah ke loading.html
  setTimeout(() => {
    if (win) {
      win.loadURL(`file://${path.join(__dirname, "loading.html")}`);
    }

    // Setelah 3 detik di loading.html, pindah ke Laravel
    setTimeout(() => {
      if (win) {
        win.loadURL("http://127.0.0.1:8000");
      }
    }, 3000);
  }, 6000);

  handleExitShortcut();
  blockAllShortcuts();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(`file://${path.join(__dirname, "intro.html")}`);
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
