import _get from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import PullToRefresh from 'react-simple-pull-to-refresh';
import InfiniteScroll from 'react-infinite-scroller';
import Utils from '../../utils/utils';
import { appActionCreators, getUserIsLogin, getIsPingRequestDone, getIsAlipayMiniProgram } from '../redux/modules/app';
import PageLoader from '../../components/PageLoader';
import {
  loadNextOrderHistoryData as loadNextOrderHistoryDataThunk,
  initOrderHistoryData as initOrderHistoryDataThunk,
} from './redux/thunks';
import {
  getOrderHistoryList,
  getHasMore,
  getIsRequestOrderDataInPending,
  getPage,
  getIsRequestOrderDataDone,
  getPageLoaderVisibility,
} from './redux/selectors';
import { isURL } from '../../common/utils';
import OrderItem from './components/OrderItem';
import Loader from './components/Loader';
import RequireLoginPage from './components/RequireLoginPage';
import './order-history.scss';
import OrderListEmptyView from './components/OrderListEmptyView';
import Clevertap from '../../utils/clevertap';
import WebHeader from '../../components/WebHeader';
import logger from '../../utils/monitoring/logger';
import prefetch from '../../common/utils/prefetch-assets';

class OrderHistory extends React.Component {
  componentDidMount = async () => {
    const { isLogin, initOrderHistoryData, isPingRequestDone } = this.props;

    if (isLogin) {
      initOrderHistoryData();
    }

    if (isPingRequestDone && !isLogin) {
      this.login();
    }

    prefetch(['ORD_FC', 'ORD_OD', 'ORD_TY'], ['OrderingDelivery', 'OrderingThankYou']);
  };

  componentDidUpdate(prevProps) {
    const { isLogin, initOrderHistoryData, isPingRequestDone } = this.props;

    // TODO: use react hooks will be more simple
    if (isLogin && prevProps.isLogin !== isLogin) {
      initOrderHistoryData();
    }

    if (isPingRequestDone && prevProps.isPingRequestDone !== isPingRequestDone) {
      if (!isLogin) {
        this.login();
      }
    }
  }

  login = async () => {
    const { loginByAlipayMiniProgram, isAlipayMiniProgram } = this.props;

    if (isAlipayMiniProgram) {
      await loginByAlipayMiniProgram();
    }
  };

  handleOrderItemClick = order => {
    const urlObj = new URL(order.url);
    urlObj.searchParams.append('source', document.location.href);

    Clevertap.pushEvent('Order History - Click order card', {
      rank: _get(order, 'rank', null),
      'store name': _get(order, 'store.storeDisplayName', ''),
    });

    window.location.href = urlObj.toString();
  };

  handleRefresh = async () => {
    const { initOrderHistoryData } = this.props;

    await initOrderHistoryData();
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

  handleSourceUrl = sourceUrl => {
    const { history } = this.props;

    if (isURL(sourceUrl)) {
      window.location.href = sourceUrl;
      return;
    }

    logger.error('Site_OrderHistory_InvalidSourceUrl', { source: sourceUrl });
    history.goBack(); // Fallback plan: go back to the previous page.
  };

  handleBackButtonClick = () => {
    const sourceUrl = Utils.getQueryString('source');

    if (sourceUrl) {
      this.handleSourceUrl(sourceUrl);
      return;
    }

    // By default, just go back to previous page
    const { history } = this.props;

    history.goBack();
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

    // TODO: If we implement the order history tab on TnG Mini Program in the future, the header should be removed from the page.
    // However, the header should be shown if the page is redirected from the food court page.
    return (
      <>
        <WebHeader
          // eslint-disable-next-line no-return-assign
          headerRef={ref => (this.headerEl = ref)}
          isPage
          title={t('MyOrderHistory')}
          navFunc={this.handleBackButtonClick}
        />

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
                    data-test-id="site.order-history.order"
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
OrderHistory.propTypes = {
  isLogin: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  orderHistoryList: PropTypes.array,
  hasMore: PropTypes.bool,
  page: PropTypes.number,
  isRequestOrderDataDone: PropTypes.bool,
  pageLoaderVisibility: PropTypes.bool,
  isPingRequestDone: PropTypes.bool,
  isRequestOrderDataInPending: PropTypes.bool,
  isAlipayMiniProgram: PropTypes.bool,
  initOrderHistoryData: PropTypes.func,
  loginByAlipayMiniProgram: PropTypes.func,
  loadNextOrderHistoryData: PropTypes.func,
};

OrderHistory.defaultProps = {
  isLogin: false,
  orderHistoryList: [],
  hasMore: true,
  page: 1,
  isRequestOrderDataDone: null,
  pageLoaderVisibility: true,
  isPingRequestDone: false,
  isRequestOrderDataInPending: false,
  isAlipayMiniProgram: false,
  initOrderHistoryData: () => {},
  loginByAlipayMiniProgram: () => {},
  loadNextOrderHistoryData: () => {},
};

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
      isAlipayMiniProgram: getIsAlipayMiniProgram(state),
    }),
    {
      loginByAlipayMiniProgram: appActionCreators.loginByAlipayMiniProgram,
      initOrderHistoryData: initOrderHistoryDataThunk,
      loadNextOrderHistoryData: loadNextOrderHistoryDataThunk,
    }
  )
)(OrderHistory);
