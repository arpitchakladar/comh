import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./App";
import { HashRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "@/reducers";

window.comhApiUri = COMH_API_URI;
window.comhUri = COMH_URI;

ReactDOM.render(
	<HashRouter>
		<Provider store={store}>
			<App />
		</Provider>
	</HashRouter>,
	document.getElementById("root")
);

if (process.env.NODE_ENV as "production" | "development" === "production") {
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.register("/sw.js");
	}
}

document.addEventListener("DOMContentLoaded", () => {
	document.body.setAttribute("theme", localStorage.getItem("theme") || ((window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light"));

	if (!navigator.onLine) {
		document.getElementById("root")!.innerHTML = "<div class=\"offline\">You are currently offline...</div>";
	}
}, false);
