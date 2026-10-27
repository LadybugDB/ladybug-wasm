/**
 * @file database.js is the file for the Database class. Database class is the 
 * main class of Lbug. It manages all database components.
 */
"use strict";

const LbugWasm = require("./lbug.js");

class Database {
  /**
   * Initialize a new Database object.
   *
   * Any setting left as null/undefined is not forwarded, so the engine default
   * applies and engine-side default changes propagate automatically.
   *
   * @param {String} databasePath path to the database file. If the path is not
   * specified, or empty, or equal to`:memory:`, the database will be created in
   * memory.
   * @param {Number|null} bufferPoolSize size of the buffer manager in bytes. Null (default) uses the engine default.
   * @param {Number|null} maxNumThreads maximum number of threads available. Null (default) uses the engine default.
   * @param {Boolean|null} enableCompression whether to enable compression. Null (default) uses the engine default.
   * @param {Boolean|null} readOnly if true, database will be opened in read-only
   * mode. Null (default) uses the engine default.
   * @param {Boolean|null} autoCheckpoint if true, automatic checkpointing will be
   * enabled. Null (default) uses the engine default.
   * @param {Number|null} checkpointThreshold threshold for automatic checkpointing
   * in bytes. Null (default) uses the engine default.
   */
  constructor(
    databasePath,
    bufferPoolSize = null,
    maxNumThreads = null,
    enableCompression = null,
    readOnly = null,
    autoCheckpoint = null,
    checkpointThreshold = null
  ) {
    LbugWasm.checkInit();
    const lbug = LbugWasm._lbug;
    if (!databasePath) {
      databasePath = ":memory:";
    }
    else if (typeof databasePath !== "string") {
      throw new Error("Database path must be a string.");
    }
    if (bufferPoolSize != null && (typeof bufferPoolSize !== "number" || bufferPoolSize < 0)) {
      throw new Error("Buffer manager size must be a positive integer.");
    }
    if (maxNumThreads != null && (typeof maxNumThreads !== "number" || maxNumThreads < 0)) {
      throw new Error("Max number of threads must be a positive integer.");
    }
    // Note: negative explicit values are accepted here and ignored below,
    // which keeps the engine default for them.
    if (checkpointThreshold != null && typeof checkpointThreshold !== "number") {
      throw new Error("Checkpoint threshold must be a positive integer.");
    }
    // Start from the engine defaults; only apply explicitly set settings.
    const systemConfig = new lbug.SystemConfig();
    if (bufferPoolSize != null) {
      systemConfig.bufferPoolSize = Math.floor(bufferPoolSize);
    }
    if (maxNumThreads != null) {
      systemConfig.maxNumThreads = Math.floor(maxNumThreads);
    }
    if (enableCompression != null) {
      systemConfig.enableCompression = !!enableCompression;
    }
    if (readOnly != null) {
      systemConfig.readOnly = !!readOnly;
    }
    if (autoCheckpoint != null) {
      systemConfig.autoCheckpoint = !!autoCheckpoint;
    }
    if (checkpointThreshold != null) {
      systemConfig.checkpointThreshold = Math.floor(checkpointThreshold);
    }
    try {
      this._database = new lbug.Database(databasePath, systemConfig);
    } finally {
      systemConfig.delete();
    }
    this._isClosed = false;
  }

  /**
   * Close the database.
   */
  close() {
    if (!this._isClosed) {
      this._database.delete();
      this._isClosed = true;
    }
  }
}

module.exports = Database;
