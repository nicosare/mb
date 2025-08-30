// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCcVgoGZ6MnjQOghbYRmnvITPU-O-zDYao",
    authDomain: "minibars-17502.firebaseapp.com",
    databaseURL: "https://minibars-17502-default-rtdb.firebaseio.com",
    projectId: "minibars-17502",
    storageBucket: "minibars-17502.firebasestorage.app",
    messagingSenderId: "464067936838",
    appId: "1:464067936838:web:f6c37ecf3ec4ae5d598047"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Firebase connection status
function updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connectionStatus');
    const mobileIndicator = document.getElementById('mobileConnectionIndicator');
    
    if (connected) {
        if (statusEl) {
            statusEl.classList.remove('disconnected');
            statusEl.classList.add('connected');
            statusEl.querySelector('.text').textContent = 'Синхронизировано';
        }
        if (mobileIndicator) {
            mobileIndicator.classList.remove('disconnected');
            mobileIndicator.classList.add('connected');
        }
    } else {
        if (statusEl) {
            statusEl.classList.remove('connected');
            statusEl.classList.add('disconnected');
            statusEl.querySelector('.text').textContent = 'Оффлайн';
        }
        if (mobileIndicator) {
            mobileIndicator.classList.remove('connected');
            mobileIndicator.classList.add('disconnected');
        }
    }
}

// Listen for connection status changes
firebase.database().ref('.info/connected').on('value', (snapshot) => {
    updateConnectionStatus(snapshot.val() === true);
});
