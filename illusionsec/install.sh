#!/bin/bash

# HTTP/2 Flooder - Direct Compilation
# SCRIPT GOT LEAKED BY @laayy & @goflooder @m85301

set -e

echo "[INFO] Compiling main.rs..."

if [ ! -f "main.rs" ]; then
    echo "[ERROR] main.rs not found!"
    exit 1
fi

# Install Rust via official script if missing
if ! command -v cargo &> /dev/null; then
    echo "[INFO] Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
fi

# Add cargo to PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Try to update rust
echo "[INFO] Updating Rust..."
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable
source "$HOME/.cargo/env"

rustc --version
cargo --version

# Clean
rm -rf ~/.cargo/registry
rm -rf ~/.cargo/git
rm -f Cargo.lock
rm -rf target

# Create Cargo.toml
cat > Cargo.toml << 'EOF'
[package]
name = "http2_flooder"
version = "1.0.0"
edition = "2021"

[dependencies]
bytes = "1.5"
clap = { version = "4.4", features = ["derive"] }
colored = "2.1"
h2 = "0.3"
http = "0.2"
hyper = "0.14"
rand = "0.8"
rustls = "0.21"
sha2 = "0.10"
tokio = { version = "1.35", features = ["full"] }
tokio-rustls = "0.24"
webpki-roots = "0.25"
hex = "0.4"

[profile.release]
lto = true
panic = "abort"
EOF

mkdir -p src
cp main.rs src/main.rs

echo "[INFO] Building..."
cargo build --release

if [ -f "target/release/http2_flooder" ]; then
    echo "[SUCCESS] Build complete: target/release/http2_flooder"
    ls -lh target/release/http2_flooder
else
    echo "[ERROR] Compilation failed!"
    exit 1
fi