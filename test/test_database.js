const { assert } = require("chai");
const fs = require("fs/promises");
const path = require("path");

describe("Database constructor", function () {
  it("should create a database with a valid path and buffer size", async function () {
    const tmpDbPath = await createTempDir();
    try {
      const dbPath = path.join(tmpDbPath, "db.lbdb");
      const testDb = new lbug.Database(dbPath, 1 << 28 /* 256MB */);
      assert.exists(testDb);
      assert.equal(testDb.constructor.name, "Database");
      await testDb.init();
      assert.isTrue(testDb._isInitialized);
      assert.notExists(testDb._initPromise);
      await testDb.close();
    } finally {
      await fs.rm(tmpDbPath, { recursive: true, force: true });
    }
  });

  it("should create a database with a valid path and no buffer size", async function () {
    const tmpDbPath = await createTempDir();
    try {
      const dbPath = path.join(tmpDbPath, "db.lbdb");
      const testDb = new lbug.Database(dbPath);
      assert.exists(testDb);
      assert.equal(testDb.constructor.name, "Database");
      await testDb.init();
      assert.isTrue(testDb._isInitialized);
      assert.notExists(testDb._initPromise);
      await testDb.close();
    } finally {
      await fs.rm(tmpDbPath, { recursive: true, force: true });
    }
  });

  it("should run a query against an on-disk database with an absolute path", async function () {
    const tmpDbPath = await createTempDir();
    let conn = null;
    let testDb = null;
    try {
      const dbPath = path.resolve(tmpDbPath, "db.lbdb");
      testDb = new lbug.Database(dbPath);
      conn = new lbug.Connection(testDb);
      const result = await conn.query(
        "CREATE NODE TABLE T(id STRING PRIMARY KEY);"
      );
      await result.close();
    } finally {
      if (conn && conn._isInitialized) {
        await conn.close();
      }
      if (testDb && testDb._isInitialized) {
        await testDb.close();
      }
      await fs.rm(tmpDbPath, { recursive: true, force: true });
    }
  });

  it("should create an in-memory database when no path is provided", async function () {
    const testDb = new lbug.Database();
    const conn = new lbug.Connection(testDb);
    let res = await conn.query("CREATE NODE TABLE person(name STRING, age INT64, PRIMARY KEY(name));");
    res.close();
    res = await conn.query("CREATE (:person {name: 'Alice', age: 30});");
    res.close();
    res = await conn.query("CREATE (:person {name: 'Bob', age: 40});");
    res.close();
    res = await conn.query("MATCH (p:person) RETURN p.*;");
    const result = await res.getAllObjects();
    assert.equal(result.length, 2);
    assert.equal(result[0]["p.name"], "Alice");
    assert.equal(result[0]["p.age"], 30);
    assert.equal(result[1]["p.name"], "Bob");
    assert.equal(result[1]["p.age"], 40);
    await res.close();
    await conn.close();
    await testDb.close();
  });

  it("should create an in-memory database when empty path is provided", async function () {
    const testDb = new lbug.Database("");
    const conn = new lbug.Connection(testDb);
    let res = await conn.query("CREATE NODE TABLE person(name STRING, age INT64, PRIMARY KEY(name));");
    res.close();
    res = await conn.query("CREATE (:person {name: 'Alice', age: 30});");
    res.close();
    res = await conn.query("CREATE (:person {name: 'Bob', age: 40});");
    res.close();
    res = await conn.query("MATCH (p:person) RETURN p.*;");
    const result = await res.getAllObjects();
    assert.equal(result.length, 2);
    assert.equal(result[0]["p.name"], "Alice");
    assert.equal(result[0]["p.age"], 30);
    assert.equal(result[1]["p.name"], "Bob");
    assert.equal(result[1]["p.age"], 40);
    await res.close();
    await conn.close();
    await testDb.close();
  });
});
