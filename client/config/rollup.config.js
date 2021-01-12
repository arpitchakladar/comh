import path from "path";
import alias from "@rollup/plugin-alias";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";
import json from "@rollup/plugin-json";
import postcss from "rollup-plugin-postcss";
import replace from "@rollup/plugin-replace";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import reactSvg from "rollup-plugin-react-svg";
import { minifyHTML } from "rollup-plugin-minify-html";
import { DEFAULT_EXTENSIONS } from "@babel/core";

const ENV = process.env.NODE_ENV || "development";

const production = ENV === "production";

const __rootDir = path.resolve(__dirname, "..");
const __publicDir = path.resolve(__rootDir, "public");
const __configDir = path.resolve(__rootDir, "config");
const __srcDir = path.resolve(__rootDir, "src");
const __distDir = path.resolve(__rootDir, "dist");

const extensions = [".js", ".jsx", ".ts", ".tsx"]

const onwarn = ({ message }) => {
	if (/The \'this\' keyword is equivalent to \'undefined\' at the top level of an ES module, and has been rewritten/.test(message)) {
		return;
	}

	console.warn(message);
};

export default [{
	input: path.resolve(__publicDir, "sw.js"),
	output: {
		file: path.resolve(__distDir, "sw.js"),
		format: "iife"
	},
	onwarn,
	plugins: [
		resolve({
			extensions: [".js"],
			browser: true
		}),
		replace({
			"process.env.NODE_ENV": JSON.stringify(ENV)
		}),
		babel({
			babelHelpers: "bundled",
			babelrc: false,
			exclude: /(core-js|node_modules)/,
			...require("./babel.sw.config")
		}),
		commonjs(),
		production && terser(),
		minifyHTML({
			targets: [
				{
					src: "public/index.html",
					dest: "dist/index.html",
					minifierOptions: {
						collapseWhitespace: true,
						minifyCSS: true,
						minifyJS: true,
						minifyURLs: true
					}
				}
			]
		})
	]
}, {
	input: path.resolve(__srcDir, "index.tsx"),
	external: ["crypto", "react", "react-dom"],
	output: {
		file: path.resolve(__distDir, "bundle.js"),
		format: "iife",
		globals: {
			"crypto": "crypto",
			"react": "React",
			"react-dom": "ReactDOM"
		}
	},
	onwarn,
	plugins: [
		copy({
			targets: [
				{
					src: path.resolve(__publicDir, "**"),
					dest: path.resolve(__distDir),
					ignore: [
						path.resolve(__publicDir, "index.html"),
						path.resolve(__publicDir, "sw.js"),
						path.resolve(__publicDir, "assets")
					]
				},
				{
					src: path.resolve(__publicDir, "assets", "**"),
					dest: path.resolve(__distDir, "assets")
				}
			]
		}),
		resolve({
			extensions: [".js", ".jsx", ".ts", ".tsx"],
			browser: true,
			preferBuiltins: true
		}),
		replace({
			"process.env.NODE_ENV": JSON.stringify(ENV),
			"COMH_API_URI": JSON.stringify(process.env.COMH_API_URI || "https://comh-api.herokuapp.com"),
			"COMH_URI": JSON.stringify(!production && process.env.ROLLUP_WATCH ? "http://localhost:8080" : "https://comh.now.sh")
		}),
		alias({
			entries: [
				{ find: "@", replacement: __srcDir }
			]
		}),
		typescript({
			tsconfig: path.resolve(__rootDir, "tsconfig.json")
		}),
		babel({
			babelHelpers: "bundled",
			extensions: [...DEFAULT_EXTENSIONS, ...extensions],
			compact: production,
			babelrc: false,
			exclude: /(core-js|node_modules)/,
			...require("./babel.config")
		}),
		commonjs({
			extensions
		}),
		globals(),
		builtins(),
		json(),
		postcss({
			minimize: production,
			config: {
				path: path.resolve(__configDir, "postcss.config.js")
			},
			modules: false,
			extensions: [".css", ".scss"],
			extract: path.resolve(__distDir, "style.css")
		}),
		reactSvg(),
		!production && process.env.ROLLUP_WATCH && serve({
			contentBase: "dist",
			port: 8080
		}),
		!production && process.env.ROLLUP_WATCH && livereload("dist"),
		production && terser()
	],
	watch: {
		clearScreen: false
	}
}];
