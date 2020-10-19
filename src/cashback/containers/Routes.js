import React, { Component, lazy, Suspense } from 'react';
import { Switch, Route, BrowserRouter as Router, withRouter } from 'react-router-dom';
import Utils from '../../utils/utils';
import NotFound from '../../NotFound';

const RecentActivities = lazy(() => Utils.retry(() => import('./Home/components/RecentActivities')));
const Claim = lazy(() => Utils.retry(() => import('./Claim')));
const Home = lazy(() => Utils.retry(() => import('./Home')));
const Error = lazy(() => Utils.retry(() => import('../../components/Error')));

class Routes extends Component {
  render() {
    const { match } = this.props;

    return (
      <Router basename={match.path}>
        <Suspense
          fallback={
            <div className="loading-cover">
              <i className="loader theme full-page"></i>
            </div>
          }
        >
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/claim" component={Claim} />
            <Route exact path="/activities" component={RecentActivities} />
            <Route exact path="/error" component={Error} />
            <Route path={'*'} component={NotFound} />
          </Switch>
        </Suspense>
      </Router>
    );
  }
}

export default withRouter(Routes);
