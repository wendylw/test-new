import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class FormTextarea extends Component {
  state = {
    textValue: null,
  };

  componentDidUpdate(prevProps) {
    const { show } = prevProps;

    if (!show && show !== this.props.show) {
      this.setState({ textValue: null });
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
        <div className="form-text">
          <label className="gray-font-opacity">{title}</label>
          <div className="form__group">
            <textarea
              rows="4"
              maxLength="140"
              className="input input__textarea input__block gray-font-opacity"
              value={textValue || ''}
              onChange={this.handleUpdateText.bind(this)}
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
};

FormTextarea.defaultProps = {
  show: false,
  onToggle: () => {},
  title: false,
  onUpdateText: () => {},
};

export default withTranslation()(FormTextarea);
