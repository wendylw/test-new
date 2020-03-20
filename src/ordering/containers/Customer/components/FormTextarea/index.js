import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class FormTextarea extends Component {
  state = {
    textValue: null,
  };

  textareaRef = React.createRef();
  addressAsideInnerRef = React.createRef();

  autoFocus = () => {
    this.textareaRef.current.focus();
  };

  componentDidMount = () => {
    const textarea = document.getElementById('address-textarea');

    // const oldInnerHeight = addressAsideInner.style.top;

    textarea.addEventListener(
      'focus',
      () => {
        this.addressAsideInnerRef.current.style.top = '20vh';
      },
      false
    );

    textarea.addEventListener(
      'blur',
      () => {
        setTimeout(() => {
          const { style } = this.addressAsideInnerRef.current || {};

          if (style && style.top) {
            style.top = '';
          }
        }, 100);
      },
      false
    );
  };

  componentDidUpdate(prevProps) {
    const { show } = prevProps;

    if (!show && show !== this.props.show) {
      this.setState({ textValue: null }, this.autoFocus);
    }

    if (this.props.show && show !== this.props.show) {
      this.setState({ textValue: this.props.textareaValue }, this.autoFocus);
    }
  }

  handleHideAside(e) {
    const { onToggle } = this.props;

    if (e && e.target !== e.currentTarget) {
      return;
    }

    onToggle();
  }

  handleUpdateText(e) {
    this.setState({
      textValue: e.target.value,
    });
  }

  render() {
    const { t, show, onToggle, title, onUpdateText } = this.props;
    const { textValue } = this.state;
    const className = ['aside'];

    if (show) {
      className.push('active');
    }

    return (
      <aside className={className.join(' ')} onClick={e => this.handleHideAside(e)}>
        <div ref={this.addressAsideInnerRef} className="form-text">
          <label className="gray-font-opacity">{title}</label>
          <div className="form__group">
            <textarea
              id="address-textarea"
              ref={this.textareaRef}
              rows="4"
              maxLength="140"
              className="input input__textarea input__block gray-font-opacity"
              value={textValue || ''}
              onChange={this.handleUpdateText.bind(this)}
              autoFocus
            ></textarea>
          </div>
          <button
            className="button button__fill button__block font-weight-bold border-radius-base"
            onClick={() => {
              onToggle();
              onUpdateText(textValue);
            }}
            disabled={false}
          >
            {t('Save')}
          </button>
        </div>
      </aside>
    );
  }
}

FormTextarea.propTypes = {
  show: PropTypes.bool,
  onToggle: PropTypes.func,
  title: PropTypes.string,
  onUpdateText: PropTypes.func,
  textareaValue: PropTypes.string,
};

FormTextarea.defaultProps = {
  show: false,
  textareaValue: '',
  onToggle: () => {},
  title: false,
  onUpdateText: () => {},
};

export default withTranslation()(FormTextarea);
