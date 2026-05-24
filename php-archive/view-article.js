document.addEventListener('DOMContentLoaded', () => {
    const loadingMessage = document.getElementById('loadingMessage');
    const articleContainer = document.getElementById('articleContainer');
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    const articleTitle = document.getElementById('articleTitle');
    const articleAuthor = document.getElementById('articleAuthor');
    const articleDate = document.getElementById('articleDate');
    const articleImage = document.getElementById('articleImage');
    const articleImageSrc = document.getElementById('articleImageSrc');
    const articleContent = document.getElementById('articleContent');
    const backButton = document.getElementById('backButton');
    const backToNewsButton = document.getElementById('backToNewsButton');
    const saveToLibraryButton = document.getElementById('saveToLibraryButton');

    // Get article ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    if (!articleId) {
        showError('No article ID provided');
        return;
    }

    // Load article data
    function loadArticle() {
        fetch(`view-article.php?id=${articleId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            loadingMessage.style.display = 'none';
            
            if (data.success) {
                displayArticle(data.article);
            } else {
                showError(data.error || 'Failed to load article');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Failed to load article. Please try again.');
        });
    }

    // Display article
    function displayArticle(article) {
        // Set title
        articleTitle.textContent = article.title;
        document.title = `${article.title} - Verbum`;

        // Set author and date
        articleAuthor.textContent = article.author;
        const date = new Date(article.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        articleDate.textContent = date;

        // Set image if exists
        if (article.image_path) {
            articleImageSrc.src = article.image_path;
            articleImage.style.display = 'block';
        } else {
            articleImage.style.display = 'none';
        }

        // Set content with proper formatting
        const formattedContent = article.content
            .replace(/\n\n/g, '</p><p>') // Double newlines become paragraph breaks
            .replace(/\n/g, '<br>'); // Single newlines become line breaks
        
        articleContent.innerHTML = `<p>${formattedContent}</p>`;

        // Show article container
        articleContainer.style.display = 'block';
    }

    // Show error
    function showError(message) {
        loadingMessage.style.display = 'none';
        errorMessage.textContent = message;
        errorContainer.style.display = 'block';
    }

    // Back button functionality
    backButton.addEventListener('click', () => {
        window.location.href = 'news.html';
    });

    backToNewsButton.addEventListener('click', () => {
        window.location.href = 'news.html';
    });

    // Save to library functionality (will be implemented in Library backend)
    saveToLibraryButton.addEventListener('click', () => {
        alert('Save to library functionality will be implemented in the Library backend step.');
    });

    // Load article on page load
    loadArticle();
}); 