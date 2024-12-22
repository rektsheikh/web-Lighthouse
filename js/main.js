// Constants
const API_KEY = 'AIzaSyAqQg4489JCEy1f0PVdu8TqihoWzplgZt8';
const API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

// DOM Elements
const form = document.getElementById('analysis-form');
const urlInput = document.getElementById('url-input');
const deviceType = document.getElementById('device-type');
const loadingElement = document.getElementById('loading');
const resultsElement = document.getElementById('results');
const historyList = document.getElementById('history-list');

// Event Listeners
form.addEventListener('submit', handleFormSubmit);
window.addEventListener('load', loadHistory);

// Functions
async function handleFormSubmit(e) {
    e.preventDefault();
    const url = urlInput.value;
    const strategy = deviceType.value;

    if (!url) return;

    showLoading();
    try {
        const results = await runPageSpeedInsights(url, strategy);
        displayResults(results);
        saveToHistory(url, strategy, results);
    } catch (error) {
        showError('Failed to analyze URL. Please try again.');
    }
    hideLoading();
}

async function runPageSpeedInsights(url, strategy) {
    const params = new URLSearchParams({
        url: url,
        key: API_KEY,
        strategy: strategy,
        category: ['performance', 'accessibility', 'best-practices', 'seo']
    });

    const response = await fetch(`${API_URL}?${params}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

function displayResults(results) {
    const { lighthouseResult } = results;
    const { categories, audits } = lighthouseResult;

    let html = `<h3>Results for: ${results.id}</h3>`;

    for (const [key, category] of Object.entries(categories)) {
        const score = Math.round(category.score * 100);
        const scoreClass = getScoreClass(score);
        html += `
            <div class="result-item">
                <h4>${category.title}</h4>
                <p class="score ${scoreClass}">${score}/100</p>
            </div>
        `;
    }

    html += '<h4>Key Metrics:</h4><ul>';

    const keyMetrics = [
        'first-contentful-paint',
        'largest-contentful-paint',
        'total-blocking-time',
        'cumulative-layout-shift'
    ];

    keyMetrics.forEach(metric => {
        const audit = audits[metric];
        html += `<li><strong>${audit.title}:</strong> ${audit.displayValue}</li>`;
    });

    html += '</ul>';

    resultsElement.innerHTML = html;
    resultsElement.classList.remove('hidden');
}

function showLoading() {
    loadingElement.classList.remove('hidden');
    resultsElement.classList.add('hidden');
}

function hideLoading() {
    loadingElement.classList.add('hidden');
}

function showError(message) {
    resultsElement.innerHTML = `<p class="error">${message}</p>`;
    resultsElement.classList.remove('hidden');
}

function getScoreClass(score) {
    if (score >= 90) return 'good';
    if (score >= 50) return 'average';
    return 'poor';
}

function saveToHistory(url, strategy, results) {
    let history = JSON.parse(localStorage.getItem('webLighthouseHistory') || '[]');
    const entry = {
        url,
        strategy,
        date: new Date().toISOString(),
        scores: {
            performance: results.lighthouseResult.categories.performance.score,
            accessibility: results.lighthouseResult.categories.accessibility.score,
            bestPractices: results.lighthouseResult.categories['best-practices'].score,
            seo: results.lighthouseResult.categories.seo.score
        }
    };
    history.unshift(entry);
    history = history.slice(0, 10); // Keep only the last 10 entries
    localStorage.setItem('webLighthouseHistory', JSON.stringify(history));
    updateHistoryDisplay();
}

function loadHistory() {
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const history = JSON.parse(localStorage.getItem('webLighthouseHistory') || '[]');
    historyList.innerHTML = history.map(entry => `
        <li>
            <strong>${entry.url}</strong> (${entry.strategy})
            <br>
            <small>${new Date(entry.date).toLocaleString()}</small>
            <br>
            Performance: ${Math.round(entry.scores.performance * 100)},
            Accessibility: ${Math.round(entry.scores.accessibility * 100)},
            Best Practices: ${Math.round(entry.scores.bestPractices * 100)},
            SEO: ${Math.round(entry.scores.seo * 100)}
        </li>
    `).join('');
}

// Initialize
loadHistory();

