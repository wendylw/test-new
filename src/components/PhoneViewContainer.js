import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import PhoneInput, { formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input/mobile';
import 'react-phone-number-input/style.css';
import Utils from '../utils/utils';

const metadataMobile = require('libphonenumber-js/metadata.mobile.json');
const DEFAULT_COUNTRY = 'MY';

class PhoneViewContainer extends React.Component {
  state = {
    phone: this.props.phone,
    isSavingPhone: this.props.isLoading,
  };

  componentWillReceiveProps(nextProps) {
    const { isLoading, phone } = nextProps;

    if (phone !== this.props.phone) {
      this.setState({ phone });
    }

    if (isLoading !== this.props.isLoading) {
      this.setState({ isSavingPhone: isLoading });
    }
  }

  handleUpdatePhoneNumber(phone) {
    const { updatePhoneNumber } = this.props;
    const selectedCountry = document.querySelector('.react-phone-number-input__country-select').value;

    if (metadataMobile.countries[selectedCountry]) {
      updatePhoneNumber(Utils.getFormatPhoneNumber(phone, metadataMobile.countries[selectedCountry][0]));

      this.setState({ phone });
    }
  }

  handleSubmitPhoneNumber() {
    const { onSubmit } = this.props;
    const { phone } = this.state;

    if (!isValidPhoneNumber(phone)) {
      return;
    }

    Utils.setLocalStorageVariable('user.p', phone);
    this.setState({ isSavingPhone: true });

    onSubmit(phone);
  }

  render() {
    const { t, children, title, className, country, buttonText } = this.props;
    const { isSavingPhone, phone } = this.state;
    let buttonContent = buttonText;

    if (isSavingPhone) {
      buttonContent = <div className="loader"></div>;
    }

    return (
      <aside className={className}>
        {title ? <label className="phone-view-form__label text-center">{title}</label> : null}
        <PhoneInput
          smartCaret={false}
          placeholder={t('EnterPhoneNumber')}
          data-heap-name="common.phone-view-container.phone-number-input"
          value={formatPhoneNumberIntl(phone)}
          country={country || DEFAULT_COUNTRY}
          metadata={metadataMobile}
          onChange={phone => this.handleUpdatePhoneNumber(phone)}
        />
        <button
          className="phone-view-form__button button__fill button__block border-radius-base font-weight-bolder text-uppercase"
          data-heap-name="common.phone-view-container.submit-btn"
          onClick={this.handleSubmitPhoneNumber.bind(this)}
          disabled={!phone || isSavingPhone || !isValidPhoneNumber(phone)}
        >
          {buttonContent}
        </button>
        {children}
      </aside>
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
  onSubmit: PropTypes.func,
};

PhoneViewContainer.defaultProps = {
  isLoading: false,
  updatePhoneNumber: () => {},
  onSubmit: () => {},
};

export default withTranslation()(PhoneViewContainer);
