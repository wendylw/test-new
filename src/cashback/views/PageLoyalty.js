import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import qs from 'qs';
import Message from './components/Message';
import { sendMessage, setCustomerId } from '../actions';
import Image from './components/Image';
import CurrencyNumber from './components/CurrencyNumber';
import LoyaltyView from './components/LoyaltyView';
import RedeemButton from './components/RedeemButton';

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
    const { displayBusinessName, name } = business;

    return (
      <main className="loyalty flex-column">
        <Message />
        <section className="loyalty__home text-center">
          {
            onlineStoreInfo ? (
              <Image className="logo-default__image-container" src={onlineStoreInfo.logo} alt={displayBusinessName || name} />
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
