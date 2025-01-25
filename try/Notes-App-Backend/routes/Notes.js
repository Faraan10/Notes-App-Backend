import express from "express";
import jwt from "jsonwebtoken";
import Notes from "../models/NotesModel.js";

const router = express.Router();

// get notes based on user
router.get("/", async (req, res) => {
	const token = req.headers.token;
	if (!token) {
		res.status(401).json({ message: "No token" });
		return;
	}

	// decoding user
	const authtoken = jwt.decode(token, process.env.SECRET_KEY);
	const email = authtoken.email;

	try {
		const notes = await Notes.find({
			email,
		});
		if (!notes) {
			res.status(401).json({ message: "Trouble finding notes" });
			return;
		}
		res.status(200).json(notes);
	} catch (err) {
		res.status(500).json({ message: "Internal server error" });
		return;
	}
});

// get ascending notes

router.get("/sortAsc", async (req, res) => {
	const data = await Notes.find().sort("date");

	res.status(200).json(data);
});

router.get("/sortDes", async (req, res) => {
	const data = await Notes.find().sort("-date");

	res.status(200).json(data);
});

// get single notes

router.get("/:id", async (req, res) => {
	const id = req.params.id;
	const token = req.headers.token;

	if (!id) {
		res.status(401).json({ message: "No Id" });
		return;
	}

	if (!token) {
		res.status(401).json({ message: "No token" });
		return;
	}

	// decoding user
	const authtoken = jwt.decode(token, process.env.SECRET_KEY);
	const email = authtoken.email;

	try {
		const notes = await Notes.findById(id);
		if (!notes) {
			res.status(401).json({ message: "Trouble finding notes" });
			return;
		}

		if (notes.email !== email) {
			res.status(401).json({ message: "You are not Authorized" });
			return;
		}
		res.status(200).json(notes);
	} catch (err) {
		res.status(500).json({ message: "Internal server error" });
		return;
	}
});

//create notes

router.post("/create", async (req, res) => {
	const token = req.headers.token;
	if (!token) {
		res.status(401).json({ message: "No Token" });
		return;
	}

	const authtoken = jwt.decode(token, process.env.SECRET_KEY);
	const email = authtoken.email;

	const { title, description, imageUrl, date } = req.body;

	if (!title || !description || !imageUrl) {
		res.status(401).json({ message: "You have to fill the required fields" });
		return;
	}

	const findTitle = await Notes.findOne({
		title,
	});

	if (findTitle) {
		res.status(400).json({ message: "A Note with this title already exists" });
		return;
	}

	try {
		const createNotes = await Notes.create({
			email,
			title,
			description,
			imageUrl,
			date,
		});
		if (!createNotes) {
			res.status(401).json({ message: "Trouble Creating Notes" });
			return;
		}
		res.status(201).json({ createNotes, message: "Notes created" });
	} catch (err) {
		res.status(200).json({ message: "Internal server error" });
		return;
	}
});

// updating notes
router.put("/update/:id", async (req, res) => {
	const id = req.params.id;
	const token = req.headers.token;

	if (!id) {
		res.status(401).json({ message: "No id" });
		return;
	}

	if (id.length < 24) {
		res.status(401).json({ message: "Enter a valid id" });
		return;
	}

	if (!token) {
		res.status(401).json({ message: "No token" });
		return;
	}

	const authtoken = jwt.decode(token, process.env.SECRET_KEY);

	const findNotes = await Notes.findById(id);

	if (!findNotes) {
		res.status(401).json({ message: "Notes does not exist" });
		return;
	}

	if (authtoken.email !== findNotes.email) {
		res.status(401).json({ message: "You are not authorized" });
		return;
	}

	const { title, description, imageUrl, date } = req.body;

	try {
		const updateNotes = await Notes.findByIdAndUpdate(
			id,
			{
				title,
				description,
				imageUrl,
				date,
			},
			{ new: true }
		);
		if (!updateNotes) {
			res.status(401).json({ message: "Trouble Updating Notes" });
			return;
		}
		res.status(200).json({ updateNotes, message: "Notes updated" });
	} catch (err) {
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
});

// deleting notes
router.delete("/delete/:id", async (req, res) => {
	const id = req.params.id;
	const token = req.headers.token;

	if (!token) {
		res.status(401).json({ message: "No token" });
		return;
	}

	const authtoken = jwt.decode(token, process.env.SECRET_KEY);

	if (!id) {
		res.status(401).json({ message: "No id" });
		return;
	}

	if (id.length < 24) {
		res.status(401).json({ message: "Enter valid id" });
		return;
	}

	const findNotes = await Notes.findById(id);

	if (!findNotes) {
		res.status(401).json({ message: "Notes does not exist" });
		return;
	}

	if (authtoken.email !== findNotes.email) {
		res.status(401).json({ message: "You are not authorized" });
		return;
	}

	try {
		const deleteNotes = await Notes.findByIdAndDelete(id);
		if (!deleteNotes) {
			res.status(401).json({ message: "Trouble deleting notes" });
			return;
		}
		res.status(200).json({ deleteNotes, message: "Notes deleted" });
	} catch (err) {
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
});

export default router;
