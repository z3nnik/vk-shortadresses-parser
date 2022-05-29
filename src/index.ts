import Iterator from "./utils/Iterator";

new Iterator({
    accessToken: "***", symbols: "abcdefg", addressLength: 2, apiVersion: '5.134'
}).process().then(console.log);