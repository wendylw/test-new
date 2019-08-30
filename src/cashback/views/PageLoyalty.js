import React from 'react';
import qs from 'qs';

import Image from './components/Image';
import Message from './components/Message';
import LoyaltyView from './components/LoyaltyView';
import RedeemButton from './components/RedeemButton';
import CurrencyNumber from './components/CurrencyNumber';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { sendMessage, setCustomerId } from '../actions';

class PageLoyalty extends React.Component {
  state = {}

  componentWillMount() {
    const {
      history,
      setCustomerId,
    } = this.props;
    const { customerId = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    setCustomerId({ customerId });
  }

  render() {
    const {
      business,
      onlineStoreInfo,
      cashbackHistory,
    } = this.props;
    const { logo } = onlineStoreInfo || {};
    const { displayBusinessName, name } = business || {};

    return (
      <main className="loyalty flex-column">
        <Message />
        <section className="loyalty__home text-center">
          {
            logo ? (
              <Image className="logo-default__image-container" src={logo} alt={displayBusinessName || name} />
            ) : null
          }
          <h5 className="logo-default__title text-uppercase">Total cashback</h5>
          <CurrencyNumber classList="loyalty__money" money={cashbackHistory.totalCredits || 0} />
          <RedeemButton />
        </section>
        <LoyaltyView />
      </main>
    );
  }
}

const mapStateToProps = state => ({
  business: state.common.business,
  cashbackHistory: state.user.cashbackHistory,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setCustomerId,
  sendMessage,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PageLoyalty);
