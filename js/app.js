// MovieFR - Application principale
// Gère l'interface, les événements et les appels API

class MovieFR {
  constructor() {
    this.movies = [];
    this.favorites = [];
    this.watchlist = [];
    this.currentCategory = 'all';
    this.init();
  }

  async init() {
    console.log('🎬 Initialisation de MovieFR v3.0.2');
    
    // Enregistrer le Service Worker
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/service-worker.js');
        console.log('✅ Service Worker enregistré');
      } catch (error) {
        console.log('⚠️ Service Worker non supporté:', error);
      }
    }

    // Charger les favoris depuis le stockage local
    await this.loadFavorites();
    
    // Initialiser la base de données IndexedDB
    await this.initDB();
    
    // Charger les films
    await this.loadMovies();
    
    // Configurer les événements
    this.setupEventListeners();
    
    // Afficher le prompt d'installation
    this.setupInstallPrompt();
    
    console.log('✅ MovieFR prêt');
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MovieFRDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('📦 Base de données IndexedDB prête');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('movies')) {
          db.createObjectStore('movies', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('watchlist')) {
          db.createObjectStore('watchlist', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('favorites')) {
          db.createObjectStore('favorites', { keyPath: 'id' });
        }
      };
    });
  }

  async loadMovies() {
    try {
      // Données de démonstration
      this.movies = [
        {
          id: 1,
          title: 'Inception',
          year: 2010,
          rating: 8.8,
          genre: 'Sci-Fi',
          poster: '🎬',
          description: 'Un voleur qui vole les secrets corporatifs du subconscient pendant que les gens rêvent.'
        },
        {
          id: 2,
          title: 'Intersteller',
          year: 2014,
          rating: 8.6,
          genre: 'Sci-Fi',
          poster: '🚀',
          description: 'Une équipe d\'astronautes voyage à travers un trou de ver pour trouver un monde habitable.'
        },
        {
          id: 3,
          title: 'The Dark Knight',
          year: 2008,
          rating: 9.0,
          genre: 'Action',
          poster: '🦇',
          description: 'Batman affronte le Joker, un criminel qui veut plonger Gotham dans le chaos.'
        },
        {
          id: 4,
          title: 'Pulp Fiction',
          year: 1994,
          rating: 8.9,
          genre: 'Crime',
          poster: '🔫',
          description: 'Les vies de plusieurs criminels de Los Angeles s\'entrelacent dans des histoires de violence et rédemption.'
        },
        {
          id: 5,
          title: 'Forrest Gump',
          year: 1994,
          rating: 8.8,
          genre: 'Drama',
          poster: '🏃',
          description: 'L\'histoire extraordinaire d\'un homme qui traverse les événements marquants de l\'histoire américaine.'
        },
        {
          id: 6,
          title: 'The Shawshank Redemption',
          year: 1994,
          rating: 9.3,
          genre: 'Drama',
          poster: '⛓️',
          description: 'L\'histoire d\'amitié entre deux prisonniers dans une prison à sécurité maximale.'
        }
      ];
      
      console.log(`✅ ${this.movies.length} films chargés`);
      this.displayMovies();
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
    }
  }

  setupEventListeners() {
    // Recherche
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.searchMovies(e.target.value));
    }

    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        this.currentCategory = link.dataset.category;
        this.displayMovies();
      });
    });

    // Boutons CTA
    const discoverBtn = document.getElementById('discoverBtn');
    if (discoverBtn) {
      discoverBtn.addEventListener('click', () => this.scrollToMovies());
    }

    const watchlistBtn = document.getElementById('watchlistBtn');
    if (watchlistBtn) {
      watchlistBtn.addEventListener('click', () => this.showWatchlist());
    }

    // Modal
    const closeBtn = document.getElementById('closeModal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    // Fermer modal au clic en dehors
    const modal = document.getElementById('movieModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
    }

    // Thème sombre
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleDarkMode());
    }
  }

  displayMovies() {
    const grid = document.getElementById('moviesGrid');
    if (!grid) return;

    const filtered = this.currentCategory === 'all' 
      ? this.movies 
      : this.movies.filter(m => m.genre.toLowerCase() === this.currentCategory);

    grid.innerHTML = filtered.map(movie => `
      <div class="movie-card ${this.favorites.some(f => f.id === movie.id) ? 'favorited' : ''}" data-id="${movie.id}">
        <div class="movie-poster">
          <span style="font-size: 4rem; display: flex; align-items: center; justify-content: center; height: 100%;">
            ${movie.poster}
          </span>
        </div>
        <div class="movie-info">
          <div class="movie-title">${movie.title}</div>
          <div class="movie-meta">
            <span>${movie.year}</span>
            <div class="rating">
              <span class="star">⭐</span>
              <span>${movie.rating}</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Ajouter les événements aux cartes
    grid.querySelectorAll('.movie-card').forEach(card => {
      card.addEventListener('click', () => this.showMovieDetails(parseInt(card.dataset.id)));
    });
  }

  showMovieDetails(id) {
    const movie = this.movies.find(m => m.id === id);
    if (!movie) return;

    const details = document.getElementById('movieDetails');
    const isFavorited = this.favorites.some(f => f.id === id);

    details.innerHTML = `
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="font-size: 6rem; margin-bottom: 1rem;">${movie.poster}</div>
        <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">${movie.title}</h2>
        <p style="color: #aaa; margin-bottom: 1rem;">${movie.year} • ${movie.genre}</p>
      </div>
      
      <div style="margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
          <span style="font-size: 1.5rem;">⭐ ${movie.rating}</span>
          <div style="flex: 1; background: #333; border-radius: 10px; height: 8px; overflow: hidden;">
            <div style="background: #ff6b6b; width: ${movie.rating * 10}%; height: 100%;"></div>
          </div>
        </div>
      </div>

      <p style="line-height: 1.8; margin-bottom: 2rem; color: #ccc;">
        ${movie.description}
      </p>

      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <button onclick="app.toggleFavorite(${id})" class="btn btn-primary" style="flex: 1;">
          ${isFavorited ? '❤️ Retirer des favoris' : '🤍 Ajouter aux favoris'}
        </button>
        <button onclick="app.addToWatchlist(${id})" class="btn btn-secondary" style="flex: 1;">
          📋 À regarder
        </button>
      </div>
    `;

    document.getElementById('movieModal').classList.add('active');
  }

  toggleFavorite(id) {
    const movie = this.movies.find(m => m.id === id);
    const index = this.favorites.findIndex(f => f.id === id);
    
    if (index > -1) {
      this.favorites.splice(index, 1);
      console.log('❌ Retiré des favoris');
    } else {
      this.favorites.push(movie);
      console.log('❤️ Ajouté aux favoris');
    }
    
    this.saveFavorites();
    this.displayMovies();
    this.showMovieDetails(id);
  }

  async addToWatchlist(id) {
    const movie = this.movies.find(m => m.id === id);
    if (!this.watchlist.some(w => w.id === id)) {
      this.watchlist.push(movie);
      await this.saveWatchlist();
      console.log('✅ Ajouté à la watchlist');
    }
  }

  async showWatchlist() {
    const details = document.getElementById('movieDetails');
    
    if (this.watchlist.length === 0) {
      details.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">📋</div>
          <h2>Votre watchlist est vide</h2>
          <p style="color: #aaa; margin-top: 1rem;">Ajoutez des films pour les regarder plus tard</p>
        </div>
      `;
    } else {
      details.innerHTML = `
        <h2 style="margin-bottom: 2rem;">Ma Watchlist</h2>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${this.watchlist.map(movie => `
            <div style="background: #1a1a1a; padding: 1rem; border-radius: 10px; display: flex; gap: 1rem; align-items: center;">
              <span style="font-size: 3rem;">${movie.poster}</span>
              <div style="flex: 1;">
                <div style="font-weight: bold; margin-bottom: 0.5rem;">${movie.title}</div>
                <div style="color: #aaa; font-size: 0.9rem;">${movie.year} • ${movie.genre}</div>
              </div>
              <button onclick="app.removeFromWatchlist(${movie.id})" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                ✕
              </button>
            </div>
          `).join('')}
        </div>
      `;
    }
    
    document.getElementById('movieModal').classList.add('active');
  }

  async removeFromWatchlist(id) {
    this.watchlist = this.watchlist.filter(w => w.id !== id);
    await this.saveWatchlist();
    await this.showWatchlist();
  }

  searchMovies(query) {
    const grid = document.getElementById('moviesGrid');
    if (!grid) return;

    if (query.length === 0) {
      this.displayMovies();
      return;
    }

    const filtered = this.movies.filter(m =>
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.description.toLowerCase().includes(query.toLowerCase())
    );

    grid.innerHTML = filtered.map(movie => `
      <div class="movie-card" data-id="${movie.id}">
        <div class="movie-poster">
          <span style="font-size: 4rem; display: flex; align-items: center; justify-content: center; height: 100%;">
            ${movie.poster}
          </span>
        </div>
        <div class="movie-info">
          <div class="movie-title">${movie.title}</div>
          <div class="movie-meta">
            <span>${movie.year}</span>
            <div class="rating">
              <span class="star">⭐</span>
              <span>${movie.rating}</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.movie-card').forEach(card => {
      card.addEventListener('click', () => this.showMovieDetails(parseInt(card.dataset.id)));
    });
  }

  closeModal() {
    document.getElementById('movieModal').classList.remove('active');
  }

  scrollToMovies() {
    document.getElementById('moviesGrid').scrollIntoView({ behavior: 'smooth' });
  }

  toggleDarkMode() {
    document.body.style.filter = document.body.style.filter === 'invert(1)' ? 'none' : 'invert(1)';
  }

  setupInstallPrompt() {
    let deferredPrompt;
    const installBanner = document.getElementById('installBanner');
    const installBtn = document.getElementById('installBtn');
    const dismissBtn = document.getElementById('dismissInstall');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (installBanner) installBanner.classList.add('show');
    });

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`Installation ${outcome === 'accepted' ? 'acceptée' : 'refusée'}`);
          deferredPrompt = null;
          if (installBanner) installBanner.classList.remove('show');
        }
      });
    }

    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        if (installBanner) installBanner.classList.remove('show');
      });
    }

    window.addEventListener('appinstalled', () => {
      console.log('🎉 Merci d\'avoir installé MovieFR!');
      if (installBanner) installBanner.classList.remove('show');
    });
  }

  saveFavorites() {
    localStorage.setItem('moviefr_favorites', JSON.stringify(this.favorites));
  }

  async loadFavorites() {
    const saved = localStorage.getItem('moviefr_favorites');
    this.favorites = saved ? JSON.parse(saved) : [];
  }

  async saveWatchlist() {
    localStorage.setItem('moviefr_watchlist', JSON.stringify(this.watchlist));
  }

  async loadWatchlist() {
    const saved = localStorage.getItem('moviefr_watchlist');
    this.watchlist = saved ? JSON.parse(saved) : [];
  }
}

// Initialiser l'app au chargement du DOM
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new MovieFR();
});

// Support du mode hors ligne
if (!navigator.onLine) {
  console.log('📡 Mode hors ligne activé');
}

window.addEventListener('online', () => {
  console.log('📡 Connexion rétablie');
});

window.addEventListener('offline', () => {
  console.log('⚠️ Connexion perdue');
});
