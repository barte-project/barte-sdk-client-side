const esbuild = require("esbuild");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs")

execSync("tsc --declaration --emitDeclarationOnly --outDir dist")

// Faz o bundle para uso em browser e por import
esbuild.build({
    entryPoints: ["src/script.ts"],
    bundle: true,
    minify: true,
    sourcemap: false,
    outfile: "dist/script.min.js",
    format: "iife", // Imediatamente executado no browser
    target: ["esnext"],
}).catch(() => process.exit(1));

// Faz o bundle para uso em browser e por import
esbuild.build({
    entryPoints: ["src/domain/index.ts"],
    bundle: true,
    minify: true,
    sourcemap: false,
    outfile: "dist/sdk.min.js",
    format: "iife", // Imediatamente executado no browser
    globalName: "BarteSdk", // Exposto como window.BarteSdk
    target: ["esnext"],
}).catch(() => process.exit(1));

const entryPoints = ["src/domain/index.ts", "src/domain/payment/token/index.ts", "src/domain/payment/token/iframe.ts", "src/domain/payment/token/utils.ts", "src/domain/payment/checkout/index.ts", "src/domain/payment/checkout/api.ts", "src/domain/payment/index.ts", "src/domain/antifraud/fingerprint/index.ts", "src/domain/antifraud/fingerprint/utils.ts", "src/domain/web-constructor.ts", "src/config/env.ts"]

// Builda os pacotes separados com esm (para ser usado com 'import')
esbuild.build({
    entryPoints,
    bundle: false,
    splitting: true,
    format: 'esm',
    outdir: 'dist/esm',
    target: ['esnext'],
    sourcemap: true,
    outbase: 'src',
}).catch(() => process.exit(1));

/**
 * Builda os pacotes em cjs (para serem usados com 'require') 
 * Estão sendo buildados em separados pois o esbuild não suporta build único para arquivos cjs
 * */
esbuild.build({
    entryPoints: ["src/domain/index.ts"],
    bundle: true,
    minify: false,
    format: "cjs",
    outfile: "dist/cjs/index.cjs",
    target: ["esnext"],
}).catch(() => process.exit(1));

esbuild.build({
    entryPoints: ["src/domain/payment/token/index.ts"],
    bundle: true,
    minify: false,
    format: "cjs",
    outfile: "dist/cjs/domain/payment/token/index.cjs",
    target: ["esnext"],
}).catch(() => process.exit(1));

esbuild.build({
    entryPoints: ["src/domain/payment/checkout/index.ts"],
    bundle: true,
    minify: false,
    format: "cjs",
    outfile: "dist/cjs/domain/payment/checkout/index.cjs",
    target: ["esnext"],
}).catch(() => process.exit(1));

esbuild.build({
    entryPoints: ["src/domain/antifraud/fingerprint/index.ts"],
    bundle: true,
    minify: false,
    format: "cjs",
    outfile: "dist/cjs/domain/antifraud/fingerprint/index.cjs",
    target: ["esnext"],
}).catch(() => process.exit(1));

// Copia index.html para dist/
const htmlSourceIndex = path.resolve(__dirname, "src", "index.html");
const htmlDestIndex = path.resolve(__dirname, "dist", "index.html");

fs.copyFileSync(htmlSourceIndex, htmlDestIndex);
console.log("✔ index.html copiado para dist/");