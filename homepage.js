document.addEventListener('DOMContentLoaded', () => {
    const articlesListDiv = document.getElementById('homepageArticlesList');
    const loadingMessage = document.getElementById('homepageLoadingMessage');

    const fetchArticles = async () => {
        try {
            loadingMessage.textContent = "Loading articles...";
            const response = await fetch('fetch-articles.php'); // Uses your existing PHP script
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const articles = await response.json();

            articlesListDiv.innerHTML = ''; // Clear loading message/previous content

            if (articles.length === 0) {
                articlesListDiv.innerHTML = '<p class="no-articles">No articles available yet.</p>';
                return;
            }

            // Display a limited number of articles on the homepage, e.g., first 6
            const articlesToDisplay = articles.slice(0, 6); // Adjust number as needed

            articlesToDisplay.forEach(article => {
                const articleItem = document.createElement('div');
                articleItem.classList.add('homepage-article-item');

                // Basic HTML structure for each article
                articleItem.innerHTML = `
                    <h3>${article.title}</h3>
                    <p class="meta">By ${article.author || 'Anonymous'} on ${new Date(article.created_at).toLocaleDateString()}</p>
                    ${article.image_path ? `<img src="${article.image_path}" alt="${article.title}">` : ''}
                    <div class="content-snippet">${article.content.substring(0, 150)}...</div> `;
                articlesListDiv.appendChild(articleItem);
            });

        } catch (error) {
            console.error('Error fetching articles for homepage:', error);
            articlesListDiv.innerHTML = '<p class="no-articles" style="color: red;">Failed to load articles. Please check your console.</p>';
        }
    };

    fetchArticles(); // Call the function to fetch and display articles when the page loads
});