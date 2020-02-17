import React from 'react';
import qs from 'qs';
import CurrencyNumber from '../../components/CurrencyNumber';
import { IconPin } from '../../../components/Icons';
import Image from '../../../components/Image';

import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActionCreators, getBusinessInfo, getOnlineStoreInfo, getUser } from '../../redux/modules/app';
import { actions as claimActionCreators, getCashbackInfo, getReceiptNumber, isFetchingCashbackInfo } from '../../redux/modules/claim';

class PageClaim extends React.Component {
  state = {
    claimed: false,
  };

  setMessage(cashbackInfo) {
    const { appActions } = this.props;
    const { status } = cashbackInfo || {};

    appActions.setMessageInfo({ key: status });
  }

  async componentDidMount() {
    const {
      user,
      history,
      appActions,
      claimActions,
    } = this.props;
    const { isLogin } = user || {};
    const { h = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    appActions.setLoginPrompt('Claim with your mobile number');
    await claimActions.getCashbackReceiptNumber(encodeURIComponent(h));

    const { receiptNumber } = this.props;

    if (receiptNumber) {
      await claimActions.getCashbackInfo(receiptNumber);

      const { cashbackInfo } = this.props;
      const { loadedCashbackInfo, createdCashbackInfo } = cashbackInfo || {};

      if (isLogin && loadedCashbackInfo && !createdCashbackInfo) {
        this.handleCreateCustomerCashbackInfo();
      }
    }

    this.setMessage(this.props.cashbackInfo);
  }

  componentWillReceiveProps(nextProps) {
    const { cashbackInfo } = nextProps;
    const { status } = cashbackInfo || {};
    const { status: preCashbackInfo } = this.props.cashbackInfo || {};

    if (status !== preCashbackInfo) {
      this.setMessage(cashbackInfo);
    }
  }

  componentDidUpdate(prevProps) {
    const {
      isFetching,
      receiptNumber,
      user,
      cashbackInfo,
    } = this.props;
    const { claimed } = this.state;
    const { isLogin } = user || {};
    const { loadedCashbackInfo, createdCashbackInfo } = cashbackInfo || {};

    if (!isFetching
      && isLogin
      && receiptNumber
      && loadedCashbackInfo
      && !createdCashbackInfo
      && !claimed
    ) {
      this.handleCreateCustomerCashbackInfo();
    }
  }

  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    }
  }

  getOrderInfo() {
    const { receiptNumber } = this.props;

    return {
      phone: Utils.getLocalStorageVariable('user.p'),
      receiptNumber,
      source: Constants.CASHBACK_SOURCE.RECEIPT
    };
  }

  async handleCreateCustomerCashbackInfo() {
    const {
      user,
      history,
      claimActions,
    } = this.props;
    const { claimed } = this.state;
    const { isWebview } = user || {};

    if (!claimed) {
      await this.setState({ claimed: true });
      await claimActions.createCashbackInfo(this.getOrderInfo());

      const { cashbackInfo } = this.props;
      const { customerId } = cashbackInfo || {};

      if (isWebview) {
        this.handlePostLoyaltyPageMessage();
      } else {
        history.push({
          pathname: Constants.ROUTER_PATHS.CASHBACK_HOME,
          search: `?customerId=${this.props.user.customerId || customerId || ''}`
        });
      }
    }
  }

  handlePostLoyaltyPageMessage() {
    const { user } = this.props;
    const { isWebview } = user || {};

    if (isWebview) {
      window.ReactNativeWebView.postMessage('goToLoyaltyPage');
    }

    return;
  }

  renderCashback() {
    const { cashbackInfo } = this.props;
    const {
      cashback,
      defaultLoyaltyRatio,
    } = cashbackInfo || {};
    let percentage = defaultLoyaltyRatio ? Math.floor((1 * 100) / defaultLoyaltyRatio) : 5;
    const cashbackNumber = Number(cashback);

    if (!cashback && !defaultLoyaltyRatio) {
      return null;
    }

    if (!isNaN(cashbackNumber) && cashbackNumber) {
      return <CurrencyNumber className="loyalty__money" money={cashback} />;
    }

    return <span className="loyalty__money">{`${percentage}% Cashback`}</span>;
  }

  renderLocation() {
    const {
      cashbackInfo,
      businessInfo,
    } = this.props;
    const {
      name,
      displayBusinessName,
    } = businessInfo || {};
    const { store } = cashbackInfo || {};
    const { city } = store || {};
    const addressInfo = [displayBusinessName || name, city].filter(v => v);

    return (
      <div className="location">
        <IconPin />
        <span className="location__text gray-font-opacity text-middle">{addressInfo.join(', ')}</span>
      </div>
    );
  }

  render() {
    const {
      user,
      onlineStoreInfo,
      businessInfo,
    } = this.props;
    const { isLogin } = user;
    const { logo } = onlineStoreInfo || {};
    const {
      name,
      displayBusinessName,
    } = businessInfo || {};

    if (isLogin) {
      return <div className="loading-cover"><i className="loader theme page-loader"></i></div>;
    }

    return (
      <section className="loyalty__claim" style={{
        // backgroundImage: `url(${theImage})`,
      }}>
        <article className="loyalty__content text-center">
          {
            logo
              ? <Image className="logo-default__image-container" src={logo} alt={displayBusinessName || name} />
              : null
          }
          <h5 className="logo-default__title text-uppercase">Earn cashback now</h5>

          {this.renderCashback()}

          {this.renderLocation()}
        </article>
      </section>
    );
  }
}

export default connect(
  (state) => ({
    user: getUser(state),
    businessInfo: getBusinessInfo(state),
    onlineStoreInfo: getOnlineStoreInfo(state),
    cashbackInfo: getCashbackInfo(state),
    receiptNumber: getReceiptNumber(state),
    isFetching: isFetchingCashbackInfo(state),
  }),
  (dispatch) => ({
    appActions: bindActionCreators(appActionCreators, dispatch),
    claimActions: bindActionCreators(claimActionCreators, dispatch),
  })
)(PageClaim);
