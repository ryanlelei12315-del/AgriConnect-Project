-- AgriConnect KE - Migration 004: Normalize messages to snake_case
-- Old Sequelize sync() created camelCase columns; align to canonical schema.
USE Smart_Kilimo;

ALTER TABLE messages
    CHANGE COLUMN senderId sender_id INT NOT NULL,
    CHANGE COLUMN recipientId recipient_id INT NOT NULL,
    CHANGE COLUMN createdAt created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHANGE COLUMN updatedAt updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;