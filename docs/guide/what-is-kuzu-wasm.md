# What is Ladybug Wasm?
Ladybug Wasm is the WebAssembly version of the [Ladybug](https://github.com/LadybugDB/ladybug) database system, designed to provide high-performance, in-browser serverless graph analysis. 

## Overview
By compiling Ladybug to WebAssembly, Ladybug-WASM enables asynchronous execution of Cypher queries within web workers, ensuring impressive query performance and scalability. With the integration of Apache Arrow for lossless data copying, Ladybug-WASM ensures data integrity and efficiency. Additionally, it includes a virtual file system for seamless file imports.
![An image](./arch.png)

## Examples
Power by Ladybug WASM
- [Ladybug-Shell](https://Ladybug-shell.netlify.app/)
- [Ladybug-Lab](https://Ladybug-lab.netlify.app/)

## Performance
Ladybug-WASM is benchmarked against existing web data processing libraries using the LDBC, demonstrating superior performance across various workloads.