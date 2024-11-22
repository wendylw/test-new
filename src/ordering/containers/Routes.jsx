import React, { lazy, Suspense } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import { PATH_NAME_MAPPING } from '../../common/utils/constants';
import Utils from '../../utils/utils';
import Constants from '../../utils/constants';
import NotFound from '../../containers/NotFound';
import history from '../orderingHistory';

const MenuWrapper = lazy(() => Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_MNU" */ './Menu/MenuWrapper')));
const Cart = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_SC" */ './shopping-cart/containers/Cart'))
);
const CartSubmissionStatus = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_CSS" */ './order-status/containers/CartSubmissionStatus'))
);
const Payment = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_PMT" */ './payments/containers/Payment'))
);
const CustomerInfo = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_CI" */ './Customer/containers/CustomerInfo'))
);
const Location = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_LOC" */ './Location/LocationPage'))
);
const StripePayment = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_SRP" */ './payments/containers/Stripe'))
);
const CreditCard = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_CC" */ './payments/containers/CreditCard'))
);
const BankingPayment = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_OLB" */ './payments/containers/OnlineBanking'))
);
const ThankYou = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_TY" */ './order-status/containers/ThankYou'))
);
const Sorry = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_SRY" */ './order-status/containers/Sorry'))
);
const ErrorPage = lazy(() => Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_ERR" */ './Error')));
const LocationAndDate = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_LAD" */ './LocationAndDate'))
);
const Promotion = lazy(() => Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_PROMO" */ './Promotion')));
const ReportDriver = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_RD" */ './order-status/containers/ReportDriver'))
);
const PageLogin = lazy(() => Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_PL" */ './PageLogin')));
const StoreList = lazy(() => Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_SL" */ './StoreList')));
const AddressList = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_AL" */ './Customer/containers/AddressList'))
);
const AddressDetail = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_AD" */ './Customer/containers/AddressDetail'))
);
const ContactDetail = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_CD" */ './Customer/containers/ContactDetail'))
);
const SavedCards = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_SCS" */ './payments/containers/SavedCards'))
);
const OrderDetails = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_OD" */ './order-status/containers/OrderDetails'))
);
const MerchantInfo = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_MI" */ './order-status/containers/MerchantInfo'))
);
const StoreReviewProxy = lazy(() =>
  Utils.attemptLoad(() =>
    import(/* webpackChunkName: "ORD_SR" */ './order-status/containers/StoreReview/StoreReviewProxy')
  )
);
const TableSummary = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_TS" */ './order-status/containers/TableSummary'))
);
const FoodCourt = lazy(() => Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_FC" */ './food-court')));
const RewardList = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_RWDL" */ './rewards/containers/RewardList'))
);
const RewardDetail = lazy(() =>
  Utils.attemptLoad(() => import(/* webpackChunkName: "ORD_RWDD" */ './rewards/containers/RewardDetail'))
);

const { ROUTER_PATHS } = Constants;

const Routes = () => (
  <ConnectedRouter history={history}>
    <Suspense fallback={<div className="loader theme full-page" />}>
      <Switch>
        <Route exact path={ROUTER_PATHS.ORDERING_HOME} component={MenuWrapper} />
        <Route exact path={ROUTER_PATHS.ORDERING_CART} component={Cart} />
        <Route exact path={ROUTER_PATHS.ORDERING_CART_SUBMISSION_STATUS} component={CartSubmissionStatus} />
        <Route exact path={ROUTER_PATHS.ORDERING_PROMOTION} component={Promotion} />
        <Route exact path={PATH_NAME_MAPPING.ORDERING_REWARDS} component={RewardList} />
        <Route exact path={PATH_NAME_MAPPING.ORDERING_REWARD_DETAIL} component={RewardDetail} />
        <Route exact path={ROUTER_PATHS.ORDERING_CUSTOMER_INFO} component={CustomerInfo} />
        <Route exact path={ROUTER_PATHS.ORDERING_PAYMENT} component={Payment} />
        <Route exact path={ROUTER_PATHS.ORDERING_LOCATION} component={Location} />
        <Route exact path={ROUTER_PATHS.ORDERING_LOCATION_AND_DATE} component={LocationAndDate} />
        <Route exact path={ROUTER_PATHS.ORDERING_CREDIT_CARD_PAYMENT} component={CreditCard} />
        <Route exact path={ROUTER_PATHS.ORDERING_STRIPE_PAYMENT} component={StripePayment} />
        <Route exact path={ROUTER_PATHS.ORDERING_STRIPE_PAYMENT_SAVE} component={StripePayment} />
        <Route exact path={ROUTER_PATHS.ORDERING_ONLINE_SAVED_CARDS} component={SavedCards} />
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
        <Route exact path={ROUTER_PATHS.FOOD_COURT} component={FoodCourt} />
        <Route exact path={ROUTER_PATHS.STORE_REVIEW} component={StoreReviewProxy} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Suspense>
  </ConnectedRouter>
);

Routes.displayName = 'OrderingRoutes';

export default withRouter(Routes);
