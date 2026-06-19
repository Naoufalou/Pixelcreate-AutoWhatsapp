require('dotenv').config();
const { app, BrowserWindow, ipcMain, session } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

const ACCOUNTS_FILE = path.join(app.getPath('userData'), 'accounts.json');
const SETTINGS_FILE = path.join(app.getPath('userData'), 'settings.json');
const CONTACTED_FILE = path.join(app.getPath('userData'), 'contacted_numbers.json');
const CAMPAIGNS_FILE = path.join(app.getPath('userData'), 'campaign_history.json');

// Helper to read accounts from JSON file
function readAccounts() {
  try {
    if (fs.existsSync(ACCOUNTS_FILE)) {
      const data = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading accounts file:', err);
  }
  return [];
}

// Helper to write accounts to JSON file
function writeAccounts(accounts) {
  try {
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing accounts file:', err);
    return false;
  }
}

// Helper to read settings from JSON file
function readSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading settings file:', err);
  }
  return { provider: 'lmstudio', apiKey: '', apiUrl: '', modelId: '' };
}

// Helper to write settings to JSON file
function writeSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing settings file:', err);
    return false;
  }
}

// Helper to read contacted numbers from JSON file
function readContactedNumbers() {
  try {
    if (fs.existsSync(CONTACTED_FILE)) {
      const data = fs.readFileSync(CONTACTED_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading contacted numbers file:', err);
  }
  return [];
}

// Helper to write contacted numbers to JSON file
function writeContactedNumbers(numbers) {
  try {
    fs.writeFileSync(CONTACTED_FILE, JSON.stringify(numbers, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing contacted numbers file:', err);
    return false;
  }
}

// Helper to read campaign history from JSON file
function readCampaigns() {
  try {
    if (fs.existsSync(CAMPAIGNS_FILE)) {
      const data = fs.readFileSync(CAMPAIGNS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading campaigns file:', err);
  }
  return [];
}

// Helper to write campaign history to JSON file
function writeCampaigns(campaigns) {
  try {
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing campaigns file:', err);
    return false;
  }
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Multi-WhatsApp Desktop',
    titleBarStyle: 'hiddenInset', // beautiful native mac style top bar
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true, // Crucial to allow webviews
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Ensure all sessions (including custom partitions for webviews) use the correct User Agent to avoid WhatsApp Web blocks
app.on('session-created', (session) => {
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
  session.setUserAgent(userAgent);
});

// Set standard user agent fallback for the whole app
app.userAgentFallback = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

app.whenReady().then(() => {
  // IPC handlers
  ipcMain.handle('get-env', async () => {
    return {
      lmStudioUrl: process.env.LMSTUDIO_API_URL || 'http://127.0.0.1:1234/v1',
      lmStudioModel: process.env.LMSTUDIO_MODEL_ID || 'meta-llama-3.1-8b-instruct'
    };
  });

  ipcMain.handle('get-accounts', async () => {
    return readAccounts();
  });

  ipcMain.handle('save-accounts', async (event, accounts) => {
    return writeAccounts(accounts);
  });

  ipcMain.handle('get-settings', async () => {
    return readSettings();
  });

  ipcMain.handle('save-settings', async (event, settings) => {
    return writeSettings(settings);
  });

  ipcMain.handle('get-contacted-numbers', async () => {
    return readContactedNumbers();
  });

  ipcMain.handle('add-contacted-number', async (event, phone) => {
    const list = readContactedNumbers();
    if (!list.includes(phone)) {
      list.push(phone);
      writeContactedNumbers(list);
      return true;
    }
    return false;
  });

  ipcMain.handle('clear-contacted-numbers', async () => {
    return writeContactedNumbers([]);
  });

  ipcMain.handle('clear-session', async (event, accountId) => {
    try {
      const partitionName = `persist:account_${accountId}`;
      const ses = session.fromPartition(partitionName);
      await ses.clearStorageData();
      console.log(`Cleared storage data for partition: ${partitionName}`);
      return { success: true };
    } catch (err) {
      console.error(`Failed to clear session data for ${accountId}:`, err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('get-campaigns', async () => {
    return readCampaigns();
  });

  ipcMain.handle('save-campaigns', async (event, campaigns) => {
    return writeCampaigns(campaigns);
  });

  createWindow();

  // Check for updates and notify the user
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    console.log('Mise à jour disponible...');
  });

  autoUpdater.on('update-downloaded', () => {
    console.log('Mise à jour téléchargée. Elle sera installée au redémarrage.');
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
