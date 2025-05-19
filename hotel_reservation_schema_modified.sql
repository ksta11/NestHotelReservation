CREATE DATABASE Hotel_Reservation;
USE Hotel_Reservation;

CREATE TABLE user (
     id CHAR(36) NOT NULL PRIMARY KEY,
     email VARCHAR(255) UNIQUE,
     passwordHash VARCHAR(255),
     firstName VARCHAR(255),
     lastName VARCHAR(255),
     phone VARCHAR(20),
     role ENUM('admin', 'client', 'hotel_admin'),
     isActive BOOLEAN DEFAULT TRUE,
     preferredLanguage VARCHAR(10) DEFAULT 'en',
     nationality VARCHAR(50) NULL,
     documentType VARCHAR(20) NULL,
     documentNumber VARCHAR(50) NULL,
     address TEXT NULL,
     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
     updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE hotel (
     id CHAR(36) NOT NULL PRIMARY KEY,
     name VARCHAR(255) UNIQUE,
     description TEXT,
     address VARCHAR(255),
     city VARCHAR(255),
     country VARCHAR(255),
     postalCode VARCHAR(255),
     phone VARCHAR(255),
     email VARCHAR(255),
     averageRating FLOAT DEFAULT 0,
     checkInTime TIME NULL,
     checkOutTime TIME NULL,
     cancellationPolicy VARCHAR(255) NULL,
     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
     updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE room (
     id CHAR(36) NOT NULL PRIMARY KEY,
     hotelId CHAR(36) NOT NULL,
     roomNumber VARCHAR(255),
     roomType VARCHAR(255),
     description TEXT,
     maxOccupancy INT,
     price FLOAT,
     capacity INT,
     amenities TEXT NULL,
     specialPrice FLOAT NULL,
     specialPriceStartDate DATE NULL,
     specialPriceEndDate DATE NULL,
     state ENUM('available', 'occupied', 'maintenance', 'reserved', 'temp_reserved') DEFAULT 'available',
     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
     updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (hotelId) REFERENCES hotel(id)
);

CREATE TABLE hotel_admin (
     id CHAR(36) NOT NULL PRIMARY KEY,
     userId CHAR(36) NOT NULL,
     hotelId CHAR(36) NULL,
     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
     updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (userId) REFERENCES user(id),
     FOREIGN KEY (hotelId) REFERENCES hotel(id)
);

CREATE TABLE reservation (
     id CHAR(36) NOT NULL PRIMARY KEY,
     userId CHAR(36) NOT NULL,
     hotelId CHAR(36) NOT NULL,
     roomId CHAR(36) NOT NULL,
     checkInDate DATE,
     checkOutDate DATE,
     totalPrice FLOAT,
     status ENUM('pending', 'confirmed', 'cancelled'),
     specialRequests TEXT,
     paymentStatus ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
     updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (userId) REFERENCES user(id),
     FOREIGN KEY (roomId) REFERENCES room(id),
     FOREIGN KEY (hotelId) REFERENCES hotel(id)
);

CREATE TABLE review (
     id CHAR(36) NOT NULL PRIMARY KEY,
     hotelId CHAR(36) NOT NULL,
     userId CHAR(36) NOT NULL,
     reservationId CHAR(36) NOT NULL,
     rating INT CHECK (rating >= 1 AND rating <= 5),
     comment TEXT,
     isVisible BOOLEAN DEFAULT TRUE,
     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
     updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (hotelId) REFERENCES hotel(id),
     FOREIGN KEY (userId) REFERENCES user(id),
     FOREIGN KEY (reservationId) REFERENCES reservation(id)
);

CREATE TABLE notification (
     id CHAR(36) NOT NULL PRIMARY KEY,
     userId CHAR(36) NOT NULL,
     type VARCHAR(50),
     subject VARCHAR(255),
     message TEXT,
     isRead BOOLEAN DEFAULT FALSE,
     sentAt DATETIME NULL,
     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
     updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY(userId) REFERENCES user(id)
);

CREATE TABLE payment (
     id CHAR(36) NOT NULL PRIMARY KEY,
     reservationId CHAR(36) NOT NULL,
     amount FLOAT,
     currency VARCHAR(3) DEFAULT 'USD',
     method ENUM('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash'),
     status ENUM('pending', 'completed', 'failed', 'refunded'),
     transactionId VARCHAR(255) NULL,
     paymentDate DATETIME NULL,
     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
     updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (reservationId) REFERENCES reservation(id)
);

CREATE TABLE room_image (
     id CHAR(36) NOT NULL PRIMARY KEY,
     roomId CHAR(36) NOT NULL,
     imageUrl VARCHAR(255),
     isPrimary BOOLEAN DEFAULT FALSE,
     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
     updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (roomId) REFERENCES room(id)
);
