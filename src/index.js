import express from "express";

const PORT = 1337;

const app = express();

app.get("/", (req, res) => {
    res.send("Hello world.");
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}.`);
});