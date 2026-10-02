CREATE DATABASE IF NOT EXISTS tractor_db;
USE tractor_db;
CREATE TABLE IF NOT EXISTS tractor (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company VARCHAR(60) NOT NULL,
  model VARCHAR(80) NOT NULL,
  hp INT NOT NULL,
  cylinders INT NOT NULL,
  rpm INT NOT NULL,
  color VARCHAR(40),
  color_hex VARCHAR(9),
  fuel_tank INT,
  lift_kg INT,
  drive VARCHAR(5),
  gears VARCHAR(30),
  price_lakh DOUBLE,
  description VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS app_user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(100) NOT NULL
);
-- Sample rows are loaded automatically from backend/src/main/resources/data.sql
