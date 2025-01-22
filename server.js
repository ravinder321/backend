const express = require('express');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());


// Create MySQL connection
const db = mysql.createConnection({
  host: 'srv1000.hstgr.io',
  user: 'u638496691_ravinder',          // Your MySQL username
  password: 'Ravinder2311',          // Your MySQL password
  database: 'u638496691_ravinder'      // Your database name
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the MySQL database');
});

// Register Route
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Check if user already exists
    db.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      if (results.length > 0) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user into the database
      db.query('INSERT INTO user (email, password) VALUES (?, ?)', [email, hashedPassword], (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({ message: 'User registered successfully' });
      });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
  
    try {
      // Check if user exists
      db.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }
        if (results.length === 0) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }
  
        // Compare entered password with the hashed password in the database
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
  
        if (!isMatch) {
          return res.status(400).json({ message: 'Password Not Match' });
        }
  
        res.status(200).json({ message: 'Login successful' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });

// Start server
const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
