import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '@/reducers';

window.API_URL = 'https://comh-api.herokuapp.com';

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
  const theme = localStorage.getItem('theme');
  const _theme = theme ? theme : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';

  document.body.setAttribute('theme', _theme);

  if (!navigator.onLine) {
    document.getElementById('root').innerHTML = '<div class="offline">You are currently offline...</div>';
  }
}, false);
