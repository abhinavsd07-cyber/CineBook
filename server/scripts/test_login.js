const fetch = require("node-fetch") || require("http");

async function testLogin() {
  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "admin123" })
  });
  const data = await res.json();
  console.log(data);
}
testLogin();
