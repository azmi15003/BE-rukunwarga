const db = require('../config/database');

// Fungsi untuk mengambil data warga dengan opsi pencarian
exports.getAllWarga = async (req, res) => {
  const { no_kk, nama, rt, page = 1, limit = 10 } = req.query;

  let query = 'SELECT * FROM warga';
  let conditions = [];
  let queryParams = [];

  if (rt) {
    conditions.push('rt = ?');
    queryParams.push(rt);
  }

  if (no_kk) {
    conditions.push('no_kk LIKE ?');
    queryParams.push(`%${no_kk}%`);
  }

  if (nama) {
    conditions.push('nama LIKE ?');
    queryParams.push(`%${nama}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  const offset = (page - 1) * limit;
  query += ' LIMIT ?, ?';
  queryParams.push(offset, parseInt(limit));

  try {
    const [rows] = await db.query(query, queryParams);
    
    // Hitung total data dengan kondisi yang sama
    let countQuery = 'SELECT COUNT(*) as total FROM warga';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const [countResult] = await db.query(countQuery, queryParams.slice(0, queryParams.length - 2)); // exclude limit & offset
    
    res.json({
      data: rows,
      total: countResult[0].total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error mengambil data warga', error });
  }
};

exports.createWarga = async (req, res) => {
  try {
    const { no_kk, rt, nama, tanggal_lahir, jenis_kelamin, hubungan_keluarga, pekerjaan } = req.body;

    const query = `
      INSERT INTO warga (no_kk, rt, nama, tanggal_lahir, jenis_kelamin, hubungan_keluarga, pekerjaan)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [no_kk, rt, nama, tanggal_lahir, jenis_kelamin, hubungan_keluarga, pekerjaan]);

    res.status(201).json({ message: 'Data warga berhasil dibuat', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error membuat data warga', error: error.message });
  }
};