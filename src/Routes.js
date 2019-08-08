import React from "react";
import { Route } from "react-router-dom";
import Loadable from 'react-loadable';
import Constants from "./Constants";
import MessageModal from "./views/components/MessageModal";

const MyLoadingComponent = ({ isLoading, error }) => {
  // Handle the loading state
  if (isLoading) {
    return <div className="loader theme page-loader"></div>;
  }
  // Handle the error state
  else if (error) {
    console.error(error);

    return (
      <div>
        Sorry, there was a problem loading the page.
      </div>
    );
  }
  else {
    return null;
  }
};

const AsyncHome = Loadable({
  loader: () => import("./containers/Home"),
  loading: MyLoadingComponent,
});

const AsyncCart = Loadable({
  loader: () => import("./containers/Cart"),
  loading: MyLoadingComponent,
});

const AsyncPayment = Loadable({
  loader: () => import("./containers/Payment"),
  loading: MyLoadingComponent,
});

const AsyncBankCardPayment = Loadable({
  loader: () => import("./containers/BraintreeBankCardPayment"),
  loading: MyLoadingComponent,
});

const AsyncThankYou = Loadable({
  loader: () => import("./containers/ThankYou"),
  loading: MyLoadingComponent,
});

const AsyncReceiptDetail = Loadable({
  loader: () => import("./containers/ReceiptDetail"),
  loading: MyLoadingComponent,
});

const AsyncSorry = Loadable({
  loader: () => import("./containers/Sorry"),
  loading: MyLoadingComponent,
});

const AsyncPeopleCountModal = Loadable({
  loader: () => import("./views/components/PeopleCountModal"),
  loading: MyLoadingComponent,
});

const AsyncError = Loadable({
  loader: () => import("./views/components/Error"),
  loading: MyLoadingComponent,
});

export default () =>
  <React.Fragment>
    <Route path={Constants.ROUTER_PATHS.HOME} exact component={AsyncHome} />
    <Route path={Constants.ROUTER_PATHS.PORDUCTS} component={AsyncHome} />
    <Route path={Constants.ROUTER_PATHS.CART} exact component={AsyncCart} />
    <Route path={Constants.ROUTER_PATHS.PAYMENT} exact component={AsyncPayment} />
    <Route path={Constants.ROUTER_PATHS.CREDIT_CARD_PAYMENT} exact component={AsyncBankCardPayment} />
    <Route path={Constants.ROUTER_PATHS.THANK_YOU} exact component={AsyncThankYou} />
    <Route path={Constants.ROUTER_PATHS.RECEIPT_DETAIL} exact component={AsyncReceiptDetail} />
    <Route path={Constants.ROUTER_PATHS.SORRY} exact component={AsyncSorry} />
    <Route path={Constants.ROUTER_PATHS.ERROR} exact component={AsyncError} />
    <Route path={`*/modal/:modal`} render={({ match }) => {
      if (match.params.modal === 'people-count') return <AsyncPeopleCountModal />;
      // more modals can put here.
      return null;
    }} />
    {/*
      // TODO: can use react context + portal to do modal render/show/hide.
    */}
    <MessageModal />
  </React.Fragment>;
