import { createSelector, createStructuredSelector } from 'reselect';
import { tools as frontendUtilTools, data as frontendUtilData } from '@storehub/frontend-utils';
import { PRODUCT_VARIATION_TYPE } from '../../../constants';
import { isVariationOptionAvailable } from '../../../utils';

export const formatVariationOptionPriceDiff = (priceDiff, formatCurrency) => {
  if (!priceDiff) {
    return '';
  }

  const isNegative = frontendUtilTools.isNegativeNumber(priceDiff);
  const sign = isNegative ? '-' : '+';
  const noBreakSpace = frontendUtilData.SpecialCharacters.NO_BREAK_SPACE;
  const currencyFormattedPrice = formatCurrency(Math.abs(priceDiff), { hiddenCurrency: true });

  // Example: + 1.50, - 1.00
  return `${sign}${noBreakSpace}${currencyFormattedPrice}`;
};

/** Base Selector */
const getVariationOption = option => option;

const getVariationDetail = (_, variationDetail) => variationDetail;

const getSelectedOptionsByVariationId = (_, __, selectedOptionsByVariationId) => selectedOptionsByVariationId;

const getProductChildrenMap = (_, __, ___, productChildrenMap) => productChildrenMap;

const getFormatCurrencyFunction = (_, __, ___, ____, _____, formatCurrency) => formatCurrency;

/** End Base Selector */

const getVariationId = createSelector(getVariationDetail, variation => variation.id);

const getVariationType = createSelector(getVariationDetail, variation => variation.type);

const getShareModifierVariation = createSelector(getVariationDetail, variation => variation.isModifier);

const getVariationSelectionAmountLimit = createSelector(
  getVariationDetail,
  variationDetail => variationDetail.selectionAmountLimit
);

const getVariationSelectedQuantity = createSelector(
  getVariationDetail,
  variationDetail => variationDetail.selectedQuantity
);

const getVariationSelectionAmountMaxLimit = createSelector(
  getVariationSelectionAmountLimit,
  selectionAmountLimit => selectionAmountLimit.max
);

const getIsReachedMaxSelection = createSelector(
  getVariationSelectedQuantity,
  getVariationSelectionAmountMaxLimit,
  (selectedQuantity, max) => selectedQuantity >= max
);

const getVariationOptionId = createSelector(getVariationOption, option => option.id);

const getVariationOptionValue = createSelector(getVariationOption, option => option.value);

const getVariationOptionPriceDiff = createSelector(getVariationOption, option => option.priceDiff);

const getVariationOptionMarkedSoldOut = createSelector(getVariationOption, option => option.markedSoldOut);

const getVariationOptionFormattedPriceDiff = createSelector(
  getVariationOptionPriceDiff,
  getFormatCurrencyFunction,
  (priceDiff, formatCurrency) => formatVariationOptionPriceDiff(priceDiff, formatCurrency)
);

const getSelectedOptions = createSelector(
  getVariationId,
  getSelectedOptionsByVariationId,
  (variationId, selectedOptionsByVariationId) => selectedOptionsByVariationId[variationId]
);

const getSelectedOption = createSelector(
  getVariationOption,
  getVariationType,
  getSelectedOptions,
  (option, variationType, selectedOptions) => {
    if (!selectedOptions) {
      return null;
    }

    switch (variationType) {
      case PRODUCT_VARIATION_TYPE.SINGLE_CHOICE:
        return selectedOptions.optionId === option.id ? option : null;
      case PRODUCT_VARIATION_TYPE.SIMPLE_MULTIPLE_CHOICE:
      case PRODUCT_VARIATION_TYPE.QUANTITY_MULTIPLE_CHOICE:
      default:
        return selectedOptions.find(selectedOption => selectedOption.optionId === option.id);
    }
  }
);

const getIsSelected = createSelector(getSelectedOption, selectedOption => !!selectedOption);

const getQuantity = createSelector(getSelectedOption, selectedOption =>
  selectedOption ? selectedOption.quantity ?? 1 : 0
);

const getIsAbleToDecreaseQuantity = createSelector(getQuantity, quantity => quantity > 0);

const getIsAbleToIncreaseQuantity = createSelector(
  getVariationSelectedQuantity,
  getVariationSelectionAmountMaxLimit,
  (variationSelectedQuantity, max) => variationSelectedQuantity < max
);

// is display the "unavailable" label on option
const getIsAvailable = createSelector(
  getVariationType,
  getShareModifierVariation,
  getVariationOptionValue,
  getVariationOptionMarkedSoldOut,
  getProductChildrenMap,
  (variationType, variationShareModifier, optionValue, optionMarkedSoldOut, productChildrenMap) =>
    isVariationOptionAvailable({
      variationType,
      variationShareModifier,
      optionValue,
      optionMarkedSoldOut,
      productChildrenMap,
    })
);

const getIsDisabled = createSelector(
  getIsReachedMaxSelection,
  getIsSelected,
  getIsAvailable,
  (isReachedMaxSelection, isSelected, isAvailable) => !isAvailable || (isReachedMaxSelection && !isSelected)
);

export const variationOptionStructuredSelector = createStructuredSelector({
  id: getVariationOptionId,
  name: getVariationOptionValue,
  value: getVariationOptionValue,
  formattedPriceDiff: getVariationOptionFormattedPriceDiff,
  priceDiff: getVariationOptionPriceDiff,
  selected: getIsSelected,
  quantity: getQuantity,
  isAbleToDecreaseQuantity: getIsAbleToDecreaseQuantity,
  isAbleToIncreaseQuantity: getIsAbleToIncreaseQuantity,
  available: getIsAvailable,
  disabled: getIsDisabled,
});
