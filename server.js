const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const cors = require('cors');
app.use(cors());

// Create and connect to the SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
        db.run(`CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            titre TEXT,
            contenu TEXT
        )`);
    }
});

// Middleware to parse incoming requests
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the "public" directory

// Route to get all entries
app.get('/api/entries', (req, res) => {
    db.all('SELECT * FROM entries', [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

// Route to add a new entry
app.post('/api/entries', (req, res) => {
    const { type, titre, contenu } = req.body;
    if (!type || !titre || !contenu) {
        res.status(400).json({ error: 'Please provide all fields' });
        return;
    }
    const sql = 'INSERT INTO entries (type, titre, contenu) VALUES (?, ?, ?)';
    const params = [type, titre, contenu];
    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: { id: this.lastID, type, titre, contenu }
        });
    });
});

// Route to delete an entry by ID
app.delete('/api/entries/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM entries WHERE id = ?', id, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'deleted', changes: this.changes });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
