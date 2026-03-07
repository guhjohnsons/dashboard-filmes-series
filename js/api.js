class ApiService {
    constructor() {
        this.baseUrl = 'https://api.themoviedb.org/3';
        this.imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
    }

    getApiKey() {
        return window.appStorage.getSettings()?.tmdbApiKey || '';
    }

    hasApiKey() {
        return !!this.getApiKey();
    }

    async searchByImdb(imdbId) {
        if (!imdbId) return null;

        imdbId = imdbId.trim();
        if (!imdbId.startsWith('tt')) {
            throw new Error('O código IMDB deve iniciar com "tt" (ex: tt4154664).');
        }

        if (!this.hasApiKey()) {
            throw new Error('Chave TMDB não configurada! Vá na aba de "Backup & Dados" e insira sua API Key.');
        }

        try {
            const apiKey = this.getApiKey();
            const response = await fetch(`${this.baseUrl}/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id&language=pt-BR`);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Chave da API (TMDB) inválida.');
                }
                throw new Error('Serviço TMDB temporariamente indisponível.');
            }

            const data = await response.json();

            // Check if we got a movie or a tv show back
            const isMovie = data.movie_results && data.movie_results.length > 0;
            const isTv = data.tv_results && data.tv_results.length > 0;

            if (!isMovie && !isTv) {
                throw new Error('Nenhum título encontrado com este código no TMDB.');
            }

            const item = isMovie ? data.movie_results[0] : data.tv_results[0];
            const type = isMovie ? 'movie' : 'series';

            // Fetches total seasons for tv shows
            let totalSeasons = 0;
            if (isTv) {
                const tvId = item.id;
                const tvResponse = await fetch(`${this.baseUrl}/tv/${tvId}?api_key=${apiKey}&language=pt-BR`);
                if (tvResponse.ok) {
                    const tvData = await tvResponse.json();
                    totalSeasons = tvData.number_of_seasons || 0;
                }
            }

            // Extract localized and original title
            let localizedTitle = isMovie ? item.title : item.name;
            const originalTitle = isMovie ? item.original_title : item.original_name;

            if (localizedTitle && originalTitle && localizedTitle.toLowerCase() !== originalTitle.toLowerCase()) {
                localizedTitle = `${localizedTitle} (${originalTitle})`;
            }

            return {
                type: type,
                title: localizedTitle,
                poster: item.poster_path ? `${this.imageBaseUrl}${item.poster_path}` : '',
                totalSeasons: totalSeasons
            };

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
}

window.appApi = new ApiService();
