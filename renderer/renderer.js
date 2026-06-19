// State Management
let accounts = []; // Array of { id: string, name: string, phone: string, sentCountToday?: number, lastSentDate?: string }
let activeAccountId = null;
const unreadCounts = {}; // Map of accountId -> unread count (number)
let defaultLlmUrl = 'http://127.0.0.1:1234/v1';
let defaultLlmModel = 'meta-llama-3.1-8b-instruct';
let globalSettings = {
  campaignProvider: 'lmstudio',
  campaignApiKey: '',
  campaignApiUrl: '',
  campaignModelId: '',
  warmupProvider: 'lmstudio',
  warmupApiKey: '',
  warmupApiUrl: '',
  warmupModelId: ''
};
let isCsvLoaded = false;
let loadedCsvName = "";
let contactedPhones = new Set();

// User Agent for WhatsApp Web
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// UI Elements - Core / Sidebar
const btnAddAccount = document.getElementById('btn-add-account');
const btnWelcomeAdd = document.getElementById('btn-welcome-add');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelModal = document.getElementById('btn-cancel-modal');
const btnSubmitAccount = document.getElementById('btn-submit-account');
const modalOverlay = document.getElementById('add-modal');
const inputAccountName = document.getElementById('account-name-input');
const modalErrorMessage = document.getElementById('modal-error-message');
const accountsListContainer = document.getElementById('accounts-list');
const webviewContainer = document.getElementById('webview-container');
const welcomeScreen = document.getElementById('welcome-screen');
const navCampaigns = document.getElementById('nav-campaigns');
const navWarmup = document.getElementById('nav-warmup');
const navHistory = document.getElementById('nav-history');
const historyView = document.getElementById('history-view');
const historyList = document.getElementById('history-list');
const historyEmpty = document.getElementById('history-empty');
const historyDetailModal = document.getElementById('history-detail-modal');
const btnCloseHistoryModal = document.getElementById('btn-close-history-modal');
const historyDetailTitle = document.getElementById('history-detail-title');
const historyDetailSender = document.getElementById('history-detail-sender');
const historyDetailDate = document.getElementById('history-detail-date');
const historyDetailStats = document.getElementById('history-detail-stats');
const historyDetailMessages = document.getElementById('history-detail-messages');

// UI Elements - Edit Account Modal
const editModalOverlay = document.getElementById('edit-modal');
const inputEditAccountName = document.getElementById('edit-account-name-input');
const inputEditAccountPhone = document.getElementById('edit-account-phone-input');
const editModalErrorMessage = document.getElementById('edit-modal-error-message');
const btnCloseEditModal = document.getElementById('btn-close-edit-modal');
const btnCancelEditModal = document.getElementById('btn-cancel-edit-modal');
const btnSubmitEditAccount = document.getElementById('btn-submit-edit-account');
let editingAccount = null;

// UI Elements - Campaign View
const campaignView = document.getElementById('campaign-view');
const campaignApiProviderSelect = document.getElementById('campaign-api-provider');
const grpCampaignApiKey = document.getElementById('grp-campaign-api-key');
const campaignApiKeyInput = document.getElementById('campaign-api-key');
const lblCampaignUrl = document.getElementById('lbl-campaign-url');
const campaignSendersCheckboxes = document.getElementById('campaign-senders-checkboxes');
const campaignContactsInput = document.getElementById('campaign-contacts');
const btnImportFile = document.getElementById('btn-import-file');
const fileInput = document.getElementById('contacts-file-input');
const contactsCountTag = document.getElementById('contacts-count-tag');
const contactsPreviewList = document.getElementById('contacts-preview-list');
const loadedCsvContainer = document.getElementById('loaded-csv-container');
const loadedCsvFilename = document.getElementById('loaded-csv-filename');
const loadedCsvCount = document.getElementById('loaded-csv-count');
const btnClearCsv = document.getElementById('btn-clear-csv');
const btnResetContacted = document.getElementById('btn-reset-contacted');
const btnResetContactedGlobal = document.getElementById('btn-reset-contacted-global');
const campaignPromptInput = document.getElementById('campaign-prompt');
const campaignToneSelect = document.getElementById('campaign-tone');
const lmStudioUrlInput = document.getElementById('lmstudio-url');
const campaignModelIdInput = document.getElementById('campaign-model-id');
const btnTestLlm = document.getElementById('btn-test-llm');
const delayMinInput = document.getElementById('delay-min');
const delayMaxInput = document.getElementById('delay-max');

// Central Supabase Config (Hardcoded Option A)
const supabaseUrl = "https://ewnoueaytcanibuqwyha.supabase.co";
const supabaseKey = "sb_publishable_pMoGGuuRuf73xMIC-C2FxA_Cvu07yeY";

// UI Elements - Campaign Execution
const campaignStatusDot = document.getElementById('campaign-status-dot');
const campaignStatusText = document.getElementById('campaign-status-text');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressText = document.getElementById('progress-text');
const statSentText = document.getElementById('stat-sent');
const statFailedText = document.getElementById('stat-failed');
const btnStartCampaign = document.getElementById('btn-start-campaign');
const btnPauseCampaign = document.getElementById('btn-pause-campaign');
const btnResetCampaign = document.getElementById('btn-reset-campaign');
const consoleOutput = document.getElementById('console-output');
const btnClearConsole = document.getElementById('btn-clear-console');

// UI Elements - Warmup View
const warmupView = document.getElementById('warmup-view');
const warmupApiProviderSelect = document.getElementById('warmup-api-provider');
const grpWarmupApiKey = document.getElementById('grp-warmup-api-key');
const warmupApiKeyInput = document.getElementById('warmup-api-key');
const lblWarmupUrl = document.getElementById('lbl-warmup-url');
const warmupAccountsCheckboxes = document.getElementById('warmup-accounts-checkboxes');
const warmupPromptInput = document.getElementById('warmup-prompt');
const warmupLmStudioUrlInput = document.getElementById('warmup-lmstudio-url');
const warmupModelIdInput = document.getElementById('warmup-model-id');
const btnWarmupTestLlm = document.getElementById('btn-warmup-test-llm');
const warmupDelayMinInput = document.getElementById('warmup-delay-min');
const warmupDelayMaxInput = document.getElementById('warmup-delay-max');
const warmupStatusDot = document.getElementById('warmup-status-dot');
const warmupStatusText = document.getElementById('warmup-status-text');
const warmupActivePair = document.getElementById('warmup-active-pair');
const btnStartWarmup = document.getElementById('btn-start-warmup');
const btnPauseWarmup = document.getElementById('btn-pause-warmup');
const btnResetWarmup = document.getElementById('btn-reset-warmup');
const warmupChatBox = document.getElementById('warmup-chat-box');
const btnClearWarmupChat = document.getElementById('btn-clear-warmup-chat');

// Campaign Engine State
let campaignRunning = false;
let campaignPaused = false;
let campaignContacts = []; // Array of { name: string, phone: string }
let campaignCurrentIndex = 0;
let campaignSentCount = 0;
let campaignFailedCount = 0;
let campaignTimeoutId = null;
let currentCampaignMessages = [];
let campaignSenderIndex = 0;

// Warm-up Engine State
let warmupRunning = false;
let warmupPaused = false;
let warmupTimeoutId = null;
const warmupHistories = {}; // Key: 'accId1:accId2' (sorted), Value: array of strings

// Helper function to sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to parse Spintax like {Bonjour|Salut|Hello}
function parseSpintax(text) {
  if (!text) return '';
  return text.replace(/{([^{}]+)}/g, function(match, options) {
    const lower = options.trim().toLowerCase();
    if (lower === 'nom' || lower === 'name') {
      return match;
    }
    const choices = options.split('|');
    return choices[Math.floor(Math.random() * choices.length)].trim();
  });
}

// Initialize App
async function init() {
  // Core Sidebar/Account Listeners
  btnAddAccount.addEventListener('click', openModal);
  btnWelcomeAdd.addEventListener('click', openModal);
  btnCloseModal.addEventListener('click', closeModal);
  btnCancelModal.addEventListener('click', closeModal);
  btnSubmitAccount.addEventListener('click', createAccount);
  
  // Submit on Enter key for Add Account
  inputAccountName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') createAccount();
  });

  // Edit Account Listeners
  btnCloseEditModal.addEventListener('click', closeEditModal);
  btnCancelEditModal.addEventListener('click', closeEditModal);
  btnSubmitEditAccount.addEventListener('click', saveEditAccount);
  
  inputEditAccountName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') inputEditAccountPhone.focus();
  });
  inputEditAccountPhone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveEditAccount();
  });

  // Views Navigation Switching
  navCampaigns.addEventListener('click', showCampaignView);
  navWarmup.addEventListener('click', showWarmupView);
  navHistory.addEventListener('click', showHistoryView);
  btnCloseHistoryModal.addEventListener('click', closeHistoryModal);
  historyDetailModal.addEventListener('click', (e) => {
    if (e.target === historyDetailModal) {
      closeHistoryModal();
    }
  });

  // Campaign View Listeners
  campaignContactsInput.addEventListener('input', handleContactsTextChange);
  btnImportFile.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileImport);
  btnTestLlm.addEventListener('click', testLlmConnection);
  btnStartCampaign.addEventListener('click', startCampaign);
  btnPauseCampaign.addEventListener('click', pauseCampaign);
  btnResetCampaign.addEventListener('click', resetCampaign);
  btnClearConsole.addEventListener('click', () => {
    consoleOutput.innerHTML = '<div class="console-line system">Console effacée. Prête.</div>';
  });

  // Warmup View Listeners
  btnWarmupTestLlm.addEventListener('click', testWarmupLlmConnection);
  btnStartWarmup.addEventListener('click', startWarmup);
  btnPauseWarmup.addEventListener('click', pauseWarmup);
  btnResetWarmup.addEventListener('click', resetWarmup);
  btnClearWarmupChat.addEventListener('click', () => {
    warmupChatBox.innerHTML = '<div class="warmup-system-message">Discussion effacée. Chauffage actif.</div>';
  });

  // API Provider Toggle Listeners
  campaignApiProviderSelect.addEventListener('change', () => {
    handleCampaignApiProviderChange(true);
    saveGlobalSettings();
  });
  warmupApiProviderSelect.addEventListener('change', () => {
    handleWarmupApiProviderChange(true);
    saveGlobalSettings();
  });
  
  // Add listeners for settings inputs to automatically save
  campaignApiKeyInput.addEventListener('input', saveGlobalSettings);
  lmStudioUrlInput.addEventListener('input', saveGlobalSettings);
  campaignModelIdInput.addEventListener('input', saveGlobalSettings);
  warmupApiKeyInput.addEventListener('input', saveGlobalSettings);
  warmupLmStudioUrlInput.addEventListener('input', saveGlobalSettings);
  warmupModelIdInput.addEventListener('input', saveGlobalSettings);
  
  // File clear button listener
  btnClearCsv.addEventListener('click', clearLoadedCsv);
  btnResetContacted.addEventListener('click', resetContactedList);
  if (btnResetContactedGlobal) {
    btnResetContactedGlobal.addEventListener('click', resetContactedList);
  }

  // Fetch Environment Values from main process
  try {
    const env = await window.api.getEnv();
    defaultLlmUrl = env.lmStudioUrl;
    defaultLlmModel = env.lmStudioModel;
  } catch (err) {
    console.error("Failed to load environment variables:", err);
  }

  // Load settings from main process
  try {
    const savedSettings = await window.api.getSettings();
    if (savedSettings) {
      globalSettings = { ...globalSettings, ...savedSettings };
    }
  } catch (err) {
    console.error("Failed to load settings:", err);
  }

  // Populate UI with settings or fallbacks
  campaignApiProviderSelect.value = globalSettings.campaignProvider || 'lmstudio';
  campaignApiKeyInput.value = globalSettings.campaignApiKey || '';
  lmStudioUrlInput.value = globalSettings.campaignApiUrl || defaultLlmUrl;
  campaignModelIdInput.value = globalSettings.campaignModelId || defaultLlmModel;

  warmupApiProviderSelect.value = globalSettings.warmupProvider || 'lmstudio';
  warmupApiKeyInput.value = globalSettings.warmupApiKey || '';
  warmupLmStudioUrlInput.value = globalSettings.warmupApiUrl || defaultLlmUrl;
  warmupModelIdInput.value = globalSettings.warmupModelId || defaultLlmModel;

  // Render provider fields without overwriting URLs/Models with defaults
  handleCampaignApiProviderChange(false);
  handleWarmupApiProviderChange(false);

  // Load Accounts from main process
  accounts = await window.api.getAccounts();

  // Load Contacted Numbers from main process
  try {
    const contactedList = await window.api.getContactedNumbers();
    contactedPhones = new Set(contactedList);
  } catch (err) {
    console.error("Failed to load contacted numbers:", err);
  }
  
  if (accounts.length > 0) {
    welcomeScreen.style.display = 'none';
    
    // Instantiate all webviews
    accounts.forEach(account => {
      createWebviewElement(account.id);
    });

    // Default: select the first account
    selectAccount(accounts[0].id);
  } else {
    welcomeScreen.style.display = 'flex';
  }

  renderSidebar();
}

// Render the Sidebar List
function renderSidebar() {
  accountsListContainer.innerHTML = '';

  if (accounts.length === 0) {
    return;
  }

  accounts.forEach(account => {
    // Determine active classes (not active if viewing Campaigns or Warmup tabs)
    const isSelected = account.id === activeAccountId && 
                       campaignView.style.display !== 'grid' && 
                       warmupView.style.display !== 'grid' &&
                       historyView.style.display !== 'grid';
    
    const item = document.createElement('div');
    item.className = `account-item ${isSelected ? 'active' : ''}`;
    item.dataset.id = account.id;
    
    // Account Info
    const info = document.createElement('div');
    info.className = 'account-info';
    
    const name = document.createElement('div');
    name.className = 'account-name';
    name.innerText = account.name;
    
    const statusContainer = document.createElement('div');
    statusContainer.className = 'account-status-container';
    
    const dot = document.createElement('span');
    dot.className = `status-dot ${isSelected ? 'connected' : ''}`;
    
    const today = new Date().toISOString().split('T')[0];
    const sentCount = account.lastSentDate === today ? (account.sentCountToday || 0) : 0;
    
    const statusText = document.createElement('span');
    statusText.className = 'account-status-text';
    
    let baseStatus = account.phone ? `${account.phone} • ` : '';
    let runModeText = isSelected ? 'Actif' : 'Arrière-plan';
    
    statusText.innerText = `${baseStatus}${runModeText} [${sentCount}/30]`;
    
    statusContainer.appendChild(dot);
    statusContainer.appendChild(statusText);
    info.appendChild(name);
    info.appendChild(statusContainer);
    
    // Actions
    const actions = document.createElement('div');
    actions.className = 'account-actions';
    
    // Badge unread
    const unread = unreadCounts[account.id] || 0;
    if (unread > 0) {
      const badge = document.createElement('span');
      badge.className = 'unread-badge';
      badge.innerText = unread > 99 ? '99+' : unread;
      actions.appendChild(badge);
    }
    
    // Edit Account
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.title = 'Modifier le compte';
    editBtn.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    `;
    
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(account);
    });
    
    actions.appendChild(editBtn);

    // Delete Account
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.title = 'Supprimer le compte';
    deleteBtn.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    `;
    
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm(`Êtes-vous sûr de vouloir supprimer le compte "${account.name}" ?`)) {
        await deleteAccount(account.id);
      }
    });
    
    actions.appendChild(deleteBtn);
    item.appendChild(info);
    item.appendChild(actions);
    
    item.addEventListener('click', () => {
      selectAccount(account.id);
    });
    
    accountsListContainer.appendChild(item);
  });
}

// Create and insert a <webview> element
function createWebviewElement(accountId) {
  if (document.getElementById(`webview-${accountId}`)) return;

  const wv = document.createElement('webview');
  wv.id = `webview-${accountId}`;
  wv.setAttribute('partition', `persist:account_${accountId}`);
  wv.setAttribute('useragent', USER_AGENT);
  wv.setAttribute('webpreferences', 'contextIsolation=yes, nodeIntegration=no');
  wv.src = 'https://web.whatsapp.com';
  
  // Title update for notifications
  wv.addEventListener('page-title-updated', (event) => {
    const title = event.title;
    const match = title.match(/\((\d+)\)/);
    const count = match ? parseInt(match[1], 10) : 0;
    
    unreadCounts[accountId] = count;
    renderSidebar();
  });

  webviewContainer.appendChild(wv);
}

// Select WhatsApp account view
function selectAccount(accountId) {
  activeAccountId = accountId;
  
  // Hide configuration tabs
  campaignView.style.display = 'none';
  navCampaigns.classList.remove('active');
  
  warmupView.style.display = 'none';
  navWarmup.classList.remove('active');
  
  historyView.style.display = 'none';
  navHistory.classList.remove('active');
  
  welcomeScreen.style.display = 'none';
  
  // Show target webview, hide others
  const allWebviews = webviewContainer.querySelectorAll('webview');
  allWebviews.forEach(wv => {
    if (wv.id === `webview-${accountId}`) {
      wv.classList.add('active');
      wv.focus();
    } else {
      wv.classList.remove('active');
    }
  });

  renderSidebar();
}

// Show Campaign Dashboard View
function showCampaignView() {
  activeAccountId = null;
  renderSidebar();
  
  welcomeScreen.style.display = 'none';
  warmupView.style.display = 'none';
  navWarmup.classList.remove('active');
  
  historyView.style.display = 'none';
  navHistory.classList.remove('active');
  
  const allWebviews = webviewContainer.querySelectorAll('webview');
  allWebviews.forEach(wv => wv.classList.remove('active'));
  
  campaignView.style.display = 'grid';
  navCampaigns.classList.add('active');
  
  renderCampaignSenderCheckboxes();
}

// Show Warm-up Dashboard View
function showWarmupView() {
  activeAccountId = null;
  renderSidebar();
  
  welcomeScreen.style.display = 'none';
  campaignView.style.display = 'none';
  navCampaigns.classList.remove('active');
  
  historyView.style.display = 'none';
  navHistory.classList.remove('active');
  
  const allWebviews = webviewContainer.querySelectorAll('webview');
  allWebviews.forEach(wv => wv.classList.remove('active'));
  
  warmupView.style.display = 'grid';
  navWarmup.classList.add('active');
  
  renderWarmupCheckboxes();
}

// Show Campaign History View
function showHistoryView() {
  activeAccountId = null;
  renderSidebar();
  
  welcomeScreen.style.display = 'none';
  campaignView.style.display = 'none';
  navCampaigns.classList.remove('active');
  
  warmupView.style.display = 'none';
  navWarmup.classList.remove('active');
  
  const allWebviews = webviewContainer.querySelectorAll('webview');
  allWebviews.forEach(wv => wv.classList.remove('active'));
  
  historyView.style.display = 'grid';
  navHistory.classList.add('active');
  
  renderHistoryList();
}

// Render campaign history list from store
async function renderHistoryList() {
  try {
    const campaigns = await window.api.getCampaigns() || [];
    
    if (campaigns.length === 0) {
      historyEmpty.style.display = 'block';
      historyList.style.display = 'none';
      return;
    }
    
    historyEmpty.style.display = 'none';
    historyList.style.display = 'flex';
    historyList.innerHTML = '';
    
    campaigns.forEach(campaign => {
      const item = document.createElement('div');
      item.className = 'account-item';
      item.style.cursor = 'pointer';
      item.style.padding = '16px';
      item.style.display = 'flex';
      item.style.flexDirection = 'column';
      item.style.gap = '8px';
      
      const headerRow = document.createElement('div');
      headerRow.style.display = 'flex';
      headerRow.style.justifyContent = 'space-between';
      headerRow.style.alignItems = 'center';
      
      const title = document.createElement('span');
      title.style.fontWeight = '600';
      title.style.fontSize = '1.05rem';
      title.style.color = '#fff';
      title.innerText = `Campagne du ${campaign.date}`;
      
      const senderBadge = document.createElement('span');
      senderBadge.style.fontSize = '0.8rem';
      senderBadge.style.padding = '4px 8px';
      senderBadge.style.borderRadius = '6px';
      senderBadge.style.background = 'rgba(255, 255, 255, 0.05)';
      senderBadge.style.border = '1px solid rgba(255, 255, 255, 0.08)';
      senderBadge.style.color = 'var(--color-text-muted)';
      senderBadge.style.fontWeight = '500';
      senderBadge.innerText = `Expéditeur : ${campaign.senderName}`;
      
      headerRow.appendChild(title);
      headerRow.appendChild(senderBadge);
      
      const statsRow = document.createElement('div');
      statsRow.style.display = 'flex';
      statsRow.style.gap = '16px';
      statsRow.style.fontSize = '0.85rem';
      statsRow.style.color = 'var(--color-text-muted)';
      
      const destSpan = document.createElement('span');
      destSpan.innerHTML = `Total : <strong style="color: #fff;">${campaign.totalContacts}</strong>`;
      
      const successSpan = document.createElement('span');
      successSpan.innerHTML = `Succès : <strong style="color: #30d158;">${campaign.sentCount}</strong>`;
      
      const failedSpan = document.createElement('span');
      failedSpan.innerHTML = `Échecs : <strong style="color: #ff453a;">${campaign.failedCount}</strong>`;
      
      statsRow.appendChild(destSpan);
      statsRow.appendChild(successSpan);
      statsRow.appendChild(failedSpan);
      
      item.appendChild(headerRow);
      item.appendChild(statsRow);
      
      item.addEventListener('click', () => showCampaignDetail(campaign));
      
      historyList.appendChild(item);
    });
  } catch (err) {
    console.error("Failed to render history list:", err);
  }
}

// Show detailed messages for a campaign in a modal
function showCampaignDetail(campaign) {
  historyDetailTitle.innerText = `Détails de la Campagne`;
  historyDetailSender.innerText = campaign.senderName;
  historyDetailDate.innerText = campaign.date;
  historyDetailStats.innerText = `Envoyés: ${campaign.sentCount} | Échecs: ${campaign.failedCount} | Total: ${campaign.totalContacts}`;
  
  historyDetailMessages.innerHTML = '';
  
  if (!campaign.messages || campaign.messages.length === 0) {
    historyDetailMessages.innerHTML = '<div class="warmup-system-message">Aucun message individuel enregistré.</div>';
  } else {
    campaign.messages.forEach(msg => {
      const msgCard = document.createElement('div');
      msgCard.style.padding = '12px';
      msgCard.style.background = 'rgba(255, 255, 255, 0.02)';
      msgCard.style.border = '1px solid rgba(255, 255, 255, 0.06)';
      msgCard.style.borderRadius = '8px';
      msgCard.style.display = 'flex';
      msgCard.style.flexDirection = 'column';
      msgCard.style.gap = '6px';
      
      const topRow = document.createElement('div');
      topRow.style.display = 'flex';
      topRow.style.justifyContent = 'space-between';
      topRow.style.alignItems = 'center';
      topRow.style.fontSize = '0.85rem';
      
      const namePhone = document.createElement('span');
      namePhone.style.fontWeight = '600';
      namePhone.style.color = '#fff';
      namePhone.innerText = `${msg.name} (${msg.phone})`;
      
      const statusBadge = document.createElement('span');
      statusBadge.style.fontSize = '0.75rem';
      statusBadge.style.padding = '2px 6px';
      statusBadge.style.borderRadius = '4px';
      statusBadge.style.fontWeight = '600';
      
      if (msg.status === 'sent') {
        statusBadge.style.background = 'rgba(48, 209, 88, 0.1)';
        statusBadge.style.color = '#30d158';
        statusBadge.innerText = 'Envoyé';
      } else if (msg.status === 'invalid_number') {
        statusBadge.style.background = 'rgba(255, 69, 58, 0.1)';
        statusBadge.style.color = '#ff453a';
        statusBadge.innerText = 'Numéro Invalide';
      } else {
        statusBadge.style.background = 'rgba(255, 69, 58, 0.1)';
        statusBadge.style.color = '#ff453a';
        statusBadge.innerText = msg.status || 'Échec';
      }
      
      topRow.appendChild(namePhone);
      topRow.appendChild(statusBadge);
      
      const content = document.createElement('div');
      content.style.fontSize = '0.9rem';
      content.style.color = 'var(--color-text-main)';
      content.style.whiteSpace = 'pre-wrap';
      content.innerText = msg.text || '';
      
      const time = document.createElement('span');
      time.style.fontSize = '0.75rem';
      time.style.color = 'var(--color-text-muted)';
      time.style.alignSelf = 'flex-end';
      time.innerText = msg.timestamp || '';
      
      msgCard.appendChild(topRow);
      msgCard.appendChild(content);
      msgCard.appendChild(time);
      
      historyDetailMessages.appendChild(msgCard);
    });
  }
  
  historyDetailModal.classList.add('active');
}

// Close campaign detail modal
function closeHistoryModal() {
  historyDetailModal.classList.remove('active');
}

// Update account checkboxes inside Campaign
function renderCampaignSenderCheckboxes() {
  if (!campaignSendersCheckboxes) return;
  
  campaignSendersCheckboxes.innerHTML = '';
  
  if (accounts.length === 0) {
    campaignSendersCheckboxes.innerHTML = '<p class="input-sub no-accounts-warn">Aucun compte configuré.</p>';
    return;
  }
  
  accounts.forEach(acc => {
    const label = document.createElement('label');
    label.className = 'checkbox-item';
    
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = acc.id;
    cb.name = 'campaign-sender-participant';
    cb.checked = true;
    
    if (campaignRunning) {
      cb.disabled = true;
    }
    
    const span = document.createElement('span');
    span.innerText = acc.name + (acc.phone ? ` (${acc.phone})` : '');
    
    label.appendChild(cb);
    label.appendChild(span);
    campaignSendersCheckboxes.appendChild(label);
  });
}

// Render Checkbox list of accounts participating in the warm-up
function renderWarmupCheckboxes() {
  warmupAccountsCheckboxes.innerHTML = '';
  const validAccounts = accounts.filter(acc => acc.phone);
  
  if (validAccounts.length === 0) {
    warmupAccountsCheckboxes.innerHTML = '<p class="input-sub no-accounts-warn">Aucun compte avec numéro de téléphone configuré. Modifiez ou créez des comptes avec numéros.</p>';
    return;
  }
  
  validAccounts.forEach(acc => {
    const label = document.createElement('label');
    label.className = 'checkbox-item';
    
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = acc.id;
    cb.name = 'warmup-participant';
    cb.checked = true;
    
    if (warmupRunning) {
      cb.disabled = true;
    }
    
    const span = document.createElement('span');
    span.innerText = `${acc.name} (${acc.phone})`;
    
    label.appendChild(cb);
    label.appendChild(span);
    warmupAccountsCheckboxes.appendChild(label);
  });
}

// Delete Account logic
async function deleteAccount(accountId) {
  const wv = document.getElementById(`webview-${accountId}`);
  if (wv) wv.remove();

  await window.api.clearSession(accountId);

  accounts = accounts.filter(acc => acc.id !== accountId);
  delete unreadCounts[accountId];
  await window.api.saveAccounts(accounts);

  if (activeAccountId === accountId) {
    if (accounts.length > 0) {
      selectAccount(accounts[0].id);
    } else {
      activeAccountId = null;
      welcomeScreen.style.display = 'flex';
    }
  } else {
    if (campaignView.style.display === 'grid') {
      renderCampaignSenderCheckboxes();
    } else if (warmupView.style.display === 'grid') {
      renderWarmupCheckboxes();
    }
  }

  renderSidebar();
}

// Create new Account
async function createAccount() {
  const name = inputAccountName.value.trim();
  
  if (!name) {
    showModalError("Le nom du compte ne peut pas être vide.");
    return;
  }
  
  const nameExists = accounts.some(acc => acc.name.toLowerCase() === name.toLowerCase());
  if (nameExists) {
    showModalError("Un compte avec ce nom existe déjà.");
    return;
  }

  const accountId = 'acc_' + Date.now();
  const newAccount = { id: accountId, name: name, phone: "" };
  
  accounts.push(newAccount);
  await window.api.saveAccounts(accounts);
  
  createWebviewElement(accountId);
  closeModal();
  welcomeScreen.style.display = 'none';
  
  selectAccount(accountId);
}

// Smart CSV / Manual text contacts parser
function parseCSVAndTextContacts(text) {
  if (!text) return [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return [];
  
  const parsed = [];
  let delimiter = null;
  let headerRow = null;
  
  const firstLine = lines[0];
  if (firstLine.includes(',') || firstLine.includes(';')) {
    delimiter = firstLine.includes(';') ? ';' : ',';
    // If first line contains alphabetic characters (and is not a +phone number), it is a header
    if (/[a-zA-Z]/g.test(firstLine) && !firstLine.startsWith('+')) {
      headerRow = firstLine.split(delimiter).map(h => h.trim().toLowerCase());
    }
  }
  
  let nameColIndex = -1;
  let phoneColIndex = -1;
  
  if (headerRow) {
    nameColIndex = headerRow.findIndex(h => h.includes('name') || h.includes('nom') || h.includes('client') || h.includes('prenom') || h.includes('prénom'));
    phoneColIndex = headerRow.findIndex(h => h.includes('phone') || h.includes('tel') || h.includes('num') || h.includes('téléphone') || h.includes('telephone') || h.includes('mob'));
  }
  
  const startIndex = headerRow ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    let name = "";
    let phone = "";
    
    if (delimiter) {
      const cols = line.split(delimiter).map(c => c.trim());
      
      if (nameColIndex !== -1 && cols[nameColIndex]) {
        name = cols[nameColIndex];
      }
      if (phoneColIndex !== -1 && cols[phoneColIndex]) {
        phone = cols[phoneColIndex];
      }
      
      // Fallback column guessing if headers are missing/unmatched
      if (phoneColIndex === -1 || nameColIndex === -1) {
        const col1 = cols[0] || "";
        const col2 = cols[1] || "";
        
        const clean1 = col1.replace(/[\s\-\(\)\+]/g, '');
        const clean2 = col2.replace(/[\s\-\(\)\+]/g, '');
        
        if (/^\d+$/.test(clean1) && clean1.length >= 6) {
          phone = col1;
          name = col2;
        } else if (/^\d+$/.test(clean2) && clean2.length >= 6) {
          phone = col2;
          name = col1;
        } else {
          name = col1;
          phone = col2;
        }
      }
    } else {
      phone = line;
    }
    
    // Standard phone formatting
    let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
      cleanPhone = '+33' + cleanPhone.substring(1);
    }
    if (/^\d+$/.test(cleanPhone)) {
      cleanPhone = '+' + cleanPhone;
    }
    
    if (cleanPhone.startsWith('+') && cleanPhone.length >= 8 && /^\+\d+$/.test(cleanPhone)) {
      parsed.push({ 
        name: (name.trim() || "Client"), 
        phone: cleanPhone 
      });
    }
  }
  
  return parsed;
}

// Handle changes to the campaign contacts text box
function handleContactsTextChange() {
  const text = campaignContactsInput.value;
  campaignContacts = parseCSVAndTextContacts(text);
  
  contactsCountTag.innerText = `${campaignContacts.length} contact(s) valide(s) détecté(s)`;
  renderContactsPreview();
}

// Render small preview badges for the client contacts list
function renderContactsPreview() {
  contactsPreviewList.innerHTML = '';
  
  if (campaignContacts.length === 0) {
    contactsPreviewList.innerHTML = '<span class="no-contacts-preview">Aucun contact importé. Saisissez du texte ou chargez un fichier CSV.</span>';
    return;
  }
  
  // Render up to 40 badges to avoid lag
  const maxBadges = 40;
  const listToRender = campaignContacts.slice(0, maxBadges);
  
  listToRender.forEach(c => {
    const badge = document.createElement('div');
    badge.className = 'contact-preview-badge';
    
    const n = document.createElement('span');
    n.className = 'badge-name';
    n.innerText = c.name;
    
    const p = document.createElement('span');
    p.className = 'badge-phone';
    p.innerText = c.phone;
    
    badge.appendChild(n);
    badge.appendChild(p);
    contactsPreviewList.appendChild(badge);
  });
  
  if (campaignContacts.length > maxBadges) {
    const more = document.createElement('span');
    more.className = 'no-contacts-preview';
    more.style.alignSelf = 'center';
    more.style.paddingLeft = '5px';
    more.innerText = `+ ${campaignContacts.length - maxBadges} autres contacts...`;
    contactsPreviewList.appendChild(more);
  }
}

// File Import Handler
function handleFileImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const text = evt.target.result;
    campaignContacts = parseCSVAndTextContacts(text);
    
    if (campaignContacts.length > 0) {
      isCsvLoaded = true;
      loadedCsvName = file.name;
      
      // Update UI representation
      campaignContactsInput.style.display = 'none';
      loadedCsvContainer.style.display = 'flex';
      loadedCsvFilename.innerText = file.name;
      loadedCsvCount.innerText = `${campaignContacts.length} contact(s) détecté(s)`;
      
      contactsCountTag.innerText = `${campaignContacts.length} contact(s) valide(s) détecté(s)`;
      renderContactsPreview();
      logToConsole(`Importation réussie du fichier CSV "${file.name}" (${campaignContacts.length} contacts)`, 'success');
      
      // Supabase synchronization
      logToConsole("Synchronisation des contacts avec la base de données centrale...", "info");
      loadedCsvCount.innerText = `${campaignContacts.length} contact(s) détecté(s) - Sauvegarde en cours...`;
      
      const rows = campaignContacts.map(c => ({
        nom: c.name,
        telephone: c.phone,
        nom_fichier: file.name,
        expediteur: "App Multi-WhatsApp"
      }));
      
      fetch(`${supabaseUrl}/rest/v1/contacts_importes`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(rows)
      })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        logToConsole("Sauvegarde centrale sur Supabase réussie !", "success");
        loadedCsvCount.innerText = `${campaignContacts.length} contact(s) détecté(s) - Sauvegardé`;
      })
      .catch(err => {
        logToConsole(`Échec de la sauvegarde sur Supabase : ${err.message}`, "error");
        loadedCsvCount.innerText = `${campaignContacts.length} contact(s) détecté(s) - Échec Sauvegarde`;
      });
    } else {
      alert("Aucun contact valide n'a été détecté dans ce fichier.");
    }
  };
  reader.readAsText(file);
  fileInput.value = '';
}

function clearLoadedCsv() {
  isCsvLoaded = false;
  loadedCsvName = "";
  campaignContacts = [];
  campaignContactsInput.value = '';
  campaignContactsInput.style.display = 'block';
  loadedCsvContainer.style.display = 'none';
  
  contactsCountTag.innerText = '0 contact valide détecté';
  renderContactsPreview();
  logToConsole("Fichier CSV retiré.", 'system');
}

async function resetContactedList() {
  if (confirm("Voulez-vous réinitialiser l'historique des doublons pour cette campagne sur cet ordinateur ? Tous les contacts pourront à nouveau recevoir des messages.")) {
    try {
      await window.api.clearContactedNumbers();
      contactedPhones.clear();
      logToConsole("Historique des doublons réinitialisé pour cette campagne.", 'success');
      alert("L'historique des doublons a été réinitialisé avec succès !");
    } catch (err) {
      console.error("Erreur lors de la réinitialisation de l'historique :", err);
      logToConsole("Échec de la réinitialisation de l'historique.", 'error');
    }
  }
}

// Console logging utility
function logToConsole(msg, type = 'info') {
  const date = new Date();
  const timeStr = date.toLocaleTimeString();
  const line = document.createElement('div');
  line.className = `console-line ${type}`;
  line.innerText = `[${timeStr}] ${msg}`;
  consoleOutput.appendChild(line);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Test Connection
async function testLlmConnection() {
  const url = lmStudioUrlInput.value.trim();
  const provider = campaignApiProviderSelect.value;
  const apiKey = campaignApiKeyInput.value.trim();
  await testLlmConnectionUrl(url, provider, apiKey);
}

async function testWarmupLlmConnection() {
  const url = warmupLmStudioUrlInput.value.trim();
  const provider = warmupApiProviderSelect.value;
  const apiKey = warmupApiKeyInput.value.trim();
  await testLlmConnectionUrl(url, provider, apiKey);
}

function getSanitizedLlmUrl(url) {
  if (!url) return '';
  let apiBase = url.trim();
  apiBase = apiBase.replace(/\/+$/, '');
  if (!apiBase.endsWith('/v1') && !apiBase.endsWith('/api/v1')) {
    apiBase += '/v1';
  }
  return apiBase;
}

async function testLlmConnectionUrl(url, provider, apiKey) {
  if (!url) {
    alert("Veuillez saisir l'URL de l'API.");
    return;
  }
  
  const apiBase = getSanitizedLlmUrl(url);
  const headers = {};
  if (provider === 'openai') {
    if (!apiKey) {
      alert("Veuillez saisir votre clé API OpenAI.");
      return;
    }
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  try {
    const res = await fetch(`${apiBase}/models`, { 
      method: 'GET',
      headers: headers
    });
    if (res.ok) {
      alert("Connexion à l'IA réussie ! L'API est en ligne.");
    } else {
      alert(`Erreur : L'API a renvoyé le statut HTTP ${res.status}`);
    }
  } catch (err) {
    alert(`Erreur de connexion : ${err.message}. Vérifiez l'adresse et votre connexion internet.`);
  }
}

// LM Studio / OpenAI API - Rewrite Message
async function rewriteMessageWithLocalAI(baseMessage, tone, url, modelId, provider, apiKey) {
  // Always route to Gemini API using OpenAI compatible endpoint
  url = 'https://generativelanguage.googleapis.com/v1beta/openai';
  modelId = 'gemini-1.5-flash';
  provider = 'openai';
  apiKey = 'AQ.Ab8RN6IPetf9_Z2q3ymcUki1jj2nDRMtYOWeQS0_l056nhF_Ow';

  if (provider === 'none') {
    return parseSpintax(baseMessage);
  }
  let toneGuideline = "";
  switch (tone) {
    case 'courteous_short':
      toneGuideline = "Toujours extrêmement poli et courtois, tout en étant court (1 ou 2 phrases maximum).";
      break;
    case 'concise_humor':
      toneGuideline = "Très court et concis, très sympa avec une pointe d'humour légère ou une émoticône amicale.";
      break;
    case 'detailed':
      toneGuideline = "Professionnel, complet, un peu plus long et explicatif, bien poli.";
      break;
    case 'followup_cold':
      toneGuideline = "Une relance polie et cordiale, destinée à un contact qui n'a pas répondu, positive et encourageante.";
      break;
    default:
      toneGuideline = "Toujours courtois et poli.";
  }

  const systemMessage = `Tu es un assistant IA spécialisé dans la réécriture de messages de prospection et de newsletters sur WhatsApp. Ton but est de réécrire le message ou le prompt de l'utilisateur pour qu'il veuille dire la même chose mais avec des mots différents, afin d'éviter la détection de spam. Consigne de style impérative : ${toneGuideline} NE renvoie UNIQUEMENT que le texte du message réécrit. N'ajoute pas d'introduction, de conclusion, de guillemets, d'explication, ni de commentaires.`;

  const apiBase = url.includes('googleapis.com') ? url : getSanitizedLlmUrl(url);
  const headers = {
    'Content-Type': 'application/json'
  };
  if (provider === 'openai' && apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  try {
    const res = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: modelId || "meta-llama-3.1-8b-instruct",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: `Réécris ce prompt/message de base : "${baseMessage}"` }
        ],
        temperature: 0.8
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content.trim();
      }
    }
    throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    logToConsole(`[Alerte IA] Échec de la réécriture IA (${err.message}). Message de base utilisé en repli.`, 'accent');
    return baseMessage;
  }
}

// LM Studio / OpenAI API - Generate Warmup Peer Dialogue Continuation
async function generateWarmupReply(senderName, receiverName, history, subject, url, modelId, provider, apiKey) {
  // Always route to Gemini API using OpenAI compatible endpoint
  url = 'https://generativelanguage.googleapis.com/v1beta/openai';
  modelId = 'gemini-1.5-flash';
  provider = 'openai';
  apiKey = 'AQ.Ab8RN6IPetf9_Z2q3ymcUki1jj2nDRMtYOWeQS0_l056nhF_Ow';

  // Force API config inputs to remain hidden
  const apiInputs = document.querySelectorAll('.api-config-input');
  apiInputs.forEach(el => el.style.display = 'none');

  if (provider === 'none') {
    const fallbacks = [
      "Hello ! Quoi de neuf aujourd'hui ?",
      "Ça va de ton côté ? Tu as avancé sur tes dossiers ?",
      "Salut ! Il fait un temps superbe aujourd'hui.",
      "Hello, tu fais quoi de beau ?",
      "Tout roule ! Et toi ?",
      "Carrément, je suis d'accord avec toi.",
      "On se capte plus tard ? Bonne journée !",
      "Merci pour les infos, je regarde ça.",
      "Super, à toute !"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
  const defaultPrompt = "Discuter amicalement et naturellement de météo, de nouvelles du jour ou de projets professionnels.";
  const theme = subject ? subject.trim() : defaultPrompt;
  
  const historyText = history.length > 0 
    ? history.map(h => `- ${h}`).join('\n') 
    : "(Aucun message précédent, vous commencez la discussion)";

  const systemMessage = `Tu es un simulateur de discussion humaine informelle sur WhatsApp.
Tu simules la conversation entre deux amis ou collègues de bureau.
Tu es actuellement dans le rôle de [${senderName}]. Tu parles avec [${receiverName}].
Tu dois générer le prochain message envoyé par [${senderName}].
Sujet général de la discussion : "${theme}".

Consignes strictes :
- Fais une réponse courte et concise (1 à 3 phrases maximum).
- Reste naturel, parle comme si tu envoyais un texto rapide (style sms/chat, écriture décontractée, directe).
- Tu peux utiliser parfois des émojis ou des petites expressions familières, sans en faire trop.
- NE renvoie UNIQUEMENT que le texte du message de réponse. N'écris pas ton nom, n'écris pas "Réponse :", ne mets pas de guillemets autour du message.`;

  const apiBase = url.includes('googleapis.com') ? url : getSanitizedLlmUrl(url);
  const headers = {
    'Content-Type': 'application/json'
  };
  if (provider === 'openai' && apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  try {
    const res = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: modelId || "meta-llama-3.1-8b-instruct",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: `Voici l'historique des derniers messages :\n${historyText}\n\nEn tant que [${senderName}], génère ta réponse à [${receiverName}].` }
        ],
        temperature: 0.7
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content.trim();
      }
    }
    throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    logToConsole(`[Alerte Chauffage IA] Échec de la génération (${err.message}). Message de repli utilisé.`, 'accent');
    const fallbacks = [
      "Hello ! Quoi de neuf aujourd'hui ?",
      "Ça va de ton côté ? Tu as avancé sur tes dossiers ?",
      "Salut ! Il fait un temps superbe aujourd'hui.",
      "Hello, tu fais quoi de beau ?",
      "Tout roule ! Et toi ?",
      "Carrément, je suis d'accord avec toi.",
      "On se capte plus tard ? Bonne journée !",
      "Merci pour les infos, je regarde ça.",
      "Super, à toute !"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

// Automation Execution: Load URL and trigger send inside webview
function executeSendInsideWebview(senderId, phone, message) {
  return new Promise((resolve) => {
    const wv = document.getElementById(`webview-${senderId}`);
    if (!wv) {
      resolve({ status: 'error', reason: 'Webview du compte introuvable' });
      return;
    }

    wv.src = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

    let domReadyFired = false;
    
    const onDomReady = async () => {
      if (domReadyFired) return;
      domReadyFired = true;
      wv.removeEventListener('dom-ready', onDomReady);
      
      // Give WhatsApp Web a moment to initiate the React application loader
      await sleep(2500);
      
      try {
        const checkScript = `
          (function() {
            return new Promise((resolve) => {
              let checkCount = 0;
              const maxChecks = 80; // Up to 40 seconds of checking
              const interval = setInterval(() => {
                checkCount++;
                
                // Keep focusing the textbox to ensure state updates
                const textBox = document.querySelector('div[contenteditable="true"]') ||
                                document.querySelector('[data-testid="conversation-compose-box-input"]') ||
                                document.querySelector('.copyable-text.selectable-text[contenteditable="true"]');
                if (textBox && document.activeElement !== textBox) {
                  textBox.focus();
                }

                let sendBtn = document.querySelector('button[data-testid="compose-btn-send"]') || 
                              document.querySelector('[data-testid="send"]') ||
                              document.querySelector('button[aria-label="Envoyer"]') ||
                              document.querySelector('button[aria-label="Send"]');
                if (!sendBtn) {
                  const sendIcon = document.querySelector('span[data-icon="send"]');
                  if (sendIcon) {
                    sendBtn = sendIcon.closest('button') || sendIcon;
                  }
                }
                
                if (sendBtn) {
                  clearInterval(interval); // Clear the interval immediately to prevent multiple clicks / loops

                  // Focus and dispatch full mouse event sequence for React compatibility
                  sendBtn.focus();
                  const events = ['mousedown', 'mouseup', 'click'];
                  events.forEach(evName => {
                    sendBtn.dispatchEvent(new MouseEvent(evName, { bubbles: true, cancelable: true, view: window }));
                  });

                  // CRITICAL: Wait 2.5 seconds for WhatsApp Web to actually process & send the message before resolving,
                  // otherwise navigating away immediately to the next contact will cancel the outgoing transmission.
                  setTimeout(() => {
                    resolve({ status: 'sent' });
                  }, 2500);
                  return;
                }

                const dialog = document.querySelector('div[role="dialog"]');
                if (dialog) {
                  const text = dialog.textContent || '';
                  if (text.includes('invalide') || text.includes('invalid') || text.includes('introuvable') || text.includes('not found') || text.includes('partagé via une URL')) {
                    const okBtn = dialog.querySelector('button') || dialog.querySelector('[role="button"]');
                    if (okBtn) {
                      okBtn.focus();
                      okBtn.click();
                    }
                    clearInterval(interval);
                    resolve({ status: 'invalid_number' });
                    return;
                  }
                }

                if (checkCount >= maxChecks) {
                  clearInterval(interval);
                  resolve({ status: 'timeout' });
                }
              }, 500);
            });
          })()
        `;
        
        const result = await wv.executeJavaScript(checkScript);
        resolve(result);
      } catch (err) {
        resolve({ status: 'error', reason: err.message });
      }
    };

    wv.addEventListener('dom-ready', onDomReady);
    
    // Allow up to 45 seconds for page load under heavy CPU/memory conditions
    setTimeout(() => {
      wv.removeEventListener('dom-ready', onDomReady);
      if (!domReadyFired) {
        resolve({ status: 'error', reason: 'Délai de chargement dépassé (dom-ready timeout)' });
      }
    }, 45000);
  });
}

// Campaign Controller - START
async function startCampaign() {
  const checkedBoxes = document.querySelectorAll('input[name="campaign-sender-participant"]:checked');
  const senderIds = Array.from(checkedBoxes).map(cb => cb.value);
  if (senderIds.length === 0) {
    alert("Veuillez sélectionner au moins un compte expéditeur.");
    return;
  }

  // Parse current contacts input
  const contactsText = campaignContactsInput.value;
  campaignContacts = parseCSVAndTextContacts(contactsText);
  if (campaignContacts.length === 0) {
    alert("Veuillez entrer ou importer au moins un numéro de téléphone valide.");
    return;
  }

  const basePromptTemplate = campaignPromptInput.value.trim();
  if (!basePromptTemplate) {
    alert("Veuillez saisir un message de base ou un prompt.");
    return;
  }

  if (campaignRunning && campaignPaused) {
    campaignPaused = false;
    campaignStatusText.innerText = "Statut : En cours...";
    campaignStatusDot.className = "status-dot active-running";
    btnStartCampaign.style.display = 'none';
    btnPauseCampaign.style.display = 'inline-flex';
    logToConsole("Reprise de la campagne.", 'info');
    runCampaignLoop();
    return;
  }

  campaignRunning = true;
  campaignPaused = false;
  campaignCurrentIndex = 0;
  campaignSenderIndex = 0;
  campaignSentCount = 0;
  campaignFailedCount = 0;
  currentCampaignMessages = [];

  lockCampaignForm(true);
  btnStartCampaign.style.display = 'none';
  btnPauseCampaign.style.display = 'inline-flex';
  
  campaignStatusText.innerText = "Statut : En cours...";
  campaignStatusDot.className = "status-dot active-running";
  updateStatsUI();

  // If contacts were entered manually (no CSV loaded), sync them to Supabase
  if (!isCsvLoaded && campaignContacts.length > 0) {
    logToConsole("Synchronisation des contacts saisis avec la base de données centrale...", "info");
    const rows = campaignContacts.map(c => ({
      nom: c.name,
      telephone: c.phone,
      nom_fichier: "Saisie Manuelle",
      expediteur: "App Multi-WhatsApp"
    }));

    fetch(`${supabaseUrl}/rest/v1/contacts_importes`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(rows)
    })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      logToConsole("Sauvegarde centrale des contacts saisis réussie !", "success");
    })
    .catch(err => {
      logToConsole(`Échec de la sauvegarde sur Supabase : ${err.message}`, "error");
    });
  }

  logToConsole(`Démarrage de la campagne : ${campaignContacts.length} contacts à traiter.`, 'info');
  runCampaignLoop();
}

// Campaign Controller - PAUSE
function pauseCampaign() {
  if (!campaignRunning) return;
  campaignPaused = true;
  campaignStatusText.innerText = "Statut : En pause";
  campaignStatusDot.className = "status-dot";
  btnPauseCampaign.style.display = 'none';
  btnStartCampaign.style.display = 'inline-flex';
  if (campaignTimeoutId) {
    clearTimeout(campaignTimeoutId);
    campaignTimeoutId = null;
  }
  logToConsole("Campagne mise en pause.", 'accent');
}

// Campaign Controller - RESET
function resetCampaign() {
  campaignRunning = false;
  campaignPaused = false;
  campaignCurrentIndex = 0;
  campaignSentCount = 0;
  campaignFailedCount = 0;
  
  if (campaignTimeoutId) {
    clearTimeout(campaignTimeoutId);
    campaignTimeoutId = null;
  }

  lockCampaignForm(false);
  btnPauseCampaign.style.display = 'none';
  btnStartCampaign.style.display = 'inline-flex';
  
  campaignStatusText.innerText = "Statut : Inactif";
  campaignStatusDot.className = "status-dot";
  progressBarFill.style.width = '0%';
  progressText.innerText = "0 / 0";
  statSentText.innerText = "0";
  statFailedText.innerText = "0";
  
  logToConsole("Campagne réinitialisée.", 'system');
}

// Loop execution step by step
async function runCampaignLoop() {
  if (!campaignRunning || campaignPaused) return;

  if (campaignCurrentIndex >= campaignContacts.length) {
    logToConsole(`Campagne terminée ! Envoyés: ${campaignSentCount} | Échecs: ${campaignFailedCount}`, 'success');
    
    // Save to campaign history
    try {
      const checkedBoxes = document.querySelectorAll('input[name="campaign-sender-participant"]:checked');
      const senderIds = Array.from(checkedBoxes).map(cb => cb.value);
      const senderNames = senderIds.map(id => {
        const acc = accounts.find(a => a.id === id);
        return acc ? acc.name : id;
      }).join(', ');

      const campaigns = await window.api.getCampaigns() || [];
      const newCampaign = {
        id: 'camp_' + Date.now(),
        senderName: senderNames || 'Multi-Comptes',
        date: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
        totalContacts: campaignContacts.length,
        sentCount: campaignSentCount,
        failedCount: campaignFailedCount,
        messages: currentCampaignMessages
      };
      campaigns.unshift(newCampaign);
      await window.api.saveCampaigns(campaigns);
    } catch (err) {
      console.error("Failed to save campaign history:", err);
    }

    alert("Campagne terminée !");
    resetCampaign();
    return;
  }

  const checkedBoxes = document.querySelectorAll('input[name="campaign-sender-participant"]:checked');
  const senderIds = Array.from(checkedBoxes).map(cb => cb.value);
  if (senderIds.length === 0) {
    logToConsole(`[Erreur] Aucun compte expéditeur n'est sélectionné pour cette campagne.`, 'error');
    alert("Veuillez sélectionner au moins un compte expéditeur.");
    pauseCampaign();
    return;
  }

  let selectedSenderId = null;
  let attempts = 0;
  while (attempts < senderIds.length) {
    const candidateId = senderIds[campaignSenderIndex % senderIds.length];
    campaignSenderIndex++;
    attempts++;
    if (canAccountSendToday(candidateId)) {
      selectedSenderId = candidateId;
      break;
    }
  }

  if (!selectedSenderId) {
    logToConsole(`[Alerte Limite] Tous les comptes expéditeurs sélectionnés ont atteint leur limite quotidienne de 30 messages.`, 'error');
    alert(`Tous les comptes expéditeurs sélectionnés ont atteint leur limite quotidienne de 30 messages aujourd'hui.`);
    pauseCampaign();
    return;
  }

  const senderId = selectedSenderId;
  const sender = accounts.find(acc => acc.id === senderId);

  const contact = campaignContacts[campaignCurrentIndex];
  const antiDupeCheckbox = document.getElementById('chk-anti-dupe');
  const antiDupeEnabled = antiDupeCheckbox ? antiDupeCheckbox.checked : true;
  
  if (antiDupeEnabled && contactedPhones.has(contact.phone)) {
    logToConsole(`[Doublon] Le numéro ${contact.phone} (${contact.name}) a déjà été contacté par un autre compte (Ignoré).`, 'accent');
    campaignCurrentIndex++;
    updateStatsUI();
    setTimeout(runCampaignLoop, 50);
    return;
  }
  logToConsole(`[Destinataire ${campaignCurrentIndex + 1}/${campaignContacts.length}] Traitement de ${contact.name} (${contact.phone})...`, 'info');

  // Replace {nom} template variable
  const rawPromptTemplate = campaignPromptInput.value.trim();
  const personalizedPrompt = rawPromptTemplate
    .replace(/\{nom\}/gi, contact.name)
    .replace(/\{name\}/gi, contact.name);

  const tone = campaignToneSelect.value;
  const lmUrl = lmStudioUrlInput.value.trim();
  const modelId = campaignModelIdInput.value.trim();
  const provider = campaignApiProviderSelect.value;
  const apiKey = campaignApiKeyInput.value.trim();
  
  logToConsole(`Appel de l'IA (Modèle: ${modelId}) pour réécriture...`, 'system');
  const rewritten = await rewriteMessageWithLocalAI(personalizedPrompt, tone, lmUrl, modelId, provider, apiKey);
  logToConsole(`Message généré : "${rewritten}"`, 'accent');

  logToConsole(`Envoi du message vers ${contact.phone}...`, 'info');
  
  const sendResult = await executeSendInsideWebview(senderId, contact.phone, rewritten);
  
  if (sendResult.status === 'sent') {
    campaignSentCount++;
    logToConsole(`Message envoyé à ${contact.name} (${contact.phone})`, 'success');
    await incrementAccountSentCount(senderId);
    try {
      await window.api.addContactedNumber(contact.phone);
      contactedPhones.add(contact.phone);
    } catch (err) {
      console.error("Failed to save contacted number:", err);
    }
  } else if (sendResult.status === 'invalid_number') {
    campaignFailedCount++;
    logToConsole(`Erreur : Le numéro ${contact.phone} n'est pas enregistré sur WhatsApp.`, 'error');
  } else {
    campaignFailedCount++;
    logToConsole(`Échec d'envoi à ${contact.phone} (Raison: ${sendResult.status || sendResult.reason || 'Délai dépassé'})`, 'error');
  }

  // Track message result in history
  currentCampaignMessages.push({
    phone: contact.phone,
    name: contact.name,
    text: rewritten,
    status: sendResult.status,
    timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  });

  campaignCurrentIndex++;
  updateStatsUI();

  if (campaignCurrentIndex < campaignContacts.length) {
    const minDelay = Math.max(3, parseInt(delayMinInput.value, 10) || 6);
    const maxDelay = Math.max(minDelay, parseInt(delayMaxInput.value, 10) || 15);
    const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    
    logToConsole(`Attente anti-ban de ${randomDelay} secondes...`, 'system');
    campaignTimeoutId = setTimeout(runCampaignLoop, randomDelay * 1000);
  } else {
    runCampaignLoop();
  }
}

function updateStatsUI() {
  const total = campaignContacts.length;
  progressText.innerText = `${campaignCurrentIndex} / ${total}`;
  const percentage = total > 0 ? (campaignCurrentIndex / total) * 100 : 0;
  progressBarFill.style.width = `${percentage}%`;
  statSentText.innerText = campaignSentCount;
  statFailedText.innerText = campaignFailedCount;
}

function lockCampaignForm(locked) {
  const cbs = document.querySelectorAll('input[name="campaign-sender-participant"]');
  cbs.forEach(cb => cb.disabled = locked);
  campaignContactsInput.disabled = locked;
  btnImportFile.disabled = locked;
  campaignPromptInput.disabled = locked;
  campaignToneSelect.disabled = locked;
  delayMinInput.disabled = locked;
  delayMaxInput.disabled = locked;
}

// ----------------------------------------------------
// WARMUP / PEER CONVERSATION CONTROLLER
// ----------------------------------------------------

function appendWarmupChatMessage(senderName, text, direction = 'incoming') {
  const warning = warmupChatBox.querySelector('.warmup-system-message');
  if (warning) warning.remove();

  const msg = document.createElement('div');
  msg.className = `warmup-msg ${direction}`;

  const sender = document.createElement('div');
  sender.className = 'warmup-msg-sender';
  sender.innerText = senderName;

  const content = document.createElement('div');
  content.className = 'warmup-msg-content';
  content.innerText = text;

  const time = document.createElement('div');
  time.className = 'warmup-msg-time';
  const now = new Date();
  time.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  msg.appendChild(sender);
  msg.appendChild(content);
  msg.appendChild(time);
  
  warmupChatBox.appendChild(msg);
  warmupChatBox.scrollTop = warmupChatBox.scrollHeight;
}

async function startWarmup() {
  const checkboxes = document.querySelectorAll('input[name="warmup-participant"]:checked');
  const checkedIds = Array.from(checkboxes).map(cb => cb.value);
  
  if (checkedIds.length < 2) {
    alert("Veuillez sélectionner au moins 2 comptes à chauffer.");
    return;
  }
  
  const url = warmupLmStudioUrlInput.value.trim();
  if (!url) {
    alert("Veuillez configurer l'URL de l'API LM Studio.");
    return;
  }

  if (warmupRunning && warmupPaused) {
    warmupPaused = false;
    warmupStatusText.innerText = "Statut : Chauffage en cours...";
    warmupStatusDot.className = "status-dot active-running";
    btnStartWarmup.style.display = 'none';
    btnPauseWarmup.style.display = 'inline-flex';
    
    appendWarmupChatMessage("Système", "Reprise de la simulation.", 'incoming');
    runWarmupStep();
    return;
  }

  warmupRunning = true;
  warmupPaused = false;
  
  lockWarmupForm(true);
  btnStartWarmup.style.display = 'none';
  btnPauseWarmup.style.display = 'inline-flex';
  
  warmupStatusText.innerText = "Statut : Chauffage en cours...";
  warmupStatusDot.className = "status-dot active-running";
  
  warmupChatBox.innerHTML = '';
  
  appendWarmupChatMessage("Système", "Lancement de la simulation d'échanges entre comptes...", 'incoming');
  runWarmupStep();
}

function pauseWarmup() {
  if (!warmupRunning) return;
  warmupPaused = true;
  warmupStatusText.innerText = "Statut : En pause";
  warmupStatusDot.className = "status-dot";
  btnPauseWarmup.style.display = 'none';
  btnStartWarmup.style.display = 'inline-flex';
  
  if (warmupTimeoutId) {
    clearTimeout(warmupTimeoutId);
    warmupTimeoutId = null;
  }
  
  appendWarmupChatMessage("Système", "Simulation suspendue.", 'incoming');
}

function resetWarmup() {
  warmupRunning = false;
  warmupPaused = false;
  
  if (warmupTimeoutId) {
    clearTimeout(warmupTimeoutId);
    warmupTimeoutId = null;
  }

  lockWarmupForm(false);
  btnPauseWarmup.style.display = 'none';
  btnStartWarmup.style.display = 'inline-flex';
  
  warmupStatusText.innerText = "Statut : Inactif";
  warmupStatusDot.className = "status-dot";
  warmupActivePair.innerText = "Actif : En attente...";
  warmupChatBox.innerHTML = '<div class="warmup-system-message">Discussion non démarrée. Sélectionnez vos comptes et lancez la simulation.</div>';
}

async function runWarmupStep() {
  if (!warmupRunning || warmupPaused) return;

  const checkboxes = document.querySelectorAll('input[name="warmup-participant"]:checked');
  const checkedIds = Array.from(checkboxes).map(cb => cb.value);
  
  if (checkedIds.length < 2) {
    appendWarmupChatMessage("Système", "Erreur: Moins de 2 comptes sélectionnés. Arrêt de la simulation.", 'incoming');
    resetWarmup();
    return;
  }

  const participants = accounts.filter(acc => checkedIds.includes(acc.id) && acc.phone);
  const availableParticipants = participants.filter(acc => canAccountSendToday(acc.id));
  if (availableParticipants.length < 2) {
    appendWarmupChatMessage("Système", "Erreur: Moins de 2 comptes disponibles sous la limite quotidienne de 30 messages. Arrêt du chauffage.", 'incoming');
    resetWarmup();
    return;
  }

  const senderIndex = Math.floor(Math.random() * availableParticipants.length);
  const sender = availableParticipants[senderIndex];
  
  const targets = availableParticipants.filter(acc => acc.id !== sender.id);
  const receiverIndex = Math.floor(Math.random() * targets.length);
  const receiver = targets[receiverIndex];

  warmupActivePair.innerText = `Actif : [${sender.name}] écrit à [${receiver.name}]`;

  const historyKey = [sender.id, receiver.id].sort().join(':');
  if (!warmupHistories[historyKey]) {
    warmupHistories[historyKey] = [];
  }

  const subject = warmupPromptInput.value.trim();
  const lmUrl = warmupLmStudioUrlInput.value.trim();
  const modelId = warmupModelIdInput.value.trim();
  const provider = warmupApiProviderSelect.value;
  const apiKey = warmupApiKeyInput.value.trim();

  const replyText = await generateWarmupReply(sender.name, receiver.name, warmupHistories[historyKey], subject, lmUrl, modelId, provider, apiKey);
  const result = await executeSendInsideWebview(sender.id, receiver.phone, replyText);
  
  if (result.status === 'sent') {
    appendWarmupChatMessage(sender.name, replyText, 'outgoing');
    await incrementAccountSentCount(sender.id);
    
    warmupHistories[historyKey].push(`${sender.name}: ${replyText}`);
    if (warmupHistories[historyKey].length > 10) {
      warmupHistories[historyKey].shift();
    }
  } else {
    appendWarmupChatMessage("Système", `Échec d'échange de [${sender.name}] vers [${receiver.name}] (Raison: ${result.status || result.reason || 'Délai dépassé'})`, 'incoming');
  }

  if (warmupRunning && !warmupPaused) {
    const minDelay = Math.max(5, parseInt(warmupDelayMinInput.value, 10) || 30);
    const maxDelay = Math.max(minDelay, parseInt(warmupDelayMaxInput.value, 10) || 90);
    const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    
    warmupActivePair.innerText = `Attente : ${randomDelay}s avant le prochain échange...`;
    warmupTimeoutId = setTimeout(runWarmupStep, randomDelay * 1000);
  }
}

function lockWarmupForm(locked) {
  const checkboxes = document.querySelectorAll('input[name="warmup-participant"]');
  checkboxes.forEach(cb => cb.disabled = locked);
  warmupPromptInput.disabled = locked;
  warmupApiProviderSelect.disabled = locked;
  warmupApiKeyInput.disabled = locked;
  warmupLmStudioUrlInput.disabled = locked;
  warmupModelIdInput.disabled = locked;
  warmupDelayMinInput.disabled = locked;
  warmupDelayMaxInput.disabled = locked;
}

// Modal controls
function openModal() {
  inputAccountName.value = '';
  modalErrorMessage.style.display = 'none';
  modalOverlay.classList.add('active');
  setTimeout(() => inputAccountName.focus(), 100);
}

function closeModal() {
  modalOverlay.classList.remove('active');
}

function showModalError(msg) {
  modalErrorMessage.innerText = msg;
  modalErrorMessage.style.display = 'block';
}

// Edit Modal controls
function openEditModal(account) {
  editingAccount = account;
  inputEditAccountName.value = account.name;
  inputEditAccountPhone.value = account.phone || '';
  editModalErrorMessage.style.display = 'none';
  editModalOverlay.classList.add('active');
  setTimeout(() => inputEditAccountName.focus(), 100);
}

function closeEditModal() {
  editModalOverlay.classList.remove('active');
  editingAccount = null;
}

async function saveEditAccount() {
  if (!editingAccount) return;
  const name = inputEditAccountName.value.trim();
  const phoneRaw = inputEditAccountPhone.value.trim();
  
  if (!name) {
    showEditModalError("Le nom du compte ne peut pas être vide.");
    return;
  }
  
  // Check if name is unique among other accounts
  const nameExists = accounts.some(acc => acc.id !== editingAccount.id && acc.name.toLowerCase() === name.toLowerCase());
  if (nameExists) {
    showEditModalError("Un compte avec ce nom existe déjà.");
    return;
  }

  let sanitizedPhone = "";
  if (phoneRaw) {
    // Basic formatting clean to parse single raw number
    let clean = phoneRaw.replace(/[\s\-\(\)]/g, '');
    if (clean.startsWith('0') && clean.length === 10) {
      clean = '+33' + clean.substring(1);
    }
    if (/^\d+$/.test(clean)) {
      clean = '+' + clean;
    }

    if (!clean.startsWith('+') || clean.length < 8 || !/^\+\d+$/.test(clean)) {
      showEditModalError("Format de numéro invalide. Utilisez le format international ex: +33612345678");
      return;
    }
    sanitizedPhone = clean;
    
    // Check if phone number is unique among other accounts
    const phoneExists = accounts.some(acc => acc.id !== editingAccount.id && acc.phone === sanitizedPhone);
    if (phoneExists) {
      showEditModalError("Ce numéro de téléphone est déjà assigné à un autre compte.");
      return;
    }
  }

  // Update account fields
  editingAccount.name = name;
  editingAccount.phone = sanitizedPhone;
  
  // Save to file via window.api.saveAccounts
  await window.api.saveAccounts(accounts);
  
  closeEditModal();
  renderSidebar();
  
  // If we are currently showing Campaigns or Warmup, we should refresh those views
  if (campaignView && campaignView.style.display === 'grid') {
    renderCampaignSenderCheckboxes();
  } else if (warmupView && warmupView.style.display === 'grid') {
    renderWarmupCheckboxes();
  }
}

function showEditModalError(msg) {
  editModalErrorMessage.innerText = msg;
  editModalErrorMessage.style.display = 'block';
}

// API Provider Event Handlers
function handleCampaignApiProviderChange(useDefaults = false) {
  const apiSettingsRow = document.getElementById('row-campaign-api-settings');
  const apiTestRow = document.getElementById('row-campaign-api-test');

  grpCampaignApiKey.style.display = 'none';
  if (apiSettingsRow) apiSettingsRow.style.display = 'none';
  if (apiTestRow) apiTestRow.style.display = 'none';
}

function handleWarmupApiProviderChange(useDefaults = false) {
  const apiSettingsRow = document.getElementById('row-warmup-api-settings');
  const apiTestRow = document.getElementById('row-warmup-api-test');

  grpWarmupApiKey.style.display = 'none';
  if (apiSettingsRow) apiSettingsRow.style.display = 'none';
  if (apiTestRow) apiTestRow.style.display = 'none';
}

// Helper to save settings globally
async function saveGlobalSettings() {
  globalSettings = {
    campaignProvider: campaignApiProviderSelect.value,
    campaignApiKey: campaignApiKeyInput.value,
    campaignApiUrl: lmStudioUrlInput.value,
    campaignModelId: campaignModelIdInput.value,
    warmupProvider: warmupApiProviderSelect.value,
    warmupApiKey: warmupApiKeyInput.value,
    warmupApiUrl: warmupLmStudioUrlInput.value,
    warmupModelId: warmupModelIdInput.value
  };
  await window.api.saveSettings(globalSettings);
}

// Check if account can send messages today
function canAccountSendToday(accountId) {
  const account = accounts.find(acc => acc.id === accountId);
  if (!account) return false;
  
  const today = new Date().toISOString().split('T')[0];
  if (account.lastSentDate !== today) {
    account.lastSentDate = today;
    account.sentCountToday = 0;
  }
  
  const sentToday = account.sentCountToday || 0;
  return sentToday < 30;
}

// Increment account sent count
async function incrementAccountSentCount(accountId) {
  const account = accounts.find(acc => acc.id === accountId);
  if (!account) return;
  
  const today = new Date().toISOString().split('T')[0];
  if (account.lastSentDate !== today) {
    account.lastSentDate = today;
    account.sentCountToday = 0;
  }
  
  account.sentCountToday = (account.sentCountToday || 0) + 1;
  await window.api.saveAccounts(accounts);
  renderSidebar();
}

// Initialize on DOM
document.addEventListener('DOMContentLoaded', init);
