import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _filter from 'lodash/filter';
import { IconLocalOffer } from '../../../../../components/Icons';
import { withTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getBusiness } from '../../../../redux/modules/app';

class PromotionBar extends Component {
  getPromotionInfo(business, onSHPromotion) {
    const promotionList = [
      {
        business: 'wokit',
        discountPercentage: '21%',
        promoCode: 'HELLO21',
        validDate: '31st Jan 2021',
        type: 'store',
      },
    ];
    const defaultUniversalPromotion = {
      discountPercentage: '15%',
      promoCode: 'STAYHOME15',
      cappedValue: 'RM15',
      consumptionAmount: 'RM30',
    };
    const currentPromotions = _filter(promotionList, { business });

    if (onSHPromotion) {
      currentPromotions.push(defaultUniversalPromotion);
    }

    return currentPromotions;
  }

  render() {
    const { promotionRef, business, onSHPromotion } = this.props;
    const promotionList = this.getPromotionInfo(business, onSHPromotion);

    if (!promotionList.length) {
      return null;
    }

    return (
      <ul ref={promotionRef} className="border__top-divider border__bottom-divider">
        {promotionList.map(promo => {
          const {
            discountPercentage,
            discountProductList,
            promoCode,
            validDate,
            cappedValue,
            consumptionAmount,
          } = promo;
          const discountProducts = (discountProductList || []).join(', ');
          const productsPromotionDescription = (
            <Trans
              i18nKey="ProductsPromotionDescription"
              discountPercentage={discountPercentage}
              discountProducts={discountProducts}
              promoCode={promoCode}
              validDate={validDate}
            >
              Get <strong>{discountPercentage}</strong> OFF for {discountProducts} with <strong>{promoCode}</strong>.
              Promo Code is valid till {validDate}
            </Trans>
          );
          const storePromotionDescription = (
            <Trans
              i18nKey="StorePromotionDescription"
              discountPercentage={discountPercentage}
              promoCode={promoCode}
              validDate={validDate}
            >
              Get <strong>{discountPercentage}</strong> OFF with <strong>{promoCode}</strong>. Promo Code is valid till{' '}
              {validDate}
            </Trans>
          );
          const universalPromotionDescription = (
            <Trans
              i18nKey="UniversalPromotionDescription"
              discountPercentage={discountPercentage}
              promoCode={promoCode}
              cappedValue={cappedValue}
              consumptionAmount={consumptionAmount}
            >
              <strong>{discountPercentage}</strong> OFF with promo code <strong>{promoCode}</strong>
              <br />
              (capped at {cappedValue} with min. spend {consumptionAmount})
            </Trans>
          );
          let description = universalPromotionDescription;

          if (discountProductList && validDate) {
            description = productsPromotionDescription;
          } else if (discountProductList || validDate) {
            description = storePromotionDescription;
          }

          return (
            <li className="flex flex-top padding-small">
              <IconLocalOffer className="icon icon__primary icon__smaller" />
              <p className="margin-left-right-smaller text-line-height-base">{description}</p>
            </li>
          );
        })}
      </ul>
    );
  }
}

PromotionBar.propTypes = {
  promotionRef: PropTypes.any,
  onSHPromotion: PropTypes.bool,
};

PromotionBar.defaultProps = {
  onSHPromotion: false,
};

export default compose(
  withTranslation(['OrderingHome']),
  connect(
    state => {
      return {
        business: getBusiness(state),
      };
    },
    dispatch => ({})
  )
)(PromotionBar);
