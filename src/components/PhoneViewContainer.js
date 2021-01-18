import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import PhoneInput, { formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input/mobile';
import 'react-phone-number-input/style.css';
import Utils from '../utils/utils';
import './PhoneViewContainer.scss';

const metadataMobile = require('libphonenumber-js/metadata.mobile.json');

class PhoneViewContainer extends React.Component {
  state = {
    isSavingPhone: this.props.isLoading,
  };

  componentDidUpdate(prevProps) {
    const { isLoading } = this.props;

    if (isLoading !== prevProps.isLoading) {
      this.setState({ isSavingPhone: isLoading });
    }
  }

  handleUpdatePhoneNumber(phone) {
    const { updatePhoneNumber } = this.props;

    updatePhoneNumber({ phone: phone || '' });
  }

  handleUpdateCountry(country) {
    const { updateCountry } = this.props;

    if (country) {
      updateCountry({ country: country });
    }
  }

  handleSubmitPhoneNumber() {
    const { onSubmit, phone } = this.props;

    if (!isValidPhoneNumber(phone)) {
      return;
    }

    Utils.setLocalStorageVariable('user.p', phone);
    this.setState({ isSavingPhone: true });

    onSubmit(phone);
  }

  render() {
    const { t, children, title, className, country, buttonText, content, phone } = this.props;
    const { isSavingPhone } = this.state;
    const classList = ['phone-view'];
    let buttonContent = buttonText;

    if (isSavingPhone) {
      buttonContent = t('Processing');
    }

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
          data-heap-name="common.phone-view-container.phone-number-input"
          value={formatPhoneNumberIntl(phone)}
          defaultCountry={country}
          country={country}
          metadata={metadataMobile}
          onChange={newPhone => this.handleUpdatePhoneNumber(newPhone)}
          onCountryChange={newCountry => this.handleUpdateCountry(newCountry)}
        />
        <button
          className="button button__fill button__block margin-top-bottom-small text-weight-bolder text-uppercase"
          data-heap-name="common.phone-view-container.submit-btn"
          onClick={this.handleSubmitPhoneNumber.bind(this)}
          disabled={!phone || isSavingPhone || !isValidPhoneNumber(phone)}
        >
          {buttonContent}
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
  isLoading: PropTypes.bool,
  updatePhoneNumber: PropTypes.func,
  updateCountry: PropTypes.func,
  onSubmit: PropTypes.func,
};

PhoneViewContainer.defaultProps = {
  isLoading: false,
  updatePhoneNumber: () => {},
  updateCountry: () => {},
  onSubmit: () => {},
};

export default withTranslation()(PhoneViewContainer);
