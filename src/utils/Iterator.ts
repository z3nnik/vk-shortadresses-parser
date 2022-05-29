import axios from "axios";
import { stringify } from "querystring";
import util from "util";
import fs from "fs";
import { IteratorOptions } from "../types/IteratorOptions";
import ExecuteCode from "./ExecuteCode";
import { ExecuteResponse, ExecuteSuccessfulResponse } from "../types/ExecuteResponse";

class Iterator {
    private params: IteratorOptions;
    private readonly accessToken: string;
    private readonly apiVersion: string;
    private readonly symbols: string;
    private readonly addressLength: number;

    constructor(params: IteratorOptions) {
        this.params = params;
        this.accessToken = this.params.accessToken;
        this.apiVersion = this.params.apiVersion ?? "5.134";
        this.addressLength = this.params.addressLength ?? 2;
        this.symbols = this.params.symbols ?? "abcdefghijklmnopqrstuvwxyz";
    }

    api = async <T>(method: string, parameters: object = {}): Promise<T> => {
        try {
            const { data } = await axios.post(`https://api.vk.com/method/${ method }`, stringify({
                access_token: this.accessToken,
                v: this.apiVersion,
                ...parameters,
            }));
            return data;
        } catch (err) {
            throw err;
        }
    };

    sleep = (milliseconds: number = 0): Promise<unknown> => {
        return util.promisify(setTimeout)(milliseconds);
    };

    Error = (message: any = "Unknown error"): void => {
        throw new Error(util.inspect(message));
    };

    chunk = (array: any[], size: number): any[] => {
        let chunks = [];
        for (let i = 0; i < array.length; i += size)
            chunks.push(array.slice(i, i + size));
        return chunks;
    };

    getScreenNames = (): string[] => {
        const symbols: string[] = Array.from(this.symbols);

        let screenNames: string[] = [];

        switch (this.addressLength) {
            case 2:
                for (const sym1 of symbols) {
                    for (const sym2 of symbols) {
                        screenNames = [ ...screenNames, sym1 + sym2 ];
                    }
                }
                break;
            case 3:
                for (const sym1 of symbols) {
                    for (const sym2 of symbols) {
                        for (const sym3 of symbols) {
                            screenNames = [ ...screenNames, sym1 + sym2 + sym3 ];
                        }
                    }
                }
                break;
            default:
                this.Error("Incorrect short address length for validation. So far only 2 and 3");
                break;
        }
        screenNames = [ ...new Set(screenNames) ].sort(function (a: string, b: string) {
            return a.length - b.length || a.localeCompare(b);
        });

        return screenNames;
    };

    getInfoForScreenNames = async (screenNames: string[]): Promise<ExecuteSuccessfulResponse[]> => {
        let i = 1;
        let results: ExecuteSuccessfulResponse[] = [];
        for (const chunk of this.chunk(screenNames, 25)) {
            const executeResponse = <ExecuteResponse> await this.api("execute", {
                code: ExecuteCode,
                sn: String(chunk)
            });

            const { response, error } = executeResponse;

            if (error) this.Error(error);
            if (response) results = [ ...results, ...response ];

            console.log(`Chunk [${ i++ }/${ this.chunk(this.getScreenNames(), 25).length }]`);
            await this.sleep(50);
        }

        return results;
    };

    process = async () => {
        const startTime = Math.floor(Date.now());
        let free: string[] = [],
            busy: string[] = [];

        const results = await this.getInfoForScreenNames(this.getScreenNames());

        for (const element of results) {
            const { object_id, type, screen_name, is_free } = element;

            if (is_free) {
                free = [ ...free, screen_name ];
            }

            if (object_id && type) {
                busy = [ ...busy, `https://vk.com/${ screen_name } (${ type } ${ object_id })` ];
            }
        }

        if (!fs.existsSync("./free")) fs.mkdirSync("./free");
        if (!fs.existsSync("./busy")) fs.mkdirSync("./busy");

        fs.writeFileSync(`./free/addresses.txt`, free.join("\n"));
        fs.writeFileSync(`./busy/addresses.txt`, busy.join("\n"));

        const endTime = Math.floor(Date.now());

        return `\nAll addresses (${ results.length }) successfully parsed in ${ (endTime - startTime) / 1000 } seconds\n` +
            `Free: ${ free.length }\nBusy: ${ busy.length }\n` +
            `Created txt files in /free and /busy folders`;
    };
}

export default Iterator;