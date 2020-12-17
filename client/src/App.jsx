import React, { useState, useEffect } from 'react';
import './App.scss';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingGif from '@/assets/loading.gif';
import Join from '@/components/Join/Join';
import Chat from '@/components/Chat/Chat';

const App = () => {
	const [theme, setTheme] = useState();
	const loading = useSelector(state => state.loading);

	useEffect(() => setTheme(document.body.getAttribute('theme')), []);

	useEffect(() => document.body.setAttribute('theme', theme), [theme]);

	const handleToggleTheme = () => {
		setTheme(theme => {
			const _theme = theme !== 'light' ? 'light' : 'dark';

			localStorage.setItem('theme', _theme);

			return _theme;
		});
	};

	return (
		<div className="App">
			<div className="toggle-theme">
				<button onClick={handleToggleTheme}>{theme !== 'light' ? 'light mode' : 'dark mode'}</button>
			</div>
			<CSSTransition in={loading} timeout={300} classNames="loading-fade" unmountOnExit={true}>
				<div className="loading-backdrop">
					<img src={LoadingGif} alt="Loading..." className="Loading"/>
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
