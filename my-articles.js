document.addEventListener('DOMContentLoaded', function() {
    const articlesList = document.getElementById('articlesList');
    const loadingMessage = document.getElementById('loadingMessage');

    // Load articles from localStorage
    function loadArticles() {
        try {
            const articles = JSON.parse(localStorage.getItem('articles') || '[]');
            
            if (articles.length === 0) {
                articlesList.innerHTML = `
                    <div class="no-articles">
                        <h3>No Articles Yet</h3>
                        <p>You haven't created any articles yet. Start writing your first article!</p>
                        <a href="create-article.html" class="btn btn-primary">Create Your First Article</a>
                    </div>
                `;
                return;
            }

            // Sort articles by date (newest first)
            articles.sort((a, b) => new Date(b.date) - new Date(a.date));

            const articlesHTML = articles.map(article => {
                const date = new Date(article.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                const contentSnippet = article.content.length > 150 
                    ? article.content.substring(0, 150) + '...' 
                    : article.content;

                return `
                    <div class="article-item" data-article-id="${article.id}">
                        ${article.image ? `<img src="${article.image}" alt="Article Image">` : ''}
                        <h3>${article.title}</h3>
                        <p class="meta">By ${article.author} on ${date}</p>
                        <div class="content-snippet">${contentSnippet}</div>
                        <div class="article-actions">
                            <button class="btn btn-secondary" onclick="editArticle(${article.id})">Edit</button>
                            <button class="btn btn-danger" onclick="deleteArticle(${article.id})">Delete</button>
                        </div>
                    </div>
                `;
            }).join('');

            articlesList.innerHTML = articlesHTML;
        } catch (error) {
            console.error('Error loading articles:', error);
            articlesList.innerHTML = `
                <div class="no-articles">
                    <h3>Error Loading Articles</h3>
                    <p>There was an error loading your articles. Please try refreshing the page.</p>
                </div>
            `;
        }
    }

    // Delete article function
    window.deleteArticle = function(articleId) {
        if (confirm('Are you sure you want to delete this article?')) {
            try {
                const articles = JSON.parse(localStorage.getItem('articles') || '[]');
                const updatedArticles = articles.filter(article => article.id !== articleId);
                localStorage.setItem('articles', JSON.stringify(updatedArticles));
                loadArticles(); // Reload the list
                alert('Article deleted successfully!');
            } catch (error) {
                console.error('Error deleting article:', error);
                alert('Error deleting article. Please try again.');
            }
        }
    };

    // Edit article function (demo - redirects to create page)
    window.editArticle = function(articleId) {
        alert('Edit functionality would open the article in edit mode. For this demo, you can create a new article instead.');
        window.location.href = 'create-article.html';
    };

    // Load articles when page loads
    loadArticles();
});
