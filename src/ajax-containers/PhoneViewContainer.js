import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import qs from 'qs';
import Utils from '../libs/utils';
import GlobalConstants from '../Constants';
import api from '../cashback/utils/api';
import Constants from '../cashback/utils/Constants';
import PhoneView from '../components/PhoneView';
import CurrencyNumber from '../components/CurrencyNumber';

const ORDER_CAN_CLAIM = 'Can_Claim';
const ANIMATION_TIME = 3600;
const CLAIMED_ANIMATION_GIF = '/img/succeed-animation.gif';

class PhoneViewContainer extends React.Component {
  animationSetTimeout = null;

  state = {
    cashbackInfoResponse: {},
    phone: Utils.getPhoneNumber(),
    isSavingPhone: false,
    redirectURL: null,
    firstClaimedCashback: true,
    claimedAnimationGifSrc: null
  }

  componentDidMount() {
    this.setState({
      claimedAnimationGifSrc: CLAIMED_ANIMATION_GIF
    });
  }

  componentWillMount() {
    this.handleCashbackAjax('get');
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.firstClaimedCashback && nextState.redirectURL) {
      this.animationSetTimeout = setTimeout(() => {
        this.setState({ firstClaimedCashback: false });

        clearTimeout(this.animationSetTimeout);
      }, ANIMATION_TIME);
    }
  }

  async handleCashbackAjax(method) {
    const { history } = this.props;
    const { phone } = this.state;
    const { receiptNumber = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    let options = {
      url: `${Constants.api.CASHBACK}${method === 'get' ? `?receiptNumber=${receiptNumber}&source=${GlobalConstants.CASHBACK_SOURCE.QR_ORDERING}` : ''}`,
      method,
    };

    if (method === 'post') {
      options = Object.assign({}, options, {
        data: {
          phone,
          receiptNumber,
          source: GlobalConstants.CASHBACK_SOURCE.QR_ORDERING
        }
      });

      Utils.setPhoneNumber(phone);
    }

    const { data } = await api(options);
    let {
      cashbackInfoResponse,
      firstClaimedCashback,
    } = this.state;
    let redirectURL = null;

    if (method === 'get' && data && data.status !== ORDER_CAN_CLAIM) {
      firstClaimedCashback = false;
      this.handleCashbackAjax('post');
    }

    if (method === 'post') {
      const { customerId } = data || {};

      redirectURL = `${GlobalConstants.ROUTER_PATHS.CASHBACK_HOME}?customerId=${customerId}`;
    }

    this.setState({
      cashbackInfoResponse: Object.assign({},
        cashbackInfoResponse,
        data,
      ),
      firstClaimedCashback,
      isSavingPhone: false,
      redirectURL,
    });
  }

  handleUpdatePhoneNumber(phone) {
    this.setState({ phone });
  }

  renderCurrencyNumber() {
    const {
      onlineStoreInfo: {
        locale,
        currency,
      }
    } = this.props;
    const {
      cashbackInfoResponse: {
        cashback,
      },
    } = this.state;

    if (!cashback) {
      return null;
    }

    return (
      <CurrencyNumber
        locale={locale}
        currency={currency}
        classList="font-weight-bold"
        money={Math.abs(cashback || 0)}
      />
    );
  }

  renderPhoneView() {
    const {
      onlineStoreInfo: {
        country,
      },
    } = this.props;
    const {
      isSavingPhone,
      redirectURL,
      phone,
      cashbackInfoResponse: {
        status,
      },
    } = this.state;

    if (status !== ORDER_CAN_CLAIM) {
      return redirectURL
        ? (
          <Link
            className="button__fill link__non-underline link__block border-radius-base font-weight-bold text-uppercase"
            to={redirectURL}
            target="_blank"
          >Check My Balance</Link>
        )
        : null;
    }

    return (
      <PhoneView
        phone={phone}
        country={country}
        setPhone={this.handleUpdatePhoneNumber.bind(this)}
        submitPhoneNumber={this.handleCashbackAjax.bind(this, 'post')}
        isLoading={isSavingPhone}
        buttonText="Continue"
      />
    );
  }

  render() {
    const {
      onlineStoreInfo: {
        country,
      }
    } = this.props;
    const {
      cashbackInfoResponse: {
        cashback,
        status,
      },
      claimedAnimationGifSrc,
      firstClaimedCashback,
      redirectURL,
    } = this.state;

    if (!country || !cashback) {
      return null;
    }

    return (
      <div className={`thanks__phone-view ${firstClaimedCashback && redirectURL ? 'active' : ''}`}>
        {
          status !== ORDER_CAN_CLAIM
            ? (
              <label className="phone-view-form__label text-center">
                You’ve earned {this.renderCurrencyNumber()} Cashback!
							</label>
            )
            : (
              <label className="phone-view-form__label text-center">
                Earn {this.renderCurrencyNumber()} Cashback with Your Mobile Number
							</label>
            )
        }
        {this.renderPhoneView()}
        <div className="thanks__suceed-animation">
          <img src={claimedAnimationGifSrc} alt="Beep Claimed" />
        </div>
      </div>
    );
  }
}

PhoneView.propTypes = {
  onlineStoreInfo: PropTypes.object,
};

PhoneView.defaultProps = {
  onlineStoreInfo: {},
};

export default withRouter(PhoneViewContainer);