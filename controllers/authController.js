const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const register = async (req, res) => {
  try {
    const { username, email, password, role_id } = req.body;
    
    // Cek user sudah ada
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) return res.status(400).json({ message: 'Email sudah terdaftar' });
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Simpan user baru
    await userModel.createUser({ username, email, password: hashedPassword, role_id });
    
    res.status(201).json({ message: 'Registrasi berhasil' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await userModel.findUserByEmail(email);
    if (!user) return res.status(400).json({ message: 'Email atau password salah' });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Email atau password salah' });
    
    // Buat token JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role_id: user.role_id,   // sertakan role_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )    
    
    res.json({ message: 'Login berhasil', token, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login };
