import express from "express";
import dotenv from "dotenv";
import connection from "./dbConnection.js";
import cors from "cors";
const app = express();
const e = dotenv.config();

app.use(express.json());

app.use(cors());

connection();

// routes
import Authentication from "./routes/Authentication.js";

app.use("/auth", Authentication);

app.listen(process.env.PORT, () => {
	console.log("Listening on port", process.env.PORT);
});
