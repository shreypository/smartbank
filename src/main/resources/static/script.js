function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    })
        .then(res => res.json()) // 🔥 backend should return user object
        .then(data => {
            if (data.userCode) {

                // 🔥 STORE USER CODE
                localStorage.setItem("userCode", data.userCode);

                window.location.href = "dashboard.html";
            } else {
                document.getElementById("message").innerText = "Invalid login";
            }
        })
        .catch(err => console.error(err));
}

// 🔥 UNIVERSAL RESPONSE HANDLER
function handleResponse(res) {
    return res.text().then(data => {
        try {
            return JSON.parse(data);
        } catch {
            return data;
        }
    });
}

function register() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    fetch("/users/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            email: email,
            password: password,
            role: "USER"
        })
    })
        .then(res => res.text()) // 🔥 FIX HERE
        .then(data => {
            document.getElementById("message").innerText = data;
        })
        .catch(err => console.error(err));
}

function createAccount() {
    const userCode = localStorage.getItem("userCode");

    fetch(`/accounts/create?userCode=${userCode}&accountType=SAVINGS`, {
        method: "POST"
    })
        .then(handleResponse)
        .then(data => {
            document.getElementById("result").innerText =
                typeof data === "string" ? data : JSON.stringify(data, null, 2);
        });
}

function deposit() {
    const accountId = document.getElementById("accountId").value;
    const amount = document.getElementById("amount").value;
    const userCode = localStorage.getItem("userCode");

    fetch(`/accounts/deposit?accountId=${accountId}&amount=${amount}&userCode=${userCode}`, {
        method: "POST"
    })
        .then(handleResponse)
        .then(data => {
            document.getElementById("result").innerText =
                typeof data === "string" ? data : JSON.stringify(data, null, 2);
        });
}

function withdraw() {
    const accountId = document.getElementById("accountId").value;
    const amount = document.getElementById("amount").value;
    const userCode = localStorage.getItem("userCode");

    fetch(`/accounts/withdraw?accountId=${accountId}&amount=${amount}&userCode=${userCode}`, {
        method: "POST"
    })
        .then(handleResponse)
        .then(data => {
            document.getElementById("result").innerText =
                typeof data === "string" ? data : JSON.stringify(data, null, 2);
        });
}

function transfer() {
    const accountId = document.getElementById("accountId").value;
    const toAccountId = document.getElementById("toAccountId").value;
    const amount = document.getElementById("amount").value;
    const userCode = localStorage.getItem("userCode");

    fetch(`/accounts/transfer?fromAccountId=${accountId}&toAccountId=${toAccountId}&amount=${amount}&userCode=${userCode}`, {
        method: "POST"
    })
        .then(handleResponse)
        .then(data => {
            document.getElementById("result").innerText = data;
        });
}

function getTransactions() {
    const accountId = document.getElementById("accountId").value;

    fetch(`/accounts/transactions?accountId=${accountId}`)
        .then(handleResponse)
        .then(data => {
            document.getElementById("result").innerText =
                typeof data === "string" ? data : JSON.stringify(data, null, 2);
        })
        .catch(err => console.error(err));
}

function openModal(type) {
    document.getElementById("modal").classList.remove("hidden");

    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("adminForm").classList.add("hidden");

    if (type === "login") {
        document.getElementById("loginForm").classList.remove("hidden");
    } else if (type === "register") {
        document.getElementById("registerForm").classList.remove("hidden");
    } else {
        document.getElementById("adminForm").classList.remove("hidden");
    }
}

function closeModal() {
    document.getElementById("modal").classList.add("hidden");
}

// 🔥 ADMIN LOGIN
function adminLogin() {
    const user = document.getElementById("adminUser").value;
    const pass = document.getElementById("adminPass").value;

    if (user === "admin" && pass === "admin") {
        window.location.href = "admin.html";
    } else {
        document.getElementById("message").innerText = "Invalid admin credentials";
    }
}

// 🔥 SHOW USER CODE
window.onload = function () {
    const userCode = localStorage.getItem("userCode");

    if (userCode) {
        document.getElementById("userCodeDisplay").innerText = userCode;
        loadAccounts();
        loadTransactionAccounts();// 🔥 NEW LINE (IMPORTANT)
        loadATMAccounts();
        loadTransferAccounts();
        loadLoanAccounts();
        loadInvestmentCards();
        loadInvestments();
    }
};

// 🔥 SECTION SWITCHING
function showSection(sectionId) {
    const sections = document.querySelectorAll(".section");
    sections.forEach(sec => sec.classList.add("hidden"));

    document.getElementById(sectionId).classList.remove("hidden");
}

function loadAccounts() {
    const userCode = localStorage.getItem("userCode");

    fetch(`/accounts/user?userCode=${userCode}`)
        .then(res => res.json())
        .then(data => {

            const container = document.getElementById("accountList");

            if (!data || data.length === 0) {
                container.innerHTML = "<p>No accounts created yet</p>";
                return;
            }

            container.innerHTML = `
<h3>Your Accounts</h3>
<div id="transferAccountsView"></div>
<table border="1" width="100%">
    <tr>
        <th>Account ID</th>
        <th>Account Type</th>
        <th>Account Number</th>
        <th>Balance</th>
        <th>Actions</th>
    </tr>
    ${data.map(acc => `
    <tr>
        <td>${acc.id}</td>
        <td>${acc.accountType}</td>
        <td>${acc.accountNumber}</td>
        <td>&#8377;${acc.balance}</td>
        <td>
            <button onclick="viewTransactions(${acc.id})">View</button>
            <button onclick="deleteAccount(${acc.id})">Delete</button>
        </td>
    </tr>
    `).join("")}
</table>
`;
        });
}

function createAccountUI(type) {
    const userCode = localStorage.getItem("userCode");

    fetch(`/accounts/create?userCode=${userCode}&accountType=${type}`, {
        method: "POST"
    })
        .then(res => res.text())
        .then(data => {
            alert(data);
            loadAccounts();
        });
}

function viewTransactions(accountId) {

    document.getElementById("atmAccountId").value = accountId;

    fetch(`/accounts/transactions?accountId=${accountId}`)
        .then(res => res.json())
        .then(data => {

            const container = document.getElementById("txnContainer");

            if (!data || data.length === 0) {
                container.innerHTML = "<p>No transactions found</p>";
                return;
            }

            // 🔥 last 10 transactions
            const last10 = data.slice(-10).reverse();

            container.innerHTML = `
            <h3>Transactions</h3>
            <table border="1" width="100%">
                <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                </tr>
                ${last10.map(t => {

                const isCredit =
                    t.type.includes("DEPOSIT") ||
                    t.type.includes("IN");

                const color = isCredit ? "green" : "red";
                const sign = isCredit ? "+" : "-";

                return `
                    <tr>
                        <td>${t.type}</td>
                        <td style="color:${color}; font-weight:bold;">
                            ${sign}&#8377;${t.amount}
                        </td>
                        <td>${t.timestamp}</td>
                    </tr>
                    `;
            }).join("")}
            </table>
            `;
        });
}

function transferUI() {
    const fromAccountId = document.getElementById("fromAccountSelect").value;
    const toAccountId = document.getElementById("toAccountId").value;
    const amount = document.getElementById("transferAmount").value;
    const category = document.getElementById("category").value;
    const userCode = localStorage.getItem("userCode");

    fetch(`/accounts/transfer?fromAccountId=${fromAccountId}&toAccountId=${toAccountId}&amount=${amount}&userCode=${userCode}&category=${category}`, {
        method: "POST"
    })
        .then(res => res.text())
        .then(data => {
            document.getElementById("transferResult").innerText = data;
            loadAccounts(); // 🔥 refresh balances
        });
}

function searchById() {
    const txnId = document.getElementById("searchTxnId").value;

    fetch(`/accounts/transactions/search/id?txnId=${txnId}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("txnResult").innerText =
                JSON.stringify(data, null, 2);
        });
}

function searchByAmount() {
    const amount = document.getElementById("searchAmount").value;

    fetch(`/accounts/transactions/search/amount?amount=${amount}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("txnResult").innerText =
                JSON.stringify(data, null, 2);
        });
}

function applyLoan() {

    const amount = document.getElementById("loanAmount").value;
    const downPayment = document.getElementById("downPayment").value;
    const months = document.getElementById("loanMonths").value;

    const accountId = document.getElementById("loanApplyAccountSelect").value; // ✅ CORRECT

    const userCode = localStorage.getItem("userCode");

    fetch(`/loans/apply?userCode=${userCode}&amount=${amount}&downPayment=${downPayment}&months=${months}&accountId=${accountId}`, {
        method: "POST"
    })
        .then(res => res.text())
        .then(data => {
            alert(data);
            loadAccounts();
            loadLoans();
        });
}

function loadLoans() {
    const userCode = localStorage.getItem("userCode");

    fetch(`/loans/user?userCode=${userCode}`)
        .then(res => res.json())
        .then(data => {

            const container = document.getElementById("loanResult");

            container.innerHTML = `
            <table border="1" width="100%">
                <tr>
                    <th>ID</th>
                    <th>Total</th>
                    <th>Remaining</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
                ${data.map(l => `
                <tr>
                    <td>${l.id}</td>
                    <td>&#8377;${l.totalAmount}</td>
                    <td>&#8377;${l.remainingAmount}</td>
                    <td>${l.closed ? "LOAN CLOSED" : "NOT PAID"}</td>
                    <td>
                        ${!l.closed ? `<button onclick="payLoanUI(${l.id})">Pay</button>` : ""}
                    </td>
                </tr>
                `).join("")}
            </table>
            `;
        });
}

function applyCard(type) {
    const userCode = localStorage.getItem("userCode");

    fetch(`/cards/apply?userCode=${userCode}&type=${type}`, {
        method: "POST"
    })
        .then(res => res.text())
        .then(data => alert(data));
}

function loadCards() {
    const userCode = localStorage.getItem("userCode");

    fetch(`/cards/user?userCode=${userCode}`)
        .then(res => res.json())
        .then(data => {

            const container = document.getElementById("cardResult");

            if (!data || data.length === 0) {
                container.innerHTML = "<p>No cards available</p>";
                return;
            }

            container.innerHTML = `
            <h3>Your Cards</h3>
            <table border="1" width="100%">
                <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Card Number</th>
                    <th>Expiry</th>
                    <th>CVV</th>
                    <th>Name</th>
                    <th>Action</th>
                </tr>
                ${data.map(c => `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.cardType}</td>
                    <td>${c.cardNumber}</td>
                    <td>${c.expiry}</td>
                    <td>${c.cvv}</td>
                    <td>${c.nameOnCard}</td>
                    <td>
                        <button style="background:red; color:white;"
                            onclick="deleteCard(${c.id})">
                            Cancel
                        </button>
                    </td>
                </tr>
                `).join("")}
            </table>
            `;
        });
}

function invest() {
    const userCode = localStorage.getItem("userCode");

    const name = document.getElementById("invName").value;
    const amount = document.getElementById("invAmount").value;
    const accountId = document.getElementById("invAccountId").value;

    fetch(`/investments/invest?userCode=${userCode}&name=${name}&amount=${amount}&accountId=${accountId}`, {
        method: "POST"
    })
        .then(res => res.text())
        .then(data => alert(data));
}

function loadInvestments() {
    const userCode = localStorage.getItem("userCode");

    fetch(`/investments/user?userCode=${userCode}`)
        .then(res => res.json())
        .then(data => {

            const container = document.getElementById("invResult");

            if (!data || data.length === 0) {
                container.innerHTML = "<p>No investments</p>";
                document.getElementById("totalInvested").innerText = "₹0";
                document.getElementById("totalProfit").innerText = "+₹0 ↑";
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
            const formattedProfit = profit.toFixed(2);
            const formattedInvested = totalInvested.toFixed(2);

            // 🔥 UPDATE UI
            document.getElementById("totalInvested").innerText = `₹${formattedInvested}`;
            document.getElementById("totalProfit").innerText = `+₹${formattedProfit} ↑`;

            container.innerHTML = `
            <table border="1" width="100%">
                <tr>
                    <th>ID</th>
                    <th>Bank</th>
                    <th>Invested</th>
                    <th>Return</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
                ${data.map(i => `
                <tr>
                    <td>${i.id}</td>
                    <td>${i.investmentName}</td>
                   <td>&#8377;${i.amountInvested.toFixed(2)}</td>
                   <td>&#8377;${i.returnAmount.toFixed(2)}</td>
                    <td>${i.withdrawn ? "WITHDRAWN" : "ACTIVE"}</td>
                    <td>
                        ${!i.withdrawn ?
                `<button onclick="withdrawInvestmentUI(${i.id})">Withdraw</button>`
                : "-"}
                    </td>
                </tr>
                `).join("")}
            </table>
            `;
        });
}

function loadUsers() {
    fetch("/users/all")
        .then(res => res.json())
        .then(data => {

            const container = document.getElementById("adminResult");

            if (!data || data.length === 0) {
                container.innerHTML = "<p>No users found</p>";
                return;
            }

            container.innerHTML = `
            <h3>All Users</h3>
            <table border="1" width="100%">
                <tr>
                    <th>User Code</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Password</th>
                    <th>Role</th>
                </tr>
                ${data.map(u => `
<tr>
    <td>${u.userCode}</td>
    <td>${u.name}</td>
    <td>${u.email}</td>
    <td>${u.password}</td>
    <td>${u.role}</td>
    <td>
        <button onclick="deleteUser(${u.id})">Delete</button>
    </td>
</tr>
`).join("")}
            </table>
            `;
        });
}

function loadAllAccountsAdmin() {
    fetch("/accounts/all")
        .then(res => res.json())
        .then(data => {

            const container = document.getElementById("adminResult");

            if (!data || data.length === 0) {
                container.innerHTML = "<p>No accounts found</p>";
                return;
            }

            container.innerHTML = `
            <h3>All Accounts</h3>
            <table border="1" width="100%">
                <tr>
                    <th>Account ID</th>
                    <th>Account Number</th>
                    <th>Type</th>
                    <th>Balance</th>
                    <th>User</th>
                </tr>
                ${data.map(acc => `
<tr>
    <td>${acc.id}</td>
    <td>${acc.accountNumber}</td>
    <td>${acc.accountType}</td>
    <td>&#8377;${acc.balance}</td>
    <td>${acc.userCode}</td>
    <td>
        <button onclick="deleteAccountAdmin(${acc.id})">Delete</button>
    </td>
</tr>
`).join("")}
            </table>
            `;
        });
}

function updateBalance() {
    const accountId = document.getElementById("adminAccountId").value;
    const amount = document.getElementById("adminAmount").value;

    fetch(`/accounts/admin/updateBalance?accountId=${accountId}&amount=${amount}`, {
        method: "POST"
    })
        .then(res => res.text())
        .then(data => alert(data));
}

function logout() {
    localStorage.removeItem("userCode");
    window.location.href = "index.html";
}

function deleteAccount(accountId) {
    fetch(`/accounts/delete?accountId=${accountId}`, {
        method: "DELETE"
    })
        .then(res => res.text())
        .then(data => {
            alert(data);
            loadAccounts();
        });
}

function searchByDateRange() {
    alert("Date range search coming soon (backend needed)");
}

function showLoader(id) {
    document.getElementById(id).innerHTML = "<div class='loader'></div>";
}

function deleteAccountAdmin(accountId) {
    fetch(`/accounts/delete?accountId=${accountId}`, {
        method: "DELETE"
    })
        .then(res => res.text())
        .then(data => {
            alert(data);
            loadAllAccountsAdmin(); // 🔥 refresh table
        });
}

function deleteUser(userId) {
    fetch(`/users/delete?userId=${userId}`, {
        method: "DELETE"
    })
        .then(res => res.text())
        .then(data => {
            alert(data);
            loadUsers(); // 🔥 refresh
        });
}

function atmDeposit() {
    const accountId = document.getElementById("atmAccountSelect").value;
    const amount = document.getElementById("atmAmount").value;
    const userCode = localStorage.getItem("userCode");

    fetch(`/accounts/atm/deposit?accountId=${accountId}&amount=${amount}&userCode=${userCode}`, {
        method: "POST"
    })
        .then(res => res.text())
        .then(data => {
            document.getElementById("atmResult").innerText = data;
            loadAccounts();
            loadATMAccounts(); // 🔥 refresh dropdown
        });
}

function atmWithdraw() {
    const accountId = document.getElementById("atmAccountSelect").value;
    const amount = document.getElementById("atmAmount").value;
    const userCode = localStorage.getItem("userCode");

    fetch(`/accounts/atm/withdraw?accountId=${accountId}&amount=${amount}&userCode=${userCode}`, {
        method: "POST"
    })
        .then(res => res.text())
        .then(data => {
            document.getElementById("atmResult").innerText = data;
            loadAccounts();
            loadATMAccounts(); // 🔥 refresh dropdown
        });
}

function loadTransactionAccounts() {
    const userCode = localStorage.getItem("userCode");

    fetch(`/accounts/user?userCode=${userCode}`)
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById("txnAccountSelect");

            select.innerHTML = data.map(acc =>
                `<option value="${acc.id}">
                    ${acc.accountType} - ${acc.accountNumber}
                </option>`
            ).join("");
        });
}

function loadLast15Transactions() {

    const accountId = document.getElementById("txnAccountSelect").value;

    fetch(`/accounts/transactions?accountId=${accountId}`)
        .then(res => res.json())
        .then(data => {

            const container = document.getElementById("txnResult");

            const last15 = data.slice(-15).reverse();

            container.innerHTML = `
            <table border="1" width="100%">
                <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                </tr>
                ${last15.map(t => {

                const isCredit =
                    t.type.includes("IN") ||
                    t.type.includes("DEPOSIT");

                const color = isCredit ? "green" : "red";
                const sign = isCredit ? "+" : "-";

                return `
                    <tr>
                        <td>${t.transactionId}</td>
                        <td>${t.type}</td>
                        <td>${t.category}</td>
                        <td style="color:${color}; font-weight:bold;">
                            ${sign}&#8377;${t.amount}
                        </td>
                        <td>${t.timestamp}</td>
                    </tr>
                    `;
            }).join("")}
            </table>
            `;
        });
}

function payLoanUI(loanId) {


    const accountId = document.getElementById("loanPayAccountSelect").value;
    const amount = prompt("Enter amount to pay:");

    fetch(`/loans/pay?loanId=${loanId}&amount=${amount}&accountId=${accountId}`, {
        method: "POST"
    })
        .then(res => res.text())
        .then(data => {
            alert(data);
            loadLoans();
            loadAccounts();
        });
}

function loadATMAccounts() {
    const userCode = localStorage.getItem("userCode");

    fetch(`/accounts/user?userCode=${userCode}`)
        .then(res => res.json())
        .then(data => {

            const select = document.getElementById("atmAccountSelect");

            select.innerHTML = data.map(acc =>
                `<option value="${acc.id}">
                    ${acc.accountType} - ${acc.accountNumber} (₹${acc.balance})
                </option>`
            ).join("");
        });
}

function loadTransferAccounts() {
    const userCode = localStorage.getItem("userCode");

    fetch(`/accounts/user?userCode=${userCode}`)
        .then(res => res.json())
        .then(data => {

            console.log("TRANSFER DATA:", data); // 🔥 DEBUG

            const select = document.getElementById("fromAccountSelect");

            select.innerHTML = data.map(acc =>
                `<option value="${acc.id}">
                    ${acc.accountType} - ${acc.accountNumber} (₹${acc.balance})
                </option>`
            ).join("");
        });
}

function loadLoanAccounts() {
    const userCode = localStorage.getItem("userCode");

    fetch(`/accounts/user?userCode=${userCode}`)
        .then(res => res.json())
        .then(data => {

            const applySelect = document.getElementById("loanApplyAccountSelect");
            const paySelect = document.getElementById("loanPayAccountSelect");

            const options = data.map(acc =>
                `<option value="${acc.id}">
                    ${acc.accountType} - ${acc.accountNumber} (₹${acc.balance})
                </option>`
            ).join("");

            applySelect.innerHTML = options;
            paySelect.innerHTML = options;
        });
}

const banks = [
    "HDFC", "ICICI", "SBI", "Axis", "Kotak",
    "IndusInd", "Yes Bank", "PNB", "Bank of Baroda",
    "Canara", "Union Bank", "IDFC", "AU Bank", "HSBC"
];

function loadInvestmentCards() {

    const container = document.getElementById("investmentCards");

    container.innerHTML = banks.map(bank => `
        <div style="border:1px solid #ccc; padding:15px; border-radius:10px; text-align:center;">
            <h3>${bank}</h3>

            <button onclick="openInvest('${bank}')">Invest</button>
           
        </div>
    `).join("");
}

function getAccountOptions(callback) {
    const userCode = localStorage.getItem("userCode");

    fetch(`/accounts/user?userCode=${userCode}`)
        .then(res => res.json())
        .then(data => callback(data));
}

function openInvest(bank) {

    getAccountOptions(accounts => {

        const accountOptions = accounts.map(acc =>
            `${acc.id} - ${acc.accountType} (${acc.balance})`
        ).join("\n");

        const accountId = prompt(`Select Account ID:\n${accountOptions}`);
        const amount = prompt(`Enter amount to invest in ${bank}`);

        if (!accountId || !amount) return;

        const userCode = localStorage.getItem("userCode");

        fetch(`/investments/invest?userCode=${userCode}&name=${bank}&amount=${amount}&accountId=${accountId}`, {
            method: "POST"
        })
            .then(res => res.text())
            .then(data => {
                alert(data);
                loadAccounts();
                loadInvestments();
            });
    });
}

function withdrawInvestmentUI(investmentId) {

    const accountId = prompt("Enter account ID to receive money:");

    if (!accountId) return;

    fetch(`/investments/withdraw?investmentId=${investmentId}&accountId=${accountId}`, {
        method: "POST"
    })
        .then(res => res.text())
        .then(data => {
            alert(data);
            loadAccounts();
            loadInvestments();
        });


}

function deleteCard(cardId) {

    if (!confirm("Are you sure you want to cancel this card?")) return;

    fetch(`/cards/delete?cardId=${cardId}`, {
        method: "DELETE"
    })
        .then(res => res.text())
        .then(data => {
            alert(data);
            loadCards(); // 🔥 refresh table
        });
}