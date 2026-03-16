class UIManager {
    constructor() {
        this.currentView = 'dashboard';
        this.cacheDOM();
        this.bindEvents();
    }

    cacheDOM() {
        // Navigation
        this.navItems = document.querySelectorAll('.nav-item');
        this.views = document.querySelectorAll('.view-container');
        this.pageTitle = document.getElementById('page-title');

        // Modals
        this.addModal = document.getElementById('add-modal');
        this.btnCloseModal = document.getElementById('btn-close-modal');
        this.btnOpenAddModal = document.getElementById('btn-open-add-modal');

        // Dashboard Stats
        this.statTotalMovies = document.getElementById('stat-total-movies');
        this.statTotalSeries = document.getElementById('stat-total-series');
        this.statAvgRating = document.getElementById('stat-avg-rating');
        this.dashboardGrid = document.getElementById('dashboard-recent-grid');

        // Dashboard status breakdown
        this.movieCompleted = document.getElementById('stat-movies-completed');
        this.movieWatching = document.getElementById('stat-movies-watching');
        this.moviePlan = document.getElementById('stat-movies-plan_to_watch');
        this.movieDropped = document.getElementById('stat-movies-dropped');

        this.seriesCompleted = document.getElementById('stat-series-completed');
        this.seriesWatching = document.getElementById('stat-series-watching');
        this.seriesPlan = document.getElementById('stat-series-plan_to_watch');
        this.seriesDropped = document.getElementById('stat-series-dropped');

        // List View
        this.listGrid = document.getElementById('list-grid');
        this.emptyState = document.getElementById('empty-state');
        this.filterStatus = document.getElementById('filter-status');
        this.filterSort = document.getElementById('filter-sort');
        this.localSearch = document.getElementById('local-search');

        // Toast
        this.toastEl = document.getElementById('toast');

        // Confirm Modal
        this.confirmModal = document.getElementById('confirm-modal');
        this.btnConfirmAction = document.getElementById('btn-confirm-action');
        this.btnConfirmCancel = document.getElementById('btn-confirm-cancel');
        this.confirmMessage = document.getElementById('confirm-message');
    }

    bindEvents() {
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const viewTarget = item.dataset.view;
                this.switchView(viewTarget, item);
            });
        });

        this.btnOpenAddModal.addEventListener('click', () => {
            window.appMain.resetModalState();
            this.openModal();
        });
        this.btnCloseModal.addEventListener('click', () => this.closeModal());

        // Close modal on outside click
        this.addModal.addEventListener('click', (e) => {
            if (e.target === this.addModal) this.closeModal();
        });

        this.confirmModal.addEventListener('click', (e) => {
            if (e.target === this.confirmModal) this.closeConfirmModal();
        });

        this.btnConfirmCancel.addEventListener('click', () => this.closeConfirmModal());

        // Keyboard Actions (Accessibility)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeConfirmModal();
            }
        });
    }

    switchView(viewName, navElement) {
        this.currentView = viewName;

        // Update Nav Active State
        this.navItems.forEach(nav => nav.classList.remove('active'));
        if (navElement) {
            navElement.classList.add('active');
        } else {
            document.querySelector(`.nav-item[data-view="${viewName}"]`).classList.add('active');
        }

        // Update Views Visibility
        this.views.forEach(view => view.classList.add('hidden'));
        document.getElementById(`view-${viewName === 'movies' || viewName === 'series' ? 'list' : viewName}`).classList.remove('hidden');

        // Update Title and Render Data
        if (viewName === 'dashboard') {
            this.pageTitle.innerText = 'Dashboard';
            window.appMain.refreshDashboard();
        } else if (viewName === 'movies') {
            this.pageTitle.innerText = 'Meus Filmes';
            window.appMain.refreshList('movie');
        } else if (viewName === 'series') {
            this.pageTitle.innerText = 'Minhas Séries';
            window.appMain.refreshList('series');
        } else if (viewName === 'settings') {
            this.pageTitle.innerText = 'Backup & Dados';
        }
    }

    openModal() {
        this.addModal.classList.add('active');
    }

    closeModal() {
        this.addModal.classList.remove('active');
    }

    openConfirmModal(message) {
        this.confirmMessage.innerText = message;
        this.confirmModal.classList.add('active');
    }

    closeConfirmModal() {
        this.confirmModal.classList.remove('active');
    }

    async confirmAction(message) {
        return new Promise((resolve) => {
            this.openConfirmModal(message);
            
            const handleConfirm = () => {
                this.closeConfirmModal();
                cleanup();
                resolve(true);
            };

            const handleCancel = () => {
                this.closeConfirmModal();
                cleanup();
                resolve(false);
            };

            const cleanup = () => {
                this.btnConfirmAction.removeEventListener('click', handleConfirm);
                this.btnConfirmCancel.removeEventListener('click', handleCancel);
            };

            this.btnConfirmAction.addEventListener('click', handleConfirm);
            this.btnConfirmCancel.addEventListener('click', handleCancel);
        });
    }

    renderDashboard(stats) {
        this.statTotalMovies.innerText = stats.totalMovies;
        this.statTotalSeries.innerText = stats.totalSeries;
        this.statAvgRating.innerText = stats.averageRating;

        if (stats.movieStatusCounts && stats.seriesStatusCounts) {
            this.movieCompleted.innerText = stats.movieStatusCounts.completed;
            this.movieWatching.innerText = stats.movieStatusCounts.watching;
            this.moviePlan.innerText = stats.movieStatusCounts.plan_to_watch;
            this.movieDropped.innerText = stats.movieStatusCounts.dropped;

            this.seriesCompleted.innerText = stats.seriesStatusCounts.completed;
            this.seriesWatching.innerText = stats.seriesStatusCounts.watching;
            this.seriesPlan.innerText = stats.seriesStatusCounts.plan_to_watch;
            this.seriesDropped.innerText = stats.seriesStatusCounts.dropped;
        }

        this.dashboardGrid.innerHTML = '';
        if (stats.recentItems.length === 0) {
            this.dashboardGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; padding: 40px; text-align: center; width: 100%;">
                    <i class="fa-regular fa-face-meh" style="font-size: 32px; margin-bottom: 12px; opacity: 0.4;"></i>
                    <p style="color:var(--text-secondary);">Nenhum item adicionado no momento.</p>
                </div>
            `;
        } else {
            const fragment = document.createDocumentFragment();
            stats.recentItems.forEach(item => {
                fragment.appendChild(this.createMediaCard(item));
            });
            this.dashboardGrid.appendChild(fragment);
        }
    }

    renderList(items) {
        this.listGrid.innerHTML = '';
        if (items.length === 0) {
            this.listGrid.classList.add('hidden');
            this.emptyState.classList.remove('hidden');
        } else {
            this.listGrid.classList.remove('hidden');
            this.emptyState.classList.add('hidden');
            const fragment = document.createDocumentFragment();
            items.forEach(item => {
                fragment.appendChild(this.createMediaCard(item));
            });
            this.listGrid.appendChild(fragment);
        }
    }

    createMediaCard(item) {
        const div = document.createElement('div');
        div.className = 'media-card';
        div.dataset.id = item.id;

        const letter = item.title ? item.title.charAt(0).toUpperCase() : '?';
        const colors = ['#f43f5e', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];
        const colorIndex = item.title ? item.title.length % colors.length : 0;
        const fallbackBg = colors[colorIndex];
        
        let posterHtml = '';
        if (item.poster) {
            posterHtml = `<img class="media-poster" src="${item.poster}" alt="${item.title}" onerror="this.onerror=null; this.outerHTML='<div class=\\'media-poster\\' style=\\'background: linear-gradient(135deg, ${fallbackBg}, #1e1e2e); display: flex; align-items: center; justify-content: center; font-size: 4rem; font-weight: bold; color: rgba(255,255,255,0.5);\\'>${letter}</div>'">`;
        } else {
            posterHtml = `<div class="media-poster" style="background: linear-gradient(135deg, ${fallbackBg}, #1e1e2e); display: flex; align-items: center; justify-content: center; font-size: 4rem; font-weight: bold; color: rgba(255,255,255,0.5);">${letter}</div>`;
        }

        let statusClass = 'status-watching';
        let statusLabel = 'Assistindo';

        if (item.status === 'completed') { statusClass = 'status-completed'; statusLabel = 'Assistido'; }
        if (item.status === 'plan_to_watch') { statusClass = 'status-plan_to_watch'; statusLabel = 'Quero Ver'; }
        if (item.status === 'dropped') { statusClass = 'status-dropped'; statusLabel = 'Desisti'; }

        div.innerHTML = `
            ${posterHtml}
            <div class="status-badge ${statusClass}">${statusLabel}</div>
            <div class="media-info">
                <div class="media-title" title="${item.title}">${item.title} ${item.year ? `<span style="font-size: 0.85em; opacity: 0.7; font-weight: 400;">(${item.year})</span>` : ''}</div>
                <div class="media-meta">
                    <span style="text-transform: capitalize;">
                        ${item.type === 'movie' ? 'Filme' : `Série (${item.seasonsWatched || 0}/${item.seasonsTotal || 1})`}
                    </span>
                    <div class="media-rating">
                        <i class="fa-solid fa-star"></i>
                        <span>${item.rating}/5</span>
                    </div>
                </div>
                ${item.type === 'series' && item.seasonsTotal > 0 ? `
                <div class="season-progress" title="Progresso: ${item.seasonsWatched}/${item.seasonsTotal} temporadas">
                    <div class="season-progress-fill" style="width: ${Math.min(100, (item.seasonsWatched / item.seasonsTotal) * 100)}%"></div>
                </div>
                ` : ''}
            </div>
            <button class="btn btn-danger w-100 btn-delete-item">
                <i class="fa-solid fa-trash"></i> Remover
            </button>
        `;

        const deleteBtn = div.querySelector('.btn-delete-item');
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const confirmed = await this.confirmAction(`Tem certeza que deseja remover "${item.title}"? Esta ação não pode ser desfeita.`);
            if (confirmed) {
                window.appStorage.removeItem(item.id);
                window.appMain.refreshCurrentView();
                this.showToast('Item removido com sucesso!');
            }
        });

        // Update/Edit behavior could be added here on click
        div.addEventListener('click', () => {
            window.appMain.loadItemForEdit(item);
        });

        return div;
    }

    showToast(message, isError = false) {
        this.toastEl.innerText = message;
        this.toastEl.style.borderLeftColor = isError ? 'var(--accent-red)' : 'var(--accent-green)';
        this.toastEl.classList.remove('hidden');

        // Handle consecutive toasts
        this.toastEl.style.animation = 'none';
        this.toastEl.offsetHeight; // trigger reflow
        this.toastEl.style.animation = null;

        setTimeout(() => {
            this.toastEl.classList.add('hidden');
        }, 3000);
    }
}

window.appUI = new UIManager();
