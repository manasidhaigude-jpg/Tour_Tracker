const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");
const db = new Database("tourtracker.db");

const app = express();db.exec(`
    CREATE TABLE IF NOT EXISTS users (
    db.exec(`
    CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        destination TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        budget REAL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`);
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);
const PORT = 3000;

// Read JSON data sent by the frontend
app.use(express.json());

// Serve existing frontend files
app.use(express.static(__dirname));

// Test backend API
app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        message: "Smart Tour Tracker Backend is running!"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Smart Tour Tracker running at http://localhost:${PORT}`);
});
// Register a new user
const bcrypt = require("bcryptjs");

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const insertUser = db.prepare(`
            INSERT INTO users (name, email, password_hash)
            VALUES (?, ?, ?)
        `);

        insertUser.run(
            name.trim(),
            email.trim().toLowerCase(),
            passwordHash
        );

        res.status(201).json({
            success: true,
            message: "Registration successful!"
        });

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// Login existing user
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter email and password"
            });
        }

        const user = db.prepare(
            "SELECT * FROM users WHERE email = ?"
        ).get(email.trim().toLowerCase());

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        res.json({
            success: true,
            message: "Login successful!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// Save a new trip
app.post("/api/trips", (req, res) => {
    try {
        const {
            user_id,
            destination,
            start_date,
            end_date,
            budget,
            notes
        } = req.body;

        if (!user_id || !destination) {
            return res.status(400).json({
                success: false,
                message: "User ID and destination are required"
            });
        }

        const user = db.prepare(
            "SELECT id FROM users WHERE id = ?"
        ).get(user_id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const result = db.prepare(`
            INSERT INTO trips
            (user_id, destination, start_date, end_date, budget, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            user_id,
            destination.trim(),
            start_date || null,
            end_date || null,
            budget === "" || budget == null ? null : Number(budget),
            notes || null
        );

        res.status(201).json({
            success: true,
            message: "Trip saved successfully!",
            trip_id: result.lastInsertRowid
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to save trip"
        });
    }
});
// View trips for a user
app.get("/api/trips/:user_id", (req, res) => {
    try {
        const userId = Number(req.params.user_id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const trips = db.prepare(`
            SELECT id, destination, start_date, end_date,
                   budget, notes, created_at
            FROM trips
            WHERE user_id = ?
            ORDER BY id DESC
        `).all(userId);

        res.json({
            success: true,
            trips: trips
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch trips"
        });
    }
});