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
                localStorage.setItem("accountCode", data.userCode);
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

// ─────────────────────────────────────────────────────────────
//  REGISTRATION WIZARD — STEP NAVIGATION
// ─────────────────────────────────────────────────────────────

function regNext(step) {
    const msgEl = document.getElementById('message');
    msgEl.innerText = '';

    if (step === 1) {
        const firstName = document.getElementById('reg-firstName').value.trim();
        const lastName  = document.getElementById('reg-lastName').value.trim();
        const dob       = document.getElementById('reg-dob').value;
        const gender    = document.getElementById('reg-gender').value;

        if (!firstName) { msgEl.innerText = '⚠️ First Name is required.'; return; }
        if (!/^[A-Za-z\s'-]{1,50}$/.test(firstName)) { msgEl.innerText = '⚠️ First Name must contain only letters.'; return; }
        if (!lastName)  { msgEl.innerText = '⚠️ Last Name is required.'; return; }
        if (!/^[A-Za-z\s'-]{1,50}$/.test(lastName))  { msgEl.innerText = '⚠️ Last Name must contain only letters.'; return; }
        if (!dob)       { msgEl.innerText = '⚠️ Date of Birth is required.'; return; }
        const dobDate = new Date(dob);
        const today   = new Date();
        if (dobDate >= today) { msgEl.innerText = '⚠️ Date of Birth cannot be today or a future date.'; return; }
        const age = Math.floor((today - dobDate) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 18) { msgEl.innerText = `⚠️ You must be at least 18 years old to register. Your age: ${age}`; return; }
        if (!gender)    { msgEl.innerText = '⚠️ Please select your gender.'; return; }
    }

    if (step === 2) {
        const email   = document.getElementById('regEmail').value.trim();
        const phone   = document.getElementById('reg-phone').value.trim();
        const altPh   = document.getElementById('reg-altPhone').value.trim();
        const addr1   = document.getElementById('reg-addr1').value.trim();
        const city    = document.getElementById('reg-city').value.trim();
        const state   = document.getElementById('reg-state').value;
        const pincode = document.getElementById('reg-pincode').value.trim();

        if (!email)              { msgEl.innerText = '⚠️ Email address is required.'; return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msgEl.innerText = '⚠️ Please enter a valid email address.'; return; }
        if (!phone)              { msgEl.innerText = '⚠️ Mobile number is required.'; return; }
        if (!/^\d{10}$/.test(phone)) { msgEl.innerText = '⚠️ Mobile number must be exactly 10 digits.'; return; }
        if (altPh && !/^\d{10}$/.test(altPh)) { msgEl.innerText = '⚠️ Alternate phone must be exactly 10 digits.'; return; }
        if (altPh && altPh === phone) { msgEl.innerText = '⚠️ Alternate phone cannot be the same as primary mobile number.'; return; }
        if (!addr1)              { msgEl.innerText = '⚠️ Address Line 1 is required.'; return; }
        if (!city)               { msgEl.innerText = '⚠️ City is required.'; return; }
        if (!state)              { msgEl.innerText = '⚠️ Please select your state.'; return; }
        if (!pincode)            { msgEl.innerText = '⚠️ Pincode is required.'; return; }
        if (!/^\d{6}$/.test(pincode)) { msgEl.innerText = '⚠️ Pincode must be exactly 6 digits.'; return; }
    }

    if (step === 3) {
        const pan      = document.getElementById('reg-pan').value.trim().toUpperCase();
        const aadhar   = document.getElementById('reg-aadhar').value.trim();
        const occ      = document.getElementById('reg-occupation').value;
        const empType  = document.getElementById('reg-employmentType').value;
        const income   = document.getElementById('reg-income').value;

        if (!pan)   { msgEl.innerText = '⚠️ PAN number is required.'; return; }
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) { msgEl.innerText = '⚠️ Invalid PAN format. Expected: ABCDE1234F (5 letters, 4 digits, 1 letter).'; return; }
        if (!aadhar) { msgEl.innerText = '⚠️ Aadhar number is required.'; return; }
        if (!/^\d{12}$/.test(aadhar)) { msgEl.innerText = '⚠️ Aadhar number must be exactly 12 digits.'; return; }
        if (!occ)   { msgEl.innerText = '⚠️ Please select your occupation.'; return; }
        if (!empType) { msgEl.innerText = '⚠️ Please select employment type.'; return; }
        if (!income || Number(income) < 0) { msgEl.innerText = '⚠️ Annual income is required and cannot be negative.'; return; }
        if (Number(income) === 0 && (occ === 'SALARIED' || occ === 'BUSINESS')) {
            msgEl.innerText = '⚠️ Annual income cannot be ₹0 for Salaried or Business occupation.'; return;
        }
        // Set PAN to uppercase
        document.getElementById('reg-pan').value = pan;
    }

    // Advance to next step
    document.getElementById(`reg-panel-${step}`).classList.add('hidden');
    document.getElementById(`reg-panel-${step + 1}`).classList.remove('hidden');
    regSetStep(step + 1);
    msgEl.innerText = '';
    // Scroll modal to top
    const mc = document.querySelector('.modal-card');
    if (mc) mc.scrollTop = 0;
}

function regBack(step) {
    document.getElementById(`reg-panel-${step}`).classList.add('hidden');
    document.getElementById(`reg-panel-${step - 1}`).classList.remove('hidden');
    regSetStep(step - 1);
    document.getElementById('message').innerText = '';
    const mc = document.querySelector('.modal-card');
    if (mc) mc.scrollTop = 0;
}

function regSetStep(active) {
    for (let i = 1; i <= 4; i++) {
        const dot = document.getElementById(`reg-step-dot-${i}`);
        if (!dot) continue;
        dot.classList.toggle('active', i === active);
        dot.classList.toggle('done', i < active);
    }
}

function toggleEmployer() {
    const occ = document.getElementById('reg-occupation').value;
    const row = document.getElementById('employerRow');
    if (!row) return;
    const needsEmployer = ['SALARIED', 'BUSINESS', 'SELF_EMPLOYED'].includes(occ);
    row.style.display = needsEmployer ? 'flex' : 'none';
    row.querySelector('input').placeholder = occ === 'BUSINESS'
        ? 'Business / Company Name *'
        : occ === 'SELF_EMPLOYED'
            ? 'Organisation / Client Name (optional)'
            : 'Employer Name *';
}

function updatePwdStrength() {
    const pwd = document.getElementById('regPassword').value;
    const fill  = document.getElementById('pwd-strength-fill');
    const label = document.getElementById('pwd-strength-label');
    if (!fill || !label) return;

    let score = 0;
    if (pwd.length >= 8)              score++;
    if (pwd.length >= 12)             score++;
    if (/[A-Z]/.test(pwd))           score++;
    if (/[0-9]/.test(pwd))           score++;
    if (/[^A-Za-z0-9]/.test(pwd))   score++;

    const levels = [
        { pct: '0%',   color: 'transparent',                        text: '' },
        { pct: '25%',  color: '#ef4444',                             text: '🔴 Very Weak' },
        { pct: '50%',  color: '#f97316',                             text: '🟠 Weak' },
        { pct: '65%',  color: '#eab308',                             text: '🟡 Fair' },
        { pct: '82%',  color: '#22c55e',                             text: '🟢 Strong' },
        { pct: '100%', color: '#16a34a',                             text: '💚 Very Strong' }
    ];
    const lvl = levels[score] || levels[0];
    fill.style.width           = lvl.pct;
    fill.style.backgroundColor = lvl.color;
    label.innerText            = lvl.text;
}

// ─────────────────────────────────────────────────────────────
//  REGISTER — Final Submit (Step 4)
// ─────────────────────────────────────────────────────────────
function register() {
    const msgEl = document.getElementById('message');
    const btn   = document.getElementById('btn-register-submit');

    // ── Step 4 validations ────────────────────────────────────
    const nomineeName     = document.getElementById('reg-nomineeName').value.trim();
    const nomineeRelation = document.getElementById('reg-nomineeRelation').value;
    const nomineeDob      = document.getElementById('reg-nomineeDob').value;
    const nomineePhone    = document.getElementById('reg-nomineePhone').value.trim();
    const secQ            = document.getElementById('reg-secQ').value;
    const secA            = document.getElementById('reg-secA').value.trim();
    const password        = document.getElementById('regPassword').value;
    const confirmPwd      = document.getElementById('reg-confirmPassword').value;
    const termsAccepted   = document.getElementById('reg-terms').checked;
    const marketing       = document.getElementById('reg-marketing').checked;

    if (!nomineeName)     { msgEl.innerText = '⚠️ Nominee full name is required.'; return; }
    if (!nomineeRelation) { msgEl.innerText = '⚠️ Please select nominee relationship.'; return; }
    if (!nomineeDob)      { msgEl.innerText = '⚠️ Nominee date of birth is required.'; return; }
    if (nomineePhone && !/^\d{10}$/.test(nomineePhone)) { msgEl.innerText = '⚠️ Nominee phone must be exactly 10 digits.'; return; }
    if (!secQ)            { msgEl.innerText = '⚠️ Please select a security question.'; return; }
    if (!secA)            { msgEl.innerText = '⚠️ Security answer is required.'; return; }
    if (!password)        { msgEl.innerText = '⚠️ Password is required.'; return; }
    if (password.length < 8) { msgEl.innerText = '⚠️ Password must be at least 8 characters long.'; return; }
    if (!/[A-Z]/.test(password)) { msgEl.innerText = '⚠️ Password must contain at least one uppercase letter.'; return; }
    if (!/[0-9]/.test(password)) { msgEl.innerText = '⚠️ Password must contain at least one number.'; return; }
    if (password !== confirmPwd) { msgEl.innerText = '⚠️ Passwords do not match. Please re-enter.'; return; }
    if (!termsAccepted)   { msgEl.innerText = '⚠️ You must accept the Terms & Conditions to continue.'; return; }

    // ── Collect all fields ────────────────────────────────────
    const payload = {
        firstName:           document.getElementById('reg-firstName').value.trim(),
        lastName:            document.getElementById('reg-lastName').value.trim(),
        dateOfBirth:         document.getElementById('reg-dob').value,
        gender:              document.getElementById('reg-gender').value,
        nationality:         document.getElementById('reg-nationality').value,
        email:               document.getElementById('regEmail').value.trim(),
        phone:               document.getElementById('reg-phone').value.trim(),
        alternatePhone:      document.getElementById('reg-altPhone').value.trim() || null,
        addressLine1:        document.getElementById('reg-addr1').value.trim(),
        addressLine2:        document.getElementById('reg-addr2').value.trim() || null,
        city:                document.getElementById('reg-city').value.trim(),
        state:               document.getElementById('reg-state').value,
        pincode:             document.getElementById('reg-pincode').value.trim(),
        country:             document.getElementById('reg-country').value,
        panNumber:           document.getElementById('reg-pan').value.trim().toUpperCase(),
        aadharNumber:        document.getElementById('reg-aadhar').value.trim(),
        occupation:          document.getElementById('reg-occupation').value,
        employerName:        document.getElementById('reg-employer').value.trim() || null,
        employmentType:      document.getElementById('reg-employmentType').value,
        annualIncome:        Number(document.getElementById('reg-income').value) || 0,
        preferredAccountType: document.getElementById('reg-acctType').value,
        nomineeName,
        nomineeRelation,
        nomineeDob,
        nomineePhone:        nomineePhone || null,
        securityQuestion:    secQ,
        securityAnswer:      secA,
        password,
        termsAccepted,
        marketingConsent:    marketing
    };

    setLoading(btn, true);
    msgEl.innerText = '';

    fetch('/users/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        setLoading(btn, false);
        if (data.status === 'success') {
            showToast('🎉 ' + data.message, 'success');
            // Auto-login
            fetch('/users/login', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email: payload.email, password: payload.password })
            })
            .then(r => r.json())
            .then(loginData => {
                if (loginData.userCode) {
                    localStorage.setItem('userCode', loginData.userCode);
                    localStorage.setItem('accountCode', loginData.userCode);
                    window.location.href = 'dashboard.html';
                } else {
                    msgEl.innerText = '✅ Account created! Please sign in.';
                    switchTab('login');
                }
            })
            .catch(() => { msgEl.innerText = '✅ Account created! Please sign in.'; switchTab('login'); });
        } else {
            // Backend validation error — highlight with field info if present
            const fieldHint = data.field ? ` (Field: ${data.field})` : '';
            msgEl.innerText = '❌ ' + data.message + fieldHint;
        }
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
        loadFDAccounts();
        loadFDs();
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

    // 🔥 FIXED PART
    if (sectionId === "fd") {
        console.log("FD section opened");
        loadFDAccounts();
        loadFDs();
    }
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
        .then(res => res.json())
        .then(data => {
            setLoading(btn, false);

            // 🔥 Extract account ID
            const accountId = data.id || data.accountId;

            showToast(`Account created successfully! ID: ${accountId}`, 'success');

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
//------------------------INVESTMENTS------------------------//
const banks = [
    { name: 'HDFC Bank', icon: '🏦' },
    { name: 'ICICI Bank', icon: '🏛️' },
    { name: 'SBI', icon: '🏦' },
    { name: 'Axis Bank', icon: '⚡' },
    { name: 'Kotak Mahindra', icon: '💎' },
    { name: 'IndusInd Bank', icon: '🔷' },
    { name: 'Yes Bank', icon: '✅' },
    { name: 'PNB', icon: '🌐' },
    { name: 'Bank of Baroda', icon: '🏆' },
    { name: 'Canara Bank', icon: '🌿' }
];

let selectedBank = null;
let selectedReturn = null;

function openGraph(bank, returnVal) {
    selectedBank = bank;
    selectedReturn = returnVal;

    console.log("Selected:", selectedBank, selectedReturn); // DEBUG

    document.getElementById('graphTitle').innerText = bank;
    document.getElementById('currentReturn').innerText = returnVal + "%";

    const data = generateGraphData();
    const ctx = document.getElementById('bankChart').getContext('2d');

    if (window.chart) window.chart.destroy();

    window.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 10}, (_, i) => i + 1),
            datasets: [{
                data: data,
                borderWidth: 2,
                tension: 0.4
            }]
        }
    });

    document.getElementById('graphModal').classList.remove('hidden');
}

function closeGraphModal() {
    document.getElementById('graphModal').classList.add('hidden');
}

function openInvestFromGraph() {

    if (!selectedBank || selectedReturn === null) {
        alert("Error: No bank selected");
        return;
    }

    closeGraphModal();

    openInvestModal(selectedBank, selectedReturn);

    document.getElementById('dynamicReturnText').innerText =
        `Live return: ${selectedReturn}%`;
}

function triggerMarketCrash() {
    alert("💥 MARKET CRASH!");
    loadInvestmentCards();
}

let risky = false;

function generateRandomReturn() {
    if (risky) return (Math.random() * 35 - 10).toFixed(2); // -10 to +25
    return (Math.random() * 20 - 5).toFixed(2); // -5 to +15
}

function toggleMarketMode() {
    risky = !risky;
    alert(risky ? "⚡ Risk Mode ON" : "🛡 Safe Mode ON");
    loadInvestmentCards();
}



// 📊 RANDOM GRAPH DATA
function generateGraphData() {
    let data = [];
    let value = 100;

    for (let i = 0; i < 10; i++) {
        value += Math.random() * 10 - 5;
        data.push(value.toFixed(2));
    }
    return data;
}

function getAccountOptions(callback) {
    const userCode = localStorage.getItem('userCode');

    fetch(`/accounts/user?userCode=${userCode}`)
        .then(res => res.json())
        .then(data => {
            console.log("Accounts loaded:", data); // debug
            callback(data);
        })
        .catch(() => {
            showToast('Failed to load accounts', 'error');
        });
}

function loadInvestmentCards() {
    const container = document.getElementById('investmentCards');

    container.innerHTML = banks.map(bank => {
        const r = parseFloat(generateRandomReturn());
        const cls = r > 5 ? 'positive' : r < 0 ? 'negative' : 'neutral';

        return `
        <div class="bank-invest-card" onclick="openGraph('${bank.name}', ${r})">
            <div style="font-size:2rem;">${bank.icon}</div>
            <div class="bank-name">${bank.name}</div>
            <div class="bank-return ${cls}">${r}%</div>
        </div>`;
    }).join('');
}

function loadInvestments() {
    const userCode = localStorage.getItem('userCode');
    const container = document.getElementById('invResult');

    if (!container) return;

    fetch(`/investments/user?userCode=${userCode}`)
        .then(res => res.json())
        .then(data => {

            console.log("Investments:", data); // DEBUG

            if (!data || data.length === 0) {
                container.innerHTML = `<p>No investments yet</p>`;
                document.getElementById('totalInvested').innerText = '₹0';
                document.getElementById('totalProfit').innerText = '₹0';
                return;
            }

            let totalInvested = 0;
            let totalReturn = 0;

            data.forEach(i => {
                if (!i.withdrawn) {
                    totalInvested += i.amountInvested;
                    totalReturn += i.returnAmount;
                }
            });

            const profit = totalReturn - totalInvested;

// ✅ format to 2 decimal places
            const formattedProfit = profit.toFixed(2);

// ✅ select element
            const profitElement = document.getElementById('totalProfit');

// ✅ update value
            profitElement.innerText = `₹${formattedProfit}`;

// ✅ apply color
            if (profit > 0) {
                profitElement.style.color = "#22c55e"; // green
            } else if (profit < 0) {
                profitElement.style.color = "#ef4444"; // red
            } else {
                profitElement.style.color = "#ffffff"; // neutral
            }

            document.getElementById('totalInvested').innerText = `₹${totalInvested}`;
            document.getElementById('totalProfit').innerText = `₹${profit}`;

            container.innerHTML = `
                <table style="width:100%;margin-top:10px;">
                    <tr>
                        <th>ID</th>
                        <th>Bank</th>
                        <th>Invested</th>
                        <th>Return</th>
                        <th>Status</th>
                    </tr>
                    ${data.map(i => `
<tr>
    <td>${i.id}</td>
    <td>${i.investmentName}</td>
    <td>₹${i.amountInvested.toFixed(2)}</td>

    <td style="color:${i.returnAmount > i.amountInvested ? '#22c55e' : '#ef4444'}">
        ₹${i.returnAmount.toFixed(2)}
    </td>

   <td>
    <span style="color:${i.withdrawn ? '#ef4444' : '#22c55e'}">
        ${i.withdrawn ? 'Closed' : 'Active'}
    </span>
</td>

    <td>
        ${!i.withdrawn ? `
    <button class="btn btn-sm btn-primary"
        onclick="openWithdrawModal(${i.id})">
        Withdraw
    </button>
` : '—'}
    </td>
</tr>
`).join('')}
                </table>
            `;
        })
        .catch(() => {
            container.innerHTML = `<p>Error loading investments</p>`;
        });
}



// 🔥 UPDATED MODAL
function openInvestModal(bankName, returnPercent) {
    document.getElementById('investModalTitle').innerText =
        `Invest in ${bankName} (${returnPercent}%)`;

    document.getElementById('investAmountInput').value = '';
    document.getElementById('investAmountInput').dataset.bank = bankName;
    document.getElementById('investAmountInput').dataset.return = returnPercent;

    getAccountOptions(accounts => {
        const select = document.getElementById('investAccountSelect');
        if (!select) return;
        select.innerHTML = accounts.map(acc =>
            `<option value="${acc.id}">${acc.accountType} — ${acc.accountNumber} (₹${acc.balance})</option>`
        ).join('');
    });

    document.getElementById('investModal').classList.remove('hidden');
}

function confirmInvest() {
    const bank = document.getElementById('investAmountInput').dataset.bank;
    const returnPercent = document.getElementById('investAmountInput').dataset.return;
    const accountId = document.getElementById('investAccountSelect').value;
    const amount = document.getElementById('investAmountInput').value;
    const userCode = localStorage.getItem('userCode');
    const btn = document.getElementById('btn-invest-confirm');

    if (!amount || amount <= 0) {
        alert('Enter valid amount');
        return;
    }

    btn.innerText = "Processing...";
    btn.disabled = true;

    fetch(`/investments/invest?userCode=${userCode}&name=${encodeURIComponent(bank)}&amount=${amount}&accountId=${accountId}&returnPercent=${returnPercent}`, {
        method: 'POST'
    })
        .then(res => res.text())
        .then(data => {

            console.log("Response:", data); // DEBUG

            alert(data); // ✅ SHOW SUCCESS MESSAGE

            closeInvestModal(); // ✅ CLOSE MODAL

            // 🔥 IMPORTANT: FORCE REFRESH
            setTimeout(() => {
                loadAccounts();
                loadInvestments();
            }, 500);

        })
        .catch(err => {
            console.error(err);
            alert('Investment failed');
        })
        .finally(() => {
            btn.innerText = "Confirm Investment →";
            btn.disabled = false;
        });
}

function closeInvestModal() {
    document.getElementById('investModal').classList.add('hidden');
}

// 🔽 ADD THIS AT THE END OF FILE
document.addEventListener("DOMContentLoaded", () => {
    loadInvestmentCards();
    loadInvestments();
});

function confirmWithdraw() {
    const accountId = document.getElementById('withdrawAccountSelect').value;
    const btn = document.querySelector('#withdrawModal .btn-modal-submit');

    // 🔥 Prevent double click
    if (btn.disabled) return;

    // 🔥 Loading UI
    btn.innerText = "Processing...";
    btn.disabled = true;

    fetch(`/investments/withdraw?investmentId=${selectedInvestmentId}&accountId=${accountId}`, {
        method: 'POST'
    })
        .then(res => res.text())
        .then(data => {

            // 🔥 ADD DELAY HERE
            setTimeout(() => {

                showToast(data, 'success');

                closeWithdrawModal();

                loadAccounts();
                loadInvestments();

            }, 400); // smooth UX delay

        })
        .catch(err => {
            console.error(err);

            // ❌ ERROR TOAST
            showToast('Withdrawal failed', 'error');
        })
        .finally(() => {
            btn.innerText = "Confirm Withdraw →";
            btn.disabled = false;
        });
}

let selectedInvestmentId = null;

function openWithdrawModal(investmentId) {
    selectedInvestmentId = investmentId;

    getAccountOptions(accounts => {
        const select = document.getElementById('withdrawAccountSelect');

        select.innerHTML = accounts.map(acc =>
            `<option value="${acc.id}">
                ${acc.accountType} — ${acc.accountNumber} (₹${acc.balance})
            </option>`
        ).join('');
    });

    document.getElementById('withdrawModal').classList.remove('hidden');
}

function closeWithdrawModal() {
    document.getElementById('withdrawModal').classList.add('hidden');
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

async function loadFDAccounts() {
    try {
        const accountCode = localStorage.getItem("accountCode");

        console.log("AccountCode:", accountCode);

        const res = await fetch(`/accounts/user?userCode=${accountCode}`);

        const accounts = await res.json();

        console.log("Accounts:", accounts);

        const select = document.getElementById("fdAccountSelect");

        // 🔥 CLEAR FIRST
        select.innerHTML = '<option value="">Select Account</option>';

        accounts.forEach(acc => {
            select.innerHTML += `
                <option value="${acc.id}">
                    ID: ${acc.id} | ${acc.accountType} | ₹${Math.round(acc.balance)}
                </option>
            `;
        });

    } catch (err) {
        console.error("Error loading accounts:", err);
    }
}

async function loadFDs() {
    const accountCode = localStorage.getItem("accountCode");

    const res = await fetch(`/fd/account/${accountCode}`);
    const data = await res.json();

    const container = document.getElementById("fdList");
    container.innerHTML = "";

    data.forEach(fd => {

        const withdrawBtn = fd.status === "MATURED"
            ? `<button class="btn btn-success" onclick="withdrawFD(${fd.id})">Withdraw</button>`
            : `<button class="btn btn-ghost" disabled>Locked</button>`;

        container.innerHTML += `
<div class="fd-card">

    <div class="fd-header">
        <h3>FD #${fd.id}</h3>
        <div class="fd-status ${getStatusClass(fd.status)}">
            ${fd.status}
        </div>
    </div>

    <div class="fd-body">

        <div class="fd-row">
            <span>Account</span>
            <span>${fd.accountId}</span>
        </div>

        <div class="fd-row highlight">
            <span>Amount</span>
            <span>₹${fd.amount}</span>
        </div>

        <div class="fd-row">
            <span>Interest</span>
            <span>${fd.interestRate}%</span>
        </div>

        <div class="fd-row">
            <span>Duration</span>
            <span>${fd.durationMonths} months</span>
        </div>

        <div class="fd-row highlight-green">
            <span>Maturity</span>
            <span>₹${fd.maturityAmount}</span>
        </div>

    </div>

   <div class="fd-actions">
    <button class="btn btn-primary" onclick='viewBond(${JSON.stringify(fd)})'>
        View Bond
    </button>

    ${
            fd.status === "MATURED"
                ? `<button class="btn btn-success" onclick="withdrawFD(${fd.id})">Withdraw</button>`
                : fd.status === "CLOSED"
                    ? `<button class="btn btn-danger" disabled>Closed</button>`
                    : `<button class="btn btn-ghost" disabled>Locked</button>`
        }
</div>

</div>
`;
    });
}

async function createFDUI() {
    try {
        const accountCode = localStorage.getItem("accountCode");
        const accountId = document.getElementById("fdAccountSelect").value;
        const amount = document.getElementById("fdAmount").value;
        const months = document.getElementById("fdMonths").value;

        if (!accountCode || !accountId || !amount || !months) {
            alert("Fill all fields");
            return;
        }

        const res = await fetch(`/fd/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                accountCode,
                accountId: Number(accountId),
                amount: Number(amount),
                months: Number(months)
            })
        });

        const data = await res.json();

        document.getElementById("fdResult").innerText =
            "FD Created! ID: " + data.id;

        loadFDs();

    } catch (err) {
        console.error(err);
    }
}

function viewBond(fd) {

    // 🔥 Status styling
    const statusClass =
        fd.status === "MATURED" ? "status-green" :
            fd.status === "CLOSED" ? "status-red" :
                "status-yellow";

    const statusIcon =
        fd.status === "MATURED" ? "🟢" :
            fd.status === "CLOSED" ? "🔴" :
                "🟡";

    const statusHTML = `
        <span class="status ${statusClass}">
            ${statusIcon} ${fd.status}
        </span>
    `;

    // 💎 Bond content
    const content = `
        <div class="bond-row">
            <span>Account Code</span>
            <span>${fd.accountCode}</span>
        </div>

        <div class="bond-row">
            <span>Account ID</span>
            <span>${fd.accountId}</span>
        </div>

        <hr>

        <div class="bond-row">
            <span>Amount</span>
            <span>₹${fd.amount}</span>
        </div>

        <div class="bond-row">
            <span>Interest Rate</span>
            <span>${fd.interestRate}%</span>
        </div>

        <div class="bond-row">
            <span>Duration</span>
            <span>${fd.durationMonths} months</span>
        </div>

        <div class="bond-row">
            <span>Start Date</span>
            <span>${fd.startDate}</span>
        </div>

        <div class="bond-row">
            <span>Maturity Date</span>
            <span>${fd.maturityDate}</span>
        </div>

        <div class="bond-highlight">
            💰 Maturity Amount: ₹${fd.maturityAmount}
        </div>

        <div class="bond-row" style="margin-top:10px;">
            <span>Status</span>
            ${statusHTML}
        </div>
    `;

    document.getElementById("bondContent").innerHTML = content;
    document.getElementById("bondModal").classList.remove("hidden");
}

async function forceMatureFD() {
    const fdId = document.getElementById("adminFdId").value;

    if (!fdId) {
        alert("Enter FD ID");
        return;
    }

    try {
        const res = await fetch(`/fd/admin/mature/${fdId}`, {
            method: "POST"
        });

        const data = await res.json();

        document.getElementById("adminResult").innerHTML =
            `<div class="account-card">✅ FD ${data.id} matured successfully</div>`;

    } catch (err) {
        console.error(err);
        alert("Error maturing FD");
    }
}

async function loadAllFDs() {
    try {
        const res = await fetch(`/fd/all`) // or create separate API
        const data = await res.json();

        const container = document.getElementById("adminResult");
        container.innerHTML = "";

        data.forEach(fd => {
            container.innerHTML += `
                <div class="account-card">
                    <p><b>FD ID:</b> ${fd.id}</p>
                    <p><b>Account:</b> ${fd.accountId}</p>
                    <p><b>Amount:</b> ₹${fd.amount}</p>
                    <p><b>Status:</b> ${fd.status}</p>
                </div>
            `;
        });

    } catch (err) {
        console.error(err);
    }
}

async function withdrawFD(fdId) {
    const res = await fetch(`/fd/withdraw/${fdId}`, {
        method: "POST"
    });

    const data = await res.text();
    alert("Withdrawn ₹" + data);

    loadFDs();
}

function closeBond() {
    document.getElementById("bondModal").classList.add("hidden");
}

function getStatusClass(status) {
    if (status === "MATURED") return "status-green";
    if (status === "CLOSED") return "status-red";
    return "status-yellow";
}