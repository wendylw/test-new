import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Modal extends Component {
  static propTypes = {

  };

  render() {
    const { children, className = '' } = this.props;

    return (
      <section className={`modal ${className}`} style={{display: 'block'}}>
          <div className="modal__content">
            {children}
          </div>
        </section>
    );
  }
}

Modal.Header = ({ children, className = '' }) => (
  <header className={`modal__header border-botton__divider ${className}`}>
    {children}
  </header>
);

Modal.Body = ({ children, className = '' }) => (
  <div className={`modal__body ${className}`}>
    {children}
  </div>
);

Modal.Footer = ({ children, className = '' }) => (
  <footer className={className}>
    {children}
  </footer>
);

export default Modal;