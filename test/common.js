global.chai = require("chai");
global.assert = chai.assert;
global.expect = chai.expect;
chai.should();
chai.config.includeStack = true;


global.lbug = require("../package/nodejs");

const fs = require("fs/promises");
const path = require("path");

const createTempDir = async () => {
  const tempRoot = path.join(process.cwd(), ".tmp-lbug-wasm-");
  return fs.mkdtemp(tempRoot);
};

const initTests = async () => {
  const tmpPath = await createTempDir();
  const dbPath = path.join(tmpPath, "db.lbdb");
  await lbug.init();
  const db = new lbug.Database(dbPath, 1 << 30 /* 1GB */);
  const conn = new lbug.Connection(db, 4);
  global.dbPath = dbPath;
  global.tmpPath = tmpPath;
  global.db = db;
  global.conn = conn;
  const tinysnbDir = "../../dataset/tinysnb/";

  const schema = (await fs.readFile(tinysnbDir + "schema.cypher"))
    .toString()
    .split("\n");
  for (const line of schema) {
    if (line.trim().length === 0) {
      continue;
    }
    await conn.query(line);
  }

  const copy = (await fs.readFile(tinysnbDir + "copy.cypher"))
    .toString()
    .split("\n");

  const dataFileExtension = ["csv", "parquet", "npy", "ttl", "nq", "json", "lbug_extension"];
  const dataFileRegex = new RegExp(`"([^"]+\\.(${dataFileExtension.join('|')}))"`, "gi");

  for (const line of copy) {
    if (!line || line.trim().length === 0) {
        continue;
    }

    // handle multiple data files in one line
    const statement = line.replace(dataFileRegex, `"${tinysnbDir}$1"`);
    await conn.query(statement);
  }

  await conn.query(
    "create node table moviesSerial (ID SERIAL, name STRING, length INT32, note STRING, PRIMARY KEY (ID))"
  );
  await conn.query(
    'copy moviesSerial from "../../dataset/tinysnb-serial/vMovies.csv"'
  );
};

const cleanup = async () => {
  try {
    if (global.conn) {
      await global.conn.close();
    }
    if (global.db) {
      await global.db.close();
    }
  } finally {
    global.conn = null;
    global.db = null;
    global.dbPath = null;
    if (global.tmpPath) {
      await fs.rm(global.tmpPath, { recursive: true, force: true });
      global.tmpPath = null;
    }
    await lbug.close();
  }
};

global.createTempDir = createTempDir;
global.initTests = initTests;
global.cleanup = cleanup;
