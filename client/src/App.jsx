import React, { useState, useEffect } from 'react';
import './App.scss';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Switch, Route, Redirect } from 'react-router-dom';
import Cookies from 'js-cookie';
import Join from '@/components/Join/Join';
import Chat from '@/components/Chat/Chat';

const App = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const _theme = Cookies.get('theme');

    if (_theme) {
      setTheme(_theme);
    } else {
      setTheme((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.body.setAttribute('theme', 'dark');
    } else {
      document.body.setAttribute('theme', 'light');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(theme => {
      const _theme = theme !== 'light' ? 'light' : 'dark';

      Cookies.set('theme', _theme, { expires: 30, path: '/' });

      return _theme;
    });
  };

  return (
    <div className="App">
      <div className="toggle-theme">
        <button onClick={handleToggleTheme}>{theme !== 'light' ? 'light mode' : 'dark mode'}</button>
      </div>
      <Route render={({ location }) =>
        <TransitionGroup className="Views-Content">
          <CSSTransition key={location.key} timeout={600} classNames="fade">
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
