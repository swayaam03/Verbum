document.addEventListener('DOMContentLoaded', () => {
    const articleForm = document.getElementById('articleForm');
    const featureImageInput = document.getElementById('featureImage');
    const imagePreviewContainer = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const currentImageDiv = document.getElementById('currentImage');
    const currentImageSrc = document.getElementById('currentImageSrc');
    const articlePreviewArea = document.getElementById('articlePreviewArea');
    const previewTitle = document.getElementById('previewTitle');
    const previewAuthor = document.getElementById('previewAuthor');
    const previewDate = document.getElementById('previewDate');
    const previewArticleImage = document.getElementById('previewArticleImage');
    const previewContent = document.getElementById('previewContent');
    const articleContentTextarea = document.getElementById('articleContent');
    const articleIdInput = document.getElementById('articleId');

    // Get article ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    if (!articleId) {
        alert('No article ID provided');
        window.location.href = 'my-articles.html';
        return;
    }

    // Load article data
    function loadArticle() {
        fetch(`get-article.php?id=${articleId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const article = data.article;
                
                // Populate form fields
                articleIdInput.value = article.id;
                document.getElementById('articleTitle').value = article.title;
                document.getElementById('articleAuthor').value = article.author;
                articleContentTextarea.value = article.content;

                // Show current image if it exists
                if (article.image_path) {
                    currentImageSrc.src = article.image_path;
                    currentImageDiv.style.display = 'block';
                }
            } else {
                alert('Error: ' + (data.error || 'Failed to load article'));
                window.location.href = 'my-articles.html';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to load article. Please try again.');
            window.location.href = 'my-articles.html';
        });
    }

    // Load article on page load
    loadArticle();

    // --- Image Preview Logic ---
    featureImageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                imagePreviewContainer.style.display = 'block';
                // Hide current image when new image is selected
                currentImageDiv.style.display = 'none';
            };
            reader.readAsDataURL(file);
        } else {
            previewImage.src = '';
            imagePreviewContainer.style.display = 'none';
        }
    });

    // --- Preview Button Logic ---
    document.getElementById('previewButton').addEventListener('click', function() {
        const title = document.getElementById('articleTitle').value;
        const author = document.getElementById('articleAuthor').value || 'Anonymous';
        const content = articleContentTextarea.value;
        const imageFile = featureImageInput.files[0];

        // Update preview
        previewTitle.textContent = title || 'Untitled Article';
        previewAuthor.textContent = author;
        previewDate.textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        // Replace newlines with <br> for basic HTML rendering
        previewContent.innerHTML = content.replace(/\n/g, '<br>') || 'No content yet...';

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewArticleImage.src = e.target.result;
                previewArticleImage.style.display = 'block';
            };
            reader.readAsDataURL(imageFile);
        } else {
            previewArticleImage.src = '';
            previewArticleImage.style.display = 'none';
        }

        articlePreviewArea.style.display = 'block';
        articlePreviewArea.scrollIntoView({ behavior: 'smooth' });
    });

    // --- Form Submission Logic ---
    articleForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const title = document.getElementById('articleTitle').value;
        const author = document.getElementById('articleAuthor').value || 'Anonymous';
        const content = articleContentTextarea.value;
        const imageFile = featureImageInput.files[0];

        // Validate required fields
        if (!title.trim() || !content.trim()) {
            alert('Please fill in all required fields.');
            return;
        }

        // Show loading state
        const submitButton = document.querySelector('.submit-article-button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Updating...';
        submitButton.disabled = true;

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('article_id', articleId);
        formData.append('articleTitle', title);
        formData.append('articleAuthor', author);
        formData.append('articleContent', content);
        if (imageFile) {
            formData.append('featureImage', imageFile);
        }

        // Submit to backend
        fetch('update-article.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Article updated successfully!');
                window.location.href = 'my-articles.html';
            } else {
                alert('Error: ' + (data.error || 'Failed to update article'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to update article. Please try again.');
        })
        .finally(() => {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        });
    });

    // --- Cancel Button Logic ---
    document.getElementById('cancelButton').addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            window.location.href = 'my-articles.html';
        }
    });
}); 