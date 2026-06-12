const ACCOUNT_STORAGE_KEY = "ez2earn-accounts-v1";
const INVITATION_STORAGE_KEY = "ez2earn-invitations-v1";
const INVITE_HISTORY_STORAGE_KEY = "ez2earn-invite-history-v1";
const MESSAGE_READ_STORAGE_KEY = "ez2earn-message-reads-v1";
const SHARED_INVOICE_STORAGE_KEY = "ez2earn-shared-invoices-v1";
const VAULT_PREFIX = "ez2earn-vault-";
const LEGACY_INVOICE_KEYS = ["ez2earn-invoices-v3", "ez2earn-invoices-v2"];
const ADMIN_EMAILS = ["irrvyh4815@gmail.com", "r3nault1999@gmail.com"];
const ADMIN_MEMBER_CODES = {
  "irrvyh4815@gmail.com": "EZ-ADMIN-001",
  "r3nault1999@gmail.com": "EZ-ADMIN-002"
};
const EMAIL_VERIFICATION_ENABLED = false;
const PBKDF2_ITERATIONS = 150000;
const APP_VERSION = "ez2earn_260612006";
const VERSION_HISTORY = [
  {
    version: APP_VERSION,
    date: "2026/06/12",
    items: [
      "請款明細新增大項目與小支項分類輸入。",
      "共同編輯收合列常態顯示目前共用人數。",
      "PDF 匯出會依是否勾選保留款與折扣決定是否顯示欄位。",
      { text: "最高權限管理員可刪除其他最高權限管理員帳號。", adminOnly: true }
    ]
  },
  {
    version: "ez2earn_260612005",
    date: "2026/06/12",
    items: [
      "共同編輯區塊新增創建者、共同編輯者與檢視者權限管理。",
      "新增邀請紀錄與表單成員清單，可快速邀請常用成員。",
      "新增編輯記錄，記錄表單儲存、權限異動、留言與狀態變更。",
      "留言板浮動按鈕新增未讀紅點提醒。",
      { text: "版本詳情會依帳號權限隱藏企業端與最高權限管理紀錄。", adminOnly: true }
    ]
  },
  {
    version: "ez2earn_260612004",
    date: "2026/06/12",
    items: [
      "被邀請共同編輯的請款單會直接顯示於主列表。",
      "列表與表頭新增綠色共同編輯標籤。",
      "通知按鈕統一為前往並可跳轉請款單。",
      "優化通知紅點、喇叭圖示與主要按鈕圖示。"
    ]
  },
  {
    version: "ez2earn_260612003",
    date: "2026/06/12",
    items: [
      "新增註冊信箱驗證碼預留欄位與開關，目前正式上架前不啟用。",
      { text: "新增 r3nault1999@gmail.com 為最高權限管理員。", adminOnly: true },
      { text: "版本號更新並記錄本次帳號註冊與權限調整。", adminOnly: true }
    ]
  },
  {
    version: "ez2earn_260612002",
    date: "2026/06/12",
    items: [
      "留言板移至右側浮動欄通知下方，僅於請款單編輯頁顯示。",
      { text: "最高權限管理員新增用戶數據分析。", adminOnly: true },
      "版本號更新並記錄本次介面與管理功能調整。"
    ]
  },
  {
    version: "ez2earn_260612001",
    date: "2026/06/12",
    items: [
      "新增請款單留言板與留言通知。",
      "通知改為喇叭圖示展開面板，未讀通知顯示紅點。",
      "已結案請款單可恢復為進行中。",
      "新增版本號、製作團隊與帳號管理內的版本詳情。"
    ]
  }
];

const defaultInfo = {
  projectName: "A 棟機電追加工程",
  clientName: "宏盛營造股份有限公司",
  clientTaxId: "",
  clientContact: "",
  clientPhone: "",
  contractorName: "Ez2Earn 工程行",
  contractorTaxId: "",
  contractorContact: "",
  contractorPhone: "",
  invoiceNo: "INV-2026-0610",
  billingPeriod: "2026/06/01 - 2026/06/10",
  paymentMethod: "轉帳",
  customPaymentMethod: "",
  isTaxIncluded: false,
  taxRate: 0,
  hasRetention: false,
  retentionRate: 0,
  hasDiscount: false,
  discountAmount: 0,
  paymentTerms: "月結 30 天",
  remarks: ""
};

const infoFields = [
  "projectName",
  "clientName",
  "clientTaxId",
  "clientContact",
  "clientPhone",
  "contractorName",
  "contractorTaxId",
  "contractorContact",
  "contractorPhone",
  "invoiceNo",
  "billingPeriod",
  "paymentMethod",
  "customPaymentMethod",
  "isTaxIncluded",
  "taxRate",
  "hasRetention",
  "retentionRate",
  "hasDiscount",
  "discountAmount",
  "paymentTerms",
  "remarks"
];

const state = {
  accounts: [],
  invitations: [],
  currentUser: null,
  cryptoKey: null,
  invoices: [],
  activeInvoiceId: null,
  activeInvoice: null,
  activeInvoiceSource: "own",
  isInvoiceDirty: false,
  selectedDetailIds: new Set(),
  pendingDeleteAction: null,
  pendingCloseAction: null,
  pendingMemberInfoCode: "",
  draggedDetailId: null,
  pointerDragId: null,
  pointerDropId: null,
  invoiceSearchQuery: ""
};

const currencyFormatter = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "TWD",
  maximumFractionDigits: 0
});

const numberFormatter = new Intl.NumberFormat("zh-TW", {
  maximumFractionDigits: 2
});

const authView = document.querySelector("#authView");
const listView = document.querySelector("#listView");
const formView = document.querySelector("#formView");
const loginTab = document.querySelector("#loginTab");
const registerTab = document.querySelector("#registerTab");
const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");
const authMessage = document.querySelector("#authMessage");
const invoiceList = document.querySelector("#invoiceList");
const invoiceCount = document.querySelector("#invoiceCount");
const invoiceSearchInput = document.querySelector("#invoiceSearchInput");
const noticeList = document.querySelector("#noticeList");
const noticeCount = document.querySelector("#noticeCount");
const detailsContainer = document.querySelector("#detailsContainer");
const collaborativeBadge = document.querySelector("#collaborativeBadge");
const exportButton = document.querySelector("#exportButton");
const exportMenu = document.querySelector("#exportMenu");
const saveStatus = document.querySelector("#saveStatus");
const saveInvoiceButton = document.querySelector("#saveInvoiceButton");
const accountPanel = document.querySelector("#accountPanel");
const accountMessage = document.querySelector("#accountMessage");
const versionPanel = document.querySelector("#versionPanel");
const versionList = document.querySelector("#versionList");
const appVersionLabels = document.querySelectorAll("[data-app-version]");
const adminPanel = document.querySelector("#adminPanel");
const adminAccountList = document.querySelector("#adminAccountList");
const accountCount = document.querySelector("#accountCount");
const inviteMessage = document.querySelector("#inviteMessage");
const inviteRoleSelect = document.querySelector("#inviteRole");
const inviteHistoryList = document.querySelector("#inviteHistoryList");
const collaborationMemberList = document.querySelector("#collaborationMemberList");
const collaborationCountPill = document.querySelector("#collaborationCountPill");
const ownerOnlyPill = document.querySelector("#ownerOnlyPill");
const sessionSidebar = document.querySelector("#sessionSidebar");
const sidebarUserLine = document.querySelector("#sidebarUserLine");
const sidebarLastSavedLine = document.querySelector("#sidebarLastSavedLine");
const noticeWidget = document.querySelector("#noticeWidget");
const noticeToggle = document.querySelector("#noticeToggle");
const noticePanel = document.querySelector("#noticePanel");
const noticeDot = document.querySelector("#noticeDot");
const lastSavedLine = document.querySelector("#lastSavedLine");
const messageBoardButton = document.querySelector("#messageBoardButton");
const messageBoardDot = document.querySelector("#messageBoardDot");
const messageBoardWidget = document.querySelector("#messageBoardWidget");
const messageBoardPanel = document.querySelector("#messageBoardPanel");
const messageBoardList = document.querySelector("#messageBoardList");
const messageBoardForm = document.querySelector("#messageBoardForm");
const messageInput = document.querySelector("#messageInput");
const messageBoardStatus = document.querySelector("#messageBoardStatus");
const closeMessageBoardButton = document.querySelector("#closeMessageBoardButton");
const leaveConfirmPanel = document.querySelector("#leaveConfirmPanel");
const saveAndLeaveButton = document.querySelector("#saveAndLeaveButton");
const leaveWithoutSaveButton = document.querySelector("#leaveWithoutSaveButton");
const stayOnFormButton = document.querySelector("#stayOnFormButton");
const cancelLeaveButton = document.querySelector("#cancelLeaveButton");
const deleteInvoiceButton = document.querySelector("#deleteInvoiceButton");
const closeInvoiceButton = document.querySelector("#closeInvoiceButton");
const selectAllDetails = document.querySelector("#selectAllDetails");
const copySelectedDetailsButton = document.querySelector("#copySelectedDetailsButton");
const deleteSelectedDetailsButton = document.querySelector("#deleteSelectedDetailsButton");
const addSectionButton = document.querySelector("#addSectionButton");
const customPaymentMethodWrap = document.querySelector("#customPaymentMethodWrap");
const customPaymentMethodInput = document.querySelector("#customPaymentMethod");
const taxRateWrap = document.querySelector("#taxRateWrap");
const taxRateInput = document.querySelector("#taxRate");
const retentionRateWrap = document.querySelector("#retentionRateWrap");
const retentionRateInput = document.querySelector("#retentionRate");
const discountAmountWrap = document.querySelector("#discountAmountWrap");
const discountAmountInput = document.querySelector("#discountAmount");
const toggleFormulaButton = document.querySelector("#toggleFormulaButton");
const formulaPanel = document.querySelector("#formulaPanel");
const formulaList = document.querySelector("#formulaList");
const deleteConfirmPanel = document.querySelector("#deleteConfirmPanel");
const deleteConfirmText = document.querySelector("#deleteConfirmText");
const confirmDeleteButton = document.querySelector("#confirmDeleteButton");
const cancelDeleteButton = document.querySelector("#cancelDeleteButton");
const cancelDeleteActionButton = document.querySelector("#cancelDeleteActionButton");
const closeConfirmPanel = document.querySelector("#closeConfirmPanel");
const closeConfirmText = document.querySelector("#closeConfirmText");
const closeConfirmTitle = document.querySelector("#closeConfirmTitle");
const confirmCloseButton = document.querySelector("#confirmCloseButton");
const cancelCloseButton = document.querySelector("#cancelCloseButton");
const cancelCloseActionButton = document.querySelector("#cancelCloseActionButton");
const versionDetailButton = document.querySelector("#versionDetailButton");
const closeVersionButton = document.querySelector("#closeVersionButton");
const userAnalyticsButton = document.querySelector("#userAnalyticsButton");
const analyticsPanel = document.querySelector("#analyticsPanel");
const analyticsContent = document.querySelector("#analyticsContent");
const closeAnalyticsButton = document.querySelector("#closeAnalyticsButton");
const editLogPanel = document.querySelector("#editLogPanel");
const editLogList = document.querySelector("#editLogList");
const closeEditLogButton = document.querySelector("#closeEditLogButton");
const memberInfoPanel = document.querySelector("#memberInfoPanel");
const memberInfoContent = document.querySelector("#memberInfoContent");
const closeMemberInfoButton = document.querySelector("#closeMemberInfoButton");

function createInvoice(overrides = {}) {
  const now = new Date();
  return {
    id: createId("invoice"),
    ownerMemberCode: state.currentUser?.memberCode || "",
    updatedAt: now.toISOString(),
    isClosed: false,
    closedAt: "",
    collaborators: [],
    viewers: [],
    messages: [],
    editLogs: [createEditLog("建立表單", "建立新請款單")],
    info: { ...defaultInfo, invoiceNo: `INV-${formatDateCode(now)}` },
    details: [
      { id: createId("detail"), type: "section", name: "電氣工程" },
      { id: createId("detail"), name: "弱電管線配管", unit: "式", qty: 1, price: 86000, cost: 62000 },
      { id: createId("detail"), name: "照明迴路追加", unit: "點", qty: 24, price: 1800, cost: 1120 },
      { id: createId("detail"), type: "section", name: "現場支援" },
      { id: createId("detail"), name: "現場協調及測試", unit: "日", qty: 3, price: 6500, cost: 4200 }
    ],
    ...overrides
  };
}

function createId(prefix) {
  if (crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDateCode(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}${mm}${dd}-${hh}${min}`;
}

async function initApp() {
  state.accounts = loadAccounts();
  state.invitations = loadInvitations();
  ensureAdminAccount();
  renderVersionLabels();
  showAuth();
}

function loadAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem(ACCOUNT_STORAGE_KEY) || "[]");
    return Array.isArray(accounts) ? accounts.map(normalizeAccount) : [];
  } catch {
    return [];
  }
}

function normalizeAccount(account) {
  return {
    email: normalizeEmail(account.email),
    nickname: account.nickname || "未命名會員",
    memberCode: account.memberCode || generateMemberCode(),
    role: account.role || "user",
    salt: account.salt,
    passwordHash: account.passwordHash,
    disabled: Boolean(account.disabled),
    createdAt: account.createdAt || new Date().toISOString(),
    updatedAt: account.updatedAt || account.createdAt || new Date().toISOString(),
    lastLoginAt: account.lastLoginAt || ""
  };
}

function saveAccounts() {
  localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(state.accounts));
}

function loadInvitations() {
  try {
    const invitations = JSON.parse(localStorage.getItem(INVITATION_STORAGE_KEY) || "[]");
    return Array.isArray(invitations) ? invitations.map(normalizeNotification) : [];
  } catch {
    return [];
  }
}

function saveInvitations() {
  localStorage.setItem(INVITATION_STORAGE_KEY, JSON.stringify(state.invitations));
}

function normalizeNotification(notification) {
  return {
    id: notification.id || createId("notice"),
    type: notification.type || "invite",
    role: notification.role || "editor",
    fromMemberCode: notification.fromMemberCode || "",
    fromNickname: notification.fromNickname || "系統",
    toMemberCode: notification.toMemberCode || "",
    invoiceId: notification.invoiceId || "",
    invoiceNo: notification.invoiceNo || "",
    projectName: notification.projectName || "",
    messageText: notification.messageText || "",
    read: Boolean(notification.read),
    createdAt: notification.createdAt || new Date().toISOString()
  };
}

function loadInviteHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(INVITE_HISTORY_STORAGE_KEY) || "[]");
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

function saveInviteHistory(history) {
  localStorage.setItem(INVITE_HISTORY_STORAGE_KEY, JSON.stringify(history));
}

function rememberInviteTarget(account) {
  if (!state.currentUser || !account) return;
  const history = loadInviteHistory().filter((item) => (
    item.ownerMemberCode !== state.currentUser.memberCode ||
    item.targetMemberCode !== account.memberCode
  ));
  history.unshift({
    ownerMemberCode: state.currentUser.memberCode,
    targetMemberCode: account.memberCode,
    email: account.email,
    nickname: account.nickname,
    invitedAt: new Date().toISOString()
  });
  saveInviteHistory(history.slice(0, 80));
}

function getInviteHistoryForCurrentUser() {
  if (!state.currentUser) return [];
  return loadInviteHistory()
    .filter((item) => item.ownerMemberCode === state.currentUser.memberCode)
    .slice(0, 12);
}

function loadMessageReads() {
  try {
    const reads = JSON.parse(localStorage.getItem(MESSAGE_READ_STORAGE_KEY) || "{}");
    return reads && typeof reads === "object" ? reads : {};
  } catch {
    return {};
  }
}

function saveMessageReads(reads) {
  localStorage.setItem(MESSAGE_READ_STORAGE_KEY, JSON.stringify(reads));
}

function getMessageReadKey(invoiceId) {
  return `${state.currentUser?.memberCode || "guest"}:${invoiceId}`;
}

function getMessageReadAt(invoiceId) {
  return loadMessageReads()[getMessageReadKey(invoiceId)] || "";
}

function markMessagesRead(invoice = state.activeInvoice) {
  if (!invoice || !state.currentUser) return;
  const latest = getLatestMessage(invoice);
  if (!latest) return;
  const reads = loadMessageReads();
  reads[getMessageReadKey(invoice.id)] = latest.createdAt;
  saveMessageReads(reads);
  updateMessageBoardDot();
}

function ensureAdminAccount() {
  let didUpdate = false;
  ADMIN_EMAILS.forEach((email) => {
    const adminEmail = normalizeEmail(email);
    const adminAccount = state.accounts.find((account) => account.email === adminEmail);
    if (!adminAccount) return;
    const previousMemberCode = adminAccount.memberCode;
    const nextMemberCode = getAdminMemberCode(adminEmail);
    adminAccount.role = "admin";
    adminAccount.memberCode = nextMemberCode;
    migrateVaultKey(previousMemberCode, nextMemberCode);
    didUpdate = true;
  });
  if (didUpdate) saveAccounts();
}

function migrateVaultKey(previousMemberCode, nextMemberCode) {
  if (!previousMemberCode || previousMemberCode === nextMemberCode) return;
  const previousKey = `${VAULT_PREFIX}${previousMemberCode}`;
  const nextKey = `${VAULT_PREFIX}${nextMemberCode}`;
  const savedVault = localStorage.getItem(previousKey);
  if (savedVault && !localStorage.getItem(nextKey)) {
    localStorage.setItem(nextKey, savedVault);
  }
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function generateMemberCode() {
  const numericCodes = state.accounts
    .map((account) => String(account.memberCode || "").match(/^EZ-(\d{6})$/))
    .filter(Boolean)
    .map((match) => Number(match[1]));
  const next = numericCodes.length > 0 ? Math.max(...numericCodes) + 1 : 1;
  return `EZ-${String(next).padStart(6, "0")}`;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
}

function isAdminEmail(email) {
  return ADMIN_EMAILS.map(normalizeEmail).includes(normalizeEmail(email));
}

function getAdminMemberCode(email) {
  return ADMIN_MEMBER_CODES[normalizeEmail(email)] || generateMemberCode();
}

function isEmailVerificationSatisfied() {
  if (!EMAIL_VERIFICATION_ENABLED) return true;
  const code = document.querySelector("#registerEmailCode")?.value.trim();
  return code.length >= 6;
}

function randomBase64(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytesToBase64(bytes);
}

async function getPasswordKeyMaterial(password) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
}

async function derivePasswordHash(password, saltBase64) {
  const keyMaterial = await getPasswordKeyMaterial(password);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: base64ToBytes(saltBase64),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );
  return bytesToBase64(new Uint8Array(bits));
}

async function deriveVaultKey(password, saltBase64) {
  const keyMaterial = await getPasswordKeyMaterial(password);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: base64ToBytes(saltBase64),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function verifyPassword(account, password) {
  const hash = await derivePasswordHash(password, account.salt);
  return hash === account.passwordHash;
}

async function encryptJson(payload, key) {
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return {
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(encrypted))
  };
}

async function decryptJson(payload, key) {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(payload.iv) },
    key,
    base64ToBytes(payload.data)
  );
  return JSON.parse(new TextDecoder().decode(decrypted));
}

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function showAuth(mode = "login") {
  const next = () => {
    state.currentUser = null;
    state.cryptoKey = null;
    state.invoices = [];
    state.activeInvoice = null;
    state.activeInvoiceId = null;
    state.isInvoiceDirty = false;
    authView.classList.remove("is-hidden");
    listView.classList.add("is-hidden");
    formView.classList.add("is-hidden");
    accountPanel.classList.add("is-hidden");
    detailsContainer.innerHTML = "";
    closeLeaveConfirm();
    closeDeleteConfirm();
    closeCloseConfirm();
    closeMessageBoard();
    updateMessageBoardWidget(false);
    updateSessionSidebar(false);
    switchAuthTab(mode);
  };

  if (authView.classList.contains("is-hidden")) {
    animateViewChange(next);
  } else {
    next();
  }
}

function switchAuthTab(mode) {
  const isLogin = mode === "login";
  loginTab.classList.toggle("is-active", isLogin);
  registerTab.classList.toggle("is-active", !isLogin);
  loginForm.classList.toggle("is-hidden", !isLogin);
  registerForm.classList.toggle("is-hidden", isLogin);
  authMessage.textContent = "";
}

async function handleLogin(event) {
  event.preventDefault();
  const email = normalizeEmail(document.querySelector("#loginEmail").value);
  const password = document.querySelector("#loginPassword").value;
  const account = state.accounts.find((item) => item.email === email);

  if (!account || !(await verifyPassword(account, password))) {
    setFormMessage(authMessage, "Email 或密碼錯誤。", "error");
    return;
  }

  if (account.disabled) {
    setFormMessage(authMessage, "此帳號已被停用，請聯絡管理員。", "error");
    return;
  }

  state.currentUser = account;
  account.lastLoginAt = new Date().toISOString();
  account.updatedAt = account.lastLoginAt;
  saveAccounts();
  state.cryptoKey = await deriveVaultKey(password, account.salt);
  await loadUserVault();
  loginForm.reset();
  showList();
}

async function handleRegister(event) {
  event.preventDefault();
  const email = normalizeEmail(document.querySelector("#registerEmail").value);
  const nickname = document.querySelector("#registerNickname").value.trim();
  const password = document.querySelector("#registerPassword").value;
  const confirm = document.querySelector("#registerPasswordConfirm").value;

  if (!validateEmail(email)) {
    setFormMessage(authMessage, "請輸入有效 Email。", "error");
    return;
  }

  if (!nickname) {
    setFormMessage(authMessage, "請輸入暱稱。", "error");
    return;
  }

  if (state.accounts.some((account) => account.email === email)) {
    setFormMessage(authMessage, "此 Email 已註冊。", "error");
    return;
  }

  if (!validatePassword(password)) {
    setFormMessage(authMessage, "密碼需包含大寫、小寫、數字與符號，且至少 8 碼。", "error");
    return;
  }

  if (password !== confirm) {
    setFormMessage(authMessage, "兩次密碼輸入不一致。", "error");
    return;
  }

  if (!isEmailVerificationSatisfied()) {
    setFormMessage(authMessage, "請完成信箱驗證碼驗證。", "error");
    return;
  }

  const salt = randomBase64(16);
  const isAdmin = isAdminEmail(email);
  const account = {
    email,
    nickname,
    memberCode: isAdmin ? getAdminMemberCode(email) : generateMemberCode(),
    role: isAdmin ? "admin" : "user",
    salt,
    passwordHash: await derivePasswordHash(password, salt),
    disabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };
  state.accounts.push(account);
  saveAccounts();

  state.currentUser = account;
  state.cryptoKey = await deriveVaultKey(password, salt);
  state.invoices = [createInvoice()];
  await persistInvoices();
  registerForm.reset();
  showList();
}

async function loadUserVault() {
  const vaultKey = `${VAULT_PREFIX}${state.currentUser.memberCode}`;
  const saved = localStorage.getItem(vaultKey);

  if (saved) {
    try {
      const decrypted = await decryptJson(JSON.parse(saved), state.cryptoKey);
      state.invoices = Array.isArray(decrypted.invoices) ? decrypted.invoices.map(normalizeInvoice) : [];
    } catch {
      state.invoices = [];
      setFormMessage(authMessage, "資料庫無法解密，請確認密碼或聯絡管理員。", "error");
    }
  } else {
    state.invoices = loadLegacyInvoices();
    if (state.invoices.length === 0) {
      state.invoices = [createInvoice()];
    }
    await persistInvoices();
  }
  await syncOwnedSharedInvoices();
}

async function syncOwnedSharedInvoices() {
  const ownedSharedInvoices = loadSharedInvoices().filter((invoice) => invoice.ownerMemberCode === state.currentUser.memberCode);
  let didUpdate = false;
  ownedSharedInvoices.forEach((sharedInvoice) => {
    const index = state.invoices.findIndex((invoice) => invoice.id === sharedInvoice.id);
    if (index < 0) {
      state.invoices.unshift(sharedInvoice);
      didUpdate = true;
      return;
    }
    if (new Date(sharedInvoice.updatedAt) > new Date(state.invoices[index].updatedAt)) {
      state.invoices[index] = sharedInvoice;
      didUpdate = true;
    }
  });
  if (didUpdate) await persistInvoices();
}

function loadLegacyInvoices() {
  for (const key of LEGACY_INVOICE_KEYS) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeInvoice);
      }
    } catch {
      // Ignore malformed legacy payloads.
    }
  }
  return [];
}

function normalizeInvoice(invoice) {
  const fallback = createInvoice({ id: invoice.id || createId("invoice") });
  return {
    ...fallback,
    ...invoice,
    ownerMemberCode: invoice.ownerMemberCode || state.currentUser?.memberCode || "",
    isClosed: Boolean(invoice.isClosed),
    closedAt: invoice.closedAt || "",
    collaborators: uniqueMemberCodes(invoice.collaborators),
    viewers: uniqueMemberCodes(invoice.viewers).filter((memberCode) => !uniqueMemberCodes(invoice.collaborators).includes(memberCode)),
    messages: Array.isArray(invoice.messages) ? invoice.messages.map(normalizeMessage) : [],
    editLogs: Array.isArray(invoice.editLogs) && invoice.editLogs.length > 0
      ? invoice.editLogs.map(normalizeEditLog)
      : [createEditLog("建立表單", "舊資料補齊編輯記錄")],
    info: { ...defaultInfo, ...(invoice.info || {}) },
    details: normalizeDetails(invoice)
  };
}

function uniqueMemberCodes(value) {
  return [...new Set((Array.isArray(value) ? value : []).filter(Boolean))];
}

function normalizeMessage(message) {
  return {
    id: message.id || createId("message"),
    authorMemberCode: message.authorMemberCode || "",
    authorNickname: message.authorNickname || "未知成員",
    text: String(message.text || "").trim(),
    createdAt: message.createdAt || new Date().toISOString()
  };
}

function createEditLog(action, detail = "") {
  return {
    id: createId("log"),
    action,
    detail,
    memberCode: state.currentUser?.memberCode || "",
    nickname: state.currentUser?.nickname || "系統",
    createdAt: new Date().toISOString()
  };
}

function normalizeEditLog(log) {
  return {
    id: log.id || createId("log"),
    action: log.action || "更新表單",
    detail: log.detail || "",
    memberCode: log.memberCode || "",
    nickname: log.nickname || "未知成員",
    createdAt: log.createdAt || new Date().toISOString()
  };
}

function addEditLog(action, detail = "") {
  if (!state.activeInvoice) return;
  state.activeInvoice.editLogs = Array.isArray(state.activeInvoice.editLogs) ? state.activeInvoice.editLogs : [];
  state.activeInvoice.editLogs.unshift(createEditLog(action, detail));
  state.activeInvoice.editLogs = state.activeInvoice.editLogs.slice(0, 120);
}

function normalizeDetails(invoice) {
  if (Array.isArray(invoice.details) && invoice.details.length > 0) {
    return invoice.details.map(normalizeDetail);
  }

  if (Array.isArray(invoice.groups) && invoice.groups.length > 0) {
    return invoice.groups.flatMap((group) => {
      const items = Array.isArray(group.items) ? group.items : [];
      return items.map((item) => normalizeDetail({
        ...item,
        name: item.name || group.name || ""
      }));
    });
  }

  return createInvoice().details;
}

function normalizeDetail(detail) {
  if (detail.type === "section") {
    return {
      id: detail.id || createId("detail"),
      type: "section",
      name: detail.name || "未命名大項目"
    };
  }
  return {
    id: detail.id || createId("detail"),
    type: "item",
    name: detail.name || "",
    unit: detail.unit || "式",
    qty: toNumber(detail.qty),
    price: toNumber(detail.price),
    cost: toNumber(detail.cost)
  };
}

function createEmptyDetail() {
  return { id: createId("detail"), type: "item", name: "", unit: "式", qty: 1, price: 0, cost: 0 };
}

function createEmptySection() {
  return { id: createId("detail"), type: "section", name: "新增大項目" };
}

function isSectionDetail(detail) {
  return detail?.type === "section";
}

function getBillableDetails(invoice = state.activeInvoice) {
  return (invoice?.details || []).filter((detail) => !isSectionDetail(detail));
}

async function persistInvoices() {
  if (!state.currentUser || !state.cryptoKey) return;
  const encrypted = await encryptJson({ invoices: state.invoices }, state.cryptoKey);
  localStorage.setItem(`${VAULT_PREFIX}${state.currentUser.memberCode}`, JSON.stringify(encrypted));
}

function loadSharedInvoices() {
  try {
    const invoices = JSON.parse(localStorage.getItem(SHARED_INVOICE_STORAGE_KEY) || "[]");
    return Array.isArray(invoices) ? invoices.map(normalizeInvoice) : [];
  } catch {
    return [];
  }
}

function saveSharedInvoices(invoices) {
  localStorage.setItem(SHARED_INVOICE_STORAGE_KEY, JSON.stringify(invoices));
}

function upsertSharedInvoice(invoice) {
  const members = [...(invoice?.collaborators || []), ...(invoice?.viewers || [])];
  if (!invoice || members.length === 0) return;
  const sharedInvoices = loadSharedInvoices();
  const snapshot = cloneData(invoice);
  const index = sharedInvoices.findIndex((item) => item.id === snapshot.id);
  if (index >= 0) {
    sharedInvoices[index] = snapshot;
  } else {
    sharedInvoices.unshift(snapshot);
  }
  saveSharedInvoices(sharedInvoices);
}

function removeSharedInvoice(invoiceId) {
  saveSharedInvoices(loadSharedInvoices().filter((invoice) => invoice.id !== invoiceId));
}

function getAccessibleSharedInvoices() {
  if (!state.currentUser) return [];
  const ownIds = new Set(state.invoices.map((invoice) => invoice.id));
  return loadSharedInvoices()
    .filter((invoice) => !ownIds.has(invoice.id))
    .filter((invoice) => canAccessInvoice(invoice));
}

function getVisibleInvoices() {
  return [...state.invoices, ...getAccessibleSharedInvoices()];
}

function findVisibleInvoice(invoiceId) {
  return getVisibleInvoices().find((invoice) => invoice.id === invoiceId);
}

function isSharedInvoice(invoice) {
  return Boolean(invoice && state.currentUser && invoice.ownerMemberCode !== state.currentUser.memberCode && canAccessInvoice(invoice));
}

function cloneData(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function getCurrentView() {
  return [authView, listView, formView].find((view) => !view.classList.contains("is-hidden")) || authView;
}

function animateViewChange(next) {
  const currentView = getCurrentView();
  currentView.classList.add("is-leaving");

  window.setTimeout(() => {
    next();
    currentView.classList.remove("is-leaving");
    const activeView = getCurrentView();
    activeView.classList.add("is-entering");
    window.setTimeout(() => activeView.classList.remove("is-entering"), 520);
  }, 260);
}

function showList() {
  const next = () => {
    state.activeInvoiceId = null;
    state.activeInvoice = null;
    state.activeInvoiceSource = "own";
    state.isInvoiceDirty = false;
    state.selectedDetailIds.clear();
    closeExportMenu();
    closeLeaveConfirm();
    closeDeleteConfirm();
    closeCloseConfirm();
    closeMessageBoard();
    updateMessageBoardWidget(false);
    authView.classList.add("is-hidden");
    listView.classList.remove("is-hidden");
    formView.classList.add("is-hidden");
    detailsContainer.innerHTML = "";
    renderCurrentUser();
    renderNotices();
    renderInvoiceList();
    updateSessionSidebar(true);
  };

  if (!listView.classList.contains("is-hidden")) {
    next();
  } else {
    animateViewChange(next);
  }
}

function showForm(invoiceId) {
  const next = () => {
    const invoice = findVisibleInvoice(invoiceId);
    if (!invoice) {
      renderInvoiceList();
      return;
    }
    state.activeInvoice = cloneData(invoice);
    state.activeInvoiceId = invoiceId;
    state.activeInvoiceSource = state.invoices.some((item) => item.id === invoiceId) ? "own" : "shared";
    state.isInvoiceDirty = false;
    state.selectedDetailIds.clear();
    authView.classList.add("is-hidden");
    listView.classList.add("is-hidden");
    formView.classList.remove("is-hidden");
    saveStatus.textContent = "";
    inviteMessage.textContent = "";
    closeCloseConfirm();
    closeMessageBoard();
    renderCurrentUser();
    renderForm();
    renderLastSaved();
    updateSessionSidebar(true);
    updateMessageBoardWidget(true);
  };

  if (!formView.classList.contains("is-hidden")) {
    next();
  } else {
    animateViewChange(next);
  }
}

function requestBackToList() {
  leaveConfirmPanel.classList.remove("is-hidden");
}

function closeLeaveConfirm() {
  leaveConfirmPanel.classList.add("is-hidden");
}

async function saveAndReturnToList() {
  await saveActiveInvoice({ silent: true, logAction: "儲存表單", logDetail: "返回列表前儲存" });
  closeLeaveConfirm();
  showList();
}

function returnToListWithoutSaving() {
  closeLeaveConfirm();
  showList();
}

async function copyInvoice(invoiceId) {
  const source = findVisibleInvoice(invoiceId);
  if (!source) return;
  const copy = cloneData(source);
  copy.id = createId("invoice");
  copy.ownerMemberCode = state.currentUser.memberCode;
  copy.collaborators = [];
  copy.viewers = [];
  copy.messages = [];
  copy.editLogs = [createEditLog("複製表單", `由「${source.info.projectName || "未命名工程"}」複製建立`)];
  copy.updatedAt = new Date().toISOString();
  copy.isClosed = false;
  copy.closedAt = "";
  copy.info = {
    ...defaultInfo,
    ...copy.info,
    invoiceNo: `${copy.info.invoiceNo || "INV"}-COPY`,
    projectName: `${copy.info.projectName || "未命名工程"} 複製`
  };
  copy.details = copy.details.map((detail) => ({ ...detail, id: createId("detail") }));
  state.invoices.unshift(copy);
  await persistInvoices();
  renderInvoiceList();
  renderLastSaved();
}

function deleteInvoice(invoiceId, options = {}) {
  const invoice = findVisibleInvoice(invoiceId);
  if (!invoice) return;
  const title = invoice.info.projectName || invoice.info.invoiceNo || "此請款單";
  const isShared = isSharedInvoice(invoice);
  requestDeleteConfirmation(isShared ? `確定從你的列表移除「${title}」？` : `確定刪除「${title}」？刪除後無法復原。`, async () => {
    if (isShared) {
      const sharedInvoices = loadSharedInvoices();
      const sharedInvoice = sharedInvoices.find((item) => item.id === invoiceId);
      if (sharedInvoice) {
        sharedInvoice.collaborators = sharedInvoice.collaborators.filter((memberCode) => memberCode !== state.currentUser.memberCode);
        sharedInvoice.viewers = (sharedInvoice.viewers || []).filter((memberCode) => memberCode !== state.currentUser.memberCode);
        saveSharedInvoices(sharedInvoices);
      }
    } else {
      state.invoices = state.invoices.filter((item) => item.id !== invoiceId);
      removeSharedInvoice(invoiceId);
      if (state.invoices.length === 0) {
        state.invoices = [createInvoice()];
      }
      await persistInvoices();
    }
    if (options.fromForm) {
      showList();
      return;
    }
    renderInvoiceList();
    renderLastSaved();
  });
}

function requestDeleteConfirmation(message, action) {
  state.pendingDeleteAction = action;
  deleteConfirmText.textContent = message;
  deleteConfirmPanel.classList.remove("is-hidden");
}

function closeDeleteConfirm() {
  state.pendingDeleteAction = null;
  deleteConfirmPanel.classList.add("is-hidden");
}

async function confirmDeleteAction() {
  const action = state.pendingDeleteAction;
  closeDeleteConfirm();
  if (typeof action === "function") {
    await action();
  }
}

function closeCloseConfirm() {
  state.pendingCloseAction = null;
  closeConfirmPanel.classList.add("is-hidden");
}

async function confirmCloseAction() {
  const action = state.pendingCloseAction;
  closeCloseConfirm();
  if (typeof action === "function") {
    await action();
  }
}

function requestInvoiceStatusChange() {
  if (!state.activeInvoice || !canManageInvoice()) return;
  const title = state.activeInvoice.info.projectName || state.activeInvoice.info.invoiceNo || "此請款單";
  const isClosed = Boolean(state.activeInvoice.isClosed);
  state.pendingCloseAction = isClosed ? restoreActiveInvoice : closeActiveInvoice;
  closeConfirmTitle.textContent = isClosed ? "確認恢復" : "確認結案";
  closeConfirmText.textContent = isClosed
    ? `確定將「${title}」恢復為進行中？恢復後會移入主列表的進行中分組。`
    : `確定將「${title}」結案？結案後會移入主列表的已結案分組。`;
  confirmCloseButton.textContent = isClosed ? "確認恢復" : "確認結案";
  closeConfirmPanel.classList.remove("is-hidden");
}

async function closeActiveInvoice() {
  if (!state.activeInvoice || !canManageInvoice()) return;
  const now = new Date().toISOString();
  state.activeInvoice.isClosed = true;
  state.activeInvoice.closedAt = now;
  state.activeInvoice.updatedAt = now;
  await saveActiveInvoice({ silent: true, logAction: "結案", logDetail: "請款單移入已結案" });
  showList();
}

async function restoreActiveInvoice() {
  if (!state.activeInvoice || !canManageInvoice()) return;
  state.activeInvoice.isClosed = false;
  state.activeInvoice.closedAt = "";
  state.activeInvoice.updatedAt = new Date().toISOString();
  await saveActiveInvoice({ silent: true, logAction: "恢復表單", logDetail: "請款單恢復為進行中" });
  showList();
}

function renderVersionLabels() {
  appVersionLabels.forEach((label) => {
    label.textContent = APP_VERSION;
  });
}

function openVersionPanel() {
  const isAdmin = state.currentUser?.role === "admin";
  versionList.innerHTML = VERSION_HISTORY.map((entry) => {
    const items = entry.items
      .map(normalizeVersionItem)
      .filter((item) => isAdmin || !item.adminOnly);
    if (items.length === 0) return "";
    return `
    <article class="version-item">
      <strong>${escapeHtml(entry.version)}</strong>
      <span>${escapeHtml(entry.date)}</span>
      <ul>${items.map((item) => `<li>${escapeHtml(item.text)}</li>`).join("")}</ul>
    </article>
  `;
  }).join("");
  versionPanel.classList.remove("is-hidden");
}

function closeVersionPanel() {
  versionPanel.classList.add("is-hidden");
}

function normalizeVersionItem(item) {
  if (typeof item === "string") return { text: item, adminOnly: false };
  return { text: item.text || "", adminOnly: Boolean(item.adminOnly) };
}

function openEditLogPanel() {
  renderEditLogList();
  editLogPanel.classList.remove("is-hidden");
}

function closeEditLogPanel() {
  editLogPanel.classList.add("is-hidden");
}

function renderEditLogList() {
  const logs = (state.activeInvoice?.editLogs || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (logs.length === 0) {
    editLogList.innerHTML = `<p class="empty-state">目前沒有編輯記錄。</p>`;
    return;
  }
  editLogList.innerHTML = logs.map((log) => `
    <article class="edit-log-item">
      <div>
        <strong>${escapeHtml(log.action)}</strong>
        <p>${escapeHtml(log.detail || "表單內容更新")}</p>
      </div>
      <span>${escapeHtml(log.nickname || "未知成員")} · ${escapeHtml(log.memberCode || "-")}</span>
      <time>${formatFullDateTime(log.createdAt)}</time>
    </article>
  `).join("");
}

function openUserAnalyticsPanel() {
  if (state.currentUser?.role !== "admin") return;
  renderUserAnalytics();
  analyticsPanel.classList.remove("is-hidden");
}

function closeUserAnalyticsPanel() {
  analyticsPanel.classList.add("is-hidden");
}

function renderUserAnalytics() {
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const activeAccounts = state.accounts.filter((account) => {
    const lastActive = new Date(account.lastLoginAt || account.updatedAt || account.createdAt).getTime();
    return Number.isFinite(lastActive) && now - lastActive <= sevenDays && !account.disabled;
  });
  const disabledAccounts = state.accounts.filter((account) => account.disabled);
  const unreadNotices = state.invitations.filter((notice) => !notice.read);
  const messageNotices = state.invitations.filter((notice) => notice.type === "message");
  const closedInvoices = state.invoices.filter((invoice) => invoice.isClosed);
  const ongoingInvoices = state.invoices.filter((invoice) => !invoice.isClosed);

  analyticsContent.innerHTML = `
    <section class="analytics-grid">
      ${buildAnalyticsCard("帳號總數", `${state.accounts.length}`, "目前此裝置資料庫中的帳號")}
      ${buildAnalyticsCard("近 7 日活躍", `${activeAccounts.length}`, "依最後登入/更新時間推估")}
      ${buildAnalyticsCard("停用帳號", `${disabledAccounts.length}`, "已被管理員停用")}
      ${buildAnalyticsCard("未讀通知", `${unreadNotices.length}`, "包含邀請與留言通知")}
      ${buildAnalyticsCard("留言通知", `${messageNotices.length}`, "留言板產生的通知")}
      ${buildAnalyticsCard("請款單", `${ongoingInvoices.length} / ${closedInvoices.length}`, "進行中 / 已結案")}
    </section>
    <section class="analytics-table-wrap">
      <h3>用戶活躍明細</h3>
      <div class="analytics-table">
        ${state.accounts.map((account) => {
          const lastActive = account.lastLoginAt || account.updatedAt || account.createdAt;
          const status = account.disabled ? "停用" : "啟用";
          return `
            <article class="analytics-row">
              <div>
                <strong>${escapeHtml(account.nickname)}</strong>
                <span>${escapeHtml(account.email)} · ${escapeHtml(account.memberCode)}</span>
              </div>
              <span>${account.role === "admin" ? "最高權限" : "一般會員"}</span>
              <span>${status}</span>
              <span>${formatFullDateTime(lastActive)}</span>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function buildAnalyticsCard(label, value, note) {
  return `<article class="analytics-card">
    <span>${escapeHtml(label)}</span>
    <strong>${escapeHtml(value)}</strong>
    <p>${escapeHtml(note)}</p>
  </article>`;
}

function renderCurrentUser() {
  const text = `${state.currentUser.nickname} · ${state.currentUser.memberCode}`;
  document.querySelector("#currentUserLine").textContent = text;
  document.querySelector("#formUserLine").textContent = text;
  sidebarUserLine.textContent = text;
}

function updateSessionSidebar(isVisible = Boolean(state.currentUser)) {
  document.body.classList.toggle("has-session-sidebar", isVisible);
  sessionSidebar.classList.toggle("is-hidden", !isVisible);
  if (!isVisible || !state.currentUser) return;
  renderCurrentUser();
  renderLastSaved();
}

function renderLastSaved() {
  const activeInvoice = state.activeInvoice || state.invoices
    .slice()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
  const message = `最近儲存：${activeInvoice?.updatedAt ? formatFullDateTime(activeInvoice.updatedAt) : "尚未儲存"}`;
  lastSavedLine.textContent = message;
  sidebarLastSavedLine.textContent = message;
}

function renderInvoiceList() {
  const visibleInvoices = getVisibleInvoices();
  const query = state.invoiceSearchQuery.trim().toLowerCase();
  const filteredInvoices = visibleInvoices
    .filter((invoice) => {
      if (!query) return true;
      const haystack = `${invoice.info.projectName || ""} ${invoice.info.invoiceNo || ""}`.toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const ongoingInvoices = filteredInvoices.filter((invoice) => !invoice.isClosed);
  const closedInvoices = filteredInvoices.filter((invoice) => invoice.isClosed);

  invoiceCount.textContent = query
    ? `${filteredInvoices.length} / ${visibleInvoices.length} 張`
    : `${visibleInvoices.length} 張`;
  invoiceList.innerHTML = "";

  if (filteredInvoices.length === 0) {
    invoiceList.innerHTML = `<p class="empty-state">找不到符合查詢條件的請款單。</p>`;
    return;
  }

  renderInvoiceGroup("進行中", ongoingInvoices);
  renderInvoiceGroup("已結案", closedInvoices);
}

function renderInvoiceGroup(title, invoices) {
  const group = document.createElement("section");
  group.className = "invoice-group";
  group.innerHTML = `
    <div class="invoice-group-heading">
      <h3>${title}</h3>
      <span>${invoices.length} 張</span>
    </div>
  `;

  if (invoices.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = title === "已結案" ? "目前沒有已結案請款單。" : "目前沒有進行中的請款單。";
    group.appendChild(empty);
    invoiceList.appendChild(group);
    return;
  }

  invoices.forEach((invoice) => {
    const totals = summaryTotals(invoice);
    const isShared = isSharedInvoice(invoice);
    const card = document.createElement("article");
    card.className = `invoice-card${invoice.isClosed ? " is-closed" : ""}`;
    card.innerHTML = `
        <div>
          <h2>${escapeHtml(invoice.info.projectName || "未命名工程")} ${isShared ? '<span class="collab-pill">共同編輯</span>' : ""} ${invoice.isClosed ? '<span class="status-pill">已結案</span>' : ""}</h2>
          <p>${escapeHtml(invoice.info.invoiceNo || "未填單號")} · ${escapeHtml(invoice.info.clientName || "未填業主")}</p>
        </div>
        <div class="invoice-card-meta">
          <strong>${formatCurrency(totals.grandTotal)}</strong>
          <span>${invoice.isClosed ? `結案 ${formatDateTime(invoice.closedAt)}` : `更新 ${formatDateTime(invoice.updatedAt)}`}</span>
        </div>
        <div class="invoice-card-actions">
          <button class="secondary-button" type="button" data-open-invoice="${invoice.id}"><span class="button-icon" aria-hidden="true">↗</span>編輯</button>
          <button class="secondary-button" type="button" data-copy-invoice="${invoice.id}"><span class="button-icon" aria-hidden="true">⧉</span>複製</button>
          <button class="secondary-button danger-button" type="button" data-delete-invoice="${invoice.id}"><span class="button-icon" aria-hidden="true">×</span>刪除</button>
        </div>
      `;
    group.appendChild(card);
  });

  invoiceList.appendChild(group);
}

function getNoticeItems() {
  return state.invitations
    .filter((notice) => notice.toMemberCode === state.currentUser.memberCode)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderNotices() {
  const notices = getNoticeItems();
  const unreadCount = notices.filter((notice) => !notice.read).length;

  noticeCount.textContent = String(unreadCount);
  noticeDot.classList.toggle("is-hidden", unreadCount === 0);
  noticeList.innerHTML = "";

  if (notices.length === 0) {
    noticeList.innerHTML = `<p class="empty-state">目前沒有通知。</p>`;
    return;
  }

  notices.forEach((notice) => {
    const item = document.createElement("article");
    item.className = `notice-item${notice.read ? " is-read" : ""}`;
    const isMessage = notice.type === "message";
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(notice.projectName || "未命名工程")}</strong>
        <p>${isMessage
          ? `${escapeHtml(notice.fromNickname)} 在請款單留言：${escapeHtml(notice.messageText || "")}`
          : `${escapeHtml(notice.fromNickname)} 邀請你以${escapeHtml(getRoleLabel(notice.role || "editor"))}身份加入 ${escapeHtml(notice.invoiceNo || "")}`}
        </p>
        <span>${formatDateTime(notice.createdAt)}</span>
      </div>
      <button class="secondary-button" type="button" data-open-notice="${notice.id}"><span class="button-icon" aria-hidden="true">↗</span>前往</button>
    `;
    noticeList.appendChild(item);
  });
}

function toggleNoticePanel() {
  const isOpen = noticePanel.classList.toggle("is-collapsed") === false;
  noticeToggle.setAttribute("aria-expanded", String(isOpen));
}

function getInvoiceEditors(invoice = state.activeInvoice) {
  return [invoice?.ownerMemberCode, ...(invoice?.collaborators || [])].filter(Boolean);
}

function getInvoiceViewers(invoice = state.activeInvoice) {
  return (invoice?.viewers || []).filter(Boolean);
}

function getInvoiceMembers(invoice = state.activeInvoice) {
  return [...new Set([...getInvoiceEditors(invoice), ...getInvoiceViewers(invoice)])];
}

function canManageInvoice(invoice = state.activeInvoice) {
  return Boolean(invoice && state.currentUser && invoice.ownerMemberCode === state.currentUser.memberCode);
}

function canEditInvoice(invoice = state.activeInvoice) {
  if (!invoice || !state.currentUser) return false;
  const editors = getInvoiceEditors(invoice);
  return editors.length === 0 || editors.includes(state.currentUser.memberCode);
}

function canAccessInvoice(invoice = state.activeInvoice) {
  if (!invoice || !state.currentUser) return false;
  return canEditInvoice(invoice) || getInvoiceViewers(invoice).includes(state.currentUser.memberCode);
}

function getCurrentInvoiceRole(invoice = state.activeInvoice) {
  if (!invoice || !state.currentUser) return "";
  if (invoice.ownerMemberCode === state.currentUser.memberCode) return "creator";
  if ((invoice.collaborators || []).includes(state.currentUser.memberCode)) return "editor";
  if ((invoice.viewers || []).includes(state.currentUser.memberCode)) return "viewer";
  return "";
}

function getRoleLabel(role) {
  if (role === "creator") return "表單創建者";
  if (role === "viewer") return "檢視者";
  return "共同編輯者";
}

function toggleMessageBoard() {
  const isOpen = messageBoardPanel.classList.toggle("is-hidden") === false;
  messageBoardButton.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) {
    markMessagesRead();
    renderMessageBoard();
  }
}

function closeMessageBoard() {
  messageBoardPanel.classList.add("is-hidden");
  messageBoardButton.setAttribute("aria-expanded", "false");
  messageBoardStatus.textContent = "";
}

function updateMessageBoardWidget(isVisible) {
  messageBoardWidget.classList.toggle("is-hidden", !isVisible);
  if (!isVisible) closeMessageBoard();
  updateMessageBoardDot();
}

function getLatestMessage(invoice = state.activeInvoice) {
  const messages = invoice?.messages || [];
  if (messages.length === 0) return null;
  return messages.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
}

function hasUnreadMessages(invoice = state.activeInvoice) {
  const latest = getLatestMessage(invoice);
  if (!latest || !state.currentUser || latest.authorMemberCode === state.currentUser.memberCode) return false;
  const readAt = getMessageReadAt(invoice.id);
  return !readAt || new Date(latest.createdAt) > new Date(readAt);
}

function updateMessageBoardDot() {
  if (!messageBoardDot) return;
  const visible = !messageBoardWidget.classList.contains("is-hidden") && hasUnreadMessages();
  messageBoardDot.classList.toggle("is-hidden", !visible);
}

function renderMessageBoard() {
  if (!state.activeInvoice) return;
  const allowed = canEditInvoice();
  messageBoardForm.classList.toggle("is-hidden", !allowed);
  messageBoardStatus.textContent = allowed ? "" : "你沒有此請款單的留言權限。";
  messageBoardList.innerHTML = "";

  const messages = state.activeInvoice.messages || [];
  if (messages.length === 0) {
    messageBoardList.innerHTML = `<p class="empty-state">目前沒有留言。</p>`;
    return;
  }

  messages
    .slice()
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .forEach((message) => {
      const item = document.createElement("article");
      item.className = `message-item${message.authorMemberCode === state.currentUser.memberCode ? " is-own" : ""}`;
      item.innerHTML = `
        <div>
          <strong>${escapeHtml(message.authorNickname)}</strong>
          <span>${formatDateTime(message.createdAt)}</span>
        </div>
        <p>${escapeHtml(message.text)}</p>
      `;
      messageBoardList.appendChild(item);
    });
}

async function submitMessage(event) {
  event.preventDefault();
  if (!canEditInvoice()) {
    messageBoardStatus.textContent = "你沒有此請款單的留言權限。";
    return;
  }
  const text = messageInput.value.trim();
  if (!text) {
    messageBoardStatus.textContent = "請輸入留言內容。";
    return;
  }
  const message = normalizeMessage({
    id: createId("message"),
    authorMemberCode: state.currentUser.memberCode,
    authorNickname: state.currentUser.nickname,
    text,
    createdAt: new Date().toISOString()
  });
  state.activeInvoice.messages.push(message);
  state.activeInvoice.updatedAt = message.createdAt;
  messageInput.value = "";
  await saveActiveInvoice({ silent: true, logAction: "新增留言", logDetail: text.slice(0, 80) });
  markMessagesRead();
  createMessageNotifications(message);
  renderMessageBoard();
  renderNotices();
}

function createMessageNotifications(message) {
  const recipients = getInvoiceEditors()
    .filter((memberCode) => memberCode && memberCode !== state.currentUser.memberCode);
  recipients.forEach((memberCode) => {
    state.invitations.unshift(normalizeNotification({
      id: createId("notice"),
      type: "message",
      fromMemberCode: state.currentUser.memberCode,
      fromNickname: state.currentUser.nickname,
      toMemberCode: memberCode,
      invoiceId: state.activeInvoice.id,
      invoiceNo: state.activeInvoice.info.invoiceNo,
      projectName: state.activeInvoice.info.projectName,
      messageText: message.text,
      read: false,
      createdAt: message.createdAt
    }));
  });
  saveInvitations();
}

function renderForm() {
  infoFields.forEach((field) => {
    const input = document.querySelector(`#${field}`);
    if (!input) return;
    if (input.type === "checkbox") {
      input.checked = Boolean(state.activeInvoice.info[field]);
    } else {
      input.value = state.activeInvoice.info[field] ?? "";
    }
  });
  updateConditionalFields();
  updateCloseInvoiceButton();
  renderCollaborationPanel();
  renderDetails();
  renderSummary();
  applyFormPermissions();
  updateMessageBoardDot();
}

function updateCloseInvoiceButton() {
  collaborativeBadge.classList.toggle("is-hidden", !isSharedInvoice(state.activeInvoice));
  if (!state.activeInvoice?.isClosed) {
    closeInvoiceButton.innerHTML = '<span class="button-icon" aria-hidden="true">□</span>結案';
    closeInvoiceButton.disabled = !canManageInvoice();
    return;
  }
  closeInvoiceButton.innerHTML = '<span class="button-icon" aria-hidden="true">↺</span>恢復';
  closeInvoiceButton.disabled = !canManageInvoice();
}

function renderCollaborationPanel() {
  if (!state.activeInvoice) return;
  const isOwner = canManageInvoice();
  const sharedCount = getInvoiceMembers(state.activeInvoice).length;
  collaborationCountPill.textContent = `${sharedCount} 人共用`;
  inviteRoleSelect.disabled = !isOwner;
  document.querySelector("#inviteTarget").disabled = !isOwner;
  document.querySelector("#inviteForm button").disabled = !isOwner;
  ownerOnlyPill.textContent = isOwner ? "可調整成員權限" : "僅表單創建者可調整";
  renderInviteHistory();
  renderCollaborationMembers();
}

function renderInviteHistory() {
  const history = getInviteHistoryForCurrentUser();
  if (history.length === 0) {
    inviteHistoryList.innerHTML = `<p class="empty-state">尚無邀請紀錄。</p>`;
    return;
  }
  inviteHistoryList.innerHTML = history.map((item) => `
    <button class="quick-chip" type="button" data-fill-invite="${escapeHtml(item.targetMemberCode)}" ${canManageInvoice() ? "" : "disabled"}>
      <strong>${escapeHtml(item.nickname || "未命名")}</strong>
      <span>${escapeHtml(item.targetMemberCode)} · ${escapeHtml(item.email || "")}</span>
    </button>
  `).join("");
}

function renderCollaborationMembers() {
  const members = getCollaborationRows();
  collaborationMemberList.innerHTML = members.map((member) => {
    const account = findAccountByMemberCode(member.memberCode);
    const name = account?.nickname || member.memberCode || "未知成員";
    const canChange = canManageInvoice() && member.role !== "creator";
    return `
      <article class="member-row">
        <button class="member-name" type="button" data-member-info="${escapeHtml(member.memberCode)}">
          <strong>${escapeHtml(name)}</strong>
          <span>${escapeHtml(member.memberCode || "-")}</span>
        </button>
        <span class="role-pill ${member.role === "viewer" ? "is-viewer" : ""}">${escapeHtml(getRoleLabel(member.role))}</span>
        ${canChange ? `
          <select class="member-role-select" data-member-role="${escapeHtml(member.memberCode)}" aria-label="調整 ${escapeHtml(name)} 權限">
            <option value="editor" ${member.role === "editor" ? "selected" : ""}>共同編輯者</option>
            <option value="viewer" ${member.role === "viewer" ? "selected" : ""}>檢視者</option>
          </select>
          <button class="secondary-button danger-button" type="button" data-remove-member="${escapeHtml(member.memberCode)}"><span class="button-icon" aria-hidden="true">×</span>移除</button>
        ` : ""}
      </article>
    `;
  }).join("");
}

function getCollaborationRows(invoice = state.activeInvoice) {
  if (!invoice) return [];
  return [
    { role: "creator", memberCode: invoice.ownerMemberCode },
    ...(invoice.collaborators || []).map((memberCode) => ({ role: "editor", memberCode })),
    ...(invoice.viewers || []).map((memberCode) => ({ role: "viewer", memberCode }))
  ].filter((item) => item.memberCode);
}

function findAccountByMemberCode(memberCode) {
  return state.accounts.find((account) => account.memberCode === memberCode);
}

function openMemberInfo(memberCode) {
  const account = findAccountByMemberCode(memberCode);
  const role = getCollaborationRows().find((item) => item.memberCode === memberCode)?.role || "";
  memberInfoContent.innerHTML = account ? `
    <section class="member-info-grid">
      <div><span>暱稱</span><strong>${escapeHtml(account.nickname)}</strong></div>
      <div><span>Email</span><strong>${escapeHtml(account.email)}</strong></div>
      <div><span>會員編號</span><strong>${escapeHtml(account.memberCode)}</strong></div>
      <div><span>表單身份</span><strong>${escapeHtml(getRoleLabel(role))}</strong></div>
      <div><span>帳號狀態</span><strong>${account.disabled ? "停用" : "啟用"}</strong></div>
    </section>
  ` : `<p class="empty-state">找不到此成員帳號資料。</p>`;
  memberInfoPanel.classList.remove("is-hidden");
}

function closeMemberInfoPanel() {
  memberInfoPanel.classList.add("is-hidden");
}

async function changeMemberRole(memberCode, role) {
  if (!canManageInvoice() || !memberCode || memberCode === state.activeInvoice.ownerMemberCode) return;
  state.activeInvoice.collaborators = (state.activeInvoice.collaborators || []).filter((code) => code !== memberCode);
  state.activeInvoice.viewers = (state.activeInvoice.viewers || []).filter((code) => code !== memberCode);
  if (role === "viewer") {
    state.activeInvoice.viewers.push(memberCode);
  } else {
    state.activeInvoice.collaborators.push(memberCode);
  }
  const account = findAccountByMemberCode(memberCode);
  await saveActiveInvoice({
    silent: true,
    logAction: "調整成員權限",
    logDetail: `${account?.nickname || memberCode} 改為${getRoleLabel(role)}`
  });
  renderCollaborationPanel();
}

function removeCollaborationMember(memberCode) {
  if (!canManageInvoice() || !memberCode || memberCode === state.activeInvoice.ownerMemberCode) return;
  const account = findAccountByMemberCode(memberCode);
  requestDeleteConfirmation(`確定移除「${account?.nickname || memberCode}」的表單權限？`, async () => {
    state.activeInvoice.collaborators = (state.activeInvoice.collaborators || []).filter((code) => code !== memberCode);
    state.activeInvoice.viewers = (state.activeInvoice.viewers || []).filter((code) => code !== memberCode);
    await saveActiveInvoice({
      silent: true,
      logAction: "移除共同成員",
      logDetail: `${account?.nickname || memberCode} 已自此表單移除`
    });
    renderCollaborationPanel();
  });
}

function renderDetails() {
  detailsContainer.innerHTML = "";
  const editable = canEditInvoice();
  const detailIds = new Set(state.activeInvoice.details.map((detail) => detail.id));
  state.selectedDetailIds.forEach((id) => {
    const detail = state.activeInvoice.details.find((item) => item.id === id);
    if (!detailIds.has(id) || isSectionDetail(detail)) state.selectedDetailIds.delete(id);
  });

  state.activeInvoice.details.forEach((detail, index) => {
    if (isSectionDetail(detail)) {
      const row = document.createElement("article");
      row.className = "detail-row detail-section-row";
      row.draggable = editable;
      row.dataset.detailId = detail.id;
      row.dataset.index = String(index);
      row.innerHTML = `
        <span></span>
        <button class="drag-handle" type="button" aria-label="拖曳大項目" title="拖曳排序" ${editable ? "" : "disabled"}>⋮⋮</button>
        <span class="section-label">大項目</span>
        <label>
          <span>大項目名稱</span>
          <input data-detail-index="${index}" data-detail-field="name" type="text" value="${escapeHtml(detail.name)}" ${editable ? "" : "disabled"}>
        </label>
        <button class="secondary-button" data-add-child-detail="${index}" type="button" ${editable ? "" : "disabled"}><span class="button-icon" aria-hidden="true">＋</span>小支項</button>
        <button class="delete-row" data-delete-detail="${index}" type="button" aria-label="刪除大項目" title="刪除" ${editable ? "" : "disabled"}>×</button>
      `;
      detailsContainer.appendChild(row);
      return;
    }
    const totals = detailTotals(detail);
    const row = document.createElement("article");
    row.className = "detail-row";
    row.draggable = editable;
    row.dataset.detailId = detail.id;
    row.dataset.index = String(index);
    row.innerHTML = `
      <input class="detail-select" data-select-detail="${detail.id}" type="checkbox" aria-label="選取明細 ${index + 1}" ${state.selectedDetailIds.has(detail.id) ? "checked" : ""} ${editable ? "" : "disabled"}>
      <button class="drag-handle" type="button" aria-label="拖曳排序" title="拖曳排序" ${editable ? "" : "disabled"}>⋮⋮</button>
      <span class="detail-index">${index + 1}</span>
      <label>
        <span>小支項</span>
        <input data-detail-index="${index}" data-detail-field="name" type="text" value="${escapeHtml(detail.name)}" ${editable ? "" : "disabled"}>
      </label>
      <label>
        <span>單位</span>
        <input data-detail-index="${index}" data-detail-field="unit" type="text" value="${escapeHtml(detail.unit)}" ${editable ? "" : "disabled"}>
      </label>
      <label>
        <span>數量</span>
        <input class="number" data-detail-index="${index}" data-detail-field="qty" type="number" min="0" step="0.01" value="${detail.qty}" ${editable ? "" : "disabled"}>
      </label>
      <label>
        <span>請款單價</span>
        <input class="number" data-detail-index="${index}" data-detail-field="price" type="number" min="0" step="1" value="${detail.price}" ${editable ? "" : "disabled"}>
      </label>
      <label>
        <span>成本單價</span>
        <input class="number" data-detail-index="${index}" data-detail-field="cost" type="number" min="0" step="1" value="${detail.cost}" ${editable ? "" : "disabled"}>
      </label>
      <output data-detail-output="amount">${formatCurrency(totals.amount)}</output>
      <output data-detail-output="cost">${formatCurrency(totals.costAmount)}</output>
      <output data-detail-output="profit">${formatCurrency(totals.profit)}</output>
      <button class="delete-row" data-delete-detail="${index}" type="button" aria-label="刪除明細" title="刪除" ${editable ? "" : "disabled"}>×</button>
    `;
    detailsContainer.appendChild(row);
  });
  updateBulkActionState();
}

function getProjectInfo() {
  return Object.fromEntries(
    infoFields.map((field) => {
      const input = document.querySelector(`#${field}`);
      let value = "";
      if (!input) {
        value = state.activeInvoice.info[field] ?? "";
      } else if (input.type === "checkbox") {
        value = input.checked;
      } else if (input.type === "number") {
        value = toNumber(input.value);
      } else {
        value = input.value.trim();
      }
      return [field, value];
    })
  );
}

function syncInfoFromInputs() {
  state.activeInvoice.info = getProjectInfo();
  updateConditionalFields();
}

function updateConditionalFields() {
  const info = state.activeInvoice?.info || {};
  const paymentMethod = document.querySelector("#paymentMethod")?.value || info.paymentMethod;
  const customPaymentEnabled = paymentMethod === "自訂";
  const taxEnabled = Boolean(info.isTaxIncluded);
  const retentionEnabled = Boolean(info.hasRetention);
  const discountEnabled = Boolean(info.hasDiscount);
  const editable = canEditInvoice();
  customPaymentMethodWrap.classList.toggle("is-disabled-field", !customPaymentEnabled);
  taxRateWrap.classList.toggle("is-disabled-field", !taxEnabled);
  retentionRateWrap.classList.toggle("is-disabled-field", !retentionEnabled);
  discountAmountWrap.classList.toggle("is-disabled-field", !discountEnabled);
  customPaymentMethodInput.disabled = !editable || !customPaymentEnabled;
  taxRateInput.disabled = !editable || !taxEnabled;
  retentionRateInput.disabled = !editable || !retentionEnabled;
  discountAmountInput.disabled = !editable || !discountEnabled;
}

function getPaymentMethodLabel(info) {
  return info.paymentMethod === "自訂" ? (info.customPaymentMethod || "自訂") : (info.paymentMethod || "-");
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function detailTotals(detail) {
  if (isSectionDetail(detail)) {
    return { amount: 0, costAmount: 0, profit: 0, margin: 0 };
  }
  const amount = toNumber(detail.qty) * toNumber(detail.price);
  const costAmount = toNumber(detail.qty) * toNumber(detail.cost);
  const profit = amount - costAmount;
  const margin = amount === 0 ? 0 : profit / amount;
  return { amount, costAmount, profit, margin };
}

function summaryTotals(invoice = state.activeInvoice) {
  const billableDetails = getBillableDetails(invoice);
  const subtotal = billableDetails.reduce((sum, detail) => sum + detailTotals(detail).amount, 0);
  const costTotal = billableDetails.reduce((sum, detail) => sum + detailTotals(detail).costAmount, 0);
  const discountTotal = invoice.info.hasDiscount ? Math.min(toNumber(invoice.info.discountAmount), subtotal) : 0;
  const netSubtotal = Math.max(subtotal - discountTotal, 0);
  const taxRate = invoice.info.isTaxIncluded ? toNumber(invoice.info.taxRate) : 0;
  const taxTotal = netSubtotal * (taxRate / 100);
  const retentionRate = invoice.info.hasRetention ? toNumber(invoice.info.retentionRate) : 0;
  const retentionTotal = netSubtotal * (retentionRate / 100);
  const grandTotal = netSubtotal + taxTotal - retentionTotal;
  const profitTotal = netSubtotal - costTotal;
  const marginTotal = netSubtotal === 0 ? 0 : profitTotal / netSubtotal;

  return {
    subtotal,
    discountTotal,
    netSubtotal,
    costTotal,
    taxTotal,
    retentionTotal,
    grandTotal,
    profitTotal,
    marginTotal
  };
}

function renderSummary() {
  const totals = summaryTotals();
  document.querySelector("#subtotal").textContent = formatCurrency(totals.subtotal);
  document.querySelector("#discountTotal").textContent = formatCurrency(totals.discountTotal);
  document.querySelector("#netSubtotal").textContent = formatCurrency(totals.netSubtotal);
  document.querySelector("#taxTotal").textContent = formatCurrency(totals.taxTotal);
  document.querySelector("#retentionTotal").textContent = formatCurrency(totals.retentionTotal);
  document.querySelector("#grandTotal").textContent = formatCurrency(totals.grandTotal);
  document.querySelector("#costTotal").textContent = formatCurrency(totals.costTotal);
  document.querySelector("#profitTotal").textContent = formatCurrency(totals.profitTotal);
  document.querySelector("#marginTotal").textContent = formatPercent(totals.marginTotal);
  renderFormulaPanel(totals);
}

function renderFormulaPanel(totals = summaryTotals()) {
  const info = state.activeInvoice.info;
  const taxRate = info.isTaxIncluded ? toNumber(info.taxRate) : 0;
  const retentionRate = info.hasRetention ? toNumber(info.retentionRate) : 0;
  formulaList.innerHTML = `
    <div><strong>請款小計</strong><span>各小支項「數量 × 請款單價」加總 = ${formatCurrency(totals.subtotal)}</span></div>
    <div><strong>折扣費用</strong><span>${info.hasDiscount ? `輸入折扣 = ${formatCurrency(totals.discountTotal)}` : "未勾選，不列入折扣"}</span></div>
    <div><strong>折扣後小計</strong><span>${formatCurrency(totals.subtotal)} - ${formatCurrency(totals.discountTotal)} = ${formatCurrency(totals.netSubtotal)}</span></div>
    <div><strong>稅額</strong><span>${info.isTaxIncluded ? `${formatCurrency(totals.netSubtotal)} × ${formatRate(taxRate)} = ${formatCurrency(totals.taxTotal)}` : "未勾選含稅，稅額為 $0"}</span></div>
    <div><strong>保留款</strong><span>${info.hasRetention ? `${formatCurrency(totals.netSubtotal)} × ${formatRate(retentionRate)} = ${formatCurrency(totals.retentionTotal)}` : "未勾選保留款，保留款為 $0"}</span></div>
    <div><strong>本期應收</strong><span>${formatCurrency(totals.netSubtotal)} + ${formatCurrency(totals.taxTotal)} - ${formatCurrency(totals.retentionTotal)} = ${formatCurrency(totals.grandTotal)}</span></div>
    <div><strong>內部成本</strong><span>各小支項「數量 × 成本單價」加總 = ${formatCurrency(totals.costTotal)}</span></div>
    <div><strong>預估利潤</strong><span>${formatCurrency(totals.netSubtotal)} - ${formatCurrency(totals.costTotal)} = ${formatCurrency(totals.profitTotal)}</span></div>
    <div><strong>平均毛利率</strong><span>${formatCurrency(totals.profitTotal)} ÷ ${formatCurrency(totals.netSubtotal)} = ${formatPercent(totals.marginTotal)}</span></div>
  `;
}

function toggleFormulaPanel(event) {
  event.preventDefault();
  event.stopPropagation();
  const isOpen = formulaPanel.classList.toggle("is-hidden") === false;
  toggleFormulaButton.setAttribute("aria-expanded", String(isOpen));
}

function addDetail() {
  if (!canEditInvoice()) return;
  state.activeInvoice.details.push(createEmptyDetail());
  renderDetails();
  renderSummary();
  markActiveInvoiceDirty();
  detailsContainer.lastElementChild?.querySelector("input")?.focus();
}

function addSection() {
  if (!canEditInvoice()) return;
  state.activeInvoice.details.push(createEmptySection(), createEmptyDetail());
  renderDetails();
  renderSummary();
  markActiveInvoiceDirty();
  const sectionRows = detailsContainer.querySelectorAll(".detail-section-row");
  sectionRows[sectionRows.length - 1]?.querySelector("input")?.focus();
}

function addChildDetail(sectionIndex) {
  if (!canEditInvoice()) return;
  let insertAt = sectionIndex + 1;
  while (insertAt < state.activeInvoice.details.length && !isSectionDetail(state.activeInvoice.details[insertAt])) {
    insertAt += 1;
  }
  state.activeInvoice.details.splice(insertAt, 0, createEmptyDetail());
  renderDetails();
  renderSummary();
  markActiveInvoiceDirty();
  detailsContainer.querySelector(`[data-index="${insertAt}"] input`)?.focus();
}

function copySelectedDetails() {
  if (!canEditInvoice()) return;
  const selected = state.activeInvoice.details.filter((detail) => !isSectionDetail(detail) && state.selectedDetailIds.has(detail.id));
  if (selected.length === 0) return;
  const copies = selected.map((detail) => ({ ...detail, id: createId("detail"), name: `${detail.name || "未命名明細"} 複製` }));
  state.activeInvoice.details.push(...copies);
  state.selectedDetailIds = new Set(copies.map((detail) => detail.id));
  renderDetails();
  renderSummary();
  markActiveInvoiceDirty();
}

function deleteSelectedDetails() {
  if (!canEditInvoice()) return;
  const count = state.selectedDetailIds.size;
  if (count === 0) return;
  requestDeleteConfirmation(`確定刪除 ${count} 筆已勾選明細？刪除後無法復原。`, () => {
    state.activeInvoice.details = state.activeInvoice.details.filter((detail) => isSectionDetail(detail) || !state.selectedDetailIds.has(detail.id));
    if (getBillableDetails(state.activeInvoice).length === 0) {
      state.activeInvoice.details.push(createEmptyDetail());
    }
    state.selectedDetailIds.clear();
    renderDetails();
    renderSummary();
    markActiveInvoiceDirty();
  });
}

function deleteDetail(index) {
  if (!canEditInvoice()) return;
  const target = state.activeInvoice.details[index];
  const label = isSectionDetail(target) ? "大項目" : "小支項";
  requestDeleteConfirmation(`確定刪除此${label}？刪除後無法復原。`, () => {
    const removed = state.activeInvoice.details[index];
    state.activeInvoice.details.splice(index, 1);
    if (state.activeInvoice.details.length === 0) {
      state.activeInvoice.details = [createEmptySection(), createEmptyDetail()];
    }
    if (getBillableDetails(state.activeInvoice).length === 0) {
      state.activeInvoice.details.push(createEmptyDetail());
    }
    if (removed) state.selectedDetailIds.delete(removed.id);
    renderDetails();
    renderSummary();
    markActiveInvoiceDirty();
  });
}

function updateBulkActionState() {
  const total = getBillableDetails(state.activeInvoice).length;
  const selected = state.selectedDetailIds.size;
  const editable = canEditInvoice();
  selectAllDetails.checked = total > 0 && selected === total;
  selectAllDetails.indeterminate = selected > 0 && selected < total;
  selectAllDetails.disabled = !editable;
  copySelectedDetailsButton.disabled = !editable || selected === 0;
  deleteSelectedDetailsButton.disabled = !editable || selected === 0;
}

async function saveActiveInvoice(options = {}) {
  if (!canEditInvoice()) {
    state.isInvoiceDirty = false;
    return;
  }
  syncInfoFromInputs();
  state.activeInvoice.updatedAt = new Date().toISOString();
  if (options.logAction) {
    addEditLog(options.logAction, options.logDetail || "");
  }
  const index = state.invoices.findIndex((invoice) => invoice.id === state.activeInvoiceId);
  if (state.activeInvoiceSource === "shared" && index < 0) {
    upsertSharedInvoice(state.activeInvoice);
  } else if (index >= 0) {
    state.invoices[index] = cloneData(state.activeInvoice);
    if (state.activeInvoice.collaborators.length > 0 || (state.activeInvoice.viewers || []).length > 0) {
      upsertSharedInvoice(state.activeInvoice);
    } else {
      removeSharedInvoice(state.activeInvoice.id);
    }
    await persistInvoices();
  } else {
    state.invoices.unshift(state.activeInvoice);
    state.activeInvoiceId = state.activeInvoice.id;
    state.activeInvoiceSource = "own";
    if (state.activeInvoice.collaborators.length > 0 || (state.activeInvoice.viewers || []).length > 0) upsertSharedInvoice(state.activeInvoice);
    await persistInvoices();
  }
  state.isInvoiceDirty = false;
  renderLastSaved();

  if (!options.silent) {
    setSaveStatus("已儲存");
  }
}

function setSaveStatus(message) {
  saveStatus.textContent = message;
}

function markActiveInvoiceDirty() {
  if (!canEditInvoice()) return;
  state.isInvoiceDirty = true;
  setSaveStatus("尚未儲存");
}

function applyFormPermissions() {
  const editable = canEditInvoice();
  const manageable = canManageInvoice();
  document.querySelectorAll(".project-panel input, .project-panel select, .project-panel textarea").forEach((field) => {
    field.disabled = !editable;
  });
  updateConditionalFields();
  document.querySelector("#addDetailButton").disabled = !editable;
  addSectionButton.disabled = !editable;
  copySelectedDetailsButton.disabled = !editable || state.selectedDetailIds.size === 0;
  deleteSelectedDetailsButton.disabled = !editable || state.selectedDetailIds.size === 0;
  selectAllDetails.disabled = !editable;
  deleteInvoiceButton.disabled = !manageable;
  closeInvoiceButton.disabled = !manageable;
  document.querySelector("#inviteForm").classList.toggle("is-readonly", !manageable);
  saveStatus.textContent = editable ? saveStatus.textContent : "檢視者模式：僅可查看與匯出。";
}

function updateVisibleDetailTotals(index) {
  const detail = state.activeInvoice.details[index];
  if (isSectionDetail(detail)) return;
  const totals = detailTotals(detail);
  const row = detailsContainer.querySelector(`[data-index="${index}"]`);
  row.querySelector('[data-detail-output="amount"]').textContent = formatCurrency(totals.amount);
  row.querySelector('[data-detail-output="cost"]').textContent = formatCurrency(totals.costAmount);
  row.querySelector('[data-detail-output="profit"]').textContent = formatCurrency(totals.profit);
}

function moveDetail(fromId, toId) {
  if (!canEditInvoice()) return;
  if (!fromId || !toId || fromId === toId) return;
  const fromIndex = state.activeInvoice.details.findIndex((detail) => detail.id === fromId);
  const toIndex = state.activeInvoice.details.findIndex((detail) => detail.id === toId);
  if (fromIndex < 0 || toIndex < 0) return;
  const [moved] = state.activeInvoice.details.splice(fromIndex, 1);
  state.activeInvoice.details.splice(toIndex, 0, moved);
  renderDetails();
  markActiveInvoiceDirty();
}

function clearDragClasses() {
  detailsContainer.querySelectorAll(".is-dragging, .is-drop-target").forEach((row) => {
    row.classList.remove("is-dragging", "is-drop-target");
  });
}

async function inviteMember(event) {
  event.preventDefault();
  if (!canManageInvoice()) {
    setFormMessage(inviteMessage, "僅表單創建者可管理共同編輯。", "error");
    return;
  }
  syncInfoFromInputs();
  const target = document.querySelector("#inviteTarget").value.trim();
  const role = inviteRoleSelect.value === "viewer" ? "viewer" : "editor";
  const targetAccount = findAccountByIdentifier(target);

  if (!targetAccount) {
    setFormMessage(inviteMessage, "找不到此 Email 或會員編號。", "error");
    return;
  }

  if (targetAccount.memberCode === state.currentUser.memberCode) {
    setFormMessage(inviteMessage, "不能邀請自己。", "error");
    return;
  }

  if (targetAccount.disabled) {
    setFormMessage(inviteMessage, "此帳號已停用，無法邀請。", "error");
    return;
  }

  await saveActiveInvoice({ silent: true, skipLog: true });
  state.activeInvoice.collaborators = (state.activeInvoice.collaborators || []).filter((memberCode) => memberCode !== targetAccount.memberCode);
  state.activeInvoice.viewers = (state.activeInvoice.viewers || []).filter((memberCode) => memberCode !== targetAccount.memberCode);
  if (role === "viewer") {
    state.activeInvoice.viewers.push(targetAccount.memberCode);
  } else {
    state.activeInvoice.collaborators.push(targetAccount.memberCode);
  }
  await saveActiveInvoice({
    silent: true,
    logAction: "新增共同成員",
    logDetail: `${targetAccount.nickname} 已加入為${getRoleLabel(role)}`
  });
  rememberInviteTarget(targetAccount);

  state.invitations.push({
    id: createId("invite"),
    fromMemberCode: state.currentUser.memberCode,
    fromEmail: state.currentUser.email,
    fromNickname: state.currentUser.nickname,
    role,
    toMemberCode: targetAccount.memberCode,
    toEmail: targetAccount.email,
    invoiceId: state.activeInvoice.id,
    invoiceNo: state.activeInvoice.info.invoiceNo,
    projectName: state.activeInvoice.info.projectName,
    read: false,
    createdAt: new Date().toISOString()
  });
  saveInvitations();
  document.querySelector("#inviteTarget").value = "";
  renderCollaborationPanel();
  setFormMessage(inviteMessage, `${targetAccount.nickname} 已加入為${getRoleLabel(role)}。`, "success");
}

function findAccountByIdentifier(value) {
  const target = String(value || "").trim();
  const email = normalizeEmail(target);
  const memberCode = target.toUpperCase();
  return state.accounts.find((account) => account.email === email || account.memberCode.toUpperCase() === memberCode);
}

function exportPdf(type) {
  syncInfoFromInputs();
  const documentData = buildPdfDocument(type, state.activeInvoice);
  const printWindow = window.open("", "_blank", "width=980,height=1200");

  if (!printWindow) {
    setSaveStatus("瀏覽器封鎖了 PDF 視窗，請允許彈出式視窗後再試一次。");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(documentData.html);
  printWindow.document.close();
  printWindow.focus();
  setSaveStatus("PDF 文件已開啟，請在列印視窗選擇儲存為 PDF。");
}

function buildPdfDocument(type, invoice) {
  const isInternal = type === "internal";
  const info = invoice.info;
  const title = isInternal ? "工程請款明細表" : "工程請款單";
  const filename = `${sanitizeFilename(info.invoiceNo || "工程請款")}-${isInternal ? "自留存" : "請款"}.pdf`;
  const body = isInternal ? buildInternalPdfBody(invoice) : buildClientPdfBody(invoice);

  return {
    filename,
    html: `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8">
    <title>${escapeHtml(filename)}</title>
    <style>
      @page {
        size: A4;
        margin: 0;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        color: #152033;
        background: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", "Microsoft JhengHei", sans-serif;
        font-size: 11.5px;
        line-height: 1.55;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .document {
        width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
        padding: 10mm 9mm;
        overflow: hidden;
      }

      .doc-header {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 18px;
        align-items: end;
        padding-bottom: 14px;
        border-bottom: 2px solid #1f3e66;
      }

      .doc-title {
        margin: 0;
        color: #13294b;
        font-size: 28px;
        font-weight: 800;
        letter-spacing: 0;
      }

      .doc-subtitle {
        margin-top: 5px;
        color: #5f6d80;
        font-size: 12px;
      }

      .doc-no {
        display: grid;
        gap: 4px;
        min-width: 190px;
        padding: 10px 12px;
        border: 1px solid #cbd5e1;
        background: #f8fafc;
        text-align: right;
      }

      .doc-no span {
        color: #64748b;
        font-size: 11px;
      }

      .doc-no strong {
        color: #13294b;
        font-size: 14px;
      }

      .meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        border: 1px solid #cbd5e1;
        border-bottom: 0;
        margin-top: 14px;
      }

      .meta-item {
        display: grid;
        grid-template-columns: 92px minmax(0, 1fr);
        min-height: 34px;
        border-bottom: 1px solid #cbd5e1;
      }

      .meta-item:nth-child(odd) {
        border-right: 1px solid #cbd5e1;
      }

      .meta-label {
        display: flex;
        align-items: center;
        padding: 7px 9px;
        background: #eef3f8;
        color: #475569;
        font-weight: 700;
      }

      .meta-value {
        display: flex;
        align-items: center;
        min-width: 0;
        padding: 7px 10px;
        font-weight: 650;
        word-break: break-word;
      }

      .section-title {
        margin: 18px 0 8px;
        color: #13294b;
        font-size: 15px;
        font-weight: 800;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        border-spacing: 0;
        table-layout: fixed;
        page-break-inside: auto;
      }

      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }

      th,
      td {
        border: 1px solid #cbd5e1;
        padding: 5px 6px;
        vertical-align: top;
        overflow-wrap: anywhere;
      }

      th {
        background: #13294b;
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        text-align: center;
      }

      td {
        color: #172033;
      }

      .index,
      .unit,
      .qty,
      .percent {
        text-align: center;
        white-space: nowrap;
      }

      .amount {
        font-size: 10.6px;
        text-align: right;
        white-space: nowrap;
      }

      .section-row td {
        background: #eef3f8;
        color: #13294b;
        font-weight: 900;
      }

      .details-table .index-col {
        width: 6%;
      }

      .details-table .name-col {
        width: auto;
      }

      .details-table .unit-col {
        width: 8%;
      }

      .details-table .qty-col {
        width: 8%;
      }

      .details-table .amount-col {
        width: 14%;
      }

      .internal-table .index-col {
        width: 5%;
      }

      .internal-table .name-col {
        width: 25%;
      }

      .internal-table .unit-col {
        width: 6%;
      }

      .internal-table .qty-col {
        width: 7%;
      }

      .internal-table .amount-col {
        width: 10%;
      }

      .internal-table .percent-col {
        width: 8%;
      }

      .summary-wrap {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 280px;
        gap: 16px;
        align-items: start;
        margin-top: 14px;
      }

      .note-box {
        min-height: 116px;
        border: 1px solid #cbd5e1;
      }

      .note-box strong {
        display: block;
        padding: 8px 10px;
        background: #eef3f8;
        color: #475569;
      }

      .note-box p {
        margin: 0;
        padding: 10px;
        color: #475569;
      }

      .summary-table th {
        background: #eef3f8;
        color: #475569;
        text-align: left;
      }

      .summary-table td:last-child {
        text-align: right;
        font-weight: 700;
      }

      .summary-table .grand th,
      .summary-table .grand td {
        background: #e8f0fb;
        color: #13294b;
        font-size: 14px;
        font-weight: 900;
      }

      .signatures {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
        margin-top: 24px;
      }

      .signature {
        min-height: 76px;
        border: 1px solid #cbd5e1;
        padding: 9px 10px;
        color: #475569;
        font-weight: 700;
      }

      .signature::after {
        content: "";
        display: block;
        margin-top: 34px;
        border-top: 1px solid #94a3b8;
      }

      .print-actions {
        position: sticky;
        top: 0;
        z-index: 10;
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin: 0 0 14px;
        padding: 10px;
        background: #ffffff;
        border-bottom: 1px solid #d7dee8;
      }

      .print-actions button {
        min-height: 36px;
        border: 1px solid #b9c6d8;
        border-radius: 6px;
        background: #ffffff;
        color: #13294b;
        padding: 0 12px;
        font: inherit;
        font-weight: 800;
        cursor: pointer;
      }

      .print-actions button:first-child {
        border-color: #2357a6;
        background: #2357a6;
        color: #ffffff;
      }

      @media print {
        html,
        body {
          width: 210mm;
          min-height: 297mm;
        }

        .print-actions {
          display: none;
        }
      }
    </style>
  </head>
  <body>
    <div class="print-actions">
      <button type="button" onclick="window.print()">儲存 PDF</button>
      <button type="button" onclick="window.close()">關閉</button>
    </div>
    <main class="document">
      <header class="doc-header">
        <div>
          <h1 class="doc-title">${escapeHtml(title)}</h1>
          <div class="doc-subtitle">立表日期：${escapeHtml(formatFullDate(new Date()))}</div>
        </div>
        <div class="doc-no">
          <span>請款單號</span>
          <strong>${escapeHtml(info.invoiceNo || "-")}</strong>
        </div>
      </header>
      ${buildPdfMeta(info)}
      ${body}
    </main>
    <script>
      window.addEventListener("load", () => {
        window.setTimeout(() => window.print(), 250);
      });
    </script>
  </body>
</html>`
  };
}

function buildPdfMeta(info) {
  const taxMeta = info.isTaxIncluded ? buildPdfMetaItem("稅務", `含稅 ${formatRate(info.taxRate)}`) : buildPdfMetaItem("稅務", "未稅");
  const retentionMeta = info.hasRetention ? buildPdfMetaItem("保留款", formatRate(info.retentionRate)) : "";
  return `<section class="meta-grid" aria-label="工程資料">
    ${buildPdfMetaItem("工程名稱", info.projectName)}
    ${buildPdfMetaItem("業主/上游包商", info.clientName)}
    ${buildPdfMetaItem("業主統一編號", info.clientTaxId)}
    ${buildPdfMetaItem("業主方聯絡人", formatContact(info.clientContact, info.clientPhone))}
    ${buildPdfMetaItem("承攬廠商", info.contractorName)}
    ${buildPdfMetaItem("承攬商統一編號", info.contractorTaxId)}
    ${buildPdfMetaItem("承攬方聯絡人", formatContact(info.contractorContact, info.contractorPhone))}
    ${buildPdfMetaItem("請款期間", info.billingPeriod)}
    ${buildPdfMetaItem("付款方式", getPaymentMethodLabel(info))}
    ${buildPdfMetaItem("付款條件", info.paymentTerms)}
    ${taxMeta}
    ${retentionMeta}
  </section>`;
}

function buildPdfMetaItem(label, value) {
  return `<div class="meta-item">
    <div class="meta-label">${escapeHtml(label)}</div>
    <div class="meta-value">${escapeHtml(value || "-")}</div>
  </div>`;
}

function buildClientPdfBody(invoice) {
  const totals = summaryTotals(invoice);
  const rows = buildPdfDetailRows(invoice, false);

  return `<section>
    <h2 class="section-title">請款明細</h2>
    <table class="details-table client-table">
      <thead>
        <tr>
          <th class="index-col">序號</th>
          <th class="name-col">請款明細</th>
          <th class="unit-col">單位</th>
          <th class="qty-col">數量</th>
          <th class="amount-col">單價</th>
          <th class="amount-col">金額</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    ${buildPdfSummary(totals, invoice.info, false)}
  </section>`;
}

function buildPdfDetailRows(invoice, includeInternal) {
  let itemIndex = 0;
  return invoice.details.map((detail) => {
    if (isSectionDetail(detail)) {
      return `<tr class="section-row"><td colspan="${includeInternal ? 10 : 6}">${escapeHtml(detail.name || "未命名大項目")}</td></tr>`;
    }
    itemIndex += 1;
    const detailSummary = detailTotals(detail);
    return includeInternal ? `<tr>
      <td class="index">${itemIndex}</td>
      <td>${escapeHtml(detail.name || "-")}</td>
      <td class="unit">${escapeHtml(detail.unit || "-")}</td>
      <td class="qty">${formatQuantity(detail.qty)}</td>
      <td class="amount">${formatCurrency(detail.price)}</td>
      <td class="amount">${formatCurrency(detail.cost)}</td>
      <td class="amount">${formatCurrency(detailSummary.amount)}</td>
      <td class="amount">${formatCurrency(detailSummary.costAmount)}</td>
      <td class="amount">${formatCurrency(detailSummary.profit)}</td>
      <td class="percent">${formatPercent(detailSummary.margin)}</td>
    </tr>` : `<tr>
      <td class="index">${itemIndex}</td>
      <td>${escapeHtml(detail.name || "-")}</td>
      <td class="unit">${escapeHtml(detail.unit || "-")}</td>
      <td class="qty">${formatQuantity(detail.qty)}</td>
      <td class="amount">${formatCurrency(detail.price)}</td>
      <td class="amount">${formatCurrency(detailSummary.amount)}</td>
    </tr>`;
  }).join("");
}

function buildInternalPdfBody(invoice) {
  const totals = summaryTotals(invoice);
  const rows = buildPdfDetailRows(invoice, true);

  return `<section>
    <h2 class="section-title">請款明細</h2>
    <table class="details-table internal-table">
      <thead>
        <tr>
          <th class="index-col">序號</th>
          <th class="name-col">請款明細</th>
          <th class="unit-col">單位</th>
          <th class="qty-col">數量</th>
          <th class="amount-col">請款單價</th>
          <th class="amount-col">成本單價</th>
          <th class="amount-col">請款金額</th>
          <th class="amount-col">成本</th>
          <th class="amount-col">利潤</th>
          <th class="percent-col">毛利率</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    ${buildPdfSummary(totals, invoice.info, true)}
    ${buildPdfSignatures(["製表", "覆核", "核准"])}
  </section>`;
}

function buildPdfSummary(totals, info, includeInternal) {
  const taxRow = info.isTaxIncluded
    ? `<tr><th>營業稅 ${escapeHtml(formatRate(info.taxRate))}</th><td>${formatCurrency(totals.taxTotal)}</td></tr>`
    : "";
  const discountRows = info.hasDiscount
    ? `<tr><th>折扣費用</th><td>${formatCurrency(totals.discountTotal)}</td></tr>
       <tr><th>折扣後小計</th><td>${formatCurrency(totals.netSubtotal)}</td></tr>`
    : "";
  const retentionRow = info.hasRetention
    ? `<tr><th>保留款 ${escapeHtml(formatRate(info.retentionRate))}</th><td>${formatCurrency(totals.retentionTotal)}</td></tr>`
    : "";
  const internalRows = includeInternal
    ? `<tr><th>成本合計</th><td>${formatCurrency(totals.costTotal)}</td></tr>
       <tr><th>預估利潤</th><td>${formatCurrency(totals.profitTotal)}</td></tr>
       <tr><th>平均毛利率</th><td>${formatPercent(totals.marginTotal)}</td></tr>`
    : "";

  return `<section class="summary-wrap">
    <div class="note-box">
      <strong>備註</strong>
      <p>${escapeHtml(info.remarks || "本文件依工程明細及約定條件彙整，金額以新台幣計算。")}</p>
    </div>
    <table class="summary-table">
      <tbody>
        <tr><th>請款小計</th><td>${formatCurrency(totals.subtotal)}</td></tr>
        ${discountRows}
        ${taxRow}
        ${retentionRow}
        <tr class="grand"><th>本期應收</th><td>${formatCurrency(totals.grandTotal)}</td></tr>
        ${internalRows}
      </tbody>
    </table>
  </section>`;
}

function buildPdfSignatures(labels) {
  return `<section class="signatures">
    ${labels.map((label) => `<div class="signature">${escapeHtml(label)}</div>`).join("")}
  </section>`;
}

function openAccountPanel() {
  renderAccountPanel();
  accountPanel.classList.remove("is-hidden");
}

function closeAccountPanel() {
  accountPanel.classList.add("is-hidden");
  closeUserAnalyticsPanel();
  accountMessage.textContent = "";
  document.querySelector("#accountNewPassword").value = "";
  document.querySelector("#accountNewPasswordConfirm").value = "";
}

function renderAccountPanel() {
  document.querySelector("#accountEmail").textContent = state.currentUser.email;
  document.querySelector("#accountMemberCode").textContent = state.currentUser.memberCode;
  document.querySelector("#accountRole").textContent = state.currentUser.role === "admin" ? "最高權限管理員" : "一般會員";
  document.querySelector("#accountNickname").value = state.currentUser.nickname;
  adminPanel.classList.toggle("is-hidden", state.currentUser.role !== "admin");

  if (state.currentUser.role === "admin") {
    renderAdminAccounts();
  }
}

function renderAdminAccounts() {
  accountCount.textContent = `${state.accounts.length} 個帳號`;
  adminAccountList.innerHTML = "";
  state.accounts.forEach((account) => {
    const row = document.createElement("article");
    row.className = "admin-account-row";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(account.nickname)}</strong>
        <p>${escapeHtml(account.email)} · ${escapeHtml(account.memberCode)}</p>
      </div>
      <span class="role-pill">${account.role === "admin" ? "Admin" : "User"}</span>
      <span class="status-pill ${account.disabled ? "is-disabled" : ""}">${account.disabled ? "停用" : "啟用"}</span>
      <button class="secondary-button" type="button" data-toggle-account="${account.memberCode}" ${account.memberCode === state.currentUser.memberCode ? "disabled" : ""}>${account.disabled ? "啟用" : "停用"}</button>
      <button class="secondary-button danger-button" type="button" data-delete-account="${account.memberCode}" ${account.memberCode === state.currentUser.memberCode ? "disabled" : ""}>刪除</button>
    `;
    adminAccountList.appendChild(row);
  });
}

async function updateCurrentAccount(event) {
  event.preventDefault();
  const nickname = document.querySelector("#accountNickname").value.trim();
  const newPassword = document.querySelector("#accountNewPassword").value;
  const confirm = document.querySelector("#accountNewPasswordConfirm").value;
  const account = state.accounts.find((item) => item.memberCode === state.currentUser.memberCode);

  if (!nickname) {
    setFormMessage(accountMessage, "請輸入暱稱。", "error");
    return;
  }

  account.nickname = nickname;
  account.updatedAt = new Date().toISOString();

  if (newPassword || confirm) {
    if (newPassword !== confirm) {
      setFormMessage(accountMessage, "兩次新密碼輸入不一致。", "error");
      return;
    }

    if (!validatePassword(newPassword)) {
      setFormMessage(accountMessage, "新密碼需包含大寫、小寫、數字與符號，且至少 8 碼。", "error");
      return;
    }

    const newSalt = randomBase64(16);
    account.salt = newSalt;
    account.passwordHash = await derivePasswordHash(newPassword, newSalt);
    state.cryptoKey = await deriveVaultKey(newPassword, newSalt);
    await persistInvoices();
  }

  saveAccounts();
  state.currentUser = account;
  renderCurrentUser();
  renderAccountPanel();
  setFormMessage(accountMessage, "帳號已更新。", "success");
}

function toggleAccount(memberCode) {
  const account = state.accounts.find((item) => item.memberCode === memberCode);
  if (!account || account.memberCode === state.currentUser.memberCode) return;
  account.disabled = !account.disabled;
  account.updatedAt = new Date().toISOString();
  saveAccounts();
  renderAdminAccounts();
}

function deleteAccount(memberCode) {
  const account = state.accounts.find((item) => item.memberCode === memberCode);
  if (!account || account.memberCode === state.currentUser.memberCode) return;
  state.accounts = state.accounts.filter((item) => item.memberCode !== memberCode);
  localStorage.removeItem(`${VAULT_PREFIX}${memberCode}`);
  state.invitations = state.invitations.filter((invite) => invite.fromMemberCode !== memberCode && invite.toMemberCode !== memberCode);
  saveAccounts();
  saveInvitations();
  renderAdminAccounts();
}

function logout() {
  closeAccountPanel();
  closeLeaveConfirm();
  showAuth();
}

function setFormMessage(element, message, type) {
  element.textContent = message;
  element.classList.toggle("is-error", type === "error");
  element.classList.toggle("is-success", type === "success");
}

function formatCurrency(value) {
  return currencyFormatter.format(Math.round(value));
}

function formatQuantity(value) {
  return numberFormatter.format(toNumber(value));
}

function formatPercent(value) {
  return `${numberFormatter.format(value * 100)}%`;
}

function formatRate(value) {
  return `${numberFormatter.format(toNumber(value))}%`;
}

function formatContact(name, phone) {
  const parts = [name, phone].map((value) => String(value || "").trim()).filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "-";
}

function formatFullDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

function formatFullDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "尚未儲存";
  return date.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未儲存";
  return date.toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function sanitizeFilename(value) {
  return String(value).replace(/[\\/:*?"<>|]/g, "_").trim() || "工程請款";
}

function closeExportMenu() {
  exportMenu.classList.remove("is-open");
  exportButton.setAttribute("aria-expanded", "false");
}

loginTab.addEventListener("click", () => switchAuthTab("login"));
registerTab.addEventListener("click", () => switchAuthTab("register"));
loginForm.addEventListener("submit", handleLogin);
registerForm.addEventListener("submit", handleRegister);

document.querySelector("#newInvoiceButton").addEventListener("click", async () => {
  const invoice = createInvoice();
  state.invoices.unshift(invoice);
  await persistInvoices();
  showForm(invoice.id);
});

document.querySelector("#backToListButton").addEventListener("click", requestBackToList);
document.querySelector("#accountButton").addEventListener("click", openAccountPanel);
document.querySelector("#logoutButton").addEventListener("click", logout);
document.querySelector("#closeAccountButton").addEventListener("click", closeAccountPanel);
document.querySelector("#accountForm").addEventListener("submit", updateCurrentAccount);
document.querySelector("#inviteForm").addEventListener("submit", inviteMember);
versionDetailButton.addEventListener("click", openVersionPanel);
closeVersionButton.addEventListener("click", closeVersionPanel);
userAnalyticsButton.addEventListener("click", openUserAnalyticsPanel);
closeAnalyticsButton.addEventListener("click", closeUserAnalyticsPanel);
closeEditLogButton.addEventListener("click", closeEditLogPanel);
closeMemberInfoButton.addEventListener("click", closeMemberInfoPanel);
saveAndLeaveButton.addEventListener("click", saveAndReturnToList);
leaveWithoutSaveButton.addEventListener("click", returnToListWithoutSaving);
stayOnFormButton.addEventListener("click", closeLeaveConfirm);
cancelLeaveButton.addEventListener("click", closeLeaveConfirm);
deleteInvoiceButton.addEventListener("click", () => deleteInvoice(state.activeInvoiceId, { fromForm: true }));
closeInvoiceButton.addEventListener("click", requestInvoiceStatusChange);
messageBoardButton.addEventListener("click", toggleMessageBoard);
closeMessageBoardButton.addEventListener("click", closeMessageBoard);
messageBoardForm.addEventListener("submit", submitMessage);
noticeToggle.addEventListener("click", toggleNoticePanel);
copySelectedDetailsButton.addEventListener("click", copySelectedDetails);
deleteSelectedDetailsButton.addEventListener("click", deleteSelectedDetails);
selectAllDetails.addEventListener("change", () => {
  if (!canEditInvoice()) return;
  if (selectAllDetails.checked) {
    state.selectedDetailIds = new Set(getBillableDetails(state.activeInvoice).map((detail) => detail.id));
  } else {
    state.selectedDetailIds.clear();
  }
  renderDetails();
});
confirmDeleteButton.addEventListener("click", confirmDeleteAction);
cancelDeleteButton.addEventListener("click", closeDeleteConfirm);
cancelDeleteActionButton.addEventListener("click", closeDeleteConfirm);
confirmCloseButton.addEventListener("click", confirmCloseAction);
cancelCloseButton.addEventListener("click", closeCloseConfirm);
cancelCloseActionButton.addEventListener("click", closeCloseConfirm);
toggleFormulaButton.addEventListener("click", toggleFormulaPanel);
saveInvoiceButton.addEventListener("click", openEditLogPanel);
addSectionButton.addEventListener("click", addSection);
document.querySelector("#addDetailButton").addEventListener("click", addDetail);

invoiceSearchInput.addEventListener("input", () => {
  state.invoiceSearchQuery = invoiceSearchInput.value;
  renderInvoiceList();
});

invoiceList.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open-invoice]");
  const copyButton = event.target.closest("[data-copy-invoice]");
  const deleteButton = event.target.closest("[data-delete-invoice]");
  if (openButton) {
    showForm(openButton.dataset.openInvoice);
  }
  if (copyButton) {
    copyInvoice(copyButton.dataset.copyInvoice);
  }
  if (deleteButton) {
    deleteInvoice(deleteButton.dataset.deleteInvoice);
  }
});

noticeList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-notice]");
  if (!button) return;
  const notice = state.invitations.find((item) => item.id === button.dataset.openNotice);
  if (notice) {
    notice.read = true;
    saveInvitations();
    renderNotices();
    if (notice.invoiceId && findVisibleInvoice(notice.invoiceId)) {
      showForm(notice.invoiceId);
      noticePanel.classList.add("is-collapsed");
      noticeToggle.setAttribute("aria-expanded", "false");
    }
  }
});

adminAccountList.addEventListener("click", (event) => {
  const toggleButton = event.target.closest("[data-toggle-account]");
  const deleteButton = event.target.closest("[data-delete-account]");
  if (toggleButton) {
    toggleAccount(toggleButton.dataset.toggleAccount);
  }
  if (deleteButton) {
    deleteAccount(deleteButton.dataset.deleteAccount);
  }
});

inviteHistoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-fill-invite]");
  if (!button || !canManageInvoice()) return;
  document.querySelector("#inviteTarget").value = button.dataset.fillInvite;
});

collaborationMemberList.addEventListener("click", (event) => {
  const infoButton = event.target.closest("[data-member-info]");
  const removeButton = event.target.closest("[data-remove-member]");
  if (infoButton) {
    openMemberInfo(infoButton.dataset.memberInfo);
  }
  if (removeButton) {
    removeCollaborationMember(removeButton.dataset.removeMember);
  }
});

collaborationMemberList.addEventListener("change", (event) => {
  const roleSelect = event.target.closest("[data-member-role]");
  if (!roleSelect) return;
  changeMemberRole(roleSelect.dataset.memberRole, roleSelect.value);
});

infoFields.forEach((field) => {
  const input = document.querySelector(`#${field}`);
  const syncField = () => {
    if (!canEditInvoice()) return;
    syncInfoFromInputs();
    renderSummary();
    markActiveInvoiceDirty();
  };
  input.addEventListener("input", syncField);
  input.addEventListener("change", syncField);
});

detailsContainer.addEventListener("input", (event) => {
  if (!canEditInvoice()) return;
  const target = event.target;

  if (target.matches("[data-detail-field]")) {
    const detailIndex = Number(target.dataset.detailIndex);
    const field = target.dataset.detailField;
    state.activeInvoice.details[detailIndex][field] = target.type === "number" ? toNumber(target.value) : target.value;
    renderSummary();
    if (!isSectionDetail(state.activeInvoice.details[detailIndex])) {
      updateVisibleDetailTotals(detailIndex);
    }
    markActiveInvoiceDirty();
  }
});

detailsContainer.addEventListener("click", (event) => {
  if (!canEditInvoice()) return;
  const selectDetail = event.target.closest("[data-select-detail]");
  const addChildButton = event.target.closest("[data-add-child-detail]");
  if (addChildButton) {
    addChildDetail(Number(addChildButton.dataset.addChildDetail));
    return;
  }
  if (selectDetail) {
    if (selectDetail.checked) {
      state.selectedDetailIds.add(selectDetail.dataset.selectDetail);
    } else {
      state.selectedDetailIds.delete(selectDetail.dataset.selectDetail);
    }
    updateBulkActionState();
    return;
  }

  const deleteButton = event.target.closest("[data-delete-detail]");
  if (deleteButton) {
    deleteDetail(Number(deleteButton.dataset.deleteDetail));
  }
});

detailsContainer.addEventListener("dragstart", (event) => {
  if (!canEditInvoice()) return;
  const row = event.target.closest(".detail-row");
  if (!row) return;
  state.draggedDetailId = row.dataset.detailId;
  row.classList.add("is-dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", row.dataset.detailId);
});

detailsContainer.addEventListener("dragover", (event) => {
  if (!canEditInvoice()) return;
  const row = event.target.closest(".detail-row");
  if (!row || row.dataset.detailId === state.draggedDetailId) return;
  event.preventDefault();
  row.classList.add("is-drop-target");
});

detailsContainer.addEventListener("dragleave", (event) => {
  event.target.closest(".detail-row")?.classList.remove("is-drop-target");
});

detailsContainer.addEventListener("drop", (event) => {
  if (!canEditInvoice()) return;
  const row = event.target.closest(".detail-row");
  if (!row) return;
  event.preventDefault();
  moveDetail(state.draggedDetailId || event.dataTransfer.getData("text/plain"), row.dataset.detailId);
});

detailsContainer.addEventListener("dragend", () => {
  state.draggedDetailId = null;
  clearDragClasses();
});

detailsContainer.addEventListener("pointerdown", (event) => {
  if (!canEditInvoice()) return;
  const handle = event.target.closest(".drag-handle");
  if (!handle) return;
  const row = handle.closest(".detail-row");
  state.pointerDragId = row.dataset.detailId;
  state.pointerDropId = row.dataset.detailId;
  row.classList.add("is-dragging");
  handle.setPointerCapture?.(event.pointerId);
  event.preventDefault();
});

document.addEventListener("pointermove", (event) => {
  if (!state.pointerDragId) return;
  const row = document.elementFromPoint(event.clientX, event.clientY)?.closest(".detail-row");
  clearDragClasses();
  const sourceRow = detailsContainer.querySelector(`[data-detail-id="${state.pointerDragId}"]`);
  sourceRow?.classList.add("is-dragging");
  if (row && row.dataset.detailId !== state.pointerDragId) {
    state.pointerDropId = row.dataset.detailId;
    row.classList.add("is-drop-target");
  }
  event.preventDefault();
});

document.addEventListener("pointerup", () => {
  if (!state.pointerDragId) return;
  moveDetail(state.pointerDragId, state.pointerDropId);
  state.pointerDragId = null;
  state.pointerDropId = null;
  clearDragClasses();
});

exportButton.addEventListener("click", () => {
  const isOpen = exportMenu.classList.toggle("is-open");
  exportButton.setAttribute("aria-expanded", String(isOpen));
});

exportMenu.addEventListener("click", (event) => {
  const button = event.target.closest("[data-export]");
  if (!button) return;
  exportPdf(button.dataset.export);
  closeExportMenu();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".export-wrap")) {
    closeExportMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeExportMenu();
    closeAccountPanel();
    closeVersionPanel();
    closeUserAnalyticsPanel();
    closeEditLogPanel();
    closeMemberInfoPanel();
    closeLeaveConfirm();
    closeDeleteConfirm();
    closeCloseConfirm();
    closeMessageBoard();
  }
});

initApp();
