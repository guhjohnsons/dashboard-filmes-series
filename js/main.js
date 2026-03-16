class AppMain {
    constructor() {
        this.storage = window.appStorage;
        this.api = window.appApi;
        this.ui = window.appUI;

        // Bind functions so `this` is correctly preserved in event listeners
        this.bindEvents();
        this.loadInitialData();
    }

    bindEvents() {
        // Form & Modals Actions
        document.getElementById('btn-close-modal-inline').addEventListener('click', () => this.ui.closeModal());

        // Star Rating logic
        document.querySelectorAll('.star-rating i').forEach(star => {
            star.addEventListener('click', (e) => {
                const val = e.target.dataset.val;
                document.getElementById('form-rating').value = val;
                this.updateStarVisuals(val);
            });
        });

        // Form Submit
        document.getElementById('media-form').addEventListener('submit', (e) => this.handleSaveMedia(e));

        // Form Image Preview update on URL typing
        document.getElementById('form-poster').addEventListener('input', (e) => {
            const url = e.target.value.trim();
            const previewBox = document.getElementById('form-cover-preview');
            if (url) {
                previewBox.innerHTML = `<img src="${url}" onerror="this.onerror=null; this.innerHTML='<span>Sem Capa</span>'">`;
            } else {
                previewBox.innerHTML = '<span>Sem Capa</span>';
            }
        });

        // Toggle seasons row based on type radio
        document.querySelectorAll('input[name="form-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const row = document.getElementById('series-seasons-row');
                row.style.display = e.target.value === 'series' ? 'block' : 'none';
            });
        });

        // Search API
        document.getElementById('btn-api-search').addEventListener('click', () => this.handleApiSearch());
        document.getElementById('api-search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleApiSearch();
        });

        // Filtering & Sorting
        document.getElementById('filter-status').addEventListener('change', () => this.refreshCurrentView());
        document.getElementById('filter-sort').addEventListener('change', () => this.refreshCurrentView());

        // Debounce setup for local search
        let searchTimeout;
        document.getElementById('local-search').addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.refreshCurrentView();
            }, 300); // 300ms delay
        });

        // Dashboard Filter
        document.getElementById('dash-filter-type').addEventListener('change', () => this.refreshDashboard());
        document.getElementById('dash-filter-status').addEventListener('change', () => this.refreshDashboard());

        // Backup & Export
        document.getElementById('btn-export-json').addEventListener('click', () => this.exportJson());
        document.getElementById('btn-export-csv').addEventListener('click', () => this.exportCsv());
        document.getElementById('btn-import-json').addEventListener('click', () => this.importJson());

        document.getElementById('btn-save-api-key').addEventListener('click', () => {
            const val = document.getElementById('tmdb-api-key').value.trim();
            this.storage.updateSettings({ tmdbApiKey: val });
            this.ui.showToast('Chave TMDB API salva com sucesso!');
            this.checkApiKeyStatus();
            document.getElementById('tmdb-api-key').value = '';
        });

        document.querySelectorAll('.btn-season-control').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const action = btn.dataset.action;
                const input = document.getElementById(targetId);
                let val = parseInt(input.value) || 0;

                if (action === 'inc') val++;
                else if (action === 'dec' && val > parseInt(input.min || 0)) val--;

                input.value = val;
            });
        });

        document.getElementById('btn-clear-data').addEventListener('click', async () => {
            const confirmed = await this.ui.confirmAction('Apagar TODOS OS DADOS de filmes e séries? Esta ação é irreversível!');
            if (confirmed) {
                this.storage.clearAll();
                this.refreshCurrentView();
                this.ui.showToast('Todos os dados foram apagados.');
            }
        });
    }

    loadInitialData() {
        this.checkApiKeyStatus();
        this.refreshDashboard();
    }

    checkApiKeyStatus() {
        const key = this.storage.getSettings()?.tmdbApiKey;
        if (key) {
            document.getElementById('tmdb-api-key').placeholder = '•••••••••••••••• (Configurada)';
        }
    }

    refreshDashboard() {
        const stats = this.storage.getStats();
        this.ui.renderDashboard(stats);

        let items = [...this.storage.getItems()];
        const typeFilter = document.getElementById('dash-filter-type').value;
        if (typeFilter !== 'all') {
            items = items.filter(i => i.type === typeFilter);
        }

        const statusFilter = document.getElementById('dash-filter-status').value;
        if (statusFilter !== 'all') {
            items = items.filter(i => i.status === statusFilter);
        }

        // Fix: Local Search filter in Dashboard
        const searchTerm = document.getElementById('local-search').value.toLowerCase();
        if (searchTerm) {
            items = items.filter(i => i.title.toLowerCase().includes(searchTerm));
        }

        items.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        const recentItems = items.slice(0, 54);

        const grid = document.getElementById('dashboard-recent-grid');
        grid.innerHTML = '';
        if (recentItems.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; padding: 40px; text-align: center; width: 100%;">
                    <i class="fa-regular fa-face-meh" style="font-size: 32px; margin-bottom: 12px; opacity: 0.4;"></i>
                    <p style="color:var(--text-secondary);">Nenhum item adicionado no momento.</p>
                </div>
            `;
        } else {
            recentItems.forEach(item => {
                grid.appendChild(this.ui.createMediaCard(item));
            });
        }
    }

    refreshList(type) {
        let items = this.storage.getItems().filter(i => i.type === type);

        // Search Filter
        const searchTerm = document.getElementById('local-search').value.toLowerCase();
        if (searchTerm) {
            items = items.filter(i => i.title.toLowerCase().includes(searchTerm));
        }

        // Status Filter
        const statusVal = document.getElementById('filter-status').value;
        if (statusVal !== 'all') {
            items = items.filter(i => i.status === statusVal);
        }

        // Sorting
        const sortVal = document.getElementById('filter-sort').value;
        items.sort((a, b) => {
            if (sortVal === 'date_desc') return new Date(b.dateAdded) - new Date(a.dateAdded);
            if (sortVal === 'date_asc') return new Date(a.dateAdded) - new Date(b.dateAdded);
            if (sortVal === 'rating_desc') return parseInt(b.rating) - parseInt(a.rating);
            if (sortVal === 'title_asc') return a.title.localeCompare(b.title);
            return 0;
        });

        this.ui.renderList(items);
    }

    refreshCurrentView() {
        if (this.ui.currentView === 'dashboard') this.refreshDashboard();
        if (this.ui.currentView === 'movies') this.refreshList('movie');
        if (this.ui.currentView === 'series') this.refreshList('series');
    }

    // Modal State Transitions
    resetModalState() {
        document.getElementById('api-search-input').value = '';

        // Reset form
        document.getElementById('media-form').reset();
        document.getElementById('form-id').value = '';
        document.getElementById('form-rating').value = '0';
        this.updateStarVisuals(0);
        document.getElementById('form-year').value = '';
        document.getElementById('form-cover-preview').innerHTML = '<span>Sem Capa</span>';
        document.getElementById('series-seasons-row').style.display = 'none';
        document.getElementById('form-seasons-watched').value = '0';
        document.getElementById('form-seasons-total').value = '1';
    }

    autoFillForm(apiData) {
        if (apiData) {
            document.getElementById('form-title').value = apiData.title;
            // set radio
            document.querySelector(`input[name="form-type"][value="${apiData.type}"]`).checked = true;
            document.getElementById('form-year').value = apiData.year || '';
            document.getElementById('form-poster').value = apiData.poster;
            if (apiData.poster) {
                document.getElementById('form-cover-preview').innerHTML = `<img src="${apiData.poster}">`;
            }
            if (apiData.type === 'series') {
                document.getElementById('series-seasons-row').style.display = 'block';
                document.getElementById('form-seasons-total').value = apiData.totalSeasons || 1;
            } else {
                document.getElementById('series-seasons-row').style.display = 'none';
            }
        }
    }

    updateStarVisuals(val) {
        document.querySelectorAll('.star-rating i').forEach(star => {
            if (parseInt(star.dataset.val) <= parseInt(val)) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    async handleApiSearch() {
        const query = document.getElementById('api-search-input').value.trim();
        if (!query) {
            this.ui.showToast('Digite um código IMDB válido!', true);
            return;
        }

        const btn = document.getElementById('btn-api-search');
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        btn.disabled = true;

        try {
            const result = await this.api.searchByImdb(query);
            this.autoFillForm(result);
            this.ui.showToast('Dados preenchidos!');
        } catch (error) {
            this.ui.showToast(error.message || 'Erro ao buscar no TMDB.', true);
        } finally {
            btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Buscar Dados';
            btn.disabled = false;
        }
    }

    handleSaveMedia(e) {
        e.preventDefault();

        const id = document.getElementById('form-id').value;
        const title = document.getElementById('form-title').value;
        const type = document.querySelector('input[name="form-type"]:checked').value;
        const poster = document.getElementById('form-poster').value;
        const status = document.getElementById('form-status').value;
        const rating = document.getElementById('form-rating').value;
        const review = document.getElementById('form-review').value;
        const year = document.getElementById('form-year').value;
        const seasonsWatched = document.getElementById('form-seasons-watched').value;
        const seasonsTotal = document.getElementById('form-seasons-total').value;

        const data = {
            title, type, poster, status, rating, review, year,
            seasonsWatched: type === 'series' ? seasonsWatched : 0,
            seasonsTotal: type === 'series' ? seasonsTotal : 0
        };

        if (id) {
            this.storage.updateItem(id, data);
            this.ui.showToast('Item atualizado com sucesso!');
        } else {
            try {
                this.storage.addItem(data);
                this.ui.showToast('Item adicionado com sucesso!');
            } catch (error) {
                this.ui.showToast(error.message, true);
                return; // Don't close modal if error
            }
        }

        this.ui.closeModal();
        this.refreshCurrentView();
    }

    loadItemForEdit(item) {
        this.resetModalState();

        document.getElementById('form-id').value = item.id;
        document.getElementById('form-title').value = item.title;
        document.querySelector(`input[name="form-type"][value="${item.type}"]`).checked = true;
        document.getElementById('form-poster').value = item.poster || '';
        document.getElementById('form-status').value = item.status;
        document.getElementById('form-rating').value = item.rating || 0;
        this.updateStarVisuals(item.rating || 0);
        document.getElementById('form-year').value = item.year || '';
        document.getElementById('form-review').value = item.review || '';

        if (item.poster) {
            document.getElementById('form-cover-preview').innerHTML = `<img src="${item.poster}">`;
        }

        if (item.type === 'series') {
            document.getElementById('series-seasons-row').style.display = 'block';
            document.getElementById('form-seasons-watched').value = item.seasonsWatched || 0;
            document.getElementById('form-seasons-total').value = item.seasonsTotal || 1;
        } else {
            document.getElementById('series-seasons-row').style.display = 'none';
        }

        this.ui.openModal();
    }

    // Export & Import Logic
    exportJson() {
        const items = this.storage.getItems();
        const dataStr = JSON.stringify({ items: items }, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const backupFilename = `cinegu_backup_${dateStr}.json`;
        this.downloadFile(dataBlob, backupFilename);
    }

    exportCsv() {
        const items = this.storage.getItems();
        if (items.length === 0) {
            this.ui.showToast('Não há dados para exportar.', true);
            return;
        }

        const headers = ['Tipo', 'Título', 'Status', 'Avaliação', 'Data de Adição', 'Revisão'];
        const csvRows = [headers.join(',')];

        items.forEach(item => {
            const row = [
                item.type,
                `"${(item.title || '').replace(/"/g, '""')}"`,
                item.status,
                item.rating || 0,
                item.dateAdded || '',
                `"${(item.review || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(','));
        });

        // Add BOM for proper unicode (UTF-8) opening in Excel
        const dataStr = "\uFEFF" + csvRows.join('\n');
        const dataBlob = new Blob([dataStr], { type: 'text/csv;charset=utf-8;' });
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const exportFilename = `cinegu_export_${dateStr}.csv`;
        this.downloadFile(dataBlob, exportFilename);
    }

    importJson() {
        const fileInput = document.getElementById('file-import-json');
        const file = fileInput.files[0];
        if (!file) {
            this.ui.showToast('Selecione um arquivo .json primeiro.', true);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const success = this.storage.importData(content);
            if (success) {
                this.ui.showToast('Backup restaurado com sucesso!');
                this.refreshCurrentView();
                fileInput.value = ''; // clear
            } else {
                this.ui.showToast('Erro: Arquivo JSON inválido.', true);
            }
        };
        reader.readAsText(file);
    }

    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize Application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.appMain = new AppMain();
});
