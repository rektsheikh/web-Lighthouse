const API_KEY = 'AIzaSyAqQg4489JCEy1f0PVdu8TqihoWzplgZt8';

export async function runPageSpeedInsights(url) {
    const api = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
    const parameters = {
        url: encodeURIComponent(url),
        key: API_KEY,
        category: ['performance', 'accessibility', 'best-practices', 'seo'],
        strategy: 'mobile'
    };
    let query = `${api}?`;
    for (let key in parameters) {
        query += `${key}=${parameters[key]}&`;
    }

    const response = await fetch(query);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

