const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();

// DB connect
const connectionString = 'postgresql://postgres:test8298@localhost/bookdb';

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

/*
 * ============== Tutorial PostgreSQL ============== :
 *
 **/

/*
 * DROP DATABASE test;
 *
 *
 **/

/*
 * CREATE DATABASE test;
 *
 *
 **/

app.get('/create', (req, res) => {
  pool.query(`CREATE DATABASE test`, (err, result) => {
    res.send('created');
  });
});

/*
 * CREATE table;
 *
 * data type - TIMESTAMP (includes also hour, minutes, sec)
 * for date_of_birth - ir's better - DATE (year, month, day)
 *
 **/

app.get('/createtable', (req, res) => {
  pool.query(
    `CREATE TABLE users (
      id SERIAL PRIMARY KEY, 
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      gender VARCHAR(6) NOT NULL,
      date_of_birth DATE NOT NULL,
      email VARCHAR(150)
    )`,
    (err, result) => {
      res.send('created');
    }
  );
});

/*
 * DROP table;
 *
 **/
app.get('/droptable', (req, res) => {
  pool.query(`DROP TABLE users`, (err, result) => {
    res.send('droped');
  });
});

/*
 * Insert data;
 *
 **/
app.get('/insertdata', (req, res) => {

 pool.query(
    `INSERT INTO users (
      first_name,
      last_name,
      gender,
      date_of_birth
      )
    VALUES (
      'Anne',
      'Samson',
      'FEMALE',
      '1989-01-09'
    )`,
    (err, result) => {
      res.send('inserted data');
    }
  );

  //  pool.query(
  //   `INSERT INTO users (
  //     first_name,
  //     last_name,
  //     gender,
  //     date_of_birth,
  //     email
  //   )
  //   VALUES (
  //     'Jake',
  //     'Jones',
  //     'MALE',
  //     '1985-01-09',
  //     'jake@gmail.com'
  //   )`,
  //   (err, result) => {
  //     res.send('inserted data');
  //   }
  // );

});


/*
 * SELECT data;
 *
 **/
app.get('/get', (req, res) => {

  // pool.query(`
  //   SELECT * FROM users
  // `,
  //  (err, result) => {
  //   res.send(result.rows);
  // });

  pool.query(
    `
    SELECT first_name FROM users
  `,
    (err, result) => {
      res.send(result.rows);
    }
  );

});


/*
 * ORDER BY data;
 *
 * ORDER BY DESC / ASC
 * 
 **/
app.get('/order', (req, res) => {

  pool.query(`
    SELECT * FROM person
    ORDER BY country_of_birth DESC
  `,
   (err, result) => {
    res.send(result.rows);
  });


});


/*
 * WHERE;
 *
 * 
 **/
app.get('/where', (req, res) => {

  // pool.query(`
  //   SELECT first_name FROM person
  //   WHERE gender = 'Female'
  // `,
  //  (err, result) => {
  //   res.send(result.rows);
  // });

//   pool.query(
//     `
//   SELECT 
//     first_name,
//     country_of_birth
//   FROM person
//   WHERE gender = 'Female'
//   AND 
//   country_of_birth = 'Ukraine'
// `,
//     (err, result) => {
//       res.send(result.rows);
//     }
//   );


  pool.query(
    `
  SELECT *
  FROM person
  WHERE gender = 'Female'
  AND 
  (country_of_birth = 'Ukraine' OR country_of_birth = 'Poland')
`,
    (err, result) => {
      res.send(result.rows);
    }
  );

});


/*
 * LIMIT OFFSET FETCH;
 *
 * 
 **/
app.get('/limit', (req, res) => {

  // pool.query(`
  //   SELECT * FROM person
  //   LIMIT 10
  // `,
  //  (err, result) => {
  //   res.send(result.rows);
  // });

  // pool.query(`
  //   SELECT * FROM person
  //   OFFSET 5 LIMIT 10
  // `,
  //  (err, result) => {
  //   res.send(result.rows);
  // });

  pool.query(`
    SELECT * FROM person
    OFFSET 5 FETCH FIRST 5 ROW ONLY
`,
  (err, result) => {
  res.send(result.rows);
  });

});


/*
 * GROUP BY
 *
 * with count()
 *  
 **/
app.get('/groupby', (req, res) => {

  pool.query(`
    SELECT country_of_birth, COUNT(*)
    FROM person
    GROUP BY country_of_birth
`,
  (err, result) => {
  res.send(result.rows);
  });

});

/*
 * GROUP BY
 *
 * having
 * in doc - /functions-aggregate.html
 * 
 **/
app.get('/groupbyhaving', (req, res) => {

  pool.query(`
    SELECT country_of_birth, COUNT(*)
    FROM person
    GROUP BY country_of_birth
    HAVING COUNT(*) >= 5 
    ORDER By country_of_birth
`,
  (err, result) => {
  res.send(result.rows);
  });

});


/*
 * Calculating
 *
 * MAX MIN AVERAGE
 * with round average or not
 * 
 **/
app.get('/max', (req, res) => {

//   pool.query(`
//     SELECT MAX(price)
//     FROM car
// `,
//   (err, result) => {
//   res.send(result.rows);
//   });


  // pool.query(`
  // SELECT MIN(price)
  // FROM car
  // `,
  // (err, result) => {
  // res.send(result.rows);
  // });

  // pool.query(`
  // SELECT ROUND( AVG(price) )
  // FROM car
  // `,
  // (err, result) => {
  // res.send(result.rows);
  // });

  pool.query(`
  SELECT make, model, MIN(price)
  FROM car
  GROUP BY make, model
  `,
  (err, result) => {
  res.send(result.rows);
  });

});


/*
 * SUM
 *
 *  
 **/
app.get('/sum', (req, res) => {

    // pool.query(`
    // SELECT SUM(price)
    // FROM car
    // `,
    // (err, result) => {
    // res.send(result.rows);
    // });

    pool.query(`
    SELECT make,
    SUM(price)
    FROM car 
    GROUP BY make
    ORDER BY sum 
    `,
    (err, result) => {
    res.send(result.rows);
    });
  
});


/*
 * Arithmetic
 * - + * / ^ 5! %
 * with Alias ( AS ) 
 * 
 **/
app.get('/arith', (req, res) => {

  pool.query(`
  SELECT id, make, model, price, ROUND(price * .10, 2) as p1, ROUND(price  - (price * .10)) as discount_10_persent
  FROM car
  `,
  (err, result) => {
  res.send(result.rows);
  });

});


/*
 * Coalesce
 * set placeholder on null values  
 **/
app.get('/coa', (req, res) => {

  pool.query(`
  SELECT *, COALESCE(email, 'Email not provided') as email
  FROM person
  `,
  (err, result) => {
  res.send(result.rows);
  });

});


/*
 * NULLIF
 *   
 * division by 0
 * 
 **/
app.get('/nullif', (req, res) => {

  pool.query(`
  SELECT COALESCE(10 / NULLIF(0, 0), 0)
  FROM person
  `,
  (err, result) => {
  res.send(result.rows);
  });

});


/*
 * TIMESTAMP and DATE
 *   
 * 
 **/
app.get('/date', (req, res) => {

  pool.query(`
  SELECT 
  FROM person
  `,
  (err, result) => {
  res.send(result.rows);
  });

});


app.listen(3000, () => console.log('Listening on port 3000'));
