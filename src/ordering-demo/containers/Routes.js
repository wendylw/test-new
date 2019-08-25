import React, { Component, lazy, Suspense } from 'react';
import { Switch, Route, BrowserRouter as Router, withRouter } from 'react-router-dom';

const Home = lazy(() => import('./Home'));
const Cart = lazy(() => import('./Cart'));
const Payment = lazy(() => import('./Payment'));
const BraintreePayment = lazy(() => import('./Payment/braintree'));
const BankingPayment = lazy(() => import('./Payment/banking'));
const ThankYou = lazy(() => import('./ThankYou'));
const Sorry = lazy(() => import('./Sorry'));

class Routes extends Component {
  render() {
    const { match } = this.props;
    return (
      <Router basename={match.path}>
        <Suspense fallback={<div className="loader"></div>}>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/cart" component={Cart} />
            <Route exact path="/payment" component={Payment} />
            <Route exact path="/payment/creditcard" component={BraintreePayment} />
            <Route exact path="/payment/online-banking" component={BankingPayment} />
            <Route exact path="/thank-you" component={ThankYou} />
            <Route exact path="/sorry" component={Sorry} />
          </Switch>
        </Suspense>
      </Router>
    );
  }
}

export default withRouter(Routes);
