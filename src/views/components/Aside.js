import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Constants from '../../Constants';

class Aside extends Component {
  static propTypes = {
    className: PropTypes.string,
    active: PropTypes.bool,
  };

  static defaultProps = {
    className: '',
    active: false,
  };

  // Important!! This .root class name is defined by index.js file, they should be the same.
  rootEl =  document.getElementById(Constants.DOCUMENT_ROOT_ID);

  componentWillMount() {
    this.toggleBodyScroll(this.props.active);
  }

  componentWillUnmount() {
    this.toggleBodyScroll(false);
  }

  componentWillReceiveProps(nextProps) {
    this.toggleBodyScroll(nextProps.active);
  }

  toggleBodyScroll(blockScroll = false) {
    const rootEl = document.getElementById('root');
    const homeEl = document.getElementById('table-ordering-home');

    if (rootEl && homeEl) {
      const windowScrollTop = document.body.scrollTop || document.documentElement.scrollTop;
      rootEl.classList.toggle('fixed', blockScroll);

      if (blockScroll) {
        homeEl.style.top = `-${windowScrollTop}px`;
      } else {
        homeEl.scrollTop = windowScrollTop;
        homeEl.style.top = null;
      }
    }
  }

  render() {
    const { className, active, children, ...props } = this.props;

    return (
      <aside className={`aside ${active ? 'active' : ''} ${className}`} {...props}>
        {children}
      </aside>
    );
  }
}

export default Aside;