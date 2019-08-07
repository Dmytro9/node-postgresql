const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();

// DB connect
const connectionString = `postgresql://${dbuser}:${dbpassword}@localhost/bookdb`;

const pool = new Pool({
  connectionString
});


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.get('/', (req, res) => {
  pool.query('SELECT * FROM recipies', (err, result) => {
    res.send(result.rows);
  });
});

app.post('/', (req, res) => {
  pool.query(
    'INSERT INTO recipies(name, ingredians, directions) VALUES($1, $2, $3)',
    [
      req.body.name.trim(),
      req.body.ingredians.trim(),
      req.body.directions.trim()
    ],
    (err, result) => {
      res.send('Added new recipie');
    }
  );
});

app.put('/:id', (req, res) => {
  pool.query(
    `UPDATE recipies SET name=$1, ingredians=$2, directions=$3 
  WHERE id = ${req.params.id} returning *`,
    [
      req.body.name.trim(),
      req.body.ingredians.trim(),
      req.body.directions.trim()
    ],
    (err, result) => {
      res.send(result.rows[0]);
    }
  );
});

app.delete('/:id', (req, res) => {
  pool.query(
    `DELETE FROM recipies WHERE id = ${req.params.id}`,
    (err, result) => {
      res.send('Deleted');
    }
  );
});

app.listen(3000, () => console.log('Listening on port 3000'));
