import React, { Component } from 'react';
import qs from 'qs';
import { withTranslation } from 'react-i18next';
import { IconEdit } from '../../../components/Icons';
import 'react-phone-number-input/style.css';
import PhoneInput, { formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input/mobile';
import Header from '../../../components/Header';
import FormTextarea from './components/FormTextarea';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';

import { actions as appActionCreators } from '../../redux/modules/app';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

const metadataMobile = require('libphonenumber-js/metadata.mobile.json');

class Customer extends Component {
  state = {
    phone: Utils.getLocalStorageVariable('user.p'),
    deliveryComments: null,
  };

  async savePhoneNumber() {
    const { phone } = this.state;

    if (!isValidPhoneNumber(phone)) {
      return;
    }

    await Utils.setLocalStorageVariable('user.p', phone);
    // this.setState({ isLoading: true });

    // submitPhoneNumber();
  }

  handleChangeDriverComments(deliveryComments) {
    this.setState({
      deliveryComments,
    });

    Utils.setSessionVariable('deliveryComments', deliveryComments);
  }

  renderDeliveryAddress() {
    const { t } = this.props;
    const addressInfo = JSON.parse(Utils.getLocalStorageVariable('addressInfo'));
    let addressString = null;

    if (addressInfo) {
      addressString = Utils.getValidAddress(addressInfo, Constants.ADDRESS_RANGE.COUNTRY);
    }
    // const deliveryAddressInfo = {
    //   ...JSON.parse(Utils.getLocalStorageVariable('addressInfo')),
    //   street1: "",
    // };

    return (
      <React.Fragment>
        <div className="form__group">
          <div className="flex flex-middle flex-space-between">
            <label className="form__label font-weight-bold gray-font-opacity">{t('DeliverTo')}</label>
            <i className="customer__edit-icon">
              <IconEdit />
            </i>
          </div>
          {/* TODO: fill in to remove gray-font-opacity */}
          <p className="form__textarea gray-font-opacity">{addressString || t('AddAddressPlaceholder')}</p>
        </div>
        <div className="form__group" onClick={() => {}}>
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
      </React.Fragment>
    );
  }

  render() {
    const { t, history } = this.props;
    const { phone } = this.state;

    return (
      <section className={`table-ordering__customer` /* hide */}>
        <Header
          className="text-center gray has-right"
          isPage={true}
          title={t('DeliveryDetails')}
          navFunc={() => {}}
        ></Header>
        <div className="customer__content">
          {/* <ul className="flex">
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
          </ul> */}

          <form className="customer__form">
            <div className="form__group">
              <label className="form__label gray-font-opacity">{t('Name')}</label>
              <input className="input input__block" type="text" />
            </div>

            <div className="form__group border__bottom-divider">
              <label className="form__label gray-font-opacity">{t('MobileNumber')}</label>
              <PhoneInput
                placeholder=""
                value={formatPhoneNumberIntl('')}
                country={''}
                metadata={metadataMobile}
                onChange={phone => {
                  const selectedCountry = document.querySelector('.react-phone-number-input__country-select').value;

                  if (metadataMobile.countries[selectedCountry]) {
                    this.setState({
                      phone: Utils.getFormatPhoneNumber(phone, metadataMobile.countries[selectedCountry][0]),
                    });
                  }
                }}
              />
            </div>

            {this.renderDeliveryAddress()}
          </form>
        </div>

        <FormTextarea />

        <footer className="footer-operation grid flex flex-middle flex-space-between">
          <div className="footer-operation__item width-1-3">
            <button
              className="billing__button button button__fill button__block dark font-weight-bold"
              onClick={() => {
                const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

                history.push({
                  pathname: Constants.ROUTER_PATHS.ORDERING_CART,
                  search: type ? `?type=${type}` : '',
                });
              }}
            >
              {t('Back')}
            </button>
          </div>
          <div className="footer-operation__item width-2-3">
            <button
              className="billing__link button button__fill button__block font-weight-bold"
              onClick={() => {}}
              disabled={!isValidPhoneNumber(phone)}
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
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Customer);
