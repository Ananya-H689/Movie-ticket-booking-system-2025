const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET shows by movie_id
router.get("/", async (req, res) => {
  const movieId = req.query.movie_id;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM shows WHERE movie_id = ? ORDER BY show_time",
      [movieId]
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
