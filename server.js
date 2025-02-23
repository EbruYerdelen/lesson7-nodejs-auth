require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./database/db");
const AuthRoutes = require("./routes/auth-routes");
const HomeRoutes = require("./routes/home-routes");
const AdminRoutes = require("./routes/admin-routes");
const ImageRoutes = require("./routes/image-routes");



const port = process.env.PORT || 3000;
connectDB();



app.use(express.json());


app.use("/api/auth", AuthRoutes);
app.use("/api/home", HomeRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/image", ImageRoutes);


app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
})

//after connecting to database,we're gonna handle user,email,password and role and provide server to receive them.
//But while doing it,we need password hashing and salting to secure the password.To do this,we're gonna use bcryptjs library.