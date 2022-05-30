import { createSelector, createStructuredSelector } from 'reselect';
import _get from 'lodash/get';
import _sumBy from 'lodash/sumBy';
import { PRODUCT_SELECTION_AMOUNT_LIMIT_TYPE, PRODUCT_VARIATION_TYPE } from '../../../constants';

const getVariation = variation => variation;

const getSelectedOptionsByVariationId = (_, selectedOptionsByVariationId) => selectedOptionsByVariationId;

const getVariationId = variation => variation.id;

const getVariationName = variation => variation.name;

const getVariationModifier = variation => variation.isModifier;

const getVariationOptionValues = variation => variation.optionValues;

const getVariationType = variation => {
  switch (variation.variationType) {
    case 'SingleChoice':
      return PRODUCT_VARIATION_TYPE.SINGLE_CHOICE;
    case 'MultipleChoice':
      if (variation.allowMultiQty) {
        return PRODUCT_VARIATION_TYPE.QUANTITY_MULTIPLE_CHOICE;
      }
      return PRODUCT_VARIATION_TYPE.SIMPLE_MULTIPLE_CHOICE;
    default:
      return PRODUCT_VARIATION_TYPE.SIMPLE_MULTIPLE_CHOICE;
  }
};

const getVariationSelectionAmountMin = variation => variation?.minSelectionAmount ?? 0;

const getVariationSelectionAmountMax = variation => variation?.maxSelectionAmount ?? Infinity;

const getIsVariationSelectionLimitEnable = variation => _get(variation, 'enableSelectionAmountLimit', false);

const getVariationSelectionAmountType = createSelector(
  getIsVariationSelectionLimitEnable,
  getVariationSelectionAmountMin,
  getVariationSelectionAmountMax,
  (isEnable, min, max) => {
    if (!isEnable) {
      return null;
    }

    if (min === max) {
      return PRODUCT_SELECTION_AMOUNT_LIMIT_TYPE.SELECT_X;
    }

    if (min > 0 && max === Infinity) {
      return PRODUCT_SELECTION_AMOUNT_LIMIT_TYPE.SELECT_X_OR_MORE;
    }

    if (min === 0 && max !== Infinity) {
      return PRODUCT_SELECTION_AMOUNT_LIMIT_TYPE.SELECT_UP_TO_X;
    }

    if (min > 0 && max !== Infinity) {
      return PRODUCT_SELECTION_AMOUNT_LIMIT_TYPE.SELECT_X_TO_Y;
    }

    return null;
  }
);

const getSelectedVariationOptions = createSelector(
  getVariationId,
  getSelectedOptionsByVariationId,
  (variationId, selectedOptionsByVariationId) => selectedOptionsByVariationId[variationId]
);

// const getVariationOptionsDetail = createSelector(getVariationType, getVariationOptionValues, getSelectedVariationOptions, (optionValues, selectedVariationOptions) => );

const getSelectedVariationQuantity = createSelector(
  getVariationType,
  getSelectedVariationOptions,
  (variationType, selectedVariationOptions) => {
    switch (variationType) {
      case PRODUCT_VARIATION_TYPE.SINGLE_CHOICE:
        return selectedVariationOptions ? 1 : 0;
      case PRODUCT_VARIATION_TYPE.SIMPLE_MULTIPLE_CHOICE:
        return selectedVariationOptions?.length || 0;
      case PRODUCT_VARIATION_TYPE.QUANTITY_MULTIPLE_CHOICE:
        return _sumBy(selectedVariationOptions, 'quantity');
      default:
        return 0;
    }
  }
);

const getIsVariationSelectionAmountLimitFulfilled = createSelector(
  getVariationSelectionAmountType,
  getVariationSelectionAmountMin,
  getVariationSelectionAmountMax,
  getSelectedVariationQuantity,
  (type, min, max, selectedVariationQuantity) => {
    switch (type) {
      case PRODUCT_SELECTION_AMOUNT_LIMIT_TYPE.SELECT_X_OR_MORE:
        return selectedVariationQuantity >= min;
      case PRODUCT_SELECTION_AMOUNT_LIMIT_TYPE.SELECT_UP_TO_X:
        return selectedVariationQuantity <= max;
      case PRODUCT_SELECTION_AMOUNT_LIMIT_TYPE.SELECT_X_TO_Y:
        return selectedVariationQuantity >= min && selectedVariationQuantity <= max;
      case PRODUCT_SELECTION_AMOUNT_LIMIT_TYPE.SELECT_X:
        return selectedVariationQuantity === min;
      default:
        return true;
    }
  }
);

// const getSelectedVariationOptionsPriceDiff = createSelector(getVariation);

const selectionAmountLimitStructuredSelector = createStructuredSelector({
  fulfilled: getIsVariationSelectionAmountLimitFulfilled,
  type: getVariationSelectionAmountType,
  max: getVariationSelectionAmountMax,
  min: getVariationSelectionAmountMin,
});

export const variationStructuredSelector = createStructuredSelector({
  id: getVariationId,
  name: getVariationName,
  type: getVariationType,
  isModifier: getVariationModifier,
  selectionAmountLimit: selectionAmountLimitStructuredSelector,
  selectedQuantity: getSelectedVariationQuantity,
});
