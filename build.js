// build.js
const esbuild = require("esbuild");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs")

// Gera os arquivos de tipos
execSync("tsc", { stdio: "inherit" });

// Faz o bundle para uso em browser e por import
esbuild.build({
    entryPoints: ["src/script.ts"],
    bundle: true,
    minify: true,
    sourcemap: false,
    outfile: "dist/script.min.js",
    format: "iife", // Imediatamente executado no browser
    target: ["es2018"],
}).catch(() => process.exit(1));

// Faz o bundle para uso em browser e por import
esbuild.build({
    entryPoints: ["src/sdk.ts"],
    bundle: true,
    minify: true,
    sourcemap: false,
    outfile: "dist/sdk.min.js",
    format: "iife", // Imediatamente executado no browser
    globalName: "BarteSdk", // Exposto como window.BarteSdk
    target: ["es2018"],
}).catch(() => process.exit(1));

// Também cria versão para import (ESM)
esbuild.build({
    entryPoints: ["src/sdk.ts"],
    bundle: true,
    minify: true,
    format: "esm",
    outfile: "dist/sdk.esm.js",
    target: ["es2018"],
}).catch(() => process.exit(1));

// Também cria versão para CommonJS (Node/React)
esbuild.build({
    entryPoints: ["src/sdk.ts"],
    bundle: true,
    minify: true,
    format: "cjs",
    outfile: "dist/sdk.cjs.js",
    target: ["es2018"],
}).catch(() => process.exit(1));

// 5. Copia index.html para dist/
const htmlSourceIndex = path.resolve(__dirname, "src", "index.html");
const htmlDestIndex = path.resolve(__dirname, "dist", "index.html");

fs.copyFileSync(htmlSourceIndex, htmlDestIndex);
console.log("✔ index.html copiado para dist/");