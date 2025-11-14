
<div align="center">
  <img src="https://raw.githubusercontent.com/unswdb/Ladybug-wasm/main/misc/new_logo.png" height="100">
  <h1>Ladybug-Wasm</h1>
</div>

<div align="center">
  <a href="https://www.npmjs.com/package/@lbug/lbug-wasm/v/latest">
    <img src="https://img.shields.io/npm/v/@lbug/lbug-wasm?logo=npm" alt="Ladybug-wasm package on NPM">
  </a>
  <a href="https://github.com/LadybugDB/ladybug-wasm/actions">
    <img src="https://github.com/LadybugDB/ladybug-wasm/actions/workflows/shell.yml/badge.svg?branch=main" alt="Github Actions Badge">
  </a> 
    <a href="https://hub.docker.com/r/dylanshang/ladybug-wasm">
    <img src="https://img.shields.io/docker/image-size/dylanshang/Ladybug-wasm?logo=Docker" alt="Docker Badge">
  </a>

</div>
<h1></h1>

[Ladybug](https://github.com/LadybugDB/ladybug) is an embedded graph database built for query speed and scalability.

Ladybug-Wasm brings Ladybug to every browser thanks to WebAssembly.


Try it out at [Ladybug-shell.netlify.app](https://Ladybug-shell.netlify.app).


## Installation
Prerequisite: [Enable Cross-Origin-isolation](https://web.dev/articles/cross-origin-isolation-guide?hl=en#enable_cross-origin_isolation)
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
```bash
npm install @lbug/Ladybug-wasm
```
```javascript
import Ladybug_wasm from '@lbug/Ladybug-wasm';
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

## Build from source
```shell
git clone https://github.com/LadybugDB/Ladybug-wasm.git --recursive
make package
```

## Repository Structure

| Subproject                                               | Description    | Language   |
| -------------------------------------------------------- | :------------- | :--------- |
| [Ladybug_wasm](/lib)                                      | Wasm Library   | C++        |
| [@Ladybug/Ladybug-wasm](/packages/Ladybug-wasm)             | Javascript API | Javascript |
| [@Ladybug/Ladybug-shell](/packages/Ladybug-shell) | Cypher Shell      | React       |

## License
By contributing to Ladybug-wasm, you agree that your contributions will be licensed under the [MIT License](LICENSE.txt).
