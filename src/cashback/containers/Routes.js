import React, { Component, lazy, Suspense } from 'react';
import { Switch, Route, BrowserRouter as Router, withRouter } from 'react-router-dom';

const RecentActivities = lazy(() => import('./RecentActivities'));
const Claim = lazy(() => import('./Claim'));
const Home = lazy(() => import('./Home'));
const Error = lazy(() => import('../../components/Error'));

class Routes extends Component {
  render() {
    const { match } = this.props;

    return (
      <Router basename={match.path}>
        <Suspense fallback={<div className="loading-cover"><i className="loader theme page-loader"></i></div>}>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/claim" component={Claim} />
            <Route exact path="/activities" component={RecentActivities} />
            <Route exact path="/error" component={Error} />
          </Switch>
        </Suspense>
      </Router>
    );
  }
}

export default withRouter(Routes);
