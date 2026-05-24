document.addEventListener('DOMContentLoaded', function() {
    const newsContainer = document.getElementById('newsContainer');
    const loadingMessage = document.getElementById('loadingMessage');
    const paginationContainer = document.getElementById('paginationContainer');

    let currentPage = 1;
    let totalPages = 1;

    // Load news from backend
    function loadNews(page = 1) {
        loadingMessage.textContent = "Loading news...";
        loadingMessage.style.display = "block";
        newsContainer.innerHTML = '';
        
        fetch(`fetch-all-articles.php?page=${page}&limit=10`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            loadingMessage.style.display = "none";
            
            if (data.success) {
                const articles = data.articles;
                currentPage = data.pagination.current_page;
                totalPages = data.pagination.total_pages;
                
                if (articles.length === 0) {
                    newsContainer.innerHTML = `
                        <div class="no-news">
                            <h3>No Articles Yet</h3>
                            <p>No articles have been published yet. Be the first to create one!</p>
                            <a href="create-article.html" class="btn btn-primary">Create Article</a>
                        </div>
                    `;
                    return;
                }

                const newsHTML = articles.map(article => {
                    const date = new Date(article.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    return `
                        <div class="news-item" data-article-id="${article.id}">
                            ${article.image_path ? `<img src="${article.image_path}" alt="Article Image" style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">` : ''}
                            <h3>${article.title}</h3>
                            <p class="meta">By ${article.author} on ${date}</p>
                            <div class="content-snippet">${article.content_preview}</div>
                            <div class="news-actions">
                                <button class="btn btn-primary" onclick="viewArticle(${article.id})">Read More</button>
                                <button class="btn btn-secondary" onclick="saveToLibrary(${article.id})">Save to Library</button>
                            </div>
                        </div>
                    `;
                }).join('');

                newsContainer.innerHTML = newsHTML;
                
                // Add pagination
                if (totalPages > 1) {
                    renderPagination();
                }
            } else {
                newsContainer.innerHTML = `
                    <div class="no-news">
                        <h3>Error Loading News</h3>
                        <p>${data.error || 'Failed to load news'}</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            loadingMessage.style.display = "none";
            newsContainer.innerHTML = `
                <div class="no-news">
                    <h3>Error Loading News</h3>
                    <p>There was an error loading the news. Please try refreshing the page.</p>
                </div>
            `;
        });
    }

    // Render pagination
    function renderPagination() {
        let paginationHTML = '<div class="pagination">';
        
        // Previous button
        if (currentPage > 1) {
            paginationHTML += `<button class="btn btn-secondary" onclick="changePage(${currentPage - 1})">Previous</button>`;
        }
        
        // Page numbers
        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            const activeClass = i === currentPage ? 'active' : '';
            paginationHTML += `<button class="btn ${activeClass}" onclick="changePage(${i})">${i}</button>`;
        }
        
        // Next button
        if (currentPage < totalPages) {
            paginationHTML += `<button class="btn btn-secondary" onclick="changePage(${currentPage + 1})">Next</button>`;
        }
        
        paginationHTML += '</div>';
        paginationContainer.innerHTML = paginationHTML;
    }

    // Change page function
    window.changePage = function(page) {
        if (page >= 1 && page <= totalPages) {
            loadNews(page);
        }
    };

    // View article function
    window.viewArticle = function(articleId) {
        window.location.href = `view-article.html?id=${articleId}`;
    };

    // Save to library function (will be implemented in Library backend)
    window.saveToLibrary = function(articleId) {
        alert('Save to library functionality will be implemented in the Library backend step.');
    };

    // Load news when page loads
    loadNews();
});

