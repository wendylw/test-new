import React, { Component } from 'react';
import Loadable from 'react-loadable';
import { Route, Redirect, Switch } from "react-router-dom";
import Constants from './Constants';

const Loading = () => <div>Loading ...</div>;

const AsyncOrderingApp = Loadable({
  loader: () => import("./App"),
  loading: Loading,
})

const AsyncNotFound = Loadable({
  loader: () => import("./containers/NotFound"),
  loading: Loading,
});

class Bootstrap extends Component {
  render() {
    return (
      <React.Fragment>
        <Switch>
          <Route exact path={Constants.ROUTER_PATHS.INDEX} render={() => {
            return (
              <Redirect to={Constants.ROUTER_PATHS.ORDERING} />
            );
          }} />
          <Route path={Constants.ROUTER_PATHS.ORDERING} component={AsyncOrderingApp} />
          <Route component={AsyncNotFound} />
        </Switch>
      </React.Fragment>
    );
  }
}

export default Bootstrap;
