require("dotenv").config();
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_CONNECT_STRING:", process.env.DB_CONNECT_STRING);


const express = require("express");
const oracledb = require("oracledb");
const app = express();
const PORT = 5000;
const { Expo } = require("expo-server-sdk");
const expo = new Expo();

app.use(express.json());

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING
};

// app.get("/player-debug-full", async (req, res) => {
//   let connection;
//   try {
//     connection = await oracledb.getConnection(dbConfig);

//     // 1️⃣ Current connected user
//     const userResult = await connection.execute(
//       `SELECT USER AS current_user FROM dual`,
//       [],
//       { outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );
//     const currentUser = userResult.rows[0].CURRENT_USER;

//     // 2️⃣ Current container (PDB)
//     const containerResult = await connection.execute(
//       `SELECT SYS_CONTEXT('USERENV','CON_NAME') AS container FROM dual`,
//       [],
//       { outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );
//     const currentContainer = containerResult.rows[0].CONTAINER;

//     // 3️⃣ List all tables visible to this user
//     const tablesResult = await connection.execute(
//       `SELECT table_name FROM all_tables WHERE owner = :owner`,
//       [currentUser],
//       { outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );
//     const tables = tablesResult.rows.map(r => r.TABLE_NAME);

//     // 4️⃣ Select raw rows from PLAYER table in this schema
//     let playerRows = [];
//     if (tables.includes("PLAYER")) {
//       const playerResult = await connection.execute(
//         `SELECT * FROM ${currentUser}.PLAYER`,
//         [],
//         { outFormat: oracledb.OUT_FORMAT_OBJECT }
//       );
//       playerRows = playerResult.rows;
//     }

//     // 5️⃣ Map columns for clarity
//     const players = playerRows.map(row => ({
//       name: row.NAME,
//       heightFeet: row.HEIGHT_FT,
//       heightInches: row.HEIGHT_IN,
//       weight: row.WEIGHT,
//       rest_rate: row.REST_RATE,
//       active_rate: row.ACTIVE_RATE,
//       base_bloodox: row.BASE_BLOODOX
//     }));

//     // Return everything in JSON
//     res.json({
//       currentUser,
//       currentContainer,
//       tables,
//       rawPlayerRows: playerRows,
//       mappedPlayers: players
//     });

//     console.log("DEBUG /player-debug-full result:", {
//       currentUser,
//       currentContainer,
//       tables,
//       rawPlayerRows: playerRows,
//       mappedPlayers: players
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Database debug error");
//   } finally {
//     if (connection) await connection.close();
//   }
// });


// app.get("/player-debug", async (req, res) => {
//   let connection;
//   try {
//     connection = await oracledb.getConnection(dbConfig);

//     // Force session to correct PDB
//     await connection.execute(`ALTER SESSION SET CONTAINER = XEPDB1`);

//     // Check connected user and container
//     const userResult = await connection.execute(
//       "SELECT USER AS username FROM dual",
//       [],
//       { outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );
//     console.log("Connected as user:", userResult.rows[0].USERNAME);

//     const containerResult = await connection.execute(
//       "SELECT SYS_CONTEXT('USERENV','CON_NAME') AS con_name FROM dual",
//       [],
//       { outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );
//     console.log("Connected to container:", containerResult.rows[0].CON_NAME);

//     // Query player table
//     const playerResult = await connection.execute(
//       `SELECT * FROM JCAPPA01.PLAYER`,
//       [],
//       { outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );
//     console.log("Raw player rows:", playerResult.rows);

//     const players = playerResult.rows.map(row => ({
//       name: row.NAME,
//       heightFeet: row.HEIGHT_FT,
//       heightInches: row.HEIGHT_IN,
//       weight: row.WEIGHT,
//       rest_rate: row.REST_RATE,
//       active_rate: row.ACTIVE_RATE,
//       base_bloodox: row.BASE_BLOODOX,
//       alert: false
//     }));
//     console.log("Mapped players:", players);

//     res.json(players);

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Database error");
//   } finally {
//     if (connection) await connection.close();
//   }
// });


// ===================== PLAYERS =====================

// GET all players
app.get("/player", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Check connected user
    const userResult = await connection.execute("SELECT USER FROM dual");
    console.log("Connected as:", userResult.rows[0][0]);

    // List tables visible to this user
    const tablesResult = await connection.execute(
      "SELECT table_name FROM user_tables"
    );
    console.log("Tables in schema:", tablesResult.rows.map(r => r[0]));
    console.log("Raw tablesResult.rows:", tablesResult.rows);


    // Query player table
    const result = await connection.execute(
      "SELECT * FROM player ORDER BY name",
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    console.log("Raw player rows:", result.rows);

    // Map columns for API
    const players = result.rows.map(row => ({
      name: row.NAME,
      height_ft: row.HEIGHT_FT,
      height_in: row.HEIGHT_IN,
      weight: row.WEIGHT,
      rest_rate: row.REST_RATE,
      active_rate: row.ACTIVE_RATE,
      base_bloodox: row.BASE_BLOODOX,
      alert: false
    }));

    console.log("Mapped players:", players);
    res.json(players);

  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  } finally {
    if (connection) await connection.close();
  }
});

// GET player by name
app.get("/player/:name", async (req, res) => {
  const { name } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      "SELECT * FROM player WHERE name = :name",
      [name],
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
app.post("/player", async (req, res) => {
  const { name, height_ft, height_in, weight, rest_rate, active_rate, base_bloodox } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      "INSERT INTO player VALUES (:name, :height_ft, :height_in, :weight, :rest_rate, :active_rate, :base_bloodox)",
      { name, height_ft, height_in, weight, rest_rate, active_rate, base_bloodox },
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
app.put("/player/:name", async (req, res) => {
  const { name } = req.params;
  const { height_ft, height_in, weight, rest_rate, active_rate, base_bloodox } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `UPDATE player 
       SET height_ft = :height_ft, height_in = :height_in, weight = :weight, rest_rate = :rest_rate, active_rate = :active_rate, base_bloodox = :base_bloodox 
       WHERE name = :name`,
      { name, height_ft, height_in, weight, rest_rate, active_rate, base_bloodox },
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
app.delete("/player/:name", async (req, res) => {
  const { name } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      "DELETE FROM player WHERE name = :name",
      [name],
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
app.get("/alert", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT *
       FROM alert a
       LEFT JOIN player p ON a.pname = p.name
       ORDER BY a.alert_id DESC`,
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

app.post("/alert", async (req, res) => {
  const data = req.body;
  console.log("Received alert:", data);

  try {
    const connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      `INSERT INTO alert (alert_id, alert_type, hilo, severity, magnitude, alert_time, pname)
       VALUES (:alert_id, :alert_type, :hilo, :severity, :magnitude, :alert_time, :pname)`,
      {
        alert_id: data.alert_id,
        alert_type: data.alert_type,
        hilo: data.hilo,
        severity: data.severity,
        magnitude: data.magnitude,
        alert_time: data.alert_time,
        pname: data.pname
      },
      { autoCommit: true }
    );

    res.json({ message: "Alert added successfully" });
  } catch (err) {
    console.error("Error inserting alert:", err);
    res.status(500).json({ error: "Database insert failed" });
  }
});

//notifications
// app.post("/register-token", async (req, res) => {
//   const { player_name, expo_token } = req.body;
//   let connection;
//   try {
//     connection = await oracledb.getConnection(dbConfig);
//     await connection.execute(
//       `MERGE INTO push_tokens t
//        USING dual
//        ON (t.player_name = :player_name)
//        WHEN MATCHED THEN UPDATE SET t.expo_token = :expo_token
//        WHEN NOT MATCHED THEN INSERT (player_name, expo_token)
//        VALUES (:player_name, :expo_token)`,
//       { player_name, expo_token },
//       { autoCommit: true }
//     );
//     res.status(200).send("Token saved");
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error saving token");
//   } finally {
//     if (connection) await connection.close();
//   }
// });

// let lastAlertId = 0; // track the last processed alert

// async function startAlertWatcher() {
//   let connection;
//   try {
//     connection = await oracledb.getConnection(dbConfig);
//     console.log("📡 Alert watcher started with polling...");

//     const poll = async () => {
//       try {
//         // Fetch only new alerts
//         const result = await connection.execute(
//           `SELECT * FROM alert WHERE alert_id > :lastId ORDER BY alert_id ASC`,
//           [lastAlertId],
//           { outFormat: oracledb.OUT_FORMAT_OBJECT }
//         );

//         for (const alert of result.rows) {
//           console.log("🚨 New alert detected:", alert);

//           // Update last processed ID
//           lastAlertId = alert.ALERT_ID;

//           // Send push notification
//           await sendPushNotification(alert);
//         }
//       } catch (err) {
//         console.error("❌ Polling error:", err);
//       } finally {
//         // Poll again after short interval
//         setTimeout(poll, 250); // 250 ms interval
//       }
//     };

//     // Start polling
//     poll();
//   } catch (err) {
//     console.error("❌ Error starting alert watcher:", err);
//     setTimeout(startAlertWatcher, 5000); // retry after 5s if connection fails
//   }
// }

// startAlertWatcher().catch(console.error);

// async function sendPushNotification(alert) {
//   let connection;
//   try {
//     connection = await oracledb.getConnection(dbConfig);

//     // Fetch all registered tokens
//     const tokenResult = await connection.execute(
//       `SELECT expo_token FROM push_tokens`,
//       [],
//       { outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );

//     if (tokenResult.rows.length === 0) return; // no tokens registered

//     const messages = tokenResult.rows
//       .map(row => row.EXPO_TOKEN)
//       .filter(token => Expo.isExpoPushToken(token))
//       .map(token => ({
//         to: token,
//         sound: "default",
//         title: `⚠️ ${alert.SEVERITY.toUpperCase()} ${alert.ALERT_TYPE} alert`,
//         body: `${alert.PNAME} is ${alert.HILO} (${alert.MAGNITUDE})`,
//       }));

//     if (messages.length > 0) {
//       await expo.sendPushNotificationsAsync(messages);
//       console.log(`📱 Notifications sent to ${messages.length} users`);
//     }
//   } catch (err) {
//     console.error("❌ Error sending push notification:", err);
//   } finally {
//     if (connection) await connection.close();
//   }
// }

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
