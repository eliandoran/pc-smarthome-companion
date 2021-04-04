import path from "path";
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
            const programName = req.params.name;
            let program = programName;
            const body = req.body;
            const action = body?.action;
            const spawnOptions = {};

            if (body.spawnPath) {
                program = path.join(body.spawnPath, programName);
            }

            if (body.shell) {
                spawnOptions.shell = true;
                spawnOptions.detached = true;
            }            

            switch (action) {
                case "kill":
                    await this.kill(programName);
                    break;
                case "spawn":
                    await this.spawn(program, spawnOptions);
                    break;
                case "respawn":
                    await this.kill(programName);
                    this.spawn(program, spawnOptions);
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

    async spawn(programName, spawnOptions) {
        console.log('Spawn:', programName, spawnOptions);
        const child = spawn(programName, [], {
            detached: true,
            shell: spawnOptions?.shell,
            stdio: [ "ignore", "ignore", "ignore" ]
        });

        child.unref();
    }

}