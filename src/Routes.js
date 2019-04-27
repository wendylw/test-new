import React from "react";
import { Route, Switch } from "react-router-dom";
import Loadable from 'react-loadable';
import Main from "./views/Main";

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

const AsyncCart = Loadable({
  loader: () => import("./containers/Cart"),
  loading: MyLoadingComponent,
});

const AsyncNotFound = Loadable({
  loader: () => import("./containers/NotFound"),
  loading: MyLoadingComponent,
});

export default () =>
  <Switch>
    <Route path="/" exact component={AsyncHome} />
    <Route path="/cart" exact component={AsyncCart} />
    <Route path="/playground" exact component={Main} />
    <Route component={AsyncNotFound} />
  </Switch>;
