import React from 'react';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import InfiniteScroll from 'react-infinite-scroller';
import { IconTicket } from '../../../../../components/Icons';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { actions as appActionCreators, getOnlineStoreInfo, getUser, getBusiness } from '../../../../redux/modules/app';
import { toLocaleDateString } from '../../../../../utils/datetime-lib';
import {
  actions as homeActionCreators,
  getCashbackHistory,
  getReceiptList,
  getFetchState,
} from '../../../../redux/modules/home';
import './ReceiptList.scss';

const DATE_OPTIONS = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

class RecentActivities extends React.Component {
  state = {
    fullScreen: false,
  };

  async componentWillMount() {
    const { user, appActions } = this.props;
    const { isLogin, consumerId } = user || {};

    if (isLogin) {
      await appActions.loadCustomerProfile({ consumerId });
      this.getLoyaltyHistory();
    }
  }

  async componentDidUpdate(prevProps) {
    const { isFetching, user, appActions } = this.props;
    const { isLogin, consumerId } = user || {};

    if (isFetching || !isLogin) {
      return;
    }

    if (prevProps.user.isLogin !== isLogin) {
      await appActions.loadCustomerProfile({ consumerId });
      this.getLoyaltyHistory();
    }
  }

  getLoyaltyHistory() {
    const { homeActions, user } = this.props;
    const { customerId } = user || {};
    if (customerId) {
      homeActions.getCashbackHistory(customerId);
    }
  }

  loadItems(page) {
    const { business, homeActions } = this.props;
    const pageSize = 10;
    homeActions.getReceiptList(business, page, pageSize);
    window.heap?.track('cashback.home.receipt-list.load-page', { Page: page });
  }

  toggleFullScreen() {
    this.setState({ fullScreen: !this.state.fullScreen });
  }

  renderLogList() {
    const { onlineStoreInfo, receiptList, fetchState, t } = this.props;
    const { country } = onlineStoreInfo || {};

    return (
      <InfiniteScroll
        pageStart={-1}
        loadMore={this.loadItems.bind(this)}
        hasMore={fetchState}
        loader={
          <div style={{ clear: 'both' }} key={0}>
            {t('Loading')}
          </div>
        }
        useWindow={false}
      >
        <div>
          {(receiptList || []).map((receipt, i) => {
            const { createdTime, total } = receipt;
            const receiptTime = new Date(createdTime);

            return (
              <div className="flex flex-middle padding-normal margin-top-bottom-smaller base-box-shadow" key={`${i}`}>
                <IconTicket className="icon__primary ticket" />
                <summary className="padding-left-right-normal">
                  <h4 className="margin-top-bottom-smaller">
                    <label>{t('Receipt')} - </label>
                    <CurrencyNumber money={Math.abs(total || 0)} />
                  </h4>
                  <time className="receipt-list__time">{toLocaleDateString(receiptTime, country, DATE_OPTIONS)}</time>
                </summary>
              </div>
            );
          })}
        </div>
      </InfiniteScroll>
    );
  }

  render() {
    const { cashbackHistory, user, t } = this.props;
    const { customerId } = user || {};

    if (!Array.isArray(cashbackHistory) || !customerId) {
      return null;
    }

    return (
      <div
        className={`receipt-list ${this.state.fullScreen ? 'full' : ''}`}
        data-heap-name="cashback.home.receipt-list.container"
      >
        <aside className="receipt-list__container padding-left-right-small">
          <i
            className="receipt-list__slide-button padding-small"
            onClick={this.toggleFullScreen.bind(this)}
            data-heap-name="cashback.home.receipt-list.screen-toggler"
          />
          <h3
            className="padding-top-bottom-small text-center text-size-bigger"
            onClick={this.toggleFullScreen.bind(this)}
            data-heap-name="cashback.home.receipt-list.title"
          >
            {t('Receipts')}
          </h3>
          <div className={`receipt-list__content padding-left-right-small ${this.state.fullScreen ? 'full' : ''}`}>
            {this.renderLogList()}
          </div>
        </aside>
      </div>
    );
  }
}

export default compose(
  withTranslation(['Cashback']),
  connect(
    state => ({
      user: getUser(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
      business: getBusiness(state),
      cashbackHistory: getCashbackHistory(state),
      receiptList: getReceiptList(state),
      fetchState: getFetchState(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(RecentActivities);
