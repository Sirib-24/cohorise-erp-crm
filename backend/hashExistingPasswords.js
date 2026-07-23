// hashExistingPasswords.js
// One-time script to convert plain-text passwords into secure bcrypt hashes

const bcrypt = require("bcrypt");
const db = require("./config/db");

const plainPassword = "123456"; // all 4 users currently share this password

bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
  if (err) {
    console.error("❌ Hashing failed:", err);
    return;
  }

  console.log("Generated hash:", hashedPassword);

  const sql = "UPDATE users SET password = ?";
  db.query(sql, [hashedPassword], (err, result) => {
    if (err) {
      console.error("❌ Update failed:", err);
      return;
    }
    console.log(`✅ Updated ${result.affectedRows} users with hashed password`);
    process.exit();
  });
});