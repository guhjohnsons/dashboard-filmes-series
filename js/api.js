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

            // Extract year
            const dateStr = isMovie ? item.release_date : item.first_air_date;
            const year = dateStr ? dateStr.substring(0, 4) : '';

            return {
                type: type,
                title: localizedTitle,
                poster: item.poster_path ? `${this.imageBaseUrl}${item.poster_path}` : '',
                totalSeasons: totalSeasons,
                year: year
            };

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    async searchByTitle(query) {
        if (!this.hasApiKey()) {
            throw new Error('Chave TMDB não configurada! Vá em "Backup & Dados" e insira sua API Key.');
        }

        const apiKey = this.getApiKey();
        const encode = encodeURIComponent(query);

        const [moviesResp, tvResp] = await Promise.all([
            fetch(`${this.baseUrl}/search/movie?api_key=${apiKey}&query=${encode}&language=pt-BR&page=1`),
            fetch(`${this.baseUrl}/search/tv?api_key=${apiKey}&query=${encode}&language=pt-BR&page=1`)
        ]);

        const movies = moviesResp.ok ? (await moviesResp.json()).results || [] : [];
        const tvs    = tvResp.ok    ? (await tvResp.json()).results    || [] : [];

        const mapped = [
            ...movies.map(m => ({
                type: 'movie',
                title: (m.title !== m.original_title && m.original_title)
                    ? `${m.title} (${m.original_title})`
                    : m.title,
                poster: m.poster_path ? `${this.imageBaseUrl}${m.poster_path}` : '',
                year: m.release_date ? m.release_date.substring(0, 4) : '',
                popularity: m.popularity || 0
            })),
            ...tvs.map(t => ({
                type: 'series',
                title: (t.name !== t.original_name && t.original_name)
                    ? `${t.name} (${t.original_name})`
                    : t.name,
                poster: t.poster_path ? `${this.imageBaseUrl}${t.poster_path}` : '',
                year: t.first_air_date ? t.first_air_date.substring(0, 4) : '',
                popularity: t.popularity || 0,
                totalSeasons: 0
            }))
        ];

        return mapped.sort((a, b) => b.popularity - a.popularity);
    }
}

window.appApi = new ApiService();
