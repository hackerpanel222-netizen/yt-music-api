const YouTube = require("youtube-sr").default;

const COBALT_INSTANCES = [
  "https://cobalt-api.kwiatekmiki.com/",
  "https://cobalt.api.timelessnesses.me/",
  "https://api.cobalt.best/"
];

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { q, id } = req.query;

  try {
    if (q) {
      const results = await YouTube.search(q + " audio", { limit: 12, type: "video" });
      const list = results.map(v => ({
        id: v.id,
        title: v.title,
        artist: v.channel?.name || "YouTube",
        thumbnail: v.thumbnail?.url || ""
      }));
      return res.status(200).json(list);
    }

    if (id) {
      const ytUrl = `https://www.youtube.com/watch?v=${id}`;

      for (const endpoint of COBALT_INSTANCES) {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              url: ytUrl,
              downloadMode: "audio",
              audioFormat: "mp3"
            })
          });

          if (!response.ok) continue;
          const data = await response.json();
          if (data.url) {
            return res.status(200).json({ url: data.url });
          }
        } catch (e) {
          continue;
        }
      }

      return res.status(500).json({ error: "All audio instances busy, try again" });
    }

    return res.status(400).json({ error: "Pass ?q=songname or ?id=videoid" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};