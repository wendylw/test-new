import React from 'react';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import InfiniteScroll from 'react-infinite-scroller';
import { IconTicket } from '../../../../../components/Icons';
import Header from '../../../../../components/Header';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActions, getOnlineStoreInfo, getUser, getBusiness } from '../../../../redux/modules/app';
import { actions as homeActions, getCashbackHistory, getReceiptList } from '../../../../redux/modules/home';

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
    receiptList: [],
    hasMoreItems: true
  }

  async componentWillMount() {
    const { user, appActions } = this.props;
    const { isLogin } = user || {};

    if (isLogin) {
      await appActions.loadCustomerProfile();
      this.getLoyaltyHistory();
    }
  }

  async componentDidUpdate(prevProps) {
    const {
      isFetching,
      user,
      appActions,
    } = this.props;
    const { isLogin } = user || {};

    if (isFetching || !isLogin) {
      return;
    }

    if (prevProps.user.isLogin !== isLogin) {
      await appActions.loadCustomerProfile();
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
    homeActions.getReceiptList(business,page,pageSize);
    if(page == 10){
      this.state.hasMoreItems = false;
    }
  }

  toggleFullScreen() {
    this.setState({ fullScreen: !this.state.fullScreen });
  }

  renderLogList() {
    const {
      onlineStoreInfo,
      receiptList
    } = this.props;
    const { country } = onlineStoreInfo || {};

    console.log(receiptList);
    var items = [];
    (receiptList || []).map((receipt,i) => {
      const {
        createdTime,
        total
      } = receipt;
      const receiptTime = new Date(createdTime)
      items.push(
        <div className="receipt-list__item flex flex-middle" key={`${i}`}>
          <IconTicket className="activity__icon ticket" />
          <summary>
            <h4 className="receipt-list__title">
              <label>Receipt - </label>
              <CurrencyNumber money={Math.abs(total || 0)} />
            </h4>
            <time className="receipt-list__time">
              {receiptTime.toLocaleDateString(LANGUAGES[country || 'MY'], DATE_OPTIONS)}
            </time>
          </summary>
        </div>
      )
    })
    return (
        <InfiniteScroll
          pageStart={0}
          loadMore={this.loadItems.bind(this)}
          hasMore={this.state.hasMoreItems}
          loader={<div key={0}>Loading ...</div>}
          useWindow={false}
          className={`receipt-list ${this.state.fullScreen ? 'full' : ''}`}
        > 
          <div>
            {items}
          </div>
        </InfiniteScroll>
    );
  }

  render() {
    const { cashbackHistory, user } = this.props;
    const { customerId } = user || {};

    if (!Array.isArray(cashbackHistory) || !customerId) {
      return null;
    }

    return (
      <div className={`aside-section ${this.state.fullScreen ? 'full' : ''}`}>
        <aside className="aside-bottom">
          {
            !this.state.fullScreen
              ? <i className="aside-bottom__slide-button" onClick={this.toggleFullScreen.bind(this)}></i>
              : <Header navFunc={this.toggleFullScreen.bind(this)} />
          }
          <h3 className="aside-bottom__title text-center" onClick={this.toggleFullScreen.bind(this)}>Receipts</h3>
          {this.renderLogList()}
        </aside>
      </div>
    );
  }
}

export default connect(
  (state) => ({
    user: getUser(state),
    onlineStoreInfo: getOnlineStoreInfo(state),
    business: getBusiness(state),
    cashbackHistory: getCashbackHistory(state),
    receiptList: getReceiptList(state)
  }),
  (dispatch) => ({
    appActions: bindActionCreators(appActions, dispatch),
    homeActions: bindActionCreators(homeActions, dispatch),
  })
)(RecentActivities);