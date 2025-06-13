const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const mysql = require('mysql2/promise'); // Correct: Import the promise-based version
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const app = express();

// Google OAuth2 client setup
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware to parse JSON and handle file uploads
app.use(cors());
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// MySQL database connection using credentials from .env
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Adjust as needed
    queueLimit: 0
});

// Middleware to attach the pool to the request object for easy access in routes
app.use((req, res, next) => {
    req.db = pool; // Now req.db is the promise-based pool
    next();
});

// Connect to the database and create tables using async/await for consistency
(async () => {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('Connected to the database as ID ' + connection.threadId);

        // Create the `daily_tips` table if it doesn't exist
        const createDailyTipsTableQuery = `
            CREATE TABLE IF NOT EXISTS daily_tips (
                id INT NOT NULL AUTO_INCREMENT,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                category VARCHAR(100) DEFAULT NULL,
                image_url VARCHAR(2048) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                source_text VARCHAR(512) DEFAULT NULL,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `;
        await connection.query(createDailyTipsTableQuery);
        console.log('`daily_tips` table checked/created successfully');

        // Create the `users` table if it doesn't exist
        const createUsersTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id varchar(255) NOT NULL,
                username varchar(100) NOT NULL,
                email varchar(100) NOT NULL,
                password varchar(255) DEFAULT NULL,
                googleId varchar(255) DEFAULT NULL,
                avatar_url text DEFAULT NULL,
                created_at timestamp NULL DEFAULT current_timestamp(),
                updated_at timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (id),
                UNIQUE KEY unique_email (email),
                UNIQUE KEY unique_username (username)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `;
        await connection.query(createUsersTableQuery);
        console.log('`users` table checked/created successfully');

        // Create the `mood_record` table if it doesn't exist
        const createMoodRecordTableQuery = `
            CREATE TABLE IF NOT EXISTS mood_record (
                id INT(11) NOT NULL AUTO_INCREMENT,
                user_id VARCHAR(255) NOT NULL,
                mood VARCHAR(50) NOT NULL,
                confidence FLOAT NOT NULL,
                timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                KEY user_id (user_id),
                CONSTRAINT mood_record_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `;
        await connection.query(createMoodRecordTableQuery);
        console.log('`mood_record` table checked/created successfully');

    } catch (err) {
        console.error('Error during database connection or table creation:', err.stack);
    } finally {
        if (connection) connection.release(); // Release the connection back to the pool
    }
})();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Access token required'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                status: 'error',
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
};

// Function to verify Google token
async function verifyGoogleToken(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        return ticket.getPayload();
    } catch (error) {
        console.error('Error verifying Google token:', error);
        return null;
    }
}

// Function to generate unique username from email
function generateUsernameFromEmail(email) {
    const baseUsername = email.split('@')[0];
    const randomSuffix = Math.floor(Math.random() * 10000);
    return `${baseUsername}_${randomSuffix}`;
}

// POST route for Google OAuth login/signup
app.post('/api/auth/google', async (req, res) => { // Made async
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                status: 'error',
                message: 'Google token is required'
            });
        }

        const payload = await verifyGoogleToken(token);

        if (!payload) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid Google token'
            });
        }

        const { sub: googleId, email, name, picture } = payload;

        // Check if user already exists by email or googleId
        const checkUserQuery = 'SELECT * FROM users WHERE email = ? OR googleId = ?';
        const [results] = await req.db.execute(checkUserQuery, [email, googleId]); // Use req.db.execute()

        let user;
        let isNewUser = false;

        if (results.length > 0) {
            user = results[0];

            // Update Google ID and avatar if not set
            const updateQuery = `
                UPDATE users 
                SET googleId = COALESCE(googleId, ?), 
                    avatar_url = COALESCE(?, avatar_url),
                    updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `;
            // Using req.db.execute() for update
            await req.db.execute(updateQuery, [googleId, picture, user.id]);

            user.googleId = user.googleId || googleId;
            user.avatar_url = picture || user.avatar_url;

        } else {
            isNewUser = true;
            const userId = uuidv4();

            let username = generateUsernameFromEmail(email);

            // Check if username already exists and make it unique
            const checkUsernameQuery = 'SELECT COUNT(*) as count FROM users WHERE username LIKE ?';
            const usernamePattern = `${username.split('_')[0]}_%`;

            const [usernameResults] = await req.db.execute(checkUsernameQuery, [usernamePattern]); // Use req.db.execute()

            if (usernameResults[0].count > 0) {
                username = `${username.split('_')[0]}_${Date.now()}`;
            }

            // Insert new user
            const insertUserQuery = `
                INSERT INTO users (id, username, email, googleId, avatar_url, password) 
                VALUES (?, ?, ?, ?, ?, NULL)
            `;
            await req.db.execute(insertUserQuery, [userId, username, email, googleId, picture]); // Use req.db.execute()

            user = {
                id: userId,
                username: username,
                email: email,
                googleId: googleId,
                avatar_url: picture,
                created_at: new Date().toISOString()
            };
        }

        const jwtToken = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                username: user.username
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({
            status: 'success',
            message: isNewUser ? 'Account created successfully with Google' : 'Login successful',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    avatar_url: user.avatar_url,
                    created_at: user.created_at
                },
                token: jwtToken,
                isNewUser: isNewUser
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Google OAuth error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error during Google authentication'
        });
    }
});

// Self-assessment features definition
const ASSESSMENT_FEATURES = [
    'age', 'panic', 'sweating', 'concentration_trouble', 'work_trouble',
    'hopelessness', 'anger', 'over_react', 'eating_change', 'suicidal_thought',
    'tired', 'weight_gain', 'introvert', 'nightmares', 'avoids_people_activities',
    'negative_feeling', 'self_blaming', 'hallucinations', 'repetitive_behaviour',
    'increased_energy'
];

// POST route for user registration
app.post('/api/auth/register', async (req, res) => { // Made async
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Username, email, and password are required'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid email format'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                status: 'error',
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const checkUserQuery = 'SELECT id FROM users WHERE email = ? OR username = ?';
        const [results] = await req.db.execute(checkUserQuery, [email, username]); // Use req.db.execute()

        if (results.length > 0) {
            return res.status(409).json({
                status: 'error',
                message: 'User with this email or username already exists'
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generate user ID
        const userId = uuidv4();

        // Insert new user
        const insertUserQuery = 'INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)';
        await req.db.execute(insertUserQuery, [userId, username, email, hashedPassword]); // Use req.db.execute()

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: userId,
                email: email,
                username: username
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: {
                user: {
                    id: userId,
                    username: username,
                    email: email,
                    avatar_url: null,
                    created_at: new Date().toISOString()
                },
                token: token
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Registration error:', error.message);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// POST route for user login
app.post('/api/auth/login', async (req, res) => { // Made async
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email and password are required'
            });
        }

        // Find user by email
        const findUserQuery = 'SELECT id, username, email, password, avatar_url, created_at FROM users WHERE email = ?';
        const [results] = await req.db.execute(findUserQuery, [email]); // Use req.db.execute()

        if (results.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        const user = results[0];

        // Check if user has a password (not a Google-only user)
        if (!user.password) {
            return res.status(401).json({
                status: 'error',
                message: 'This account was created with Google. Please use Google Sign-In.'
            });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                username: user.username
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Update last login timestamp
        const updateLastLoginQuery = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        await req.db.execute(updateLastLoginQuery, [user.id]); // Use req.db.execute()

        return res.json({
            status: 'success',
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    avatar_url: user.avatar_url,
                    created_at: user.created_at
                },
                token: token
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Login error:', error.message);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});


// GET route to verify token and get user info
app.get('/api/auth/me', authenticateToken, async (req, res) => { // Made async
    try {
        const userId = req.user.userId;

        const getUserQuery = 'SELECT id, username, email, avatar_url, created_at FROM users WHERE id = ?';
        const [results] = await req.db.execute(getUserQuery, [userId]); // Use req.db.execute()

        if (results.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        return res.json({
            status: 'success',
            data: {
                user: results[0]
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Get user info error:', error.message);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});


// GET route for daily tips with pagination
app.get('/api/daily-tip', async (req, res) => {
    try {
        let { category, random, limit = 8, page = 1 } = req.query;
        console.log('Received query params:', req.query);

        const limitNum = parseInt(limit);
        const pageNum = parseInt(page);

        if (isNaN(limitNum) || limitNum <= 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid limit parameter. Must be a positive number.',
                timestamp: new Date().toISOString()
            });
        }

        if (isNaN(pageNum) || pageNum <= 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid page parameter. Must be a positive number.',
                timestamp: new Date().toISOString()
            });
        }

        const offset = (pageNum - 1) * limitNum;

        // --- Query for total count ---
        let countQuery = 'SELECT COUNT(*) as total FROM daily_tips';
        let countParams = [];

        if (category) {
            countQuery += ' WHERE category = ?';
            countParams.push(category);
        }

        let totalTips = 0;
        try {
            const [countResults] = await req.db.execute(countQuery, countParams);
            totalTips = countResults[0].total;
        } catch (dbError) {
            console.error('Database error fetching daily tips count:', dbError);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve total daily tips count from the database.',
                details: process.env.NODE_ENV === 'development' ? dbError.message : 'Database query failed.'
            });
        }

        const totalPages = Math.ceil(totalTips / limitNum);

        if (totalTips === 0) {
            return res.status(200).json({
                status: 'success',
                message: 'No daily tips found.',
                data: [],
                pagination: {
                    currentPage: pageNum,
                    totalPages: 0,
                    limit: limitNum,
                    totalTips: 0
                },
                timestamp: new Date().toISOString()
            });
        }

        // --- Fetch tips based on random or pagination ---
        let results;
        let query;
        let queryParams;

        if (random === 'true') {
            query = 'SELECT * FROM daily_tips';
            queryParams = [];

            if (category) {
                query += ' WHERE category = ?';
                queryParams.push(category);
            }

            query += ` ORDER BY RAND() LIMIT ${mysql.escape(limitNum)}`;

        } else {
            query = 'SELECT * FROM daily_tips';
            queryParams = [];

            if (category) {
                query += ' WHERE category = ?';
                queryParams.push(category);
            }

            query += ` ORDER BY created_at DESC LIMIT ${mysql.escape(limitNum)} OFFSET ${mysql.escape(offset)}`;
        }

        console.log('limitNum:', limitNum, 'offset:', offset);
        console.log('Final SQL Query:', query, queryParams);

        try {
            [results] = await req.db.execute(query, queryParams);
        } catch (dbError) {
            console.error('Database error fetching daily tips:', dbError);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve daily tips from the database.',
                details: process.env.NODE_ENV === 'development' ? dbError.message : 'Database query failed.'
            });
        }

        return res.json({
            status: 'success',
            data: results,
            pagination: {
                currentPage: pageNum,
                totalPages: totalPages,
                limit: limitNum,
                totalTips: totalTips
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Daily tip route general error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error while processing daily tips request.',
            details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred.'
        });
    }
});

// GET route for daily tip by ID
app.get('/api/daily-tip/:id', async (req, res) => { // Made async
    try {
        const tipId = parseInt(req.params.id);

        if (isNaN(tipId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid tip ID'
            });
        }

        const query = 'SELECT * FROM daily_tips WHERE id = ?';

        const [results] = await req.db.execute(query, [tipId]); // Use req.db.execute()

        if (results.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Daily tip not found'
            });
        }

        return res.json({
            status: 'success',
            data: results[0],
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Daily tip by ID error:', error.message);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// GET route for daily tip categories
app.get('/api/daily-tip/categories', async (req, res) => { // Made async
    try {
        const query = 'SELECT DISTINCT category FROM daily_tips WHERE category IS NOT NULL ORDER BY category';

        const [results] = await req.db.query(query); // Use req.db.query() for non-parameterized select

        const categories = results.map(row => row.category);

        return res.json({
            status: 'success',
            data: categories,
            count: categories.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Categories error:', error.message);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// POST route for self-assessment
app.post('/api/self-assessment', async (req, res) => { // Made async
    try {
        const assessmentData = req.body;

        const missingFields = ASSESSMENT_FEATURES.filter(field => !(field in assessmentData));
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`,
                required_fields: ASSESSMENT_FEATURES
            });
        }

        for (const field of ASSESSMENT_FEATURES) {
            if (!Number.isInteger(assessmentData[field]) || assessmentData[field] < 0) {
                return res.status(400).json({
                    success: false,
                    message: `Field '${field}' must be a non-negative integer`
                });
            }
        }

        console.log('Self-assessment data received:', assessmentData);

        const dataString = JSON.stringify(assessmentData);

        const python = spawn('myenv/bin/python', ['predict_model.py', dataString]);

        let predictionResult = '';
        let errorOutput = ''; // Capture stderr from Python process

        python.stdout.on('data', (data) => {
            predictionResult += data.toString();
        });

        python.stderr.on('data', (data) => {
            errorOutput += data.toString(); // Collect stderr
            console.error(`Python stderr: ${data}`);
        });

        python.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python process exited with code ${code}. Stderr: ${errorOutput}`); // Log stderr on error
                return res.status(500).json({
                    success: false,
                    message: 'Error during prediction execution',
                    error: errorOutput // Send stderr to frontend
                });
            }

            try {
                const parsedResult = JSON.parse(predictionResult);

                console.log('Prediction result:', parsedResult);

                if (parsedResult && parsedResult.label) {
                    return res.json({
                        success: true,
                        assessment_result: parsedResult,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    return res.status(500).json({
                        success: false,
                        message: 'Error parsing prediction result: Invalid format or missing label',
                        received_data: parsedResult // Include received data for debugging
                    });
                }
            } catch (err) {
                console.error('Error parsing prediction result:', err); // Log the actual parsing error
                return res.status(500).json({
                    success: false,
                    message: 'Error parsing prediction result',
                    raw_output: predictionResult, // Include raw output for debugging
                    parse_error: err.message
                });
            }
        });

        python.on('error', (err) => { // Handle errors emitted by the spawn process itself
            console.error('Failed to start Python process:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to start prediction process',
                error: err.message
            });
        });

    } catch (error) {
        console.error('Self-assessment error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during assessment'
        });
    }
});

// Improved multer configuration with better file naming
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const safeName = `mood_image_${timestamp}${ext}`;
        cb(null, safeName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // max 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// POST route for mood prediction based on image
app.post('/api/mood', upload.single('image'), async (req, res) => {
    const image = req.file;
    const { user_id } = req.body; // user_id is expected in req.body for FormData

    console.log(`DEBUG: Received user_id in req.body for /api/mood: ${user_id}`); // Debugging user_id

    if (!image) {
        return res.status(400).json({
            success: false,
            message: 'No image uploaded'
        });
    }

    if (user_id === undefined) {
        console.error("ERROR: user_id is undefined in /api/mood request body."); // Debugging error
        return res.status(400).json({
            success: false,
            message: 'User ID is required in the request body.'
        });
    }

    console.log(`Processing image: ${image.filename} for user: ${user_id}`);

    const imagePath = path.join(__dirname, image.path);

    const python = spawn('myenv/bin/python', ['predict_mood.py', imagePath], {
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
        encoding: 'utf8'
    });

    let predictionResult = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => {
        predictionResult += data.toString('utf8');
    });

    python.stderr.on('data', (data) => {
        errorOutput += data.toString('utf8');
        console.error(`Python stderr: ${data}`);
    });

    python.on('close', async (code) => {
        fs.unlink(imagePath, (unlinkErr) => {
            if (unlinkErr) {
                console.error('Error deleting uploaded file:', unlinkErr);
            }
        });

        if (code !== 0) {
            console.error(`Python process exited with code ${code}. Error output: ${errorOutput}`);
            return res.status(500).json({
                success: false,
                message: 'Error during prediction execution',
                error: errorOutput
            });
        }

        try {
            const cleanResult = predictionResult.trim();
            const parsedResult = JSON.parse(cleanResult);

            console.log('Prediction result:', parsedResult);

            if (parsedResult.error) {
                return res.status(500).json({
                    success: false,
                    message: 'Prediction error',
                    error: parsedResult.error
                });
            }

            // --- FIX IS HERE ---
            // The prediction and confidence are directly in parsedResult, not nested under .prediction
            if (parsedResult && typeof parsedResult.prediction !== 'undefined' && typeof parsedResult.confidence !== 'undefined') {
                const mood = parsedResult.prediction; // 'Happy' is directly under 'prediction' key
                const confidence = parsedResult.confidence; // Confidence is directly under 'confidence' key

                // Final check before database insert
                if (user_id === null || user_id === undefined || mood === null || mood === undefined || confidence === null || confidence === undefined) {
                    console.error(`ERROR: Cannot insert mood record. Missing data: user_id=${user_id}, mood=${mood}, confidence=${confidence}`);
                    return res.status(500).json({
                        success: false,
                        message: 'Missing or invalid data for saving mood record. Ensure all values are provided and not null/undefined.',
                        details: { userId: user_id, mood: mood, confidence: confidence }
                    });
                }

                try {
                    const [result] = await req.db.execute(
                        'INSERT INTO mood_record (user_id, mood, confidence) VALUES (?, ?, ?)',
                        [user_id, mood, confidence]
                    );
                    console.log('Mood record inserted:', result);
                } catch (dbErr) {
                    console.error('Error inserting mood record into database:', dbErr);
                    return res.status(500).json({
                        success: false,
                        message: 'Prediction successful, but failed to save mood record.',
                        prediction_result: parsedResult,
                        database_error: dbErr.message
                    });
                }

                return res.json({
                    success: true,
                    prediction_result: { mood: mood, confidence: confidence }, // Adjusted for consistent return structure
                    message: 'Mood prediction processed and recorded successfully!',
                    timestamp: new Date().toISOString()
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: 'Error: Invalid prediction result format or missing mood/confidence properties.',
                    received_data: parsedResult
                });
            }
        } catch (err) {
            console.error('Error processing prediction result or database operation:', err);
            console.error('Raw result:', predictionResult);
            return res.status(500).json({
                success: false,
                message: 'Error processing prediction or database operation',
                raw_output: predictionResult,
                parse_error: err.message
            });
        }
    });

    python.on('error', (err) => {
        console.error('Failed to start Python process:', err);
        fs.unlink(imagePath, () => { });
        return res.status(500).json({
            success: false,
            message: 'Failed to start prediction process',
            error: err.message
        });
    });
});

// GET route to retrieve mood records for a given user_id
app.get('/api/get-moods', async (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({
            success: false,
            message: 'Missing user_id in query parameters.'
        });
    }

    try {
        const [rows] = await req.db.execute(
            'SELECT id, mood, confidence, timestamp FROM mood_record WHERE user_id = ? ORDER BY timestamp DESC',
            [user_id]
        );

        return res.json({
            success: true,
            message: `Mood records fetched for user_id ${user_id}`,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching mood records:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch mood records',
            error: error.message
        });
    }
});

app.post('/api/daily-journal', async (req, res) => {
    const { user_id, title, content, mood, date } = req.body;  // added mood and date

    if (!user_id || !title || !content || !mood) {  // Check for missing mood
        return res.status(400).json({
            success: false,
            message: 'Missing user_id, title, content, or mood in request body.'
        });
    }

    try {
        const [result] = await req.db.execute(
            'INSERT INTO daily_journals (user_id, title, content, mood, date) VALUES (?, ?, ?, ?, ?)',  // Updated query to include mood and date
            [user_id, title, content, mood, date || null]  // If date is not provided, use null
        );

        return res.json({
            success: true,
            message: 'Daily journal entry created successfully!',
            data: { id: result.insertId, user_id, title, content, mood, date }
        });
    } catch (dbErr) {
        console.error('Error inserting journal entry:', dbErr);
        return res.status(500).json({
            success: false,
            message: 'Failed to create daily journal entry.',
            error: dbErr.message
        });
    }
});


app.get('/api/daily-journal', async (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({
            success: false,
            message: 'Missing user_id in query parameters.'
        });
    }

    try {
        const [rows] = await req.db.execute(
            'SELECT id, title, content, mood, date, created_at, updated_at FROM daily_journals WHERE user_id = ? ORDER BY created_at DESC',  // Updated query to select mood and date
            [user_id]
        );

        return res.json({
            success: true,
            message: `Journal entries fetched for user_id ${user_id}`,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch journal entries',
            error: error.message
        });
    }
});

app.put('/api/daily-journal/:id', async (req, res) => {
    const journalId = req.params.id;
    const { title, content, mood, date } = req.body;  // Allow mood and date to be updated

    if (!title || !content || !mood) {  // Check for missing mood
        return res.status(400).json({
            success: false,
            message: 'Missing title, content, or mood in request body.'
        });
    }

    try {
        const [result] = await req.db.execute(
            'UPDATE daily_journals SET title = ?, content = ?, mood = ?, date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [title, content, mood, date || null, journalId]  // Include mood and date in update
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Journal entry not found.'
            });
        }

        return res.json({
            success: true,
            message: 'Journal entry updated successfully!',
            data: { id: journalId, title, content, mood, date }
        });
    } catch (dbErr) {
        console.error('Error updating journal entry:', dbErr);
        return res.status(500).json({
            success: false,
            message: 'Failed to update journal entry.',
            error: dbErr.message
        });
    }
});


app.delete('/api/daily-journal/:id', async (req, res) => {
    const journalId = req.params.id;

    try {
        const [result] = await req.db.execute(
            'DELETE FROM daily_journals WHERE id = ?',
            [journalId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Journal entry not found.'
            });
        }

        return res.json({
            success: true,
            message: 'Journal entry deleted successfully!'
        });
    } catch (dbErr) {
        console.error('Error deleting journal entry:', dbErr);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete journal entry.',
            error: dbErr.message
        });
    }
});



// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
