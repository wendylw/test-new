import React from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroller';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { getPrice } from '../../../../../common/utils';
import { toLocaleDateString } from '../../../../../utils/datetime-lib';
import {
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
} from '../../../../../redux/modules/merchant/selectors';
import { getCustomerId } from '../../../../redux/modules/customer/selectors';
import { actions as appActionCreators, getCashbackHistory } from '../../../../redux/modules/app';
import { getCustomerReceiptList, getIsCustomerReceiptListHasMore } from '../../redux/selectors';
import { fetchCustomerReceiptList as fetchCustomerReceiptListThunk } from '../../redux/thunks';
import { IconTicket } from '../../../../../components/Icons';
import './ReceiptList.scss';

const DATE_OPTIONS = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

class RecentList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { fullScreen: false };
  }

  componentDidMount() {
    const { appActions, userCustomerId } = this.props;

    if (userCustomerId) {
      appActions.getCashbackHistory(userCustomerId);
    }
  }

  async componentDidUpdate(prevProps) {
    const { appActions, userCustomerId: currUserCustomerId } = this.props;
    const { userCustomerId: prevUserCustomerId } = prevProps || {};

    // customerId !== prevProps.customerId instead of !prevProps.customerId
    // The 3rd MiniProgram cached the previous customerId, so the customerId is not the correct account
    if (currUserCustomerId && currUserCustomerId !== prevUserCustomerId) {
      appActions.getCashbackHistory(currUserCustomerId);
    }
  }

  loadItems = page => {
    const { fetchCustomerReceiptList } = this.props;

    fetchCustomerReceiptList(page);
  };

  toggleFullScreen = () => {
    const { fullScreen } = this.state;

    this.setState({ fullScreen: !fullScreen });
  };

  renderLogList() {
    const {
      customerReceiptList,
      isCustomerReceiptListHasMore,
      t,
      merchantCountry,
      merchantLocale,
      merchantCurrency,
    } = this.props;

    return (
      <InfiniteScroll
        pageStart={-1}
        loadMore={this.loadItems}
        hasMore={isCustomerReceiptListHasMore}
        loader={
          <div style={{ clear: 'both' }} key={0}>
            {t('Loading')}
          </div>
        }
        useWindow={false}
      >
        <div>
          {customerReceiptList.map((receipt, i) => {
            const { createdTime, total } = receipt;
            const receiptTime = new Date(createdTime);

            return (
              // eslint-disable-next-line react/no-array-index-key
              <div className="flex flex-middle padding-normal margin-top-bottom-small base-box-shadow" key={`${i}`}>
                <IconTicket className="icon__primary ticket" />
                <summary className="receipt-list__item-summary padding-left-right-normal">
                  <h4 className="margin-top-bottom-small">
                    <span>{t('Receipt')} - </span>
                    <data value={total}>
                      {getPrice(Math.abs(total || 0), {
                        country: merchantCountry,
                        currency: merchantCurrency,
                        locale: merchantLocale,
                      })}
                    </data>
                  </h4>
                  <time className="receipt-list__time">
                    {toLocaleDateString(receiptTime, merchantCountry, DATE_OPTIONS)}
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

RecentList.displayName = 'RecentList';

RecentList.propTypes = {
  merchantCountry: PropTypes.string,
  merchantCurrency: PropTypes.string,
  merchantLocale: PropTypes.string,
  isCustomerReceiptListHasMore: PropTypes.bool,
  userCustomerId: PropTypes.string,
  customerReceiptList: PropTypes.arrayOf(PropTypes.object),
  cashbackHistory: PropTypes.arrayOf(PropTypes.object),
  appActions: PropTypes.shape({
    getCashbackHistory: PropTypes.func,
  }),
  fetchCustomerReceiptList: PropTypes.func,
};

RecentList.defaultProps = {
  merchantCountry: null,
  merchantCurrency: null,
  merchantLocale: null,
  isCustomerReceiptListHasMore: true,
  userCustomerId: '',
  customerReceiptList: [],
  cashbackHistory: [],
  appActions: {
    getCashbackHistory: () => {},
  },
  fetchCustomerReceiptList: () => {},
};

export default compose(
  withTranslation(['Cashback']),
  connect(
    state => ({
      userCustomerId: getCustomerId(state),
      merchantCountry: getMerchantCountry(state),
      merchantCurrency: getMerchantCurrency(state),
      merchantLocale: getMerchantLocale(state),
      cashbackHistory: getCashbackHistory(state),
      customerReceiptList: getCustomerReceiptList(state),
      isCustomerReceiptListHasMore: getIsCustomerReceiptListHasMore(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      fetchCustomerReceiptList: bindActionCreators(fetchCustomerReceiptListThunk, dispatch),
    })
  )
)(RecentList);
