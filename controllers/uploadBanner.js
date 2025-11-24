// controllers/uploadController.js
const fs = require('fs');
const path = require('path');

exports.getBannerKomplek = (req, res) => {
  const bannerDir = path.join(__dirname, '..', 'uploads', 'banner');

  fs.readdir(bannerDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Gagal membaca folder banner' });
    }

    // Ambil file terakhir berdasarkan waktu dibuat
    const sortedFiles = files
      .filter(file => /\.(jpg|jpeg|png|gif)$/.test(file)) // hanya gambar
      .map(file => ({
        name: file,
        time: fs.statSync(path.join(bannerDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (sortedFiles.length === 0) {
      return res.status(404).json({ error: 'Tidak ada banner ditemukan' });
    }

    const latestBanner = sortedFiles[0].name;
    const fileUrl = `/uploads/banner/${latestBanner}`;
    res.json({ fileUrl });
  });
};

exports.uploadBannerKomplek = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded!' });
    }

    const fileUrl = `/uploads/banner/${req.file.filename}`;

    return res.status(200).json({
      message: 'File uploaded successfully',
      fileUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};
