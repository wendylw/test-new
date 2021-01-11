import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _includes from 'lodash/includes';
import _isEmpty from 'lodash/isEmpty';
import { IconLocalOffer } from '../../../../../components/Icons';
import { withTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getBusiness } from '../../../../redux/modules/app';
import { getStoreListWithPromotion } from '../../../../redux/modules/home';

class PromotionBar extends Component {
  getPromotionInfo(business, storeList) {
    const hasPromotion = _includes(storeList, business);
    const promotionList = {
      idc: {
        discountPercentage: '84%',
        discountProductList: ['IDC Homemade Frozen Crispy Waffles'],
        promoCode: 'ONLYRM2',
        validDate: '31st Jan 2021',
        key: 'productsPromotionDescription',
      },
      sugarandi: {
        discountPercentage: '10%',
        discountProductList: ['Christmas Bombo Box', 'Christmas Combo Box'],
        promoCode: 'XMAS10',
        validDate: '31st Jan 2021',
        key: 'productsPromotionDescription',
      },
      wokit: {
        discountPercentage: '21%',
        promoCode: 'HELLO21',
        validDate: '31st Jan 2021',
        key: 'storePromotionDescription',
      },
      default: {
        discountPercentage: '15%',
        promoCode: 'STAYHOME15',
        cappedValue: 'RM15',
        consumptionAmount: 'RM30',
        key: 'productsPromotionDescription',
      },
    };

    return hasPromotion ? promotionList[business] || promotionList.default : null;
  }

  render() {
    const { promotionRef, business, storeListWithPromotion } = this.props;
    const promotionInfo = this.getPromotionInfo(business, storeListWithPromotion);

    if (_isEmpty(promotionInfo)) {
      return null;
    }

    const {
      discountPercentage,
      discountProductList,
      promoCode,
      validDate,
      cappedValue,
      consumptionAmount,
      key,
    } = promotionInfo;
    const textDom = {
      productsPromotionDescription: (
        <Trans
          i18nKey="ProductsPromotionDescription"
          discountPercentage={discountPercentage}
          discountProductList={(discountProductList || []).join(', ')}
          promoCode={promoCode}
          validDate={validDate}
        >
          Get <strong>{discountPercentage}</strong> OFF for {discountProductList} with <strong>{promoCode}</strong>.
          Promo Code is valid till {validDate}
        </Trans>
      ),
      storePromotionDescription: (
        <Trans
          i18nKey="StorePromotionDescription"
          discountPercentage={discountPercentage}
          promoCode={promoCode}
          validDate={validDate}
        >
          Get <strong>{discountPercentage}</strong> OFF with <strong>{promoCode}</strong>. Promo Code is valid till{' '}
          {validDate}
        </Trans>
      ),
      universalPromotionDescription: (
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
      ),
    };

    return (
      <ul ref={promotionRef} className="border__top-divider border__bottom-divider">
        <li className="flex flex-top padding-small">
          <IconLocalOffer className="icon icon__primary icon__smaller" />
          <p className="margin-left-right-smaller text-line-height-base">{textDom[promotionInfo.key]}</p>
        </li>
      </ul>
    );
  }
}

PromotionBar.propTypes = {
  promotionRef: PropTypes.any,
};

export default compose(
  withTranslation(['OrderingHome']),
  connect(
    state => {
      return {
        business: getBusiness(state),
        storeListWithPromotion: getStoreListWithPromotion(state),
      };
    },
    dispatch => ({})
  )
)(PromotionBar);
