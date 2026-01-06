// Firebase Configuration
// REPLACE WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAb9BVZYzfOC8NB9ZLDb22X5_7__Pa9Npc",
  authDomain: "hackathon-d891d.firebaseapp.com",
  projectId: "hackathon-d891d",
  storageBucket: "hackathon-d891d.firebasestorage.app",
  messagingSenderId: "909860734892",
  appId: "1:909860734892:web:377851664b8deef4f45c09"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Challenge Start Time
let challengeStartTime = null;

// Current User Data
let currentUser = null;
let userData = null;

// Password for Personal Data Section (Challenge)
const PERSONAL_DATA_PASSWORD = "securebank2026";

// Challenge Stages Completed
let challengesCompleted = 0;

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Check if popup was already closed
    const popupClosed = sessionStorage.getItem('popupClosed');
    
    if (popupClosed) {
        document.getElementById('challengePopup').style.display = 'none';
        challengeStartTime = parseInt(sessionStorage.getItem('challengeStartTime'));
    } else {
        challengeStartTime = Date.now();
        sessionStorage.setItem('challengeStartTime', challengeStartTime);
    }

    setupEventListeners();
    
    // Check auth state
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            loadUserData();
            showDashboard();
        } else {
            showAuthSection();
        }
    });

    // Console hint for popup
    console.log('%c🎯 Challenge Hint #0:', 'color: #2563eb; font-size: 16px; font-weight: bold;');
    console.log('The popup button is disabled. Check the HTML to enable it or remove the popup overlay!');
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
    // Popup close
    document.getElementById('closePopupBtn').addEventListener('click', closePopup);

    // Auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
    });

    // Login
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // Register
    document.getElementById('registerBtn').addEventListener('click', handleRegister);
    document.getElementById('registerPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleRegister();
    });

    // Dashboard navigation
    document.querySelectorAll('.dashboard-nav .nav-item:not(.logout)').forEach(item => {
        item.addEventListener('click', () => switchDashboardSection(item.dataset.section));
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Personal Data unlock
    document.getElementById('unlockPersonalDataBtn').addEventListener('click', unlockPersonalData);
    document.getElementById('personalDataPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') unlockPersonalData();
    });

    // Transfer
    document.getElementById('transferBtn').addEventListener('click', handleTransfer);
}

// ============================================================================
// POPUP CHALLENGE (Level 0)
// ============================================================================

function closePopup() {
    document.getElementById('challengePopup').style.display = 'none';
    sessionStorage.setItem('popupClosed', 'true');
    console.log('%c✅ Challenge #0 Completed!', 'color: #16a34a; font-size: 14px; font-weight: bold;');
    console.log('You successfully closed the popup. Next: Bypass the paywall!');
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}Form`).classList.add('active');
}

async function handleRegister() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const messageEl = document.getElementById('registerMessage');

    if (!name || !email || !password) {
        showMessage(messageEl, 'Bitte alle Felder ausfüllen!', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage(messageEl, 'Passwort muss mindestens 6 Zeichen haben!', 'error');
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Create user document in Firestore
        await db.collection('users').doc(user.uid).set({
            name: name,
            email: email,
            balance: 100.00,
            hackCoins: 0,
            challengesCompleted: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });

        showMessage(messageEl, 'Erfolgreich registriert!', 'success');
        
        // Auto login after register
        currentUser = user;
        await loadUserData();
        showDashboard();
        
    } catch (error) {
        console.error('Registration error:', error);
        showMessage(messageEl, getErrorMessage(error.code), 'error');
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const messageEl = document.getElementById('loginMessage');

    if (!email || !password) {
        showMessage(messageEl, 'Bitte alle Felder ausfüllen!', 'error');
        return;
    }

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        
        // Update last login
        await db.collection('users').doc(currentUser.uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });

        await loadUserData();
        showDashboard();
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage(messageEl, getErrorMessage(error.code), 'error');
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        currentUser = null;
        userData = null;
        showAuthSection();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

async function loadUserData() {
    if (!currentUser) return;

    try {
        const doc = await db.collection('users').doc(currentUser.uid).get();
        if (doc.exists) {
            userData = doc.data();
            updateUIWithUserData();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function updateUIWithUserData() {
    if (!userData) return;

    document.getElementById('userName').textContent = userData.name;
    document.getElementById('dataName').textContent = userData.name;
    document.getElementById('dataEmail').textContent = userData.email;
    document.getElementById('dataUserId').textContent = currentUser.uid.substring(0, 8);
    document.getElementById('dataBalance').textContent = userData.balance.toFixed(2);
    document.getElementById('dataHackCoins').textContent = userData.hackCoins || 0;
    document.getElementById('dataChallengesCompleted').textContent = userData.challengesCompleted || 0;
}

// ============================================================================
// NAVIGATION
// ============================================================================

function showAuthSection() {
    document.getElementById('authSection').style.display = 'flex';
    document.getElementById('dashboardSection').style.display = 'none';
}

function showDashboard() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'grid';
    
    // Show paywall (Challenge Level 1)
    const paywallBypassed = sessionStorage.getItem('paywallBypassed');
    if (!paywallBypassed) {
        document.getElementById('paywall').style.display = 'flex';
        console.log('%c🎯 Challenge #1:', 'color: #2563eb; font-size: 16px; font-weight: bold;');
        console.log('A paywall is blocking your access. Find a way to bypass it!');
        console.log('Hint: Check the CSS or try manipulating the DOM...');
    }
}

function switchDashboardSection(section) {
    // Update nav items
    document.querySelectorAll('.dashboard-nav .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-item').classList.add('active');

    // Update content sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}Section`).classList.add('active');
}

// ============================================================================
// PERSONAL DATA CHALLENGE (Level 3)
// ============================================================================

function unlockPersonalData() {
    const password = document.getElementById('personalDataPassword').value;
    const messageEl = document.getElementById('personalDataMessage');

    if (password === PERSONAL_DATA_PASSWORD) {
        document.getElementById('personalDataLock').style.display = 'none';
        document.getElementById('personalDataContent').style.display = 'block';
        showMessage(messageEl, 'Zugriff gewährt!', 'success');
        
        updateChallengeProgress(3);
        
        console.log('%c✅ Challenge #3 Completed!', 'color: #16a34a; font-size: 14px; font-weight: bold;');
        console.log('You unlocked the Personal Data section!');
        console.log('Next: Look for hidden information in the news section...');
        
    } else {
        showMessage(messageEl, 'Falsches Passwort!', 'error');
        console.log('%c💡 Hint:', 'color: #f59e0b; font-size: 14px;');
        console.log('The password is somewhere in the JavaScript code. Try searching for "PERSONAL_DATA_PASSWORD"');
    }
}

// ============================================================================
// TRANSFER CHALLENGE (Final)
// ============================================================================

async function handleTransfer() {
    const to = document.getElementById('transferTo').value.trim();
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const note = document.getElementById('transferNote').value.trim();
    const messageEl = document.getElementById('transferMessage');

    if (!to || !amount || amount <= 0) {
        showMessage(messageEl, 'Bitte gültige Daten eingeben!', 'error');
        return;
    }

    // Check balance
    if (amount > userData.balance) {
        showMessage(messageEl, 'Unzureichendes Guthaben!', 'error');
        return;
    }

    // Check for goal amount
    if (amount === 1000000) {
        // GOAL REACHED!
        await completeChallenge();
    } else {
        // Normal transfer
        try {
            const newBalance = userData.balance - amount;
            await db.collection('users').doc(currentUser.uid).update({
                balance: newBalance
            });

            userData.balance = newBalance;
            document.getElementById('dataBalance').textContent = newBalance.toFixed(2);
            
            showMessage(messageEl, `Erfolgreich ${amount.toFixed(2)}€ an ${to} überwiesen!`, 'success');
            
        } catch (error) {
            console.error('Transfer error:', error);
            showMessage(messageEl, 'Überweisung fehlgeschlagen!', 'error');
        }
    }
}

// ============================================================================
// CHALLENGE COMPLETION
// ============================================================================

async function completeChallenge() {
    const endTime = Date.now();
    const timeElapsed = (endTime - challengeStartTime) / 1000; // in seconds
    
    // Calculate HackCoins based on time
    // Less time = more coins
    // Formula: 10000 - (time in minutes * 10)
    const timeInMinutes = Math.floor(timeElapsed / 60);
    let hackCoins = Math.max(1000, 10000 - (timeInMinutes * 10));

    try {
        await db.collection('users').doc(currentUser.uid).update({
            balance: 1000100.00, // Original 100 + 1,000,000
            hackCoins: firebase.firestore.FieldValue.increment(hackCoins),
            challengesCompleted: 10,
            completedAt: firebase.firestore.FieldValue.serverTimestamp(),
            timeElapsed: timeElapsed
        });

        // Reload user data
        await loadUserData();

        // Show success message
        alert(`🎉 GLÜCKWUNSCH! 🎉

Sie haben die Challenge erfolgreich abgeschlossen!

⏱️ Zeit: ${formatTime(timeElapsed)}
🪙 Verdiente HackCoins: ${hackCoins}
💰 Neuer Kontostand: €1,000,100.00

Sie sind ein echter Hacker! 🏆`);

        console.log('%c🏆 CHALLENGE COMPLETED! 🏆', 'color: #16a34a; font-size: 20px; font-weight: bold;');
        console.log(`Time: ${formatTime(timeElapsed)}`);
        console.log(`HackCoins earned: ${hackCoins}`);

    } catch (error) {
        console.error('Error completing challenge:', error);
    }
}

async function updateChallengeProgress(level) {
    if (!currentUser) return;

    try {
        const currentCompleted = userData.challengesCompleted || 0;
        if (level > currentCompleted) {
            await db.collection('users').doc(currentUser.uid).update({
                challengesCompleted: level
            });
            userData.challengesCompleted = level;
            document.getElementById('dataChallengesCompleted').textContent = level;
        }
    } catch (error) {
        console.error('Error updating progress:', error);
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function showMessage(element, message, type) {
    element.textContent = message;
    element.style.color = type === 'success' ? '#16a34a' : '#dc2626';
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

// ============================================================================
// CONSOLE EASTER EGGS & HINTS
// ============================================================================

console.log('%c██████╗  █████╗ ███╗   ██╗██╗  ██╗', 'color: #2563eb; font-weight: bold;');
console.log('%c██╔══██╗██╔══██╗████╗  ██║██║ ██╔╝', 'color: #2563eb; font-weight: bold;');
console.log('%c██████╔╝███████║██╔██╗ ██║█████╔╝ ', 'color: #2563eb; font-weight: bold;');
console.log('%c██╔══██╗██╔══██║██║╚██╗██║██╔═██╗ ', 'color: #2563eb; font-weight: bold;');
console.log('%c██████╔╝██║  ██║██║ ╚████║██║  ██╗', 'color: #2563eb; font-weight: bold;');
console.log('%c╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝', 'color: #2563eb; font-weight: bold;');
console.log('%cSecureTechBank Hackathon Challenge', 'color: #dc2626; font-size: 16px; font-weight: bold;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #64748b;');
console.log('%cWelcome, Hacker! Your mission begins now...', 'color: #64748b; font-style: italic;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #64748b;');
console.log('');

// Hidden functions for advanced challenges
window.bypassPaywall = function() {
    document.getElementById('paywall').style.display = 'none';
    sessionStorage.setItem('paywallBypassed', 'true');
    updateChallengeProgress(1);
    console.log('%c✅ Challenge #1 Completed!', 'color: #16a34a; font-size: 14px; font-weight: bold;');
    console.log('Paywall bypassed! Next: Remove the blur from encrypted news...');
};

window.removeBlur = function() {
    const blurredElements = document.querySelectorAll('.blurred-text p, .blurred-text ul');
    blurredElements.forEach(el => {
        el.style.filter = 'none';
        el.style.userSelect = 'auto';
        el.style.pointerEvents = 'auto';
    });
    updateChallengeProgress(2);
    console.log('%c✅ Challenge #2 Completed!', 'color: #16a34a; font-size: 14px; font-weight: bold;');
    console.log('Text revealed! Now find the SHA-256 hash in the YouTube link...');
};

// Admin check
window.checkAdmin = function() {
    console.log('%c🔐 Admin Status Check', 'color: #f59e0b; font-size: 14px; font-weight: bold;');
    console.log('Current role: user');
    console.log('Admin access: DENIED');
    console.log('Hint: Try modifying user data in Firebase or localStorage...');
};

// Vault hint
window.vaultHint = function() {
    console.log('%c💡 Vault Location Hint:', 'color: #f59e0b; font-size: 14px; font-weight: bold;');
    console.log('The vault is hidden. URL format: /vault-[SHA256_HASH].html');
    console.log('Find the hash in the encrypted news section...');
};

console.log('%c💡 Available Console Commands:', 'color: #2563eb; font-size: 14px; font-weight: bold;');
console.log('• window.bypassPaywall() - Skip paywall');
console.log('• window.removeBlur() - Remove text blur');
console.log('• window.checkAdmin() - Check admin status');
console.log('• window.vaultHint() - Get vault location hint');
console.log('');

// ============================================================================
// ADVANCED CHALLENGES - API MANIPULATION
// ============================================================================

// Simulated API endpoint
window.api = {
    transferLimit: 10000,
    
    async checkTransferLimit(amount) {
        return amount <= this.transferLimit;
    },
    
    async increaseBalance(amount) {
        console.log('%c⚠️ API Call Detected', 'color: #f59e0b; font-size: 14px;');
        console.log(`Attempting to increase balance by €${amount}`);
        
        if (!currentUser) {
            console.log('%c❌ Unauthorized', 'color: #dc2626;');
            return false;
        }
        
        try {
            const newBalance = userData.balance + amount;
            await db.collection('users').doc(currentUser.uid).update({
                balance: newBalance
            });
            userData.balance = newBalance;
            document.getElementById('dataBalance').textContent = newBalance.toFixed(2);
            
            console.log('%c✅ Balance Updated!', 'color: #16a34a;');
            console.log(`New balance: €${newBalance.toFixed(2)}`);
            
            updateChallengeProgress(6);
            return true;
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    }
};

console.log('%c🎯 Advanced Challenge:', 'color: #dc2626; font-size: 14px; font-weight: bold;');
console.log('Try using window.api.increaseBalance(1000000) to reach your goal...');
console.log('');
