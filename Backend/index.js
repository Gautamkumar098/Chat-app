import dotenv from "dotenv";
import express from "express";
import { connectDb } from "./config/db.js";
import userRoute from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import messageRoute from "./routes/message.routes.js"
import cors from "cors";
import {app, server} from "./socket/socket.js";

dotenv.config({});

const PORT = process.env.PORT || 8080;



app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use(cookieParser());


const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);


app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);





connectDb();


app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ChatApp backend is running",
  });
});



//routes
app.use("/api/user" ,userRoute );
app.use("/api/message" ,messageRoute );


server.listen(PORT, "0.0.0.0", () => {
  console.log(`server listen at port ${PORT}`);
});
