import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Query } from 'react-apollo';
import qs from 'qs';
import Message from './components/Message';
import { sendMessage, setOnlineStoreInfo, setCustomerId } from '../actions';
import Image from './components/Image';
import CurrencyNumber from './components/CurrencyNumber';
import LoyaltyView from './components/LoyaltyView';
import theImage from '../images/cash-back-bg-temp.png';
import apiGql from '../../apiGql';
import config from '../../config';

class PageLoyalty extends React.Component {
  state = {  }

  componentWillMount() {
    console.log('will mount');
    const { history, setCustomerId } = this.props;
    const { customerId = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    console.log('customerId', customerId);
    setCustomerId({ customerId });
  }

  renderMain() {
    const { onlineStoreInfo, cashbackHistory } = this.props;

    return (
      <main className="loyalty flex-column" style={{
        backgroundImage: `url(${theImage})`,
      }}>
        <Message />
        <section className="loyalty__home text-center">
          {
            onlineStoreInfo ? (
              <Image className="logo-default__image-container" src={onlineStoreInfo.logo} alt={onlineStoreInfo.storeName} />
            ) : null
          }
          <h5 className="logo-default__title">CASHBACK EARNED</h5>
          {
            cashbackHistory.totalCredits ? (
              <CurrencyNumber classList="loyalty__money" money={cashbackHistory.totalCredits} />
            ) : null
          }
        </section>
        <LoyaltyView />
      </main>
    );
  }

  render() {
    return (
      <Query
        query={apiGql.GET_ONLINE_STORE_INFO}
        variables={{ business: config.business }}
        onCompleted={({ onlineStoreInfo }) => this.props.setOnlineStoreInfo(onlineStoreInfo)}>
          {this.renderMain.bind(this)}
      </Query>
    );
  }
}

const mapStateToProps = state => ({
  onlineStoreInfo: state.common.onlineStoreInfo,
  cashbackHistory: state.user.cashbackHistory,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setCustomerId,
  setOnlineStoreInfo,
  sendMessage,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PageLoyalty);