import psList from "ps-list";

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

}