import React from "react";
import { Route, Switch } from "react-router-dom";
import Loadable from 'react-loadable';

const MyLoadingComponent = ({isLoading, error}) => {
  // Handle the loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }
  // Handle the error state
  else if (error) {
    console.error(error);

    return (
      <div>
        Sorry, there was a problem loading the page.
      </div>
    );
  }
  else {
    return null;
  }
};

const AsyncHome = Loadable({
  loader: () => import("./containers/Home"),
  loading: MyLoadingComponent,
});

const AsyncPage2 = Loadable({
  loader: () => import("./containers/Page2"),
  loading: MyLoadingComponent,
});

const AsyncNotFound = Loadable({
  loader: () => import("./containers/NotFound"),
  loading: MyLoadingComponent,
});

const AsyncUIHome = Loadable({
  loader: () => import("./containers/UIHome"),
  loading: MyLoadingComponent,
});

export default () =>
  <Switch>
    <Route path="/" exact component={AsyncHome} />
    <Route path="/categories" component={AsyncHome} />
    <Route path="/ui-home" exact component={AsyncUIHome} />
    <Route path="/page2" exact component={AsyncPage2} />
    <Route component={AsyncNotFound} />
  </Switch>;
