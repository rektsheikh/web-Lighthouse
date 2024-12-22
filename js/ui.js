const resultsContent = document.getElementById('results-content');
const historyList = document.getElementById('history-list');

export function displayResults(results) {
    if (results.error) {
        resultsContent.innerHTML = `<p class="text-red-500">${results.error}</p>`;
        return;
    }

    const { lighthouseResult } = results;
    const { categories, audits } = lighthouseResult;

    let html = `
        <h3 class="text-xl font-semibold mb-4">Results for: ${results.id}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    `;

    for (const [key, category] of Object.entries(categories)) {
        const score = Math.round(category.score * 100);
        const color = score >= 90 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';
        html += `
            <div class="bg-white p-4 rounded shadow">
                <h4 class="font-semibold mb-2">${category.title}</h4>
                <div class="flex items-center">
                    <div class="${color} text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                        ${score}
                    </div>
                    <span class="ml-2">/100</span>
                </div>
            </div>
        `;
    }

    html += `</div><h4 class="text-lg font-semibold mb-2">Key Metrics:</h4><ul class="list-disc pl-5 mb-4">`;

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

    html += `</ul>`;

    resultsContent.innerHTML = html;
}

export function updateHistory(url, results) {
    let history = JSON.parse(localStorage.getItem('psiHistory') || '[]');

    if (url && results) {
        history.unshift({ url, date: new Date().toISOString(), score: results.lighthouseResult.categories.performance.score });
        history = history.slice(0, 5); // Keep only the last 5 entries
        localStorage.setItem('psiHistory', JSON.stringify(history));
    }

    historyList.innerHTML = history.map(entry => `
        <li class="bg-white p-2 rounded shadow">
            <a href="#" class="text-blue-600 hover:underline" data-url="${entry.url}">${entry.url}</a>
            <span class="text-sm text-gray-500 ml-2">${new Date(entry.date).toLocaleString()}</span>
            <span class="float-right font-semibold">${Math.round(entry.score * 100)}/100</span>
        </li>
    `).join('');

    historyList.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            document.getElementById('url-to-test').value = e.target.dataset.url;
            document.getElementById('url-form').dispatchEvent(new Event('submit'));
        }
    });
}

