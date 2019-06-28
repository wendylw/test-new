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
import apiGql from '../../apiGql';
import config from '../../config';
import RedeemButton from './components/RedeemButton';

class PageLoyalty extends React.Component {
  state = {}

  componentWillMount() {
    const { history, setCustomerId } = this.props;
    const { customerId = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    setCustomerId({ customerId });
  }

  renderMain() {
    const { onlineStoreInfo, cashbackHistory } = this.props;

    return (
      <main className="loyalty flex-column">
        <Message />
        <section className="loyalty__home text-center">
          {
            onlineStoreInfo ? (
              <Image className="logo-default__image-container" src={onlineStoreInfo.logo} alt={onlineStoreInfo.storeName} />
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

  render() {
    const { cashbackHistory } = this.props;

    return (
      <Query
        query={apiGql.GET_ONLINE_STORE_INFO}
        variables={{ business: config.business }}
      >
        {({ data: { onlineStoreInfo = {} } = {} }) => {
          console.log(cashbackHistory);

          return (
            <main className="loyalty flex-column">
              <Message />
              <section className="loyalty__home text-center">
                {
                  onlineStoreInfo ? (
                    <Image className="logo-default__image-container" src={onlineStoreInfo.logo} alt={onlineStoreInfo.storeName} />
                  ) : null
                }
                <h5 className="logo-default__title text-uppercase">Total cashback</h5>
                <CurrencyNumber classList="loyalty__money" money={cashbackHistory.totalCredits || 0} />
                <RedeemButton />
              </section>
              <LoyaltyView />
            </main>
          );
        }}
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
