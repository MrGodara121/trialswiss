// ===== कॉन्फ़िगरेशन =====
const API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
let currentLang = localStorage.getItem('lang') || 'en';
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');

// ===== LANGUAGE FUNCTIONS =====
function changeLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    location.reload();
}

// ===== SEO ऑटोमेटिक फंक्शन्स =====

// 1. मेटा टैग्स ऑटो-लोड
async function loadSEOMeta() {
    const page = window.location.pathname;
    const lang = currentLang || 'en';
    
    try {
        const res = await fetch(`${API_URL}?action=getMetaTags&page=${page}&lang=${lang}`);
        const data = await res.json();
        
        if (data.success) {
            document.title = data.title;
            
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = 'description';
                document.head.appendChild(metaDesc);
            }
            metaDesc.content = data.description;
            
            let metaKeywords = document.querySelector('meta[name="keywords"]');
            if (!metaKeywords) {
                metaKeywords = document.createElement('meta');
                metaKeywords.name = 'keywords';
                document.head.appendChild(metaKeywords);
            }
            metaKeywords.content = data.keywords;
        }
    } catch (error) {
        console.error('SEO Meta Error:', error);
    }
}

// 2. स्कीमा मार्कअप ऑटो-लोड
async function loadSchemaMarkup() {
    const page = window.location.pathname;
    
    try {
        const res = await fetch(`${API_URL}?action=getSchema&page=${page}`);
        const data = await res.json();
        
        if (data.success) {
            // Remove old schema if exists
            const oldSchema = document.querySelector('script[type="application/ld+json"]');
            if (oldSchema) oldSchema.remove();
            
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.text = JSON.stringify(data.schema);
            document.head.appendChild(script);
        }
    } catch (error) {
        console.error('Schema Error:', error);
    }
}

// 3. इंटरनल लिंक्स ऑटो-लोड
async function loadInternalLinks() {
    const page = window.location.pathname;
    
    try {
        const res = await fetch(`${API_URL}?action=getInternalLinks&page=${page}`);
        const data = await res.json();
        
        if (data.success && data.links.length > 0) {
            // Remove old related links if exists
            const oldDiv = document.querySelector('.related-links');
            if (oldDiv) oldDiv.remove();
            
            const div = document.createElement('div');
            div.className = 'related-links';
            div.innerHTML = '<h3>Related:</h3>';
            
            data.links.forEach(link => {
                div.innerHTML += `<a href="${link.to}">${link.anchor}</a> `;
            });
            
            const footer = document.querySelector('.footer');
            if (footer) {
                footer.parentNode.insertBefore(div, footer);
            }
        }
    } catch (error) {
        console.error('Internal Links Error:', error);
    }
}

// 4. ब्लॉग पोस्ट ऑटो-लोड
async function loadBlogPosts() {
    try {
        const res = await fetch(`${API_URL}?action=getBlogPosts`);
        const data = await res.json();
        
        if (data.success) {
            const blogGrid = document.getElementById('blog-posts');
            if (blogGrid) {
                let html = '';
                data.posts.forEach(post => {
                    html += `
                        <div class="blog-card">
                            <h3>${post.title}</h3>
                            <p>${post.excerpt}</p>
                            <a href="/blog/${post.slug}">Read More</a>
                        </div>
                    `;
                });
                blogGrid.innerHTML = html;
            }
        }
    } catch (error) {
        console.error('Blog Posts Error:', error);
    }
}

// 5. ब्लॉग पोस्ट व्यू ट्रैकिंग
async function trackBlogView(postId) {
    try {
        await fetch(`${API_URL}?action=incrementBlogViews&id=${postId}`);
    } catch (error) {
        console.error('Track Blog View Error:', error);
    }
}

// 6. कीवर्ड रैंक ट्रैकिंग (Google Search Console से डेटा)
async function updateKeywordRanks() {
    // यह फंक्शन Google Search Console API से कनेक्ट करेगा
    // अभी के लिए मैनुअल
    console.log('Keyword tracking - manual for now');
}

// ===== HOSPITAL FUNCTIONS =====
async function searchHospitals() {
    const canton = document.getElementById('canton')?.value || '';
    const spec = document.getElementById('specialization')?.value || '';
    const minScore = document.getElementById('minScore')?.value || '';
    
    try {
        const res = await fetch(`${API_URL}?action=hospitals&canton=${canton}&spec=${spec}&min=${minScore}`);
        const data = await res.json();
        
        let html = '<table><tr><th>Hospital</th><th>City</th><th>Canton</th><th>Score</th></tr>';
        data.hospitals.forEach(h => {
            html += `<tr><td>${h.name}</td><td>${h.city}</td><td>${h.canton}</td><td><span class="score-badge">${h.score}</span></td></tr>`;
        });
        html += '</table>';
        document.getElementById('hospital-results').innerHTML = html;
    } catch (error) {
        console.error('Search Hospitals Error:', error);
    }
}

// ===== COST CALCULATOR =====
async function calculateCost() {
    const patients = document.getElementById('patients')?.value;
    const phase = document.getElementById('phase')?.value;
    
    try {
        const res = await fetch(`${API_URL}?action=cost&patients=${patients}&phase=${phase}`);
        const data = await res.json();
        
        document.getElementById('cost-result').innerHTML = `
            <div class="result">
                <h3>Total Cost: CHF ${data.total_cost.toLocaleString()}</h3>
                <p>Per Patient: CHF ${data.cost_per_patient}</p>
                <p>Time: ${data.months} months</p>
            </div>
        `;
    } catch (error) {
        console.error('Cost Calculator Error:', error);
    }
}

// ===== MODAL FUNCTIONS =====
function showLogin() { 
    document.getElementById('loginModal').style.display = 'block'; 
}

function showSignup() { 
    document.getElementById('signupModal').style.display = 'block'; 
}

function closeModal(id) { 
    document.getElementById(id).style.display = 'none'; 
}

// ===== LOGIN FUNCTION =====
async function login() {
    const email = document.getElementById('loginEmail')?.value;
    const key = document.getElementById('loginKey')?.value;
    
    try {
        const res = await fetch(`${API_URL}?action=login&email=${email}&key=${key}`);
        const data = await res.json();
        
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(data.user));
            closeModal('loginModal');
            alert('Login successful');
            loadDownloads();
        } else {
            alert('Invalid credentials');
        }
    } catch (error) {
        console.error('Login Error:', error);
    }
}

// ===== SIGNUP FUNCTION =====
async function signup() {
    const name = document.getElementById('signupName')?.value;
    const email = document.getElementById('signupEmail')?.value;
    const company = document.getElementById('signupCompany')?.value;
    
    try {
        const res = await fetch(`${API_URL}?action=signup&name=${name}&email=${email}&company=${company}`);
        const data = await res.json();
        
        if (data.success) {
            alert('Check your email for API key');
            closeModal('signupModal');
        }
    } catch (error) {
        console.error('Signup Error:', error);
    }
}

// ===== DOWNLOADS FUNCTION =====
async function loadDownloads() {
    if (!currentUser) return;
    
    try {
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
    } catch (error) {
        console.error('Downloads Error:', error);
    }
}

// ===== LEGAL FUNCTION =====
async function showLegal(page) {
    try {
        const res = await fetch(`${API_URL}?action=legal&page=${page}`);
        const data = await res.json();
        alert(data.content);
    } catch (error) {
        console.error('Legal Error:', error);
    }
}

// ===== COOKIE CONSENT =====
function showCookieConsent() {
    if (!localStorage.getItem('cookieConsent')) {
        const consent = document.createElement('div');
        consent.className = 'cookie-consent';
        consent.innerHTML = `
            <p>We use essential cookies only. By continuing, you accept our <a href="/legal/cookies.html">Cookie Policy</a>.</p>
            <button onclick="acceptCookies()">Accept</button>
        `;
        document.body.appendChild(consent);
    }
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'true');
    document.querySelector('.cookie-consent')?.remove();
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Load saved language
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
        currentLang = savedLang;
        document.getElementById('lang').value = savedLang;
    }
    
    // Load saved user
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    
    // Load SEO meta tags
    loadSEOMeta();
    
    // Load schema markup
    loadSchemaMarkup();
    
    // Load internal links
    loadInternalLinks();
    
    // Check if blog post page
    if (window.location.pathname.includes('/blog/')) {
        const postId = window.location.pathname.split('/').pop();
        trackBlogView(postId);
    }
    
    // Check if blog listing page
    if (window.location.pathname === '/blog') {
        loadBlogPosts();
    }
    
    // Check if user is logged in
    if (currentUser) {
        loadDownloads();
    }
    
    // Show cookie consent
    showCookieConsent();
});
