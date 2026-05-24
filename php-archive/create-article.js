document.addEventListener('DOMContentLoaded', () => {
    const articleForm = document.getElementById('articleForm');
    const featureImageInput = document.getElementById('featureImage');
    const imagePreviewContainer = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const articlePreviewArea = document.getElementById('articlePreviewArea');
    const previewTitle = document.getElementById('previewTitle');
    const previewAuthor = document.getElementById('previewAuthor');
    const previewDate = document.getElementById('previewDate');
    const previewArticleImage = document.getElementById('previewArticleImage');
    const previewContent = document.getElementById('previewContent');
    const articleContentTextarea = document.getElementById('articleContent');

    // --- Image Preview Logic ---
    featureImageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                imagePreviewContainer.style.display = 'block';
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

        // Replace newlines with <br> for basic HTML rendering of textarea content
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

    // --- Form Submission Logic (Backend) ---
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
        submitButton.textContent = 'Publishing...';
        submitButton.disabled = true;

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('articleTitle', title);
        formData.append('articleAuthor', author);
        formData.append('articleContent', content);
        if (imageFile) {
            formData.append('featureImage', imageFile);
        }

        // Submit to backend
        fetch('submit-article.php', {
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
                alert('Article published successfully!');
                
                // Reset form
                articleForm.reset();
                imagePreviewContainer.style.display = 'none';
                articlePreviewArea.style.display = 'none';
                
                // Redirect to my articles page
                window.location.href = 'my-articles.html';
            } else {
                alert('Error: ' + (data.error || 'Failed to publish article'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to publish article. Please check:\n1. You are logged in\n2. All required fields are filled\n\nTry again or contact support if the issue persists.');
        })
        .finally(() => {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        });
    });

    // --- AI Generator (Frontend Demo) ---
    document.getElementById('generateWithGemini').addEventListener('click', () => {
        const btn = document.getElementById('generateWithGemini');
        const prompt = document.getElementById('aiPrompt').value.trim();

        if (!prompt) {
            alert("Please enter a topic first.");
            return;
        }

        btn.textContent = "Generating…";

        // Simulate AI generation (frontend demo)
        setTimeout(() => {
            const demoContent = `This is a demo article about "${prompt}". 

In this comprehensive guide, we'll explore the various aspects of this topic and provide valuable insights for readers.

Key points to consider:
• Understanding the basics
• Exploring advanced concepts
• Practical applications
• Best practices and tips

This demo content shows how the AI generation would work in a real application. The actual implementation would connect to an AI service like Gemini or ChatGPT.`;

            // Set the article title and content
            document.getElementById('articleTitle').value = prompt;
            document.getElementById('articleContent').value = demoContent;
            
            btn.textContent = "🪄 Generate with AI";
        }, 2000);
    });
});