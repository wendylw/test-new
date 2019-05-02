import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Modal extends Component {
  static propTypes = {
    show: PropTypes.bool,
    hideOnBlank: PropTypes.bool,
    onShow: PropTypes.func,
    onHide: PropTypes.func,
  };

  static defaultProps = {
    show: false,
    hideOnBlank: false,
    onShow: () => {},
    onHide: () => {},
  }

  state = {
    show: typeof this.props.show === 'boolean' ? this.props.show : false,
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.show !== nextProps.show) {
      this.setState({ show: nextProps.show });
    }
  }

  hide() {
    this.setState({ show: false }, () => {
      this.props.onHide();
    });
  }

  show() {
    this.setState({ show: true }, () => {
      this.props.onShow();
    });
  }

  toggle() {
    this.setState({ show: !this.state.show }, () => {
      if (this.state.show) {
        this.props.onShow();
      } else {
        this.props.onHide();
      }
    });
  }

  handleClick = (e) => {
    const { hideOnBlank } = this.props;

    if (e.currentTarget === e.target && hideOnBlank) {
      this.hide();
    }
  }

  render() {
    const { children, className = '' } = this.props;

    return (
      <section className={`modal ${className}`} style={this.state.show ? {display: 'block'} : null} onClick={this.handleClick.bind(this)}>
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