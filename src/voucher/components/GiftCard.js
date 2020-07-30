import React, { Components } from 'react';

class GiftCard extends Components {
  render() {
    const { storeLogo, storeName, amount, currencySymbol } = this.props;
    return (
      <div className="voucher-gift-card">
        <div className="gift-card__store-logo">
          {storeLogo ? <img alt={`${storeName} Logo`} src={storeLogo} /> : null}
        </div>
        <div className="gift-card__amount">{`${currencySymbol}${amount}`}</div>
        <div className="gift-card__store-name">{storeName}</div>
      </div>
    );
  }
}

export default GiftCard;
