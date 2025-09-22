-- MySQL schema for Feedback Management System

CREATE DATABASE IF NOT EXISTS feedback_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE feedback_system;

-- Users table (must be created before any table that references it)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user'
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  feedback_text TEXT NOT NULL,
  votes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Forms table (after users because of created_by FK)
CREATE TABLE IF NOT EXISTS forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description VARCHAR(500) NULL,
  image_url VARCHAR(500) NULL,
  published TINYINT(1) NOT NULL DEFAULT 0,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_forms_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_id INT NULL,
  question_text VARCHAR(500) NOT NULL,
  type ENUM('single','yesno','likert','text','stars') NOT NULL DEFAULT 'single',
  options JSON NOT NULL,
  answer VARCHAR(255) NULL,
  image_url VARCHAR(500) NULL,
  CONSTRAINT fk_questions_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE SET NULL
);

-- Optional star ratings stored as numeric in responses.answer when type='stars'

-- Responses table
CREATE TABLE IF NOT EXISTS responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  question_id INT NOT NULL,
  answer VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_responses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_responses_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Seed an admin user (change password hash in production)
-- INSERT INTO users (username, password, role) VALUES ('admin', '<bcrypt-hash>', 'admin');

