const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());
app.use(express.static('public'));


// DB connection (using env vars)
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '9606',
  database: process.env.DB_NAME || 'crud_student'
});

db.connect(err => {
  if (err) {
    console.error('❌ MySQL connection error:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL');
});

/*
  Routes:
    POST   /students      -> create
    GET    /students      -> get all
    GET    /students/:id  -> get one (optional)
    PUT    /students/:id  -> update
    DELETE /students/:id  -> delete
*/

// Create
app.post('/students', (req, res) => {
  const { name, email, course } = req.body;
  if (!name || !email || !course) return res.status(400).send('Missing fields');
  const sql = 'INSERT INTO students (name, email, course) VALUES (?, ?, ?)';
  db.query(sql, [name, email, course], (err, result) => {
    if (err) return res.status(500).send(err.message);
    res.send('Student added successfully');
  });
});

// Read all
app.get('/students', (req, res) => {
  db.query('SELECT * FROM students ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).send(err.message);
    res.json(results);
  });
});

// Read one (optional)
app.get('/students/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM students WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).send(err.message);
    if (results.length === 0) return res.status(404).send('Not found');
    res.json(results[0]);
  });
});

// Update
app.put('/students/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, course } = req.body;
  if (!name || !email || !course) return res.status(400).send('Missing fields');
  const sql = 'UPDATE students SET name=?, email=?, course=? WHERE id=?';
  db.query(sql, [name, email, course, id], (err, result) => {
    if (err) return res.status(500).send(err.message);
    if (result.affectedRows === 0) return res.status(404).send('Student not found');
    res.send('Student updated successfully');
  });
});

// Delete
app.delete('/students/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM students WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send(err.message);
    if (result.affectedRows === 0) return res.status(404).send('Student not found');
    res.send('Student deleted successfully');
  });
});

// Fallback - serve index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
