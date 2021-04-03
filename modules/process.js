import psList from "ps-list";
import fkill from "fkill";
import { spawn } from "child_process";

async function getProcessIds(name) {
    return (await psList())
        .filter((processData) => processData.name === name)
        .map((processData) => processData.pid);
}

export default class ProcessModule {

    async isRunning(programName) {
        const processIds = await getProcessIds(programName);
        return (processIds.length > 0);
    }

    async kill(programName) {
        const processIds = await getProcessIds(programName);
        for (const processId of processIds) {
            fkill(processId);
        }
    }

    async spawn(programName) {
        const child = spawn(programName, [], {
            detached: true,
            stdio: [ "ignore", "ignore", "ignore" ]
        });

        child.unref();
    }

}