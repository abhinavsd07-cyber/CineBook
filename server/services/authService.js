const User = require('../models/User');
const crypto = require('crypto');
const { sendLoginSuccessEmail, sendOtpEmail } = require('../utils/emailService');
const { OAuth2Client } = require('google-auth-library');
const AppError = require('../utils/AppError');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
  async registerUser({ name, email, password, phone }) {
    if (!name || !email || !password) {
      throw new AppError('All fields required', 400);
    }

    const exists = await User.findOne({ email });
    if (exists) {
      throw new AppError('Email already registered', 400);
    }

    const user = await User.create({ name, email, password, phone });
    await sendLoginSuccessEmail(user.email, user.name).catch((err) => console.error('Email error:', err));
    return user;
  }

  async loginUser({ email, password }) {
    if (!email || !password) {
      throw new AppError('Email and password required', 400);
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid credentials', 401);
    }

    await sendLoginSuccessEmail(user.email, user.name).catch((err) => console.error('Email error:', err));
    return user;
  }

  async googleLoginUser({ token }) {
    if (!token) {
      throw new AppError('No token provided', 400);
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture } = ticket.getPayload();
    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = await User.create({
        name,
        email,
        password: randomPassword,
        avatar: picture,
      });
    } else if (!user.avatar && picture) {
      user.avatar = picture;
      await user.save();
    }
    return user;
  }

  async getProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async updateProfile(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (updateData.name) user.name = updateData.name;
    if (updateData.phone !== undefined) user.phone = updateData.phone;
    if (updateData.avatar) user.avatar = updateData.avatar;
    if (updateData.password) user.password = updateData.password;
    
    return await user.save();
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) throw new AppError('User not found', 404);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    try {
      await sendOtpEmail(user.email, user.name, otp);
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      throw new AppError('Email could not be sent', 500);
    }
  }

  async resetPassword(token, newPassword) {
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) throw new AppError('Invalid or expired token', 400);

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    return await user.save();
  }

  async verifyOtp(token) {
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) throw new AppError('Invalid or expired OTP', 400);

    user.resetPasswordExpire = Date.now() + 5 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    return true;
  }
}

module.exports = new AuthService();
