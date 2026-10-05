-- =====================================================================
-- Movie Ticket Booking System - schema + sample data used by the app
-- Run this file once in MySQL 8:   mysql -u root -p < app_schema.sql
-- (These table names match the backend code: users, movies, shows,
--  seats, bookings, payments.)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS movie_booking;
USE movie_booking;

DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS seats;
DROP TABLE IF EXISTS shows;
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  user_id  INT AUTO_INCREMENT PRIMARY KEY,
  name     VARCHAR(100) NOT NULL,
  email    VARCHAR(100) NOT NULL UNIQUE,
  phone    VARCHAR(15),
  password VARCHAR(255) NOT NULL            -- bcrypt hash (set by /api/auth/register)
);

CREATE TABLE movies (
  movie_id INT AUTO_INCREMENT PRIMARY KEY,
  title    VARCHAR(100) NOT NULL,
  genre    VARCHAR(50),
  rating   DECIMAL(3,1),
  duration INT                               -- minutes
);

CREATE TABLE shows (
  show_id   INT AUTO_INCREMENT PRIMARY KEY,
  movie_id  INT NOT NULL,
  show_date DATE,
  show_time TIME,
  FOREIGN KEY (movie_id) REFERENCES movies(movie_id)
);

CREATE TABLE seats (
  seat_id     INT AUTO_INCREMENT PRIMARY KEY,
  show_id     INT NOT NULL,
  seat_number VARCHAR(10) NOT NULL,
  status      ENUM('available','booked') DEFAULT 'available',
  UNIQUE KEY uq_show_seat (show_id, seat_number),
  FOREIGN KEY (show_id) REFERENCES shows(show_id)
);

CREATE TABLE bookings (
  booking_id   INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  show_id      INT NOT NULL,
  seats        TEXT NOT NULL,                -- JSON text, e.g. ["A1","A2"] (the API calls JSON.parse on it)
  booking_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (show_id) REFERENCES shows(show_id)
);

CREATE TABLE payments (
  payment_id   INT AUTO_INCREMENT PRIMARY KEY,
  booking_id   INT NOT NULL,
  amount       DECIMAL(10,2),
  payment_mode VARCHAR(20),
  payment_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- ---------------------- sample movies and shows ----------------------
INSERT INTO movies (title, genre, rating, duration) VALUES
 ('KGF 2','Action',8.5,168),
 ('Leo','Thriller',7.8,165),
 ('RRR','Action',8.7,182),
 ('Jailer','Action',7.4,168),
 ('Devara','Telugu Action',8.2,170);

INSERT INTO shows (movie_id, show_date, show_time) VALUES
 (1,'2025-11-15','18:00:00'),
 (1,'2025-11-15','21:00:00'),
 (2,'2025-11-16','17:00:00'),
 (3,'2025-11-16','19:00:00'),
 (4,'2025-11-17','16:00:00'),
 (5,'2025-11-17','20:00:00');

-- ------------- 80 seats per show: A1 ... A80, all available ----------
-- (helper table of numbers 1..80, then cross join with shows)
DROP TEMPORARY TABLE IF EXISTS nums;
CREATE TEMPORARY TABLE nums (n INT PRIMARY KEY);
INSERT INTO nums (n)
SELECT a.d + b.d * 10 + 1
FROM (SELECT 0 d UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
      UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a
CROSS JOIN
     (SELECT 0 d UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
      UNION SELECT 5 UNION SELECT 6 UNION SELECT 7) b;

INSERT INTO seats (show_id, seat_number)
SELECT s.show_id, CONCAT('A', nums.n)
FROM shows s CROSS JOIN nums;

DROP TEMPORARY TABLE nums;
-- Users are created through the Register page (passwords are hashed with bcrypt).
