import { createSelector } from '@reduxjs/toolkit';
import _get from 'lodash/get';
import { getBusinessInfo, getShippingType, getFormatCurrencyFunction } from '../../../../redux/modules/app';
import { getIsFreeDeliveryTagVisible, getFreeShippingFormattedMinAmount } from '../common/selectors';
import { PROMOTION_CLIENT_TYPES, SHIPPING_TYPES, CLIENTS } from '../../../../../common/utils/constants';
import { PROMOTIONS_SHIPPING_TYPES_MAPPING, PROMOTIONS_TYPES } from '../../constants';
import { getClient } from '../../../../../common/utils';

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
        const currentSource = PROMOTIONS_SHIPPING_TYPES_MAPPING[shippingType || SHIPPING_TYPES.DELIVERY];
        const { appliedSources, appliedClientTypes } = promotion;
        const client = getClient();
        let currentClientType = '';

        switch (client) {
          case CLIENTS.IOS:
          case CLIENTS.ANDROID:
            currentClientType = PROMOTION_CLIENT_TYPES.APP;
            break;
          case CLIENTS.TNG_MINI_PROGRAM:
            currentClientType = PROMOTION_CLIENT_TYPES.TNG_MINI_PROGRAM;
            break;
          case CLIENTS.GCASH_MINI_PROGRAM:
            currentClientType = PROMOTION_CLIENT_TYPES.GCASH_MINI_PROGRAM;
            break;
          default:
            currentClientType = PROMOTION_CLIENT_TYPES.WEB;
            break;
        }

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
