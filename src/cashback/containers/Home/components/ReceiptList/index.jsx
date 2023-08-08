import React from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroller';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { getOnlineStoreInfo, getUserCustomerId, getBusiness } from '../../../../redux/modules/app';
import { toLocaleDateString } from '../../../../../utils/datetime-lib';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import { IconTicket } from '../../../../../components/Icons';
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
  constructor(props) {
    super(props);
    this.state = { fullScreen: false };
  }

  componentDidMount() {
    const { homeActions, userCustomerId } = this.props;

    if (userCustomerId) {
      homeActions.getCashbackHistory(userCustomerId);
    }
  }

  async componentDidUpdate(prevProps) {
    const { homeActions, userCustomerId: currUserCustomerId } = this.props;
    const { userCustomerId: prevUserCustomerId } = prevProps || {};

    // userCustomerId !== prevProps.userCustomerId instead of !prevProps.userCustomerId
    // The 3rd MiniProgram cached the previous userCustomerId, so the userCustomerId is not the correct account
    if (currUserCustomerId && currUserCustomerId !== prevUserCustomerId) {
      homeActions.getCashbackHistory(currUserCustomerId);
    }
  }

  loadItems = page => {
    const { business, homeActions } = this.props;
    const pageSize = 10;
    homeActions.getReceiptList(business, page, pageSize);
  };

  toggleFullScreen = () => {
    const { fullScreen } = this.state;

    this.setState({ fullScreen: !fullScreen });
  };

  renderLogList() {
    const { onlineStoreInfo, receiptList, fetchState, t } = this.props;
    const { country } = onlineStoreInfo || {};

    return (
      <InfiniteScroll
        pageStart={-1}
        loadMore={this.loadItems}
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
              // eslint-disable-next-line react/no-array-index-key
              <div className="flex flex-middle padding-normal margin-top-bottom-small base-box-shadow" key={`${i}`}>
                <IconTicket className="icon__primary ticket" />
                <summary className="receipt-list__item-summary padding-left-right-normal">
                  <h4 className="margin-top-bottom-small">
                    <span>{t('Receipt')} - </span>
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
    const { fullScreen } = this.state;
    const { cashbackHistory, userCustomerId, t } = this.props;

    if (!Array.isArray(cashbackHistory) || !userCustomerId) {
      return null;
    }

    return (
      <div
        className={`receipt-list ${fullScreen ? 'receipt-list--full' : ''}`}
        data-test-id="cashback.home.receipt-list.container"
      >
        <aside className="receipt-list__container padding-left-right-small">
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <i
            className="receipt-list__slide-button padding-small"
            onClick={this.toggleFullScreen}
            data-test-id="cashback.home.receipt-list.screen-toggler"
          />
          <h3
            className="padding-top-bottom-small text-center text-size-bigger"
            onClick={this.toggleFullScreen}
            data-test-id="cashback.home.receipt-list.title"
          >
            {t('Receipts')}
          </h3>
          <div
            className={`receipt-list__content padding-left-right-small ${
              fullScreen ? 'receipt-list__content--full' : ''
            }`}
          >
            {this.renderLogList()}
          </div>
        </aside>
      </div>
    );
  }
}

RecentActivities.displayName = 'RecentActivities';

RecentActivities.propTypes = {
  business: PropTypes.string,
  fetchState: PropTypes.bool,
  userCustomerId: PropTypes.string,
  homeActions: PropTypes.shape({
    getReceiptList: PropTypes.func,
    getCashbackHistory: PropTypes.func,
  }),
  onlineStoreInfo: PropTypes.shape({
    country: PropTypes.string,
  }),
  receiptList: PropTypes.arrayOf(PropTypes.object),
  cashbackHistory: PropTypes.arrayOf(PropTypes.object),
};

RecentActivities.defaultProps = {
  business: '',
  fetchState: true,
  userCustomerId: '',
  homeActions: {
    getReceiptList: () => {},
    getCashbackHistory: () => {},
  },
  onlineStoreInfo: {
    country: '',
  },
  receiptList: [],
  cashbackHistory: [],
};

export default compose(
  withTranslation(['Cashback']),
  connect(
    state => ({
      userCustomerId: getUserCustomerId(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
      business: getBusiness(state),
      cashbackHistory: getCashbackHistory(state),
      receiptList: getReceiptList(state),
      fetchState: getFetchState(state),
    }),
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(RecentActivities);
