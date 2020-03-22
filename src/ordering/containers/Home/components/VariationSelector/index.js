import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { variationOnProductType } from '../../../../../utils/propTypes';

export class VariationSelector extends Component {
  static propTypes = {
    variation: variationOnProductType,
    onChange: PropTypes.func,
    isInvalidMinimum: false,
  };

  state = {
    selected: {}, // Object<OptionId, Boolean<isSelected>}>
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
        this.setState({ selected: {} });
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

  handleSelectedOption(option) {
    const { id } = option;
    const { variation } = this.props;
    const { enableSelectionAmountLimit, minSelectionAmount } = variation || {};
    const isInvalidMinimum =
      enableSelectionAmountLimit && minSelectionAmount && this.state.selected.length + 1 < minSelectionAmount;

    this.setState({
      isInvalidMinimum,
      selected: {
        ...(this.isSingleChoice() ? null : this.state.selected),

        // prevent reverse select when SingleChoice
        [id]: this.isSingleChoice() ? this.state.selected : !this.state.selected[id],
      },
    });

    this.props.onChange(variation, option);
  }

  render() {
    const { t, variation, isInvalidMinimum } = this.props;
    const { selected } = this.state;
    const { enableSelectionAmountLimit, minSelectionAmount, maxSelectionAmount } = variation || {};
    const maxSelected = maxSelectionAmount && selected.length >= maxSelectionAmount;
    let AmountLimitDescription = minSelectionAmount ? t('MinimumChoicesDescription') : t('MaximumChoicesDescription');

    if (enableSelectionAmountLimit && minSelectionAmount && maxSelectionAmount) {
      AmountLimitDescription = t('MinMaximumChoicesDescription');
    }

    if (!variation) {
      return null;
    }

    return (
      <li className="product-detail__options" key={variation.id}>
        <h4 className="product-detail__options-title gray-font-opacity text-uppercase">{variation.name}</h4>
        {enableSelectionAmountLimit && (minSelectionAmount || maxSelectionAmount) ? (
          <span className={`product-detail__max-minimum-text ${maxSelected || isInvalidMinimum ? 'text-error' : ''}`}>
            {AmountLimitDescription}
          </span>
        ) : null}
        <ul className="tag__cards">
          {(variation.optionValues || []).map(option => {
            const { id, value, markedSoldOut } = option;
            const className = ['tag__card variation'];
            const isDisabled =
              markedSoldOut || (maxSelectionAmount && selected.length >= maxSelectionAmount && !selected[id]);
            let selectedOptionFunc = this.handleSelectedOption.bind(this, option);

            if (isDisabled) {
              className.push('disabled');
              selectedOptionFunc = () => {};
            } else if (selected[id]) {
              className.push('active');
            }

            return (
              <li key={id} className={className.join(' ')} onClick={selectedOptionFunc}>
                {value}
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
};

VariationSelector.defaultProps = {
  variation: {},
  initVariation: false,
  isInvalidMinimum: true,
  onChange: () => {},
};

export default withTranslation(['OrderingHome'])(VariationSelector);
