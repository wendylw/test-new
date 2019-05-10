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
    this.toggleRootFixed(this.props.active);
  }

  componentWillUnmount() {
    this.toggleRootFixed(false);
  }

  componentWillReceiveProps(nextProps) {
    this.toggleRootFixed(nextProps.active);
  }

  toggleRootFixed(toState) {
    if (!this.rootEl) {
      console.warn('id %o is not found in document', Constants.DOCUMENT_ROOT_ID);
      return;
    }

    this.rootEl.classList.toggle('fixed', toState);
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