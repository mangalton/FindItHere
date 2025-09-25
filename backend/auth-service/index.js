// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const cors = require('cors'); // Import cors
// require('dotenv').config();

// const app = express();
// app.use(express.json());
// app.use(cors()); // Use cors middleware

// const PORT = process.env.PORT || 5001;
// const MONGO_URI = process.env.MONGO_URI;
// const JWT_SECRET = process.env.JWT_SECRET;
// const COLLEGE_DOMAIN = process.env.COLLEGE_DOMAIN;

// // Connect to MongoDB
// mongoose.connect(MONGO_URI)
//     .then(() => console.log('Auth Service MongoDB Connected'))
//     .catch(err => console.error(err));

// // User Schema
// const UserSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
// });
// const User = mongoose.model('User', UserSchema);

// // --- API Endpoints ---

// // 1. Register a new user
// app.post('/register', async (req, res) => {
//     try {
//         const { name, email, password } = req.body;

//         // Basic validation
//         if (!name || !email || !password) {
//             return res.status(400).json({ message: 'Please enter all fields.' });
//         }

//         // College Domain Validation
//         if (!email.endsWith(COLLEGE_DOMAIN)) {
//             return res.status(400).json({ message: `Registration is only allowed for ${COLLEGE_DOMAIN} emails.` });
//         }

//         let user = await User.findOne({ email });
//         if (user) {
//             return res.status(400).json({ message: 'User already exists.' });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         user = new User({ name, email, password: hashedPassword });
//         await user.save();

//         const payload = { user: { id: user.id } };
//         jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
//             if (err) throw err;
//             res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server Error');
//     }
// });

// // 2. Login a user
// app.post('/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         if (!email || !password) {
//             return res.status(400).json({ message: 'Please enter all fields.' });
//         }

//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ message: 'Invalid credentials.' });
//         }

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: 'Invalid credentials.' });
//         }

//         const payload = { user: { id: user.id } };
//         jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
//             if (err) throw err;
//             res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server Error');
//     }
// });


// app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const COLLEGE_DOMAIN = process.env.COLLEGE_DOMAIN;

// --- Nodemailer Setup (for sending emails) ---
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // e.g., 'smtp.gmail.com'
    port: process.env.EMAIL_PORT, // e.g., 587
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
});

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Auth Service MongoDB Connected'))
    .catch(err => console.error(err));

// User Schema
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date }
});
const User = mongoose.model('User', UserSchema);

// --- API Endpoints ---

// 1. Register User & Send OTP
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!email.endsWith(COLLEGE_DOMAIN)) {
        return res.status(400).json({ message: `Registration is only allowed for ${COLLEGE_DOMAIN} emails.` });
    }

    try {
        let user = await User.findOne({ email });

        if (user && user.isVerified) {
            return res.status(400).json({ message: 'User with this email already exists and is verified.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

        if (user) { // User exists but is not verified, update them
            user.password = hashedPassword;
            user.name = name;
            user.otp = otp;
            user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
            await user.save();
        } else { // Create a new user
            user = new User({
                name,
                email,
                password: hashedPassword,
                otp,
                otpExpires: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
            });
            await user.save();
        }

        // Send OTP email
        await transporter.sendMail({
            from: `"FindItHere" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Verification Code for FindItHere',
            html: `<p>Your OTP is: <b>${otp}</b>. It will expire in 10 minutes.</p>`,
        });

        res.status(201).json({ message: 'Registration successful. Please check your email for the verification code.' });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// 2. Verify Email with OTP
app.post('/verify-email', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() } // Check if OTP is not expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const payload = { user: { id: user.id, name: user.name } };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, user: { _id: user.id, name: user.name, email: user.email } });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// 3. Login User
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        if (!user.isVerified) {
             return res.status(403).json({ message: 'Please verify your email before logging in.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const payload = { user: { id: user.id, name: user.name } };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, user: { _id: user.id, name: user.name, email: user.email } });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));

