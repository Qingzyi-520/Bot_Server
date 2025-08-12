// database/models.js - All database schemas
import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  totalMessages: { type: Number, default: 0 },
  voiceTime: { type: Number, default: 0 },
  lastDaily: { type: Number, default: 0 },
  joinedAt: { type: Number, default: Date.now }
});

// Admin Log Schema
const logSchema = new mongoose.Schema({
  action: String,
  adminId: String,
  targetId: String,
  details: String,
  timestamp: { type: Date, default: Date.now }
});

// Role Log Schema
const roleLogSchema = new mongoose.Schema({
  action: String,
  adminId: String,
  targetId: String,
  details: String,
  timestamp: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
export const AdminLog = mongoose.model('AdminLog', logSchema);
export const RoleLog = mongoose.model('RoleLog', roleLogSchema);