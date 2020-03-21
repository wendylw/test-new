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
import { getDeliveryDetails, actions as customerActionCreators } from '../../redux/modules/customer';

const metadataMobile = require('libphonenumber-js/metadata.mobile.json');

const { ROUTER_PATHS, ASIDE_NAMES } = Constants;
class Customer extends Component {
  state = {
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
    const { appActions, user, deliveryDetails } = this.props;
    const { phone } = deliveryDetails;
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
    this.props.customerActions.putDeliveryDetails({ username: e.target.value });
  }

  handleAddressDetails(addressDetails) {
    this.props.customerActions.putDeliveryDetails({ addressDetails });
  }

  handleDriverComments(deliveryComments) {
    this.props.customerActions.putDeliveryDetails({ deliveryComments });
  }

  handleToggleFormTextarea(asideName) {
    const { t } = this.props;
    let formTextareaTitle = '';

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

    const { addressDetails /*, deliveryComments*/ } = this.props.deliveryDetails;
    const deliveryToAddress = Utils.getSessionVariable('deliveryAddress');

    return (
      <React.Fragment>
        <div
          className="form__group"
          onClick={async () => {
            await Utils.setSessionVariable(
              'deliveryCallbackUrl',
              `${Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${window.location.search}`
            );

            history.push({
              pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION,
              search: window.location.search,
            });
          }}
        >
          <div className="flex flex-middle flex-space-between">
            <label className="form__label font-weight-bold gray-font-opacity">{t('DeliverTo')}</label>
            <i className="customer__edit-icon">
              <IconEdit />
            </i>
          </div>
          <p className="form__textarea gray-font-opacity">{deliveryToAddress || t('AddAddressPlaceholder')}</p>
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
        {/* <div
          className="form__group flex flex-middle flex-space-between"
          onClick={this.handleToggleFormTextarea.bind(this, ASIDE_NAMES.ADD_DRIVER_NOTE)}
        >
          <p className="gray-font-opacity">{deliveryComments || t('AddNoteToDriverPlaceholder')}</p>
          <i className="customer__edit-icon">
            <IconEdit />
          </i>
        </div> */}
      </React.Fragment>
    );
  }

  render() {
    const { t, user, history, onlineStoreInfo, deliveryDetails } = this.props;
    const { asideName, formTextareaTitle } = this.state;
    const { isFetching } = user || {};
    const { country } = onlineStoreInfo || {};
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    let textareaValue = '';
    let updateTextFunc = () => {};

    if (asideName === ASIDE_NAMES.ADD_DRIVER_NOTE) {
      textareaValue = deliveryDetails.deliveryComments;
      updateTextFunc = this.handleDriverComments.bind(this);
    } else if (asideName === ASIDE_NAMES.ADD_ADDRESS_DETAIL) {
      textareaValue = deliveryDetails.addressDetails;
      updateTextFunc = this.handleAddressDetails.bind(this);
    }

    return (
      <section className={`table-ordering__customer` /* hide */}>
        <Header
          className="text-center gray has-right"
          isPage={true}
          title={type === 'delivery' ? t('DeliveryDetails') : t('PickUpDetails')}
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
              <input
                className="input input__block"
                type="text"
                defaultValue={deliveryDetails.username}
                onChange={e => {
                  this.props.customerActions.putDeliveryDetails({ username: e.target.value.trim() });
                }}
              />
            </div>

            <div className="form__group border__bottom-divider">
              <label className="form__label gray-font-opacity">{t('MobileNumber')}</label>
              <PhoneInput
                smartCaret={false}
                placeholder=""
                value={formatPhoneNumberIntl(deliveryDetails.phone)}
                country={country}
                metadata={metadataMobile}
                onChange={phone => {
                  const selectedCountry = document.querySelector('.react-phone-number-input__country-select').value;

                  this.props.customerActions.putDeliveryDetails({
                    phone:
                      metadataMobile.countries[selectedCountry] &&
                      Utils.getFormatPhoneNumber(phone || '', metadataMobile.countries[selectedCountry][0]),
                  });
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
          textareaValue={textareaValue}
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
              disabled={
                (type === 'delivery' &&
                  (!Boolean(deliveryDetails.addressDetails) || !Boolean(deliveryDetails.deliverToAddress))) ||
                !Boolean(deliveryDetails.username) ||
                !isValidPhoneNumber(deliveryDetails.phone) ||
                isFetching
              }
            >
              {isFetching ? <div className="loader"></div> : t('Continue')}
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
        deliveryDetails: getDeliveryDetails(state),
      };
    },
    dispatch => ({
      customerActions: bindActionCreators(customerActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
    })
  )
)(Customer);
