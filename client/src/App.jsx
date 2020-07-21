import React, { useState, useEffect } from 'react';
import './App.scss';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Switch, Route, Redirect } from 'react-router-dom';
import Join from '@/components/Join/Join';
import Chat from '@/components/Chat/Chat';

const App = () => {
  const [theme, setTheme] = useState();

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
      <Route render={({ location }) =>
        <TransitionGroup className="Views-Content">
          <CSSTransition key={location.key} timeout={600} classNames="route">
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
