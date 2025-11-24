const db = require('../config/database');

exports.createNews = async (req, res) => {
  try {
    const { title, content, event_date } = req.body;
    const image_path = req.file ? `/uploads/news/${req.file.filename}` : null;

    const sql = `
      INSERT INTO news_events (title, content, event_date, image_path)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [title, content, event_date, image_path]);

    res.status(201).json({
      message: 'Berita berhasil dibuat',
      newsId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error membuat berita', error: error.message });
  }
};

exports.getAllNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [countResult] = await db.query('SELECT COUNT(*) AS total FROM news_events');
    const totalData = countResult[0].total;
    const totalPages = Math.ceil(totalData / limit);

    const [rows] = await db.query(`
      SELECT 
        id, title, content, image_path,
        DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at,
        DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date
      FROM news_events
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const formattedRows = rows.map((item) => ({
      ...item,
      image_url: item.image_path ? `http://localhost:4000${item.image_path}` : null
    }));

    res.json({
      data: formattedRows,
      pagination: {
        totalData,
        totalPages,
        currentPage: page,
        perPage: limit,
      }
    });
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ message: 'Error mengambil data berita' });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, event_date } = req.body;
    const image_path = req.file ? `/uploads/news/${req.file.filename}` : null;

    let sql = 'UPDATE news_events SET title = ?, content = ?, event_date = ?';
    const values = [title, content, event_date];

    if (image_path) {
      sql += ', image_path = ?';
      values.push(image_path);
    }

    sql += ' WHERE id = ?';
    values.push(id);

    await db.query(sql, values);

    res.json({ message: 'Berita berhasil diperbarui' });
  } catch (err) {
    console.error('Error updating news:', err);
    res.status(500).json({ message: 'Gagal memperbarui berita' });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM news_events WHERE id = ?', [id]);
    res.json({ message: 'Berita berhasil dihapus' });
  } catch (err) {
    console.error('Error deleting news:', err);
    res.status(500).json({ message: 'Gagal menghapus berita' });
  }
};

exports.uploadImage = (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const filePath = `/uploads/news/${req.file.filename}`;
  res.json({ message: 'Upload sukses', path: filePath });
};
