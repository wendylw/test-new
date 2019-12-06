import React from 'react';

import Image from '../../../components/Image';
import RedeemInfo from '../../components/RedeemInfo';
import { IconInfo } from '../../../components/Icons';
import ReceiptList from './components/ReceiptList';
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
    showRecentActivities: false
  }

  async componentWillMount() {
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

  showRecentActivities() {
    this.setState({showRecentActivities:true})
  }

  closeActivity() {
    this.setState({showRecentActivities:false});
  }

  render() {
    const {
      history,
      businessInfo,
      onlineStoreInfo,
      cashbackHistorySummary,
    } = this.props;
    const {
      displayBusinessName,
      name,
    } = businessInfo || {};
    const { logo } = onlineStoreInfo || {};
    const { totalCredits } = cashbackHistorySummary || {};
    const { showRecentActivities } = this.state;
    const { customerId = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    return (
      !showRecentActivities ? (
      <section className="loyalty__home">
        <div className="loyalty__content text-center">
          {
            logo ? (
              <Image className="logo-default__image-container" src={logo} alt={displayBusinessName || name} />
            ) : null
          }
          <h5 className="logo-default__title text-uppercase">Total cashback</h5>
          <div className="loyalty__money-info">
            <CurrencyNumber className="loyalty__money" money={totalCredits || 0} />
            <span onClick={this.showRecentActivities.bind(this)}>
              <IconInfo/>
            </span>
          </div>
          {this.renderLocation()}
          <RedeemInfo className="redeem__button-container" buttonClassName="redeem__button button__block button__block-link border-radius-base text-uppercase" buttonText="How to use Cashback?" />
        </div>
        <ReceiptList history={history}/>
      </section>
      ):(
        <RecentActivities history={history} customerId={customerId} closeActivity={this.closeActivity.bind(this)}/>
      )
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
