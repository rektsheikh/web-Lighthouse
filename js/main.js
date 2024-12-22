import { runPageSpeedInsights } from './pagespeed.js';
import { displayResults, updateHistory } from './ui.js';

const form = document.getElementById('url-form');
const urlInput = document.getElementById('url-to-test');
const resultsSection = document.getElementById('results');
const loadingIndicator = document.getElementById('loading');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = urlInput.value;

    if (!url) return;

    resultsSection.classList.remove('hidden');
    loadingIndicator.classList.remove('hidden');

    try {
        const results = await runPageSpeedInsights(url);
        displayResults(results);
        updateHistory(url, results);
    } catch (error) {
        console.error('Error analyzing URL:', error);
        displayResults({ error: 'Failed to analyze URL. Please try again.' });
    } finally {
        loadingIndicator.classList.add('hidden');
    }
});

// Load and display history on page load
document.addEventListener('DOMContentLoaded', () => {
    updateHistory();
});

