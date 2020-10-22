import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import PhoneInput, { formatPhoneNumberIntl } from 'react-phone-number-input/mobile';
import Utils from '../../../../../utils/utils';

const metadataMobile = require('libphonenumber-js/metadata.mobile.json');

class ContactDetails extends Component {
  render() {
    const { t, name, phone, country } = this.props;
    return (
      <div>
        <p>{t('ContactTip')}</p>
        <div>
          <form>
            <div className="padding-top-bottom-small">
              <div className="contact-details__group form__group">
                <input
                  className="contact-details__input form__input padding-left-right-normal text-size-biggest"
                  data-heap-name="ordering.contact-details.name-input"
                  type="text"
                  placeholder={t('Name')}
                  defaultValue={name}
                  // onChange={e => {
                  //   this.props.customerActions.patchDeliveryDetails({ username: e.target.value.trim() });
                  // }}
                />
              </div>
            </div>

            <div className="padding-top-bottom-small">
              <PhoneInput
                smartCaret={false}
                data-heap-name="ordering.contact-details.phone-input"
                placeholder={t('EnterPhoneNumber')}
                value={formatPhoneNumberIntl(phone)}
                country={country}
                metadata={metadataMobile}
                onChange={phone => {
                  const selectedCountry = document.querySelector('.react-phone-number-input__country-select').value;

                  this.props.customerActions.patchDeliveryDetails({
                    phone:
                      metadataMobile.countries[selectedCountry] &&
                      Utils.getFormatPhoneNumber(phone || '', metadataMobile.countries[selectedCountry][0]),
                  });
                }}
              />
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default withTranslation(ContactDetails);
