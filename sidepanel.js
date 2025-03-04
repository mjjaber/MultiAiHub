document.addEventListener('DOMContentLoaded', function() {
  const browser = document.querySelector('#browser');
  const urlInput = document.querySelector('#url');
  const themeButton = document.querySelector('#theme');
  const themeSelect = document.querySelector('#theme-select');
  const addFavButton = document.querySelector('#add-fav');
  const favoritesButton = document.querySelector('#favorites');
  const favoritesDropdown = document.querySelector('#favorites-dropdown');
  let favorites = [];

  // Add this constant at the top of your file
  const DEFAULT_FAVORITES = [
    { url: 'https://chatgpt.com', title: 'chatgpt.com' },
    { url: 'https://chat.deepseek.com', title: 'chat.deepseek.com' },
    { url: 'https://gemini.google.com', title: 'gemini.google.com' },
    { url: 'https://copilot.microsoft.com', title: 'copilot.microsoft.com' },
    { url: 'https://claude.ai', title: 'claude.ai' },
    { url: 'https://grok.com', title: 'grok.com' },
    { url: 'https://chat.qwen.ai', title: 'chat.qwen.ai' },
    { url: 'https://perplexity.ai', title: 'perplexity.ai' }
  ];

  // Load saved theme
  chrome.storage.local.get(['theme'], function(result) {
    if (result.theme) {
      document.documentElement.setAttribute('data-theme', result.theme);
    }
  });

  // Load favorites from storage
  chrome.storage.local.get(['favorites'], function(result) {
    if (!result.favorites || result.favorites.length === 0) {
      // If no favorites exist, use the default ones
      favorites = DEFAULT_FAVORITES;
      chrome.storage.local.set({ favorites: DEFAULT_FAVORITES });
    } else {
      favorites = result.favorites;
    }
    updateAddFavButton();
    renderFavorites();
  });

  function loadUrl() {
    let url = urlInput.value;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
      urlInput.value = url;
    }
    browser.src = url;
  }

  function refreshPage() {
    browser.src = browser.src;
  }

  urlInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      loadUrl();
    }
  });

  browser.addEventListener('load', function() {
    urlInput.value = browser.src;
    updateAddFavButton();
  });

  // Theme selector functionality
  themeButton.addEventListener('click', () => {
    const isVisible = themeSelect.style.display === 'block';
    themeSelect.style.display = isVisible ? 'none' : 'block';
  });

  // Theme option selection
  document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.dataset.theme;
      document.documentElement.setAttribute('data-theme', theme);
      chrome.storage.local.set({ theme: theme });
      themeSelect.style.display = 'none';
    });
  });

  // Close theme selector when clicking outside
  document.addEventListener('click', function(e) {
    if (!themeButton.contains(e.target) && !themeSelect.contains(e.target)) {
      themeSelect.style.display = 'none';
    }
  });

  function updateAddFavButton() {
    const currentUrl = urlInput.value;
    const isFavorite = favorites.some(f => f.url === currentUrl);
    addFavButton.classList.toggle('active', isFavorite);
  }

  function addToFavorites() {
    const url = urlInput.value;
    const title = new URL(url).hostname.replace('www.', '');
    
    if (!favorites.some(f => f.url === url)) {
      favorites.push({ url, title });
      chrome.storage.local.set({ favorites });
      updateAddFavButton();
      renderFavorites();
    }
  }

  function removeFromFavorites(url) {
    favorites = favorites.filter(f => f.url !== url);
    chrome.storage.local.set({ favorites });
    updateAddFavButton();
    renderFavorites();
  }

  function renderFavorites() {
    const favoritesList = document.querySelector('#favorites-list');
    
    if (favorites.length === 0) {
      favoritesList.innerHTML = '<div class="no-favorites">No favorites added</div>';
      return;
    }

    favoritesList.innerHTML = favorites.map(f => `
      <div class="favorite-item">
        <span class="favorite-link" data-url="${f.url}">${f.title}</span>
        <button class="remove-fav">Remove</button>
      </div>
    `).join('');

    // Add click handlers
    favoritesList.querySelectorAll('.favorite-link').forEach(link => {
      link.addEventListener('click', () => {
        urlInput.value = link.dataset.url;
        loadUrl();
        favoritesDropdown.style.display = 'none';
      });
    });

    favoritesList.querySelectorAll('.remove-fav').forEach(button => {
      button.addEventListener('click', (e) => {
        const url = e.target.previousElementSibling.dataset.url;
        removeFromFavorites(url);
      });
    });
  }

  // Add favorite button click handler
  addFavButton.addEventListener('click', () => {
    const isFavorite = favorites.some(f => f.url === urlInput.value);
    if (isFavorite) {
      removeFromFavorites(urlInput.value);
    } else {
      addToFavorites();
    }
  });

  // Favorites button click handler
  favoritesButton.addEventListener('click', () => {
    const isVisible = favoritesDropdown.style.display === 'block';
    favoritesDropdown.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) {
      renderFavorites();
    }
  });

  // Close favorites dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!favoritesButton.contains(e.target) && 
        !favoritesDropdown.contains(e.target) &&
        !addFavButton.contains(e.target)) {
      favoritesDropdown.style.display = 'none';
    }
  });
}); 