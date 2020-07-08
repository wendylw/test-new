import React, { Component } from 'react';
import qs from 'qs';
import isEmpty from 'lodash/isEmpty';
import { withTranslation } from 'react-i18next';
import 'react-phone-number-input/style.css';
import PhoneInput, { formatPhoneNumberIntl, isValidPhoneNumber } from 'react-phone-number-input/mobile';
import { IconNext } from '../../../components/Icons';
import Header from '../../../components/Header';
import FormTextarea from './components/FormTextarea';
import ErrorToast from '../../../components/ErrorToast';
import CreateOrderButton from '../../components/CreateOrderButton';
import Utils from '../../../utils/utils';
import { computeStraightDistance } from '../../../utils/geoUtils';
import Constants from '../../../utils/constants';

import { actions as homeActionCreators } from '../../redux/modules/home';
import { actions as appActionCreators, getOnlineStoreInfo, getUser } from '../../redux/modules/app';
import { actions as paymentActionCreators, getCurrentOrderId } from '../../redux/modules/payment';
import { getOrderByOrderId } from '../../../redux/modules/entities/orders';
import { getCartSummary } from '../../../redux/modules/entities/carts';
import { getBusiness } from '../../../ordering/redux/modules/app';
import { getAllBusinesses } from '../../../redux/modules/entities/businesses';
import { getBusinessInfo } from '../../redux/modules/cart';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { getDeliveryDetails, actions as customerActionCreators } from '../../redux/modules/customer';
import { formatToDeliveryTime } from '../../../utils/datetime-lib';

const metadataMobile = require('libphonenumber-js/metadata.mobile.json');

const { ROUTER_PATHS, ASIDE_NAMES, DELIVERY_METHOD, PREORDER_IMMEDIATE_TAG } = Constants;
class Customer extends Component {
  state = {
    formTextareaTitle: null,
    asideName: null,
    sentOtp: false,
    errorToast: '',
  };

  componentDidMount = async () => {
    const { homeActions, customerActions } = this.props;

    await homeActions.loadShoppingCart();

    // init username, phone, deliveryToAddress, deliveryDetails
    await customerActions.initDeliveryDetails(this.getShippingType());
  };

  componentDidUpdate(prevProps) {
    const { user } = prevProps;
    const { isLogin } = user || {};
    const { cartSummary } = this.props;
    const { sentOtp } = this.state;
    const { total } = cartSummary || {};

    if (sentOtp && total && isLogin && isLogin !== this.props.user.isLogin) {
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
    const { history, user } = this.props;
    const { isLogin } = user || {};

    if (isLogin) {
      history.push({
        pathname: ROUTER_PATHS.ORDERING_PAYMENT,
        search: window.location.search,
      });
    }
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

  async handleBeforeCreateOrder() {
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
    } else if (asideName === ASIDE_NAMES.ADD_MERCHANT_NOTE) {
      formTextareaTitle = t('AddNoteToMerchantPlaceholder');
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

  getHeaderTitle = () => {
    const { t } = this.props;
    const type = Utils.getOrderTypeFromUrl();

    switch (type) {
      case DELIVERY_METHOD.DELIVERY:
        return t('DeliveryDetails');
      case DELIVERY_METHOD.PICKUP:
        return t('PickUpDetails');
      case DELIVERY_METHOD.DINE_IN:
      case DELIVERY_METHOD.TAKE_AWAY:
      default:
        return t('CustomerDetails');
    }
  };

  getCanContinue = () => {
    const { isFetching, deliveryDetails, business, allBusinessInfo } = this.props;
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });
    const { date = {} } = Utils.getExpectedDeliveryDateFromSession();
    const type = Utils.getOrderTypeFromUrl();
    const username = (deliveryDetails.username || '').trim();
    const phone = deliveryDetails.phone;

    if (isFetching || !isValidPhoneNumber(phone) || isEmpty(username)) {
      return false;
    }

    if (enablePreOrder && (type === DELIVERY_METHOD.DELIVERY || type === DELIVERY_METHOD.PICKUP)) {
      if (!date.date) {
        return false;
      }
    }

    switch (type) {
      case DELIVERY_METHOD.DELIVERY:
        const deliveryAddress = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');
        const address = (deliveryAddress.address || '').trim();
        return !isEmpty(address);
      default:
    }

    return true;
  };

  renderDeliveryTime = () => {
    const { t, business, allBusinessInfo, history } = this.props;
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });

    if (!enablePreOrder) {
      return null;
    }

    const { date = {}, hour = {} } = Utils.getExpectedDeliveryDateFromSession();
    let deliveryTime;
    if (date.date && hour.from) {
      deliveryTime =
        date.isToday && hour.from === PREORDER_IMMEDIATE_TAG.from
          ? t('DeliverNow')
          : formatToDeliveryTime({ date, hour, locale: this.getBusinessCountry() });
    } else {
      deliveryTime = '';
    }

    return (
      <div
        className="form__group border-radius-base"
        data-heap-name="ordering.customer.delivery-time"
        onClick={async () => {
          const { search } = window.location;

          const callbackUrl = encodeURIComponent(`${Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${search}`);

          history.push({
            pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
            search: `${search}&callbackUrl=${callbackUrl}`,
          });
        }}
      >
        <p className={`form__textarea ${deliveryTime ? '' : 'gray-font-opacity'}`}>
          {deliveryTime || t('AddDeliveryTimePlaceholder')}
        </p>
      </div>
    );
  };
  handleInputChange = e => {
    const inputValue = e.target.value;
    e.target.name === 'addressDetails' &&
      this.props.customerActions.patchDeliveryDetails({ addressDetails: inputValue });
    e.target.name === 'deliveryComments' &&
      this.props.customerActions.patchDeliveryDetails({ deliveryComments: inputValue });
  };
  renderDeliveryAddress() {
    const { t, history } = this.props;

    if (this.getShippingType() !== DELIVERY_METHOD.DELIVERY) {
      return null;
    }

    const { addressDetails, deliveryComments } = this.props.deliveryDetails;
    const { address: deliveryToAddress } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');

    return (
      <React.Fragment>
        <label className="form__label font-weight-bolder">{t('DeliveryTimeAndAddressTitle')}</label>
        {this.renderDeliveryTime()}

        <div
          className="form__group border-radius-base flex flex-middle flex-space-between"
          data-heap-name="ordering.customer.delivery-address"
          onClick={async () => {
            const { search } = window.location;

            const callbackUrl = encodeURIComponent(`${Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${search}`);

            history.push({
              pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION,
              search: `${search}&callbackUrl=${callbackUrl}`,
            });
          }}
        >
          <p className={`form__textarea ${deliveryToAddress ? '' : 'gray-font-opacity'}`}>
            {deliveryToAddress || t('AddAddressPlaceholder')}
          </p>
          <IconNext className="flex__shrink-fixed" />
        </div>
        <div className="form__group border-radius-base  form-field">
          <input
            className="input input__block"
            data-heap-name="ordering.customer.delivery-address-detail"
            type="text"
            maxLength="140"
            placeholder={t('AddressDetailsPlaceholder')}
            value={addressDetails}
            name="addressDetails"
            onChange={this.handleInputChange}
          />
        </div>
        <div className="form__group border-radius-base form-field">
          <input
            className="input input__block"
            data-heap-name="ordering.customer.delivery-note"
            type="text"
            maxLength="140"
            value={deliveryComments}
            name="deliveryComments"
            onChange={this.handleInputChange}
            placeholder={`${t('AddNoteToDriverPlaceholder')}: ${t('AddNoteToDriverOrMerchantPlaceholderExample')}`}
          />
        </div>
      </React.Fragment>
    );
  }

  renderPickUpInfo() {
    const { t, history, business, allBusinessInfo, businessInfo = {} } = this.props;
    const { stores = [], country: locale } = businessInfo;
    const pickUpAddress = stores.length && Utils.getValidAddress(stores[0], Constants.ADDRESS_RANGE.COUNTRY);
    const { deliveryComments } = this.props.deliveryDetails;
    const { date, hour } = Utils.getExpectedDeliveryDateFromSession();
    const { enablePreOrder } = Utils.getDeliveryInfo({ business, allBusinessInfo });

    if (this.getShippingType() !== DELIVERY_METHOD.PICKUP || !enablePreOrder) {
      return null;
    }

    const pickUpTime =
      date &&
      date.date &&
      formatToDeliveryTime({
        date,
        hour,
        locale,
      });

    return (
      <React.Fragment>
        <label className="form__label font-weight-bolder">{t('PickUpTimeAndAddressTitle')}</label>
        <div
          className="form__group border-radius-base"
          data-heap-name="ordering.customer.pickup-time"
          onClick={async () => {
            const { search } = window.location;

            const callbackUrl = encodeURIComponent(`${Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${search}`);

            history.push({
              pathname: Constants.ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
              search: `${search}&callbackUrl=${callbackUrl}`,
            });
          }}
        >
          <p className={`form__textarea ${pickUpTime ? '' : 'gray-font-opacity'}`}>
            {pickUpTime || t('PickUpAtPlaceholder')}
          </p>
        </div>
        <div className="form__group border-radius-base">
          <p className={`form__textarea ${pickUpAddress ? '' : 'gray-font-opacity'}`}>
            {pickUpAddress || t('PickUpAtPlaceholder')}
          </p>
        </div>
        <div
          className="form__group border-radius-base flex flex-middle flex-space-between"
          data-heap-name="ordering.customer.pickup-note"
          onClick={this.handleToggleFormTextarea.bind(this, ASIDE_NAMES.ADD_MERCHANT_NOTE)}
        >
          <p className={`${deliveryComments ? '' : 'gray-font-opacity'}`}>
            {deliveryComments ||
              `${t('AddNoteToMerchantPlaceholder')}: ${t('AddNoteToDriverOrMerchantPlaceholderExample')}`}
          </p>
        </div>
      </React.Fragment>
    );
  }

  render() {
    const { t, user, history, onlineStoreInfo, deliveryDetails, cartSummary } = this.props;
    const { asideName, formTextareaTitle, errorToast } = this.state;
    const { isFetching } = user || {};
    const { country } = onlineStoreInfo || {};
    const { total } = cartSummary || {};
    let textareaValue = '';
    let updateTextFunc = () => {};

    if (asideName === ASIDE_NAMES.ADD_DRIVER_NOTE) {
      textareaValue = deliveryDetails.deliveryComments;
      updateTextFunc = this.handleDriverComments.bind(this);
    } else if (asideName === ASIDE_NAMES.ADD_ADDRESS_DETAIL) {
      textareaValue = deliveryDetails.addressDetails;
      updateTextFunc = this.handleAddressDetails.bind(this);
    } else if (asideName === ASIDE_NAMES.ADD_MERCHANT_NOTE) {
      textareaValue = deliveryDetails.deliveryComments;
      updateTextFunc = this.handleDriverComments.bind(this);
    }

    return (
      <section className={`table-ordering__customer` /* hide */} data-heap-name="ordering.customer.container">
        <Header
          className="text-center gray flex-middle"
          data-heap-name="ordering.customer.header"
          isPage={true}
          title={this.getHeaderTitle()}
          navFunc={() => {
            history.push({
              pathname: ROUTER_PATHS.ORDERING_CART,
              search: window.location.search,
            });
          }}
        ></Header>
        <div className="customer__content">
          <form className="customer__form">
            <div className="form__group" data-testid="customerName">
              <input
                className="input input__block"
                data-heap-name="ordering.customer.name-input"
                type="text"
                placeholder={t('Name')}
                defaultValue={deliveryDetails.username}
                onChange={e => {
                  this.props.customerActions.patchDeliveryDetails({ username: e.target.value.trim() });
                }}
              />
            </div>

            <div className="form__group" data-testid="customerPhoneNumber">
              <PhoneInput
                smartCaret={false}
                data-heap-name="ordering.customer.phone-input"
                placeholder={t('EnterPhoneNumber')}
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
          data-heap-name="ordering.customer.form-textarea"
        />

        <footer className="footer-operation grid flex flex-middle flex-space-between">
          <div className="footer-operation__item width-1-3">
            <button
              className="billing__button button button__fill button__block dark font-weight-bolder"
              data-heap-name="ordering.customer.back-btn"
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
            <CreateOrderButton
              history={history}
              data-testid="customerContinue"
              data-heap-name="ordering.customer.continue-btn"
              disabled={!this.getCanContinue() || isFetching}
              validCreateOrder={!total}
              beforeCreateOrder={this.handleBeforeCreateOrder.bind(this)}
              afterCreateOrder={this.visitPaymentPage.bind(this)}
            >
              {isFetching ? <div className="loader"></div> : t('Continue')}
            </CreateOrderButton>
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
      const currentOrderId = getCurrentOrderId(state);

      return {
        user: getUser(state),
        cartSummary: getCartSummary(state),
        currentOrder: getOrderByOrderId(state, currentOrderId),
        onlineStoreInfo: getOnlineStoreInfo(state),
        deliveryDetails: getDeliveryDetails(state),
        business: getBusiness(state),
        allBusinessInfo: getAllBusinesses(state),
        businessInfo: getBusinessInfo(state),
      };
    },
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      customerActions: bindActionCreators(customerActionCreators, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      paymentActions: bindActionCreators(paymentActionCreators, dispatch),
    })
  )
)(Customer);
