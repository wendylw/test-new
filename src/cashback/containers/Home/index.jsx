import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { Info } from 'phosphor-react';
import { closeWebView } from '../../../utils/native-methods';
import { getIsUserLogin as getIsAppUserLogin } from '../../redux/modules/app';
import { actions as commonActionsCreators } from '../../redux/modules/common';
import { getIsLogin, getConsumerId } from '../../../redux/modules/user/selectors';
import {
  initUserInfo as initUserInfoThunk,
  loginUserByBeepApp as loginUserByBeepAppThunk,
  loginUserByAlipayMiniProgram as loginUserByAlipayMiniProgramThunk,
} from '../../../redux/modules/user/thunks';
import {
  getMerchantBusiness,
  getMerchantDisplayName,
  getMerchantLogo,
} from '../../../redux/modules/merchant/selectors';
import { fetchMerchantInfo as fetchMerchantInfoThunk } from '../../../redux/modules/merchant/thunks';
import { getIsWebview, getIsAlipayMiniProgram } from '../../redux/modules/common/selectors';
import { getCustomerCashbackPrice } from '../../redux/modules/customer/selectors';
import { loadConsumerCustomerInfo as loadConsumerCustomerInfoThunk } from '../../redux/modules/customer/thunks';
import { getIsDownloadBannerShown } from './redux/selectors';
import Image from '../../../components/Image';
import RedeemInfo from '../../components/RedeemInfo';
import DownloadBanner from '../../../common/components/DownloadBanner';
import ReceiptList from './components/ReceiptList';
import NativeHeader from '../../../components/NativeHeader';
import './LoyaltyHome.scss';

const cashbackDownloadLink = 'https://dl.beepit.com/ocNj';
const cashbackDownloadText = 'Download the Beep app to keep track of your cashback!';
class PageLoyalty extends React.Component {
  async componentDidMount() {
    const {
      commonActions,
      merchantBusiness,
      isWebview,
      isAlipayMiniProgram,
      fetchMerchantInfo,
      initUserInfo,
      loginUserByBeepApp,
      loginUserByAlipayMiniProgram,
      loadConsumerCustomerInfo,
    } = this.props;
    fetchMerchantInfo(merchantBusiness);

    await initUserInfo();

    if (isWebview) {
      await loginUserByBeepApp();
    }

    if (isAlipayMiniProgram) {
      await loginUserByAlipayMiniProgram();
    }

    const { isLogin, consumerId } = this.props;

    if (isLogin) {
      commonActions.messageInfoShow();
      loadConsumerCustomerInfo(consumerId);
    }
  }

  componentDidUpdate(prevProps) {
    const { isLogin, isAppUserLogin, consumerId, commonActions, initUserInfo, loadConsumerCustomerInfo } = this.props;
    const { isLogin: prevIsLogin, isAppUserLogin: prevIsAppUserLogin } = prevProps;

    if (isAppUserLogin !== prevIsAppUserLogin && isAppUserLogin) {
      initUserInfo();
    }

    if (isLogin !== prevIsLogin && isLogin) {
      commonActions.messageInfoShow();
      loadConsumerCustomerInfo(consumerId);
    }
  }

  render() {
    const {
      history,
      t,
      merchantLogo,
      merchantDisplayName,
      customerCashbackPrice,
      isWebview,
      isDownloadBannerShown,
    } = this.props;

    return (
      <>
        {isWebview && (
          <NativeHeader
            navFunc={() => {
              closeWebView();
            }}
          />
        )}
        <section className="loyalty-home__container flex flex-column" data-test-id="cashback.home.container">
          <article className="loyalty-home__article text-center margin-top-bottom-normal">
            {merchantLogo ? (
              <Image
                className="loyalty-home__logo logo logo__big margin-top-bottom-normal"
                src={merchantLogo}
                alt={merchantDisplayName}
              />
            ) : null}
            <h5 className="loyalty-home__title padding-top-bottom-small text-uppercase">{t('TotalCashback')}</h5>

            <div>
              <data className="loyalty-home__cashback-value text-size-large" value={customerCashbackPrice}>
                {customerCashbackPrice}
              </data>
              <button
                tabIndex="0"
                className="loyalty-home__cashback-history-icon-button"
                onClick={() => {
                  history.push({ pathname: '/activities', search: window.location.search });
                }}
                data-test-id="cashback.home.cashback-info"
              >
                <Info size={24} weight="fill" />
              </button>
            </div>

            <div className="margin-top-bottom-normal">
              <span className="loyalty-home__location margin-left-right-small text-size-big text-opacity text-middle">
                {merchantDisplayName}
              </span>
            </div>
            <RedeemInfo
              buttonClassName="redeem-info__button-link button border-radius-base text-uppercase"
              buttonText={t('HowToUseCashback')}
            />
          </article>
          {isDownloadBannerShown && (
            <div className="margin-left-right-small margin-top-bottom-small">
              <DownloadBanner link={cashbackDownloadLink} text={cashbackDownloadText} />
            </div>
          )}
          <ReceiptList history={history} />
        </section>
      </>
    );
  }
}

PageLoyalty.displayName = 'PageLoyalty';

PageLoyalty.propTypes = {
  isLogin: PropTypes.bool,
  isAppUserLogin: PropTypes.bool,
  isWebview: PropTypes.bool,
  isAlipayMiniProgram: PropTypes.bool,
  consumerId: PropTypes.string,
  merchantBusiness: PropTypes.string,
  merchantLogo: PropTypes.string,
  merchantDisplayName: PropTypes.string,
  customerCashbackPrice: PropTypes.string,
  isDownloadBannerShown: PropTypes.bool,
  commonActions: PropTypes.shape({
    messageInfoShow: PropTypes.func,
  }),
  fetchMerchantInfo: PropTypes.func,
  initUserInfo: PropTypes.func,
  loginUserByBeepApp: PropTypes.func,
  loginUserByAlipayMiniProgram: PropTypes.func,
  loadConsumerCustomerInfo: PropTypes.func,
};

PageLoyalty.defaultProps = {
  isLogin: false,
  isAppUserLogin: false,
  isWebview: false,
  isAlipayMiniProgram: false,
  consumerId: '',
  merchantBusiness: null,
  merchantLogo: null,
  merchantDisplayName: '',
  customerCashbackPrice: null,
  isDownloadBannerShown: false,
  commonActions: {
    messageInfoShow: () => {},
  },
  fetchMerchantInfo: () => {},
  initUserInfo: () => {},
  loginUserByBeepApp: () => {},
  loginUserByAlipayMiniProgram: () => {},
  loadConsumerCustomerInfo: () => {},
};

export default compose(
  withTranslation(['Cashback']),
  connect(
    state => ({
      isLogin: getIsLogin(state),
      isAppUserLogin: getIsAppUserLogin(state),
      isWebview: getIsWebview(state),
      isAlipayMiniProgram: getIsAlipayMiniProgram(state),
      consumerId: getConsumerId(state),
      merchantBusiness: getMerchantBusiness(state),
      merchantLogo: getMerchantLogo(state),
      merchantDisplayName: getMerchantDisplayName(state),
      customerCashbackPrice: getCustomerCashbackPrice(state),
      isDownloadBannerShown: getIsDownloadBannerShown(state),
    }),
    dispatch => ({
      commonActions: bindActionCreators(commonActionsCreators, dispatch),
      fetchMerchantInfo: bindActionCreators(fetchMerchantInfoThunk, dispatch),
      initUserInfo: bindActionCreators(initUserInfoThunk, dispatch),
      loginUserByBeepApp: bindActionCreators(loginUserByBeepAppThunk, dispatch),
      loginUserByAlipayMiniProgram: bindActionCreators(loginUserByAlipayMiniProgramThunk, dispatch),
      loadConsumerCustomerInfo: bindActionCreators(loadConsumerCustomerInfoThunk, dispatch),
    })
  )
)(PageLoyalty);
