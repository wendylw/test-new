import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CurrencyNumber from './CurrencyNumber';
import Image from './Image';

class HomeBody extends React.Component {
  componentDidMount() {
  }

  renderCashback() {
    const { cashback, defaultLoyaltyRatio } = this.props;
    let percentage = defaultLoyaltyRatio ? Math.floor((1 * 100) / defaultLoyaltyRatio) : 5;
    const cashbackNumber = Number(cashback);

    if (!cashback && !defaultLoyaltyRatio) {
      return null;
    }

    if (!isNaN(cashbackNumber) && cashbackNumber) {
      return <CurrencyNumber classList="cash-back__money" money={cashback} />;
    }

    return <span className="cash-back__money">{`${percentage}% Cashback`}</span>;
  }

  render() {
    const { storeName = '', street = '' } = this.props;
    const addressInfo = [storeName, street].filter(v => v);

    console.log(this.props);

    return (
      <section className="cash-back__home text-center">
        <Image className="logo-default__image-container" src={this.props.logo} alt={this.props.storeName} />
        <h5 className="logo-default__title text-uppercase">Earn cashback now</h5>
        {this.renderCashback()}
        <div className="location">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            <path d="M0 0h24v24H0z" fill="none"/>
          </svg>
          <span className="location__text text-middle">
            {addressInfo.join(', ')}
          </span>
        </div>
      </section>
    );
  }
}

const mapStateToProps = (state) => {
  const onlineStoreInfo = state.common.onlineStoreInfo || {};

  return {
    cashback: state.common.cashback,
    defaultLoyaltyRatio: state.common.defaultLoyaltyRatio,
    logo: onlineStoreInfo.logo,
    storeName: onlineStoreInfo.storeName,
    street: onlineStoreInfo.street,
  };
};
const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(HomeBody);
