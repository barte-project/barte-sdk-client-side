require("dotenv").config();
const esbuild = require("esbuild");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs")

execSync("tsc --declaration --emitDeclarationOnly --outDir dist")

const env = {
    'import.meta.env.iframeUrl': `"${process.env.IFRAME_URL}"`,
    'import.meta.env.iframeScriptUrl': `"${process.env.IFRAME_SCRIPT_URL}"`,
    'import.meta.env.apiUrl': `"${process.env.API_URL}"`,
}

// Faz o bundle para uso em browser e por import
esbuild.build({
    entryPoints: ["src/script.ts"],
    bundle: true,
    minify: true,
    sourcemap: false,
    outfile: "dist/script.min.js",
    format: "iife", // Imediatamente executado no browser
    target: ["esnext"],
    define: env
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

const entryPoints = ["src/domain/index.ts", "src/domain/card/index.ts", "src/domain/fingerprint/index.ts", "src/domain/iframe/utils.ts"]

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
    define: env
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
    outfile: "dist/cjs/index.cjs.js",
    target: ["esnext"],
}).catch(() => process.exit(1));

esbuild.build({
    entryPoints: ["src/domain/card/index.ts"],
    bundle: true,
    minify: false,
    format: "cjs",
    outfile: "dist/cjs/domain/card/index.cjs.js",
    target: ["esnext"],
    define: env
}).catch(() => process.exit(1));

// Copia index.html para dist/
const htmlSourceIndex = path.resolve(__dirname, "src", "index.html");
const htmlDestIndex = path.resolve(__dirname, "dist", "index.html");

fs.copyFileSync(htmlSourceIndex, htmlDestIndex);
console.log("✔ index.html copiado para dist/");