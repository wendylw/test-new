import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Message from './components/Message';
import { sendMessage } from '../actions';
import Image from './components/Image';
import CurrencyNumber from './components/CurrencyNumber';
import LoyaltyView from './components/LoyaltyView';
import theImage from '../images/cash-back-bg-temp.png';

class PageLoyalty extends React.Component {
  state = {  }

  render() {
    const { storeInfo = {}, user } = this.props;

    return (
      <main className="loyalty flex-column" style={{
        backgroundImage: `url(${theImage})`,
      }}>
        <Message />
        <section className="loyalty__home text-center">
          <Image className="logo-default__image-container" src={storeInfo.logo} alt={storeInfo.storeName} />
          <h5 className="logo-default__title">CASHBACK EARNED</h5>
          {
            user.loyalty ? (
              <CurrencyNumber classList="loyalty__money" money={user.loyalty.currentBalance} />
            ) : null
          }
        </section>
        <LoyaltyView />
      </main>
    );
  }
}

const mapStateToProps = state => ({
  storeInfo: state.home.storeInfo,
  user: state.user,
  loyalty: state.loyalty,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  sendMessage,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PageLoyalty);
