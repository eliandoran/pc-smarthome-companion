import psList from "ps-list";
import fkill from "fkill";
import { spawn } from "child_process";

async function getProcessIds(name) {
    return (await psList())
        .filter((processData) => processData.name === name)
        .map((processData) => processData.pid);
}

export default class ProcessModule {

    manageRouter(router) {
        router.get("/:name", async (req, res) => {
            const programName = req.params.name;
            const isRunning = await this.isRunning(programName);
            res.send({
                isRunning
            });
        });

        router.post("/:name", async (req, res) => {
            const body = req.body;
            const programName = req.params.name;
            const action = body?.action;

            switch (action) {
                case "kill":
                    this.kill(programName);
                    break;
                case "spawn":
                    this.spawn(programName);
                    break;
                case "respawn":
                    await this.kill(programName);
                    this.spawn(programName);
                    break;
            }

            res.status(204).send();
        });
    }

    async isRunning(programName) {
        const processIds = await getProcessIds(programName);
        return (processIds.length > 0);
    }

    async kill(programName) {
        const killPromises = (await getProcessIds(programName))
            .map((processId) => fkill(processId));
        return Promise.all(killPromises);
    }

    async spawn(programName) {
        const child = spawn(programName, [], {
            detached: true,
            stdio: [ "ignore", "ignore", "ignore" ]
        });

        child.unref();
    }

}