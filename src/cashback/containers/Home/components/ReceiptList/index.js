import React from 'react';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import InfiniteScroll from 'react-infinite-scroller';
import { IconTicket } from '../../../../../components/Icons';
import Header from '../../../../../components/Header';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { actions as appActionCreators, getOnlineStoreInfo, getUser, getBusiness } from '../../../../redux/modules/app';
import {
  actions as homeActionCreators,
  getCashbackHistory,
  getReceiptList,
  getFetchState,
} from '../../../../redux/modules/home';

const LANGUAGES = {
  MY: 'EN',
  TH: 'EN',
  PH: 'EN',
};
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
            Loading ...
          </div>
        }
        useWindow={false}
      >
        <div>
          {(receiptList || []).map((receipt, i) => {
            const { createdTime, total } = receipt;
            const receiptTime = new Date(createdTime);

            return (
              <div className="receipt-list__item flex flex-middle" key={`${i}`}>
                <IconTicket className="activity__icon ticket" />
                <summary>
                  <h4 className="receipt-list__title">
                    <label>{t('Receipt')} - </label>
                    <CurrencyNumber money={Math.abs(total || 0)} />
                  </h4>
                  <time className="receipt-list__time">
                    {receiptTime.toLocaleDateString(LANGUAGES[country || 'MY'], DATE_OPTIONS)}
                  </time>
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
      <div className={`aside-section ${this.state.fullScreen ? 'full' : ''}`}>
        <aside className="aside-bottom">
          {!this.state.fullScreen ? (
            <i className="aside-bottom__slide-button" onClick={this.toggleFullScreen.bind(this)}></i>
          ) : (
            <Header navFunc={this.toggleFullScreen.bind(this)} />
          )}
          <h3 className="aside-bottom__title text-center" onClick={this.toggleFullScreen.bind(this)}>
            {t('Receipts')}
          </h3>
          <div className={`receipt-list ${this.state.fullScreen ? 'full' : ''}`}>{this.renderLogList()}</div>
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
