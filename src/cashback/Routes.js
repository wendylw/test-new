import React, { Component, lazy, Suspense } from 'react';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom';
import config from '../config';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getBusiness } from './actions';

// Containers
const PageClaim = lazy(() => import('./views/PageClaim'));
const PageHome = lazy(() => import('./views/PageLoyalty'));
const Error = lazy(() => import('../components/Error'));

// Pages
class Routes extends Component {
  state = {}

  componentWillMount() {
    const { getBusiness } = this.props;

    getBusiness(config.storeId);
  }

  render() {
    return (
      <Router basename="/loyalty">
        <Suspense fallback={<div className="loader theme page-loader"></div>}>
          <Switch>
            <Route
              exact
              path="/claim"
              render={props => <PageClaim {...props} />}
            />
            <Route
              exact
              path="/info"
              name="Loyalty"
              render={props => <PageHome {...props} />}
            />
            <Route exact path="/error" name="Error" render={props => <Error {...props} />} />
          </Switch>
        </Suspense>
      </Router>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => bindActionCreators({
  getBusiness,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Routes);
