import React, { Component } from 'react'
import PropTypes from 'prop-types'

export class VariationSelectorComponent extends Component {
  static propTypes = {
    variation: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      variationType: PropTypes.oneOf(['SingleChoice', 'MultipleChoice']),
      optionValues: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        value: PropTypes.string,
      })),
    }),
    onChange: PropTypes.func,
  }

  static defaultProps = {
    onChange: () => {},
  };

  state = {
    selected: {},  // Object<OptionId, Boolean<isSelected>}>
  };

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
                  [id]: !this.state.selected[id],
                }
              }, () => this.props.onChange(
                this.getAllVariationAndOptionById(),
              ))}
            >{value}</li>
          ))
        }
      </ul>
      </li>
    )
  }
}

export default VariationSelectorComponent;
