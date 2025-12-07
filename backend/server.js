require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { parseTaskWithAI } = require('./aiService');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Setup
const db = new sqlite3.Database('./tasks.db', (err) => {
    if (err) console.error('DB Connection Error:', err.message);
    else console.log('Connected to SQLite database.');
});

// Initialize Table
db.run(`CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  dueDate TEXT,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Routes

// GET /api/tasks
app.get('/api/tasks', (req, res) => {
    const { status } = req.query;
    let query = "SELECT * FROM tasks";
    const params = [];

    if (status) {
        query += " WHERE status = ?";
        params.push(status);
    }

    query += " ORDER BY createdAt DESC";

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST /api/tasks - Create from Voice/Text
app.post('/api/tasks', async (req, res) => {
    const { transcript } = req.body;
    if (!transcript) return res.status(400).json({ error: 'Transcript is required' });

    try {
        // Parsing logic
        const taskDetails = await parseTaskWithAI(transcript);

        // Fallback if AI fails or returns partial data
        const title = taskDetails.title || transcript;
        const dueDate = taskDetails.dueDate || null;
        const priority = taskDetails.priority || 'normal';

        const sql = `INSERT INTO tasks (title, dueDate, priority) VALUES (?, ?, ?)`;
        db.run(sql, [title, dueDate, priority], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // Send Email Notification (Async - fire and forget for speed)
            sendEmailNotification({ id: this.lastID, title, dueDate, priority });

            res.status(201).json({
                id: this.lastID,
                title,
                dueDate,
                priority,
                status: 'pending'
            });
        });

    } catch (error) {
        console.error('Task Creation Error:', error);
        res.status(500).json({ error: 'Failed to process task' });
    }
});

// PUT /api/tasks/:id - Update status
app.put('/api/tasks/:id', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    db.run(`UPDATE tasks SET status = ? WHERE id = ?`, [status, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, status });
    });
});

// Email Service Helper
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmailNotification = (task) => {
    if (!process.env.EMAIL_USER) {
        console.log('✉️ [Email Mock]: Task Created:', task);
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to self for demo
        subject: `New Task: ${task.title}`,
        text: `Task Details:\nTitle: ${task.title}\nDue: ${task.dueDate || 'No Date'}\nPriority: ${task.priority}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log('Error sending email:', error);
        else console.log('Email sent: ' + info.response);
    });
};

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
