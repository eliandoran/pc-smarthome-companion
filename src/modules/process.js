import path from "path";
import psList from "ps-list";
import fkill from "fkill";
import stringArgv from "string-argv";
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
            console.log("Is running: ", programName, isRunning);
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
            const killOptions = {};

            if (body.spawnPath) {
                program = path.join(body.spawnPath, programName);
            }

            if (body.shell) {
                spawnOptions.shell = true;
                spawnOptions.detached = true;
            }            

            if (body.forceKill) {
                killOptions.force = true;
            }

            switch (action) {
                case "kill":
                    await this.kill(programName, killOptions);
                    console.log("Kill finished @", Date.now());
                    break;
                case "spawn":
                    await this.spawn(program, body.arguments, spawnOptions);
                    break;
                case "respawn":
                    await this.kill(programName, killOptions);
                    await this.spawn(program, body.arguments, spawnOptions);
                    break;
            }

            res.status(204).send();
        });
    }

    async isRunning(programName) {
        const processIds = await getProcessIds(programName);
        return (processIds.length > 0);
    }

    async kill(programName, killOptions) {
        console.log("Kill:", programName, killOptions);
        const killPromises = (await getProcessIds(programName))
            .map((processId) => fkill(processId, killOptions));
        return Promise.all(killPromises);
    }

    async spawn(programName, args, spawnOptions) {;
        console.log('Spawn:', programName, args, spawnOptions);
        args = stringArgv.parseArgsStringToArgv(args || []);
        const child = spawn(programName, args, {
            detached: true,
            shell: spawnOptions?.shell,
            stdio: [ "ignore", "ignore", "ignore" ]
        });

        child.unref();
    }

}