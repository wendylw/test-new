import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { variationOnProductType } from '../propTypes';

export class VariationSelectorComponent extends Component {
  static propTypes = {
    variation: variationOnProductType,
    onChange: PropTypes.func,
  }

  static defaultProps = {
    onChange: () => {},
  };

  state = {
    selected: {},  // Object<OptionId, Boolean<isSelected>}>
  };

  componentDidMount() {
    this.selectDefault();
  }

  selectDefault() {
    if (Object.keys(this.state.selected).length || !this.isSingleChoice()) {
      return;
    }

    const { optionValues } = this.props.variation;

    this.setState({
      selected: {
        [optionValues[0].id]: true,
      }
    }, this.onSelected);
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

  onSelected() {
    this.props.onChange(this.getAllVariationAndOptionById());
  }

  render() {
    const { variation } = this.props;

    if (!variation) {
      return null;
    }

    return (
      <li className="product-detail__options" key={variation.id}>
        <h4 className="product-detail__options-title gray-font-opacity">{variation.name}</h4>
        <ul className="tag__cards">
        {
          variation.optionValues.map(({ id, value }) => (
            <li
              key={id}
              className={`tag__card ${!!this.state.selected[id] ? 'active' : ''}`}
              onClick={() => this.setState({
                selected: {
                  ...(this.isSingleChoice() ? null : this.state.selected),

                  // prevent reverse select when SingleChoice
                  [id]: this.isSingleChoice() ? this.state.selected : !this.state.selected[id],
                }
              }, this.onSelected)}
            >{value}</li>
          ))
        }
      </ul>
      </li>
    )
  }
}

export default VariationSelectorComponent;
