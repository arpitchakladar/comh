import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '@/reducers';

if (ENV === "development") {
	require('preact/devtools');
}

ReactDOM.render(
	<BrowserRouter>
		<Provider store={store}>
			<App />
		</Provider>
	</BrowserRouter>,
	document.getElementById('root')
);

navigator.serviceWorker.register('/service-worker.js');

document.addEventListener('DOMContentLoaded', () => {
	const _theme = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';

	document.body.setAttribute('theme', _theme);

	if (!navigator.onLine) {
		document.getElementById('root').innerHTML = '<div class="offline">You are currently offline...</div>';
	}
}, false);
