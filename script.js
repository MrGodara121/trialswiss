const API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
let currentLang = 'en';
let currentUser = null;

// ===== LANGUAGE =====
function changeLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    loadContent();
}

// ===== LOAD CONTENT =====
async function loadContent() {
    const res = await fetch(`${API_URL}?action=getContent&lang=${currentLang}`);
    const data = await res.json();
    if (data.success) {
        document.getElementById('hero-content').innerHTML = data.hero;
        document.getElementById('hero-stats').innerHTML = data.stats;
        document.getElementById('features-grid').innerHTML = data.features;
        document.getElementById('pricing-grid').innerHTML = data.pricing;
    }
}

// ===== HOSPITALS =====
async function searchHospitals() {
    const canton = document.getElementById('canton').value;
    const spec = document.getElementById('specialization').value;
    const minScore = document.getElementById('minScore').value;
    
    const res = await fetch(`${API_URL}?action=hospitals&canton=${canton}&spec=${spec}&min=${minScore}`);
    const data = await res.json();
    
    let html = '<table><tr><th>Hospital</th><th>City</th><th>Canton</th><th>Score</th></tr>';
    data.hospitals.forEach(h => {
        html += `<tr><td>${h.name}</td><td>${h.city}</td><td>${h.canton}</td><td><span class="score-badge">${h.score}</span></td></tr>`;
    });
    html += '</table>';
    document.getElementById('hospital-results').innerHTML = html;
}

// ===== COST =====
async function calculateCost() {
    const patients = document.getElementById('patients').value;
    const phase = document.getElementById('phase').value;
    
    const res = await fetch(`${API_URL}?action=cost&patients=${patients}&phase=${phase}`);
    const data = await res.json();
    
    document.getElementById('cost-result').innerHTML = `
        <div class="result">
            <h3>Total Cost: CHF ${data.total_cost.toLocaleString()}</h3>
            <p>Per Patient: CHF ${data.cost_per_patient}</p>
            <p>Time: ${data.months} months</p>
        </div>
    `;
}

// ===== LOGIN =====
function showLogin() { document.getElementById('loginModal').style.display = 'block'; }
function showSignup() { document.getElementById('signupModal').style.display = 'block'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

async function login() {
    const email = document.getElementById('loginEmail').value;
    const key = document.getElementById('loginKey').value;
    
    const res = await fetch(`${API_URL}?action=login&email=${email}&key=${key}`);
    const data = await res.json();
    
    if (data.success) {
        currentUser = data.user;
        closeModal('loginModal');
        alert('Login successful');
        loadDownloads();
    } else {
        alert('Invalid credentials');
    }
}

async function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const company = document.getElementById('signupCompany').value;
    
    const res = await fetch(`${API_URL}?action=signup&name=${name}&email=${email}&company=${company}`);
    const data = await res.json();
    
    if (data.success) {
        alert('Check your email for API key');
        closeModal('signupModal');
    }
}

// ===== DOWNLOADS =====
async function loadDownloads() {
    if (!currentUser) return;
    
    const res = await fetch(`${API_URL}?action=downloads&user=${currentUser.id}`);
    const data = await res.json();
    
    let html = '<div class="downloads-grid">';
    data.links.forEach(l => {
        html += `<div class="download-card">
            <i class="fas fa-file-archive"></i>
            <h4>${l.name}</h4>
            <p>${l.size} MB</p>
            <a href="${l.url}" class="btn-primary">Download</a>
        </div>`;
    });
    html += '</div>';
    document.getElementById('downloads').innerHTML = html;
}

// ===== LEGAL =====
async function showLegal(page) {
    const res = await fetch(`${API_URL}?action=legal&page=${page}`);
    const data = await res.json();
    alert(data.content);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('lang') || 'en';
    document.getElementById('lang').value = savedLang;
    loadContent();
});
