import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _filter from 'lodash/filter';
import { IconLocalOffer } from '../../../../../components/Icons';
import { withTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getBusiness } from '../../../../redux/modules/app';

class PromotionsBar extends Component {
  getPromotionInfo(business, storePromoTags) {
    const promotionList = [];
    const universalPromotion = {
      STAYHOME15: {
        discountPercentage: '15%',
        promoCode: 'STAYHOME15',
        cappedValue: 'RM15',
        consumptionAmount: 'RM30',
      },
      FREE5KM: {
        discount: 'Free Delivery',
        promoCode: 'FREE5KM',
        cappedValue: 'RM6',
        consumptionAmount: 'RM50',
      },
    };
    const currentPromotions = _filter(promotionList, { business });

    storePromoTags.forEach(promo => {
      if (universalPromotion[promo]) {
        currentPromotions.push(universalPromotion[promo]);
      }
    });

    return currentPromotions;
  }

  render() {
    const { promotionRef, business, storePromoTags } = this.props;
    const promotionList = this.getPromotionInfo(business, storePromoTags);

    if (!promotionList.length) {
      return null;
    }

    return (
      <ul ref={promotionRef} className="border__top-divider border__bottom-divider">
        {promotionList.map((promo, index) => {
          const {
            discountPercentage,
            discount,
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
              discount={discountPercentage}
              promoCode={promoCode}
              cappedValue={cappedValue}
              consumptionAmount={consumptionAmount}
            >
              <strong>{discountPercentage}</strong> OFF with promo code <strong>{promoCode}</strong>
              <br />
              (capped at {cappedValue} with min. spend {consumptionAmount})
            </Trans>
          );
          const deliveryPromotionDescription = (
            <Trans
              i18nKey="FreeDeliveryPromotionDescription"
              discount={discount}
              promoCode={promoCode}
              consumptionAmount={consumptionAmount}
            >
              <strong>{discount}</strong> with promo code <strong>{promoCode}</strong> (capped at {cappedValue} with
              min. spend {consumptionAmount})
            </Trans>
          );
          let description = universalPromotionDescription;

          if (discountProductList && validDate) {
            description = productsPromotionDescription;
          } else if (discountProductList || validDate) {
            description = storePromotionDescription;
          } else if (discount && !discountPercentage) {
            description = deliveryPromotionDescription;
          }

          return (
            <li key={`promo-${promoCode}-${index}`} className="flex flex-top padding-small">
              <IconLocalOffer className="icon icon__primary icon__smaller" />
              <p className="margin-left-right-smaller text-line-height-base">{description}</p>
            </li>
          );
        })}
      </ul>
    );
  }
}

PromotionsBar.propTypes = {
  promotionRef: PropTypes.any,
  storePromoTags: PropTypes.array,
};

PromotionsBar.defaultProps = {
  storePromoTags: [],
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
)(PromotionsBar);
