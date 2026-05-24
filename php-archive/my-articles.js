document.addEventListener('DOMContentLoaded', function() {
    const articlesList = document.getElementById('articlesList');
    const loadingMessage = document.getElementById('loadingMessage');

    // Load articles from backend
    function loadArticles() {
        loadingMessage.textContent = "Loading articles...";
        
        fetch('fetch-articles.php')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const articles = data.articles;
                
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

                const articlesHTML = articles.map(article => {
                    const date = new Date(article.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    return `
                        <div class="article-item" data-article-id="${article.id}">
                            ${article.image_path ? `<img src="${article.image_path}" alt="Article Image">` : ''}
                            <h3>${article.title}</h3>
                            <p class="meta">By ${article.author} on ${date}</p>
                            <div class="content-snippet">${article.content_preview}</div>
                            <div class="article-actions">
                                <button class="btn btn-secondary" onclick="editArticle(${article.id})">Edit</button>
                                <button class="btn btn-danger" onclick="deleteArticle(${article.id})">Delete</button>
                            </div>
                        </div>
                    `;
                }).join('');

                articlesList.innerHTML = articlesHTML;
            } else {
                articlesList.innerHTML = `
                    <div class="no-articles">
                        <h3>Error Loading Articles</h3>
                        <p>${data.error || 'Failed to load articles'}</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            articlesList.innerHTML = `
                <div class="no-articles">
                    <h3>Error Loading Articles</h3>
                    <p>There was an error loading your articles. Please try refreshing the page.</p>
                </div>
            `;
        });
    }

    // Delete article function
    window.deleteArticle = function(articleId) {
        if (confirm('Are you sure you want to delete this article?')) {
            const formData = new FormData();
            formData.append('article_id', articleId);
            
            fetch('delete-article.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Article deleted successfully!');
                    loadArticles(); // Reload the list
                } else {
                    alert('Error: ' + (data.error || 'Failed to delete article'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to delete article. Please try again.');
            });
        }
    };

    // Edit article function
    window.editArticle = function(articleId) {
        // Redirect to edit page with article ID
        window.location.href = `edit-article.html?id=${articleId}`;
    };

    // Load articles when page loads
    loadArticles();
});
