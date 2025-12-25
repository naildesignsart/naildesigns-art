const { setGlobalOptions } = require("firebase-functions");
const functions = require("firebase-functions");
const admin = require("firebase-admin");

setGlobalOptions({ maxInstances: 10 });

admin.initializeApp();
const db = admin.firestore();

const BASE_URL = "https://naildesigns.art";

// 🔧 अगर Firestore collection नाम अलग हों तो सिर्फ ये 2 बदलना
const POSTS_COL = "designs";
const CATS_COL = "categories";

function escXml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ✅ MAIN SITEMAP: /sitemap.xml
exports.sitemap = functions.https.onRequest(async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [catsSnap, postsSnap] = await Promise.all([
      db.collection(CATS_COL).get(),
      db.collection(POSTS_COL).get(),
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Home
    xml += `  <url>\n    <loc>${BASE_URL}/</loc>\n    <lastmod>${today}</lastmod>\n    <priority>1.0</priority>\n  </url>\n`;

    // Categories
    catsSnap.forEach((doc) => {
      const c = doc.data();
      if (!c?.slug) return;
      xml += `  <url>\n    <loc>${BASE_URL}/category/${c.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Posts (published only)
    postsSnap.forEach((doc) => {
      const p = doc.data();
      if (p?.status !== "published" || !p?.slug) return;

      const lastmodRaw = p.publishedAt || new Date().toISOString();
      const lastmod = String(lastmodRaw).split("T")[0];

      xml += `  <url>\n    <loc>${BASE_URL}/nail-designs/${p.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=0, s-maxage=600, stale-while-revalidate=86400");
    res.status(200).send(xml);
  } catch (e) {
    res.status(500).send("sitemap error");
  }
});

// ✅ IMAGE SITEMAP: /image-sitemap.xml
exports.imageSitemap = functions.https.onRequest(async (req, res) => {
  try {
    const postsSnap = await db.collection(POSTS_COL).get();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    postsSnap.forEach((doc) => {
      const p = doc.data();
      if (p?.status !== "published" || !p?.slug || !p?.mainImage) return;

      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/nail-designs/${p.slug}</loc>\n`;
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${p.mainImage}</image:loc>\n`;
      xml += `      <image:title>${escXml(p.title || "")}</image:title>\n`;
      xml += `    </image:image>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=0, s-maxage=600, stale-while-revalidate=86400");
    res.status(200).send(xml);
  } catch (e) {
    res.status(500).send("image sitemap error");
  }
});
