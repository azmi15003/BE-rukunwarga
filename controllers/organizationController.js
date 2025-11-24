const db = require('../config/database');

exports.createOrganization = async (req, res) => {
  try {
    const { type, name } = req.body;
    if (!type || !name) {
      return res.status(400).json({ message: 'Type and name are required' });
    }
    const [result] = await db.execute(
      'INSERT INTO organizations (type, name) VALUES (?, ?)',
      [type, name]
    );
    res.status(201).json({ id: result.insertId, type, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create organization' });
  }
};

exports.getOrganizations = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM organizations ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get organizations' });
  }
};

exports.getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM organizations WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Organization not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get organization' });
  }
};
