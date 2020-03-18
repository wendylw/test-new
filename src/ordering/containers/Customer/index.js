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

const { ROUTER_PATHS, ASIDE_NAMES } = Constants;
class Customer extends Component {
  state = {
    phone: Utils.getLocalStorageVariable('user.p'),
    deliverToAddress: Utils.getLocalStorageVariable('address'),
    addressDetails: Utils.getLocalStorageVariable('addressDetails'),
    deliveryComments: Utils.getSessionVariable('deliveryComments'),
    formTextareaTitle: null,
    asideName: null,
    sentOtp: false,
  };

  componentDidUpdate(prevProps) {
    const { user } = prevProps;
    const { isLogin } = user || {};
    const { sentOtp } = this.state;

    if (sentOtp && this.props.user.isLogin && isLogin !== this.props.user.isLogin) {
      this.visitPaymentPage();
    }
  }

  visitPaymentPage() {
    const { history } = this.props;

    history.push({
      pathname: ROUTER_PATHS.ORDERING_PAYMENT,
      search: window.location.search,
    });
  }

  async handleCreateOrder() {
    const { appActions, user } = this.props;
    const { phone } = this.state;
    const { isLogin } = user || {};

    if (!isValidPhoneNumber(phone)) {
      return;
    }

    await Utils.setLocalStorageVariable('user.p', phone);

    if (!isLogin) {
      await appActions.getOtp({ phone });
      this.setState({ sentOtp: true });
    } else {
      this.visitPaymentPage();
    }
  }

  handleUpdateName(e) {
    Utils.setLocalStorageVariable('user.name', e.target.value);
  }

  handleDeliverToAddress(deliverToAddress) {
    this.setState({
      deliverToAddress,
    });

    Utils.setLocalStorageVariable('address', deliverToAddress);
  }

  handleAddressDetails(addressDetails) {
    this.setState({
      addressDetails,
    });

    Utils.setLocalStorageVariable('addressDetails', addressDetails);
  }

  handleDriverComments(deliveryComments) {
    this.setState({
      deliveryComments,
    });

    Utils.setSessionVariable('deliveryComments', deliveryComments);
  }

  handleToggleFormTextarea(asideName) {
    const { t } = this.props;
    let formTextareaTitle = 'Add in your address*';

    if (asideName === ASIDE_NAMES.ADD_DRIVER_NOTE) {
      formTextareaTitle = t('AddNoteToDriverPlaceholder');
    } else if (asideName === ASIDE_NAMES.ADD_ADDRESS_DETAIL) {
      formTextareaTitle = t('AddAddressDetailsPlaceholder');
    }

    this.setState({
      asideName,
      formTextareaTitle,
    });
  }

  renderDeliveryAddress() {
    const { t, history } = this.props;
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    if (type !== 'delivery') {
      return null;
    }

    const { deliverToAddress, addressDetails, deliveryComments } = this.state;
    // const currentAddress = JSON.parse(Utils.getSessionVariable('currentAddress'));
    // const { address } = currentAddress || {};

    return (
      <React.Fragment>
        <div
          className="form__group"
          onClick={() => {
            // history.push({
            //   pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION,
            //   search: window.location.search,
            // });
            this.handleToggleFormTextarea('DELIVER_TO_ADDRESS');
          }}
        >
          <div className="flex flex-middle flex-space-between">
            <label className="form__label font-weight-bold gray-font-opacity">{t('DeliverTo')}</label>
            <i className="customer__edit-icon">
              <IconEdit />
            </i>
          </div>
          <p className="form__textarea gray-font-opacity">
            {/*address ||*/ deliverToAddress || t('AddAddressPlaceholder')}
          </p>
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
    const { phone, asideName, formTextareaTitle, addressDetails } = this.state;
    const { country } = onlineStoreInfo || {};
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    let updateTextFunc = this.handleDeliverToAddress.bind(this);

    if (asideName === ASIDE_NAMES.ADD_DRIVER_NOTE) {
      updateTextFunc = this.handleDriverComments.bind(this);
    } else if (asideName === ASIDE_NAMES.ADD_DRIVER_NOTE) {
      updateTextFunc = this.handleAddressDetails.bind(this);
    }

    return (
      <section className={`table-ordering__customer` /* hide */}>
        <Header
          className="text-center gray has-right"
          isPage={true}
          title={t('DeliveryDetails')}
          navFunc={() => {
            history.push({
              pathname: ROUTER_PATHS.ORDERING_CART,
              search: window.location.search,
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
          onUpdateText={updateTextFunc}
        />

        <footer className="footer-operation grid flex flex-middle flex-space-between">
          <div className="footer-operation__item width-1-3">
            <button
              className="billing__button button button__fill button__block dark font-weight-bold"
              onClick={() => {
                history.push({
                  pathname: ROUTER_PATHS.ORDERING_CART,
                  search: window.location.search,
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
              disabled={(type === 'delivery' && !addressDetails) || !isValidPhoneNumber(phone)}
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
