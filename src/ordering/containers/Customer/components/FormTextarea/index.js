import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

class FormTextarea extends Component {
  render() {
    const { t } = this.props;

    return (
      <aside className="aside active">
        <div className="form-text">
          <label className="gray-font-opacity">Add address details *</label>
          <div className="form__group">
            <textarea
              rows="4"
              maxLength="140"
              className="input input__textarea input__block gray-font-opacity"
            ></textarea>
          </div>
          <button
            className="button button__fill button__block font-weight-bold border-radius-base"
            onClick={() => {}}
            disabled={false}
          >
            {t('Save')}
          </button>
        </div>
      </aside>
    );
  }
}

export default withTranslation()(FormTextarea);
