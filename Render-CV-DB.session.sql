CREATE TABLE cv_analyses (
  id SERIAL PRIMARY KEY,
  cv_text TEXT,
  score INTEGER,
  skills JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);