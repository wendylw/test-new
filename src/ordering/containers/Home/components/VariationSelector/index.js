import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { variationOnProductType } from '../../../../../utils/propTypes';

export class VariationSelector extends Component {
  static propTypes = {
    variation: variationOnProductType,
    onChange: PropTypes.func,
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

  handleSelectedOption(option) {
    const { id } = option;
    const { variation } = this.props;

    this.setState({
      selected: {
        ...(this.isSingleChoice() ? null : this.state.selected),

        // prevent reverse select when SingleChoice
        [id]: this.isSingleChoice() ? this.state.selected : !this.state.selected[id],
      },
    });

    this.props.onChange(variation, option);
  }

  render() {
    const { t, variation } = this.props;
    const { selected } = this.state;
    const { enableSelectionAmountLimit, minSelectionAmount, maxSelectionAmount } = variation || {};
    let AmountLimitDescription = minSelectionAmount
      ? t('MinimumChoicesDescription', { minSelectionAmount })
      : t('MaximumChoicesDescription', { maxSelectionAmount });

    if (enableSelectionAmountLimit && minSelectionAmount && maxSelectionAmount) {
      AmountLimitDescription = t('MinMaximumChoicesDescription', { minSelectionAmount, maxSelectionAmount });
    }

    if (!variation) {
      return null;
    }

    return (
      <li className="product-detail__options" key={variation.id}>
        <h4 className="product-detail__options-title text-opacity text-uppercase">{variation.name}</h4>
        {enableSelectionAmountLimit && (minSelectionAmount || maxSelectionAmount) ? (
          <span className={`product-detail__max-minimum-text text-error`}>{AmountLimitDescription}</span>
        ) : null}
        <ul className="tag__cards">
          {(variation.optionValues || []).map(option => {
            const { id, value, markedSoldOut } = option;
            const className = ['tag__card variation'];
            const isDisabled = markedSoldOut || (this.isInvalidMaximumVariations() && !selected[id]);
            let selectedOptionFunc = this.handleSelectedOption.bind(this, option);

            if (isDisabled) {
              className.push('disabled');
              selectedOptionFunc = () => {};
            } else if (selected[id]) {
              className.push('active');
            }

            return (
              <li
                key={id}
                className={className.join(' ')}
                data-testid="itemDetailSimpleSelection"
                data-heap-name="common.variation-selector.tag"
                data-heap-tag-value={value}
                onClick={selectedOptionFunc}
              >
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
