import React, { Component, lazy, Suspense } from 'react';
import { Switch, Route, BrowserRouter as Router, withRouter } from 'react-router-dom';

const Test = lazy(() => import('./Test'));
const Home = lazy(() => import('./Home'));
const Cart = lazy(() => import('./Cart'));
const Payment = lazy(() => import('./Payment'));
const Receipt = lazy(() => import('./Receipt'));
const BraintreePayment = lazy(() => import('./Payment/Braintree'));
const BankingPayment = lazy(() => import('./Payment/OnlineBanking'));
const ThankYou = lazy(() => import('./ThankYou'));
const Sorry = lazy(() => import('./Sorry'));

class Routes extends Component {
  render() {
    const { match } = this.props;
    return (
      <Router basename={match.path}>
        <Suspense fallback={<div className="loader theme page-loader"></div>}>
          <Switch>
            <Route exact path="/test" component={Test} />
            <Route exact path="/" component={Home} />
            <Route exact path="/cart" component={Cart} />
            <Route exact path="/payment" component={Payment} />
            <Route exact path="/receipt" component={Receipt} />
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
