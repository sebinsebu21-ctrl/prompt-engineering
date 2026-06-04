// Joke Manager - Handles API calls and joke data
class JokeManager {
    constructor() {
        this.baseUrl = 'https://official-joke-api.appspot.com';
        this.currentJoke = null;
        this.jokesLoaded = 0;
        this.favorites = this.loadFavorites();
    }

    async getRandomJoke(category = 'Any', format = 'any') {
        try {
            let url = `${this.baseUrl}/random_joke`;

            if (category && category !== 'Any') {
                url = `${this.baseUrl}/jokes/${category.toLowerCase()}/random`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const joke = await response.json();
            this.currentJoke = joke;
            this.jokesLoaded++;
            return joke;
        } catch (error) {
            console.error('Error fetching joke:', error);
            throw error;
        }
    }

    async getJokeByType(type = 'single') {
        try {
            let url = `${this.baseUrl}/random_joke`;

            if (type === 'twopart') {
                url = `${this.baseUrl}/jokes/${type}/random`;
            } else if (type === 'single') {
                // Keep default URL
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const joke = await response.json();
            this.currentJoke = joke;
            this.jokesLoaded++;
            return joke;
        } catch (error) {
            console.error('Error fetching joke:', error);
            throw error;
        }
    }

    async getProgrammingJoke() {
        try {
            const response = await fetch(`${this.baseUrl}/jokes/programming/random`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const joke = await response.json();
            this.currentJoke = joke;
            this.jokesLoaded++;
            return joke;
        } catch (error) {
            console.error('Error fetching programming joke:', error);
            throw error;
        }
    }

    async getKnockKnockJoke() {
        try {
            const response = await fetch(`${this.baseUrl}/jokes/knock-knock/random`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const joke = await response.json();
            this.currentJoke = joke;
            this.jokesLoaded++;
            return joke;
        } catch (error) {
            console.error('Error fetching knock-knock joke:', error);
            throw error;
        }
    }

    addFavorite(joke) {
        if (!this.favorites.some(j => j.id === joke.id)) {
            this.favorites.push(joke);
            this.saveFavorites();
            return true;
        }
        return false;
    }

    removeFavorite(jokeId) {
        this.favorites = this.favorites.filter(j => j.id !== jokeId);
        this.saveFavorites();
    }

    isFavorite(jokeId) {
        return this.favorites.some(j => j.id === jokeId);
    }

    saveFavorites() {
        localStorage.setItem('favoriteJokes', JSON.stringify(this.favorites));
    }

    loadFavorites() {
        const saved = localStorage.getItem('favoriteJokes');
        return saved ? JSON.parse(saved) : [];
    }

    getFavorites() {
        return this.favorites;
    }

    clearFavorites() {
        this.favorites = [];
        this.saveFavorites();
    }

    getJokeText(joke) {
        if (joke.setup && joke.delivery) {
            return { setup: joke.setup, delivery: joke.delivery };
        }
        return { setup: joke.joke, delivery: null };
    }
}

// UI Manager - Handles all UI interactions
class UIManager {
    constructor(jokeManager) {
        this.jokeManager = jokeManager;
        this.initElements();
        this.attachEventListeners();
        this.showEmptyState();
        this.updateStats();
        this.showFavorites();
        this.autoPlayNext = true;
        this.showNotifications = true;
    }

    initElements() {
        this.generateBtn = document.getElementById('generateBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.categorySelect = document.getElementById('categorySelect');
        this.formatSelect = document.getElementById('formatSelect');
        this.jokeContainer = document.getElementById('jokeContainer');
        this.emptyState = document.getElementById('emptyState');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        this.retryBtn = document.getElementById('retryBtn');
        this.jokeText = document.getElementById('jokeText');
        this.jokeDelivery = document.getElementById('jokeDelivery');
        this.jokeCategory = document.getElementById('jokeCategory');
        this.jokeType = document.getElementById('jokeType');
        this.copyBtn = document.getElementById('copyBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.favoriteBtn = document.getElementById('favoriteBtn');
        this.toggleFavoritesBtn = document.getElementById('toggleFavoritesBtn');
        this.clearFavoritesBtn = document.getElementById('clearFavoritesBtn');
        this.favoritesList = document.getElementById('favoritesList');
        this.noFavoritesMsg = document.getElementById('noFavoritesMsg');
        this.jokesCount = document.getElementById('jokesCount');
        this.favoritesCount = document.getElementById('favoritesCount');
        this.apiStatus = document.getElementById('apiStatus');
        this.randomCategoryBtn = document.getElementById('randomCategoryBtn');
        this.programmingJokeBtn = document.getElementById('programmingJokeBtn');
        this.knockKnockBtn = document.getElementById('knockKnockBtn');
        this.autoPlayNextBtn = document.getElementById('autoPlayNextBtn');
        this.showNotificationsBtn = document.getElementById('showNotificationsBtn');
        this.shareModal = document.getElementById('shareModal');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.shareText = document.getElementById('shareText');
        this.copyShareBtn = document.getElementById('copyShareBtn');
        this.shareTwitterBtn = document.getElementById('shareTwitterBtn');
        this.shareFacebookBtn = document.getElementById('shareFacebookBtn');
        this.modalClose = document.querySelector('.modal-close');
        this.notification = document.getElementById('notification');
        this.notificationText = document.getElementById('notificationText');
    }

    attachEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateJoke());
        this.refreshBtn.addEventListener('click', () => this.generateJoke());
        this.retryBtn.addEventListener('click', () => this.generateJoke());
        this.copyBtn.addEventListener('click', () => this.copyJoke());
        this.shareBtn.addEventListener('click', () => this.openShareModal());
        this.favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        this.toggleFavoritesBtn.addEventListener('click', () => this.toggleFavoritesView());
        this.clearFavoritesBtn.addEventListener('click', () => this.clearAllFavorites());
        this.randomCategoryBtn.addEventListener('click', () => this.randomCategory());
        this.programmingJokeBtn.addEventListener('click', () => this.getProgrammingJoke());
        this.knockKnockBtn.addEventListener('click', () => this.getKnockKnockJoke());
        this.autoPlayNextBtn.addEventListener('change', (e) => {
            this.autoPlayNext = e.target.checked;
        });
        this.showNotificationsBtn.addEventListener('change', (e) => {
            this.showNotifications = e.target.checked;
        });
        this.copyShareBtn.addEventListener('click', () => this.copyShareText());
        this.shareTwitterBtn.addEventListener('click', () => this.shareOnTwitter());
        this.shareFacebookBtn.addEventListener('click', () => this.shareOnFacebook());
        this.modalClose.addEventListener('click', () => this.closeShareModal());
        this.modalOverlay.addEventListener('click', () => this.closeShareModal());
    }

    async generateJoke() {
        try {
            this.showLoading();
            const category = this.categorySelect.value;
            const format = this.formatSelect.value;

            const joke = await this.jokeManager.getRandomJoke(category, format);
            this.displayJoke(joke);
            this.updateStats();
            this.setApiStatus(true);
        } catch (error) {
            this.showError('Failed to fetch joke. Please try again.');
            this.setApiStatus(false);
        }
    }

    async getProgrammingJoke() {
        try {
            this.showLoading();
            const joke = await this.jokeManager.getProgrammingJoke();
            this.displayJoke(joke);
            this.updateStats();
        } catch (error) {
            this.showError('Failed to fetch programming joke. Please try again.');
        }
    }

    async getKnockKnockJoke() {
        try {
            this.showLoading();
            const joke = await this.jokeManager.getKnockKnockJoke();
            this.displayJoke(joke);
            this.updateStats();
        } catch (error) {
            this.showError('Failed to fetch knock-knock joke. Please try again.');
        }
    }

    randomCategory() {
        const categories = ['General', 'Programming', 'Knock-knock'];
        const random = categories[Math.floor(Math.random() * categories.length)];
        this.categorySelect.value = random;
        this.generateJoke();
    }

    displayJoke(joke) {
        const joteText = this.jokeManager.getJokeText(joke);
        this.jokeText.textContent = joteText.setup;

        if (joteText.delivery) {
            this.jokeDelivery.textContent = joteText.delivery;
            this.jokeDelivery.classList.remove('hidden');
        } else {
            this.jokeDelivery.classList.add('hidden');
        }

        const category = joke.category ? joke.category.charAt(0).toUpperCase() + joke.category.slice(1) : 'General';
        this.jokeCategory.textContent = category;

        const type = joke.type === 'knock-knock' ? 'Knock-Knock' : 
                     joke.type === 'general' ? 'General' : 
                     joke.type === 'programming' ? 'Programming' :
                     (joke.setup ? 'Two-Part' : 'Single');
        this.jokeType.textContent = type;

        this.hideLoading();
        this.hideError();
        this.jokeContainer.classList.remove('hidden');
        this.emptyState.classList.add('hidden');

        this.updateFavoriteButton();
    }

    copyJoke() {
        const joteText = this.jokeManager.getJokeText(this.jokeManager.currentJoke);
        const text = joteText.delivery 
            ? `${joteText.setup}\n\n${joteText.delivery}` 
            : joteText.setup;
        
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Joke copied to clipboard!');
            if (this.autoPlayNext) {
                setTimeout(() => this.generateJoke(), 1500);
            }
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }

    toggleFavorite() {
        if (this.jokeManager.currentJoke) {
            const added = this.jokeManager.addFavorite(this.jokeManager.currentJoke);
            if (added) {
                this.showNotification('❤️ Added to favorites!');
            } else {
                this.jokeManager.removeFavorite(this.jokeManager.currentJoke.id);
                this.showNotification('💔 Removed from favorites');
            }
            this.updateFavoriteButton();
            this.updateStats();
            this.showFavorites();
            
            if (added && this.autoPlayNext) {
                setTimeout(() => this.generateJoke(), 1500);
            }
        }
    }

    updateFavoriteButton() {
        if (this.jokeManager.currentJoke && this.jokeManager.isFavorite(this.jokeManager.currentJoke.id)) {
            this.favoriteBtn.style.opacity = '1';
            this.favoriteBtn.style.background = 'rgba(231, 76, 60, 0.2)';
        } else {
            this.favoriteBtn.style.opacity = '0.7';
            this.favoriteBtn.style.background = '';
        }
    }

    toggleFavoritesView() {
        const isHidden = this.favoritesList.classList.contains('hidden');
        if (isHidden) {
            this.favoritesList.classList.remove('hidden');
            this.noFavoritesMsg.classList.add('hidden');
            this.toggleFavoritesBtn.textContent = 'Hide Favorites';
            this.showFavorites();
        } else {
            this.favoritesList.classList.add('hidden');
            this.toggleFavoritesBtn.textContent = 'Show Favorites';
        }
    }

    showFavorites() {
        const favorites = this.jokeManager.getFavorites();
        this.clearFavoritesBtn.disabled = favorites.length === 0;

        if (favorites.length === 0) {
            this.favoritesList.innerHTML = '';
            this.noFavoritesMsg.classList.remove('hidden');
            return;
        }

        this.favoritesList.innerHTML = favorites.map(joke => `
            <div class="favorite-item">
                <p>${this.jokeManager.getJokeText(joke).setup}</p>
                ${this.jokeManager.getJokeText(joke).delivery ? `<p style="color: var(--primary-color); font-weight: 600;">${this.jokeManager.getJokeText(joke).delivery}</p>` : ''}
                <div class="favorite-item-actions">
                    <button class="btn btn-action" onclick="uiManager.copyFavorite(${joke.id})">📋 Copy</button>
                    <button class="btn btn-action" onclick="uiManager.removeFavoriteItem(${joke.id})">🗑️ Remove</button>
                </div>
            </div>
        `).join('');

        this.noFavoritesMsg.classList.add('hidden');
    }

    copyFavorite(jokeId) {
        const joke = this.jokeManager.favorites.find(j => j.id === jokeId);
        if (joke) {
            const joteText = this.jokeManager.getJokeText(joke);
            const text = joteText.delivery 
                ? `${joteText.setup}\n\n${joteText.delivery}` 
                : joteText.setup;
            
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Joke copied to clipboard!');
            });
        }
    }

    removeFavoriteItem(jokeId) {
        this.jokeManager.removeFavorite(jokeId);
        this.updateStats();
        this.showFavorites();
        this.updateFavoriteButton();
        this.showNotification('Removed from favorites');
    }

    clearAllFavorites() {
        if (confirm('Are you sure you want to clear all favorites?')) {
            this.jokeManager.clearFavorites();
            this.showFavorites();
            this.updateStats();
            this.updateFavoriteButton();
            this.showNotification('All favorites cleared');
        }
    }

    openShareModal() {
        if (this.jokeManager.currentJoke) {
            const joteText = this.jokeManager.getJokeText(this.jokeManager.currentJoke);
            const text = joteText.delivery 
                ? `${joteText.setup}\n\n${joteText.delivery}` 
                : joteText.setup;
            
            this.shareText.value = text;
            this.shareModal.classList.remove('hidden');
            this.modalOverlay.classList.remove('hidden');
        }
    }

    closeShareModal() {
        this.shareModal.classList.add('hidden');
        this.modalOverlay.classList.add('hidden');
    }

    copyShareText() {
        navigator.clipboard.writeText(this.shareText.value).then(() => {
            this.showNotification('Text copied!');
        });
    }

    shareOnTwitter() {
        const text = encodeURIComponent(this.shareText.value);
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    }

    shareOnFacebook() {
        const text = encodeURIComponent(this.shareText.value);
        window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, '_blank');
    }

    updateStats() {
        this.jokesCount.textContent = this.jokeManager.jokesLoaded;
        this.favoritesCount.textContent = this.jokeManager.getFavorites().length;
    }

    setApiStatus(online) {
        if (online) {
            this.apiStatus.textContent = '✓ Online';
            this.apiStatus.className = 'stat-value status-ok';
        } else {
            this.apiStatus.textContent = '✗ Offline';
            this.apiStatus.className = 'stat-value status-error';
        }
    }

    showLoading() {
        this.loadingSpinner.classList.remove('hidden');
        this.jokeContainer.classList.add('hidden');
        this.emptyState.classList.add('hidden');
        this.errorMessage.classList.add('hidden');
    }

    hideLoading() {
        this.loadingSpinner.classList.add('hidden');
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.loadingSpinner.classList.add('hidden');
        this.jokeContainer.classList.add('hidden');
        this.emptyState.classList.add('hidden');
    }

    hideError() {
        this.errorMessage.classList.add('hidden');
    }

    showEmptyState() {
        this.emptyState.classList.remove('hidden');
        this.jokeContainer.classList.add('hidden');
        this.loadingSpinner.classList.add('hidden');
        this.errorMessage.classList.add('hidden');
    }

    showNotification(message) {
        if (this.showNotifications) {
            this.notificationText.textContent = message;
            this.notification.classList.remove('hidden');
            setTimeout(() => {
                this.notification.classList.add('hidden');
            }, 3000);
        }
    }
}

// Initialize App
let jokeManager;
let uiManager;

document.addEventListener('DOMContentLoaded', () => {
    jokeManager = new JokeManager();
    uiManager = new UIManager(jokeManager);
});
