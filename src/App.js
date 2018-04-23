import React, { Component } from 'react';
import './App.css';
import LogIn from './components/LogIn/LogIn';
import Opportunity from './components/Opportunity/Opportunity';
import CR from './components/CR/CR';
import Tasks from './components/Tasks/AllTasks';
import Analytics from './components/Analytics/Analytics';
import Chart from './components/Summary/Chart';
import Summary from './components/Summary/Summary';
import NavBar from './components/NavBar/NavBar';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import Unauthorized from './components/Unauthorized/Unauthorized';
import { Route, Switch, Redirect, BrowserRouter as Router } from 'react-router-dom';
import 'core-js/fn/array/find';
import 'core-js/fn/array/includes';
import 'core-js/fn/number/is-nan';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Switch>
          <Route exact path="/" component={LogIn} />
          <Route path="/hypotheses" component={Opportunity} />
          <Route path="/cr" component={CR} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/summary" component={Summary} />
          <Route path="/password" component={ForgotPassword} />
          <Route path="/401" component={Unauthorized} />
          {/* <Route path="/ServerError" component={ServerError} />
          <Route path="/401" component={Unauthorised} />
          <Route path="/*" component={NotFound} /> */}
        </Switch>
      </div>
    );
  }
}

export default App;
