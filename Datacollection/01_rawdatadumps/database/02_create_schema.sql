DROP TABLE IF EXISTS Attribute;
DROP TABLE IF EXISTS Article;
DROP TABLE IF EXISTS Category;

CREATE TABLE IF NOT EXISTS Category (
    caid SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    pcaid INT REFERENCES Category(caid)
);

CREATE TABLE IF NOT EXISTS Article (
    arid SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    caid INT NOT NULL REFERENCES Category(caid)
);

CREATE TABLE IF NOT EXISTS Attribute (
    atid SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content VARCHAR(255),
    arid INT NOT NULL REFERENCES Article(arid)
);
