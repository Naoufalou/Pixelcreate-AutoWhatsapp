const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getAccounts: () => ipcRenderer.invoke('get-accounts'),
  saveAccounts: (accounts) => ipcRenderer.invoke('save-accounts', accounts),
  clearSession: (accountId) => ipcRenderer.invoke('clear-session', accountId),
  getEnv: () => ipcRenderer.invoke('get-env'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  getContactedNumbers: () => ipcRenderer.invoke('get-contacted-numbers'),
  addContactedNumber: (phone) => ipcRenderer.invoke('add-contacted-number', phone),
  clearContactedNumbers: () => ipcRenderer.invoke('clear-contacted-numbers'),
  getCampaigns: () => ipcRenderer.invoke('get-campaigns'),
  saveCampaigns: (campaigns) => ipcRenderer.invoke('save-campaigns', campaigns),
  selectFile: () => ipcRenderer.invoke('select-file'),
  copyFileToClipboard: (filePath) => ipcRenderer.invoke('copy-file-to-clipboard', filePath),
  clearClipboard: () => ipcRenderer.invoke('clear-clipboard')
});
