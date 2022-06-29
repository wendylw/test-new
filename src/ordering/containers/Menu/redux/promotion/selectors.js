import { createSelector } from '@reduxjs/toolkit';
import _get from 'lodash/get';
import { getBusinessInfo, getShippingType, getFormatCurrencyFunction } from '../../../../redux/modules/app';
import { getIsFreeDeliveryTagVisible, getFreeShippingFormattedMinAmount } from '../common/selectors';
import { PROMOTION_CLIENT_TYPES, SHIPPING_TYPES } from '../../../../../common/utils/constants';
import { PROMOTIONS_SHIPPING_TYPES_MAPPING, PROMOTIONS_TYPES } from '../../constants';
import { isTNGMiniProgram, isWebview } from '../../../../../common/utils';

export const getAvailablePromotions = createSelector(
  getBusinessInfo,
  getShippingType,
  getFormatCurrencyFunction,
  getIsFreeDeliveryTagVisible,
  getFreeShippingFormattedMinAmount,
  (businessInfo, shippingType, formatCurrency, isFreeDeliveryTagVisible, freeShippingFormattedMinAmount) => {
    const promotions = _get(businessInfo, 'promotions', []);
    const availablePromotions = promotions
      .filter(promotion => {
        const { appliedSources, appliedClientTypes } = promotion;
        const currentClientType = isTNGMiniProgram()
          ? PROMOTION_CLIENT_TYPES.TNG_MINI_PROGRAM
          : isWebview()
          ? PROMOTION_CLIENT_TYPES.APP
          : PROMOTION_CLIENT_TYPES.WEB;

        const currentSource = PROMOTIONS_SHIPPING_TYPES_MAPPING[shippingType || SHIPPING_TYPES.DELIVERY];

        if (!appliedSources.includes(currentSource)) return false;

        if (!appliedClientTypes.includes(currentClientType)) {
          // Beep web can display app promotion
          if (currentClientType === PROMOTION_CLIENT_TYPES.WEB) {
            const hasAppClient = appliedClientTypes.includes(PROMOTION_CLIENT_TYPES.APP);

            if (hasAppClient) {
              return true;
            }
          }

          return false;
        }

        return true;
      })
      .map(promotion => ({
        ...promotion,
        formattedDiscountValue:
          promotion.discountType === PROMOTIONS_TYPES.PERCENTAGE
            ? `${promotion.discountValue}%`
            : formatCurrency(promotion.discountValue),
        formattedMaxDiscountAmount: promotion.maxDiscountAmount ? formatCurrency(promotion.maxDiscountAmount) : '',
        formattedMinOrderAmount: promotion.minOrderAmount ? formatCurrency(promotion.minOrderAmount) : '',
      }));

    if (isFreeDeliveryTagVisible) {
      availablePromotions.push({
        id: '-1',
        appliedClientTypes: ['web', 'app'],
        isFreeDeliveryTagVisible: true,
        freeShippingFormattedMinAmount,
      });
    }

    return availablePromotions;
  }
);
export const getPromotionDrawerVisible = state => state.menu.promotion.promotionDrawerVisible;
