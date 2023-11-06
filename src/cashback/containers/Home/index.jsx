import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { isWebview, isTNGMiniProgram } from '../../../common/utils';
import { closeWebView, goBack } from '../../../utils/native-methods';
import Image from '../../../components/Image';
import RedeemInfo from '../../components/RedeemInfo';
import { IconInfo } from '../../../components/Icons';
import ReceiptList from './components/ReceiptList';
import CurrencyNumber from '../../components/CurrencyNumber';
import DownloadBanner from '../../../components/DownloadBanner';
import NativeHeader from '../../../components/NativeHeader';
import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getBusinessInfo,
  getTotalCredits,
} from '../../redux/modules/app';
import './LoyaltyHome.scss';

const cashbackDownloadLink = 'https://dl.beepit.com/ocNj';
const cashbackDownloadText = 'Download the Beep app to keep track of your cashback!';
class PageLoyalty extends React.Component {
  async componentDidMount() {
    const { appActions } = this.props;
    await appActions.setCashbackMessage();
    appActions.showMessageInfo();
  }

  renderLocation() {
    const { businessInfo } = this.props;
    const { displayBusinessName, name } = businessInfo || {};
    return (
      <div className="margin-top-bottom-normal">
        <span className="loyalty-home__location margin-left-right-small text-size-big text-opacity text-middle">
          {displayBusinessName || name}
        </span>
      </div>
    );
  }

  renderCashback() {
    const { history, totalCredits } = this.props;

    return (
      <div>
        <CurrencyNumber
          className="loyalty-home__money-currency padding-left-right-small text-size-large"
          money={totalCredits || 0}
        />
        <span
          role="button"
          tabIndex="0"
          onClick={() => {
            history.push({ pathname: '/activities', search: window.location.search });
          }}
          data-test-id="cashback.home.cashback-info"
        >
          <IconInfo className="icon icon__default" />
        </span>
      </div>
    );
  }

  render() {
    const { history, businessInfo, onlineStoreInfo, t } = this.props;
    const { displayBusinessName, name } = businessInfo || {};
    const { logo } = onlineStoreInfo || {};
    const hideDownloadBanner = isWebview() || isTNGMiniProgram();

    return (
      <>
        {isWebview() && (
          <NativeHeader
            navFunc={() => {
              closeWebView();
            }}
          />
        )}
        <section className="loyalty-home__container flex flex-column" data-test-id="cashback.home.container">
          <article className="loyalty-home__article text-center margin-top-bottom-normal">
            {logo ? (
              <Image
                className="loyalty-home__logo logo logo__big margin-top-bottom-normal"
                src={logo}
                alt={displayBusinessName || name}
              />
            ) : null}
            <h5 className="loyalty-home__title padding-top-bottom-small text-uppercase">{t('TotalCashback')}</h5>

            {this.renderCashback()}

            {this.renderLocation()}
            <RedeemInfo
              buttonClassName="redeem-info__button-link button border-radius-base text-uppercase"
              buttonText={t('HowToUseCashback')}
            />
          </article>
          {!hideDownloadBanner && <DownloadBanner link={cashbackDownloadLink} text={cashbackDownloadText} />}
          <ReceiptList history={history} />
        </section>
      </>
    );
  }
}

PageLoyalty.displayName = 'PageLoyalty';

PageLoyalty.propTypes = {
  businessInfo: PropTypes.shape({
    displayBusinessName: PropTypes.string,
    name: PropTypes.string,
  }),
  onlineStoreInfo: PropTypes.shape({
    logo: PropTypes.string,
  }),
  totalCredits: PropTypes.number,
  appActions: PropTypes.shape({
    showMessageInfo: PropTypes.func,
    setCashbackMessage: PropTypes.func,
  }),
};

PageLoyalty.defaultProps = {
  businessInfo: {
    displayBusinessName: '',
    name: '',
  },
  onlineStoreInfo: {
    logo: '',
  },
  totalCredits: 0,
  appActions: {
    showMessageInfo: () => {},
    setCashbackMessage: () => {},
  },
};

export default compose(
  withTranslation(['Cashback']),
  connect(
    state => ({
      businessInfo: getBusinessInfo(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
      totalCredits: getTotalCredits(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(PageLoyalty);
