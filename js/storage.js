class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'cinegu_data';
        this.data = this.loadData();
    }

    loadData() {
        const defaultData = {
            settings: { tmdbApiKey: '' },
            items: []
        };
        const legacyKey = 'cinedash_data';

        try {
            // Tenta carregar dados já migrados (CineGu)
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                return JSON.parse(raw);
            }

            // Compatibilidade: se existir o storage antigo (CineDash), migra para a nova chave
            const legacyRaw = localStorage.getItem(legacyKey);
            if (legacyRaw) {
                const parsed = JSON.parse(legacyRaw);
                localStorage.setItem(this.STORAGE_KEY, legacyRaw);
                localStorage.removeItem(legacyKey);
                return parsed;
            }

            return defaultData;
        } catch (e) {
            console.error('Error loading data', e);
            return defaultData;
        }
    }

    saveData() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    }

    getSettings() {
        return this.data.settings;
    }

    updateSettings(settings) {
        this.data.settings = { ...this.data.settings, ...settings };
        this.saveData();
    }

    getItems() {
        return this.data.items;
    }

    addItem(item) {
        if (!item.id) item.id = 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        item.dateAdded = new Date().toISOString();
        this.data.items.push(item);
        this.saveData();
        return item;
    }

    updateItem(id, updates) {
        const index = this.data.items.findIndex(i => i.id === id);
        if (index !== -1) {
            this.data.items[index] = { ...this.data.items[index], ...updates };
            this.saveData();
            return this.data.items[index];
        }
        return null;
    }

    removeItem(id) {
        this.data.items = this.data.items.filter(i => i.id !== id);
        this.saveData();
    }

    clearAll() {
        this.data.items = [];
        this.saveData();
    }

    importData(jsonData) {
        try {
            const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            if (parsed && Array.isArray(parsed.items)) {
                this.data.items = parsed.items;
                this.saveData();
                return true;
            }
            return false;
        } catch (e) {
            console.error("Invalid JSON format", e);
            return false;
        }
    }

    getStats() {
        const movies = this.data.items.filter(i => i.type === 'movie');
        const series = this.data.items.filter(i => i.type === 'series');
        const activeItems = this.data.items.filter(i => i.rating > 0);

        const baseStatusCounts = {
            completed: 0,
            watching: 0,
            plan_to_watch: 0,
            dropped: 0
        };

        const movieStatusCounts = movies.reduce((acc, item) => {
            if (item.status && acc.hasOwnProperty(item.status)) {
                acc[item.status]++;
            }
            return acc;
        }, { ...baseStatusCounts });

        const seriesStatusCounts = series.reduce((acc, item) => {
            if (item.status && acc.hasOwnProperty(item.status)) {
                acc[item.status]++;
            }
            return acc;
        }, { ...baseStatusCounts });

        let avgRating = 0;
        if (activeItems.length > 0) {
            const totalRating = activeItems.reduce((sum, item) => sum + parseInt(item.rating), 0);
            avgRating = (totalRating / activeItems.length).toFixed(1);
        }

        return {
            totalMovies: movies.length,
            totalSeries: series.length,
            averageRating: avgRating,
            movieStatusCounts,
            seriesStatusCounts,
            recentItems: [...this.data.items].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 5)
        };
    }
}

window.appStorage = new StorageManager();
