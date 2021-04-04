import express from "express";
import ProcessModule from "./modules/process.js";

const PORT = 1337;

const app = express();

const modules = [
    {
        name: "process",
        instance: new ProcessModule()
    }
];

for (const module of modules) {
    const router = express.Router();
    module.instance.manageRouter(router);
    app.use(`/${module.name}`, router);
}

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}.`);
});