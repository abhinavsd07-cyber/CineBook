const nodemailer = require("nodemailer");
const fetch = require("node-fetch");

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

    let posterUrl = bookingDetails.poster;
    if (posterUrl && posterUrl.startsWith('/')) {
      posterUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}${posterUrl}`;
    }
    
    // Fetch Images for inline embedding to bypass Gmail Spam blocking
    let posterBuffer;
    try {
      const pRes = await fetch(posterUrl);
      posterBuffer = await pRes.buffer();
    } catch (e) {
      console.log("Failed to fetch poster for email embed", e);
    }
    
    let qrBuffer;
    try {
      const qRes = await fetch(`https://quickchart.io/qr?text=${bookingDetails.bookingId}&size=150&margin=1`);
      qrBuffer = await qRes.buffer();
    } catch (e) {
      console.log("Failed to fetch QR for email embed", e);
    }

    let ticketHtml = "";
    
    if (bookingDetails.isPremiere) {
      ticketHtml = `
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #111116; border-radius: 12px; margin-bottom: 24px; color: #ffffff;">
          <tr>
            <td width="40%" style="padding: 20px; vertical-align: top;">
              <img src="cid:posterImage" alt="Poster" style="width: 100%; border-radius: 8px; display: block;" />
            </td>
            <td width="60%" style="padding: 20px; vertical-align: top;">
              <h2 style="margin: 0 0 10px 0; font-size: 24px; color: #ffffff;">${bookingDetails.title}</h2>
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #aaaaaa;">Premiere Stream (Lifetime Access)</p>
              
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #888888; text-transform: uppercase;">Amount Paid</p>
              <p style="margin: 0 0 20px 0; font-size: 20px; color: #f84464; font-weight: bold;">₹${bookingDetails.totalAmount}</p>

              <div style="text-align: center; margin-top: 20px; background-color: #ffffff; padding: 10px; border-radius: 8px; display: inline-block;">
                <img src="cid:qrCodeImage" alt="QR Code" width="120" height="120" style="display: block;" />
              </div>
              <p style="margin: 8px 0 0 0; font-size: 10px; color: #555555; text-align: center;">${bookingDetails.bookingId}</p>
            </td>
          </tr>
        </table>
      `;
    } else {
      ticketHtml = `
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #111116; border-radius: 12px; margin-bottom: 24px; color: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif;">
          <tr>
            <td width="40%" style="padding: 20px; vertical-align: top; border-right: 1px dashed #333;">
              <img src="cid:posterImage" alt="Poster" style="width: 100%; border-radius: 8px; display: block;" />
              <div style="margin-top: 16px;">
                <h3 style="margin: 0 0 4px 0; font-size: 18px; color: #ffffff;">${bookingDetails.title}</h3>
                <p style="margin: 0; font-size: 12px; color: #aaaaaa; text-transform: uppercase;">Movie Ticket</p>
              </div>
            </td>
            <td width="60%" style="padding: 20px; vertical-align: top;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding-bottom: 16px;">
                    <p style="margin: 0 0 4px 0; font-size: 10px; color: #888888; text-transform: uppercase;">Theatre</p>
                    <p style="margin: 0; font-size: 14px; font-weight: bold;">${bookingDetails.theatre}</p>
                  </td>
                  <td width="50%" style="padding-bottom: 16px; text-align: right;">
                    <p style="margin: 0 0 4px 0; font-size: 10px; color: #888888; text-transform: uppercase;">Date & Time</p>
                    <p style="margin: 0; font-size: 14px; font-weight: bold;">${bookingDetails.date}<br/>${bookingDetails.time}</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-bottom: 16px; border-bottom: 1px solid #333;">
                    <p style="margin: 0 0 4px 0; font-size: 10px; color: #888888; text-transform: uppercase;">Seats</p>
                    <p style="margin: 0; font-size: 14px; font-weight: bold; color: #ffffff;">${bookingDetails.seats}</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 16px;">
                    <p style="margin: 0 0 4px 0; font-size: 10px; color: #888888; text-transform: uppercase;">Amount Paid</p>
                    <p style="margin: 0; font-size: 24px; color: #f84464; font-weight: bold;">₹${bookingDetails.totalAmount}</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 24px; text-align: center;">
                    <div style="background-color: #ffffff; padding: 10px; border-radius: 8px; display: inline-block;">
                      <img src="cid:qrCodeImage" alt="QR Code" width="120" height="120" style="display: block;" />
                    </div>
                    <p style="margin: 8px 0 0 0; font-size: 10px; color: #555555; letter-spacing: 1px;">${bookingDetails.bookingId}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
    }

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #f4f4f4; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <p style="display: inline-block; background-color: #ffeef0; color: #f84464; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; margin: 0;">
            Booking ID: ${bookingDetails.bookingId}
          </p>
        </div>
        
        ${ticketHtml}
        
        <p style="font-size: 14px; color: #666666; text-align: center; margin-bottom: 24px;">
          You can also download your PDF ticket with the scannable QR code directly from your account.
        </p>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/my-bookings" style="display: inline-block; background-color: #f84464; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(248, 68, 100, 0.3);">View My Bookings</a>
        </div>
        
        <div style="text-align: center; font-size: 12px; color: #999999;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Book My Show. All rights reserved.</p>
        </div>
      </div>
    `;

    const attachments = [];
    if (posterBuffer) {
      attachments.push({
        filename: "poster.jpg",
        content: posterBuffer,
        cid: "posterImage"
      });
    }
    if (qrBuffer) {
      attachments.push({
        filename: "qrcode.png",
        content: qrBuffer,
        cid: "qrCodeImage"
      });
    }

    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'Book My Show'}" <${process.env.FROM_EMAIL || 'no-reply@bookmyshow.com'}>`,
      to: userEmail,
      subject: "Your Movie Ticket is Confirmed! 🍿",
      html: htmlContent,
      attachments: attachments
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
