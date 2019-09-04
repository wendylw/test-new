import React, { Component, lazy, Suspense } from 'react';
import { Switch, Route, BrowserRouter as Router, withRouter } from 'react-router-dom';

import Constants from '../../utils/constants';

const Test = lazy(() => import('./Test'));
const Home = lazy(() => import('./Home'));
const Cart = lazy(() => import('./Cart'));
const Payment = lazy(() => import('./Payment'));
const Receipt = lazy(() => import('./Receipt'));
const BraintreePayment = lazy(() => import('./Payment/Braintree'));
const BankingPayment = lazy(() => import('./Payment/OnlineBanking'));
const ThankYou = lazy(() => import('./ThankYou'));
const Sorry = lazy(() => import('./Sorry'));

const { ROUTER_PATHS } = Constants;

class Routes extends Component {
  render() {
    const { match } = this.props;
    return (
      <Router basename={match.path}>
        <Suspense fallback={<div className="loader theme page-loader"></div>}>
          <Switch>
            <Route exact path="/test" component={Test} />
            <Route exact path={ROUTER_PATHS.ORDERING_HOME} component={Home} />
            <Route exact path={ROUTER_PATHS.ORDERING_CART} component={Cart} />
            <Route exact path={ROUTER_PATHS.ORDERING_PAYMENT} component={Payment} />
            <Route exact path={ROUTER_PATHS.ORDERING_CREDIT_CARD_PAYMENT} component={BraintreePayment} />
            <Route exact path={ROUTER_PATHS.ORDERING_ONLINE_BANKING_PAYMENT} component={BankingPayment} />
            <Route exact path={ROUTER_PATHS.RECEIPT_DETAIL} component={Receipt} />
            <Route exact path={ROUTER_PATHS.THANK_YOU} component={ThankYou} />
            <Route exact path={ROUTER_PATHS.SORRY} component={Sorry} />
          </Switch>
        </Suspense>
      </Router>
    );
  }
}

export default withRouter(Routes);
