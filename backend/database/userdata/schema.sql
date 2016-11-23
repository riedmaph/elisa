DROP TABLE IF EXISTS UserData.Item;
DROP TABLE IF EXISTS UserData.List;

DROP SCHEMA IF EXISTS UserData;

CREATE SCHEMA UserData;


CREATE TABLE IF NOT EXISTS UserData.List (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS UserData.Item (
    id SERIAL PRIMARY KEY,
    name TEXT,
    checked BOOLEAN DEFAULT FALSE,
    amount REAL,
    unit TEXT,
    list INT NOT NULL REFERENCES UserData.List(id) ON DELETE CASCADE
);