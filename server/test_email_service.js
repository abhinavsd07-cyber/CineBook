require("dotenv").config();
const { sendBookingConfirmationEmail } = require("./utils/emailService");

async function test() {
  const result = await sendBookingConfirmationEmail(
    "abhinavsd07@gmail.com",
    "Abhinav Test",
    {
      isPremiere: false,
      bookingId: "BK12345678",
      poster: "https://via.placeholder.com/150",
      title: "Test Movie",
      theatre: "Test Theatre",
      date: "2024-12-01",
      time: "10:00 PM",
      seats: "A1, A2",
      totalAmount: 500
    }
  );
  console.log("Email Result:", result);
}
test();
