import path from "path";
import fs from "fs";
import alias from "@rollup/plugin-alias";
import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";
import { builtinModules } from "module";
import { terser } from "rollup-plugin-terser";

const ENV = process.env.NODE_ENV || "development";

const production = ENV === "production";

const __rootDir = path.resolve(__dirname, "..");
const __srcDir = path.resolve(__rootDir, "src");
const __apiSrcDir = path.resolve(__srcDir, "api");
const __distDir = path.resolve(__rootDir, "dist");
const __apiDistDir = path.resolve(__distDir, "api");

const extensions = [".js", ".ts"];

let server;

const serve = () => {
	const toExit = () => {
		if (server) server.kill(0);
	};

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('NODE_ENV=development yarn', ['start'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
};

const pkg = JSON.parse(fs.readFileSync(path.resolve(__rootDir, 'package.json'), 'utf-8'));
const node_modules = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {}), ...Object.keys(pkg.peerDependencies || {}), ...builtinModules];

export default [{
	input: path.resolve(__srcDir, "server.ts"),
	external: [path.resolve(__srcDir, "api"), ...node_modules],
	output: {
		format: "cjs",
		file: path.resolve(__distDir, "server.js"),
		sourcemap: true
	},
	plugins: [
		alias({
			entries: [
				{ find: "@", replacement: __srcDir }
			]
		}),
		typescript({
			tsconfig: path.resolve(__rootDir, "tsconfig.json")
		}),
		commonjs({
			extensions
		}),
		production && terser()
	]
}, {
	input: path.resolve(__apiSrcDir, "index.ts"),
	external: node_modules,
	output: {
		format: "cjs",
		file: path.resolve(__apiDistDir, "index.js"),
		exports: "default",
		sourcemap: true
	},
	plugins: [
		alias({
			entries: [
				{ find: "@", replacement: __srcDir }
			]
		}),
		typescript({
			tsconfig: path.resolve(__rootDir, "tsconfig.json")
		}),
		commonjs({
			extensions
		}),
		!production && process.env.ROLLUP_WATCH && serve(),
		production && terser()
	]
}];
