// import { createSelector } from 'reselect';
// import { getRemainingRewardExpiredDays, getFormatDiscountValue } from '../../../../../../common/utils/rewards';
// import { getLoadRewardListRequestData } from '../../../../../../redux/modules/rewards/selectors';

export const getSearchKeyword = state => state.rewardList.searchKeyword;

// export const getRewardList = createSelector(getLoadRewardListRequestData, loadRewardListRequestData =>
//   loadRewardListRequestData.map(rewardItem => {
//     const {
//       id,
//       uniquePromotionCodeId,
//       type,
//       discountType,
//       discountValue,
//       name,
//       validTo,
//       status,
//       minSpendAmount,
//     } = rewardItem;
//     const value = getFormatDiscountValue(discountType, discountValue, {
//       locale: merchantLocale,
//       currency: merchantCurrency,
//       country: merchantCountry,
//     });
//     const minSpendI18n = minSpendAmount
//       ? {
//           i18nKey: 'MinConsumption',
//           params: {
//             amount: getPrice(minSpendAmount, {
//               locale: merchantLocale,
//               currency: merchantCurrency,
//               country: merchantCountry,
//             }),
//           },
//         }
//       : null;
//     const remainingExpiredDays = getRemainingRewardExpiredDays(validTo);

//     return {
//       id,
//       uniquePromotionCodeId,
//       key: `${id}-${uniquePromotionCodeId}-${type}`,
//       value,
//       name,
//       status,
//     };
//   })
// );
