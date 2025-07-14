/* -----------------------------------------------------------
   news.js  –  Verbum News Feed  (with Save‑to‑Server bookmarks)
   -----------------------------------------------------------
   • Fetches news from multiple NewsAPI endpoints
   • Renders article cards with a round bookmark icon
   • Saves selected articles to the server via save-news.php
   • Shows “Load More” paging
----------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  /* ‑‑‑‑‑ 1.  Config ‑‑‑‑‑ */
  const API_KEY = '3102776ade394622badef9e9564ca712'; // ← your NewsAPI key
  const NEWS_API_URLS = [
    `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${API_KEY}`,
    `https://newsapi.org/v2/everything?q=tesla&sortBy=publishedAt&apiKey=${API_KEY}`
  ];

  const newsFeed    = document.getElementById('newsFeed');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  let   page        = 1;
  const pageSize    = 10;

  /* ‑‑‑‑‑ 2.  Fetch & render articles ‑‑‑‑‑ */
  async function fetchNews(pageNum = 1) {
    if (pageNum === 1) {
      newsFeed.innerHTML = '<p class="loading-message">Loading news…</p>';
      loadMoreBtn.style.display = 'none';
    }

    try {
      const promises = NEWS_API_URLS.map(url =>
        fetch(`${url}&page=${pageNum}&pageSize=${pageSize}`).then(r => r.json())
      );
      const results = await Promise.allSettled(promises);

      if (pageNum === 1) newsFeed.innerHTML = '';

      let articles = [];
      let more     = false;

      results.forEach(res => {
        if (res.status === 'fulfilled' && res.value.status === 'ok') {
          articles = articles.concat(res.value.articles);
          if (res.value.totalResults > pageNum * pageSize) more = true;
        } else {
          console.error('NewsAPI error:', res);
        }
      });

      articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      if (!articles.length) {
        newsFeed.innerHTML = '<p>No news available.</p>';
        return;
      }

      articles.forEach(a => appendCard(a));
      loadMoreBtn.style.display = more ? 'block' : 'none';
    } catch (err) {
      console.error('Fetch failed:', err);
      newsFeed.innerHTML = '<p>Error loading news.</p>';
    }
  }

  /* ‑‑‑‑‑ 3.  Build one card with bookmark icon ‑‑‑‑‑ */
  function appendCard(a) {
    if (!a.title || !a.url) return;

    const card = document.createElement('article');
    card.className = 'news-article-card';
    card.style.position = 'relative';           // needed for absolute btn

    const img = a.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image';

    card.innerHTML = `
      <img src="${img}" alt="${a.title}" class="article-image">
      <button class="bookmark-btn" title="Save article"
              data-article='${JSON.stringify(a)}'>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </button>

      <div class="article-content">
        <h3 class="article-title">
          <a href="${a.url}" target="_blank" rel="noopener noreferrer">${a.title}</a>
        </h3>
        <p class="article-source-date">
          ${a.source.name} • ${new Date(a.publishedAt).toLocaleDateString()}
        </p>
        <p class="article-description">${a.description ?? ''}</p>
      </div>
    `;
    newsFeed.appendChild(card);
  }

  /* ‑‑‑‑‑ 4.  Save / bookmark handler ‑‑‑‑‑ */
  newsFeed.addEventListener('click', async e => {
    const btn = e.target.closest('.bookmark-btn');
    if (!btn) return;

    if (btn.classList.contains('saved')) return; // already saved

    const article = JSON.parse(btn.dataset.article);

    try {
      const res  = await fetch('save-news.php', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(article)
      });
      const json = await res.json();

      if (json.success) {
        btn.classList.add('saved');
        btn.title = 'Saved!';
        btn.querySelector('svg').style.stroke = '#e91e63'; // pink fill
      } else {
        alert(json.error || 'Save failed');
      }
    } catch (err) {
      console.error(err);
      alert('Save failed.');
    }
  });

  /* ‑‑‑‑‑ 5.  Pagination button ‑‑‑‑‑ */
  loadMoreBtn.addEventListener('click', () => { page++; fetchNews(page); });

  /* ‑‑‑‑‑ 6.  Kick‑off first load ‑‑‑‑‑ */
  fetchNews();
});
