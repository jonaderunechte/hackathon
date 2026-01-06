// Firebase Configuration
// REPLACE WITH YOUR FIREBASE CONFIG (same as in script.js)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Current state
let currentUser = null;
let allUsers = [];
let filteredUsers = [];
let currentSort = 'coins';

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeAdmin();
});

function initializeAdmin() {
    setupEventListeners();
    
    // Check auth state
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            await checkAdminAccess();
        } else {
            showAuthSection();
        }
    });
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
    // Login
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('adminPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Sort buttons
    document.querySelectorAll('.control-btn[data-sort]').forEach(btn => {
        btn.addEventListener('click', () => {
            const sortType = btn.dataset.sort;
            document.querySelectorAll('.control-btn[data-sort]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSort = sortType;
            sortAndDisplayUsers();
        });
    });

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', loadUsers);

    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterUsers(searchTerm);
    });
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

async function handleLogin() {
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    const messageEl = document.getElementById('authMessage');

    if (!email || !password) {
        showMessage(messageEl, 'Bitte alle Felder ausfüllen!', 'error');
        return;
    }

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        await checkAdminAccess();
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage(messageEl, getErrorMessage(error.code), 'error');
    }
}

async function checkAdminAccess() {
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        
        if (userDoc.exists && userDoc.data().role === 'admin') {
            showDashboard();
            await loadUsers();
        } else {
            const messageEl = document.getElementById('authMessage');
            showMessage(messageEl, '⛔ Zugriff verweigert! Dieser Account hat keine Admin-Rechte.', 'error');
            await auth.signOut();
        }
    } catch (error) {
        console.error('Error checking admin access:', error);
        const messageEl = document.getElementById('authMessage');
        showMessage(messageEl, 'Fehler beim Überprüfen der Berechtigung!', 'error');
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        currentUser = null;
        allUsers = [];
        filteredUsers = [];
        showAuthSection();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// ============================================================================
// NAVIGATION
// ============================================================================

function showAuthSection() {
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('dashboardSection').classList.remove('active');
}

function showDashboard() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('dashboardSection').classList.add('active');
}

// ============================================================================
// DATA LOADING
// ============================================================================

async function loadUsers() {
    try {
        showLoading();
        
        const usersSnapshot = await db.collection('users').get();
        allUsers = [];

        usersSnapshot.forEach(doc => {
            const data = doc.data();
            allUsers.push({
                id: doc.id,
                name: data.name,
                email: data.email,
                balance: data.balance || 0,
                hackCoins: data.hackCoins || 0,
                challengesCompleted: data.challengesCompleted || 0,
                timeElapsed: data.timeElapsed || null,
                completedAt: data.completedAt ? data.completedAt.toDate() : null,
                createdAt: data.createdAt ? data.createdAt.toDate() : null,
                role: data.role || 'user'
            });
        });

        filteredUsers = [...allUsers];
        sortAndDisplayUsers();
        updateStatistics();
        hideLoading();
        
    } catch (error) {
        console.error('Error loading users:', error);
        showNoData();
    }
}

// ============================================================================
// SORTING & FILTERING
// ============================================================================

function sortAndDisplayUsers() {
    switch(currentSort) {
        case 'coins':
            filteredUsers.sort((a, b) => b.hackCoins - a.hackCoins);
            break;
        case 'time':
            filteredUsers.sort((a, b) => {
                if (!a.timeElapsed) return 1;
                if (!b.timeElapsed) return -1;
                return a.timeElapsed - b.timeElapsed;
            });
            break;
        case 'progress':
            filteredUsers.sort((a, b) => b.challengesCompleted - a.challengesCompleted);
            break;
    }
    
    displayUsers();
}

function filterUsers(searchTerm) {
    if (!searchTerm) {
        filteredUsers = [...allUsers];
    } else {
        filteredUsers = allUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
    }
    sortAndDisplayUsers();
}

// ============================================================================
// DISPLAY
// ============================================================================

function displayUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    if (filteredUsers.length === 0) {
        showNoData();
        return;
    }

    filteredUsers.forEach((user, index) => {
        const row = document.createElement('tr');
        
        // Rank
        const rank = getRank(index);
        const rankCell = document.createElement('td');
        rankCell.innerHTML = `<span class="rank ${rank.class}">${rank.symbol}</span>`;
        row.appendChild(rankCell);

        // Name
        const nameCell = document.createElement('td');
        nameCell.innerHTML = `<strong>${escapeHtml(user.name)}</strong>`;
        if (user.role === 'admin') {
            nameCell.innerHTML += ' <span class="badge" style="background: #dc2626; color: white;">👨‍💼 Admin</span>';
        }
        row.appendChild(nameCell);

        // Email
        const emailCell = document.createElement('td');
        emailCell.textContent = user.email;
        row.appendChild(emailCell);

        // HackCoins
        const coinsCell = document.createElement('td');
        coinsCell.innerHTML = `<strong style="color: #f59e0b;">🪙 ${user.hackCoins}</strong>`;
        row.appendChild(coinsCell);

        // Progress
        const progressCell = document.createElement('td');
        progressCell.innerHTML = `<strong>${user.challengesCompleted}/10</strong>`;
        row.appendChild(progressCell);

        // Status
        const statusCell = document.createElement('td');
        const status = getStatus(user.challengesCompleted);
        statusCell.innerHTML = `<span class="badge ${status.class}">${status.text}</span>`;
        row.appendChild(statusCell);

        // Time
        const timeCell = document.createElement('td');
        if (user.timeElapsed) {
            timeCell.innerHTML = `⏱️ ${formatTime(user.timeElapsed)}`;
        } else if (user.challengesCompleted > 0) {
            timeCell.innerHTML = '<span style="color: #f59e0b;">In Bearbeitung...</span>';
        } else {
            timeCell.textContent = '-';
        }
        row.appendChild(timeCell);

        // Created At
        const createdCell = document.createElement('td');
        if (user.createdAt) {
            createdCell.textContent = formatDate(user.createdAt);
        } else {
            createdCell.textContent = '-';
        }
        row.appendChild(createdCell);

        tbody.appendChild(row);
    });

    showTable();
}

function updateStatistics() {
    // Total users
    document.getElementById('totalUsers').textContent = allUsers.length;

    // Completed users
    const completedCount = allUsers.filter(u => u.challengesCompleted === 10).length;
    document.getElementById('completedUsers').textContent = completedCount;

    // Average HackCoins
    const totalCoins = allUsers.reduce((sum, u) => sum + u.hackCoins, 0);
    const avgCoins = allUsers.length > 0 ? Math.round(totalCoins / allUsers.length) : 0;
    document.getElementById('avgCoins').textContent = avgCoins;
}

// ============================================================================
// UI HELPERS
// ============================================================================

function showLoading() {
    document.getElementById('loadingSection').style.display = 'block';
    document.getElementById('usersTableSection').style.display = 'none';
    document.getElementById('noDataSection').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loadingSection').style.display = 'none';
}

function showTable() {
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('usersTableSection').style.display = 'block';
    document.getElementById('noDataSection').style.display = 'none';
}

function showNoData() {
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('usersTableSection').style.display = 'none';
    document.getElementById('noDataSection').style.display = 'block';
}

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getRank(index) {
    if (index === 0) {
        return { symbol: '🥇', class: 'gold' };
    } else if (index === 1) {
        return { symbol: '🥈', class: 'silver' };
    } else if (index === 2) {
        return { symbol: '🥉', class: 'bronze' };
    } else {
        return { symbol: `#${index + 1}`, class: '' };
    }
}

function getStatus(challengesCompleted) {
    if (challengesCompleted === 10) {
        return { text: '✅ Abgeschlossen', class: 'completed' };
    } else if (challengesCompleted > 0) {
        return { text: '⏳ In Bearbeitung', class: 'in-progress' };
    } else {
        return { text: '❌ Nicht gestartet', class: 'not-started' };
    }
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

function formatDate(date) {
    return new Intl.DateTimeFormat('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getErrorMessage(code) {
    const messages = {
        'auth/email-already-in-use': 'Diese E-Mail wird bereits verwendet!',
        'auth/invalid-email': 'Ungültige E-Mail-Adresse!',
        'auth/weak-password': 'Passwort ist zu schwach!',
        'auth/user-not-found': 'Benutzer nicht gefunden!',
        'auth/wrong-password': 'Falsches Passwort!',
        'auth/too-many-requests': 'Zu viele Versuche. Bitte später erneut versuchen!',
    };
    return messages[code] || 'Ein Fehler ist aufgetreten!';
}

// ============================================================================
// CONSOLE LOGS
// ============================================================================

console.log('%c👨‍💼 SecureTechBank Admin Dashboard', 'color: #2563eb; font-size: 20px; font-weight: bold;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #64748b;');
console.log('Admin panel loaded successfully.');
console.log('');

// Export for debugging
window.adminDebug = {
    loadUsers,
    allUsers: () => allUsers,
    filteredUsers: () => filteredUsers,
    currentSort: () => currentSort
};
