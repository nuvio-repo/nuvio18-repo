const MANIFEST = {
  id: "org.nuvio18.addon",
  version: "1.0.0",
  name: "Nuvio 18+ Catalog",
  description: "18+ Catalog and Search for Nuvio",
  resources: ["catalog", "meta", "stream"],
  types: ["movie"],
  idPrefixes: ["ep:"],
  catalogs: [
    {
      type: "movie",
      id: "eporner_top",
      name: "Eporner Popular",
      extra: [{ name: "search", isRequired: false }]
    }
  ]
};

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Content-Type", "application/json");

  const url = req.url || "";

  if (url.includes("/manifest.json")) {
    return res.status(200).send(JSON.stringify(MANIFEST));
  }

  // 1. Catalog & Search Handler
  if (url.includes("/catalog/movie/eporner_top")) {
    let query = "popular";
    const searchMatch = url.match(/search=([^&.]+)/);
    if (searchMatch) {
      query = decodeURIComponent(searchMatch[1]);
    }

    try {
      const apiRes = await fetch(
        `https://www.eporner.com/api/v2/video/search/?query=${encodeURIComponent(query)}&per_page=30&format=json`
      );
      const data = await apiRes.json();
      const metas = (data.videos || []).map((v) => ({
        id: `ep:${v.id}`,
        type: "movie",
        name: v.title,
        poster: v.default_thumb ? v.default_thumb.src : "",
        description: `Duration: ${v.length_min} | Views: ${v.views}`
      }));
      return res.status(200).send(JSON.stringify({ metas }));
    } catch (e) {
      return res.status(200).send(JSON.stringify({ metas: [] }));
    }
  }

  // 2. Meta Details Handler
  if (url.includes("/meta/movie/ep:")) {
    const idMatch = url.match(/ep:([^/.]+)/);
    const videoId = idMatch ? idMatch[1] : "";
    try {
      const apiRes = await fetch(
        `https://www.eporner.com/api/v2/video/id/?id=${videoId}&format=json`
      );
      const v = await apiRes.json();
      return res.status(200).send(
        JSON.stringify({
          meta: {
            id: `ep:${v.id}`,
            type: "movie",
            name: v.title,
            poster: v.default_thumb ? v.default_thumb.src : "",
            background: v.default_thumb ? v.default_thumb.src : "",
            description: `Views: ${v.views} | Rating: ${v.rate} | Duration: ${v.length_min}`
          }
        })
      );
    } catch (e) {
      return res.status(200).send(JSON.stringify({ meta: {} }));
    }
  }

  // 3. Stream Handler
  if (url.includes("/stream/movie/ep:")) {
    const idMatch = url.match(/ep:([^/.]+)/);
    const videoId = idMatch ? idMatch[1] : "";
    try {
      const apiRes = await fetch(
        `https://www.eporner.com/api/v2/video/id/?id=${videoId}&format=json`
      );
      const v = await apiRes.json();
      const streams = [];
      if (v && v.embed) {
        streams.push({
          name: "Eporner Player",
          title: v.title,
          externalUrl: v.embed
        });
      }
      return res.status(200).send(JSON.stringify({ streams }));
    } catch (e) {
      return res.status(200).send(JSON.stringify({ streams: [] }));
    }
  }

  return res.status(200).send(JSON.stringify(MANIFEST));
};
