import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Constants from '../../Constants';

const localState = {
  blockScrollTop: 0,
};

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
    if (this.props.active) {
      this.toggleBodyScroll(true);
    }
  }

  componentWillUnmount() {
    if (this.props.active) {
      this.toggleBodyScroll(false);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.active !== nextProps.active) {
      this.toggleBodyScroll(nextProps.active);
    }
  }

  toggleBodyScroll(blockScroll = false) {
    const rootEl = document.getElementById('root');
    const homeEl = document.getElementById('table-ordering-home');

    if (rootEl && homeEl) {
      rootEl.classList.toggle('fixed', blockScroll);

      if (blockScroll) {
        const currentScrollTop = document.body.scrollTop || document.documentElement.scrollTop;

        homeEl.style.top = `-${currentScrollTop}px`;

        Object.assign(localState, { blockScrollTop: currentScrollTop });
      } else {
        const { blockScrollTop } = localState;

        homeEl.style.top = null;
        document.body.scrollTop = blockScrollTop;
        document.documentElement.scrollTop = blockScrollTop;
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