const YouTube = require("youtube-sr").default;
const ytdl = require("@distube/ytdl-core");

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
      const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`);
      const format = ytdl.chooseFormat(info.formats, { quality: "highestaudio", filter: "audioonly" });
      return res.status(200).json({ url: format.url });
    }

    return res.status(400).json({ error: "Pass ?q=songname or ?id=videoid" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};