// Example: listens to gateway USB serial, parses EVT messages and inserts alerts into Oracle

require('dotenv').config();
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const express = require('express');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');

const PORT = process.env.SERIAL_HTTP_PORT || 6000;
const SERIAL_PATH = process.env.GATEWAY_SERIAL_PATH || "COM6"; // set to your serial port
const SERIAL_BAUD = parseInt(process.env.GATEWAY_SERIAL_BAUD || "115200", 10);

const app = express();
app.use(bodyParser.json());

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING
};

// Open serial port
const port = new SerialPort({
  path: SERIAL_PATH,
  baudRate: SERIAL_BAUD,
});
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

parser.on('data', async (line) => {
  line = line.trim();
  // Gateway prefixes forwarded packets with "RADIO_RECV:"
  if (line.startsWith("RADIO_RECV:")) {
    const payload = line.slice("RADIO_RECV:".length);
    console.log("RF payload:", payload);

    // Expect EVT messages in new format:
    // EVT,<seq>,<t_ms>,<player_id>,<type>,<detail...>
    if (payload.startsWith("EVT,")) {
      // split into 6 parts at most
      const parts = payload.split(',');
      // parts[0] = EVT
      // parts[1] = seq
      // parts[2] = t_ms
      // parts[3] = player_id
      // parts[4] = type
      // parts[5..] = detail (may contain commas) -> rejoin
      if (parts.length >= 5) {
        const seq = parts[1];
        const t_ms = parts[2];
        const player = parts[3];
        const type = parts[4];
        const detail = parts.slice(5).join(',');

        console.log({ seq, t_ms, player, type, detail });

        // Convert to alert row to insert. You might want to parse detail further
        // Example insert into alert(alert_id, alert_type, hilo, severity, magnitude, alert_time, pname)
        // We will generate an alert_id using a sequence in Oracle or use a simple timestamp-based id.
        try {
          const conn = await oracledb.getConnection(dbConfig);

          // Build insertion values depending on event type
          // For simplicity, we map:
          // IMPACT -> alert_type 'impact', hilo 'high', severity 'minor' or 'major' depending on magnitude
          // HR_ALERT -> 'heart rate', check bpm vs rest/active inside detail (parsing)
          // SPO2_LOW -> 'blood oxygen', hilo 'low'
          // This is example logic; adapt to your schema and needs.

          let alertType = null, hilo = 'high', severity = 'minor', magnitude = null, alert_time = new Date().toLocaleString();

          if (type === 'IMPACT') {
            alertType = 'impact';
            // attempt to extract g=... from detail
            const m = detail.match(/g=([0-9.]+)|magnitude=([0-9.]+)/);
            if (m) magnitude = parseFloat(m[1] || m[2]);
            if (magnitude >= 75) severity = 'major';
            hilo = 'high';
          } else if (type === 'HR_ALERT') {
            alertType = 'heart rate';
            // extract bpm=..., rest=..., act=...
            const bpmM = detail.match(/bpm=(\d+)/);
            const restM = detail.match(/rest=(\d+)/);
            const actM = detail.match(/act=(\d+)/);
            if (bpmM) magnitude = parseFloat(bpmM[1]);
            // set high/low
            if (magnitude && actM && magnitude > parseFloat(actM[1])) hilo = 'high';
            else hilo = 'low';
            // severity heuristic
            severity = (magnitude && magnitude > 180) ? 'major' : 'minor';
          } else if (type === 'SPO2_LOW') {
            alertType = 'blood oxygen';
            const spo2M = detail.match(/%=(\d+)/);
            if (spo2M) magnitude = parseFloat(spo2M[1]);
            hilo = 'low';
            severity = (magnitude && magnitude < 85) ? 'major' : 'minor';
          } else {
            // debug or unknown
            alertType = type.toLowerCase();
            hilo = 'high';
            severity = 'minor';
          }

          // Determine a unique alert_id. Ideally use a DB sequence; here we'll use a timestamp + random
          //const alertId = Math.floor(Date.now() / 1000);

          const insertSql = `INSERT INTO alert (alert_type, hilo, severity, magnitude, alert_time, pname)
                             VALUES (:type, :hilo, :severity, :magnitude, :atime, :pname)`;

          await conn.execute(
            insertSql,
            {
              type: alertType,
              hilo,
              severity,
              magnitude: magnitude,
              atime: alert_time,
              pname: player
            },
            { autoCommit: true }
          );

          console.log("Inserted alert for", player, alertType);
          await conn.close();

        } catch (err) {
          console.error("DB insert error:", err);
        }
      }
    } else {
      console.log("Unknown RADIO payload", payload);
    }
  } else if (line.startsWith("SENT_RADIO:")) {
    // confirmation that the gateway sent radio
    console.log(line);
  } else {
    console.log("Serial:", line);
  }
});

port.on('open', () => {
  console.log('Serial port opened:', SERIAL_PATH, SERIAL_BAUD);
});

// HTTP endpoints to send RF commands via gateway (write to serial port)
// Example: POST /assign-id { "player": "John Pork" } -> writes "SET,ID,John Pork\n" to serial
app.post('/assign-id', (req, res) => {
  const { player } = req.body;
  if (!player) return res.status(400).send("player required");
  const cmd = `SET,ID,${player}\n`;
  port.write(cmd, (err) => {
    if (err) {
      console.error("Serial write error:", err);
      return res.status(500).send("Serial write error");
    }
    res.send("OK");
  });
});

// send arbitrary SET command: { "cmd": "SET,RESTING,80" }
app.post('/send-cmd', (req, res) => {
  const { cmd } = req.body;
  if (!cmd) return res.status(400).send("cmd required");
  const line = cmd.trim() + "\n";
  port.write(line, (err) => {
    if (err) {
      console.error("Serial write error:", err);
      return res.status(500).send("Serial write error");
    }
    res.send("OK");
  });
});

app.listen(PORT, () => {
  console.log(`Serial HTTP helper listening on ${PORT}`);
});
