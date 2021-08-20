import React, { Component, lazy, Suspense } from 'react';
import { Switch, Route, BrowserRouter as Router, withRouter } from 'react-router-dom';
import Utils from '../../utils/utils';
import Home from './Home';
import Cart from './Cart';
import Payment from './payments/containers/Payment';
import Customer from './Customer';
import Constants from '../../utils/constants';
import NotFound from '../../containers/NotFound';

const Location = lazy(() => Utils.attemptLoad(() => import('./Location/LocationPage')));
const StripePayment = lazy(() => Utils.attemptLoad(() => import('./payments/containers/Stripe')));
const AdyenPayment = lazy(() => Utils.attemptLoad(() => import('./payments/containers/Adyen')));
const CreditCard = lazy(() => Utils.attemptLoad(() => import('./payments/containers/CreditCard')));
const BankingPayment = lazy(() => Utils.attemptLoad(() => import('./payments/containers/OnlineBanking')));
const ThankYou = lazy(() => Utils.attemptLoad(() => import('./order-status/containers/ThankYou')));
const Sorry = lazy(() => Utils.attemptLoad(() => import('./order-status/containers/Sorry')));
const ErrorPage = lazy(() => Utils.attemptLoad(() => import('./Error')));
const LocationAndDate = lazy(() => Utils.attemptLoad(() => import('./LocationAndDate')));
const Promotion = lazy(() => Utils.attemptLoad(() => import('./Promotion')));
const ReportDriver = lazy(() => Utils.attemptLoad(() => import('./order-status/containers/ReportDriver')));
const PageLogin = lazy(() => Utils.attemptLoad(() => import('./PageLogin')));
const StoreList = lazy(() => Utils.attemptLoad(() => import('./StoreList')));
const Profile = lazy(() => Utils.attemptLoad(() => import('./Profile')));
const AddressList = lazy(() => Utils.attemptLoad(() => import('./Customer/containers/AddressList')));
const AddressDetail = lazy(() => Utils.attemptLoad(() => import('./Customer/containers/AddressDetail')));
const ContactDetail = lazy(() => Utils.attemptLoad(() => import('./Customer/containers/ContactDetail')));
const SavedCards = lazy(() => Utils.attemptLoad(() => import('./payments/containers/SavedCards')));
const CardCvv = lazy(() => Utils.attemptLoad(() => import('./payments/containers/SavedCards/CVV')));
const OrderDetails = lazy(() => Utils.attemptLoad(() => import('./order-status/containers/OrderDetails')));
const MerchantInfo = lazy(() => Utils.attemptLoad(() => import('./order-status/containers/MerchantInfo')));

const { ROUTER_PATHS } = Constants;

class Routes extends Component {
  render() {
    const { match } = this.props;
    return (
      <Router basename={match.path}>
        <Suspense fallback={<div className="loader theme full-page"></div>}>
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
            <Route exact path={ROUTER_PATHS.ORDERING_STRIPE_PAYMENT_SAVE} component={StripePayment} />
            <Route exact path={ROUTER_PATHS.ORDERING_ADYEN_PAYMENT} component={AdyenPayment} />
            <Route exact path={ROUTER_PATHS.ORDERING_ONLINE_SAVED_CARDS} component={SavedCards} />
            <Route exact path={ROUTER_PATHS.ORDERING_ONLINE_CVV} component={CardCvv} />
            <Route exact path={ROUTER_PATHS.ORDERING_ONLINE_BANKING_PAYMENT} component={BankingPayment} />
            <Route exact path={ROUTER_PATHS.THANK_YOU} component={ThankYou} />
            <Route exact path={ROUTER_PATHS.ERROR} component={ErrorPage} />
            <Route exact path={ROUTER_PATHS.MERCHANT_INFO} component={MerchantInfo} />
            <Route exact path={ROUTER_PATHS.ORDER_DETAILS} component={OrderDetails} />
            <Route exact path={ROUTER_PATHS.SORRY} component={Sorry} />
            <Route exact path={ROUTER_PATHS.REPORT_DRIVER} component={ReportDriver} />
            <Route exact path={ROUTER_PATHS.ORDERING_LOGIN} component={PageLogin} />
            <Route exact path={ROUTER_PATHS.ORDERING_STORE_LIST} component={StoreList} />
            <Route exact path={ROUTER_PATHS.PROFILE} component={Profile} />
            <Route
              exact
              path={`${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${ROUTER_PATHS.ADDRESS_LIST}`}
              component={AddressList}
            />
            <Route
              exact
              path={`${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${ROUTER_PATHS.ADDRESS_DETAIL}`}
              component={AddressDetail}
            />
            <Route
              exact
              path={`${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${ROUTER_PATHS.CONTACT_DETAIL}`}
              component={ContactDetail}
            />
            <Route path={'*'} component={NotFound} />
          </Switch>
        </Suspense>
      </Router>
    );
  }
}
Routes.displayName = 'OrderingRoutes';
export default withRouter(Routes);
