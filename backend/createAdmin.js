const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/Admin"); 

mongoose.connect("mongodb+srv://wafa_db_user:ckwafa@cluster0.2vkkwhv.mongodb.net/?appName=Cluster0")
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

(async () => {
  const hash = await bcrypt.hash("admin123", 10);

  await Admin.create({
    name: "Admin",
    email: "admin@gmail.com",
    password: hash
  });

  console.log("✅ Admin created successfully");
  process.exit();
})();
