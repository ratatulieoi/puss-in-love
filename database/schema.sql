CREATE DATABASE IF NOT EXISTS puss_in_love;
USE puss_in_love;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(100),
    avatar_url VARCHAR(500),
    role ENUM('user', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS breeds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    origin VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    breed_id INT,
    name VARCHAR(100) NOT NULL,
    gender ENUM('male', 'female', 'unknown') DEFAULT 'unknown',
    birth_date DATE,
    color VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (breed_id) REFERENCES breeds(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS cat_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cat_id INT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cat_id) REFERENCES cats(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vaccinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cat_id INT NOT NULL,
    vaccine_name VARCHAR(100) NOT NULL,
    date_given DATE,
    certificate_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cat_id) REFERENCES cats(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS swipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    owner_cat_id INT NOT NULL,
    target_cat_id INT NOT NULL,
    direction ENUM('like', 'pass') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_cat_id) REFERENCES cats(id) ON DELETE CASCADE,
    FOREIGN KEY (target_cat_id) REFERENCES cats(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, owner_cat_id, target_cat_id)
);

CREATE TABLE IF NOT EXISTS matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_a_id INT NOT NULL,
    user_b_id INT NOT NULL,
    cat_a_id INT NOT NULL,
    cat_b_id INT NOT NULL,
    matched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_a_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_b_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cat_a_id) REFERENCES cats(id) ON DELETE CASCADE,
    FOREIGN KEY (cat_b_id) REFERENCES cats(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL,
    target_cat_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_cat_id) REFERENCES cats(id) ON DELETE CASCADE,
    UNIQUE KEY (reporter_id, target_cat_id)
);


INSERT IGNORE INTO breeds (name, description, origin) VALUES
('Persian', 'Long-haired breed known for flat face and calm temperament', 'Iran'),
('Siamese', 'Vocal and social breed with blue eyes and pointed coloring', 'Thailand'),
('Maine Coon', 'Large, friendly breed with tufted ears and bushy tail', 'United States'),
('British Shorthair', 'Sturdy breed with dense coat and round face', 'United Kingdom'),
('Ragdoll', 'Large, docile breed that goes limp when picked up', 'United States'),
('Bengal', 'Athletic breed with leopard-like spotted coat', 'United States'),
('Scottish Fold', 'Medium breed known for folded ears and owl-like appearance', 'Scotland'),
('Sphynx', 'Hairless breed known for wrinkled skin and extrovert personality', 'Canada'),
('Abyssinian', 'Active and playful breed with ticked tabby coat', 'Ethiopia'),
('Mixed/Domestic', 'Mixed breed or domestic cat', 'Various');
