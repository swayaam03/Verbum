document.addEventListener('DOMContentLoaded', () => {
    const articlesListDiv = document.getElementById('articlesList');
    const loadingMessage = document.getElementById('loadingMessage');

    const fetchArticles = async () => {
        try {
            loadingMessage.textContent = "Loading articles...";
            const response = await fetch('fetch-articles.php');
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const articles = await response.json();

            articlesListDiv.innerHTML = ''; // Clear loading message/previous content

            if (articles.length === 0) {
                articlesListDiv.innerHTML = '<p class="no-articles">No articles posted yet.</p>';
                return;
            }

            articles.forEach(article => {
                const articleItem = document.createElement('div');
                articleItem.classList.add('article-item');

                // Basic HTML structure for each article
                articleItem.innerHTML = `
                    <h3>${article.title}</h3>
                    <p class="meta">By ${article.author || 'Anonymous'} on ${new Date(article.created_at).toLocaleDateString()}</p>
                    ${article.image_path ? `<img src="${article.image_path}" alt="${article.title}">` : ''}
                    <div class="content-snippet">${article.content.substring(0, 200)}...</div> `;
                articlesListDiv.appendChild(articleItem);
            });

        } catch (error) {
            console.error('Error fetching articles:', error);
            articlesListDiv.innerHTML = '<p class="no-articles" style="color: red;">Failed to load articles. Please try again later.</p>';
        }
    };

    fetchArticles(); // Call the function to fetch and display articles when the page loads
});