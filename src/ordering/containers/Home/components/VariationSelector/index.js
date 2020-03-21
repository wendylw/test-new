import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { variationOnProductType } from '../../../../../utils/propTypes';

export class VariationSelector extends Component {
  static propTypes = {
    variation: variationOnProductType,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    onChange: () => {},
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
    const { enableSelectionAmountLimit, minSelectionAmount, maxSelectionAmount } = variation || {};
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
          <p>{AmountLimitDescription}</p>
        ) : null}
        <ul className="tag__cards">
          {(variation.optionValues || []).map(option => {
            const { id, value, markedSoldOut } = option;
            const className = ['tag__card variation'];

            if (markedSoldOut) {
              className.push('disabled');
            } else if (this.state.selected[id]) {
              className.push('active');
            }

            return (
              <li key={id} className={className.join(' ')} onClick={this.handleSelectedOption.bind(this, option)}>
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
  onChange: PropTypes.func,
};

VariationSelector.defaultProps = {
  variation: {},
  initVariation: false,
  onChange: () => {},
};

export default VariationSelector;
