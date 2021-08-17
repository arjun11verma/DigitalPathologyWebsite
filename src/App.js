/**
 * React App that contains all of the components
 * @version 1.0
 * @author Arjun Verma
 */

import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import CreateAccount from './CreateAccount';
import Home from './Home';
import PathPortal from './PathPortal'
import LoginPage from './LoginPage';
import ImageView from './ImageView';

/**
 * Uses the React BrowserRouter to render different Components at their respective URL's
 */
function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/Login" component={LoginPage} />
        <Route exact path="/Homepage/Login" component={LoginPage} />
        <Route exact path="/" component={Home} />
        <Route exact path="/Homepage/:id" component={Home} />
        <Route exact path="/Homepage/:id/PathPortal" component={PathPortal} />
        <Route exact path="/Homepage/:id/ImageView/:id" component={ImageView} />
        <Route exact path="/CreateAccount" component={CreateAccount} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
