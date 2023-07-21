import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { extractDataAttributes } from '../common/utils';
import './Modal.scss';

class Modal extends Component {
  constructor(props) {
    super(props);
    const { show } = props;

    this.state = { show };
  }

  componentDidUpdate(prevProps) {
    const { show: currShow } = this.props;
    const { show: prevShow } = prevProps;

    if (prevShow !== currShow) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ show: currShow });
    }
  }

  handleClick = e => {
    const { hideOnBlank } = this.props;

    if (e.currentTarget === e.target && hideOnBlank) {
      this.hide();
    }
  };

  hide() {
    const { onHide } = this.props;

    this.setState({ show: false }, () => {
      onHide();
    });
  }

  show() {
    const { onShow } = this.props;

    this.setState({ show: true }, () => {
      onShow();
    });
  }

  toggle() {
    const { onShow, onHide } = this.props;
    const { show: currShow } = this.state;

    this.setState({ show: !currShow }, () => {
      const { show } = this.state;

      if (show) {
        onShow();
      } else {
        onHide();
      }
    });
  }

  render() {
    const { children, className = '' } = this.props;
    const { show } = this.state;

    if (!show) {
      return null;
    }

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <section
        className={`modal absolute-wrapper flex flex-column flex-middle flex-center ${className}`}
        onClick={this.handleClick.bind(this)}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...extractDataAttributes(this.props)}
      >
        <div className="modal__content border-radius-large">{children}</div>
      </section>
    );
  }
}
Modal.displayName = 'Modal';

Modal.Header = ({ children, className = '' }) => (
  <header className={`modal__header border__bottom-divider ${className}`}>{children}</header>
);

Modal.Header.displayName = 'ModalHeader';

Modal.Header.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

Modal.Header.defaultProps = {
  className: '',
  children: null,
};

Modal.Body = ({ children, className = '' }) => <div className={`modal__body ${className}`}>{children}</div>;

Modal.Body.displayName = 'ModalBody';

Modal.Body.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

Modal.Body.defaultProps = {
  className: '',
  children: null,
};

Modal.Footer = ({ children, className = '' }) => <footer className={className}>{children}</footer>;

Modal.Footer.displayName = 'ModalFooter';

Modal.Footer.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

Modal.Footer.defaultProps = {
  className: '',
  children: null,
};

Modal.propTypes = {
  show: PropTypes.bool,
  hideOnBlank: PropTypes.bool,
  onShow: PropTypes.func,
  onHide: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
};

Modal.defaultProps = {
  show: false,
  className: '',
  hideOnBlank: false,
  onShow: () => {},
  onHide: () => {},
  children: null,
};

export default Modal;
