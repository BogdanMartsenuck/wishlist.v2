import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const DB_PATH = path.join(__dirname, "wishlist.db");
let db;

(async () => {
  db = await open({ filename: DB_PATH, driver: sqlite3.Database });
})();

// GET all gifts
app.get("/api/gifts", async (req, res) => {
    try {
      const gifts = await db.all(`
        SELECT id, title AS name, image_url, links, taken AS is_taken, description FROM wishlist
      `);
      res.json(gifts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// POST toggle taken
app.post("/api/gifts/:id/toggle", async (req, res) => {
  const id = req.params.id;
  try {
    const gift = await db.get("SELECT * FROM wishlist WHERE id = ?", [id]);
    if (!gift) return res.status(404).json({ error: "Gift not found" });

    const newStatus = gift.taken ? 0 : 1;
    await db.run("UPDATE wishlist SET taken = ? WHERE id = ?", [newStatus, id]);
    res.json({ success: true, is_taken: newStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gifts — добавить новый подарок
app.post("/api/gifts", async (req, res) => {
    const { title, image_url, links, description } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });
  
    try {
      const result = await db.run(
        "INSERT INTO wishlist (title, image_url, links, description) VALUES (?, ?, ?, ?)",
        [title, image_url || null, links ? JSON.stringify(links) : null, description || null]
      );
      res.json({ success: true, id: result.lastID });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/gifts/:id", async (req, res) => {
    const id = req.params.id;
    const { description } = req.body;
  
    try {
      await db.run(
        `UPDATE wishlist SET description = ? WHERE id = ?`,
        [description, id]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/gifts/image/:id", async (req, res) => {
    const id = req.params.id;
    const { image_url } = req.body;
  
    try {
      await db.run(
        `UPDATE wishlist SET image_url = ? WHERE id = ?`,
        [image_url, id]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // DELETE /api/gifts/:id — удалить подарок
  app.delete("/api/gifts/:id", async (req, res) => {
    const id = req.params.id;
    try {
      await db.run("DELETE FROM wishlist WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));