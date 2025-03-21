const fetch = require("node-fetch");
const fs = require("fs");

// Proxy para convertir RSS a JSON (evita el 403 en Medium y Substack)
const MEDIUM_FEED_URL = `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@Raulcalleti`;
const SUBSTACK_FEED_URL = `https://api.rss2json.com/v1/api.json?rss_url=https://raulcalleti.substack.com/feed.xml`;

// Función para obtener y convertir RSS a JSON
async function fetchRSS(url) {
    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            },
        });

        if (!response.ok) {
            console.warn(`⚠ No articles found at ${url} (${response.status} ${response.statusText})`);
            return []; // Devuelve un array vacío si falla
        }

        const jsonData = await response.json();

        if (!jsonData.items || jsonData.items.length === 0) {
            console.warn(`⚠ No articles available from ${url}`);
            return [];
        }

        return jsonData.items; // Retorna los artículos en formato JSON
    } catch (error) {
        console.error(`❌ Error fetching ${url}:`, error.message);
        return []; // Devuelve un array vacío en caso de error
    }
}

// Función principal para obtener y guardar los artículos
async function fetchArticles() {
    console.log("📡 Fetching Medium articles...");
    const mediumArticles = await fetchRSS(MEDIUM_FEED_URL);

    console.log("📡 Fetching Substack articles...");
    const substackArticles = await fetchRSS(SUBSTACK_FEED_URL);

    // Formatear los artículos en JSON
    const articles = {
        medium: mediumArticles.map((article) => ({
            title: article.title,
            link: article.link,
            date: article.pubDate,
            description: article.description,
            thumbnail: article.thumbnail || null, // Imagen si está disponible
            categories: article.categories || [],
        })),
        substack: substackArticles.map((article) => ({
            title: article.title,
            link: article.link,
            date: article.pubDate,
            description: article.description,
            thumbnail: article.thumbnail || null,
            categories: article.categories || [],
        })),
    };

    // Guardar en archivo JSON
    fs.writeFileSync("articles.json", JSON.stringify(articles, null, 2));
    console.log("✅ Articles saved to articles.json");
}

// Ejecutar
fetchArticles();