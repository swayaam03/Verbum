document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = '3102776ade394622badef9e9564ca712'; // IMPORTANT: Replace with your actual API key

    // Define an array of API URLs
    // You can modify country, category, sources, etc., for each URL
    const NEWS_API_URLS = [
        `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=3102776ade394622badef9e9564ca712`,
        `https://newsapi.org/v2/everything?q=tesla&from=2025-06-06&sortBy=publishedAt&apiKey=3102776ade394622badef9e9564ca712`,
        
        // Add more URLs here as needed
        // Be mindful of NewsAPI.org's request limits (100 requests/day for developer tier)
        // Each URL in this array counts as a separate request.
    ];

    const newsFeedElement = document.getElementById('newsFeed');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    let page = 1;
    const pageSize = 10; // Articles per request from EACH API URL

    async function fetchNews(pageNum = 1) {
        if (pageNum === 1) {
            newsFeedElement.innerHTML = '<p class="loading-message">Loading news...</p>';
            loadMoreBtn.style.display = 'none';
        }

        try {
            // Create an array of Promises for each API call
            const fetchPromises = NEWS_API_URLS.map(url =>
                fetch(`${url}&page=${pageNum}&pageSize=${pageSize}`).then(response => response.json())
            );

            // Wait for all promises to resolve
            const results = await Promise.allSettled(fetchPromises); // use Promise.allSettled to handle individual failures

            if (pageNum === 1) {
                newsFeedElement.innerHTML = ''; // Clear loading message for first load
            }

            let allArticles = [];
            let hasMoreResults = false;

            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value.status === 'ok') {
                    allArticles = allArticles.concat(result.value.articles);
                    // Check if any source still has more articles
                    if (result.value.totalResults > (pageNum * pageSize)) {
                        hasMoreResults = true;
                    }
                } else {
                    console.error(`Error fetching from API URL ${index + 1}:`, result.reason || result.value.message);
                    // You might want to display a specific error message for this source or log it.
                }
            });

            // Sort all articles by published date (most recent first)
            allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

            if (allArticles.length > 0) {
                allArticles.forEach(article => {
                    if (article.title && article.url && article.source.name) {
                        const newsArticle = document.createElement('article');
                        newsArticle.classList.add('news-article-card');

                        const imageUrl = article.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image';

                        newsArticle.innerHTML = `
                            <img src="${imageUrl}" alt="${article.title}" class="article-image">
                            <div class="article-content">
                                <h3 class="article-title"><a href="${article.url}" target="_blank" rel="noopener noreferrer">${article.title}</a></h3>
                                <p class="article-source-date">
                                    ${article.source.name} &bull; ${new Date(article.publishedAt).toLocaleDateString()}
                                </p>
                                <p class="article-description">${article.description || ''}</p>
                            </div>
                        `;
                        newsFeedElement.appendChild(newsArticle);
                    }
                });

                if (hasMoreResults) {
                    loadMoreBtn.style.display = 'block';
                } else {
                    loadMoreBtn.style.display = 'none';
                    const noMoreMessage = document.createElement('p');
                    noMoreMessage.classList.add('no-more-news');
                    noMoreMessage.textContent = "No more news to load from these sources.";
                    newsFeedElement.appendChild(noMoreMessage);
                }
            } else {
                newsFeedElement.innerHTML = '<p class="no-news-message">No news available from any configured source today. Please try again later!</p>';
                loadMoreBtn.style.display = 'none';
            }

        } catch (error) {
            console.error('Failed to fetch news:', error);
            newsFeedElement.innerHTML = '<p class="error-message">Could not load news. Please check your internet connection or try again later.</p>';
            loadMoreBtn.style.display = 'none';
        }
    }

    fetchNews();

    loadMoreBtn.addEventListener('click', () => {
        page++;
        fetchNews(page);
    });
});