import React, { Component, Fragment } from 'react';
import qs from 'qs';
import { withTranslation } from 'react-i18next';
import { IconEdit } from '../../../components/Icons';
import 'react-phone-number-input/style.css';
import PhoneInput, { formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input/mobile';
import Header from '../../../components/Header';
import FormTextarea from './components/FormTextarea';
import ErrorToast from '../../../components/ErrorToast';
import Utils from '../../../utils/utils';
import { computeStraightDistance } from '../../../utils/geoUtils';
import Constants from '../../../utils/constants';

import { actions as appActionCreators, getOnlineStoreInfo, getUser } from '../../redux/modules/app';
import { actions as paymentActionCreators } from '../../redux/modules/payment';
import { getCartSummary } from '../../../redux/modules/entities/carts';
import { getBusiness } from '../../../ordering/redux/modules/app';
import { getAllBusinesses } from '../../../redux/modules/entities/businesses';
import { getBusinessInfo } from '../../redux/modules/cart';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { getDeliveryDetails, actions as customerActionCreators } from '../../redux/modules/customer';
import { formatToDeliveryTime } from '../../../utils/datetime-lib';

const metadataMobile = require('libphonenumber-js/metadata.mobile.json');

const { ROUTER_PATHS, ASIDE_NAMES, DELIVERY_METHOD } = Constants;
class Customer extends Component {
  state = {
    formTextareaTitle: null,
    asideName: null,
    sentOtp: false,
    errorToast: '',
  };

  componentDidMount = async () => {
    // init username, phone, deliveryToAddress, deliveryDetails
    await this.props.customerActions.initDeliveryDetails(this.getShippingType());
  };

  componentDidUpdate(prevProps) {
    const { user } = prevProps;
    const { isLogin } = user || {};
    const { sentOtp } = this.state;

    if (sentOtp && this.props.user.isLogin && isLogin !== this.props.user.isLogin) {
      this.visitPaymentPage();
    }
  }

  getBusinessCountry = () => {
    try {
      const { businessInfo } = this.props;
      return businessInfo.country;
    } catch (e) {
      // this could happen when allBusinessInfo is not loaded.
      return undefined;
    }
  };

  visitPaymentPage() {
    const { history } = this.props;

    history.push({
      pathname: ROUTER_PATHS.ORDERING_PAYMENT,
      search: window.location.search,
    });
  }

  checkDistanceError = () => {
    const { businessInfo: business, deliveryDetails, t } = this.props;
    if (this.getShippingType() !== DELIVERY_METHOD.DELIVERY) {
      return null;
    }
    const from = {
      lat: business.stores[0].location.latitude,
      lng: business.stores[0].location.longitude,
    };
    const to = {
      lat: deliveryDetails.deliveryToLocation.latitude,
      lng: deliveryDetails.deliveryToLocation.longitude,
    };
    const maxDistance = business.qrOrderingSettings.deliveryRadius;
    const distance = computeStraightDistance(from, to);
    if (distance / 1000 > maxDistance) {
      return t(`OutOfDeliveryRange`, { distance: maxDistance.toFixed(1) });
    }
    return null;
  };

  async handleCreateOrder() {
    const { appActions, user, deliveryDetails } = this.props;
    const { phone } = deliveryDetails;
    const { isLogin } = user || {};

    const checkDistanceResult = this.checkDistanceError();
    if (checkDistanceResult) {
      this.setState({ errorToast: checkDistanceResult });
      return;
    }

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
    this.props.customerActions.patchDeliveryDetails({ username: e.target.value });
  }

  handleAddressDetails(addressDetails) {
    this.props.customerActions.patchDeliveryDetails({ addressDetails });
  }

  handleDriverComments(deliveryComments) {
    this.props.customerActions.patchDeliveryDetails({ deliveryComments });
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

  getShippingType() {
    const { history } = this.props;
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    return type;
  }

  clearErrorToast = () => {
    this.setState({ errorToast: null });
  };

  renderDeliveryTime = () => {
    const { business, allBusinessInfo } = this.props;
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });
    const { t } = this.props;

    if (!enablePreOrder) {
      return null;
    }

    const { date = {}, hour = {} } = Utils.getExpectedDeliveryDateFromSession();
    let deliveryTime;
    if (date.date && hour.from) {
      deliveryTime =
        date.isToday && hour.from === 'now'
          ? t('DeliverNow')
          : formatToDeliveryTime({ date, hour, locale: this.getBusinessCountry() });
    } else {
      deliveryTime = '';
    }

    console.log('[Customer] deliveryTime =', deliveryTime);

    return (
      <Fragment>
        <div className="flex flex-middle flex-space-between">
          <label className="form__label font-weight-bolder gray-font-opacity">{t('DeliverOn')}</label>
          <i className="customer__edit-icon">
            <IconEdit />
          </i>
        </div>
        <p className={`form__textarea ${deliveryTime ? '' : 'gray-font-opacity'}`}>
          {deliveryTime || t('AddDeliveryTimePlaceholder')}
        </p>
      </Fragment>
    );
  };

  renderDeliveryAddress() {
    const { t, history, business, allBusinessInfo } = this.props;

    if (this.getShippingType() !== DELIVERY_METHOD.DELIVERY) {
      return null;
    }

    const { addressDetails, deliveryComments } = this.props.deliveryDetails;
    const { address: deliveryToAddress } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });

    return (
      <React.Fragment>
        <div
          className="form__group"
          onClick={async () => {
            const { search } = window.location;

            const callbackUrl = encodeURIComponent(`${Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${search}`);

            history.push({
              pathname: enablePreOrder
                ? Constants.ROUTER_PATHS.ORDERING_LOCATION_AND_DATE
                : Constants.ROUTER_PATHS.ORDERING_LOCATION,
              search: `${search}&callbackUrl=${callbackUrl}`,
            });
          }}
        >
          <div className="flex flex-middle flex-space-between">
            <label className="form__label font-weight-bolder gray-font-opacity">{t('DeliverTo')}</label>
            <IconEdit className="customer__edit-icon" />
          </div>
          <p className={`form__textarea ${deliveryToAddress ? '' : 'gray-font-opacity'}`}>
            {deliveryToAddress || t('AddAddressPlaceholder')}
          </p>
          {this.renderDeliveryTime()}
        </div>
        <div className="form__group" onClick={this.handleToggleFormTextarea.bind(this, ASIDE_NAMES.ADD_ADDRESS_DETAIL)}>
          <div className="flex flex-middle flex-space-between">
            <label className="form__label font-weight-bolder gray-font-opacity">
              {t('AddAddressDetailsPlaceholder')}
            </label>
            <IconEdit className="customer__edit-icon" />
          </div>
          <p className={`form__textarea ${addressDetails ? '' : 'gray-font-opacity'}`}>
            {addressDetails || t('AddressDetailsPlaceholder')}
          </p>
        </div>
        <div
          className="form__group flex flex-middle flex-space-between"
          onClick={this.handleToggleFormTextarea.bind(this, ASIDE_NAMES.ADD_DRIVER_NOTE)}
        >
          <p className="gray-font-opacity">{deliveryComments || t('AddNoteToDriverPlaceholder')}</p>
          <IconEdit className="customer__edit-icon" />
        </div>
      </React.Fragment>
    );
  }

  renderPickUpInfo() {
    const { t, history, business, allBusinessInfo, businessInfo = {} } = this.props;
    const { stores = [], country: locale } = businessInfo;

    if (!stores.length) return;

    const pickUpAddress = Utils.getValidAddress(stores[0], Constants.ADDRESS_RANGE.CITY);
    const { deliveryComments } = this.props.deliveryDetails;
    const { date, hour } = Utils.getExpectedDeliveryDateFromSession();
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });

    if (this.getShippingType() !== DELIVERY_METHOD.PICKUP || !enablePreOrder) {
      return null;
    }
    const pickUpTime = formatToDeliveryTime({
      date: date,
      hour: hour,
      locale,
    });

    return (
      <React.Fragment>
        <div
          className="form__group"
          onClick={async () => {
            const { search } = window.location;

            const callbackUrl = encodeURIComponent(`${Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${search}`);

            history.push({
              pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
              search: `${search}&callbackUrl=${callbackUrl}`,
            });
          }}
        >
          <div className="flex flex-middle flex-space-between">
            <label className="form__label font-weight-bolder gray-font-opacity">{t('PickupAt')}</label>
            {/* <IconEdit className="customer__edit-icon" /> */}
          </div>
          <p className={`form__textarea ${pickUpAddress ? '' : 'gray-font-opacity'}`}>
            {pickUpAddress || t('PickUpAtPlaceholder')}
          </p>
          <div className="flex flex-middle flex-space-between">
            <label className="form__label font-weight-bolder gray-font-opacity">{t('PickUpOn')}</label>
            <IconEdit className="customer__edit-icon" />
          </div>
          <p className={`form__textarea ${pickUpTime ? '' : 'gray-font-opacity'}`}>
            {pickUpTime || t('PickUpAtPlaceholder')}
          </p>
        </div>
        <div
          className="form__group flex flex-middle flex-space-between"
          onClick={this.handleToggleFormTextarea.bind(this, ASIDE_NAMES.ADD_DRIVER_NOTE)}
        >
          <p className="gray-font-opacity">{deliveryComments || t('AddNoteToDriverPlaceholder')}</p>
          <IconEdit className="customer__edit-icon" />
        </div>
      </React.Fragment>
    );
  }

  render() {
    const { t, user, history, onlineStoreInfo, deliveryDetails, business, allBusinessInfo } = this.props;
    const { asideName, formTextareaTitle, errorToast } = this.state;
    const { isFetching } = user || {};
    const { country } = onlineStoreInfo || {};
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    const { address: deliveryToAddress } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');
    const { date = {} } = Utils.getExpectedDeliveryDateFromSession();
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });
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
          className="text-center gray has-right flex-middle"
          isPage={true}
          title={type === DELIVERY_METHOD.DELIVERY ? t('DeliveryDetails') : t('PickUpDetails')}
          navFunc={() => {
            history.push({
              pathname: ROUTER_PATHS.ORDERING_CART,
              search: window.location.search,
            });
          }}
        ></Header>
        <div className="customer__content">
          <form className="customer__form">
            <div className="form__group">
              <label className="form__label gray-font-opacity">{t('Name')}</label>
              <input
                className="input input__block"
                type="text"
                defaultValue={deliveryDetails.username}
                onChange={e => {
                  this.props.customerActions.patchDeliveryDetails({ username: e.target.value.trim() });
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

                  this.props.customerActions.patchDeliveryDetails({
                    phone:
                      metadataMobile.countries[selectedCountry] &&
                      Utils.getFormatPhoneNumber(phone || '', metadataMobile.countries[selectedCountry][0]),
                  });
                }}
              />
            </div>

            {this.renderDeliveryAddress()}
            {this.renderPickUpInfo()}
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
              className="billing__button button button__fill button__block dark font-weight-bolder"
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
              className="billing__link button button__fill button__block font-weight-bolder"
              onClick={this.handleCreateOrder.bind(this)}
              disabled={
                (type === DELIVERY_METHOD.DELIVERY && !Boolean((deliveryToAddress || '').trim())) ||
                !Boolean((deliveryDetails.username || '').trim()) ||
                !isValidPhoneNumber(deliveryDetails.phone) ||
                !!(enablePreOrder && !date.date) ||
                isFetching
              }
            >
              {isFetching ? <div className="loader"></div> : t('Continue')}
            </button>
          </div>
        </footer>
        {errorToast && <ErrorToast message={errorToast} clearError={this.clearErrorToast} />}
      </section>
    );
  }
}

export default compose(
  withTranslation('OrderingDelivery'),
  connect(
    state => {
      return {
        user: getUser(state),
        cartSummary: getCartSummary(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        deliveryDetails: getDeliveryDetails(state),
        business: getBusiness(state),
        allBusinessInfo: getAllBusinesses(state),
        businessInfo: getBusinessInfo(state),
      };
    },
    dispatch => ({
      customerActions: bindActionCreators(customerActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
    })
  )
)(Customer);
