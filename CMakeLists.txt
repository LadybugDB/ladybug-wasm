cmake_minimum_required(VERSION 3.10)
project(LBUG-WASM VERSION 0.7.0.0)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED TRUE)
# set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s DISABLE_EXCEPTION_CATCHING=0")

# Enable ccache if available
find_program(CCACHE_PROGRAM ccache)
if(CCACHE_PROGRAM)
    message(STATUS "ccache found: ${CCACHE_PROGRAM}")
    set(CMAKE_C_COMPILER_LAUNCHER "${CCACHE_PROGRAM}")
    set(CMAKE_CXX_COMPILER_LAUNCHER "${CCACHE_PROGRAM}")
else()
    message(STATUS "ccache not found")
endif()

if (EMSCRIPTEN)
    # set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -pthread")
    # set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -sUSE_PTHREADS=1")
    # set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -mbulk-memory -DWEBDB_BULK_MEMORY=1")
    add_compile_options("SHELL:-s USE_PTHREADS")
    add_link_options("SHELL:-s USE_PTHREADS")
endif()

add_subdirectory(ladybug)
include_directories(lib)
add_executable(lbug-wasm lib/web_bind.cpp lib/web_database.cpp lib/web_connection.cpp lib/web_prepared_statement.cpp lib/web_query_result.cpp)
target_link_libraries(lbug-wasm lbug)

# Release build
if(CMAKE_BUILD_TYPE STREQUAL "Release")
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DNDEBUG")
  # ... with min size
  if(WASM_MIN_SIZE)
    set(CMAKE_CXX_FLAGS_RELEASE "-Oz")
    set(WASM_LINK_FLAGS "${WASM_LINK_FLAGS} -Oz")
  else()
    # ... with max performance
    set(CMAKE_CXX_FLAGS_RELEASE "-O3")
    set(WASM_LINK_FLAGS "${WASM_LINK_FLAGS} -O3")
  endif()
# Debug build
elseif(CMAKE_BUILD_TYPE STREQUAL "Debug")
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -g")
  set(WASM_LINK_FLAGS "${WASM_LINK_FLAGS} \
    -sASSERTIONS=1 \
    -sSAFE_HEAP=2 \
    -g")
  # ... with fast linking
  if(WASM_FAST_LINKING)
    set(WASM_LINK_FLAGS "${WASM_LINK_FLAGS} -O0")
  endif()
endif()

# Set environment
if(WASM_WEB)
  set(WASM_LINK_FLAGS "${WASM_LINK_FLAGS} -s ENVIRONMENT='web,webview,worker'  -s EXPORT_ES6=1")
else()
  set(WASM_LINK_FLAGS "${WASM_LINK_FLAGS} -s ENVIRONMENT='web,node,worker'")
endif()

message(STATUS "WASM_LINK_FLAGS=${WASM_LINK_FLAGS}")
set_target_properties(
  lbug-wasm
  PROPERTIES
    LINK_FLAGS
    "${WASM_LINK_FLAGS} \
    -s FILESYSTEM=1 \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s MAXIMUM_MEMORY=4GB \
    -s ALLOW_BLOCKING_ON_MAIN_THREAD=1 \
    -s WARN_ON_UNDEFINED_SYMBOLS=0 \
    -s PTHREAD_POOL_SIZE=8 \
    -mbulk-memory -DWEBDB_BULK_MEMORY=1 \
    -s WASM_BIGINT \
    -s ERROR_ON_UNDEFINED_SYMBOLS=0 \
    -lembind \
    -lidbfs.js \
    -s MODULARIZE=1 -s EXPORT_NAME='lbug_wasm' \
    -s NO_DISABLE_EXCEPTION_CATCHING \
    --embed-file ../../data/embeddings@/ \
    -s EXPORTED_RUNTIME_METHODS='[\"ccall\", \"stackSave\", \"wasmMemory\",\"stackAlloc\", \"stackRestore\",\"FS\",\"UTF8ToString\"]' \
    -s EXPORTED_FUNCTIONS='[\"__emscripten_thread_crashed\",\"__embind_initialize_bindings\"]' \
    ")

    # --post-js ${CMAKE_SOURCE_DIR}/lib/postfix_module.js \
    # --extern-pre-js ${CMAKE_SOURCE_DIR}/packages/lbug-wasm/middleware/moduleArrow.js \
    # --emit-tsd 'interface.d.ts' \
    # -sUSE_PTHREADS=1 -sPTHREAD_POOL_SIZE=4 \
    # -s PTHREAD_POOL_SIZE_STRICT=0
    # -s PROXY_TO_PTHREAD \
    # -s PTHREAD_POOL_SIZE=navigator.hardwareConcurrency \ this may cause problem in node
