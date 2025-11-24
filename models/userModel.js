const db = require('../config/database');

const createUser = async ({ username, email, password, role_id }) => {
  const sql = 'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)';
  const [result] = await db.query(sql, [username, email, password, role_id]);
  return result;
};

const findUserByEmail = async (email) => {
  const sql = 'SELECT * FROM users WHERE email = ?';
  const [rows] = await db.query(sql, [email]);
  return rows[0];
};

module.exports = { createUser, findUserByEmail };
