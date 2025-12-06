const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;
  const db = await mongoose.connect(process.env.MONGO_URI);
  cachedDb = db;
  return db;
}

const bookingSchema = new mongoose.Schema({
  id: String,
  fullname: String,
  mobile: String,
  checkin: String,
  checkout: String,
  nights: Number,
  room: String,
  adults: Number,
  children: Number,
  occupancy: String,
  extraBed: Boolean,
  amount: Number,
  receipt: String,
  status: String,
  created_at: { type: Date, default: Date.now }
});

const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  created_at: { type: Date, default: Date.now }
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

app.get('/api/bookings', async (req, res) => {
  await connectDB();
  const bookings = await Booking.find().sort({ created_at: -1 });
  res.json(bookings);
});

app.post('/api/bookings', async (req, res) => {
  await connectDB();
  const booking = new Booking(req.body);
  await booking.save();
  res.json(booking);
});

app.put('/api/bookings/:id', async (req, res) => {
  await connectDB();
  const booking = await Booking.findOneAndUpdate(
    { id: req.params.id },
    req.body,
    { new: true }
  );
  res.json(booking);
});

app.delete('/api/bookings/:id', async (req, res) => {
  await connectDB();
  await Booking.findOneAndDelete({ id: req.params.id });
  res.json({ success: true });
});

app.post('/api/admin/register', async (req, res) => {
  await connectDB();
  const admin = new Admin(req.body);
  await admin.save();
  res.json({ success: true });
});

app.post('/api/admin/login', async (req, res) => {
  await connectDB();
  const admin = await Admin.findOne({ 
    username: req.body.username, 
    password: req.body.password 
  });
  if (admin) {
    res.json({ success: true, admin });
  } else {
    res.status(401).json({ success: false });
  }
});

module.exports = app;
