import mongoose from "mongoose";

const connection = async () => {
	try {
		mongoose.connect(process.env.CONNECTION_STRING);
		console.log("MongoDB Connected");
	} catch (err) {
		console.log(err);
	}
};

export default connection;
