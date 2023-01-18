import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import PhoneInput, {
  formatPhoneNumberIntl,
  isValidPhoneNumber,
  parsePhoneNumber,
} from 'react-phone-number-input/mobile';
import 'react-phone-number-input/style.css';
import Utils from '../utils/utils';
import Constants from '../utils/constants';
import './PhoneViewContainer.scss';

class PhoneViewContainer extends React.Component {
  handleUpdatePhoneNumber(phone) {
    const { updatePhoneNumber, onValidation } = this.props;
    const { number } = (phone && parsePhoneNumber(phone)) || {};

    updatePhoneNumber({ phone: number || '' });

    onValidation(isValidPhoneNumber(number || ''));
  }

  handleUpdateCountry(country) {
    const { updateCountry, phone, onValidation } = this.props;

    if (country) {
      updateCountry({ country });
    }

    onValidation(isValidPhoneNumber(phone || ''));
  }

  handleSubmitPhoneNumber() {
    const { onSubmit, phone } = this.props;

    if (!isValidPhoneNumber(phone || '')) {
      return;
    }

    Utils.setLocalStorageVariable('user.p', phone);

    onSubmit(phone, Constants.OTP_REQUEST_TYPES.OTP);
  }

  render() {
    const {
      t,
      children,
      title,
      className,
      country,
      buttonText,
      content,
      phone,
      showError,
      errorText,
      isProcessing,
    } = this.props;
    const classList = ['phone-view'];

    if (className) {
      classList.push(className);
    }

    return (
      <section className={classList.join(' ')}>
        {title ? (
          <label className="phone-view__label text-center padding-top-bottom-small text-size-bigger text-line-height-base text-weight-bolder">
            {title}
          </label>
        ) : null}
        {content ? <p className="text-weight-bolder">{content}</p> : null}
        {/* react-phone-number-input style guide  https://catamphetamine.gitlab.io/react-phone-number-input/docs/index.html#phoneinputwithcountry */}
        <PhoneInput
          international // If input want to show country code when phone number is empty, pls add international on props
          smartCaret={false}
          placeholder={t('EnterPhoneNumber')}
          className={showError ? 'phone-view__input-error' : ''}
          data-heap-name="common.phone-view-container.phone-number-input"
          value={formatPhoneNumberIntl(phone)}
          defaultCountry={country}
          country={country}
          onChange={newPhone => this.handleUpdatePhoneNumber(newPhone)}
          onCountryChange={newCountry => this.handleUpdateCountry(newCountry)}
        />
        {showError && <p className="phone-view__error-message">{errorText}</p>}
        <button
          className="button button__fill button__block margin-top-bottom-small text-weight-bolder text-uppercase"
          data-heap-name="common.phone-view-container.submit-btn"
          onClick={this.handleSubmitPhoneNumber.bind(this)}
          disabled={!phone || isProcessing || !isValidPhoneNumber(phone || '')}
        >
          {buttonText}
        </button>
        {children}
      </section>
    );
  }
}

PhoneViewContainer.propTypes = {
  phone: PropTypes.string,
  className: PropTypes.string,
  title: PropTypes.string,
  country: PropTypes.string,
  buttonText: PropTypes.string,
  isProcessing: PropTypes.bool,
  errorText: PropTypes.string,
  showError: PropTypes.bool,
  updatePhoneNumber: PropTypes.func,
  updateCountry: PropTypes.func,
  onSubmit: PropTypes.func,
  onValidation: PropTypes.func,
};

PhoneViewContainer.defaultProps = {
  isProcessing: false,
  errorText: '',
  showError: false,
  updatePhoneNumber: () => {},
  updateCountry: () => {},
  onSubmit: () => {},
  onValidation: () => {},
};
PhoneViewContainer.displayName = 'PhoneViewContainer';

export default withTranslation()(PhoneViewContainer);
