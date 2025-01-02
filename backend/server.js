require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.stack);
    return;
  }
  console.log("Connected to MySQL as id " + db.threadId);
});

const JWT_SECRET = "your_jwt_secret_key";

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: "Error hashing password." });
    }

    // Insert user into database
    db.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword],
      (err, result) => {
        if (err) {
          console.error("Error inserting user into database:", err);
          return res.status(500).json({ message: "Error registering user." });
        }

        console.log("User registered successfully:", result);
        return res
          .status(201)
          .json({ message: "User registered successfully!" });
      }
    );
  });
});

// Login endpoint
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  // Check if user exists
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error checking user." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    bcrypt.compare(password, results[0].password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: "Error comparing password." });
      }

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: results[0].id }, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ message: "Login successful!", token });
    });
  });
});

app.get("/profile", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token." });
    }

    db.query(
      "SELECT email FROM users WHERE id = ?",
      [decoded.userId],
      (err, results) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Error retrieving user profile." });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: "User not found." });
        }

        res.json({ email: results[0].email });
      }
    );
  });
});

// Logout endpoint
app.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully." });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
