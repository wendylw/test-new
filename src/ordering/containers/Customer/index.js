import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { IconEdit } from '../../../components/Icons';
import 'react-phone-number-input/style.css';
import PhoneInput, { formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input/mobile';
import Header from '../../../components/Header';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

const metadataMobile = require('libphonenumber-js/metadata.mobile.json');

class Customer extends Component {
  state = {};

  render() {
    const { t, setPhone } = this.props;

    return (
      <section className={`table-ordering__customer` /* hide */}>
        <Header
          className="text-center gray has-right"
          isPage={true}
          title={t('DeliveryDetails')}
          navFunc={() => {}}
        ></Header>
        <div className="customer__content">
          <ul className="flex">
            <li className="customer__method flex flex-middle">
              <div className={`radio active`}>
                <i className="radio__check-icon"></i>
                <input type="radio"></input>
              </div>
              <label className="customer__method-label font-weight-bold">{t('FoodDelivery')}</label>
            </li>
            <li className="customer__method flex flex-middle">
              <div className={`radio`}>
                <i className="radio__check-icon"></i>
                <input type="radio"></input>
              </div>
              <label className="customer__method-label font-weight-bold">{t('SelfPickup')}</label>
            </li>
          </ul>

          <form className="customer__form">
            <div className="form__group">
              <label className="form__label gray-font-opacity">{t('Name')}</label>
              <input class="input input__block" type="text" />
            </div>

            <div className="form__group">
              <label className="form__label gray-font-opacity">{t('MobileNumber')}</label>
              <PhoneInput
                placeholder=""
                value={formatPhoneNumberIntl('')}
                country={''}
                metadata={metadataMobile}
                onChange={phone => {
                  const selectedCountry = document.querySelector('.react-phone-number-input__country-select').value;

                  if (metadataMobile.countries[selectedCountry]) {
                    setPhone(Utils.getFormatPhoneNumber(phone, metadataMobile.countries[selectedCountry][0]));
                  }
                }}
              />
            </div>

            <div className="form__group">
              <div className="flex flex-middle flex-space-between">
                <label className="form__label font-weight-bold gray-font-opacity">{t('DeliverTo')}</label>
                <i className="customer__edit-icon">
                  <IconEdit />
                </i>
              </div>
              {/* TODO: fill in to remove gray-font-opacity */}
              <p className="form__textarea gray-font-opacity">{t('AddAddressPlaceholder')}</p>
            </div>
            <div className="form__group">
              <label className="form__label font-weight-bold gray-font-opacity">{t('AddressDetails')}</label>
              <div className="flex flex-middle flex-space-between">
                <p className="gray-font-opacity">{t('AddressDetailsPlaceholder')}</p>
                <i className="customer__edit-icon">
                  <IconEdit />
                </i>
              </div>
            </div>
            <div className="form__group flex flex-middle flex-space-between">
              <p className="gray-font-opacity">{t('AddNoteToDriverPlaceholder')}</p>
              <i className="customer__edit-icon">
                <IconEdit />
              </i>
            </div>
          </form>
        </div>

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

        <footer className="footer-operation grid flex flex-middle flex-space-between">
          <div className="footer-operation__item width-1-3">
            <button
              className="billing__button button button__fill button__block dark font-weight-bold"
              onClick={() => {}}
            >
              {t('Back')}
            </button>
          </div>
          <div className="footer-operation__item width-2-3">
            <button
              className="billing__link button button__fill button__block font-weight-bold"
              onClick={() => {}}
              disabled={false}
            >
              {t('Continue')}
            </button>
          </div>
        </footer>
      </section>
    );
  }
}

export default compose(
  withTranslation(),
  connect(
    state => {
      return {};
    },
    dispatch => ({})
  )
)(Customer);
