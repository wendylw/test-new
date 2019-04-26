import React, { Component } from 'react'
import PropTypes from 'prop-types'

class MainTopComponent extends Component {
  static propTypes = {
    logo: PropTypes.string,
    title: PropTypes.string,
    table: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }

  render() {
    const { logo, title, table } = this.props;

    return (
      <div>
        <div>
          <img src={logo} width={120} height={60} alt={title} />
          <span>{title}</span>
          <span>Table: {table}</span>
        </div>
      </div>
    )
  }
}

export default MainTopComponent;
