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
      <div>
        {
          variation.optionValues.map(({ id, value }) => (
            <span key={id}>
              <input
                type="checkbox"
                value={value}
                checked={!!this.state.selected[id]}
                onChange={() => this.setState({
                  selected: {
                    ...(this.isSingleChoice() ? null : this.state.selected),
                    [id]: !this.state.selected[id],
                  }
                }, () => this.props.onChange(
                  this.getAllVariationAndOptionById(),
                ))}
              />
              {value}
            </span>
          ))
        }
      </div>
    )
  }
}

export default VariationSelectorComponent;
