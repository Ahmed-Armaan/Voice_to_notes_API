const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const API_KEY = process.env.DEEPGRAM_API_KEY;
const BASE_URL = "https://api.deepgram.com/v1";

app.get("/", (req, res) => {
	res.send("OK");
});

app.get("/balance", async (req, res) => {
	try {
		// Step 1: get projects
		const projRes = await fetch(`${BASE_URL}/projects`, {
			headers: {
				Authorization: `Token ${API_KEY}`,
			},
		});

		if (!projRes.ok) {
			return res.status(500).json({ error: "Failed to fetch projects" });
		}

		const projData = await projRes.json();
		const projectId = projData?.projects?.[0]?.project_id;

		if (!projectId) {
			return res.json({ amount: null });
		}

		// Step 2: get balance
		const balRes = await fetch(`${BASE_URL}/projects/${projectId}/balances`, {
			headers: {
				Authorization: `Token ${API_KEY}`,
			},
		});

		const balData = await balRes.json();
		const amount = balData?.balances?.[0]?.amount ?? null;

		res.json({ amount });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.listen(8080, () => {
	console.log("Server running on http://localhost:8080");
});
