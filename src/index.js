import express from "express";
import bodyParser from "body-parser";

import ProcessModule from "./modules/process.js";
import TeamRedMinerModule from "./modules/teamredminer.js";

const PORT = 1337;

const app = express();
app.use(bodyParser.json());

const modules = [
    {
        name: "process",
        instance: new ProcessModule()
    },
    {
        name: "teamredminer",
        instance: new TeamRedMinerModule({
            host: "127.0.0.1",
            port: 4028
        })
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