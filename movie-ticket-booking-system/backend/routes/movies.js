const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET movies
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM movies ORDER BY movie_id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
