CREATE DATABASE IF NOT EXISTS library_management_db;

USE library_management_db;

CREATE TABLE IF NOT EXISTS users(
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'librarian', 'admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)ENGINE=InnoDB;

CREATE Table IF NOT EXISTS books(
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(150) NOT NULL,
    author VARCHAR(150) NOT NULL,
    isbn VARCHAR(150) NOT NULL UNIQUE,
    category VARCHAR(150) NOT NULL,
    total_copies INT NOT NULL CHECK(total_copies >= 0) ,
    available_copies INT NOT NULL CHECK(available_copies >= 0 AND available_copies <= total_copies),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS borrowings(
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    due_date DATE NOT NULL,
    returned_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'borrowed',
    CHECK (
        ((status = 'returned' AND returned_at IS NOT NULL)
        OR
        (status = 'borrowed' AND returned_at IS NULL)
        OR
        (status = 'overdue' AND returned_at IS NULL)) 
    AND 
        (status IN ('returned','borrowed','overdue'))
    ),

    FOREIGN KEY (user_id)
       REFERENCES users(id),
    FOREIGN KEY (book_id)
       REFERENCES books(id)
       ON DELETE RESTRICT
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs(
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT ,
    action VARCHAR(150) NOT NULL,
    entity_type VARCHAR(150) NOT NULL,
    entity_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
       REFERENCES users(id)
       ON DELETE SET NULL
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS library_settings(
    id INT PRIMARY KEY AUTO_INCREMENT,
    max_active_borrowings INT NOT NULL  DEFAULT 3 
        CHECK(max_active_borrowings>0),
    default_loan_days INT NOT NULL DEFAULT 14 
        CHECK(default_loan_days>0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP
)ENGINE=InnoDB;

INSERT INTO library_settings (id, max_active_borrowings, default_loan_days)
VALUES (1, 3, 14)
ON DUPLICATE KEY UPDATE id = id;

CREATE INDEX books_title
ON books(title);
CREATE INDEX books_author
ON books(author);
CREATE INDEX books_category
ON books(category);
CREATE INDEX borrowings_due_date
ON borrowings(due_date);
CREATE INDEX borrowings_status
ON borrowings(status);

