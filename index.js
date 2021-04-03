import ProcessModule from "./modules/process.js";

async function main() {
    const processModule = new ProcessModule();
    const name = "notepad.exe";
    const isRunning = await processModule.isRunning(name);

    console.log(`Process: ${name}`);
    console.log(`\t Is running: ${isRunning}`);
}

main();