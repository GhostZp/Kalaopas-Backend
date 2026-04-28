-- Drop the database if it exists and then create it
DROP DATABASE IF EXISTS FishApp;
CREATE DATABASE FishApp;
USE FishApp;

-- Create the tables

CREATE TABLE UserLevels (
    level_id INT AUTO_INCREMENT PRIMARY KEY,
    level_name VARCHAR(50) NOT NULL
);

CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    user_level_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_level_id) REFERENCES UserLevels(level_id)
);

CREATE TABLE MediaItems (
    media_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    filesize INT NOT NULL,
    media_type VARCHAR(255) NOT NULL,
    fish_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    source VARCHAR(255) NOT NULL,
    recipe VARCHAR(255) NOT NULL,
    sustainability ENUM('green', 'yellow', 'red') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Likes (
    like_id INT AUTO_INCREMENT PRIMARY KEY,
    media_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES MediaItems(media_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Insert the sample data MADE WITH AI

INSERT INTO UserLevels (level_name) VALUES ('Admin'), ('User');

INSERT INTO Users (username, password, email, user_level_id) VALUES
('JohnDoe', 'to-be-hashed-pw1', 'johndoe@example.com', 2),
('JaneSmith', 'to-be-hashed-pw2', 'janesmith@example.com', 2),
('Anon5468', 'to-be-hashed-pw3', 'anon5468@example.com', 2),
('AdminUser', 'to-be-hashed-pw4', 'adminuser@example.com', 1);

INSERT INTO MediaItems 
(user_id, filename, filesize, media_type, fish_name, description, source, recipe, sustainability)
VALUES
(4, 'herring.jpg', 204800, 'image/jpeg', 'Fried Herring', 'Classic Nordic dish, very sustainable', 'WWF Guide', 'Pan fry with butter and onions', 'green'),

(4, 'sardines.jpg', 198500, 'image/jpeg', 'Grilled Sardines', 'Simple and eco-friendly seafood', 'WWF Guide', 'Grill with olive oil and lemon', 'green'),

(4, 'mussels.jpg', 250000, 'image/jpeg', 'Mussels in White Wine', 'Low impact and delicious', 'WWF Guide', 'Cook with garlic, parsley, and white wine', 'green');

INSERT INTO MediaItems 
(user_id, filename, filesize, media_type, fish_name, description, source, recipe, sustainability)
VALUES
(4, 'salmon.jpg', 300000, 'image/jpeg', 'Salmon Fillet', 'Farmed salmon - check origin', 'WWF Guide', 'Bake with herbs and lemon', 'yellow'),

(4, 'tuna.jpg', 275000, 'image/jpeg', 'Seared Tuna Steak', 'Depends on fishing method', 'WWF Guide', 'Quick sear with sesame crust', 'yellow'),

(4 , 'cod.jpg', 320000, 'image/jpeg', 'Fish and Chips (Cod)', 'Some stocks are overfished', 'WWF Guide', 'Deep fry in batter', 'yellow');
INSERT INTO MediaItems 

(user_id, filename, filesize, media_type, fish_name, description, source, recipe, sustainability)
VALUES
(4, 'bluefin.jpg', 290000, 'image/jpeg', 'Bluefin Tuna Sushi', 'Highly overfished species', 'WWF Guide', 'Serve raw as sushi', 'red'),

(4, 'eel.jpg', 260000, 'image/jpeg', 'Grilled Eel', 'Critically endangered in Europe', 'WWF Guide', 'Grill with sweet soy glaze', 'red'),

(4, 'shark.jpg', 310000, 'image/jpeg', 'Shark Steak', 'Unsustainable fishing practices', 'WWF Guide', 'Pan fry with spices', 'red');

INSERT INTO Likes (media_id, user_id) VALUES
(1, 2),
(2, 1),
(2, 2),
(3, 1),
(2, 3),
(3, 3);