/**
 * SkillProof Assessment Question Bank - Databases
 * 
 * Skills:
 * 1. SQL
 * 2. PostgreSQL
 * 3. MySQL
 * 4. MongoDB
 * 5. SQLite
 * 6. Redis
 * 7. Firebase
 * 8. Firestore
 * 
 * Strictly 5 questions per skill, progressive difficulty (Easy -> Easy/Med -> Med -> Med/Hard -> Hard).
 */

export const DATABASE_QUESTIONS = {
  // ==========================================
  // 1. SQL
  // ==========================================
  'SQL': [
    {
      id: 'sql_q1',
      skill: 'SQL',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'sql',
      question: 'Write a SQL query to retrieve the name and salary of all employees from the "employees" table whose salary is strictly greater than 50000, ordered by salary descending.',
      starterCode: '-- Write your SQL query here\nSELECT ',
      expectedAnswer: 'SELECT name, salary FROM employees WHERE salary > 50000 ORDER BY salary DESC;',
      points: 20,
      validationCriteria: {
        requiredClauses: ['SELECT', 'FROM', 'WHERE'],
        requiredTerms: ['employees', 'salary', '50000']
      },
      explanation: 'Uses SELECT for columns, FROM employees, WHERE salary > 50000, and ORDER BY salary DESC.'
    },
    {
      id: 'sql_q2',
      skill: 'SQL',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'sql',
      question: 'Given an "employees" table (id, name, department_id, salary) and a "departments" table (id, department_name), write a query using INNER JOIN to return each employee\'s name, department_name, and salary.',
      starterCode: 'SELECT \nFROM employees e\nJOIN ',
      expectedAnswer: 'SELECT e.name, d.department_name, e.salary FROM employees e INNER JOIN departments d ON e.department_id = d.id;',
      points: 20,
      validationCriteria: {
        requiredClauses: ['SELECT', 'FROM', 'JOIN', 'ON'],
        requiredTerms: ['employees', 'departments', 'department_id']
      },
      explanation: 'INNER JOIN combines rows between employees and departments matching department_id.'
    },
    {
      id: 'sql_q3',
      skill: 'SQL',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'sql',
      question: 'Write a SQL query using GROUP BY and HAVING to find groups with count exceeding a threshold (e.g., department employee count > 5 or duplicate records with COUNT > 1), or find the second-highest distinct salary using a subquery.',
      starterCode: 'SELECT department_id, COUNT(*) AS emp_count\nFROM employees\nGROUP BY department_id\nHAVING COUNT(*) > 5;',
      expectedAnswer: 'SELECT department_id, COUNT(*) AS emp_count FROM employees GROUP BY department_id HAVING COUNT(*) > 5;',
      points: 20,
      validationCriteria: {
        requiredClauses: ['SELECT', 'FROM'],
        pattern: /(GROUP\s+BY.+HAVING|MAX\(salary\)|LIMIT\s+1|SELECT.+FROM)/i
      },
      explanation: 'Uses GROUP BY and HAVING to filter aggregated groups, or a subquery/LIMIT to determine order statistics.'
    },
    {
      id: 'sql_q4',
      skill: 'SQL',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'multiple_choice',
      question: 'In SQL, what is the primary difference between the WHERE and HAVING clauses when analyzing data?',
      starterCode: null,
      expectedAnswer: 'B',
      options: [
        { key: 'A', text: 'WHERE filters groups after aggregation, while HAVING filters individual rows before aggregation.' },
        { key: 'B', text: 'WHERE filters rows before aggregation, while HAVING filters aggregated groups.' },
        { key: 'C', text: 'WHERE can only be used with numeric columns, while HAVING is for strings.' },
        { key: 'D', text: 'WHERE and HAVING are completely interchangeable syntax aliases.' }
      ],
      points: 20,
      validationCriteria: {
        requiredElements: ['where', 'having']
      },
      explanation: 'WHERE filters individual row records before GROUP BY occurs; HAVING filters aggregated groups created by GROUP BY.'
    },
    {
      id: 'sql_q5',
      skill: 'SQL',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'sql',
      question: 'Solve this practical SQL data-analysis problem: Write a query combining GROUP BY and HAVING (e.g., finding duplicate emails in "users" with COUNT(*) > 1, or aggregating top country sales from orders).',
      starterCode: 'SELECT email, COUNT(*)\nFROM users\nGROUP BY email\nHAVING COUNT(*) > 1;',
      expectedAnswer: 'SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;',
      points: 20,
      validationCriteria: {
        requiredClauses: ['SELECT', 'FROM', 'GROUP BY'],
        requiredTerms: ['COUNT']
      },
      explanation: 'Combines grouping, counting, and HAVING filters to identify aggregated pattern outliers.'
    }
  ],

  // ==========================================
  // 2. PostgreSQL
  // ==========================================
  'PostgreSQL': [
    {
      id: 'postgres_q1',
      skill: 'PostgreSQL',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'sql',
      question: 'Write a PostgreSQL query to retrieve all rows from the "audit_logs" table where the event occurred within the last 7 days using PostgreSQL date/time interval syntax (NOW() - INTERVAL).',
      starterCode: 'SELECT * FROM audit_logs\nWHERE created_at >= ',
      expectedAnswer: 'SELECT * FROM audit_logs WHERE created_at >= NOW() - INTERVAL \'7 days\';',
      points: 20,
      validationCriteria: {
        requiredClauses: ['SELECT', 'FROM', 'WHERE'],
        requiredTerms: ['audit_logs', 'INTERVAL', 'NOW']
      },
      explanation: 'PostgreSQL supports intuitive interval arithmetic using NOW() - INTERVAL \'7 days\'.'
    },
    {
      id: 'postgres_q2',
      skill: 'PostgreSQL',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'sql',
      question: 'In PostgreSQL, given a "users" table with a JSONB column named "metadata", write a query to select the user id and email where the JSONB attribute metadata->>\'is_active\' is equal to \'true\'.',
      starterCode: 'SELECT id, email\nFROM users\nWHERE metadata->>',
      expectedAnswer: 'SELECT id, email FROM users WHERE metadata->>\'is_active\' = \'true\';',
      points: 20,
      validationCriteria: {
        requiredClauses: ['SELECT', 'FROM', 'WHERE'],
        requiredTerms: ['users', 'metadata', 'is_active']
      },
      explanation: 'The ->> operator extracts a JSONB object field as text in PostgreSQL.'
    },
    {
      id: 'postgres_q3',
      skill: 'PostgreSQL',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'sql',
      question: 'Write a PostgreSQL query using the window function DENSE_RANK() or ROW_NUMBER() to rank employees within each department by salary descending, partitioning by department_id.',
      starterCode: 'SELECT id, name, department_id, salary,\n       DENSE_RANK() OVER (',
      expectedAnswer: 'SELECT id, name, department_id, salary, DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as salary_rank FROM employees;',
      points: 20,
      validationCriteria: {
        requiredClauses: ['SELECT', 'FROM', 'OVER'],
        requiredTerms: ['PARTITION BY', 'department_id', 'ORDER BY', 'salary']
      },
      explanation: 'DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) calculates salary ranking per department.'
    },
    {
      id: 'postgres_q4',
      skill: 'PostgreSQL',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'sql',
      question: 'Write a PostgreSQL query using an UPSERT statement (INSERT INTO ... ON CONFLICT DO UPDATE) for table "user_settings" (user_id PRIMARY KEY, theme, updated_at) to set theme = EXCLUDED.theme when conflict on user_id occurs.',
      starterCode: 'INSERT INTO user_settings (user_id, theme, updated_at)\nVALUES (101, \'dark\', NOW())\nON CONFLICT (user_id)\nDO UPDATE SET ',
      expectedAnswer: 'INSERT INTO user_settings (user_id, theme, updated_at) VALUES (101, \'dark\', NOW()) ON CONFLICT (user_id) DO UPDATE SET theme = EXCLUDED.theme, updated_at = NOW();',
      points: 20,
      validationCriteria: {
        requiredClauses: ['INSERT INTO', 'VALUES', 'ON CONFLICT', 'DO UPDATE SET'],
        requiredTerms: ['user_settings', 'EXCLUDED.theme']
      },
      explanation: 'PostgreSQL ON CONFLICT (user_id) DO UPDATE SET utilizes the EXCLUDED pseudo-table to handle upserts atomically.'
    },
    {
      id: 'postgres_q5',
      skill: 'PostgreSQL',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'sql',
      question: 'Write a recursive CTE in PostgreSQL (WITH RECURSIVE org_chart AS ...) to traverse an employee hierarchy from top manager (manager_id IS NULL) down to all subordinates, returning employee id, name, manager_id, and level.',
      starterCode: 'WITH RECURSIVE org_chart AS (\n  SELECT id, name, manager_id, 1 as level\n  FROM employees WHERE manager_id IS NULL\n  UNION ALL\n  SELECT ',
      expectedAnswer: 'WITH RECURSIVE org_chart AS (SELECT id, name, manager_id, 1 as level FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.id, e.name, e.manager_id, o.level + 1 FROM employees e JOIN org_chart o ON e.manager_id = o.id) SELECT * FROM org_chart;',
      points: 20,
      validationCriteria: {
        requiredClauses: ['WITH RECURSIVE', 'UNION ALL', 'SELECT', 'FROM', 'JOIN'],
        requiredTerms: ['org_chart', 'manager_id', 'level']
      },
      explanation: 'A recursive CTE traverses parent-child hierarchies efficiently in PostgreSQL.'
    }
  ],

  // ==========================================
  // 3. MySQL
  // ==========================================
  'MySQL': [
    {
      id: 'mysql_q1',
      skill: 'MySQL',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'sql',
      question: 'Write a MySQL query to retrieve the top 5 most recently created users from the "users" table using the LIMIT clause.',
      starterCode: 'SELECT id, username, created_at\nFROM users\nORDER BY created_at DESC\n',
      expectedAnswer: 'SELECT id, username, created_at FROM users ORDER BY created_at DESC LIMIT 5;',
      points: 20,
      validationCriteria: {
        requiredClauses: ['SELECT', 'FROM', 'ORDER BY', 'LIMIT'],
        requiredTerms: ['users', 'created_at', '5']
      },
      explanation: 'Uses ORDER BY created_at DESC and LIMIT 5 to fetch the 5 most recent records.'
    },
    {
      id: 'mysql_q2',
      skill: 'MySQL',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'sql',
      question: 'Write a MySQL query using the IFNULL() or COALESCE() function to return employee name and phone number, replacing NULL phone numbers with "Not Provided".',
      starterCode: 'SELECT name, IFNULL(',
      expectedAnswer: 'SELECT name, IFNULL(phone, \'Not Provided\') AS phone_contact FROM employees;',
      points: 20,
      validationCriteria: {
        requiredClauses: ['SELECT', 'FROM'],
        requiredTerms: ['employees', 'phone', 'Not Provided']
      },
      explanation: 'IFNULL(phone, \'Not Provided\') replaces null values in MySQL columns.'
    },
    {
      id: 'mysql_q3',
      skill: 'MySQL',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'sql',
      question: 'Write a MySQL query using DATE_SUB() and NOW() or CURDATE() to delete all expired sessions from "user_sessions" where last_activity is older than 30 days.',
      starterCode: 'DELETE FROM user_sessions\nWHERE last_activity < ',
      expectedAnswer: 'DELETE FROM user_sessions WHERE last_activity < DATE_SUB(NOW(), INTERVAL 30 DAY);',
      points: 20,
      validationCriteria: {
        requiredClauses: ['DELETE FROM', 'WHERE'],
        requiredTerms: ['user_sessions', 'DATE_SUB', 'INTERVAL 30 DAY']
      },
      explanation: 'DATE_SUB(NOW(), INTERVAL 30 DAY) calculates the date 30 days in the past in MySQL.'
    },
    {
      id: 'mysql_q4',
      skill: 'MySQL',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'sql',
      question: 'Write a MySQL query using GROUP_CONCAT() to return each department_id and a comma-separated list of employee names sorted alphabetically in that department from "employees".',
      starterCode: 'SELECT department_id, GROUP_CONCAT(',
      expectedAnswer: 'SELECT department_id, GROUP_CONCAT(name ORDER BY name ASC SEPARATOR \', \') AS employee_list FROM employees GROUP BY department_id;',
      points: 20,
      validationCriteria: {
        requiredClauses: ['SELECT', 'FROM', 'GROUP BY'],
        requiredTerms: ['GROUP_CONCAT', 'name', 'department_id']
      },
      explanation: 'GROUP_CONCAT() aggregates strings from multiple rows into a single delimited string in MySQL.'
    },
    {
      id: 'mysql_q5',
      skill: 'MySQL',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'sql',
      question: 'Write an EXPLAIN statement in MySQL and describe how to verify whether a query on "orders" (customer_id, status) is utilizing a composite index on (customer_id, status) rather than performing a full table scan ("type: ALL").',
      starterCode: 'EXPLAIN SELECT * FROM orders WHERE customer_id = 42 AND status = \'completed\';\n-- Analysis:',
      expectedAnswer: 'EXPLAIN SELECT * FROM orders WHERE customer_id = 42 AND status = \'completed\';\nCheck that "key" matches the index name and "type" is "ref" or "range" rather than "ALL", and "rows" examined is minimized.',
      points: 20,
      validationCriteria: {
        requiredTerms: ['EXPLAIN', 'key', 'type', 'index']
      },
      explanation: 'EXPLAIN output reveals the index used in the `key` column and execution strategy in `type`.'
    }
  ],

  // ==========================================
  // 4. MongoDB
  // ==========================================
  'MongoDB': [
    {
      id: 'mongodb_q1',
      skill: 'MongoDB',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a MongoDB query using db.collection.find() to retrieve all documents from the "users" collection where "status" is "active" and "age" is greater than or equal to 21.',
      starterCode: 'db.users.find({\n  // Add filter conditions\n})',
      expectedAnswer: 'db.users.find({ status: "active", age: { $gte: 21 } })',
      points: 20,
      validationCriteria: {
        requiredElements: ['db.users.find', 'status', '$gte', '21']
      },
      explanation: 'The $gte operator in MongoDB filters for fields greater than or equal to the specified value.'
    },
    {
      id: 'mongodb_q2',
      skill: 'MongoDB',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a MongoDB update operation using updateOne() or updateMany() with the $set operator to change the status of document with _id: ObjectId("60c72b2f9b1d8b2bad000001") to "archived".',
      starterCode: 'db.posts.updateOne(\n  { _id: ObjectId("60c72b2f9b1d8b2bad000001") },\n  {\n    // Update operator\n  }\n)',
      expectedAnswer: 'db.posts.updateOne({ _id: ObjectId("60c72b2f9b1d8b2bad000001") }, { $set: { status: "archived" } })',
      points: 20,
      validationCriteria: {
        requiredElements: ['updateOne', '$set', 'status', 'archived']
      },
      explanation: 'The $set operator modifies existing fields or adds them if they do not exist.'
    },
    {
      id: 'mongodb_q3',
      skill: 'MongoDB',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write a MongoDB aggregation pipeline using aggregate() on the "orders" collection to calculate total revenue per customer: filter where status is "completed" ($match), group by customerId ($group), and sum the amount ($sum).',
      starterCode: 'db.orders.aggregate([\n  { $match: { /* ... */ } },\n  { $group: { /* ... */ } }\n])',
      expectedAnswer: 'db.orders.aggregate([{ $match: { status: "completed" } }, { $group: { _id: "$customerId", totalRevenue: { $sum: "$amount" } } }])',
      points: 20,
      validationCriteria: {
        requiredElements: ['aggregate', '$match', '$group', '$sum']
      },
      explanation: '$match filters documents and $group with $sum accumulates totals across grouped keys.'
    },
    {
      id: 'mongodb_q4',
      skill: 'MongoDB',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a MongoDB query using createIndex() to create a compound index on the "products" collection for "category" (ascending) and "price" (descending).',
      starterCode: 'db.products.createIndex({\n  \n})',
      expectedAnswer: 'db.products.createIndex({ category: 1, price: -1 })',
      points: 20,
      validationCriteria: {
        requiredElements: ['createIndex', 'category: 1', 'price: -1']
      },
      explanation: '1 specifies ascending index order, and -1 specifies descending index order in MongoDB.'
    },
    {
      id: 'mongodb_q5',
      skill: 'MongoDB',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Write a MongoDB aggregation pipeline using $lookup to perform a left outer join between the "orders" collection and "users" collection, matching orders.userId with users._id, outputting as userDetails.',
      starterCode: 'db.orders.aggregate([\n  {\n    $lookup: {\n      from: "users",\n      localField: \n    }\n  }\n])',
      expectedAnswer: 'db.orders.aggregate([{ $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userDetails" } }])',
      points: 20,
      validationCriteria: {
        requiredElements: ['$lookup', 'from: "users"', 'localField', 'foreignField', 'userDetails']
      },
      explanation: '$lookup performs an equality match join across collections in MongoDB aggregation.'
    }
  ],

  // ==========================================
  // 5. SQLite
  // ==========================================
  'SQLite': [
    {
      id: 'sqlite_q1',
      skill: 'SQLite',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'sql',
      question: 'Write a SQLite CREATE TABLE statement for a table named "notes" with id (INTEGER PRIMARY KEY AUTOINCREMENT), title (TEXT NOT NULL), and created_at (DATETIME DEFAULT CURRENT_TIMESTAMP).',
      starterCode: 'CREATE TABLE notes (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  ',
      expectedAnswer: 'CREATE TABLE notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);',
      points: 20,
      validationCriteria: {
        requiredClauses: ['CREATE TABLE'],
        requiredTerms: ['notes', 'INTEGER PRIMARY KEY', 'AUTOINCREMENT', 'CURRENT_TIMESTAMP']
      },
      explanation: 'SQLite uses INTEGER PRIMARY KEY AUTOINCREMENT and CURRENT_TIMESTAMP for auto-incrementing IDs and timestamps.'
    },
    {
      id: 'sqlite_q2',
      skill: 'SQLite',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'sql',
      question: 'Write a SQLite query using the strftime() function to select all records from "transactions" created in the month of October (\'10\').',
      starterCode: 'SELECT * FROM transactions\nWHERE strftime(',
      expectedAnswer: 'SELECT * FROM transactions WHERE strftime(\'%m\', created_at) = \'10\';',
      points: 20,
      validationCriteria: {
        requiredClauses: ['SELECT', 'FROM', 'WHERE'],
        requiredTerms: ['transactions', 'strftime', '%m']
      },
      explanation: 'strftime(\'%m\', created_at) extracts the two-digit month in SQLite.'
    },
    {
      id: 'sqlite_q3',
      skill: 'SQLite',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'sql',
      question: 'Write a SQLite command to enable Foreign Key constraint enforcement, which is disabled by default in SQLite database connections.',
      starterCode: 'PRAGMA ',
      expectedAnswer: 'PRAGMA foreign_keys = ON;',
      points: 20,
      validationCriteria: {
        requiredTerms: ['PRAGMA', 'foreign_keys', 'ON']
      },
      explanation: 'PRAGMA foreign_keys = ON; must be executed per database connection to enforce referential integrity in SQLite.'
    },
    {
      id: 'sqlite_q4',
      skill: 'SQLite',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'sql',
      question: 'Write a SQLite query using INSERT OR REPLACE INTO (or INSERT OR IGNORE INTO) for table "kv_store" (key TEXT PRIMARY KEY, value TEXT) to insert key "theme" with value "dark".',
      starterCode: 'INSERT OR REPLACE INTO kv_store (key, value)\nVALUES (',
      expectedAnswer: 'INSERT OR REPLACE INTO kv_store (key, value) VALUES (\'theme\', \'dark\');',
      points: 20,
      validationCriteria: {
        requiredClauses: ['INSERT OR REPLACE INTO', 'VALUES'],
        requiredTerms: ['kv_store', 'theme', 'dark']
      },
      explanation: 'INSERT OR REPLACE INTO handles primary key conflict resolution in SQLite.'
    },
    {
      id: 'sqlite_q5',
      skill: 'SQLite',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'sql',
      question: 'Write a SQLite query using the JSON extension function json_extract() to select the user_id and theme from table "preferences" where the JSON column "data" has data->theme set to "dark".',
      starterCode: 'SELECT user_id, json_extract(data, ',
      expectedAnswer: 'SELECT user_id, json_extract(data, \'$.theme\') AS theme FROM preferences WHERE json_extract(data, \'$.theme\') = \'dark\';',
      points: 20,
      validationCriteria: {
        requiredClauses: ['SELECT', 'FROM', 'WHERE'],
        requiredTerms: ['json_extract', '$.theme', 'preferences']
      },
      explanation: 'json_extract(data, \'$.theme\') queries JSON data structures stored in SQLite text columns.'
    }
  ],

  // ==========================================
  // 6. Redis
  // ==========================================
  'Redis': [
    {
      id: 'redis_q1',
      skill: 'Redis',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write the Redis CLI commands to set the string key "session:user_101" to value "active_token" and configure it to expire automatically after 3600 seconds.',
      starterCode: '# Write Redis command\nSET session:user_101 ',
      expectedAnswer: 'SET session:user_101 "active_token" EX 3600',
      points: 20,
      validationCriteria: {
        requiredElements: ['SET', 'session:user_101', 'EX', '3600']
      },
      explanation: 'SET key value EX seconds atomically sets a value with an expiration TTL.'
    },
    {
      id: 'redis_q2',
      skill: 'Redis',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write Redis commands using Hash data structures to store a user profile under hash key "user:101" with fields "name" -> "Alice" and "role" -> "admin", and then retrieve only the "role" field.',
      starterCode: 'HSET user:101 name "Alice" role "admin"\n# Retrieve role:',
      expectedAnswer: 'HSET user:101 name "Alice" role "admin"\nHGET user:101 role',
      points: 20,
      validationCriteria: {
        requiredElements: ['HSET', 'user:101', 'HGET', 'role']
      },
      explanation: 'HSET sets fields within a Redis Hash and HGET retrieves a specific field value.'
    },
    {
      id: 'redis_q3',
      skill: 'Redis',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write the Redis command to push an item "task_404" onto the end of a queue list named "job_queue", and the corresponding blocking command to pop an item from the left with a 5-second timeout.',
      starterCode: '# Push to queue:\nRPUSH job_queue "task_404"\n# Blocking pop:\n',
      expectedAnswer: 'RPUSH job_queue "task_404"\nBLPOP job_queue 5',
      points: 20,
      validationCriteria: {
        requiredElements: ['RPUSH', 'job_queue', 'BLPOP']
      },
      explanation: 'RPUSH and BLPOP create a reliable FIFO distributed work queue in Redis.'
    },
    {
      id: 'redis_q4',
      skill: 'Redis',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write the Redis command to add players to a Sorted Set (ZSET) named "leaderboard" with scores: player "Alice" with score 1500 and "Bob" with score 2100. Then write the command to retrieve the top 3 highest scores in descending order.',
      starterCode: 'ZADD leaderboard 1500 "Alice" 2100 "Bob"\n# Fetch top 3 in descending order:\n',
      expectedAnswer: 'ZADD leaderboard 1500 "Alice" 2100 "Bob"\nZREVRANGE leaderboard 0 2 WITHSCORES',
      points: 20,
      validationCriteria: {
        requiredElements: ['ZADD', 'leaderboard', 'ZREVRANGE']
      },
      explanation: 'ZADD maintains sorted scores, and ZREVRANGE returns members sorted from highest to lowest score.'
    },
    {
      id: 'redis_q5',
      skill: 'Redis',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Describe or write the Redis commands to execute an atomic transaction using MULTI, updating a balance key "account:1" and incrementing "transfer_count", and committing with EXEC.',
      starterCode: 'MULTI\nDECRBY account:1 50\n',
      expectedAnswer: 'MULTI\nDECRBY account:1 50\nINCR transfer_count\nEXEC',
      points: 20,
      validationCriteria: {
        requiredElements: ['MULTI', 'EXEC', 'account:1']
      },
      explanation: 'MULTI queues commands for atomic sequential execution without interleaving until EXEC is called.'
    }
  ],

  // ==========================================
  // 7. Firebase
  // ==========================================
  'Firebase': [
    {
      id: 'firebase_q1',
      skill: 'Firebase',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Using the Firebase JavaScript SDK (v9+ modular syntax), write the code to initialize a Firebase app with config options and get a Firestore database instance.',
      starterCode: 'import { initializeApp } from "firebase/app";\nimport { getFirestore } from "firebase/firestore";\n\nconst firebaseConfig = { apiKey: "AIza...", projectId: "my-app" };\n// Initialize app and firestore\n',
      expectedAnswer: 'const app = initializeApp(firebaseConfig);\nconst db = getFirestore(app);',
      points: 20,
      validationCriteria: {
        requiredElements: ['initializeApp', 'getFirestore', 'app']
      },
      explanation: 'Firebase v9 uses modular functions initializeApp() and getFirestore() to instantiate services.'
    },
    {
      id: 'firebase_q2',
      skill: 'Firebase',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Using the Firebase Web SDK, write a query using collection(), query(), where(), and getDocs() to fetch all documents from the "users" collection where "status" equals "active".',
      starterCode: 'import { collection, query, where, getDocs } from "firebase/firestore";\n\nasync function getActiveUsers(db) {\n  // Build and execute query\n}',
      expectedAnswer: 'async function getActiveUsers(db) {\n  const q = query(collection(db, "users"), where("status", "==", "active"));\n  const querySnapshot = await getDocs(q);\n  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['query', 'collection', 'where', 'getDocs', 'status', 'active']
      },
      explanation: 'Constructs a query with where("status", "==", "active") and executes it using getDocs().'
    },
    {
      id: 'firebase_q3',
      skill: 'Firebase',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write a Firebase Security Rule for Firestore that allows authenticated users to read any user profile in /users/{userId}, but allows write/update access only if the authenticated user owns the document (request.auth.uid == userId).',
      starterCode: 'rules_version = \'2\';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /users/{userId} {\n      // Add read and write rules\n    }\n  }\n}',
      expectedAnswer: 'rules_version = \'2\';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /users/{userId} {\n      allow read: if request.auth != null;\n      allow write: if request.auth != null && request.auth.uid == userId;\n    }\n  }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['request.auth', 'request.auth.uid == userId', 'allow read', 'allow write']
      },
      explanation: 'Firebase Security Rules enforce document-level ownership authorization via request.auth.uid.'
    },
    {
      id: 'firebase_q4',
      skill: 'Firebase',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Using Firebase Authentication modular SDK, write a function signInUser(auth, email, password) that uses signInWithEmailAndPassword, catches authentication errors, and returns user credentials.',
      starterCode: 'import { signInWithEmailAndPassword } from "firebase/auth";\n\nasync function signInUser(auth, email, password) {\n  // Implementation\n}',
      expectedAnswer: 'async function signInUser(auth, email, password) {\n  try {\n    const userCredential = await signInWithEmailAndPassword(auth, email, password);\n    return userCredential.user;\n  } catch (error) {\n    console.error("Sign-in error:", error.code, error.message);\n    throw error;\n  }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['signInWithEmailAndPassword', 'auth', 'email', 'password', 'try', 'catch']
      },
      explanation: 'signInWithEmailAndPassword authenticates credentials and returns user tokens and profile information.'
    },
    {
      id: 'firebase_q5',
      skill: 'Firebase',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Write a Firestore atomic transaction using runTransaction() to decrement an inventory count in doc(db, "products", productId) only if current inventory is greater than 0, otherwise throwing an "Out of stock" error.',
      starterCode: 'import { runTransaction, doc } from "firebase/firestore";\n\nasync function purchaseItem(db, productId) {\n  const productRef = doc(db, "products", productId);\n  await runTransaction(db, async (transaction) => {\n    // Read, validate, and write atomically\n  });\n}',
      expectedAnswer: 'async function purchaseItem(db, productId) {\n  const productRef = doc(db, "products", productId);\n  await runTransaction(db, async (transaction) => {\n    const sfDoc = await transaction.get(productRef);\n    if (!sfDoc.exists()) throw new Error("Document does not exist!");\n    const newCount = sfDoc.data().inventory - 1;\n    if (newCount < 0) throw new Error("Out of stock!");\n    transaction.update(productRef, { inventory: newCount });\n  });\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['runTransaction', 'transaction.get', 'transaction.update', 'inventory']
      },
      explanation: 'Firestore transactions execute atomic read-then-write sequences with optimistic concurrency control.'
    }
  ],

  // ==========================================
  // 8. Firestore
  // ==========================================
  'Firestore': [
    {
      id: 'firestore_q1',
      skill: 'Firestore',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write code using the Firestore modular SDK to add a new document with an auto-generated ID to the "articles" collection containing title, content, and createdAt (using serverTimestamp()).',
      starterCode: 'import { collection, addDoc, serverTimestamp } from "firebase/firestore";\n\nasync function createArticle(db, title, content) {\n  // Implementation\n}',
      expectedAnswer: 'async function createArticle(db, title, content) {\n  return await addDoc(collection(db, "articles"), {\n    title,\n    content,\n    createdAt: serverTimestamp()\n  });\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['addDoc', 'collection', 'serverTimestamp', 'title', 'content']
      },
      explanation: 'addDoc() inserts a new document with a generated ID and serverTimestamp() records canonical server time.'
    },
    {
      id: 'firestore_q2',
      skill: 'Firestore',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a Firestore query to fetch up to 10 published posts from the "posts" collection, filtering by status == "published" and ordering by createdAt descending.',
      starterCode: 'import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";\n\nasync function getLatestPosts(db) {\n  // Construct query\n}',
      expectedAnswer: 'async function getLatestPosts(db) {\n  const q = query(\n    collection(db, "posts"),\n    where("status", "==", "published"),\n    orderBy("createdAt", "desc"),\n    limit(10)\n  );\n  return await getDocs(q);\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['query', 'collection', 'where', 'orderBy', 'limit', 'status', 'published']
      },
      explanation: 'Combines where(), orderBy(), and limit() constraints to query documents.'
    },
    {
      id: 'firestore_q3',
      skill: 'Firestore',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write code to query a subcollection in Firestore: fetch all comments from the subcollection path "posts/{postId}/comments" ordered by timestamp ascending.',
      starterCode: 'import { collection, query, orderBy, getDocs } from "firebase/firestore";\n\nasync function getPostComments(db, postId) {\n  // Query subcollection\n}',
      expectedAnswer: 'async function getPostComments(db, postId) {\n  const commentsRef = collection(db, "posts", postId, "comments");\n  const q = query(commentsRef, orderBy("timestamp", "asc"));\n  const snapshot = await getDocs(q);\n  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['collection', 'posts', 'comments', 'orderBy', 'getDocs']
      },
      explanation: 'Firestore subcollections are accessed by passing path segments to collection(db, "posts", postId, "comments").'
    },
    {
      id: 'firestore_q4',
      skill: 'Firestore',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a Firestore batched write using writeBatch() to atomically update 3 separate user status documents to "verified".',
      starterCode: 'import { writeBatch, doc } from "firebase/firestore";\n\nasync function batchVerifyUsers(db, userIds) {\n  const batch = writeBatch(db);\n  // Populate batch and commit\n}',
      expectedAnswer: 'async function batchVerifyUsers(db, userIds) {\n  const batch = writeBatch(db);\n  userIds.forEach(id => {\n    const userRef = doc(db, "users", id);\n    batch.update(userRef, { status: "verified" });\n  });\n  await batch.commit();\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['writeBatch', 'batch.update', 'batch.commit']
      },
      explanation: 'writeBatch() allows up to 500 atomic writes to be committed together in a single request.'
    },
    {
      id: 'firestore_q5',
      skill: 'Firestore',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Write a real-time Firestore listener using onSnapshot() to listen to changes on doc(db, "chats", chatId), properly returning an unsubscribe function to clean up the listener when done.',
      starterCode: 'import { doc, onSnapshot } from "firebase/firestore";\n\nfunction subscribeToChat(db, chatId, callback) {\n  // Return unsubscribe handler\n}',
      expectedAnswer: 'function subscribeToChat(db, chatId, callback) {\n  const chatRef = doc(db, "chats", chatId);\n  const unsubscribe = onSnapshot(chatRef, (docSnap) => {\n    if (docSnap.exists()) {\n      callback({ id: docSnap.id, ...docSnap.data() });\n    }\n  }, (error) => {\n    console.error("Chat sync error:", error);\n  });\n  return unsubscribe;\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['onSnapshot', 'doc', 'unsubscribe', 'exists']
      },
      explanation: 'onSnapshot provides real-time updates and returns a cleanup function to prevent memory leaks.'
    }
  ]
};
