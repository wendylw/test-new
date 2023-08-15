import React from 'react';
import PropTypes from 'prop-types';
import Image from '../../components/Image';
import './VoucherGiftCard.scss';

const VoucherGiftCard = ({ onlineStoreLogo, storeName, selectedVoucher, currencySymbol }) => (
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

VoucherGiftCard.displayName = 'VoucherGiftCard';

VoucherGiftCard.propTypes = {
  onlineStoreLogo: PropTypes.string,
  storeName: PropTypes.string,
  selectedVoucher: PropTypes.number,
  currencySymbol: PropTypes.string,
};

VoucherGiftCard.defaultProps = {
  onlineStoreLogo: '',
  storeName: '',
  selectedVoucher: null,
  currencySymbol: '',
};

export default VoucherGiftCard;
