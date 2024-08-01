require("dotenv").config();
const { build } = require("esbuild");
const { glob } = require("glob");
const entryPoints = glob.globSync("./client/**/*.ts");

// Inject .env variables

let problematicIdentifiers = [
  "CommonProgramFiles(x86)",
  "ProgramFiles(x86)",
  "IntelliJ IDEA Community Edition",
];

const define = {};
for (const k in process.env) {
  if (!["CLIENT_SECRET"].includes(k)) {
    if (problematicIdentifiers.includes(k)) break;
    define[`process.env.${k}`] = JSON.stringify(process.env[k]);
  }
}

build({
  bundle: true,
  entryPoints,
  outbase: "./client",
  outdir: "./client",
  platform: "browser",
  external: [],
  define,
});
