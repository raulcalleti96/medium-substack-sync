const fetch = require("node-fetch");
const fs = require("fs");
const { parseStringPromise } = require("xml2js");

// URLs de los feeds
const MEDIUM_FEED_URL = "https://medium.com/feed/@Raulcalleti";
const SUBSTACK_FEED_URL = "https://raulcalleti.substack.com/feed.xml";

// Función para obtener y convertir XML a JSON
async function fetchRSS(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`⚠ No articles found at ${url} (${response.status} ${response.statusText})`);
            return []; // Devuelve un array vacío si no hay artículos
        }

        const xmlData = await response.text();
        const jsonData = await parseStringPromise(xmlData, { explicitArray: false });

        // Medium usa 'rss.channel.item' y Substack usa 'rss.channel.item' también.
        return jsonData.rss.channel.item || [];
    } catch (error) {
        console.error(`❌ Error fetching ${url}:`, error.message);
        return []; // Devuelve un array vacío en caso de error
    }
}

// Función principal
async function fetchArticles() {
    console.log("Fetching Medium articles...");
    const mediumArticles = await fetchRSS(MEDIUM_FEED_URL);

    console.log("Fetching Substack articles...");
    const substackArticles = await fetchRSS(SUBSTACK_FEED_URL);

    // Formatear los artículos en JSON
    const articles = {
        medium: mediumArticles.map((article) => ({
            title: article.title,
            link: article.link,
            date: article.pubDate,
            description: article.description,
        })),
        substack: substackArticles.map((article) => ({
            title: article.title,
            link: article.link,
            date: article.pubDate,
            description: article.description,
        })),
    };

    // Guardar en archivo JSON
    fs.writeFileSync("articles.json", JSON.stringify(articles, null, 2));
    console.log("✅ Articles saved to articles.json");
}

// Ejecutar
fetchArticles();