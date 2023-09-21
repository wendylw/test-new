import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { withTranslation, Trans } from 'react-i18next';
import { IconVoucherTicket, IconChecked } from '../../../../../components/Icons';
import CurrencyNumber from '../../../../components/CurrencyNumber';

import { getPromoStatusLabelText } from '../../utils';
import { formatTimeToDateString } from '../../../../../utils/datetime-lib';
import Constants from '../../../../../utils/constants';

class PromoItem extends Component {
  getAmountOffPromoTitle = amount => {
    const { t } = this.props;
    return (
      <Trans
        t={t}
        i18nKey="PromoTitleAbsolute"
        components={[<CurrencyNumber money={amount} className="text-size-big text-weight-bolder" />]}
      />
    );
  };

  getPromoDescription = voucher => {
    const { PROMOTIONS_TYPES, PROMO_TYPE } = Constants;
    const { t } = this.props;
    const { type, discountType, discountValue } = voucher;

    if (type === PROMO_TYPE.VOUCHER) {
      return this.getAmountOffPromoTitle(discountValue, PROMOTIONS_TYPES.TAKE_AMOUNT_OFF);
    }

    switch (discountType) {
      case PROMOTIONS_TYPES.PERCENTAGE:
        return t('PromoTitlePercentage', { amount: voucher.discountValue });
      case PROMOTIONS_TYPES.TAKE_AMOUNT_OFF:
        return this.getAmountOffPromoTitle(voucher.discountValue);
      case PROMOTIONS_TYPES.FREE_SHIPPING:
        return t('PromoTitleFreeShipping');
      default:
        return t('Voucher');
    }
  };

  getPromoTimeDisplay = promo => {
    // Show valid from if voucher/promo is applicable but not started yet
    // Others show valid until
    // But if corresponding is null, show nothing
    const { t } = this.props;
    let promoTimeDisplay = '';

    if (!promo.expired && promo.validFrom && new Date(promo.validFrom) > new Date()) {
      promoTimeDisplay = t('PromoValidFrom', { date: this.formatTime(promo.validFrom) });
    } else if (promo.validTo) {
      promoTimeDisplay = promo.validTo ? t('PromoValidUntil', { date: this.formatTime(promo.validTo) }) : '';
    }

    return promoTimeDisplay;
  };

  formatTime = time => {
    if (!time) return '';
    const { onlineStoreInfo } = this.props;

    if (!onlineStoreInfo || !onlineStoreInfo.country) return '';

    const { country = 'MY' } = onlineStoreInfo;

    return formatTimeToDateString(country, time);
  };

  render() {
    const { promo, isSelected, onSelectPromo } = this.props;

    return (
      <li
        className={`ordering-promo-item flex flex-middle card padding-smaller margin-normal ${
          promo.expired || promo.invalidForWeb ? 'disabled' : ''
        } ${isSelected ? 'selected' : ''}`}
        key={promo.id}
        data-test-id="ordering.promotion.promo-item"
        onClick={() => (!promo.expired && !promo.invalidForWeb ? onSelectPromo(promo) : {})}
      >
        <IconVoucherTicket className="ordering-promo-item__icon-ticket icon icon__smaller icon__white margin-top-bottom-small margin-left-right-smaller" />
        <div className="flex flex-space-between flex-middle ordering-promo-item__content margin-smaller">
          <div>
            <h4 className="ordering-promo-item__title text-size-big text-weight-bolder margin-top-bottom-small margin-left-right-smaller">
              {this.getPromoDescription(promo)}
            </h4>
            <p className="ordering-promo-item__text margin-top-bottom-small margin-left-right-smaller text-size-big">
              {promo.name || promo.code}
            </p>
          </div>
          <div className="text-right">
            {promo.expired || promo.invalidForWeb ? (
              <i className="ordering-promo-item__tag tag tag__reverse-primary tag__outline tag__small margin-top-bottom-smaller text-uppercase text-weight-bolder">
                {getPromoStatusLabelText(promo)}
              </i>
            ) : (
              <IconChecked className="icon icon__primary icon-checked icon__small" />
            )}
            <time className="ordering-promo-item__time margin-top-bottom-smaller text-size-small text-opacity padding-top-bottom-smaller">
              {this.getPromoTimeDisplay(promo)}
            </time>
          </div>
        </div>
      </li>
    );
  }
}
PromoItem.displayName = 'PromoItem';

PromoItem.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  promo: PropTypes.object,
  onlineStoreInfo: PropTypes.object,
  /* eslint-enable */
  isSelected: PropTypes.bool,
  onSelectPromo: PropTypes.func,
};

PromoItem.defaultProps = {
  promo: {},
  isSelected: false,
  onSelectPromo: () => {},
  onlineStoreInfo: {},
};

export default compose(withTranslation(['OrderingPromotion']))(PromoItem);
