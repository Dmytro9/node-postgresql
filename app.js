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
  pool.query(
    `
    SELECT * FROM person
    ORDER BY country_of_birth DESC
  `,
    (err, result) => {
      res.send(result.rows);
    }
  );
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

  pool.query(
    `
    SELECT * FROM person
    OFFSET 5 FETCH FIRST 5 ROW ONLY
`,
    (err, result) => {
      res.send(result.rows);
    }
  );
});

/*
 * GROUP BY
 *
 * with count()
 *
 **/
app.get('/groupby', (req, res) => {
  pool.query(
    `
    SELECT country_of_birth, COUNT(*)
    FROM person
    GROUP BY country_of_birth
`,
    (err, result) => {
      res.send(result.rows);
    }
  );
});

/*
 * GROUP BY
 *
 * having
 * in doc - /functions-aggregate.html
 *
 **/
app.get('/groupbyhaving', (req, res) => {
  pool.query(
    `
    SELECT country_of_birth, COUNT(*)
    FROM person
    GROUP BY country_of_birth
    HAVING COUNT(*) >= 5 
    ORDER By country_of_birth
`,
    (err, result) => {
      res.send(result.rows);
    }
  );
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

  pool.query(
    `
  SELECT make, model, MIN(price)
  FROM car
  GROUP BY make, model
  `,
    (err, result) => {
      res.send(result.rows);
    }
  );
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

  pool.query(
    `
    SELECT make,
    SUM(price)
    FROM car 
    GROUP BY make
    ORDER BY sum 
    `,
    (err, result) => {
      res.send(result.rows);
    }
  );
});

/*
 * Arithmetic
 * - + * / ^ 5! %
 * with Alias ( AS )
 *
 **/
app.get('/arith', (req, res) => {
  pool.query(
    `
  SELECT id, make, model, price, ROUND(price * .10, 2) as p1, ROUND(price  - (price * .10)) as discount_10_persent
  FROM car
  `,
    (err, result) => {
      res.send(result.rows);
    }
  );
});

/*
 * Coalesce
 * set placeholder on null values
 **/
app.get('/coa', (req, res) => {
  pool.query(
    `
  SELECT *, COALESCE(email, 'Email not provided') as email
  FROM person
  `,
    (err, result) => {
      res.send(result.rows);
    }
  );
});

/*
 * NULLIF
 *
 * division by 0
 *
 **/
app.get('/nullif', (req, res) => {
  pool.query(
    `
  SELECT COALESCE(10 / NULLIF(0, 0), 0)
  FROM person
  `,
    (err, result) => {
      res.send(result.rows);
    }
  );
});

/*
 * Age function
 *
 *
 **/
app.get('/age', (req, res) => {
  pool.query(
    `
  SELECT *, 
  AGE(NOW(), date_of_birth) AS age
  FROM person
  `,
    (err, result) => {
      res.send(result.rows);
    }
  );
});

/*
 * Primary Keys
 *
 * add to distinguish rows with the same values
 *
 **/
app.get('/key', (req, res) => {
  pool.query(
    `
  SELECT *, 
  FROM person
  `,
    (err, result) => {
      res.send(result.rows);
    }
  );
});

/*
 * Unique constraint
 *
 *
 **/
app.get('/key', (req, res) => {
  pool.query(
    `
  CREATE table ...(
    unique_email_address VARCHAR(50) UNIQUE
  );
  insert into ... (unique_email_address) values ('');
  `,
    (err, result) => {
      res.send(result.rows);
    }
  );
});

/*
 * CHECK IN
 *
 *
 **/
app.get('/key', (req, res) => {
  pool.query(
    `
  CREATE table ...(
    gender VARCHAR(6) NOT NULL CHECK (gender IN ('Male', 'Female'))
  );
  insert into ... (gender) values ('Male');
  `,
    (err, result) => {
      res.send(result.rows);
    }
  );
});

/*
 * UPDATE rows
 *
 *
 **/
app.get('/update', (req, res) => {
  pool.query(
    `
  UPDATE person 
  SET email = 'test@gmail.com'
  WHERE id = 2011
  `,
    (err, result) => {
      res.send(result.rows);
    }
  );
});

/*
 * ON CONFLICT
 *
 * when insert data with for example id existed (if we set unique column)
 *
 **/
app.get('/insert', (req, res) => {
  pool.query(
    `
  INSERT INTO person 
  (id, name)
  VALUES (2017, 'DIMA')
  ON CONFLICT (id) DO NOTHING
  `,
    (err, result) => {
      res.send(result.rows);
    }
  );
});

/*
 * UPSERT
 *
 * change athers fields if email for example is already taken
 *
 **/
app.get('/insert', (req, res) => {
  pool.query(
    `
  INSERT INTO person ... // update
  (id, name, email) ... // update
  VALUES (2017, 'DIMA', dima@gmail.com)
  ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
  `,
    (err, result) => {
      res.send(result.rows);
    }
  );
});

/*
 * Refs
 *
 * in ref table (car) then should exists values for setting
 *
 **/
app.get('/refs', (req, res) => {
  pool.query(
    `
    CREATE TABLE person (
      id BIGSERIAL NOT NULL PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      car_id BIGINT REFERENCES car(id),
      UNIQUE(car_id)
    )
  `,
    (err, result) => {
      res.send(result.rows);
    }
  );

  pool.query(
    `
    UPDATE person 
    SET car_id = 2
    WHERE id = 1
  `,
    (err, result) => {
      res.send(result.rows);
    }
  );
});

/*
 * JOIN
 *
 * takes vorewer is common in both tables
 *
 **/
app.get('/innerjoin', (req, res) => {
  pool.query(
    `
   SELECT * 
   from person
   JOIN car
   ON person.car_id = car.id
  `,
    (err, result) => {
      res.send(result.rows);
    }
  );

  pool.query(
    `
  SELECT person.first_name, car.make, car.model
  from person
  JOIN car
  ON person.car_id = car.id
 `,
    (err, result) => {
      res.send(result.rows);
    }
  );

  // to add also persons without car
  pool.query(
    `
 SELECT person.first_name, car.make, car.model
 from person
 LEFT JOIN car 
 ON person.car_id = car.id
`,
    (err, result) => {
      res.send(result.rows);
    }
  );
});

/*
 * EXPORTING query result to CSV
 *
 *
 **/
app.get('/innerjoin', (req, res) => {
  pool.query(
    `
   SELECT * 
   from person
   LEFT JOIN car
   ON person.car_id = car.id;

   COPY (SELECT *
    FROM person
    LEFT JOIN car
    ON person.car_id = car.id;
    ) TO
    '/USERS/code/Desctop/result.csv' DELIMITER ',' CSV HEADER;
  `,
    (err, result) => {
      res.send(result.rows);
    }
  );
});

/*
 * BIGSERIAL - int auto increment
 * BIGSERIAL - int
 *
 **/
app.get('/innerjoin', (req, res) => {
  pool.query(
    `
   SELECT * 
   from person
   LEFT JOIN car
   ON person.car_id = car.id;

   COPY (SELECT *
    FROM person
    LEFT JOIN car
    ON person.car_id = car.id;
    ) TO
    '/USERS/code/Desctop/result.csv' DELIMITER ',' CSV HEADER;
  `,
    (err, result) => {
      res.send(result.rows);
    }
  );
});

/*
 * UUID
 * to generate unique id for users (for example)
 *
 **/
app.get('/UUID', (req, res) => {
  pool.query(
    `
    CREATE TABLE person (
     id UUID NOT NULL PRIMARY KEY,
     name VARCHAR(100) NOT NULL
    );
    INSERT INTO person (id, name) values (uuid_generate_v4() ,'Dima');
  `,
    (err, result) => {
      res.send(result.rows);
    }
  );
});

/*
 * Date
 *  TIMESTAMP	date and time	TIMESTAMP '2020-03-03 01:03:08'	2020-03-03T01:03:08
 *  DATE	date (no time)	DATE '2020-03-03 01:03:08'	2020-03-03
    TIME	time (no day)	TIME '2020-03-03 01:03:08'	01:03:08
    INTERVAL	interval between two date/times	INTERVAL '1 day 2 hours 10 seconds'	1 day, 2:00:10
 * 

 Formatting Dates to Strings
 SELECT TO_CHAR(TIMESTAMP '2020-03-03 01:03:08', 'Day, Month DD YYYY'); => Tuesday , March 03 2020

 **/

/*
 * UNION / UNION ALL - 
 * This allows us to write multiple SELECT statements, retrieve the desired results, then combine them together into a final, unified set.
 
UNION: only keeps unique records
UNION ALL: keeps all records, including duplicates
 

There must be the same number of columns retrieved in each SELECT statement to be combined.
The columns retrieved must be in the same order in each SELECT statement.
The columns retrieved must be of similar data types.
 **/

app.listen(3000, () => console.log('Listening on port 3000'));
