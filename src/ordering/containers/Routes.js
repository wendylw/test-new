import React, { Component, lazy, Suspense } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import Utils from '../../utils/utils';
import MenuProxy from './Menu/MenuProxy';
import Cart from './shopping-cart/containers/Cart/index';
import CartSubmissionStatus from './shopping-cart/containers/CartSubmissionStatus';
import Payment from './payments/containers/Payment';
import CustomerInfo from './Customer/containers/CustomerInfo';
import Constants from '../../utils/constants';
import NotFound from '../../containers/NotFound';
import V2Playground from './Menu/Playground';
import history from '../orderingHistory';

const Location = lazy(() => Utils.attemptLoad(() => import('./Location/LocationPage')));
const StripePayment = lazy(() => Utils.attemptLoad(() => import('./payments/containers/Stripe')));
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
const AddressList = lazy(() => Utils.attemptLoad(() => import('./Customer/containers/AddressList')));
const AddressDetail = lazy(() => Utils.attemptLoad(() => import('./Customer/containers/AddressDetail')));
const ContactDetail = lazy(() => Utils.attemptLoad(() => import('./Customer/containers/ContactDetail')));
const SavedCards = lazy(() => Utils.attemptLoad(() => import('./payments/containers/SavedCards')));
const CardCvv = lazy(() => Utils.attemptLoad(() => import('./payments/containers/SavedCards/CVV')));
const OrderDetails = lazy(() => Utils.attemptLoad(() => import('./order-status/containers/OrderDetails')));
const MerchantInfo = lazy(() => Utils.attemptLoad(() => import('./order-status/containers/MerchantInfo')));
const TableSummary = lazy(() => Utils.attemptLoad(() => import('./TableSummary')));
const OrderHistory = lazy(() => Utils.attemptLoad(() => import('../../site/order-history')));

const { ROUTER_PATHS } = Constants;

class Routes extends Component {
  render() {
    return (
      <ConnectedRouter history={history}>
        <Suspense fallback={<div className="loader theme full-page"></div>}>
          <Switch>
            <Route exact path={'/v2-playground'} component={V2Playground} /> {/* only for test, will remove later */}
            <Route exact path={ROUTER_PATHS.ORDERING_HOME} component={MenuProxy} />
            <Route exact path={ROUTER_PATHS.ORDERING_CART} component={Cart} />
            <Route exact path={ROUTER_PATHS.ORDERING_CART_SUBMISSION_STATUS} component={CartSubmissionStatus} />
            <Route exact path={ROUTER_PATHS.ORDERING_PROMOTION} component={Promotion} />
            <Route exact path={ROUTER_PATHS.ORDERING_CUSTOMER_INFO} component={CustomerInfo} />
            <Route exact path={ROUTER_PATHS.ORDERING_PAYMENT} component={Payment} />
            <Route exact path={ROUTER_PATHS.ORDERING_LOCATION} component={Location} />
            <Route exact path={ROUTER_PATHS.ORDERING_LOCATION_AND_DATE} component={LocationAndDate} />
            <Route exact path={ROUTER_PATHS.ORDERING_CREDIT_CARD_PAYMENT} component={CreditCard} />
            <Route exact path={ROUTER_PATHS.ORDERING_STRIPE_PAYMENT} component={StripePayment} />
            <Route exact path={ROUTER_PATHS.ORDERING_STRIPE_PAYMENT_SAVE} component={StripePayment} />
            <Route exact path={ROUTER_PATHS.ORDERING_ONLINE_SAVED_CARDS} component={SavedCards} />
            <Route exact path={ROUTER_PATHS.ORDERING_ONLINE_CVV} component={CardCvv} />
            <Route exact path={ROUTER_PATHS.ORDERING_ONLINE_BANKING_PAYMENT} component={BankingPayment} />
            <Route exact path={ROUTER_PATHS.THANK_YOU} component={ThankYou} />
            <Route exact path={ROUTER_PATHS.ERROR} component={ErrorPage} />
            <Route exact path={ROUTER_PATHS.MERCHANT_INFO} component={MerchantInfo} />
            <Route exact path={ROUTER_PATHS.ORDERING_TABLE_SUMMARY} component={TableSummary} />
            <Route exact path={ROUTER_PATHS.ORDER_DETAILS} component={OrderDetails} />
            <Route exact path={ROUTER_PATHS.SORRY} component={Sorry} />
            <Route exact path={ROUTER_PATHS.REPORT_DRIVER} component={ReportDriver} />
            <Route exact path={ROUTER_PATHS.ORDERING_LOGIN} component={PageLogin} />
            <Route exact path={ROUTER_PATHS.ORDERING_STORE_LIST} component={StoreList} />
            <Route exact path={ROUTER_PATHS.ORDER_HISTORY} component={Utils.isQROrder() ? OrderHistory : NotFound} />
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
      </ConnectedRouter>
    );
  }
}
Routes.displayName = 'OrderingRoutes';
export default withRouter(Routes);
