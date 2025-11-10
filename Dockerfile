# Use the official Emscripten base image
FROM emscripten/emsdk:latest

# Set maintainer information
LABEL maintainer="lantu.april@gmail.com"

# Download lbug-wasm
RUN cd / && git clone https://github.com/unswdb/lbug-wasm.git --recursive

# Install the necessary packages
RUN apt-get update && \
    npm install -g yarn  # Install Yarn globally using npm

# Verify the installation of Emscripten, Node.js, and Yarn
RUN emcc -v && node -v && yarn -v  # Check versions

# Set the working directory to /lbug-wasm
WORKDIR /lbug-wasm

# Install lbug-wasm and build package
RUN make package

# Remove the unnecessary files
RUN rm -rf /lbug-wasm/lbug/dataset

# Set the default command to run when starting the container
CMD ["/bin/bash"]
