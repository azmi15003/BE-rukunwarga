const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/database'); // <- ini yang kurang tadi

// Routes
const inhabitantRoutes = require('./routes/inhabitantRoutes');
const kkRoutes = require('./routes/kkRoutes');
const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const organizationNodesRoutes = require('./routes/organizationNodesRoutes');
const informationRoutes = require('./routes/informationRoutes');
const bannerRoutes = require('./routes/uploadBanner');
const typeRoutes = require('./routes/typeRoutes');
const documentRoutes = require('./routes/documentRoutes');

// Tes koneksi DB
db.getConnection()
  .then(() => {
    console.log('Database connected');
  })
  .catch((err) => {
    console.error('Failed to connect database:', err);
  });

const app = express();

// Middleware umum
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static untuk file upload (akses image)
// Contoh: http://localhost:4000/uploads/information/filename.png
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routing API
app.use('/api/auth', authRoutes);
app.use('/api/kk', kkRoutes);
app.use('/api/warga', inhabitantRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/organization-nodes', organizationNodesRoutes);
app.use('/api/information', informationRoutes);
app.use('/api/banner', bannerRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/documents', documentRoutes);

// Tes route
app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

// Jalankan server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
