const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// GET ALL
exports.getAllInformation = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const offset = (pageInt - 1) * limitInt;

    let baseQuery = 'SELECT * FROM information';
    let countQuery = 'SELECT COUNT(*) as total FROM information';
    const params = [];

    // ✅ Tambahkan pengecekan kosong string
    if (type && type !== '') {
      baseQuery += ' WHERE type = ?';
      countQuery += ' WHERE type = ?';
      params.push(type);
    }

    baseQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const queryParams = [...params, limitInt, offset];

    const [data] = await db.query(baseQuery, queryParams);
    const [countResult] = await db.query(countQuery, params);

    const totalData = countResult[0].total;
    const totalPages = Math.ceil(totalData / limitInt);

    res.json({
      data,
      pagination: {
        totalData,
        totalPages,
        currentPage: pageInt,
        limit: limitInt,
      },
    });

  } catch (error) {
    console.error('>>> ERROR getAllInformation:', error);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};


// GET BY ID
exports.getInformationById = (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM information WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Information not found' });
    res.json(results[0]);
  });
};

// CREATE
exports.createInformation = async (req, res) => {
  try {
    console.log('>>> REQ.BODY:', req.body);
    console.log('>>> REQ.FILE:', req.file);

    const { title, description, type, location, contact_person, event_date } = req.body;

    if (!title || !description || !type || !location || !contact_person) {
      return res.status(400).json({ message: 'Field wajib tidak lengkap' });
    }

    const imagePath = req.file ? `/uploads/information/${req.file.filename}` : null;

   await db.query(`
    INSERT INTO information (type, title, description, location, contact_person, event_date, image)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [type, title, description, location, contact_person, event_date, imagePath]
  );


    res.status(201).json({ message: 'Informasi berhasil disimpan' });

  } catch (error) {
    console.error('>>> ERROR createInformation:', error);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};


// UPDATE
exports.updateInformation = (req, res) => {
  const id = req.params.id;
  const { type, title, description, location, contact_person } = req.body;
  const image = req.file ? `/uploads/information/${req.file.filename}` : null;

  // Ambil data lama buat hapus file lama (optional)
  db.query('SELECT image FROM information WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    const oldImage = results[0]?.image;

    let query = `
      UPDATE information
      SET type=?, title=?, description=?, location=?, contact_person=?
    `;
    const params = [type, title, description, location, contact_person];

    if (image) {
      query += ', image=?';
      params.push(image);

      // Hapus file lama kalau ada
      if (oldImage) {
        const oldPath = path.join(__dirname, '..', oldImage);
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, (err) => {
            if (err) console.error('Gagal hapus file lama:', err);
          });
        }
      }
    }

    query += ' WHERE id=?';
    params.push(id);

    db.query(query, params, (err) => {
      if (err) return res.status(500).json({ message: 'Update failed', error: err });
      res.json({ message: 'Information updated' });
    });
  });
};

// DELETE
exports.deleteInformation = (req, res) => {
  const id = req.params.id;

  // Ambil data dulu buat hapus file image-nya
  db.query('SELECT image FROM information WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    const imagePath = results[0]?.image;
    if (imagePath) {
      const fullPath = path.join(__dirname, '..', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, (err) => {
          if (err) console.error('Gagal hapus file saat delete:', err);
        });
      }
    }

    // Hapus datanya
    db.query('DELETE FROM information WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ message: 'Delete failed', error: err });
      res.json({ message: 'Information deleted' });
    });
  });
};
