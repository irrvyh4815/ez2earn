const ACCOUNT_STORAGE_KEY = "ez2earn-accounts-v1";
const INVITATION_STORAGE_KEY = "ez2earn-invitations-v1";
const VAULT_PREFIX = "ez2earn-vault-";
const LEGACY_INVOICE_KEYS = ["ez2earn-invoices-v3", "ez2earn-invoices-v2"];
const ADMIN_EMAIL = "irrvyh4815@gmail.com";
const PBKDF2_ITERATIONS = 150000;
const APP_VERSION = "ez2earn_260612001";
const VERSION_HISTORY = [
  {
    version: APP_VERSION,
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
  isInvoiceDirty: false,
  selectedDetailIds: new Set(),
  pendingDeleteAction: null,
  pendingCloseAction: null,
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
const sessionSidebar = document.querySelector("#sessionSidebar");
const sidebarUserLine = document.querySelector("#sidebarUserLine");
const sidebarLastSavedLine = document.querySelector("#sidebarLastSavedLine");
const noticeWidget = document.querySelector("#noticeWidget");
const noticeToggle = document.querySelector("#noticeToggle");
const noticePanel = document.querySelector("#noticePanel");
const noticeDot = document.querySelector("#noticeDot");
const lastSavedLine = document.querySelector("#lastSavedLine");
const messageBoardButton = document.querySelector("#messageBoardButton");
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

function createInvoice(overrides = {}) {
  const now = new Date();
  return {
    id: createId("invoice"),
    ownerMemberCode: state.currentUser?.memberCode || "",
    updatedAt: now.toISOString(),
    isClosed: false,
    closedAt: "",
    collaborators: [],
    messages: [],
    info: { ...defaultInfo, invoiceNo: `INV-${formatDateCode(now)}` },
    details: [
      { id: createId("detail"), name: "弱電管線配管", unit: "式", qty: 1, price: 86000, cost: 62000 },
      { id: createId("detail"), name: "照明迴路追加", unit: "點", qty: 24, price: 1800, cost: 1120 },
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
    updatedAt: account.updatedAt || account.createdAt || new Date().toISOString()
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

function ensureAdminAccount() {
  const adminEmail = normalizeEmail(ADMIN_EMAIL);
  const adminAccount = state.accounts.find((account) => account.email === adminEmail);
  if (!adminAccount) return;
  adminAccount.role = "admin";
  adminAccount.memberCode = "EZ-ADMIN-001";
  saveAccounts();
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

  const salt = randomBase64(16);
  const account = {
    email,
    nickname,
    memberCode: email === normalizeEmail(ADMIN_EMAIL) ? "EZ-ADMIN-001" : generateMemberCode(),
    role: email === normalizeEmail(ADMIN_EMAIL) ? "admin" : "user",
    salt,
    passwordHash: await derivePasswordHash(password, salt),
    disabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    collaborators: Array.isArray(invoice.collaborators) ? invoice.collaborators : [],
    messages: Array.isArray(invoice.messages) ? invoice.messages.map(normalizeMessage) : [],
    info: { ...defaultInfo, ...(invoice.info || {}) },
    details: normalizeDetails(invoice)
  };
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
  return {
    id: detail.id || createId("detail"),
    name: detail.name || "",
    unit: detail.unit || "式",
    qty: toNumber(detail.qty),
    price: toNumber(detail.price),
    cost: toNumber(detail.cost)
  };
}

function createEmptyDetail() {
  return { id: createId("detail"), name: "", unit: "式", qty: 1, price: 0, cost: 0 };
}

async function persistInvoices() {
  if (!state.currentUser || !state.cryptoKey) return;
  const encrypted = await encryptJson({ invoices: state.invoices }, state.cryptoKey);
  localStorage.setItem(`${VAULT_PREFIX}${state.currentUser.memberCode}`, JSON.stringify(encrypted));
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
    state.isInvoiceDirty = false;
    state.selectedDetailIds.clear();
    closeExportMenu();
    closeLeaveConfirm();
    closeDeleteConfirm();
    closeCloseConfirm();
    closeMessageBoard();
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
    const invoice = state.invoices.find((item) => item.id === invoiceId);
    state.activeInvoice = cloneData(invoice);
    state.activeInvoiceId = invoiceId;
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
  await saveActiveInvoice({ silent: true });
  closeLeaveConfirm();
  showList();
}

function returnToListWithoutSaving() {
  closeLeaveConfirm();
  showList();
}

async function copyInvoice(invoiceId) {
  const source = state.invoices.find((invoice) => invoice.id === invoiceId);
  if (!source) return;
  const copy = cloneData(source);
  copy.id = createId("invoice");
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
  const invoice = state.invoices.find((item) => item.id === invoiceId);
  if (!invoice) return;
  const title = invoice.info.projectName || invoice.info.invoiceNo || "此請款單";
  requestDeleteConfirmation(`確定刪除「${title}」？刪除後無法復原。`, async () => {
    state.invoices = state.invoices.filter((item) => item.id !== invoiceId);
    if (state.invoices.length === 0) {
      state.invoices = [createInvoice()];
    }
    await persistInvoices();
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
  if (!state.activeInvoice) return;
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
  if (!state.activeInvoice) return;
  const now = new Date().toISOString();
  state.activeInvoice.isClosed = true;
  state.activeInvoice.closedAt = now;
  state.activeInvoice.updatedAt = now;
  await saveActiveInvoice({ silent: true });
  showList();
}

async function restoreActiveInvoice() {
  if (!state.activeInvoice) return;
  state.activeInvoice.isClosed = false;
  state.activeInvoice.closedAt = "";
  state.activeInvoice.updatedAt = new Date().toISOString();
  await saveActiveInvoice({ silent: true });
  showList();
}

function renderVersionLabels() {
  appVersionLabels.forEach((label) => {
    label.textContent = APP_VERSION;
  });
}

function openVersionPanel() {
  versionList.innerHTML = VERSION_HISTORY.map((entry) => `
    <article class="version-item">
      <strong>${escapeHtml(entry.version)}</strong>
      <span>${escapeHtml(entry.date)}</span>
      <ul>${entry.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </article>
  `).join("");
  versionPanel.classList.remove("is-hidden");
}

function closeVersionPanel() {
  versionPanel.classList.add("is-hidden");
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
  const query = state.invoiceSearchQuery.trim().toLowerCase();
  const filteredInvoices = state.invoices
    .filter((invoice) => {
      if (!query) return true;
      const haystack = `${invoice.info.projectName || ""} ${invoice.info.invoiceNo || ""}`.toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const ongoingInvoices = filteredInvoices.filter((invoice) => !invoice.isClosed);
  const closedInvoices = filteredInvoices.filter((invoice) => invoice.isClosed);

  invoiceCount.textContent = query
    ? `${filteredInvoices.length} / ${state.invoices.length} 張`
    : `${state.invoices.length} 張`;
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
    const card = document.createElement("article");
    card.className = `invoice-card${invoice.isClosed ? " is-closed" : ""}`;
    card.innerHTML = `
        <div>
          <h2>${escapeHtml(invoice.info.projectName || "未命名工程")} ${invoice.isClosed ? '<span class="status-pill">已結案</span>' : ""}</h2>
          <p>${escapeHtml(invoice.info.invoiceNo || "未填單號")} · ${escapeHtml(invoice.info.clientName || "未填業主")}</p>
        </div>
        <div class="invoice-card-meta">
          <strong>${formatCurrency(totals.grandTotal)}</strong>
          <span>${invoice.isClosed ? `結案 ${formatDateTime(invoice.closedAt)}` : `更新 ${formatDateTime(invoice.updatedAt)}`}</span>
        </div>
        <div class="invoice-card-actions">
          <button class="secondary-button" type="button" data-open-invoice="${invoice.id}">編輯</button>
          <button class="secondary-button" type="button" data-copy-invoice="${invoice.id}">複製</button>
          <button class="secondary-button danger-button" type="button" data-delete-invoice="${invoice.id}">刪除</button>
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
          : `${escapeHtml(notice.fromNickname)} 邀請你查看請款單 ${escapeHtml(notice.invoiceNo || "")}`}
        </p>
        <span>${formatDateTime(notice.createdAt)}</span>
      </div>
      <button class="secondary-button" type="button" data-open-notice="${notice.id}">${isMessage ? "查看" : (notice.read ? "已讀" : "標示已讀")}</button>
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

function canEditInvoice(invoice = state.activeInvoice) {
  if (!invoice || !state.currentUser) return false;
  const editors = getInvoiceEditors(invoice);
  return editors.length === 0 || editors.includes(state.currentUser.memberCode);
}

function toggleMessageBoard() {
  const isOpen = messageBoardPanel.classList.toggle("is-hidden") === false;
  messageBoardButton.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) renderMessageBoard();
}

function closeMessageBoard() {
  messageBoardPanel.classList.add("is-hidden");
  messageBoardButton.setAttribute("aria-expanded", "false");
  messageBoardStatus.textContent = "";
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
  await saveActiveInvoice({ silent: true });
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
  renderDetails();
  renderSummary();
}

function updateCloseInvoiceButton() {
  if (!state.activeInvoice?.isClosed) {
    closeInvoiceButton.textContent = "結案";
    closeInvoiceButton.disabled = false;
    return;
  }
  closeInvoiceButton.textContent = "恢復";
  closeInvoiceButton.disabled = false;
}

function renderDetails() {
  detailsContainer.innerHTML = "";
  const detailIds = new Set(state.activeInvoice.details.map((detail) => detail.id));
  state.selectedDetailIds.forEach((id) => {
    if (!detailIds.has(id)) state.selectedDetailIds.delete(id);
  });

  state.activeInvoice.details.forEach((detail, index) => {
    const totals = detailTotals(detail);
    const row = document.createElement("article");
    row.className = "detail-row";
    row.draggable = true;
    row.dataset.detailId = detail.id;
    row.dataset.index = String(index);
    row.innerHTML = `
      <input class="detail-select" data-select-detail="${detail.id}" type="checkbox" aria-label="選取明細 ${index + 1}" ${state.selectedDetailIds.has(detail.id) ? "checked" : ""}>
      <button class="drag-handle" type="button" aria-label="拖曳排序" title="拖曳排序">⋮⋮</button>
      <span class="detail-index">${index + 1}</span>
      <label>
        <span>明細表單</span>
        <input data-detail-index="${index}" data-detail-field="name" type="text" value="${escapeHtml(detail.name)}">
      </label>
      <label>
        <span>單位</span>
        <input data-detail-index="${index}" data-detail-field="unit" type="text" value="${escapeHtml(detail.unit)}">
      </label>
      <label>
        <span>數量</span>
        <input class="number" data-detail-index="${index}" data-detail-field="qty" type="number" min="0" step="0.01" value="${detail.qty}">
      </label>
      <label>
        <span>請款單價</span>
        <input class="number" data-detail-index="${index}" data-detail-field="price" type="number" min="0" step="1" value="${detail.price}">
      </label>
      <label>
        <span>成本單價</span>
        <input class="number" data-detail-index="${index}" data-detail-field="cost" type="number" min="0" step="1" value="${detail.cost}">
      </label>
      <output data-detail-output="amount">${formatCurrency(totals.amount)}</output>
      <output data-detail-output="cost">${formatCurrency(totals.costAmount)}</output>
      <output data-detail-output="profit">${formatCurrency(totals.profit)}</output>
      <button class="delete-row" data-delete-detail="${index}" type="button" aria-label="刪除明細" title="刪除">×</button>
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
  customPaymentMethodWrap.classList.toggle("is-disabled-field", !customPaymentEnabled);
  taxRateWrap.classList.toggle("is-disabled-field", !taxEnabled);
  retentionRateWrap.classList.toggle("is-disabled-field", !retentionEnabled);
  discountAmountWrap.classList.toggle("is-disabled-field", !discountEnabled);
  customPaymentMethodInput.disabled = !customPaymentEnabled;
  taxRateInput.disabled = !taxEnabled;
  retentionRateInput.disabled = !retentionEnabled;
  discountAmountInput.disabled = !discountEnabled;
}

function getPaymentMethodLabel(info) {
  return info.paymentMethod === "自訂" ? (info.customPaymentMethod || "自訂") : (info.paymentMethod || "-");
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function detailTotals(detail) {
  const amount = toNumber(detail.qty) * toNumber(detail.price);
  const costAmount = toNumber(detail.qty) * toNumber(detail.cost);
  const profit = amount - costAmount;
  const margin = amount === 0 ? 0 : profit / amount;
  return { amount, costAmount, profit, margin };
}

function summaryTotals(invoice = state.activeInvoice) {
  const subtotal = invoice.details.reduce((sum, detail) => sum + detailTotals(detail).amount, 0);
  const costTotal = invoice.details.reduce((sum, detail) => sum + detailTotals(detail).costAmount, 0);
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
    <div><strong>請款小計</strong><span>各明細「數量 × 請款單價」加總 = ${formatCurrency(totals.subtotal)}</span></div>
    <div><strong>折扣費用</strong><span>${info.hasDiscount ? `輸入折扣 = ${formatCurrency(totals.discountTotal)}` : "未勾選，不列入折扣"}</span></div>
    <div><strong>折扣後小計</strong><span>${formatCurrency(totals.subtotal)} - ${formatCurrency(totals.discountTotal)} = ${formatCurrency(totals.netSubtotal)}</span></div>
    <div><strong>稅額</strong><span>${info.isTaxIncluded ? `${formatCurrency(totals.netSubtotal)} × ${formatRate(taxRate)} = ${formatCurrency(totals.taxTotal)}` : "未勾選含稅，稅額為 $0"}</span></div>
    <div><strong>保留款</strong><span>${info.hasRetention ? `${formatCurrency(totals.netSubtotal)} × ${formatRate(retentionRate)} = ${formatCurrency(totals.retentionTotal)}` : "未勾選保留款，保留款為 $0"}</span></div>
    <div><strong>本期應收</strong><span>${formatCurrency(totals.netSubtotal)} + ${formatCurrency(totals.taxTotal)} - ${formatCurrency(totals.retentionTotal)} = ${formatCurrency(totals.grandTotal)}</span></div>
    <div><strong>內部成本</strong><span>各明細「數量 × 成本單價」加總 = ${formatCurrency(totals.costTotal)}</span></div>
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
  state.activeInvoice.details.push(createEmptyDetail());
  renderDetails();
  renderSummary();
  markActiveInvoiceDirty();
  detailsContainer.lastElementChild?.querySelector("input")?.focus();
}

function copySelectedDetails() {
  const selected = state.activeInvoice.details.filter((detail) => state.selectedDetailIds.has(detail.id));
  if (selected.length === 0) return;
  const copies = selected.map((detail) => ({ ...detail, id: createId("detail"), name: `${detail.name || "未命名明細"} 複製` }));
  state.activeInvoice.details.push(...copies);
  state.selectedDetailIds = new Set(copies.map((detail) => detail.id));
  renderDetails();
  renderSummary();
  markActiveInvoiceDirty();
}

function deleteSelectedDetails() {
  const count = state.selectedDetailIds.size;
  if (count === 0) return;
  requestDeleteConfirmation(`確定刪除 ${count} 筆已勾選明細？刪除後無法復原。`, () => {
    if (state.activeInvoice.details.length === count) {
      state.activeInvoice.details = [createEmptyDetail()];
    } else {
      state.activeInvoice.details = state.activeInvoice.details.filter((detail) => !state.selectedDetailIds.has(detail.id));
    }
    state.selectedDetailIds.clear();
    renderDetails();
    renderSummary();
    markActiveInvoiceDirty();
  });
}

function deleteDetail(index) {
  requestDeleteConfirmation("確定刪除此筆明細？刪除後無法復原。", () => {
    const removed = state.activeInvoice.details[index];
    if (state.activeInvoice.details.length === 1) {
      state.activeInvoice.details[0] = createEmptyDetail();
    } else {
      state.activeInvoice.details.splice(index, 1);
    }
    if (removed) state.selectedDetailIds.delete(removed.id);
    renderDetails();
    renderSummary();
    markActiveInvoiceDirty();
  });
}

function updateBulkActionState() {
  const total = state.activeInvoice?.details.length || 0;
  const selected = state.selectedDetailIds.size;
  selectAllDetails.checked = total > 0 && selected === total;
  selectAllDetails.indeterminate = selected > 0 && selected < total;
  copySelectedDetailsButton.disabled = selected === 0;
  deleteSelectedDetailsButton.disabled = selected === 0;
}

async function saveActiveInvoice(options = {}) {
  syncInfoFromInputs();
  state.activeInvoice.updatedAt = new Date().toISOString();
  const index = state.invoices.findIndex((invoice) => invoice.id === state.activeInvoiceId);
  if (index >= 0) {
    state.invoices[index] = cloneData(state.activeInvoice);
  } else {
    state.invoices.unshift(state.activeInvoice);
    state.activeInvoiceId = state.activeInvoice.id;
  }
  await persistInvoices();
  state.isInvoiceDirty = false;
  renderLastSaved();

  if (!options.silent) {
    setSaveStatus("已儲存");
    saveInvoiceButton.classList.add("is-saving");
    window.setTimeout(() => saveInvoiceButton.classList.remove("is-saving"), 520);
  }
}

function setSaveStatus(message) {
  saveStatus.textContent = message;
}

function markActiveInvoiceDirty() {
  state.isInvoiceDirty = true;
  setSaveStatus("尚未儲存");
}

function updateVisibleDetailTotals(index) {
  const detail = state.activeInvoice.details[index];
  const totals = detailTotals(detail);
  const row = detailsContainer.querySelector(`[data-index="${index}"]`);
  row.querySelector('[data-detail-output="amount"]').textContent = formatCurrency(totals.amount);
  row.querySelector('[data-detail-output="cost"]').textContent = formatCurrency(totals.costAmount);
  row.querySelector('[data-detail-output="profit"]').textContent = formatCurrency(totals.profit);
}

function moveDetail(fromId, toId) {
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
  syncInfoFromInputs();
  const target = document.querySelector("#inviteTarget").value.trim();
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

  await saveActiveInvoice({ silent: true });
  if (!state.activeInvoice.collaborators.includes(targetAccount.memberCode)) {
    state.activeInvoice.collaborators.push(targetAccount.memberCode);
    await saveActiveInvoice({ silent: true });
  }

  state.invitations.push({
    id: createId("invite"),
    fromMemberCode: state.currentUser.memberCode,
    fromEmail: state.currentUser.email,
    fromNickname: state.currentUser.nickname,
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
  setFormMessage(inviteMessage, "邀請已送出。", "success");
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
    ${buildPdfMetaItem("稅務 / 保留款", `${info.isTaxIncluded ? `含稅 ${formatRate(info.taxRate)}` : "未稅"} / ${info.hasRetention ? formatRate(info.retentionRate) : "無保留款"}`)}
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
  const rows = invoice.details.map((detail, index) => {
    const detailSummary = detailTotals(detail);
    return `<tr>
      <td class="index">${index + 1}</td>
      <td>${escapeHtml(detail.name || "-")}</td>
      <td class="unit">${escapeHtml(detail.unit || "-")}</td>
      <td class="qty">${formatQuantity(detail.qty)}</td>
      <td class="amount">${formatCurrency(detail.price)}</td>
      <td class="amount">${formatCurrency(detailSummary.amount)}</td>
    </tr>`;
  }).join("");

  return `<section>
    <h2 class="section-title">請款明細</h2>
    <table class="details-table client-table">
      <thead>
        <tr>
          <th class="index-col">序號</th>
          <th class="name-col">明細表單</th>
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

function buildInternalPdfBody(invoice) {
  const totals = summaryTotals(invoice);
  const rows = invoice.details.map((detail, index) => {
    const detailSummary = detailTotals(detail);
    return `<tr>
      <td class="index">${index + 1}</td>
      <td>${escapeHtml(detail.name || "-")}</td>
      <td class="unit">${escapeHtml(detail.unit || "-")}</td>
      <td class="qty">${formatQuantity(detail.qty)}</td>
      <td class="amount">${formatCurrency(detail.price)}</td>
      <td class="amount">${formatCurrency(detail.cost)}</td>
      <td class="amount">${formatCurrency(detailSummary.amount)}</td>
      <td class="amount">${formatCurrency(detailSummary.costAmount)}</td>
      <td class="amount">${formatCurrency(detailSummary.profit)}</td>
      <td class="percent">${formatPercent(detailSummary.margin)}</td>
    </tr>`;
  }).join("");

  return `<section>
    <h2 class="section-title">請款明細</h2>
    <table class="details-table internal-table">
      <thead>
        <tr>
          <th class="index-col">序號</th>
          <th class="name-col">明細表單</th>
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
        <tr><th>折扣費用</th><td>${formatCurrency(totals.discountTotal)}</td></tr>
        <tr><th>折扣後小計</th><td>${formatCurrency(totals.netSubtotal)}</td></tr>
        ${taxRow}
        <tr><th>${info.hasRetention ? `保留款 ${escapeHtml(formatRate(info.retentionRate))}` : "保留款"}</th><td>${formatCurrency(totals.retentionTotal)}</td></tr>
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
      <button class="secondary-button danger-button" type="button" data-delete-account="${account.memberCode}" ${account.role === "admin" ? "disabled" : ""}>刪除</button>
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
  if (!account || account.role === "admin") return;
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
  if (selectAllDetails.checked) {
    state.selectedDetailIds = new Set(state.activeInvoice.details.map((detail) => detail.id));
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
saveInvoiceButton.addEventListener("click", () => saveActiveInvoice());
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
    if (notice.type === "message" && notice.invoiceId && state.invoices.some((invoice) => invoice.id === notice.invoiceId)) {
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

infoFields.forEach((field) => {
  const input = document.querySelector(`#${field}`);
  const syncField = () => {
    syncInfoFromInputs();
    renderSummary();
    markActiveInvoiceDirty();
  };
  input.addEventListener("input", syncField);
  input.addEventListener("change", syncField);
});

detailsContainer.addEventListener("input", (event) => {
  const target = event.target;

  if (target.matches("[data-detail-field]")) {
    const detailIndex = Number(target.dataset.detailIndex);
    const field = target.dataset.detailField;
    state.activeInvoice.details[detailIndex][field] = target.type === "number" ? toNumber(target.value) : target.value;
    renderSummary();
    updateVisibleDetailTotals(detailIndex);
    markActiveInvoiceDirty();
  }
});

detailsContainer.addEventListener("click", (event) => {
  const selectDetail = event.target.closest("[data-select-detail]");
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
  const row = event.target.closest(".detail-row");
  if (!row) return;
  state.draggedDetailId = row.dataset.detailId;
  row.classList.add("is-dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", row.dataset.detailId);
});

detailsContainer.addEventListener("dragover", (event) => {
  const row = event.target.closest(".detail-row");
  if (!row || row.dataset.detailId === state.draggedDetailId) return;
  event.preventDefault();
  row.classList.add("is-drop-target");
});

detailsContainer.addEventListener("dragleave", (event) => {
  event.target.closest(".detail-row")?.classList.remove("is-drop-target");
});

detailsContainer.addEventListener("drop", (event) => {
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
    closeLeaveConfirm();
    closeDeleteConfirm();
    closeCloseConfirm();
    closeMessageBoard();
  }
});

initApp();
