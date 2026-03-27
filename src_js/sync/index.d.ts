/**
 * @file sync/index.d.ts — TypeScript declarations for the synchronous
 * lbug-wasm API (default sync and nodejs/sync variants).
 *
 * All operations execute on the calling thread and return values directly
 * (no Promises). Suitable for CLI scripts and build tools; not recommended
 * in GUI applications or web servers because it blocks the main thread.
 *
 * Variant entry points that share this interface:
 *   import lbug from "@ladybugdb/wasm-core/sync";               // browser, single-threaded
 *   import lbug from "@ladybugdb/wasm-core/multithreaded/sync";  // browser, multi-threaded
 *   const lbug = require("@ladybugdb/wasm-core/nodejs/sync");    // Node.js
 */

/** Compilation + execution timing returned by QueryResult.getQuerySummary(). */
export interface QuerySummary {
  compilingTime: number;
  executionTime: number;
}

/**
 * The result of executing a Cypher query.
 * Obtain via Connection.query() or Connection.execute().
 */
export declare class QueryResult {
  /** Number of statement results returned by the query. */
  readonly length: number;

  /** Iterate over each statement result in order. */
  [Symbol.iterator](): Iterator<QueryResult>;

  /** Returns the statement result at the given index. */
  at(index: number): QueryResult | undefined;

  /** Returns all statement results as an array. */
  toArray(): QueryResult[];

  /** Returns true if the query executed successfully. */
  isSuccess(): boolean;

  /** Returns the error message when isSuccess() is false. */
  getErrorMessage(): string;

  /**
   * Reset the row iterator to the beginning.
   * Useful when iterating the result multiple times via hasNext() / getNext().
   */
  resetIterator(): void;

  /** Returns true if there is at least one more row available via getNext(). */
  hasNext(): boolean;

  /**
   * Returns true when the response contains multiple query results
   * (i.e. multiple statements were executed in one call).
   */
  hasNextQueryResult(): boolean;

  /** Returns the number of columns in the result set. */
  getNumColumns(): number;

  /** Returns the number of rows (tuples) in the result set. */
  getNumTuples(): number;

  /** Returns the column names for the result set. */
  getColumnNames(): string[];

  /** Returns the column type names for the result set. */
  getColumnTypes(): string[];

  /** Returns a human-readable string representation of the result table. */
  toString(): string;

  /** Returns compilation and execution timing statistics. */
  getQuerySummary(): QuerySummary;

  /**
   * Returns the next QueryResult when multiple statements were executed
   * in a single query() call. Check hasNextQueryResult() first.
   */
  getNextQueryResult(): QueryResult;

  /**
   * Returns the next row as a positional array.
   * Check hasNext() before calling.
   */
  getNext(): unknown[];

  /** Returns all rows as a nested array (each row is a positional array). */
  getAllRows(): unknown[][];

  /**
   * Returns all rows as an array of plain objects keyed by column name.
   * This is the most convenient form for most use-cases.
   */
  getAllObjects(): Record<string, unknown>[];

  /** Releases the query result and frees resources. */
  close(): void;
}

/**
 * A compiled, parameterized query ready for repeated execution.
 * Obtain via Connection.prepare().
 */
export declare class PreparedStatement {
  /** Returns true if the statement compiled successfully. */
  isSuccess(): boolean;

  /** Returns the compilation error message when isSuccess() is false. */
  getErrorMessage(): string;

  /** Releases the prepared statement and frees resources. */
  close(): void;
}

/**
 * The main database handle.
 * Pass `:memory:` (or omit databasePath) for an in-memory database.
 */
export declare class Database {
  /**
   * @param databasePath       Path on disk, or `:memory:` / `""` for in-memory. Defaults to `:memory:`.
   * @param bufferPoolSize     Buffer pool size in bytes. 0 = use default.
   * @param maxNumThreads      Maximum threads for parallel query execution. 0 = use all available.
   * @param enableCompression  Whether to compress column data on disk. Default true.
   * @param readOnly           Open the database in read-only mode. Default false.
   * @param autoCheckpoint     Enable automatic WAL checkpointing. Default true.
   * @param checkpointThreshold WAL size threshold (bytes) that triggers a checkpoint. Default 16 MB.
   */
  constructor(
    databasePath?: string,
    bufferPoolSize?: number,
    maxNumThreads?: number,
    enableCompression?: boolean,
    readOnly?: boolean,
    autoCheckpoint?: boolean,
    checkpointThreshold?: number,
  );

  /** Close the database and release all resources. */
  close(): void;
}

/**
 * A connection to a Database instance.
 * All Cypher queries are executed through a Connection.
 */
export declare class Connection {
  /**
   * @param database   The database to connect to.
   * @param numThreads Optional thread cap for this connection's queries.
   */
  constructor(database: Database, numThreads?: number);

  /** Set the maximum number of threads this connection may use. */
  setMaxNumThreadForExec(numThreads: number): void;

  /** Set a query timeout in milliseconds. 0 disables the timeout. */
  setQueryTimeout(timeout: number): void;

  /** Returns the current thread limit for this connection. */
  getMaxNumThreadForExec(): number;

  /**
   * Execute a Cypher statement directly.
   * Use this for DDL (CREATE/DROP TABLE) and statements without user-supplied values.
   * For queries that include user data, prefer prepare() + execute() to avoid injection.
   */
  query(statement: string): QueryResult;

  /**
   * Compile a parameterized Cypher statement.
   * Named parameters use the `$name` syntax, e.g. `MATCH (n {id: $id})`.
   */
  prepare(statement: string): PreparedStatement;

  /**
   * Execute a previously prepared statement with the given parameter values.
   * @param preparedStatement A PreparedStatement obtained from prepare().
   * @param params            A plain object mapping parameter names (without `$`) to values.
   */
  execute(
    preparedStatement: PreparedStatement,
    params?: Record<string, unknown>,
  ): QueryResult;

  /** Close this connection and release resources. */
  close(): void;
}

// ─── Module-level functions ────────────────────────────────────────────────

/**
 * Initialize the WebAssembly module. Must be awaited before using any
 * synchronous API. Returns a Promise so callers can await readiness.
 */
export declare function init(): Promise<void>;

/** Returns the Ladybug database engine version string (e.g. "0.15.2"). */
export declare function getVersion(): string;

/** Returns the on-disk storage format version. */
export declare function getStorageVersion(): bigint;

/**
 * Returns the Emscripten virtual filesystem module.
 * See https://emscripten.org/docs/api_reference/Filesystem-API.html
 */
export declare function getFS(): object;

/** Returns the underlying WebAssembly.Memory object. */
export declare function getWasmMemory(): WebAssembly.Memory;
