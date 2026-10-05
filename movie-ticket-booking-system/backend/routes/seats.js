const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all seats for a show
router.get("/", async (req, res) => {
  const showId = req.query.show_id;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM seats WHERE show_id = ? ORDER BY seat_number ASC",
      [showId]
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MARK SEATS AS BOOKED
router.put("/mark", async (req, res) => {
  const { show_id, seats } = req.body;

  try {
    for (const sn of seats) {
      await pool.query(
        "UPDATE seats SET status = 'booked' WHERE show_id = ? AND seat_number = ?",
        [show_id, sn]
      );
    }

    res.json({ message: "Seats marked booked" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
