const YouTube = require("youtube-sr").default;

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
      // Cobalt API se bot-check bypass karke direct audio stream lo
      const response = await fetch("https://api.cobalt.tools/", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: `https://www.youtube.com/watch?v=${id}`,
          downloadMode: "audio",
          audioFormat: "mp3"
        })
      });

      const data = await response.json();
      if (data.url) {
        return res.status(200).json({ url: data.url });
      }
      return res.status(500).json({ error: data.error?.code || "Cobalt stream failed" });
    }

    return res.status(400).json({ error: "Pass ?q=songname or ?id=videoid" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};