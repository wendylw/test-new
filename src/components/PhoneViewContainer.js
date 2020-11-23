import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import PhoneInput, {
  formatPhoneNumberIntl,
  isValidPhoneNumber,
  getCountryCallingCode,
} from 'react-phone-number-input/mobile';
import 'react-phone-number-input/style.css';
import Utils from '../utils/utils';
import './PhoneViewContainer.scss';

const metadataMobile = require('libphonenumber-js/metadata.mobile.json');
const DEFAULT_COUNTRY = 'MY';
const INTERNATIONAL = {
  NAME: 'ZZ',
  CODE: '1',
};

class PhoneViewContainer extends React.Component {
  state = {
    phone: this.props.phone,
    isSavingPhone: this.props.isLoading,
    isInitCoed: false,
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

  intiCode = country => {
    let value = '';
    if (!country) return value;

    if (country === INTERNATIONAL.NAME) {
      value = `+${INTERNATIONAL.CODE}`;
    } else {
      value = `+${getCountryCallingCode(country)}`;
    }

    if (country && !this.state.isInitCoed) {
      const timer = setTimeout(() => {
        const input = document.querySelector(
          '.react-phone-number-input__input.react-phone-number-input__phone.react-phone-number-input__input--style'
        );

        input.value = value;
        this.setState({
          isInitCoed: true,
        });

        clearTimeout(timer);
      }, 0);
    }
  };

  async handleUpdatePhoneNumber(phone) {
    const { updatePhoneNumber } = this.props;
    const selectedCountry = document.querySelector('.react-phone-number-input__country-select').value;

    if (phone === undefined) {
      this.setState(
        {
          isInitCoed: false,
        },
        () => {
          this.intiCode(selectedCountry);
        }
      );
    }

    await this.props.customerActions.patchDeliveryDetails({
      phone:
        metadataMobile.countries[selectedCountry] &&
        Utils.getFormatPhoneNumber(phone || '', metadataMobile.countries[selectedCountry][0]),
    });

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
    const { t, children, title, className, country, buttonText, content } = this.props;
    const { isSavingPhone, phone } = this.state;
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
        <PhoneInput
          smartCaret={false}
          placeholder={t('EnterPhoneNumber')}
          data-heap-name="common.phone-view-container.phone-number-input"
          value={formatPhoneNumberIntl(phone) || this.intiCode(country)}
          country={country || DEFAULT_COUNTRY}
          metadata={metadataMobile}
          onChange={phone => this.handleUpdatePhoneNumber(phone)}
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
  onSubmit: PropTypes.func,
};

PhoneViewContainer.defaultProps = {
  isLoading: false,
  updatePhoneNumber: () => {},
  onSubmit: () => {},
};

export default withTranslation()(PhoneViewContainer);
