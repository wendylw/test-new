import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withDataAttributes from './withDataAttributes';
import './Modal.scss';

class Modal extends Component {
  state = {
    show: typeof this.props.show === 'boolean' ? this.props.show : false,
  };

  componentDidUpdate(prevProps) {
    if (prevProps.show !== this.props.show) {
      this.setState({ show: this.props.show });
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

  handleClick = e => {
    const { hideOnBlank } = this.props;

    if (e.currentTarget === e.target && hideOnBlank) {
      this.hide();
    }
  };

  render() {
    const { children, className = '', dataAttributes } = this.props;
    const { show } = this.state;

    if (!show) {
      return null;
    }

    return (
      <section
        className={`modal absolute-wrapper flex flex-column flex-middle flex-center ${className}`}
        onClick={this.handleClick.bind(this)}
        {...dataAttributes}
      >
        <div className="modal__content border-radius-large">{children}</div>
      </section>
    );
  }
}

Modal.Header = ({ children, className = '' }) => (
  <header className={`modal__header border__bottom-divider ${className}`}>{children}</header>
);

Modal.Body = ({ children, className = '' }) => <div className={`modal__body ${className}`}>{children}</div>;

Modal.Footer = ({ children, className = '' }) => <footer className={className}>{children}</footer>;

Modal.propTypes = {
  show: PropTypes.bool,
  hideOnBlank: PropTypes.bool,
  onShow: PropTypes.func,
  onHide: PropTypes.func,
};

Modal.defaultProps = {
  show: false,
  hideOnBlank: false,
  onShow: () => {},
  onHide: () => {},
};

export default withDataAttributes(Modal);
