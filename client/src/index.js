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

navigator.serviceWorker.register("/sw.js");

document.addEventListener("DOMContentLoaded", () => {
	const _theme = localStorage.getItem("theme") || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";

	document.body.setAttribute("theme", _theme);

	if (!navigator.onLine) {
		document.getElementById("root").innerHTML = "<div class=\"offline\">You are currently offline...</div>";
	}
}, false);
