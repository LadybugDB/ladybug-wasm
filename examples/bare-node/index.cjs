const lbug_wasm = require('@lbug/lbug-wasm');
const path = require('path');
const DUCKDB_DIST = path.dirname(require.resolve('@lbug/lbug-wasm'));

(async () => {
    const lbug = await lbug_wasm();
    const db = new lbug.WebDatabase("memDB", 0, 0, false, false, 4194304 * 16 * 8);
    const conn = new lbug.WebConnection(db, 0);
    await conn.query(`CREATE NODE TABLE User(name STRING, age INT64, PRIMARY KEY (name))`)
    await conn.query(`CREATE (u:User {name: 'Alice', age: 35});`)
    const res = await conn.query(`MATCH (a:User) RETURN a.*;`)
    console.log(res.toString())
})();