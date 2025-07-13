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

    // --- Form Submission Logic ---
    articleForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        const title = document.getElementById('articleTitle').value;
        const author = document.getElementById('articleAuthor').value || 'Anonymous'; // Default to Anonymous
        const content = articleContentTextarea.value; // Get content from textarea
        const imageFile = featureImageInput.files[0];

        // For demonstration, log the article data to console
        console.log('--- New Article Data ---');
        console.log('Title:', title);
        console.log('Author:', author);
        console.log('Content:', content);
        if (imageFile) {
            console.log('Image File Name:', imageFile.name);
            console.log('Image File Type:', imageFile.type);
            console.log('Image File Size:', imageFile.size, 'bytes');
        } else {
            console.log('No feature image selected.');
        }
        console.log('------------------------');

        // --- Client-Side Preview Display ---
        previewTitle.textContent = title;
        previewAuthor.textContent = author;
        previewDate.textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        // Replace newlines with <br> for basic HTML rendering of textarea content
        previewContent.innerHTML = content.replace(/\n/g, '<br>'); 

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

        // In a real application, this is where you would send data to a backend server.
        // E.g., fetch('/api/articles', { method: 'POST', body: JSON.stringify({ title, author, content, imageFile: imageData }), headers: { 'Content-Type': 'application/json' }})
        // .then(response => response.json())
        // .then(data => console.log('Article published successfully:', data))
        // .catch(error => console.error('Error publishing article:', error));
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