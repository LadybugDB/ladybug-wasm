# Getting Started
## Installation
::: warning [Prerequisite](prerequisite)
Please make sure you have enable [Cross-Origin-Isolation](prerequisite) first.
:::

### CDN
```javascript
<script type="module">
import Ladybug_wasm from 'https://unpkg.com/@Ladybug/Ladybug-wasm@latest/dist/Ladybug-browser.js';
(async () => {
    const Ladybug = await Ladybug_wasm();
    window.Ladybug = Ladybug
    const db = await Ladybug.Database()
    const conn = await Ladybug.Connection(db)
    await conn.execute(`CREATE NODE TABLE User(name STRING, age INT64, PRIMARY KEY (name))`)
    await conn.execute(`CREATE (u:User {name: 'Alice', age: 35});`)
    const res = await conn.execute(`MATCH (a:User) RETURN a.*;`)
    const res_json = JSON.parse(res.table.toString());
})();
</script>
```


### Webpack/React/Vue
::: code-group

```sh [npm]
$ npm add @Ladybug/Ladybug-wasm
```

```sh [pnpm]
$ pnpm add @Ladybug/Ladybug-wasm
```

```sh [yarn]
$ yarn add @Ladybug/Ladybug-wasm
```

```sh [yarn (pnp)]
$ yarn add @Ladybug/Ladybug-wasm
```

```sh [bun]
$ bun add @Ladybug/Ladybug-wasm
```

:::

```javascript
import Ladybug_wasm from '@Ladybug/Ladybug-wasm';
(async () => {
    const Ladybug = await Ladybug_wasm();
    const db = await Ladybug.Database()
    const conn = await Ladybug.Connection(db)
    await conn.execute(`CREATE NODE TABLE User(name STRING, age INT64, PRIMARY KEY (name))`)
    await conn.execute(`CREATE (u:User {name: 'Alice', age: 35});`)
    const res = await conn.execute(`MATCH (a:User) RETURN a.*;`)
    const res_json = JSON.parse(res.table.toString());
})();
```

