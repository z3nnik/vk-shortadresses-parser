Install dependencies
```shell
npm i typescript -g
npm i
```
___
Go to `src/index.ts` file

```typescript
import Iterator from "./utils/Iterator";

new Iterator({
    accessToken: "***", symbols: "abcdefg", addressLength: 2, apiVerson: '5.134'
}).process().then(console.log);
```

Where:
* `accessToken` - vk group (more RPS) access_token
* `symbols` - characters to be parsed (optiona, default `'abcdefghijklmnopqrstuvwxyz'`
* `addressLength` - `2` or `3` (optional, default `2`)
* `apiVerson` - vk api version (optional, default `'5.134'`)
____
Start
```shell
npm run build
npm run start
```