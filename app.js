const ACCOUNT_STORAGE_KEY = "ez2earn-accounts-v1";
const INVITATION_STORAGE_KEY = "ez2earn-invitations-v1";
const VAULT_PREFIX = "ez2earn-vault-";
const LEGACY_INVOICE_KEYS = ["ez2earn-invoices-v3", "ez2earn-invoices-v2"];
const ADMIN_EMAIL = "irrvyh4815@gmail.com";
const PBKDF2_ITERATIONS = 150000;

const defaultInfo = {
  projectName: "A 棟機電追加工程",
  clientName: "宏盛營造股份有限公司",
  contractorName: "Ez2Earn 工程行",
  invoiceNo: "INV-2026-0610",
  billingPeriod: "2026/06/01 - 2026/06/10",
  taxRate: 5,
  retentionRate: 0,
  discountAmount: 0,
  paymentTerms: "月結 30 天"
};

const infoFields = [
  "projectName",
  "clientName",
  "contractorName",
  "invoiceNo",
  "billingPeriod",
  "taxRate",
  "retentionRate",
  "discountAmount",
  "paymentTerms"
];

const state = {
  accounts: [],
  invitations: [],
  currentUser: null,
  cryptoKey: null,
  invoices: [],
  activeInvoiceId: null,
  activeInvoice: null,
  draggedDetailId: null,
  pointerDragId: null,
  pointerDropId: null
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
const noticeList = document.querySelector("#noticeList");
const noticeCount = document.querySelector("#noticeCount");
const detailsContainer = document.querySelector("#detailsContainer");
const exportButton = document.querySelector("#exportButton");
const exportMenu = document.querySelector("#exportMenu");
const saveStatus = document.querySelector("#saveStatus");
const saveInvoiceButton = document.querySelector("#saveInvoiceButton");
const accountPanel = document.querySelector("#accountPanel");
const accountMessage = document.querySelector("#accountMessage");
const adminPanel = document.querySelector("#adminPanel");
const adminAccountList = document.querySelector("#adminAccountList");
const accountCount = document.querySelector("#accountCount");
const inviteMessage = document.querySelector("#inviteMessage");

function createInvoice(overrides = {}) {
  const now = new Date();
  return {
    id: createId("invoice"),
    ownerMemberCode: state.currentUser?.memberCode || "",
    updatedAt: now.toISOString(),
    collaborators: [],
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
    return Array.isArray(invitations) ? invitations : [];
  } catch {
    return [];
  }
}

function saveInvitations() {
  localStorage.setItem(INVITATION_STORAGE_KEY, JSON.stringify(state.invitations));
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
  state.currentUser = null;
  state.cryptoKey = null;
  state.invoices = [];
  state.activeInvoice = null;
  state.activeInvoiceId = null;
  authView.classList.remove("is-hidden");
  listView.classList.add("is-hidden");
  formView.classList.add("is-hidden");
  accountPanel.classList.add("is-hidden");
  switchAuthTab(mode);
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
    collaborators: Array.isArray(invoice.collaborators) ? invoice.collaborators : [],
    info: { ...defaultInfo, ...(invoice.info || {}) },
    details: normalizeDetails(invoice)
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

function animateViewChange(next) {
  const currentView = listView.classList.contains("is-hidden") ? formView : listView;
  currentView.classList.add("is-leaving");

  window.setTimeout(() => {
    next();
    currentView.classList.remove("is-leaving");
    const activeView = listView.classList.contains("is-hidden") ? formView : listView;
    activeView.classList.add("is-entering");
    window.setTimeout(() => activeView.classList.remove("is-entering"), 260);
  }, 150);
}

function showList() {
  const next = () => {
    state.activeInvoiceId = null;
    state.activeInvoice = null;
    closeExportMenu();
    authView.classList.add("is-hidden");
    listView.classList.remove("is-hidden");
    formView.classList.add("is-hidden");
    renderCurrentUser();
    renderNotices();
    renderInvoiceList();
  };

  if (formView.classList.contains("is-hidden")) {
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
    authView.classList.add("is-hidden");
    listView.classList.add("is-hidden");
    formView.classList.remove("is-hidden");
    saveStatus.textContent = "";
    inviteMessage.textContent = "";
    renderCurrentUser();
    renderForm();
  };

  if (listView.classList.contains("is-hidden")) {
    next();
  } else {
    animateViewChange(next);
  }
}

function renderCurrentUser() {
  const text = `${state.currentUser.nickname} · ${state.currentUser.memberCode}`;
  document.querySelector("#currentUserLine").textContent = text;
  document.querySelector("#formUserLine").textContent = text;
}

function renderInvoiceList() {
  invoiceCount.textContent = `${state.invoices.length} 張`;
  invoiceList.innerHTML = "";

  state.invoices
    .slice()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .forEach((invoice) => {
      const totals = summaryTotals(invoice);
      const card = document.createElement("article");
      card.className = "invoice-card";
      card.innerHTML = `
        <div>
          <h2>${escapeHtml(invoice.info.projectName || "未命名工程")}</h2>
          <p>${escapeHtml(invoice.info.invoiceNo || "未填單號")} · ${escapeHtml(invoice.info.clientName || "未填業主")}</p>
        </div>
        <div class="invoice-card-meta">
          <strong>${formatCurrency(totals.grandTotal)}</strong>
          <span>更新 ${formatDateTime(invoice.updatedAt)}</span>
        </div>
        <div class="invoice-card-actions">
          <button class="secondary-button" type="button" data-open-invoice="${invoice.id}">編輯</button>
        </div>
      `;
      invoiceList.appendChild(card);
    });
}

function renderNotices() {
  const notices = state.invitations
    .filter((invite) => invite.toMemberCode === state.currentUser.memberCode)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  noticeCount.textContent = `${notices.length} 則`;
  noticeList.innerHTML = "";

  if (notices.length === 0) {
    noticeList.innerHTML = `<p class="empty-state">目前沒有新的邀請通知。</p>`;
    return;
  }

  notices.forEach((notice) => {
    const item = document.createElement("article");
    item.className = `notice-item${notice.read ? " is-read" : ""}`;
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(notice.projectName || "未命名工程")}</strong>
        <p>${escapeHtml(notice.fromNickname)} 邀請你查看請款單 ${escapeHtml(notice.invoiceNo || "")}</p>
        <span>${formatDateTime(notice.createdAt)}</span>
      </div>
      <button class="secondary-button" type="button" data-read-notice="${notice.id}">${notice.read ? "已讀" : "標示已讀"}</button>
    `;
    noticeList.appendChild(item);
  });
}

function renderForm() {
  infoFields.forEach((field) => {
    document.querySelector(`#${field}`).value = state.activeInvoice.info[field] ?? "";
  });
  renderDetails();
  renderSummary();
}

function renderDetails() {
  detailsContainer.innerHTML = "";

  state.activeInvoice.details.forEach((detail, index) => {
    const totals = detailTotals(detail);
    const row = document.createElement("article");
    row.className = "detail-row";
    row.draggable = true;
    row.dataset.detailId = detail.id;
    row.dataset.index = String(index);
    row.innerHTML = `
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
}

function getProjectInfo() {
  return Object.fromEntries(
    infoFields.map((field) => {
      const input = document.querySelector(`#${field}`);
      const value = input.type === "number" ? toNumber(input.value) : input.value.trim();
      return [field, value];
    })
  );
}

function syncInfoFromInputs() {
  state.activeInvoice.info = getProjectInfo();
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
  const discountTotal = Math.min(toNumber(invoice.info.discountAmount), subtotal);
  const netSubtotal = Math.max(subtotal - discountTotal, 0);
  const taxTotal = netSubtotal * (toNumber(invoice.info.taxRate) / 100);
  const retentionTotal = netSubtotal * (toNumber(invoice.info.retentionRate) / 100);
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
}

function addDetail() {
  state.activeInvoice.details.push(createEmptyDetail());
  renderDetails();
  renderSummary();
  setSaveStatus("");
  detailsContainer.lastElementChild?.querySelector("input")?.focus();
}

function deleteDetail(index) {
  if (state.activeInvoice.details.length === 1) {
    state.activeInvoice.details[0] = createEmptyDetail();
  } else {
    state.activeInvoice.details.splice(index, 1);
  }
  renderDetails();
  renderSummary();
  setSaveStatus("");
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

  if (!options.silent) {
    setSaveStatus("已儲存");
    saveInvoiceButton.classList.add("is-saving");
    window.setTimeout(() => saveInvoiceButton.classList.remove("is-saving"), 520);
  }
}

function setSaveStatus(message) {
  saveStatus.textContent = message;
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
  setSaveStatus("");
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
        margin: 14mm;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        color: #152033;
        background: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", "Microsoft JhengHei", sans-serif;
        font-size: 12px;
        line-height: 1.55;
      }

      .document {
        width: 100%;
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
        page-break-inside: auto;
      }

      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }

      th,
      td {
        border: 1px solid #cbd5e1;
        padding: 7px 8px;
        vertical-align: top;
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
        text-align: right;
        white-space: nowrap;
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
    ${buildPdfMetaItem("承攬廠商", info.contractorName)}
    ${buildPdfMetaItem("請款期間", info.billingPeriod)}
    ${buildPdfMetaItem("付款條件", info.paymentTerms)}
    ${buildPdfMetaItem("稅率 / 保留款", `${formatRate(info.taxRate)} / ${formatRate(info.retentionRate)}`)}
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
    <table>
      <thead>
        <tr>
          <th style="width: 42px;">序號</th>
          <th>明細表單</th>
          <th style="width: 60px;">單位</th>
          <th style="width: 68px;">數量</th>
          <th style="width: 108px;">單價</th>
          <th style="width: 118px;">金額</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    ${buildPdfSummary(totals, invoice.info, false)}
    ${buildPdfSignatures(["承辦", "覆核", "核准"])}
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
    <table>
      <thead>
        <tr>
          <th style="width: 36px;">序號</th>
          <th>明細表單</th>
          <th style="width: 48px;">單位</th>
          <th style="width: 56px;">數量</th>
          <th style="width: 88px;">請款單價</th>
          <th style="width: 88px;">成本單價</th>
          <th style="width: 98px;">請款金額</th>
          <th style="width: 88px;">成本</th>
          <th style="width: 88px;">利潤</th>
          <th style="width: 62px;">毛利率</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    ${buildPdfSummary(totals, invoice.info, true)}
    ${buildPdfSignatures(["製表", "覆核", "核准"])}
  </section>`;
}

function buildPdfSummary(totals, info, includeInternal) {
  const internalRows = includeInternal
    ? `<tr><th>成本合計</th><td>${formatCurrency(totals.costTotal)}</td></tr>
       <tr><th>預估利潤</th><td>${formatCurrency(totals.profitTotal)}</td></tr>
       <tr><th>平均毛利率</th><td>${formatPercent(totals.marginTotal)}</td></tr>`
    : "";

  return `<section class="summary-wrap">
    <div class="note-box">
      <strong>備註</strong>
      <p>本文件依工程明細及約定條件彙整，金額以新台幣計算。</p>
    </div>
    <table class="summary-table">
      <tbody>
        <tr><th>請款小計</th><td>${formatCurrency(totals.subtotal)}</td></tr>
        <tr><th>折扣費用</th><td>${formatCurrency(totals.discountTotal)}</td></tr>
        <tr><th>折扣後小計</th><td>${formatCurrency(totals.netSubtotal)}</td></tr>
        <tr><th>營業稅 ${escapeHtml(formatRate(info.taxRate))}</th><td>${formatCurrency(totals.taxTotal)}</td></tr>
        <tr><th>保留款 ${escapeHtml(formatRate(info.retentionRate))}</th><td>${formatCurrency(totals.retentionTotal)}</td></tr>
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

function formatFullDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
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

document.querySelector("#backToListButton").addEventListener("click", showList);
document.querySelector("#accountButton").addEventListener("click", openAccountPanel);
document.querySelector("#logoutButton").addEventListener("click", logout);
document.querySelector("#closeAccountButton").addEventListener("click", closeAccountPanel);
document.querySelector("#accountForm").addEventListener("submit", updateCurrentAccount);
document.querySelector("#inviteForm").addEventListener("submit", inviteMember);
saveInvoiceButton.addEventListener("click", () => saveActiveInvoice());
document.querySelector("#addDetailButton").addEventListener("click", addDetail);

invoiceList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-invoice]");
  if (button) {
    showForm(button.dataset.openInvoice);
  }
});

noticeList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-read-notice]");
  if (!button) return;
  const invite = state.invitations.find((item) => item.id === button.dataset.readNotice);
  if (invite) {
    invite.read = true;
    saveInvitations();
    renderNotices();
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
  document.querySelector(`#${field}`).addEventListener("input", () => {
    syncInfoFromInputs();
    renderSummary();
    setSaveStatus("");
  });
});

detailsContainer.addEventListener("input", (event) => {
  const target = event.target;

  if (target.matches("[data-detail-field]")) {
    const detailIndex = Number(target.dataset.detailIndex);
    const field = target.dataset.detailField;
    state.activeInvoice.details[detailIndex][field] = target.type === "number" ? toNumber(target.value) : target.value;
    renderSummary();
    updateVisibleDetailTotals(detailIndex);
    setSaveStatus("");
  }
});

detailsContainer.addEventListener("click", (event) => {
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
  }
});

initApp();
