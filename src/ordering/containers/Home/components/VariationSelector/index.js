import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { variationOnProductType } from '../../../../../utils/propTypes';
import './VariationSelector.scss';

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
      <li className="variation-selector margin-smaller" key={variation.id}>
        <div className="padding-left-right-small">
          <h4 className="text-size-big text-uppercase padding-top-bottom-smaller margin-left-right-smaller">
            {variation.name}
          </h4>
          {enableSelectionAmountLimit && (minSelectionAmount || maxSelectionAmount) ? (
            <span className="margin-left-right-smaller text-error">{AmountLimitDescription}</span>
          ) : null}
        </div>
        <ul
          className="variation-selector__list flex flex-top margin-top-bottom-smaller"
          data-test_id={variation.variationType}
        >
          {(variation.optionValues || []).map(option => {
            const { id, value, markedSoldOut } = option;
            const className = [
              'variation-selector__button button padding-top-bottom-small padding-left-right-normal margin-smaller',
              selected[id] ? 'button__fill' : 'variation-selector__button-shadow',
            ];
            let selectedOptionFunc = this.handleSelectedOption.bind(this, option);

            return (
              <li key={id} className="variation-selector__item margin-top-bottom-smaller margin-left-right-small">
                <button
                  className={className.join(' ')}
                  data-testid="itemDetailSimpleSelection"
                  data-heap-name="common.variation-selector.tag"
                  data-heap-tag-value={value}
                  disabled={markedSoldOut || (this.isInvalidMaximumVariations() && !selected[id])}
                  onClick={selectedOptionFunc}
                >
                  {value}
                </button>
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
