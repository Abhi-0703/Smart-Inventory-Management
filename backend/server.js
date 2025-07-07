const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ⬇️ Routes
const productRoutes = require('./Routes/productRoutes');
app.use('/api/products', productRoutes);

const demandRoutes = require('./Routes/demandRoutes');
app.use('/api/demands', demandRoutes);

const transferRoutes = require('./Routes/transferRoutes');
app.use('/api/transfers', transferRoutes);

// ✅ ⬇️ Recommended Smart Suggestion Route
const recommendationRoutes = require('./Routes/recommendationRoutes');
app.use('/api/recommendations', recommendationRoutes);

const PORT = process.env.PORT || 5000;

// ⬇️ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(err));

// ⬇️ Basic test route
app.get('/', (req, res) => {
  res.send("API is running");
});

// ⬇️ Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
