import net from "net";
import promiseSocket from "promise-socket";

const CHUNK_SIZE = 512;

export default class TeamRedMinerModule {

    constructor(config) {
        this._connectData = {
            host: config.host,
            port: config.port
        };
    }

    manageRouter(router) {
        router.get("/", async (req, res) => {
            res.send(await this.getSummary());
        });

        router.get("/gpus/:gpuIndex", async (req, res) => {
            const gpuIndex = req.params.gpuIndex;
            res.send(await this.getGpuInfo(gpuIndex));
        });
    }

    async getSummary() {
        return await this.request("summary");
    }

    async getGpuInfo(gpuIndex) {
        const data = await this.request("gpu", gpuIndex);
        return data[`GPU=${gpuIndex}`];
    }

    async request(command, args) {
        const socket = new promiseSocket.PromiseSocket(new net.Socket());
        await socket.connect(this._connectData);
        
        // Send request/command        
        let requestData = command;
        if (args) {
            requestData += `|${args}`;
        }
        socket.writeAll(requestData, CHUNK_SIZE);

        // Get response
        const data = (await socket.readAll())
            .toString("utf8")
            .split("|")
            .filter((group) => group.length > 0)
            .map((group) => group.split(","))
            .map((group) => group.map((entry) => entry.split("=", 2)));            
        await socket.end();
        
        const parsedData = {};
        for (const section of data) {
            const sectionKey = section[0].join("=");
            const sectionData = {};

            for (const entry of section) {
                sectionData[entry[0]] = entry[1];
            }

            parsedData[sectionKey] = sectionData;
        }

        return parsedData;
    }

}