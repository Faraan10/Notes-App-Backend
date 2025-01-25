import mongoose, { Schema, model } from "mongoose";

const notesModel = Schema({
	email: { type: String, required: true },
	title: { type: String, required: true, unique: true },
	description: { type: String, required: true },
	imageUrl: { type: String, required: true },
	date: { type: Date, default: Date.now },
});

export default model("note", notesModel);
