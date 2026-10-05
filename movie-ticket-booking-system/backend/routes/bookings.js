const express = require("express");
const router = express.Router();
const pool = require("../db");

/* ============================================================
   GET ALL BOOKINGS (JOIN USER + MOVIE + SHOW)
   ============================================================ */
router.get("/", async (req, res) => {
  try {
    const q = `
      SELECT 
        b.booking_id,
        u.name AS user_name,
        m.title AS movie_title,
        s.show_time,
        b.seats
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN shows s ON b.show_id = s.show_id
      JOIN movies m ON s.movie_id = m.movie_id
      ORDER BY b.booking_id DESC
    `;

    const [rows] = await pool.query(q);

    rows.forEach(b => {
      try { b.seats = JSON.parse(b.seats); }
      catch { b.seats = []; }
    });

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   GET SINGLE BOOKING DETAILS
   ============================================================ */
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM bookings WHERE booking_id = ?",
      [req.params.id]
    );

    if (!rows.length)
      return res.status(404).json({ error: "Booking not found" });

    const b = rows[0];
    b.seats = JSON.parse(b.seats);

    res.json(b);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   CREATE BOOKING
   ============================================================ */
router.post("/", async (req, res) => {
  try {
    const { user_id, show_id, seats } = req.body;

    const [result] = await pool.query(
      "INSERT INTO bookings (user_id, show_id, seats) VALUES (?, ?, ?)",
      [user_id, show_id, JSON.stringify(seats)]
    );

    const bookingId = result.insertId;

    // Mark seats booked
    for (const sn of seats) {
      await pool.query(
        "UPDATE seats SET status='booked' WHERE show_id=? AND seat_number=?",
        [show_id, sn]
      );
    }

    res.json({ message: "Booking created", booking_ids: [bookingId] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   UPDATE BOOKING SEATS
   ============================================================ */
router.put("/:id", async (req, res) => {
  try {
    const { seats } = req.body;

    await pool.query(
      "UPDATE bookings SET seats = ? WHERE booking_id = ?",
      [JSON.stringify(seats), req.params.id]
    );

    res.json({ message: "Booking updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   DELETE BOOKING (FIXED: delete payment FIRST)
   ============================================================ */
router.delete("/:id", async (req, res) => {
  try {
    const bookingId = req.params.id;

    // 1️⃣ Get user name for popup
    const [userRows] = await pool.query(
      `SELECT u.name AS user_name 
       FROM bookings b 
       JOIN users u ON b.user_id = u.user_id
       WHERE b.booking_id = ?`,
      [bookingId]
    );

    if (!userRows.length)
      return res.status(404).json({ error: "Booking not found" });

    const userName = userRows[0].user_name;

    // 2️⃣ Delete payments first (fixes FK 500 error)
    await pool.query("DELETE FROM payments WHERE booking_id = ?", [bookingId]);

    // 3️⃣ Delete booking
    await pool.query("DELETE FROM bookings WHERE booking_id = ?", [bookingId]);

    // 4️⃣ Send popup with username
    res.json({ message: `Booking deleted for: ${userName}` });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
