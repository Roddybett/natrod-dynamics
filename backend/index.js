require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

// DATABASE CONNECTION
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// CREATE TABLE IF NOT EXISTS
pool.query(`
  CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT,
    message TEXT
  );
`)
.then(() => console.log("Contacts table ready"))
.catch(err => console.error(err));

// ROUTES

// TEST
app.get("/", (req, res) => {
  res.send("NATROD Backend Running 🚀");
});

// SAVE CONTACT
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const newContact = await pool.query(
      "INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3) RETURNING *",
      [name, email, message]
    );

    res.json(newContact.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error saving contact");
  }
});

// GET CONTACTS
app.get("/contacts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM contacts");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error fetching contacts");
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});