import React from 'react';
import qs from 'qs';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import CurrencyNumber from '../../components/CurrencyNumber';
import { IconLocation } from '../../../components/Icons';
import Image from '../../../components/Image';
import prefetch from '../../../common/utils/prefetch-assets';
import Utils from '../../../utils/utils';
import { isWebview } from '../../../common/utils';
import Constants, { REGISTRATION_TOUCH_POINT } from '../../../utils/constants';
import {
  actions as appActionCreators,
  getBusinessInfo,
  getOnlineStoreInfo,
  getIsUserLogin,
  getUserCustomerId,
} from '../../redux/modules/app';
import {
  actions as claimActionCreators,
  getCashbackInfo,
  getReceiptNumber,
  isFetchingCashbackInfo,
} from '../../redux/modules/claim';
import NativeHeader from '../../../components/NativeHeader';
import './LoyaltyClaim.scss';

class PageClaim extends React.Component {
  constructor(props) {
    super(props);
    this.state = { claimed: false };
  }

  async componentDidMount() {
    const { t, history, appActions, claimActions, isUserLogin } = this.props;
    const { h = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    appActions.setLoginPrompt(t('ClaimCashbackTitle'));
    await claimActions.getCashbackReceiptNumber(encodeURIComponent(h));

    const { receiptNumber } = this.props;

    if (receiptNumber) {
      await claimActions.getCashbackInfo(receiptNumber);

      const { cashbackInfo } = this.props;
      const { loadedCashbackInfo, createdCashbackInfo } = cashbackInfo || {};

      if (isUserLogin && loadedCashbackInfo && !createdCashbackInfo) {
        this.handleCreateCustomerCashbackInfo();
      }
    }

    const { cashbackInfo } = this.props;

    this.setMessage(cashbackInfo);

    prefetch(['CB_HM'], ['Cashback']);
  }

  componentDidUpdate(prevProps) {
    const { cashbackInfo: prevCashbackInfo } = prevProps;
    const { isFetching, receiptNumber, cashbackInfo: currCashbackInfo, isUserLogin } = this.props;
    const { status: prevStatus } = prevCashbackInfo || {};
    const { status: currStatus } = currCashbackInfo || {};
    const { claimed } = this.state;
    const { loadedCashbackInfo, createdCashbackInfo } = currCashbackInfo || {};

    if (prevStatus !== currStatus) {
      this.setMessage(currCashbackInfo);
    }

    if (!isFetching && isUserLogin && receiptNumber && loadedCashbackInfo && !createdCashbackInfo && !claimed) {
      this.handleCreateCustomerCashbackInfo();
    }
  }

  componentWillUnmount() {
    this.setState = () => {};
  }

  async handleCreateCustomerCashbackInfo() {
    const { history, claimActions } = this.props;
    const { claimed } = this.state;

    if (!claimed) {
      await this.setState({ claimed: true });
      await claimActions.createCashbackInfo(this.getOrderInfo());

      const { cashbackInfo, userCustomerId } = this.props;
      const { customerId } = cashbackInfo || {};

      history.replace({
        pathname: Constants.ROUTER_PATHS.CASHBACK_HOME,
        search: `?customerId=${userCustomerId || customerId || ''}`,
      });
    }
  }

  getOrderInfo() {
    const { receiptNumber } = this.props;

    return {
      phone: Utils.getLocalStorageVariable('user.p'),
      receiptNumber,
      source: Constants.CASHBACK_SOURCE.RECEIPT,
      registrationTouchpoint: REGISTRATION_TOUCH_POINT.CLAIM_CASHBACK,
    };
  }

  setMessage(cashbackInfo) {
    const { appActions } = this.props;
    const { status } = cashbackInfo || {};

    appActions.setMessageInfo({ key: status });
  }

  renderCashback() {
    const { cashbackInfo, t } = this.props;
    const { cashback, defaultLoyaltyRatio } = cashbackInfo || {};
    const percentage = defaultLoyaltyRatio ? Math.floor((1 * 100) / defaultLoyaltyRatio) : 5;
    const cashbackNumber = Number(cashback);

    if (!cashback && !defaultLoyaltyRatio) {
      return null;
    }

    if (!Number.isNaN(cashbackNumber) && cashbackNumber) {
      return (
        <CurrencyNumber
          className="loyalty-claim__money-currency padding-left-right-small text-size-large"
          money={cashback}
        />
      );
    }

    return (
      <span className="loyalty-claim__money-currency padding-left-right-small text-size-large">
        {t('CashbackPercentage', { percentage })}
      </span>
    );
  }

  renderLocation() {
    const { cashbackInfo, businessInfo } = this.props;
    const { name, displayBusinessName } = businessInfo || {};
    const { store } = cashbackInfo || {};
    const { city } = store || {};
    const addressInfo = [displayBusinessName || name, city].filter(v => v);

    return (
      <div className="margin-top-bottom-normal">
        <IconLocation className="icon icon__default icon__small text-middle" />
        <span className="loyalty-claim__location margin-left-right-smallest text-size-big text-opacity text-middle">
          {addressInfo.join(', ')}
        </span>
      </div>
    );
  }

  render() {
    const { onlineStoreInfo, businessInfo, t, isUserLogin } = this.props;
    const { logo } = onlineStoreInfo || {};
    const { name, displayBusinessName } = businessInfo || {};

    if (isUserLogin) {
      return (
        <div className="loading-cover">
          <i className="loader theme full-page" />
        </div>
      );
    }

    return (
      <>
        {isWebview() && <NativeHeader />}
        <section className="loyalty-claim__container flex flex-column" data-test-id="cashback.claim.container">
          <article className="text-center margin-top-bottom-normal">
            {logo ? (
              <Image
                className="loyalty-claim__logo logo logo__big margin-top-bottom-normal"
                src={logo}
                alt={displayBusinessName || name}
              />
            ) : null}
            <h5 className="loyalty-claim__title padding-top-bottom-small text-uppercase">{t('EarnCashbackNow')}</h5>
            {this.renderCashback()}

            {this.renderLocation()}
          </article>
        </section>
      </>
    );
  }
}

PageClaim.propTypes = {
  isFetching: PropTypes.bool,
  isUserLogin: PropTypes.bool,
  userCustomerId: PropTypes.string,
  receiptNumber: PropTypes.string,
  appActions: PropTypes.shape({
    setLoginPrompt: PropTypes.func,
    setMessageInfo: PropTypes.func,
  }),
  claimActions: PropTypes.shape({
    getCashbackInfo: PropTypes.func,
    createCashbackInfo: PropTypes.func,
    getCashbackReceiptNumber: PropTypes.func,
  }),
  /* eslint-disable react/forbid-prop-types */
  cashbackInfo: PropTypes.object,
  businessInfo: PropTypes.object,
  onlineStoreInfo: PropTypes.object,
  /* eslint-disable */
};

PageClaim.defaultProps = {
  isFetching: false,
  isUserLogin: false,
  userCustomerId: '',
  receiptNumber: '',
  appActions: {
    setLoginPrompt: () => {},
    setMessageInfo: () => {},
  },
  claimActions: {
    getCashbackInfo: () => {},
    createCashbackInfo: () => {},
    getCashbackReceiptNumber: () => {},
  },
  cashbackInfo: {},
  businessInfo: {},
  onlineStoreInfo: {},
};

PageClaim.displayName = 'PageClaim';

export default compose(
  withTranslation(['Cashback']),
  connect(
    state => ({
      isUserLogin: getIsUserLogin(state),
      userCustomerId: getUserCustomerId(state),
      businessInfo: getBusinessInfo(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
      cashbackInfo: getCashbackInfo(state),
      receiptNumber: getReceiptNumber(state),
      isFetching: isFetchingCashbackInfo(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      claimActions: bindActionCreators(claimActionCreators, dispatch),
    })
  )
)(PageClaim);
