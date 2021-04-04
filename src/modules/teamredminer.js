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
    }

    async getSummary() {
        const data = await this.request("summary");
        return data.SUMMARY;
    }

    async request(command) {
        const socket = new promiseSocket.PromiseSocket(new net.Socket());
        await socket.connect(this._connectData);
        socket.writeAll(command, CHUNK_SIZE);
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