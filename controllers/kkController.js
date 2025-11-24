const db = require('../config/database');

exports.createKK = async (req, res) => {
  const conn = await db.getConnection()
  try {
    const {
      kk,
      wargas
    } = req.body

    await conn.beginTransaction()

    // Insert KK
    const [kkResult] = await conn.query(
      `INSERT INTO kartu_keluarga
      (no_kk, nama_kepala_keluarga, alamat, rt, rw, kode_pos, kelurahan, kecamatan, kabupaten, provinsi, tanggal_dikeluarkan)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        kk.no_kk,
        kk.nama_kepala_keluarga,
        kk.alamat,
        kk.rt,
        kk.rw,
        kk.kode_pos,
        kk.kelurahan,
        kk.kecamatan,
        kk.kabupaten,
        kk.provinsi,
        kk.tanggal_dikeluarkan
      ]
    )

    const kkId = kkResult.insertId

    // Insert warga
    for (const w of wargas) {
      await conn.query(
        `INSERT INTO warga
        (kk_id, nama, nik, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, pendidikan, jenis_pekerjaan, golongan_darah, status_perkawinan, tanggal_perkawinan, status_hubungan_dalam_keluarga, kewarganegaraan, no_paspor, no_kitap, nama_ayah, nama_ibu)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          kkId,
          w.nama,
          w.nik,
          w.jenis_kelamin,
          w.tempat_lahir,
          w.tanggal_lahir,
          w.agama,
          w.pendidikan,
          w.jenis_pekerjaan,
          w.golongan_darah,
          w.status_perkawinan,
          w.tanggal_perkawinan,
          w.status_hubungan_dalam_keluarga,
          w.kewarganegaraan,
          w.no_paspor,
          w.no_kitap,
          w.nama_ayah,
          w.nama_ibu
        ]
      )
    }

    await conn.commit()
    res.status(201).json({ message: 'Data berhasil disimpan' })
  } catch (err) {
    await conn.rollback()
    res.status(500).json({ error: err.message })
  } finally {
    conn.release()
  }
}

exports.getAllKK = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { rt, search, page = 1, limit = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let baseQuery = `FROM kartu_keluarga`;
    let whereClauses = [];
    let params = [];

    if (rt) {
      whereClauses.push(`rt = ?`);
      params.push(rt);
    }

    if (search) {
      whereClauses.push(`(no_kk LIKE ? OR nama_kepala_keluarga LIKE ?)`);
      const likeSearch = `%${search}%`;
      params.push(likeSearch, likeSearch);
    }

    if (whereClauses.length > 0) {
      baseQuery += ` WHERE ` + whereClauses.join(' AND ');
    }

    // Hitung total data
    const [countRows] = await conn.query(`SELECT COUNT(*) as total ${baseQuery}`, params);
    const total = countRows[0].total;

    // Ambil data KK
    const [kkRows] = await conn.query(
      `SELECT * ${baseQuery} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Ambil data warga untuk semua KK yang diambil
    const kkIds = kkRows.map((kk) => kk.id);
    let wargaMap = {};
    if (kkIds.length > 0) {
      const [wargaRows] = await conn.query(
        `SELECT * FROM warga WHERE kartu_keluarga_id IN (?)`,
        [kkIds]
      );

      // Kelompokkan warga berdasarkan KK
      wargaMap = wargaRows.reduce((acc, warga) => {
        if (!acc[warga.kartu_keluarga_id]) {
          acc[warga.kartu_keluarga_id] = [];
        }
        acc[warga.kartu_keluarga_id].push(warga);
        return acc;
      }, {});
    }

    // Gabungkan warga ke data KK
    const data = kkRows.map((kk) => ({
      ...kk,
      warga: wargaMap[kk.id] || [],
    }));

    res.status(200).json({
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};




