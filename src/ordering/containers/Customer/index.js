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

import { actions as appActionCreators, getOnlineStoreInfo, getUser } from '../../redux/modules/app';
import { actions as paymentActionCreators } from '../../redux/modules/payment';
import { getCartSummary } from '../../../redux/modules/entities/carts';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

const metadataMobile = require('libphonenumber-js/metadata.mobile.json');

const { ROUTER_PATHS, ADDRESS_RANGE, ASIDE_NAMES } = Constants;
class Customer extends Component {
  state = {
    phone: Utils.getLocalStorageVariable('user.p'),
    addressDetails: Utils.getLocalStorageVariable('addressDetails'),
    deliveryComments: Utils.getSessionVariable('deliveryComments'),
    formTextareaTitle: null,
    asideName: null,
  };

  async savePhoneNumber() {
    const { appActions } = this.props;
    const { phone } = this.state;

    if (!isValidPhoneNumber(phone)) {
      return;
    }

    await Utils.setLocalStorageVariable('user.p', phone);
    // await appActions.getOtp({ phone });
  }

  async handleCreateOrder() {
    this.savePhoneNumber();

    const { history } = this.props;

    history.push({
      pathname: ROUTER_PATHS.ORDERING_PAYMENT,
      search: window.location.search,
    });
  }

  handleUpdateName(e) {
    Utils.setLocalStorageVariable('user.name', e.target.value);
  }

  handleDriverComments(deliveryComments) {
    this.setState({
      deliveryComments,
    });

    Utils.setSessionVariable('deliveryComments', deliveryComments);
  }

  handleAddressDetails(addressDetails) {
    this.setState({
      addressDetails,
    });

    Utils.setLocalStorageVariable('addressDetails', addressDetails);
  }

  handleToggleFormTextarea(asideName) {
    const { t } = this.props;

    this.setState({
      asideName,
      formTextareaTitle: t(
        asideName === ASIDE_NAMES.ADD_DRIVER_NOTE ? 'AddNoteToDriverPlaceholder' : 'AddAddressDetailsPlaceholder'
      ),
    });
  }

  renderDeliveryAddress() {
    const { t, history } = this.props;
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    if (type !== 'delivery') {
      return null;
    }

    const { addressDetails, deliveryComments } = this.state;
    const addressInfo = JSON.parse(Utils.getLocalStorageVariable('currentAddress'));
    let addressString = null;

    if (addressInfo) {
      addressString = Utils.getValidAddress(addressInfo, ADDRESS_RANGE.COUNTRY);
    }

    return (
      <React.Fragment>
        <div className="form__group">
          <div className="flex flex-middle flex-space-between">
            <label className="form__label font-weight-bold gray-font-opacity">{t('DeliverTo')}</label>
            <i className="customer__edit-icon">
              <IconEdit />
            </i>
          </div>
          <p className="form__textarea gray-font-opacity">{addressString || t('AddAddressPlaceholder')}</p>
        </div>
        <div className="form__group" onClick={this.handleToggleFormTextarea.bind(this, ASIDE_NAMES.ADD_ADDRESS_DETAIL)}>
          <label className="form__label font-weight-bold gray-font-opacity">{t('AddressDetails')}</label>
          <div className="flex flex-middle flex-space-between">
            <p className="gray-font-opacity">{addressDetails || t('AddressDetailsPlaceholder')}</p>
            <i className="customer__edit-icon">
              <IconEdit />
            </i>
          </div>
        </div>
        <div
          className="form__group flex flex-middle flex-space-between"
          onClick={this.handleToggleFormTextarea.bind(this, ASIDE_NAMES.ADD_DRIVER_NOTE)}
        >
          <p className="gray-font-opacity">{deliveryComments || t('AddNoteToDriverPlaceholder')}</p>
          <i className="customer__edit-icon">
            <IconEdit />
          </i>
        </div>
      </React.Fragment>
    );
  }

  render() {
    const { t, history, onlineStoreInfo } = this.props;
    const { phone, asideName, formTextareaTitle } = this.state;
    const { country } = onlineStoreInfo || {};
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    return (
      <section className={`table-ordering__customer` /* hide */}>
        <Header
          className="text-center gray has-right"
          isPage={true}
          title={t('DeliveryDetails')}
          navFunc={() => {
            history.push({
              pathname: ROUTER_PATHS.ORDERING_CART,
              search: type ? `?type=${type}` : '',
            });
          }}
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
              <input className="input input__block" type="text" onChange={this.handleUpdateName.bind(this)} />
            </div>

            <div className="form__group border__bottom-divider">
              <label className="form__label gray-font-opacity">{t('MobileNumber')}</label>
              <PhoneInput
                placeholder=""
                value={formatPhoneNumberIntl(phone)}
                country={country}
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

        <FormTextarea
          show={!!asideName}
          onToggle={this.handleToggleFormTextarea.bind(this)}
          title={formTextareaTitle}
          onUpdateText={
            asideName === ASIDE_NAMES.ADD_DRIVER_NOTE
              ? this.handleDriverComments.bind(this)
              : this.handleAddressDetails.bind(this)
          }
        />

        <footer className="footer-operation grid flex flex-middle flex-space-between">
          <div className="footer-operation__item width-1-3">
            <button
              className="billing__button button button__fill button__block dark font-weight-bold"
              onClick={() => {
                history.push({
                  pathname: ROUTER_PATHS.ORDERING_CART,
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
              onClick={this.handleCreateOrder.bind(this)}
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
      return {
        user: getUser(state),
        cartSummary: getCartSummary(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
    })
  )
)(Customer);
