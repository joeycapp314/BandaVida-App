require("dotenv").config();
const express = require("express");
const oracledb = require("oracledb");
const app = express();
const PORT = 5000;

app.use(express.json());

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING
};

// ===================== PLAYERS =====================

// GET all players
app.get("/players", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      "SELECT id, name, position, team FROM players ORDER BY id",
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  } finally {
    if (connection) await connection.close();
  }
});

// GET player by ID
app.get("/players/:id", async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      "SELECT id, name, position, team FROM players WHERE id = :id",
      [id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length === 0) return res.status(404).send("Player not found");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  } finally {
    if (connection) await connection.close();
  }
});

// ADD new player
app.post("/players", async (req, res) => {
  const { name, position, team } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      "INSERT INTO players (name, position, team) VALUES (:name, :position, :team)",
      { name, position, team },
      { autoCommit: true }
    );
    res.status(201).send("Player added");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  } finally {
    if (connection) await connection.close();
  }
});

// UPDATE player info
app.put("/players/:id", async (req, res) => {
  const { id } = req.params;
  const { name, position, team } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `UPDATE players 
       SET name = :name, position = :position, team = :team 
       WHERE id = :id`,
      { id, name, position, team },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) return res.status(404).send("Player not found");
    res.send("Player updated");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  } finally {
    if (connection) await connection.close();
  }
});

// DELETE player
app.delete("/players/:id", async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      "DELETE FROM players WHERE id = :id",
      [id],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) return res.status(404).send("Player not found");
    res.send("Player deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  } finally {
    if (connection) await connection.close();
  }
});

// ===================== ALERTS =====================

// GET all alerts
app.get("/alerts", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT a.id, a.player_id, a.message, a.timestamp, p.name AS player_name
       FROM alerts a
       LEFT JOIN players p ON a.player_id = p.id
       ORDER BY a.timestamp DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  } finally {
    if (connection) await connection.close();
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
