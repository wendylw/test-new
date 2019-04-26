import React, { Component } from 'react'
import PropTypes from 'prop-types'
import config from '../../config';

class MainTopComponent extends Component {
  static propTypes = {
    logo: PropTypes.string,
    title: PropTypes.string,
  }

  render() {
    const { logo, title } = this.props;
    const { table } = config;

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
