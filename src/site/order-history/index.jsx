/* eslint-disable */
import React from 'react';
import qs from 'qs';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import PullToRefresh from 'react-simple-pull-to-refresh';
import InfiniteScroll from 'react-infinite-scroller';
import Utils from '../../utils/utils';
import { appActionCreators, getUserIsLogin, getIsPingRequestDone } from '../redux/modules/app';
import PageLoader from '../../components/PageLoader';
import { loadNextOrderHistoryData, initOrderHistoryData } from './redux/thunks';
import {
  getOrderHistoryList,
  getHasMore,
  getIsRequestOrderDataInPending,
  getPage,
  getIsRequestOrderDataDone,
  getPageLoaderVisibility,
} from './redux/selectors';
import OrderItem from './components/OrderItem';
import Loader from './components/Loader';
import RequireLoginPage from './components/RequireLoginPage';
import './order-history.scss';
import OrderListEmptyView from './components/OrderListEmptyView';
import Clevertap from '../../utils/clevertap';
import _get from 'lodash/get';
import WebHeader from '../../components/WebHeader';

class OrderHistory extends React.Component {
  componentDidMount = async () => {
    const { isLogin, initOrderHistoryData, isPingRequestDone } = this.props;

    if (isLogin) {
      initOrderHistoryData();
    }

    if (isPingRequestDone && !isLogin) {
      this.login();
    }
  };

  componentDidUpdate(prevProps) {
    // TODO: use react hooks will be more simple
    if (this.props.isLogin && prevProps.isLogin !== this.props.isLogin) {
      this.props.initOrderHistoryData();
    }

    if (this.props.isPingRequestDone && prevProps.isPingRequestDone !== this.props.isPingRequestDone) {
      if (!this.props.isLogin) {
        this.login();
      }
    }
  }

  login = async () => {
    if (Utils.isTNGMiniProgram()) {
      await this.props.loginByTngMiniProgram();
    }
  };

  handleOrderItemClick = order => {
    const urlObj = new URL(order.url);
    urlObj.searchParams.append('source', document.location.href);

    Clevertap.pushEvent('Order History - Click order card', {
      rank: _get(order, 'rank', null),
      'store name': _get(order, 'store.storeDisplayName', ''),
    });

    // '/go2page' will response 302 status and redirect to ${target} url
    // we add this for disabled IOS app link in Beep tng mini program
    // this is workaround way, TNGD side will fix IOS app link issue in the future
    Utils.submitForm('/go2page', {
      target: urlObj.toString(),
    });
  };

  handleRefresh = async () => {
    await this.props.initOrderHistoryData();
  };

  handleLoadMore = async () => {
    const { isRequestOrderDataInPending, loadNextOrderHistoryData } = this.props;
    if (isRequestOrderDataInPending) {
      return;
    }

    await loadNextOrderHistoryData();
  };

  handleLoginButtonClick = () => {
    this.login();
  };

  render() {
    const { t, isLogin, orderHistoryList, hasMore, page, isRequestOrderDataDone, pageLoaderVisibility } = this.props;

    if (pageLoaderVisibility) {
      return <PageLoader />;
    }

    if (!isLogin) {
      return (
        <RequireLoginPage
          onLoginButtonClick={this.handleLoginButtonClick}
          buttonText={t('Login')}
          title={t('LoginHereToViewAllYourOrderHistory')}
        />
      );
    }

    const showOrderListEmptyView = isRequestOrderDataDone && orderHistoryList.length === 0;

    return (
      <>
        {!Utils.isTNGMiniProgram() ? (
          <WebHeader headerRef={ref => (this.headerEl = ref)} isPage={true} title={t('MyOrderHistory')} />
        ) : null}

        <PullToRefresh pullingContent="" refreshingContent={<Loader />} onRefresh={this.handleRefresh}>
          {showOrderListEmptyView ? (
            <OrderListEmptyView />
          ) : (
            <div className="order-history">
              <InfiniteScroll
                useWindow={false}
                initialLoad={false}
                loader={<Loader key={page} />}
                loadMore={this.handleLoadMore}
                hasMore={hasMore}
                element="ul"
              >
                {orderHistoryList.map(order => (
                  <li
                    key={order.receiptNumber}
                    className="margin-normal"
                    data-heap-name="site.order-history.order"
                    onClick={() => this.handleOrderItemClick(order)}
                  >
                    <OrderItem order={order} />
                  </li>
                ))}
              </InfiniteScroll>
            </div>
          )}
        </PullToRefresh>
      </>
    );
  }
}

OrderHistory.displayName = 'OrderHistory';

export default compose(
  withTranslation('OrderHistory'),
  connect(
    state => ({
      isLogin: getUserIsLogin(state),
      orderHistoryList: getOrderHistoryList(state),
      hasMore: getHasMore(state),
      isRequestOrderDataInPending: getIsRequestOrderDataInPending(state),
      isPingRequestDone: getIsPingRequestDone(state),
      page: getPage(state),
      isRequestOrderDataDone: getIsRequestOrderDataDone(state),
      pageLoaderVisibility: getPageLoaderVisibility(state),
    }),
    {
      loginByTngMiniProgram: appActionCreators.loginByTngMiniProgram,
      initOrderHistoryData,
      loadNextOrderHistoryData,
    }
  )
)(OrderHistory);
