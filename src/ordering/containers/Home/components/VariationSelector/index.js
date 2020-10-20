import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { variationOnProductType } from '../../../../../utils/propTypes';
import './VariationSelector.scss';
import ItemOperator from '../../../../../components/ItemOperator';
import Radio from '../../../../../components/Radio';
import CheckBox from '../../../../../components/CheckBox';
export class VariationSelector extends Component {
  static propTypes = {
    variation: variationOnProductType,
    onChange: PropTypes.func,
  };

  state = {
    selected: {}, // Object<OptionId, Boolean<isSelected>}>
    optionQuantity: {},
  };

  componentDidMount() {
    if (Object.keys(this.state.selected).length) {
      return;
    }

    this.selectDefault();
  }

  componentDidUpdate(prevProps) {
    const { initVariation, variation } = this.props;

    if (initVariation && prevProps.initVariation !== initVariation) {
      this.selectDefault();

      if (variation.variationType === 'MultipleChoice') {
        this.setState({ selected: {}, optionQuantity: {} });
      }
    }
  }

  selectDefault() {
    if (!this.isSingleChoice()) {
      return;
    }

    const { optionValues } = this.props.variation;
    const selectedOptionValue = optionValues.filter(v => !v.markedSoldOut)[0];

    if (selectedOptionValue) {
      this.setState({
        selected: {
          [selectedOptionValue.id]: true,
        },
      });
    }
  }

  isSingleChoice() {
    const { variation } = this.props;
    return variation && variation.variationType === 'SingleChoice';
  }

  isMultipleChoice() {
    const { variation } = this.props;
    return variation && variation.variationType === 'MultipleChoice';
  }

  isInvalidMaximumVariations() {
    const { variation } = this.props;
    const { selected } = this.state;
    const { maxSelectionAmount } = variation || {};
    const selectedOptions = Object.keys(selected).filter(id => selected[id]);

    return selected && maxSelectionAmount && (selectedOptions || []).length >= maxSelectionAmount;
  }

  getAllVariationAndOptionById() {
    const { variation } = this.props;
    const { selected } = this.state;

    return Object.keys(selected)
      .filter(id => selected[id])
      .map(id => ({
        variationId: variation.id,
        optionId: id,
      }));
  }

  handleSelectedOption(option, isMultipleAndEnableQuantity, isMaxed) {
    const { id } = option;
    const { variation } = this.props;

    if (isMultipleAndEnableQuantity || (isMaxed && !this.state.selected[id])) return;

    this.setState({
      selected: {
        ...(this.isSingleChoice() ? null : this.state.selected),

        // prevent reverse select when SingleChoice
        [id]: this.isSingleChoice() ? true : !this.state.selected[id],
      },
    });

    this.props.onChange(variation, option);
  }

  decreaseHandle = option => {
    let { optionQuantity } = this.state;
    const { variation, onChange, updateOptionQuantity } = this.props;
    const { id } = option;

    this.setState(
      {
        optionQuantity: {
          ...optionQuantity,
          [id]: optionQuantity[id] ? --optionQuantity[id] : 0,
        },
      },
      () => {
        const { optionQuantity } = this.state;

        optionQuantity[option.id] === 0 && onChange(variation, option);
        updateOptionQuantity(optionQuantity);
      }
    );
  };

  increaseHandle = option => {
    let { optionQuantity } = this.state;
    const { variation, onChange, updateOptionQuantity } = this.props;
    const { id } = option;
    this.setState(
      {
        optionQuantity: {
          ...optionQuantity,
          [id]: optionQuantity[id] ? ++optionQuantity[id] : 1,
        },
      },
      () => {
        const { optionQuantity } = this.state;

        optionQuantity[id] === 1 && onChange(variation, option);
        updateOptionQuantity(optionQuantity);
      }
    );
  };

  calcQuantitySumMoney = (optionValuesList, obj) => {
    const objKeyList = Object.keys(obj);
    let sum = 0;
    if (objKeyList.length) {
      objKeyList.forEach(id => {
        const priceDiff = optionValuesList.find(item => item.id === id).priceDiff;
        sum += priceDiff * obj[id];
      });
      return sum.toFixed(2);
    }
    return 0;
  };

  render() {
    const { t, variation } = this.props;
    const { selected, optionQuantity } = this.state;
    let {
      enableSelectionAmountLimit,
      minSelectionAmount,
      maxSelectionAmount,
      allowMultiQty: enableQuantity,
      optionValues,
    } = variation || {};

    const optionQuantityValue = Object.values(optionQuantity);
    const selectedValue = Object.values(selected).filter(item => item);
    const quantity = !enableQuantity
      ? selectedValue.length
      : optionQuantityValue.length
      ? optionQuantityValue.reduce((sum, curr) => sum + (curr || 0))
      : 0;

    let AmountLimitDescription = minSelectionAmount
      ? t('MinimumChoicesDescription', { minSelectionAmount })
      : t('MaximumChoicesDescription', { maxSelectionAmount });

    let isRequireMin = enableSelectionAmountLimit && minSelectionAmount;
    let isRequireMax = enableSelectionAmountLimit && maxSelectionAmount;

    if (enableSelectionAmountLimit && minSelectionAmount && maxSelectionAmount) {
      AmountLimitDescription = t('MinMaximumChoicesDescription', { minSelectionAmount, maxSelectionAmount });
    }

    if (!variation) {
      return null;
    }

    const quantitySumMoney = enableQuantity
      ? this.calcQuantitySumMoney(optionValues, optionQuantity)
      : this.calcQuantitySumMoney(optionValues, selected);

    return (
      <li className="variation-selector " key={variation.id} id={variation.id}>
        <div className="padding-left-right-normal variation-selector__title">
          <h4 className="variation-selector__title-name text-size-big text-capitalize padding-top-bottom-smaller flex flex-space-between padding-left-right-smaller">
            <span className="text-weight-bolder">{variation.name}</span>
            {quantitySumMoney ? <span className="text-weight-bolder">+ {quantitySumMoney}</span> : null}
          </h4>
          <div className="variation-selector__title-info flex flex-space-between padding-left-right-smaller">
            {this.isMultipleChoice() && enableSelectionAmountLimit && (minSelectionAmount || maxSelectionAmount) ? (
              <span className={`${isRequireMin && quantity < minSelectionAmount ? 'text-error' : 'text-gray '}`}>
                {AmountLimitDescription}
              </span>
            ) : (
              <span></span>
            )}
            {this.isMultipleChoice() || quantitySumMoney ? <span>{t('Selected', { quantity })}</span> : null}
          </div>
        </div>
        <ul className="variation-selector__list margin-top-bottom-smaller" data-test_id={variation.variationType}>
          {(variation.optionValues || []).map(option => {
            const { id, value, markedSoldOut, priceDiff } = option;

            let selectedOptionFunc = this.handleSelectedOption.bind(
              this,
              option,
              this.isMultipleChoice() && enableQuantity,
              isRequireMax && quantity >= maxSelectionAmount
            );

            return (
              <li
                key={id}
                className={` variation-selector__item flex-space-between flex-middle margin-top-bottom-smaller padding-top-bottom-small flex padding-left-right-normal`}
                onClick={selectedOptionFunc}
                data-heap-name="common.variation-item"
              >
                <p
                  className={`${
                    selected[id] || (this.isMultipleChoice() && enableQuantity) ? 'active' : ''
                  } text-line-height-base margin-left-right-smaller flex flex-column flex-center `}
                >
                  <span>{value}</span>
                  {priceDiff ? (
                    <span className="margin-top-bottom-smaller text-weight-bolder">+{priceDiff.toFixed(2)}</span>
                  ) : null}
                </p>
                <div
                  className={`variation-selector__operator margin-left-right-smaller ${
                    this.isMultipleChoice() && enableQuantity ? '' : 'padding-top-bottom-small'
                  }`}
                >
                  {this.isSingleChoice() && <Radio checked={selected[id]} />}
                  {this.isMultipleChoice() && !enableQuantity && <CheckBox checked={selected[id]} />}
                  {this.isMultipleChoice() && enableQuantity && (
                    <ItemOperator
                      className="flex-middle"
                      data-heap-name="ordering.common.product-detail.item-operator"
                      quantity={optionQuantity[option.id] || 0}
                      from="productDetail"
                      decreaseDisabled={!optionQuantity[option.id]}
                      onDecrease={() => this.decreaseHandle(option)}
                      onIncrease={() => this.increaseHandle(option)}
                      increaseDisabled={isRequireMax && quantity >= maxSelectionAmount}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </li>
    );
  }
}

VariationSelector.propTypes = {
  variation: PropTypes.object,
  initVariation: PropTypes.bool,
  isInvalidMinimum: PropTypes.bool,
  onChange: PropTypes.func,
  updateOptionQuantity: PropTypes.func,
};

VariationSelector.defaultProps = {
  variation: {},
  initVariation: false,
  isInvalidMinimum: true,
  onChange: () => {},
  updateOptionQuantity: () => {},
};

export default withTranslation(['OrderingHome'])(VariationSelector);
