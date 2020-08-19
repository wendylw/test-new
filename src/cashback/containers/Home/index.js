import React from 'react';

import Image from '../../../components/Image';
import RedeemInfo from '../../components/RedeemInfo';
import { IconInfo } from '../../../components/Icons';
import ReceiptList from './components/ReceiptList';
import RecentActivities from './components/RecentActivities';
import CurrencyNumber from '../../components/CurrencyNumber';

import qs from 'qs';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { actions as appActionCreators, getOnlineStoreInfo, getBusinessInfo } from '../../redux/modules/app';
import { actions as homeActionCreators, getCashbackHistorySummary } from '../../redux/modules/home';
import './LoyaltyHome.scss';

class PageLoyalty extends React.Component {
  state = {
    showModal: false,
    showRecentActivities: false,
  };

  async componentDidMount() {
    const { history, appActions, homeActions } = this.props;
    const { customerId = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    await homeActions.setCustomerId(customerId);
    await appActions.setCashbackMessage();
    appActions.showMessageInfo();
  }

  renderLocation() {
    const { businessInfo } = this.props;
    const { displayBusinessName, name } = businessInfo || {};
    return (
      <div className="margin-top-bottom-normal">
        <span className="loyalty-home__location margin-left-right-smaller text-size-big text-opacity text-middle">
          {displayBusinessName || name}
        </span>
      </div>
    );
  }

  showRecentActivities() {
    this.setState({ showRecentActivities: true });
  }

  closeActivity() {
    this.setState({ showRecentActivities: false });
  }

  renderCashback() {
    const { cashbackHistorySummary } = this.props;
    const { totalCredits } = cashbackHistorySummary || {};

    return (
      <div>
        <CurrencyNumber
          className="loyalty-home__money-currency padding-left-right-small text-size-large"
          money={totalCredits || 0}
        />
        <span onClick={this.showRecentActivities.bind(this)} data-heap-name="cashback.home.cashback-info">
          <IconInfo className="icon icon__default" />
        </span>
      </div>
    );
  }

  render() {
    const { history, businessInfo, onlineStoreInfo, t } = this.props;
    const { displayBusinessName, name } = businessInfo || {};
    const { logo } = onlineStoreInfo || {};
    const { showRecentActivities } = this.state;
    const { customerId = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    return !showRecentActivities ? (
      <section className="loyalty-home__container flex flex-column" data-heap-name="cashback.home.container">
        <article className="text-center">
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
            className="redeem__button-container"
            buttonClassName="button redeem__button button__block border-radius-base text-uppercase"
            buttonText={t('HowToUseCashback')}
          />
        </article>
        <ReceiptList history={history} />
      </section>
    ) : (
      <RecentActivities history={history} customerId={customerId} closeActivity={this.closeActivity.bind(this)} />
    );
  }
}

export default compose(
  withTranslation(['Cashback']),
  connect(
    state => ({
      businessInfo: getBusinessInfo(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
      cashbackHistorySummary: getCashbackHistorySummary(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      homeActions: bindActionCreators(homeActionCreators, dispatch),
    })
  )
)(PageLoyalty);
