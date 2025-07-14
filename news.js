const API_KEY = "your_news_api_key_here"; // Replace with your News API key
const BASE_URL = "https://newsapi.org/v2/top-headlines?country=in";

document.addEventListener("DOMContentLoaded", () => {
    fetchNews();
});

function fetchNews() {
    fetch(`${BASE_URL}&apiKey=${API_KEY}`)
        .then(res => res.json())
        .then(data => displayArticles(data.articles))
        .catch(err => console.error("Error fetching news:", err));
}

function displayArticles(articles) {
    const container = document.querySelector(".articles-grid");
    container.innerHTML = "";

    articles.forEach(article => {
        const card = document.createElement("article");
        card.className = "article-card";

        const img = document.createElement("img");
        img.src = article.urlToImage || "https://via.placeholder.com/600x400?text=No+Image";
        img.alt = article.title;
        img.className = "article-card-image";

        const contentDiv = document.createElement("div");
        contentDiv.className = "article-card-content";

        const title = document.createElement("h3");
        title.className = "article-card-title";
        title.textContent = article.title;

        const author = document.createElement("p");
        author.className = "article-card-author";
        author.textContent = article.author ? `By ${article.author}` : "Unknown Author";

        const desc = document.createElement("p");
        desc.className = "article-card-preview";
        desc.textContent = article.description || "No description available.";

        const date = document.createElement("p");
        date.className = "article-card-date";
        date.textContent = new Date(article.publishedAt).toLocaleDateString();

        const saveBtn = document.createElement("button");
        saveBtn.className = "save-button";
        saveBtn.innerHTML = "🔖";
        saveBtn.title = "Save this article";
        saveBtn.addEventListener("click", () => saveArticle(article));

        contentDiv.append(title, author, desc, date, saveBtn);
        card.append(img, contentDiv);
        container.append(card);
    });
}

function saveArticle(article) {
    const articleToSave = {
        title: article.title,
        author: article.author || "Unknown",
        image: article.urlToImage,
        description: article.description || "",
        url: article.url,
        date: article.publishedAt
    };

    fetch("http://localhost:8000/save-news.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(articleToSave)
    })
    .then(res => res.text())
    .then(response => {
        if (response.includes("success")) {
            alert("✅ Article saved!");
        } else {
            alert("❌ Save failed.");
            console.error("Save error:", response);
        }
    })
    .catch(err => {
        alert("❌ Save failed (network).");
        console.error("Save error:", err);
    });
}
