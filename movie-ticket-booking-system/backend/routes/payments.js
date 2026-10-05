const express = require("express");
const router = express.Router();
const pool = require("../db");

// CREATE PAYMENT
router.post("/", async (req, res) => {
  try {
    const { booking_id, amount, payment_mode } = req.body;

    if (!booking_id || !amount || !payment_mode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check booking exists
    const [found] = await pool.query(
      "SELECT booking_id FROM bookings WHERE booking_id = ?",
      [booking_id]
    );

    if (found.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Insert payment
    const [result] = await pool.query(
      "INSERT INTO payments (booking_id, amount, payment_mode) VALUES (?, ?, ?)",
      [booking_id, amount, payment_mode]
    );

    res.json({
      message: "Payment successful",
      payment_id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment failed" });
  }
});

module.exports = router;
