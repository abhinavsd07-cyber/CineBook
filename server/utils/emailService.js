const nodemailer = require("nodemailer");

const createTransporter = async () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

const sendBookingConfirmationEmail = async (userEmail, userName, bookingDetails) => {
  try {
    const transporter = await createTransporter();

    let movieDetailsHtml = "";
    if (bookingDetails.isPremiere) {
      movieDetailsHtml = `
        <p style="font-size: 16px; margin-bottom: 8px;"><strong>Premiere Stream:</strong> ${bookingDetails.title}</p>
        <p style="font-size: 14px; color: #aaaaaa;">Lifetime Access</p>
      `;
    } else {
      movieDetailsHtml = `
        <p style="font-size: 16px; margin-bottom: 8px;"><strong>Movie:</strong> ${bookingDetails.title}</p>
        <p style="font-size: 14px; margin-bottom: 8px;"><strong>Theatre:</strong> ${bookingDetails.theatre}</p>
        <p style="font-size: 14px; margin-bottom: 8px;"><strong>Date & Time:</strong> ${bookingDetails.date} at ${bookingDetails.time}</p>
        <p style="font-size: 14px; margin-bottom: 8px;"><strong>Seats:</strong> ${bookingDetails.seats}</p>
      `;
    }

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a2e; color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
        <div style="background-color: #e50914; padding: 24px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: 1px;">Ticket Confirmed!</h1>
        </div>
        <div style="padding: 32px 24px;">
          <p style="font-size: 18px; margin-bottom: 24px;">Hi ${userName},</p>
          <p style="font-size: 16px; color: #cccccc; margin-bottom: 24px;">Your booking has been successfully processed. Here are your ticket details:</p>
          
          <div style="background-color: #16213e; border: 1px solid #30475e; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            ${movieDetailsHtml}
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #30475e;">
              <p style="font-size: 18px; font-weight: bold; margin: 0; color: #e50914;">Total Paid: Rs. ${bookingDetails.totalAmount}</p>
            </div>
          </div>
          
          <p style="font-size: 14px; color: #aaaaaa; text-align: center; margin-bottom: 24px;">
            You can download your PDF ticket with the scannable QR code directly from your account.
          </p>
          
          <div style="text-align: center;">
            <a href="http://localhost:5173/my-bookings" style="display: inline-block; background-color: #e50914; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 16px;">View & Download Ticket</a>
          </div>
        </div>
        <div style="background-color: #0f3460; padding: 16px; text-align: center; font-size: 12px; color: #cccccc;">
          <p style="margin: 0;">&copy; 2026 Book My Show. All rights reserved.</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'Book My Show'}" <${process.env.FROM_EMAIL || 'no-reply@bookmyshow.com'}>`,
      to: userEmail,
      subject: "Your Movie Ticket is Confirmed! 🍿",
      html: htmlContent,
    });

    console.log("-----------------------------------------");
    console.log("📧 BOOKING EMAIL SENT SUCCESSFULLY!");
    console.log("Message sent: %s", info.messageId);
    console.log("-----------------------------------------");
    
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

const sendLoginSuccessEmail = async (userEmail, userName) => {
  try {
    const transporter = await createTransporter();
    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a2e; color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
        <div style="background-color: #F84464; padding: 24px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: 1px;">New Login Alert</h1>
        </div>
        <div style="padding: 32px 24px;">
          <p style="font-size: 18px; margin-bottom: 24px;">Hi ${userName},</p>
          <p style="font-size: 16px; color: #cccccc; margin-bottom: 24px;">We noticed a new login to your Book My Show account on <strong>${new Date().toLocaleString()}</strong>.</p>
          <p style="font-size: 14px; color: #aaaaaa; margin-bottom: 24px;">If this was you, there's nothing else you need to do. If you don't recognize this activity, please reset your password immediately to protect your account.</p>
        </div>
        <div style="background-color: #0f3460; padding: 16px; text-align: center; font-size: 12px; color: #cccccc;">
          <p style="margin: 0;">&copy; 2026 Book My Show. All rights reserved.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'Book My Show'}" <${process.env.FROM_EMAIL || 'no-reply@bookmyshow.com'}>`,
      to: userEmail,
      subject: "New Login to Your Account 🔒",
      html: htmlContent,
    });
    console.log("📧 LOGIN NOTIFICATION EMAIL SENT SUCCESSFULLY!");
    return true;
  } catch (error) {
    console.error("Error sending login email:", error);
    return false;
  }
};

const sendOtpEmail = async (userEmail, userName, otp) => {
  try {
    const transporter = await createTransporter();
    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a2e; color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
        <div style="background-color: #F84464; padding: 24px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: 1px;">Password Reset OTP</h1>
        </div>
        <div style="padding: 32px 24px;">
          <p style="font-size: 18px; margin-bottom: 24px;">Hi ${userName},</p>
          <p style="font-size: 16px; color: #cccccc; margin-bottom: 24px;">You requested a password reset for your Book My Show account. Use the following 6-digit OTP to complete the reset process:</p>
          <div style="text-align: center; margin: 32px 0;">
            <span style="display: inline-block; background-color: #16213e; border: 2px dashed #F84464; padding: 16px 32px; font-size: 32px; font-weight: bold; letter-spacing: 4px; border-radius: 8px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #aaaaaa; margin-bottom: 24px; text-align: center;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
          <p style="font-size: 14px; color: #aaaaaa; margin-bottom: 24px;">If you did not request a password reset, please ignore this email or secure your account.</p>
        </div>
        <div style="background-color: #0f3460; padding: 16px; text-align: center; font-size: 12px; color: #cccccc;">
          <p style="margin: 0;">&copy; 2026 Book My Show. All rights reserved.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'Book My Show'}" <${process.env.FROM_EMAIL || 'no-reply@bookmyshow.com'}>`,
      to: userEmail,
      subject: "Your Password Reset OTP 🔐",
      html: htmlContent,
    });
    console.log("📧 OTP EMAIL SENT SUCCESSFULLY!");
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};

module.exports = { sendBookingConfirmationEmail, sendLoginSuccessEmail, sendOtpEmail };
