import React, { useState, useEffect } from "react";
import "./App.scss";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { Switch, Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
import { Store } from "@/reducers";
import Loader from "@/components/Loader/Loader";
import Join from "@/components/Join/Join";
import Chat from "@/components/Chat/Chat";

interface AppProps {};

const App: React.FC<AppProps> = () => {
	const [theme, setTheme] = useState<"light" | "dark" | null>(null);
	const loading = useSelector<Store, boolean>(state => state.loading);

	useEffect(() => setTheme(document.body.getAttribute("theme") as "light" | "dark"), []);

	const handleToggleTheme = () => {
		setTheme((_) => {
			const theme = document.body.getAttribute("theme") !== "light" ? "light" : "dark";

			localStorage.setItem("theme", theme);
			document.body.setAttribute("theme", theme!)

			return theme;
		});
	};

	return (
		<div className="App">
			<div className="toggle-theme">
				<button onClick={handleToggleTheme}>{theme !== "light" ? "light mode" : "dark mode"}</button>
			</div>
			<CSSTransition in={loading} timeout={300} classNames="loading-fade" unmountOnExit={true}>
				<div className="loading-backdrop">
					<Loader className="Loading" />
				</div>
			</CSSTransition>
			<Route render={({ location }) =>
				<TransitionGroup className="Views-Content">
					<CSSTransition key={location.key} timeout={300} classNames="route-fade">
						<Switch location={location}>
							<Route path="/" exact component={Join} />
							<Route path="/chat" component={Chat} />
							<Route render={() => <Redirect to="/" />} />
						</Switch>
					</CSSTransition>
				</TransitionGroup>
			} />
		</div>
	);
};

export default App;
