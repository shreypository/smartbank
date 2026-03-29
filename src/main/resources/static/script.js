/* ================================================================
   BNF SMARTBANK — UNIFIED SCRIPT
   All original API logic preserved.
   Additive UI layer: toasts, loaders, modals, nav highlight.
   ================================================================ */

// ── TOAST SYSTEM ─────────────────────────────────────────────
function showToast(message, type = 'info') {
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const container = document.getElementById('toast-container');
    if (!container) { console.warn(message); return; }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span>${message}</span>
        <button class="toast-close" onclick="removeToast(this.parentElement)">✕</button>
    `;
    container.appendChild(toast);
    setTimeout(() => removeToast(toast), 4000);
}

function removeToast(el) {
    if (!el || !el.parentElement) return;
    el.classList.add('removing');
    setTimeout(() => el.remove(), 260);
}

// ── BUTTON LOADING STATE ──────────────────────────────────────
function setLoading(btnEl, loading) {
    if (!btnEl) return;
    if (loading) {
        btnEl.dataset.origText = btnEl.innerHTML;
        btnEl.innerHTML = `<span class="btn-spinner"></span> Loading…`;
        btnEl.disabled = true;
        btnEl.style.opacity = '0.7';
    } else {
        btnEl.innerHTML = btnEl.dataset.origText || btnEl.innerHTML;
        btnEl.disabled = false;
        btnEl.style.opacity = '';
    }
}

// ── SECTION SKELETON LOADER ───────────────────────────────────
function showSkeleton(containerId, rows = 3) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = Array(rows).fill(`<div class="skeleton skeleton-row" style="margin-bottom:0.6rem;border-radius:10px;height:50px;"></div>`).join('');
}

// ── UNIVERSAL RESPONSE HANDLER (original) ────────────────────
function handleResponse(res) {
    return res.text().then(data => {
        try { return JSON.parse(data); } catch { return data; }
    });
}

// ─────────────────────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────────────────────

function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const msgEl = document.getElementById('message');
    const btn = document.getElementById('btn-login-submit');

    if (!email || !password) {
        msgEl.innerText = '⚠️ Please fill in all fields.';
        return;
    }

    setLoading(btn, true);
    msgEl.innerText = '';

    fetch('/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
        .then(res => res.json())
        .then(data => {
            setLoading(btn, false);
            if (data.userCode) {
                localStorage.setItem('userCode', data.userCode);
                window.location.href = 'dashboard.html';
            } else {
                msgEl.innerText = '❌ Invalid email or password. Please try again.';
            }
        })
        .catch(err => {
            setLoading(btn, false);
            msgEl.innerText = '❌ Invalid email or password. Please try again.';
            console.error(err);
        });
}

function register() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const msgEl = document.getElementById('message');
    const btn = document.getElementById('btn-register-submit');

    if (!name || !email || !password) {
        msgEl.innerText = '⚠️ Please fill in all fields.';
        return;
    }

    setLoading(btn, true);
    msgEl.innerText = '';

    fetch('/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'USER' })
    })
        .then(res => res.text())
        .then(data => {
            setLoading(btn, false);
            // Auto-login after registration
            fetch('/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
                .then(r => r.json())
                .then(loginData => {
                    if (loginData.userCode) {
                        localStorage.setItem('userCode', loginData.userCode);
                        window.location.href = 'dashboard.html';
                    } else {
                        msgEl.innerText = '✅ ' + data + ' — Please sign in.';
                        switchTab('login');
                    }
                })
                .catch(() => {
                    msgEl.innerText = '✅ ' + data + ' — Please sign in.';
                    switchTab('login');
                });
        })
        .catch(err => {
            setLoading(btn, false);
            msgEl.innerText = '❌ Registration failed. Please try again.';
            console.error(err);
        });
}

function adminLogin() {
    const user = document.getElementById('adminUser').value.trim();
    const pass = document.getElementById('adminPass').value;
    const msgEl = document.getElementById('message');
    const btn = document.getElementById('btn-admin-submit');

    setLoading(btn, true);
    setTimeout(() => {
        setLoading(btn, false);
        if (user === 'admin' && pass === 'admin') {
            window.location.href = 'admin.html';
        } else {
            msgEl.innerText = '❌ Invalid admin credentials.';
        }
    }, 400);
}

// ─────────────────────────────────────────────────────────────
//  MODAL
// ─────────────────────────────────────────────────────────────

function openModal(type) {
    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');

    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('adminForm').classList.add('hidden');

    const tabs = document.getElementById('authTabs');

    if (type === 'login') {
        document.getElementById('loginForm').classList.remove('hidden');
        if (tabs) { tabs.style.display = ''; switchTab('login', true); }
    } else if (type === 'register') {
        document.getElementById('registerForm').classList.remove('hidden');
        if (tabs) { tabs.style.display = ''; switchTab('register', true); }
    } else {
        document.getElementById('adminForm').classList.remove('hidden');
        if (tabs) tabs.style.display = 'none';
    }

    document.getElementById('message').innerText = '';
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

function switchTab(type, silent = false) {
    const loginTab = document.getElementById('tab-login');
    const registerTab = document.getElementById('tab-register');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (!loginTab) return;

    if (type === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
    if (!silent && document.getElementById('message')) {
        document.getElementById('message').innerText = '';
    }
}

// Close modal on backdrop click
window.addEventListener('click', function (e) {
    const modal = document.getElementById('modal');
    if (modal && e.target === modal) closeModal();
});

// ─────────────────────────────────────────────────────────────
//  WINDOW ONLOAD (dashboard)
// ─────────────────────────────────────────────────────────────

window.onload = function () {
    const userCode = localStorage.getItem('userCode');

    // Dashboard init
    if (document.getElementById('userCodeDisplay')) {
        if (!userCode) { window.location.href = 'index.html'; return; }

        document.getElementById('userCodeDisplay').innerText = userCode;
        if (document.getElementById('userCodeDisplay2'))
            document.getElementById('userCodeDisplay2').innerText = userCode;

        // Set avatar initial
        const avatarEl = document.getElementById('userAvatarInitial');
        if (avatarEl) avatarEl.innerText = userCode.charAt(0).toUpperCase();

        loadAccounts();
        loadTransactionAccounts();
        loadATMAccounts();
        loadTransferAccounts();
        loadLoanAccounts();
        loadInvestmentCards();
        loadInvestments();
    }
};

// ─────────────────────────────────────────────────────────────
//  SECTION SWITCHING + NAV HIGHLIGHT
// ─────────────────────────────────────────────────────────────

const sectionTitles = {
    accounts: 'Account Overview',
    transfer: 'Transfer Funds',
    transactions: 'Transactions',
    loans: 'Loans',
    cards: 'Cards',
    investments: 'Investments'
};

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + sectionId);
    if (navBtn) navBtn.classList.add('active');

    // Update navbar title
    const titleEl = document.getElementById('navbarSectionTitle');
    if (titleEl) titleEl.innerText = sectionTitles[sectionId] || '';
}

// ─────────────────────────────────────────────────────────────
//  ACCOUNTS
// ─────────────────────────────────────────────────────────────

function loadAccounts() {
    const userCode = localStorage.getItem('userCode');
    const container = document.getElementById('accountList');
    if (!container) return;

    container.innerHTML = `
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card" style="height:110px;opacity:0.6;margin-top:0.75rem;"></div>
    `;

    fetch(`/accounts/user?userCode=${userCode}`)
        .then(res => res.json())
        .then(data => {
            if (!data || data.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🏦</div>
                        <p>No accounts yet — create one above!</p>
                    </div>`;
                return;
            }

            const typeClass = { SAVINGS: 'savings', CURRENT: 'current', BUSINESS: 'business' };

            container.innerHTML = `
                <div class="sub-h3">Your Accounts</div>
                <div class="account-cards-grid">
                    ${data.map(acc => `
                        <div class="account-card ${typeClass[acc.accountType] || 'savings'}">
                            <span class="acc-badge">${acc.accountType}</span>
                            <div class="acc-balance">₹${Number(acc.balance).toLocaleString('en-IN')}</div>
                            <div class="acc-number">••••&nbsp;&nbsp;${acc.accountNumber ? acc.accountNumber.slice(-4) : acc.id}</div>
                            <div class="acc-number" style="font-size:0.72rem;margin-top:2px;opacity:0.5;">ID: ${acc.id} &nbsp;|&nbsp; ${acc.accountNumber}</div>
                            <div class="acc-actions">
                                <button class="btn btn-ghost btn-sm" onclick="viewTransactions(${acc.id})">📋 Transactions</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteAccount(${acc.id})">🗑 Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="table-wrap" style="margin-top:1.25rem;">
                    <table>
                        <thead><tr>
                            <th>Account ID</th><th>Type</th><th>Account Number</th><th>Balance</th><th>Actions</th>
                        </tr></thead>
                        <tbody>
                            ${data.map(acc => `
                                <tr>
                                    <td>${acc.id}</td>
                                    <td><span class="badge badge-info">${acc.accountType}</span></td>
                                    <td>${acc.accountNumber}</td>
                                    <td><strong>₹${Number(acc.balance).toLocaleString('en-IN')}</strong></td>
                                    <td>
                                        <button class="btn btn-ghost btn-sm" onclick="viewTransactions(${acc.id})">View</button>
                                        <button class="btn btn-danger btn-sm" onclick="deleteAccount(${acc.id})">Delete</button>
                                    </td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        })
        .catch(() => {
            container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Failed to load accounts.</p></div>`;
        });
}

function createAccountUI(type) {
    const userCode = localStorage.getItem('userCode');
    const btnId = { SAVINGS: 'btn-create-savings', CURRENT: 'btn-create-current', BUSINESS: 'btn-create-business' };
    const btn = document.getElementById(btnId[type]);

    setLoading(btn, true);

    fetch(`/accounts/create?userCode=${userCode}&accountType=${type}`, { method: 'POST' })
        .then(res => res.text())
        .then(data => {
            setLoading(btn, false);
            showToast(data, 'success');
            loadAccounts();
            loadATMAccounts();
            loadTransferAccounts();
            loadLoanAccounts();
        })
        .catch(() => { setLoading(btn, false); showToast('Failed to create account', 'error'); });
}

function viewTransactions(accountId) {
    const container = document.getElementById('txnContainer');
    if (!container) return;

    container.innerHTML = `<div class="loader"></div>`;

    fetch(`/accounts/transactions?accountId=${accountId}`)
        .then(res => res.json())
        .then(data => {
            if (!data || data.length === 0) {
                container.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>No transactions for this account.</p></div>`;
                return;
            }

            const last10 = data.slice(-10).reverse();
            container.innerHTML = `
                <div class="sub-h3" style="margin-top:1.5rem;">Recent Transactions (Account ${accountId})</div>
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>Type</th><th>Amount</th><th>Date</th></tr></thead>
                        <tbody>
                            ${last10.map(t => {
                const isCredit = t.type.includes('DEPOSIT') || (t.type.includes('IN') && t.type !== 'INVESTMENT') || t.type.includes('DISBURSEMENT') || t.type.includes('RETURN');
                return `<tr>
                                    <td>${t.type}</td>
                                    <td><span class="${isCredit ? 'badge badge-success' : 'badge badge-danger'}">${isCredit ? '+' : '-'}₹${t.amount}</span></td>
                                    <td>${t.timestamp}</td>
                                </tr>`;
            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        })
        .catch(() => { container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Failed to load transactions.</p></div>`; });
}

function deleteAccount(accountId) {
    if (!confirm('Delete this account? This cannot be undone.')) return;

    fetch(`/accounts/delete?accountId=${accountId}`, { method: 'DELETE' })
        .then(res => res.text())
        .then(data => {
            showToast(data, 'info');
            loadAccounts();
            loadATMAccounts();
            loadTransferAccounts();
            loadLoanAccounts();
        })
        .catch(() => showToast('Failed to delete account', 'error'));
}

// ─────────────────────────────────────────────────────────────
//  ATM
// ─────────────────────────────────────────────────────────────

function loadATMAccounts() {
    const userCode = localStorage.getItem('userCode');
    fetch(`/accounts/user?userCode=${userCode}`)
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('atmAccountSelect');
            if (!select) return;
            select.innerHTML = data.map(acc =>
                `<option value="${acc.id}">${acc.accountType} — ${acc.accountNumber} (₹${acc.balance})</option>`
            ).join('');
        });
}

function atmDeposit() {
    const accountId = document.getElementById('atmAccountSelect').value;
    const amount = document.getElementById('atmAmount').value;
    const userCode = localStorage.getItem('userCode');
    const resultEl = document.getElementById('atmResult');
    const btn = document.getElementById('btn-atm-deposit');

    if (!amount || amount <= 0) { showToast('Please enter a valid amount', 'warning'); return; }

    setLoading(btn, true);
    resultEl.innerHTML = '<div class="loader" style="margin:0.5rem auto;width:20px;height:20px;border-width:2px;"></div>';

    fetch(`/accounts/atm/deposit?accountId=${accountId}&amount=${amount}&userCode=${userCode}`, { method: 'POST' })
        .then(res => res.text())
        .then(data => {
            setLoading(btn, false);
            resultEl.innerText = data;
            showToast(data, 'success');
            loadAccounts();
            loadATMAccounts();
        })
        .catch(() => { setLoading(btn, false); resultEl.innerText = 'Error'; showToast('Deposit failed', 'error'); });
}

function atmWithdraw() {
    const accountId = document.getElementById('atmAccountSelect').value;
    const amount = document.getElementById('atmAmount').value;
    const userCode = localStorage.getItem('userCode');
    const resultEl = document.getElementById('atmResult');
    const btn = document.getElementById('btn-atm-withdraw');

    if (!amount || amount <= 0) { showToast('Please enter a valid amount', 'warning'); return; }

    setLoading(btn, true);
    resultEl.innerHTML = '<div class="loader" style="margin:0.5rem auto;width:20px;height:20px;border-width:2px;"></div>';

    fetch(`/accounts/atm/withdraw?accountId=${accountId}&amount=${amount}&userCode=${userCode}`, { method: 'POST' })
        .then(res => res.text())
        .then(data => {
            setLoading(btn, false);
            resultEl.innerText = data;
            showToast(data, data.toLowerCase().includes('fail') || data.toLowerCase().includes('insufficient') ? 'error' : 'success');
            loadAccounts();
            loadATMAccounts();
        })
        .catch(() => { setLoading(btn, false); resultEl.innerText = 'Error'; showToast('Withdrawal failed', 'error'); });
}

// ─────────────────────────────────────────────────────────────
//  TRANSFER
// ─────────────────────────────────────────────────────────────

function loadTransferAccounts() {
    const userCode = localStorage.getItem('userCode');
    fetch(`/accounts/user?userCode=${userCode}`)
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('fromAccountSelect');
            if (!select) return;
            select.innerHTML = data.map(acc =>
                `<option value="${acc.id}">${acc.accountType} — ${acc.accountNumber} (₹${acc.balance})</option>`
            ).join('');
        });
}

function transferUI() {
    const fromAccountId = document.getElementById('fromAccountSelect').value;
    const toAccountId = document.getElementById('toAccountId').value;
    const amount = document.getElementById('transferAmount').value;
    const category = document.getElementById('category').value;
    const userCode = localStorage.getItem('userCode');
    const resultEl = document.getElementById('transferResult');
    const btn = document.getElementById('btn-transfer-submit');

    if (!toAccountId || !amount) { showToast('Please fill all transfer fields', 'warning'); return; }

    setLoading(btn, true);
    resultEl.innerText = '';

    fetch(`/accounts/transfer?fromAccountId=${fromAccountId}&toAccountId=${toAccountId}&amount=${amount}&userCode=${userCode}&category=${category}`, { method: 'POST' })
        .then(res => res.text())
        .then(data => {
            setLoading(btn, false);
            resultEl.innerText = data;
            const isOk = !data.toLowerCase().includes('fail') && !data.toLowerCase().includes('insufficient');
            showToast(data, isOk ? 'success' : 'error');
            loadAccounts();
        })
        .catch(() => { setLoading(btn, false); showToast('Transfer failed', 'error'); });
}

// ─────────────────────────────────────────────────────────────
//  TRANSACTIONS
// ─────────────────────────────────────────────────────────────

function loadTransactionAccounts() {
    const userCode = localStorage.getItem('userCode');
    fetch(`/accounts/user?userCode=${userCode}`)
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('txnAccountSelect');
            if (!select) return;
            select.innerHTML = data.map(acc =>
                `<option value="${acc.id}">${acc.accountType} — ${acc.accountNumber}</option>`
            ).join('');
        });
}

function loadLast15Transactions() {
    const accountId = document.getElementById('txnAccountSelect').value;
    const container = document.getElementById('txnResult');
    const btn = document.getElementById('btn-view-last15');

    setLoading(btn, true);
    showSkeleton('txnResult', 5);

    fetch(`/accounts/transactions?accountId=${accountId}`)
        .then(res => res.json())
        .then(data => {
            setLoading(btn, false);
            const last15 = data.slice(-15).reverse();

            if (!last15.length) {
                container.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>No transactions found.</p></div>`;
                return;
            }

            container.innerHTML = `
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>ID</th><th>Type</th><th>Category</th><th>Amount</th><th>Date</th></tr></thead>
                        <tbody>
            ${last15.map(t => {
                const isCredit = (t.type.includes('IN') && t.type !== 'INVESTMENT') || t.type.includes('DEPOSIT') || t.type.includes('DISBURSEMENT') || t.type.includes('RETURN');
                return `<tr>
                                    <td style="font-size:0.78rem;color:var(--text-muted);">${t.transactionId}</td>
                                    <td>${t.type}</td>
                                    <td><span class="badge badge-purple">${t.category || '—'}</span></td>
                                    <td><span class="${isCredit ? 'badge badge-success' : 'badge badge-danger'}">${isCredit ? '+' : '-'}₹${t.amount}</span></td>
                                    <td style="font-size:0.8rem;">${t.timestamp}</td>
                                </tr>`;
            }).join('')}
                        </tbody>
                    </table>
                </div>`;
        })
        .catch(() => { setLoading(btn, false); showToast('Failed to load transactions', 'error'); });
}

function searchById() {
    const txnId = document.getElementById('searchTxnId').value.trim();
    const btn = document.getElementById('btn-search-by-id');
    const container = document.getElementById('txnResult');

    if (!txnId) { showToast('Enter a Transaction ID', 'warning'); return; }

    setLoading(btn, true);
    showSkeleton('txnResult', 2);

    fetch(`/accounts/transactions/search/id?txnId=${txnId}`)
        .then(res => res.json())
        .then(data => {
            setLoading(btn, false);
            container.innerHTML = `<pre style="color:var(--text-secondary);font-size:0.85rem;padding:1rem;">${JSON.stringify(data, null, 2)}</pre>`;
        })
        .catch(() => { setLoading(btn, false); showToast('Search failed', 'error'); });
}

function searchByAmount() {
    const amount = document.getElementById('searchAmount').value;
    const btn = document.getElementById('btn-search-by-amount');
    const container = document.getElementById('txnResult');

    if (!amount) { showToast('Enter an amount', 'warning'); return; }

    setLoading(btn, true);
    showSkeleton('txnResult', 2);

    fetch(`/accounts/transactions/search/amount?amount=${amount}`)
        .then(res => res.json())
        .then(data => {
            setLoading(btn, false);
            container.innerHTML = `<pre style="color:var(--text-secondary);font-size:0.85rem;padding:1rem;">${JSON.stringify(data, null, 2)}</pre>`;
        })
        .catch(() => { setLoading(btn, false); showToast('Search failed', 'error'); });
}

function searchByDateRange() {
    const btn = document.getElementById('btn-search-by-date');
    setLoading(btn, true);
    setTimeout(() => {
        setLoading(btn, false);
        showToast('Date range search — backend endpoint coming soon', 'info');
    }, 400);
}

// ─────────────────────────────────────────────────────────────
//  LOANS
// ─────────────────────────────────────────────────────────────

function loadLoanAccounts() {
    const userCode = localStorage.getItem('userCode');
    fetch(`/accounts/user?userCode=${userCode}`)
        .then(res => res.json())
        .then(data => {
            const options = data.map(acc =>
                `<option value="${acc.id}">${acc.accountType} — ${acc.accountNumber} (₹${acc.balance})</option>`
            ).join('');

            const applySelect = document.getElementById('loanApplyAccountSelect');
            const paySelect = document.getElementById('loanPayAccountSelect');
            if (applySelect) applySelect.innerHTML = options;
            if (paySelect) paySelect.innerHTML = options;
        });
}

function applyLoan() {
    const amount = document.getElementById('loanAmount').value;
    const downPayment = document.getElementById('downPayment').value;
    const months = document.getElementById('loanMonths').value;
    const accountId = document.getElementById('loanApplyAccountSelect').value;
    const category = document.getElementById('loanCategory') ? document.getElementById('loanCategory').value : 'Personal';
    const userCode = localStorage.getItem('userCode');
    const btn = document.getElementById('btn-apply-loan');

    if (!amount || !downPayment || !months) { showToast('Please fill all loan fields', 'warning'); return; }

    setLoading(btn, true);

    fetch(`/loans/apply?userCode=${userCode}&amount=${amount}&downPayment=${downPayment}&months=${months}&accountId=${accountId}&category=${category}`, { method: 'POST' })
        .then(res => res.text())
        .then(data => {
            setLoading(btn, false);
            showToast(data, 'success');
            loadAccounts();
            loadLoans();
        })
        .catch(() => { setLoading(btn, false); showToast('Loan application failed', 'error'); });
}

function loadLoans() {
    const userCode = localStorage.getItem('userCode');
    const container = document.getElementById('loanResult');
    const btn = document.getElementById('btn-view-loans');

    if (btn) setLoading(btn, true);
    showSkeleton('loanResult', 3);

    fetch(`/loans/user?userCode=${userCode}`)
        .then(res => res.json())
        .then(data => {
            if (btn) setLoading(btn, false);

            if (!data || data.length === 0) {
                container.innerHTML = `<div class="empty-state"><div class="empty-icon">🏠</div><p>No active loans.</p></div>`;
                return;
            }

            container.innerHTML = `
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>ID</th><th>Category</th><th>Total Amount</th><th>Remaining</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody>
                            ${data.map(l => {
                                const isClosed = l.status === 'LOAN CLOSED';
                                return `
                                <tr>
                                    <td>${l.id}</td>
                                    <td><span class="badge badge-purple">${l.category || 'Personal'}</span></td>
                                    <td>₹${Number(l.totalAmount).toLocaleString('en-IN')}</td>
                                    <td>${isClosed ? '—' : '₹' + Number(l.remainingAmount).toLocaleString('en-IN')}</td>
                                    <td><span class="badge ${isClosed ? 'badge-success' : 'badge-amber'}">${isClosed ? 'CLOSED' : 'ACTIVE'}</span></td>
                                    <td>${!isClosed ? `<button class="btn btn-primary btn-sm" onclick="openLoanPayModal(${l.id})">💳 Pay</button>` : '—'}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>`;
        })
        .catch(() => { if (btn) setLoading(btn, false); showToast('Failed to load loans', 'error'); });
}

function openLoanPayModal(loanId) {
    document.getElementById('currentLoanId').value = loanId;
    document.getElementById('loanPayAmount').value = '';
    document.getElementById('loanPayModal').classList.remove('hidden');
}
function closeLoanPayModal() {
    document.getElementById('loanPayModal').classList.add('hidden');
}

function confirmLoanPay() {
    const loanId = document.getElementById('currentLoanId').value;
    const accountId = document.getElementById('loanPayAccountSelect').value;
    const amount = document.getElementById('loanPayAmount').value;
    const btn = document.getElementById('btn-pay-loan-confirm');

    if (!amount || amount <= 0) { showToast('Enter a valid repayment amount', 'warning'); return; }

    setLoading(btn, true);

    fetch(`/loans/pay?loanId=${loanId}&amount=${amount}&accountId=${accountId}`, { method: 'POST' })
        .then(res => res.text())
        .then(data => {
            setLoading(btn, false);
            closeLoanPayModal();
            showToast(data, 'success');
            loadLoans();
            loadAccounts();
        })
        .catch(() => { setLoading(btn, false); showToast('Loan payment failed', 'error'); });
}

// Legacy prompt-based version kept for compatibility
function payLoanUI(loanId) { openLoanPayModal(loanId); }

// ─────────────────────────────────────────────────────────────
//  CARDS
// ─────────────────────────────────────────────────────────────

function applyCard(type) {
    const userCode = localStorage.getItem('userCode');
    const btnId = type === 'DEBIT' ? 'btn-apply-debit' : 'btn-apply-credit';
    const btn = document.getElementById(btnId);

    setLoading(btn, true);

    fetch(`/cards/apply?userCode=${userCode}&type=${type}`, { method: 'POST' })
        .then(res => res.text())
        .then(data => {
            setLoading(btn, false);
            showToast(data, 'success');
            loadCards();
        })
        .catch(() => { setLoading(btn, false); showToast('Failed to apply for card', 'error'); });
}

function loadCards() {
    const userCode = localStorage.getItem('userCode');
    const container = document.getElementById('cardResult');
    const btn = document.getElementById('btn-view-cards');

    if (btn) setLoading(btn, true);
    container.innerHTML = '<div class="loader"></div>';

    fetch(`/cards/user?userCode=${userCode}`)
        .then(res => res.json())
        .then(data => {
            if (btn) setLoading(btn, false);

            if (!data || data.length === 0) {
                container.innerHTML = `<div class="empty-state"><div class="empty-icon">💳</div><p>No cards found. Apply above!</p></div>`;
                return;
            }

            container.innerHTML = `
                <div class="cards-grid">
                    ${data.map(c => {
                const isCredit = c.cardType === 'CREDIT';
                return `
                        <div class="visual-card ${isCredit ? 'credit' : 'debit'}">
                            <div class="card-circles"></div>
                            <span class="vc-type-badge">${c.cardType}</span>
                            <div class="vc-chip">💾</div>
                            <div class="vc-num">${c.cardNumber ? c.cardNumber.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}</div>
                            <div class="vc-row">
                                <div>
                                    <div class="vc-name">${c.nameOnCard || 'CARD HOLDER'}</div>
                                    <div style="font-size:0.7rem;color:rgba(255,255,255,0.5);margin-top:2px;">CVV: ${c.cvv}</div>
                                </div>
                                <div style="text-align:right;">
                                    <div class="vc-expiry-label">EXPIRES</div>
                                    <div class="vc-expiry">${c.expiry}</div>
                                </div>
                            </div>
                            <div class="vc-actions">
                                <button class="btn btn-danger btn-sm" onclick="deleteCard(${c.id})">✕ Cancel Card</button>
                            </div>
                        </div>`;
            }).join('')}
                </div>`;
        })
        .catch(() => { if (btn) setLoading(btn, false); showToast('Failed to load cards', 'error'); });
}

function deleteCard(cardId) {
    if (!confirm('Cancel this card? This cannot be undone.')) return;

    fetch(`/cards/delete?cardId=${cardId}`, { method: 'DELETE' })
        .then(res => res.text())
        .then(data => {
            showToast(data, 'info');
            loadCards();
        })
        .catch(() => showToast('Failed to cancel card', 'error'));
}

// ─────────────────────────────────────────────────────────────
//  INVESTMENTS
// ─────────────────────────────────────────────────────────────

const banks = [
    { name: 'HDFC Bank', rate: '12%', icon: '🏦', color: 'from-blue-deep' },
    { name: 'ICICI Bank', rate: '12%', icon: '🏛️', color: '' },
    { name: 'SBI', rate: '12%', icon: '🏦', color: '' },
    { name: 'Axis Bank', rate: '12%', icon: '⚡', color: '' },
    { name: 'Kotak Mahindra', rate: '12%', icon: '💎', color: '' },
    { name: 'IndusInd Bank', rate: '12%', icon: '🔷', color: '' },
    { name: 'Yes Bank', rate: '12%', icon: '✅', color: '' },
    { name: 'PNB', rate: '12%', icon: '🌐', color: '' },
    { name: 'Bank of Baroda', rate: '12%', icon: '🏆', color: '' },
    { name: 'Canara Bank', rate: '12%', icon: '🌿', color: '' },
    { name: 'Union Bank', rate: '12%', icon: '🤝', color: '' },
    { name: 'IDFC First', rate: '12%', icon: '🚀', color: '' },
    { name: 'AU Small Finance', rate: '12%', icon: '⭐', color: '' },
    { name: 'HSBC', rate: '12%', icon: '🌍', color: '' },
];

function loadInvestmentCards() {
    const container = document.getElementById('investmentCards');
    if (!container) return;

    container.innerHTML = banks.map(bank => `
        <div class="bank-invest-card">
            <div style="font-size:2rem;margin-bottom:0.5rem;">${bank.icon}</div>
            <div class="bank-name">${bank.name}</div>
            <div class="bank-rate">📈 ${bank.rate} p.a. returns</div>
            <button class="btn btn-primary btn-sm" style="width:100%;justify-content:center;" onclick="openInvestModal('${bank.name}')">Invest Now</button>
        </div>
    `).join('');
}

function openInvestModal(bankName) {
    document.getElementById('investModalTitle').innerText = `Invest in ${bankName}`;
    document.getElementById('investAmountInput').value = '';
    document.getElementById('investAmountInput').dataset.bank = bankName;

    // Load accounts into invest modal select
    getAccountOptions(accounts => {
        const select = document.getElementById('investAccountSelect');
        if (!select) return;
        select.innerHTML = accounts.map(acc =>
            `<option value="${acc.id}">${acc.accountType} — ${acc.accountNumber} (₹${acc.balance})</option>`
        ).join('');
    });

    document.getElementById('investModal').classList.remove('hidden');
}

function closeInvestModal() {
    document.getElementById('investModal').classList.add('hidden');
}

function confirmInvest() {
    const bank = document.getElementById('investAmountInput').dataset.bank;
    const accountId = document.getElementById('investAccountSelect').value;
    const amount = document.getElementById('investAmountInput').value;
    const userCode = localStorage.getItem('userCode');
    const btn = document.getElementById('btn-invest-confirm');

    if (!amount || amount <= 0) { showToast('Enter a valid investment amount', 'warning'); return; }

    setLoading(btn, true);

    fetch(`/investments/invest?userCode=${userCode}&name=${encodeURIComponent(bank)}&amount=${amount}&accountId=${accountId}`, { method: 'POST' })
        .then(res => res.text())
        .then(data => {
            setLoading(btn, false);
            closeInvestModal();
            showToast(data, 'success');
            loadAccounts();
            loadInvestments();
        })
        .catch(() => { setLoading(btn, false); showToast('Investment failed', 'error'); });
}

// Legacy compat
function openInvest(bank) { openInvestModal(bank); }

function loadInvestments() {
    const userCode = localStorage.getItem('userCode');
    const container = document.getElementById('invResult');
    if (!container) return;

    showSkeleton('invResult', 3);

    fetch(`/investments/user?userCode=${userCode}`)
        .then(res => res.json())
        .then(data => {
            if (!data || data.length === 0) {
                container.innerHTML = `<div class="empty-state"><div class="empty-icon">📈</div><p>No investments yet. Pick a bank above!</p></div>`;
                document.getElementById('totalInvested').innerText = '₹0';
                document.getElementById('totalProfit').innerText = '+₹0';
                return;
            }

            let totalInvested = 0, totalReturn = 0;
            data.forEach(i => {
                if (!i.withdrawn) {
                    totalInvested += i.amountInvested;
                    totalReturn += i.returnAmount;
                }
            });

            const profit = totalReturn - totalInvested;
            document.getElementById('totalInvested').innerText = `₹${totalInvested.toFixed(2)}`;
            document.getElementById('totalProfit').innerText = `+₹${profit.toFixed(2)}`;

            container.innerHTML = `
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>ID</th><th>Bank</th><th>Invested</th><th>Return</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody>
                            ${data.map(i => `
                                <tr>
                                    <td>${i.id}</td>
                                    <td><strong>${i.investmentName}</strong></td>
                                    <td>₹${i.amountInvested.toFixed(2)}</td>
                                    <td style="color:var(--accent-green);">₹${i.returnAmount.toFixed(2)}</td>
                                    <td><span class="badge ${i.withdrawn ? 'badge-danger' : 'badge-success'}">${i.withdrawn ? 'WITHDRAWN' : 'ACTIVE'}</span></td>
                                    <td>${!i.withdrawn ? `<button class="btn btn-ghost btn-sm" onclick="openWithdrawInvModal(${i.id})">↩ Withdraw</button>` : '—'}</td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>`;
        })
        .catch(() => { container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Failed to load investments.</p></div>`; });
}

function openWithdrawInvModal(investmentId) {
    document.getElementById('currentInvestmentId').value = investmentId;
    getAccountOptions(accounts => {
        const select = document.getElementById('withdrawInvAccountSelect');
        if (!select) return;
        select.innerHTML = accounts.map(acc =>
            `<option value="${acc.id}">${acc.accountType} — ${acc.accountNumber} (₹${acc.balance})</option>`
        ).join('');
    });
    document.getElementById('withdrawInvModal').classList.remove('hidden');
}

function closeWithdrawInvModal() {
    document.getElementById('withdrawInvModal').classList.add('hidden');
}

function confirmWithdrawInv() {
    const investmentId = document.getElementById('currentInvestmentId').value;
    const accountId = document.getElementById('withdrawInvAccountSelect').value;
    const btn = document.getElementById('btn-withdraw-inv-confirm');

    setLoading(btn, true);

    fetch(`/investments/withdraw?investmentId=${investmentId}&accountId=${accountId}`, { method: 'POST' })
        .then(res => res.text())
        .then(data => {
            setLoading(btn, false);
            closeWithdrawInvModal();
            showToast(data, 'success');
            loadAccounts();
            loadInvestments();
        })
        .catch(() => { setLoading(btn, false); showToast('Withdrawal failed', 'error'); });
}

// Legacy compat
function withdrawInvestmentUI(investmentId) { openWithdrawInvModal(investmentId); }

function getAccountOptions(callback) {
    const userCode = localStorage.getItem('userCode');
    fetch(`/accounts/user?userCode=${userCode}`)
        .then(res => res.json())
        .then(data => callback(data));
}

// ─────────────────────────────────────────────────────────────
//  ADMIN
// ─────────────────────────────────────────────────────────────

function loadUsers() {
    const container = document.getElementById('adminResult');
    const btn = document.getElementById('btn-view-users');

    setLoading(btn, true);
    showSkeleton('adminResult', 4);

    fetch('/users/all')
        .then(res => res.json())
        .then(data => {
            setLoading(btn, false);

            if (!data || data.length === 0) {
                container.innerHTML = `<div class="empty-state"><div class="empty-icon">👥</div><p>No users found.</p></div>`;
                return;
            }

            container.innerHTML = `
                <div class="sub-h3" style="margin-bottom:1rem;">All Users (${data.length})</div>
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>User Code</th><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
                        <tbody>
                            ${data.map(u => `
                                <tr>
                                    <td><span class="badge badge-info">${u.userCode}</span></td>
                                    <td>${u.name}</td>
                                    <td>${u.email}</td>
                                    <td><span class="badge badge-purple">${u.role}</span></td>
                                    <td><button class="btn btn-danger btn-sm" onclick="deleteUser(${u.id})">🗑 Delete</button></td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>`;
        })
        .catch(() => { setLoading(btn, false); showToast('Failed to load users', 'error'); });
}

function loadAllAccountsAdmin() {
    const container = document.getElementById('adminResult');
    const btn = document.getElementById('btn-view-accounts');

    setLoading(btn, true);
    showSkeleton('adminResult', 4);

    fetch('/accounts/all')
        .then(res => res.json())
        .then(data => {
            setLoading(btn, false);

            if (!data || data.length === 0) {
                container.innerHTML = `<div class="empty-state"><div class="empty-icon">🏛️</div><p>No accounts found.</p></div>`;
                return;
            }

            container.innerHTML = `
                <div class="sub-h3" style="margin-bottom:1rem;">All Accounts (${data.length})</div>
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>ID</th><th>Account Number</th><th>Type</th><th>Balance</th><th>User</th><th>Action</th></tr></thead>
                        <tbody>
                            ${data.map(acc => `
                                <tr>
                                    <td>${acc.id}</td>
                                    <td>${acc.accountNumber}</td>
                                    <td><span class="badge badge-info">${acc.accountType}</span></td>
                                    <td><strong>₹${Number(acc.balance).toLocaleString('en-IN')}</strong></td>
                                    <td><span class="badge badge-purple">${acc.userCode}</span></td>
                                    <td><button class="btn btn-danger btn-sm" onclick="deleteAccountAdmin(${acc.id})">🗑 Delete</button></td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>`;
        })
        .catch(() => { setLoading(btn, false); showToast('Failed to load accounts', 'error'); });
}

function updateBalance() {
    const accountId = document.getElementById('adminAccountId').value;
    const amount = document.getElementById('adminAmount').value;
    const btn = document.getElementById('btn-update-balance');

    if (!accountId || !amount) { showToast('Fill in Account ID and Amount', 'warning'); return; }

    setLoading(btn, true);

    fetch(`/accounts/admin/updateBalance?accountId=${accountId}&amount=${amount}`, { method: 'POST' })
        .then(res => res.text())
        .then(data => {
            setLoading(btn, false);
            showToast(data, 'success');
        })
        .catch(() => { setLoading(btn, false); showToast('Balance update failed', 'error'); });
}

function deleteUser(userId) {
    if (!confirm('Delete this user? This cannot be undone.')) return;

    fetch(`/users/delete?userId=${userId}`, { method: 'DELETE' })
        .then(res => res.text())
        .then(data => {
            showToast(data, 'info');
            loadUsers();
        })
        .catch(() => showToast('Failed to delete user', 'error'));
}

function deleteAccountAdmin(accountId) {
    if (!confirm('Delete this account?')) return;

    fetch(`/accounts/delete?accountId=${accountId}`, { method: 'DELETE' })
        .then(res => res.text())
        .then(data => {
            showToast(data, 'info');
            loadAllAccountsAdmin();
        })
        .catch(() => showToast('Failed to delete account', 'error'));
}

// ─────────────────────────────────────────────────────────────
//  COMMON
// ─────────────────────────────────────────────────────────────

function logout() {
    localStorage.removeItem('userCode');
    window.location.href = 'index.html';
}

function createAccount() {
    createAccountUI('SAVINGS');
}

function showLoader(id) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<div class="loader"></div>';
}