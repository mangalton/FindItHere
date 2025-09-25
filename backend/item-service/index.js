// const express = require('express');
// const mongoose = require('mongoose');
// const multer = require('multer');
// const path = require('path');
// const jwt = require('jsonwebtoken');
// const cors = require('cors');
// const fs = require('fs'); // Import the Node.js File System module
// require('dotenv').config();

// const app = express();
// app.use(express.json());
// app.use(cors());

// // --- Create uploads directory if it doesn't exist ---
// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir);
//     console.log('Created "uploads" directory for images.');
// }

// // Serve static files from the 'uploads' directory
// app.use('/uploads', express.static(uploadsDir));

// const PORT = process.env.PORT || 5002;
// const MONGO_URI = process.env.MONGO_URI;
// const JWT_SECRET = process.env.JWT_SECRET;

// // Connect to MongoDB
// mongoose.connect(MONGO_URI)
//     .then(() => console.log('Item Service MongoDB Connected'))
//     .catch(err => console.error(err));

// // Item Schema
// const ItemSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     description: { type: String, required: true },
//     category: { type: String, required: true },
//     type: { type: String, required: true, enum: ['Lost', 'Found'] },
//     imageUrl: { type: String },
//     status: { type: String, default: 'Available', enum: ['Available', 'Claimed', 'Returned'] },
//     reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     dateReported: { type: Date, default: Date.now }
// });
// const Item = mongoose.model('Item', ItemSchema);

// // --- Multer Setup for Image Uploads ---
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname));
//     }
// });
// const upload = multer({ storage: storage });

// // --- Auth Middleware ---
// const authMiddleware = (req, res, next) => {
//     const token = req.header('x-auth-token');
//     if (!token) {
//         return res.status(401).json({ message: 'No token, authorization denied.' });
//     }
//     try {
//         const decoded = jwt.verify(token, JWT_SECRET);
//         req.user = decoded.user;
//         next();
//     } catch (error) {
//         res.status(401).json({ message: 'Token is not valid.' });
//     }
// };

// // --- API Endpoints ---
// app.get('/items', authMiddleware, async (req, res) => {
//     try {
//         const items = await Item.find().sort({ dateReported: -1 });
//         res.json(items);
//     } catch (error) {
//         res.status(500).send('Server Error');
//     }
// });

// app.post('/items', [authMiddleware, upload.single('image')], async (req, res) => {
//     try {
//         const { name, description, category, type } = req.body;
        
//         if(!name || !description || !category || !type) {
//             return res.status(400).json({ message: 'Please fill out all required fields.' });
//         }

//         const newItem = new Item({
//             name,
//             description,
//             category,
//             type,
//             imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
//             reportedBy: req.user.id
//         });

//         const item = await newItem.save();
//         res.status(201).json(item);

//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server Error');
//     }
// });

// app.put('/items/:id/claim', authMiddleware, async (req, res) => {
//     try {
//         let item = await Item.findById(req.params.id);
//         if (!item) return res.status(404).json({ message: 'Item not found' });
        
//         if (item.reportedBy.toString() === req.user.id) {
//             return res.status(400).json({ message: "You cannot claim an item you reported." });
//         }

//         item.status = 'Claimed';
//         await item.save();
//         res.json(item);
//     } catch (error) {
//         res.status(500).send('Server Error');
//     }
// });

// app.delete('/items/:id', authMiddleware, async (req, res) => {
//     try {
//         let item = await Item.findById(req.params.id);
//         if (!item) return res.status(404).json({ message: 'Item not found' });

//         if (item.reportedBy.toString() !== req.user.id) {
//             return res.status(401).json({ message: 'User not authorized' });
//         }

//         // Delete the associated image file if it exists
//         if (item.imageUrl) {
//             const filename = path.basename(item.imageUrl); // a.png
//             const imagePath = path.join(__dirname, 'uploads', filename);
            
//             fs.unlink(imagePath, (err) => {
//                 if (err) {
//                     console.error(`Failed to delete image for item ${item._id}:`, err);
//                 } else {
//                     console.log(`Deleted image: ${imagePath}`);
//                 }
//             });
//         }

//         await Item.findByIdAndDelete(req.params.id);
//         res.json({ message: 'Item removed' });
//     } catch (error) {
//         res.status(500).send('Server Error');
//     }
// });

// app.listen(PORT, () => console.log(`Item Service running on port ${PORT}`));

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- Cloudinary Configuration ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Item Service MongoDB Connected'))
    .catch(err => console.error(err));

// Item Schema
const ItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    type: { type: String, required: true, enum: ['Lost', 'Found'] },
    imageUrl: { type: String },
    cloudinaryPublicId: { type: String }, // To store the public_id for deletion
    status: { type: String, default: 'Available', enum: ['Available', 'Claimed', 'Returned'] },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateReported: { type: Date, default: Date.now }
});
const Item = mongoose.model('Item', ItemSchema);

// --- Multer Setup for Cloudinary ---
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'findithere-uploads', // A folder name in your Cloudinary account
        allowedFormats: ['jpeg', 'png', 'jpg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optional transformations
    },
});
const upload = multer({ storage: storage });

// --- Auth Middleware ---
const authMiddleware = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid.' });
    }
};

// --- API Endpoints ---
app.get('/items', authMiddleware, async (req, res) => {
    try {
        const items = await Item.find().sort({ dateReported: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

app.post('/items', [authMiddleware, upload.single('image')], async (req, res) => {
    try {
        const { name, description, category, type } = req.body;
        
        if(!name || !description || !category || !type) {
            return res.status(400).json({ message: 'Please fill out all required fields.' });
        }

        const newItem = new Item({
            name,
            description,
            category,
            type,
            imageUrl: req.file ? req.file.path : null, // The secure URL from Cloudinary
            cloudinaryPublicId: req.file ? req.file.filename : null, // The public_id from Cloudinary
            reportedBy: req.user.id
        });

        const item = await newItem.save();
        res.status(201).json(item);

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.put('/items/:id/claim', authMiddleware, async (req, res) => {
    try {
        let item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        
        if (item.reportedBy.toString() === req.user.id) {
            return res.status(400).json({ message: "You cannot claim an item you reported." });
        }

        item.status = 'Claimed';
        await item.save();
        res.json(item);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

app.delete('/items/:id', authMiddleware, async (req, res) => {
    try {
        let item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        if (item.reportedBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Delete the image from Cloudinary if it exists
        if (item.cloudinaryPublicId) {
            await cloudinary.uploader.destroy(item.cloudinaryPublicId);
        }

        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item removed' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.listen(PORT, () => console.log(`Item Service running on port ${PORT}`));

