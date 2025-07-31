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
    const articleContentTextarea = document.getElementById('articleContent'); // For basic textarea

    // --- Image Preview Logic ---
    featureImageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                imagePreviewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file); // Reads the image file as a Data URL
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

        articlePreviewArea.style.display = 'block'; // Show the preview area
        articlePreviewArea.scrollIntoView({ behavior: 'smooth' }); // Scroll to preview
    });

    // --- Form Submission Logic ---
    articleForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        const title = document.getElementById('articleTitle').value;
        const author = document.getElementById('articleAuthor').value || 'Anonymous'; // Default to Anonymous
        const content = articleContentTextarea.value; // Get content from textarea
        const imageFile = featureImageInput.files[0];

        // Validate required fields
        if (!title.trim() || !content.trim()) {
            alert('Please fill in all required fields.');
            return;
        }

        // Create FormData object for file upload
        const formData = new FormData();
        formData.append('articleTitle', title);
        formData.append('articleAuthor', author);
        formData.append('articleContent', content);
        if (imageFile) {
            formData.append('featureImage', imageFile);
        }

        // Show loading state
        const submitButton = document.querySelector('.submit-article-button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Publishing...';
        submitButton.disabled = true;

        // Submit to backend
        fetch('submit-article.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
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
            alert('Failed to publish article. Please try again.');
        })
        .finally(() => {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        });
    });

    // --- Optional: Quill Rich Text Editor Initialization (Uncomment if using Quill) ---
    /*
    var quill = new Quill('#editor-container', {
        theme: 'snow', // 'snow' is a clean, modern theme
        placeholder: 'Write your article content here...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['link', 'image'],                                // link and image, etc.
                ['clean']                                         // remove formatting button
            ]
        }
    });

    // When submitting the form, get HTML content from Quill editor
    articleForm.addEventListener('submit', function(event) {
        event.preventDefault();
        // ... (other form field fetching) ...
        const content = quill.root.innerHTML; // Get HTML content from Quill
        // ... (rest of submission logic) ...
        // Update preview content:
        previewContent.innerHTML = content;
    });
    */

   /* ───────── Gemini Generate button ───────── */
document.getElementById('generateWithGemini').addEventListener('click', () => {
  const btn    = document.getElementById('generateWithGemini');
  const prompt = document.getElementById('aiPrompt').value.trim();

  if (!prompt){
    alert("Please enter a topic first.");
    return;
  }

  btn.textContent = "Generating…"; // Change button text to indicate processing

  fetch("generate-article.php",{
    method:"POST",
    headers:{ "Content-Type":"application/x-www-form-urlencoded" },
    body:"prompt="+encodeURIComponent(prompt)
  })
  .then(async res=>{
      if(!res.ok){
        const errText = await res.text(); // Read the error text from the response
        console.error("PHP proxy error:", errText); // Log the actual error from the PHP side
        throw new Error("HTTP error! status: " + res.status + ". Details: " + errText);
      }
      return res.json();
  })
  .then(data => {
    // Extract the content from the Gemini response
    const output = data.candidates?.[0]?.content?.parts?.[0]?.text || "AI did not return content.";

    // Set the article title and content
    document.getElementById('articleTitle').value = prompt;
    document.getElementById('articleContent').value = output;
  })
  .catch(err=>{
      console.error("Gemini fetch/parsing error:", err); // Log any errors during fetch or JSON parsing
      alert("Something went wrong generating content with AI. Please check the console for details.");
  })
  .finally(()=>{ 
      // Always reset button text
      btn.textContent = "🪄 Generate with AI"; 
  });
});

});