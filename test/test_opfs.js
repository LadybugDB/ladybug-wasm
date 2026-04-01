/**
 * @file test_opfs.js — unit tests for OPFS (Origin Private File System)
 * persistent storage via the WasmFS OPFS backend.
 *
 * OPFS requires:
 *   • A multi-threaded browser build (-sWASMFS -lopfs.js -pthread).
 *   • SharedArrayBuffer availability (cross-origin isolation headers).
 *
 * The test suite detects OPFS availability at runtime. Every individual test
 * calls `this.skip()` when OPFS is not available, so the suite passes cleanly
 * in:
 *   • Single-threaded builds (no pthreads → Atomics.wait not allowed).
 *   • The Node.js package (built with -sNODERAWFS, no WasmFS).
 *   • Any environment that lacks cross-origin isolation.
 */
"use strict";

const { assert } = require("chai");

describe("OPFS persistent storage", function () {
  // OPFS operations involve real filesystem I/O through a proxy thread;
  // allow generous time for slow environments.
  this.timeout(30000);

  const OPFS_ROOT = "/opfs-test-" + Date.now();
  let opfsAvailable = false;

  // ── helpers ────────────────────────────────────────────────────────────────

  /**
   * Try to mount OPFS at OPFS_ROOT once. Sets opfsAvailable accordingly.
   * Any error that does NOT look like a missing-feature error is re-thrown so
   * that genuine bugs are not silently swallowed.
   */
  before(async function () {
    try {
      await lbug.FS.mountOpfs(OPFS_ROOT);
      opfsAvailable = true;
    } catch (e) {
      // Expected in Node.js / single-threaded / non-COOP builds:
      //   "OPFS is not available. Ensure the build was compiled with …"
      //   "wasmfs_create_directory(…) failed with errno …"
      // Anything else is a real bug — rethrow.
      if (
        e.message.includes("OPFS is not available") ||
        e.message.includes("wasmfs_create_directory") ||
        e.message.includes("not available")
      ) {
        opfsAvailable = false;
      } else {
        throw e;
      }
    }
  });

  after(async function () {
    if (!opfsAvailable) return;
    try {
      await lbug.FS.unmount(OPFS_ROOT);
    } catch (_) {
      // Best-effort cleanup; WasmFS may not support unmount of a backend root.
    }
  });

  // ── tests ──────────────────────────────────────────────────────────────────

  it("mountOpfs succeeds in multi-threaded mode", function () {
    if (!opfsAvailable) {
      this.skip();
    }
    assert.isTrue(opfsAvailable);
  });

  it("can create a database at an OPFS path", async function () {
    if (!opfsAvailable) {
      this.skip();
    }

    const dbPath = OPFS_ROOT + "/basic.lbdb";
    const testDb = new lbug.Database(dbPath, 1 << 28 /* 256 MB */);
    await testDb.init();
    assert.isTrue(testDb._isInitialized);
    await testDb.close();
  });

  it("persists data written to an OPFS-backed database within a session",
    async function () {
      if (!opfsAvailable) {
        this.skip();
      }

      const dbPath = OPFS_ROOT + "/persist.lbdb";

      // ── write phase ──────────────────────────────────────────────────────
      const writeDb = new lbug.Database(dbPath, 1 << 28);
      const writeConn = new lbug.Connection(writeDb);

      let res = await writeConn.query(
        "CREATE NODE TABLE person(name STRING, age INT64, PRIMARY KEY(name));"
      );
      res.close();
      res = await writeConn.query(
        "CREATE (:person {name: 'Alice', age: 30});"
      );
      res.close();
      res = await writeConn.query(
        "CREATE (:person {name: 'Bob', age: 25});"
      );
      res.close();

      await writeConn.close();
      await writeDb.close();

      // ── read phase (same OPFS mount, same session) ────────────────────────
      const readDb = new lbug.Database(dbPath, 1 << 28);
      const readConn = new lbug.Connection(readDb);

      res = await readConn.query(
        "MATCH (p:person) RETURN p.name, p.age ORDER BY p.name;"
      );
      const rows = await res.getAllObjects();
      await res.close();
      await readConn.close();
      await readDb.close();

      assert.equal(rows.length, 2);
      assert.equal(rows[0]["p.name"], "Alice");
      assert.equal(rows[0]["p.age"], 30);
      assert.equal(rows[1]["p.name"], "Bob");
      assert.equal(rows[1]["p.age"], 25);
    }
  );
});
