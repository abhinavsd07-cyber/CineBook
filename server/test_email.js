const nodemailer = require("nodemailer");

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, 
      auth: {
        user: "abhinavsd07@gmail.com",
        pass: "osojfrlzmfszxtxh", // App password from env
      },
    });
    
    await transporter.sendMail({
      from: '"Test" <abhinavsd07@gmail.com>',
      to: "abhinavsd07@gmail.com",
      subject: "Test Email",
      text: "Test"
    });
    console.log("Success");
  } catch (err) {
    console.error("Error", err);
  }
}
testEmail();
