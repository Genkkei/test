-- Правки из админки: сайты, переводы, пароли сайтов, боты, счётчики входа и заявок.
CREATE TABLE IF NOT EXISTS docs (
  k TEXT PRIMARY KEY,
  v TEXT NOT NULL,
  at TEXT NOT NULL
);
