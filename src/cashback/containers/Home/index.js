import React from 'react';

import Image from '../../../components/Image';
import Header from '../../../components/Header';
import RedeemInfo from '../../components/RedeemInfo';
import { IconInfo } from '../../../components/Icons';
import RecentActivities from './components/RecentActivities';
import CurrencyNumber from '../../components/CurrencyNumber';

import qs from 'qs';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActions, getOnlineStoreInfo, getBusinessInfo } from '../../redux/modules/app';
import { actions as homeActions, getCashbackHistorySummary } from '../../redux/modules/home';


class PageLoyalty extends React.Component {
  state = {
    showModal: false,
  }

  async componentDidMount() {
    const {
      history,
      appActions,
      homeActions,
    } = this.props;
    const { customerId = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    await homeActions.setCustomerId(customerId);
    await appActions.setCashbackMessage();
    appActions.showMessageInfo();
  }

  renderLocation() {
    const { 
      businessInfo,
    } = this.props;
    const {
      displayBusinessName,
      name
    } = businessInfo || {};
    return  (
      <div className="location">
        <span className="location__text gray-font-opacity text-middle">{displayBusinessName||name}</span>
      </div>
    );
  }

  render() {
    const {
      business,
      onlineStoreInfo,
      cashbackHistorySummary,
    } = this.props;
    const {
      displayBusinessName,
      name,
    } = business || {};
    const { logo } = onlineStoreInfo || {};
    const { totalCredits } = cashbackHistorySummary || {};

    return (
      <section className="loyalty__home">
        <Header
          className="transparent has-right"
          isPage={true}
          navFunc={() => { }}
        />
        <div className="loyalty__content text-center">
          {
            logo ? (
              <Image className="logo-default__image-container" src={logo} alt={displayBusinessName || name} />
            ) : null
          }
          <h5 className="logo-default__title text-uppercase">Total cashback</h5>
          <div className="loyalty__money-info">
            <CurrencyNumber className="loyalty__money" money={totalCredits || 0} />
          </div>
          {this.renderLocation()}
          <RedeemInfo className="redeem__button-container" buttonClassName="redeem__button button__block button__block-link border-radius-base text-uppercase" buttonText="How to use Cashback?" />
        </div>
        <RecentActivities />
      </section>
    );
  }
}

export default connect(
  (state) => ({
    businessInfo: getBusinessInfo(state),
    onlineStoreInfo: getOnlineStoreInfo(state),
    cashbackHistorySummary: getCashbackHistorySummary(state)
  }),
  (dispatch) => ({
    appActions: bindActionCreators(appActions, dispatch),
    homeActions: bindActionCreators(homeActions, dispatch),
  })
)(PageLoyalty);
