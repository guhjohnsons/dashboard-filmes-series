class UIManager {
    constructor() {
        this.currentView = 'dashboard';
        this.charts = {};
        this.cacheDOM();
        this.bindEvents();
        this.applyTheme(localStorage.getItem('cine_theme') || 'dark');
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

        // Theme toggle
        const themeBtn = document.getElementById('btn-theme-toggle');
        if (themeBtn) themeBtn.addEventListener('click', () => this.toggleTheme());

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
            document.querySelector(`.nav-item[data-view="${viewName}"]`)?.classList.add('active');
        }

        // Animação de transição entre views
        this.views.forEach(view => {
            view.classList.remove('view-entering');
            view.classList.add('hidden');
        });
        const targetView = document.getElementById(`view-${viewName === 'movies' || viewName === 'series' ? 'list' : viewName}`);
        if (targetView) {
            targetView.classList.remove('hidden');
            requestAnimationFrame(() => targetView.classList.add('view-entering'));
        }

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

        this.renderCharts(stats);
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
            // lazy loading + placeholder blur
            posterHtml = `<img class="media-poster" src="${item.poster}" alt="" loading="lazy" decoding="async" onerror="this.onerror=null; this.outerHTML='<div class=\\'media-poster\\' style=\\'background: linear-gradient(135deg, ${fallbackBg}, #1e1e2e); display: flex; align-items: center; justify-content: center; font-size: 4rem; font-weight: bold; color: rgba(255,255,255,0.5);\\' aria-hidden=\\'true\\'>${letter}</div>'">`;
        } else {
            posterHtml = `<div class="media-poster" style="background: linear-gradient(135deg, ${fallbackBg}, #1e1e2e); display: flex; align-items: center; justify-content: center; font-size: 4rem; font-weight: bold; color: rgba(255,255,255,0.5);" aria-hidden="true">${letter}</div>`;
        }

        let statusClass = 'status-watching';
        let statusLabel = 'Assistindo';

        if (item.status === 'completed')    { statusClass = 'status-completed';    statusLabel = 'Assistido'; }
        if (item.status === 'plan_to_watch') { statusClass = 'status-plan_to_watch'; statusLabel = 'Quero Ver'; }
        if (item.status === 'dropped')       { statusClass = 'status-dropped';       statusLabel = 'Desisti'; }

        // Montar estrutura via innerHTML, mas incluir placeholder para o título (textContent aplicado depois)
        div.innerHTML = `
            ${posterHtml}
            <div class="status-badge ${statusClass}" aria-label="Status: ${statusLabel}">${statusLabel}</div>
            <div class="media-info">
                <div class="media-title" title="" data-title-slot></div>
                <div class="media-meta">
                    <span>
                        ${item.type === 'movie' ? 'Filme' : `Série (${item.seasonsWatched || 0}/${item.seasonsTotal || 1})`}
                    </span>
                    <div class="media-rating" aria-label="Avaliação: ${item.rating} de 5">
                        <i class="fa-solid fa-star" aria-hidden="true"></i>
                        <span>${item.rating}/5</span>
                    </div>
                </div>
                ${item.type === 'series' && item.seasonsTotal > 0 ? `
                <div class="season-progress" title="Progresso: ${item.seasonsWatched}/${item.seasonsTotal} temporadas" role="progressbar" aria-valuenow="${item.seasonsWatched}" aria-valuemin="0" aria-valuemax="${item.seasonsTotal}">
                    <div class="season-progress-fill" style="width: ${Math.min(100, (item.seasonsWatched / item.seasonsTotal) * 100)}%"></div>
                </div>
                ` : ''}
            </div>
            <button class="btn btn-danger w-100 btn-delete-item" aria-label="Remover ${item.title}">
                <i class="fa-solid fa-trash" aria-hidden="true"></i> Remover
            </button>
        `;

        // XSS FIX: título definido via textContent, não innerHTML
        const titleSlot = div.querySelector('[data-title-slot]');
        if (titleSlot) {
            titleSlot.title = item.title;
            const titleText = document.createTextNode(item.title);
            titleSlot.appendChild(titleText);
            if (item.year) {
                const yearSpan = document.createElement('span');
                yearSpan.style.cssText = 'font-size: 0.85em; opacity: 0.7; font-weight: 400;';
                yearSpan.textContent = ` (${item.year})`;
                titleSlot.appendChild(yearSpan);
            }
        }

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

        div.addEventListener('click', (e) => {
            if (e.target.closest('.btn-delete-item')) return;
            window.appMain.loadItemForEdit(item);
        });

        return div;
    }

    // ===================== TEMA =====================
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('cine_theme', theme);
        const btn = document.getElementById('btn-theme-toggle');
        if (!btn) return;
        const isLight = theme === 'light';
        btn.querySelector('i').className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        btn.querySelector('span').textContent = isLight ? 'Escuro' : 'Claro';
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        this.applyTheme(current === 'dark' ? 'light' : 'dark');
        // Atualiza gráficos com as novas cores
        const stats = window.appStorage?.getStats();
        if (stats) this.renderCharts(stats);
    }

    // ===================== GRÁFICOS =====================
    renderCharts(stats) {
        const items = window.appStorage?.getItems() || [];
        if (items.length === 0) {
            document.getElementById('charts-section')?.style && (document.getElementById('charts-section').style.display = 'none');
            return;
        }
        const chartsSection = document.getElementById('charts-section');
        if (chartsSection) chartsSection.style.display = 'grid';

        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const textColor    = isLight ? '#475569' : '#94a3b8';
        const gridColor    = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)';
        const tooltipBg    = isLight ? '#ffffff' : '#1e1e2e';
        const tooltipColor = isLight ? '#0f172a' : '#e2e8f0';

        const chartDefaults = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: textColor, font: { family: 'Outfit', size: 12 }, padding: 12, boxWidth: 12 } },
                tooltip: { backgroundColor: tooltipBg, titleColor: tooltipColor, bodyColor: tooltipColor }
            }
        };

        const destroy = (key) => { if (this.charts[key]) { this.charts[key].destroy(); delete this.charts[key]; } };

        // 1. Distribuição Filmes vs Séries
        const ctx1 = document.getElementById('chart-distribution');
        if (ctx1) {
            destroy('distribution');
            this.charts.distribution = new Chart(ctx1.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Filmes', 'Séries'],
                    datasets: [{ data: [stats.totalMovies, stats.totalSeries], backgroundColor: ['rgba(99,102,241,0.8)','rgba(16,185,129,0.8)'], borderColor: ['#6366f1','#10b981'], borderWidth: 2, hoverOffset: 6 }]
                },
                options: { ...chartDefaults, cutout: '60%', plugins: { ...chartDefaults.plugins, legend: { ...chartDefaults.plugins.legend, position: 'bottom' } } }
            });
        }

        // 2. Status breakdown (barras empilhadas)
        const ctx2 = document.getElementById('chart-status');
        if (ctx2) {
            destroy('status');
            const mc = stats.movieStatusCounts || {};
            const sc = stats.seriesStatusCounts || {};
            this.charts.status = new Chart(ctx2.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Assistido', 'Assistindo', 'Quero Ver', 'Desisti'],
                    datasets: [
                        { label: 'Filmes', data: [mc.completed||0,mc.watching||0,mc.plan_to_watch||0,mc.dropped||0], backgroundColor: 'rgba(99,102,241,0.75)', borderColor: '#6366f1', borderWidth: 1.5, borderRadius: 6 },
                        { label: 'Séries', data: [sc.completed||0,sc.watching||0,sc.plan_to_watch||0,sc.dropped||0], backgroundColor: 'rgba(16,185,129,0.75)', borderColor: '#10b981', borderWidth: 1.5, borderRadius: 6 }
                    ]
                },
                options: {
                    ...chartDefaults,
                    scales: {
                        x: { ticks: { color: textColor }, grid: { display: false } },
                        y: { ticks: { color: textColor, stepSize: 1 }, grid: { color: gridColor } }
                    }
                }
            });
        }

        // 3. Avaliação média (1–5 estrelas) — distribuição
        const ctx3 = document.getElementById('chart-ratings');
        if (ctx3) {
            destroy('ratings');
            const ratingDist = [0,0,0,0,0];
            items.forEach(i => { const r = parseInt(i.rating); if (r >= 1 && r <= 5) ratingDist[r-1]++; });
            this.charts.ratings = new Chart(ctx3.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['⭐ 1','⭐⭐ 2','⭐⭐⭐ 3','⭐⭐⭐⭐ 4','⭐⭐⭐⭐⭐ 5'],
                    datasets: [{ label: 'Avaliações', data: ratingDist, backgroundColor: ['rgba(239,68,68,0.7)','rgba(249,115,22,0.7)','rgba(245,158,11,0.7)','rgba(132,204,22,0.7)','rgba(16,185,129,0.7)'], borderColor: ['#ef4444','#f97316','#f59e0b','#84cc16','#10b981'], borderWidth: 1.5, borderRadius: 6, borderSkipped: false }]
                },
                options: {
                    ...chartDefaults,
                    plugins: { ...chartDefaults.plugins, legend: { display: false } },
                    scales: {
                        x: { ticks: { color: textColor }, grid: { display: false } },
                        y: { ticks: { color: textColor, stepSize: 1 }, grid: { color: gridColor } }
                    }
                }
            });
        }

        // 4. Consumo mensal (linha — quantos adicionados por mês, últimos 8 meses)
        const ctx4 = document.getElementById('chart-monthly');
        if (ctx4) {
            destroy('monthly');
            const monthMap = {};
            const now = new Date();
            for (let i = 7; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
                monthMap[key] = 0;
            }
            items.forEach(item => {
                if (!item.dateAdded) return;
                const d = new Date(item.dateAdded);
                const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
                if (monthMap[key] !== undefined) monthMap[key]++;
            });
            const labels = Object.keys(monthMap).map(k => { const [y,m] = k.split('-'); return new Date(y,m-1).toLocaleString('pt-BR',{month:'short',year:'2-digit'}); });
            this.charts.monthly = new Chart(ctx4.getContext('2d'), {
                type: 'line',
                data: {
                    labels,
                    datasets: [{ label: 'Adicionados', data: Object.values(monthMap), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#6366f1', pointRadius: 5 }]
                },
                options: {
                    ...chartDefaults,
                    plugins: { ...chartDefaults.plugins, legend: { display: false } },
                    scales: {
                        x: { ticks: { color: textColor }, grid: { display: false } },
                        y: { ticks: { color: textColor, stepSize: 1 }, grid: { color: gridColor } }
                    }
                }
            });
        }
    }

    // ===================== TOAST =====================
    showToast(message, isError = false) {
        const container = document.getElementById('toast-container');
        if (!container) {
            // Fallback: toast simples antigo
            const t = document.getElementById('toast');
            if (!t) return;
            t.textContent = message;
            t.style.borderLeftColor = isError ? 'var(--accent-red)' : 'var(--accent-green)';
            t.classList.remove('hidden');
            t.style.animation = 'none'; t.offsetHeight; t.style.animation = null;
            setTimeout(() => t.classList.add('hidden'), 3000);
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast-item ${isError ? 'toast-error' : 'toast-success'}`;
        toast.innerHTML = `<i class="fa-solid ${isError ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i><span></span>`;
        toast.querySelector('span').textContent = message;
        container.appendChild(toast);
        requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3200);
    }
}

window.appUI = new UIManager();
