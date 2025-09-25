const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import cors
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors()); // Use cors middleware

const PORT = process.env.PORT || 5003;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Search Service MongoDB Connected'))
    .catch(err => console.error(err));
    
// We need the Item schema here as well to perform search queries
const ItemSchema = new mongoose.Schema({
    name: String,
    description: String,
    category: String,
    type: String
});
const Item = mongoose.model('Item', ItemSchema);


// --- API Endpoints ---
app.get('/search', async (req, res) => {
    try {
        const { query, category, type } = req.query;

        let filter = {};

        if (query) {
            // Case-insensitive text search on name and description
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }
        if (category) {
            filter.category = category;
        }
        if (type) {
            filter.type = type;
        }
        
        const items = await Item.find(filter);
        res.json(items);

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


app.listen(PORT, () => console.log(`Search Service running on port ${PORT}`));

