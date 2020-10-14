import React, { Component } from 'react';
import Image from '../../components/Image';
import './VoucherGiftCard.scss';

class VoucherGiftCard extends Component {
  render() {
    const { onlineStoreLogo, storeName, selectedVoucher, currencySymbol } = this.props;

    return (
      <div className="voucher-gift-card">
        {onlineStoreLogo ? (
          <Image
            className="voucher-gift-card__logo logo logo__normal margin-top-bottom-small margin-left-right-normal"
            src={onlineStoreLogo}
            alt={`${storeName} Logo`}
          />
        ) : null}
        {selectedVoucher ? (
          <span className="voucher-gift-card__price margin-normal text-size-huge text-weight-bolder">
            {currencySymbol}
            {selectedVoucher}
          </span>
        ) : null}

        <span className="voucher-gift-card__name margin-normal text-omit__multiple-line">{storeName}</span>
      </div>
    );
  }
}

export default VoucherGiftCard;
