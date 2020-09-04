import React, { Component, lazy, Suspense } from 'react';
import { Switch, Route, BrowserRouter as Router, withRouter } from 'react-router-dom';
import Utils from '../../utils/utils';
import Home from './Home';
import Cart from './Cart';
import Payment from './Payment';
import Customer from './Customer';
import Constants from '../../utils/constants';
import MerchantInfo from './MerchantInfo';
import OrderDetails from './OrderDetails';
import NotFound from '../../NotFound';

const Location = lazy(() => Utils.retry(() => import('./Location/LocationPage')));
const Receipt = lazy(() => Utils.retry(() => import('./Receipt')));
const StripePayment = lazy(() => Utils.retry(() => import('./Payment/Stripe')));
const CreditCard = lazy(() => Utils.retry(() => import('./Payment/CreditCard')));
const BankingPayment = lazy(() => Utils.retry(() => import('./Payment/OnlineBanking')));
const ThankYou = lazy(() => Utils.retry(() => import('./ThankYou')));
const Sorry = lazy(() => Utils.retry(() => import('./Sorry')));
const ErrorPage = lazy(() => Utils.retry(() => import('./Error')));
const LocationAndDate = lazy(() => Utils.retry(() => import('./LocationAndDate')));
const Promotion = lazy(() => Utils.retry(() => import('./Promotion')));
const ReportDriver = lazy(() => Utils.retry(() => import('./ReportDriver')));
const PageLogin = lazy(() => Utils.retry(() => import('./PageLogin')));
const StoreList = lazy(() => Utils.retry(() => import('./StoreList')));

const { ROUTER_PATHS } = Constants;

class Routes extends Component {
  render() {
    const { match } = this.props;
    return (
      <Router basename={match.path}>
        <Suspense fallback={<div className="loader theme page-loader"></div>}>
          <Switch>
            <Route exact path={ROUTER_PATHS.ORDERING_HOME} component={Home} />
            <Route exact path={ROUTER_PATHS.ORDERING_CART} component={Cart} />
            <Route exact path={ROUTER_PATHS.ORDERING_PROMOTION} component={Promotion} />
            <Route exact path={ROUTER_PATHS.ORDERING_CUSTOMER_INFO} component={Customer} />
            <Route exact path={ROUTER_PATHS.ORDERING_PAYMENT} component={Payment} />
            <Route exact path={ROUTER_PATHS.ORDERING_LOCATION} component={Location} />
            <Route exact path={ROUTER_PATHS.ORDERING_LOCATION_AND_DATE} component={LocationAndDate} />
            <Route exact path={ROUTER_PATHS.ORDERING_CREDIT_CARD_PAYMENT} component={CreditCard} />
            <Route exact path={ROUTER_PATHS.ORDERING_STRIPE_PAYMENT} component={StripePayment} />
            <Route exact path={ROUTER_PATHS.ORDERING_ONLINE_BANKING_PAYMENT} component={BankingPayment} />
            <Route exact path={ROUTER_PATHS.RECEIPT_DETAIL} component={Receipt} />
            <Route exact path={ROUTER_PATHS.THANK_YOU} component={ThankYou} />
            <Route exact path={ROUTER_PATHS.ERROR} component={ErrorPage} />
            <Route exact path={ROUTER_PATHS.MERCHANT_INFO} component={MerchantInfo} />
            <Route exact path={ROUTER_PATHS.ORDER_DETAILS} component={OrderDetails} />
            <Route exact path={ROUTER_PATHS.SORRY} component={Sorry} />
            <Route exact path={ROUTER_PATHS.REPORT_DRIVER} component={ReportDriver} />
            <Route exact path={ROUTER_PATHS.ORDERING_LOGIN} component={PageLogin} />
            <Route exact path={ROUTER_PATHS.ORDERING_STORE_LIST} component={StoreList} />
            <Route path={'*'} component={NotFound} />
          </Switch>
        </Suspense>
      </Router>
    );
  }
}

export default withRouter(Routes);
