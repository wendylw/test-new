import _isEmpty from 'lodash/isEmpty';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { Link } from 'react-router-dom';
import { formatPhoneNumberIntl } from 'react-phone-number-input/mobile';
import Utils from '../../../../../utils/utils';
import Constants from '../../../../../utils/constants';
import { formatToDeliveryTime } from '../../../../../utils/datetime-lib';
import HybridHeader from '../../../../../components/HybridHeader';
import MessageModal from '../../../../components/MessageModal';
import { IconAccountCircle, IconMotorcycle, IconLocation, IconNext } from '../../../../../components/Icons';
import CreateOrderButton from '../../../../components/CreateOrderButton';
import AddressChangeModal from '../../components/AddressChangeModal';
import RedirectPageLoader from '../../../../components/RedirectPageLoader';
import {
  actions as appActionCreators,
  getBusiness,
  getUser,
  getUserProfile,
  getRequestInfo,
  getBusinessUTCOffset,
  getCartBilling,
  getCartCount,
  getCartSubtotal,
  getMinimumConsumption,
  getBusinessInfo,
  getStoreInfoForCleverTap,
  getDeliveryDetails,
  getIsTNGMiniProgram,
} from '../../../../redux/modules/app';
import { getAllBusinesses } from '../../../../../redux/modules/entities/businesses';
import { actions as customerInfoActionCreators } from './redux';
import { getCustomerError, getShouldGoToAddNewAddressPage } from './redux/selectors';
import { withAddressInfo } from '../../../Location/withAddressInfo';
import { withAvailableAddressDetails } from './withAvailableAddressDetails';
import './CustomerInfo.scss';
import CleverTap from '../../../../../utils/clevertap';
import logger from '../../../../../utils/monitoring/logger';
import prefetch from '../../../../../common/utils/prefetch-assets';

const { ADDRESS_RANGE, ROUTER_PATHS } = Constants;

class CustomerInfo extends Component {
  state = {
    addressChange: false,
    processing: false,
  };

  async componentDidMount() {
    prefetch(['ORD_SC', 'ORD_PMT', 'ORD_AL', 'ORD_PL'], ['OrderingCart', 'OrderingPayment']);

    const { user, deliveryDetails, appActions } = this.props;
    const { consumerId } = user || {};
    consumerId && (await appActions.getProfileInfo(consumerId));

    // Get the latest profile directly from the props
    const { userProfile } = this.props;
    await appActions.updateDeliveryDetails({
      username: deliveryDetails.username || userProfile.name,
      phone: deliveryDetails.phone || userProfile.phone,
    });

    await appActions.loadShoppingCart();
    this.cleverTapViewPageEvent('Checkout page - View page');
  }

  componentDidUpdate(prevProps) {
    const { cartBilling } = this.props;
    const { cartBilling: prevCartBilling } = prevProps;
    const { shippingFee } = cartBilling || {};

    if (shippingFee && prevCartBilling.shippingFee && shippingFee !== prevCartBilling.shippingFee) {
      this.setState({ addressChange: true });
    }
  }

  componentWillUnmount() {
    this.setState({ processing: false });
  }

  cleverTapViewPageEvent = eventName => {
    const { cartCount, cartSubtotal, minimumConsumption, storeInfoForCleverTap } = this.props;

    CleverTap.pushEvent(eventName, {
      ...storeInfoForCleverTap,
      'cart items quantity': cartCount,
      'cart amount': cartSubtotal,
      'has met minimum order value': cartSubtotal >= minimumConsumption,
    });
  };

  getBusinessCountry = () => {
    try {
      const { businessInfo } = this.props;
      return businessInfo.country;
    } catch (e) {
      // this could happen when allBusinessInfo is not loaded.
      return undefined;
    }
  };

  getDeliveryTime = () => {
    const { businessUTCOffset } = this.props;

    const { date = {}, hour = {} } = Utils.getExpectedDeliveryDateFromSession();

    if (date.date && hour.from) {
      return formatToDeliveryTime({ date, hour, businessUTCOffset, locale: this.getBusinessCountry() });
    }

    return '';
  };

  getPickupTime = () => {
    const { businessInfo = {} } = this.props;
    const { locale } = businessInfo;
    const { date, hour } = Utils.getExpectedDeliveryDateFromSession();

    return date && date.date && formatToDeliveryTime({ date, hour, locale });
  };

  validateFields() {
    const { deliveryDetails, t } = this.props;
    const { username, addressName } = deliveryDetails || {};
    const isDeliveryType = Utils.isDeliveryType();
    const shippingInfo = isDeliveryType ? this.getDeliveryTime() : this.getPickupTime();
    let error = {};

    if (!Boolean(addressName) && isDeliveryType) {
      error = {
        show: true,
        message: t('DeliveryAddressEmptyTitle'),
        description: t('DeliveryAddressEmptyDescription'),
        buttonText: t('OK'),
      };
    } else if (_isEmpty(shippingInfo)) {
      error = {
        show: true,
        message: t('ShippingTimeEmptyTitle'),
        description: t('DeliveryAddressEmptyDescription'),
        buttonText: t('OK'),
      };
    } else if (!Boolean(username)) {
      error = {
        show: true,
        message: t('ContactEmptyTitle'),
        description: t('ContactEmptyDescription'),
        buttonText: t('OK'),
      };
    }

    return error;
  }

  handleBeforeCreateOrder = () => {
    logger.log('Ordering_CustomerInfo_CreateOrder');

    const { customerInfoActions } = this.props;
    const error = this.validateFields();

    if (error.show) {
      customerInfoActions.setCustomerError(error);
    } else {
      this.setState({ processing: true });
    }
  };

  handleErrorHide() {
    const { customerInfoActions } = this.props;

    customerInfoActions.clearCustomerError();
  }

  visitPaymentPage = () => {
    const { history, cartBilling } = this.props;
    const { total } = cartBilling || {};

    if (total && !this.validateFields().show) {
      history.push({
        pathname: ROUTER_PATHS.ORDERING_PAYMENT,
        search: window.location.search,
      });
    }
  };

  handleAfterCreateOrder = orderId => {
    const { isTNGMiniProgram } = this.props;

    this.setState({ processing: !!orderId });

    // FB-4206: TnG MP won't go to the payment page
    if (isTNGMiniProgram) {
      return;
    }

    // By default, redirect to the payment page
    this.visitPaymentPage();
  };

  handleAddressClick = () => {
    const { history, storeInfoForCleverTap, shouldGoToAddNewAddressPage } = this.props;
    CleverTap.pushEvent('Checkout page - click change address', storeInfoForCleverTap);
    if (shouldGoToAddNewAddressPage) {
      history.push({
        pathname: `${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${ROUTER_PATHS.ADDRESS_DETAIL}`,
        search: window.location.search,
        state: {
          type: 'add',
        },
      });
      return;
    }

    history.push({
      pathname: `${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${ROUTER_PATHS.ADDRESS_LIST}`,
      search: window.location.search,
    });
    return;
  };

  renderDeliveryPickupDetail() {
    if (Utils.isDineInType() || Utils.isTakeAwayType()) {
      return null;
    }

    const { t, businessInfo = {}, deliveryDetails, storeInfoForCleverTap } = this.props;
    const { stores = [] } = businessInfo;
    const isDeliveryType = Utils.isDeliveryType();
    const { deliveryToAddress, addressDetails, deliveryComments, addressName } = deliveryDetails;
    const pickUpAddress = stores.length && Utils.getValidAddress(stores[0], ADDRESS_RANGE.COUNTRY);
    const { search } = window.location;
    const callbackUrl = encodeURIComponent(`${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${search}`);

    return (
      <li>
        <h4 className="padding-top-bottom-small padding-left-right-normal text-line-height-higher text-weight-bolder text-capitalize">
          {isDeliveryType ? t('DeliverTo') : t('PickupOn')}
        </h4>
        {/* Address Info of Delivery or Pickup */}
        <div className="ordering-customer__detail padding-top-bottom-normal padding-left-right-smaller">
          <div
            className={`flex ${
              isDeliveryType && addressDetails && Boolean(addressName) ? 'flex-bottom' : 'flex-middle'
            }`}
          >
            <IconLocation className="icon icon__small icon__default margin-left-right-small" />
            <div
              className={`ordering-customer__summary flex ${
                isDeliveryType && addressDetails && Boolean(addressName) ? 'flex-bottom' : 'flex-middle'
              } flex-space-between padding-left-right-small`}
            >
              {isDeliveryType ? (
                <button
                  onClick={() => {
                    this.handleAddressClick();
                  }}
                  className="ordering-customer__address-button button button__link text-left"
                >
                  {Boolean(addressName) ? (
                    <React.Fragment>
                      <h3 className="padding-top-bottom-smaller text-size-big text-weight-bolder">{addressName}</h3>
                      <address className="padding-top-bottom-smaller">{deliveryToAddress}</address>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <h5 className="ordering-customer__title padding-top-bottom-smaller text-weight-bolder text-size-big text-capitalize">
                        {t('DeliveryLocationDescription')}
                      </h5>
                    </React.Fragment>
                  )}
                </button>
              ) : (
                <Link
                  to={{
                    pathname: ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
                    search: `${search}&callbackUrl=${callbackUrl}`,
                    state: {
                      from: ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
                    },
                  }}
                  className="padding-top-bottom-smaller ordering-customer__button-link button__link"
                >
                  <h3 className="padding-top-bottom-smaller text-size-big text-weight-bolder text-capitalize">
                    {t('PickupLocationTitle')}
                  </h3>
                  <time className="ordering-customer__time padding-top-bottom-smaller">{pickUpAddress}</time>
                </Link>
              )}

              <IconNext className="icon" />
            </div>
          </div>
          {isDeliveryType && addressDetails && Boolean(addressName) ? (
            <Link
              onClick={() => {
                CleverTap.pushEvent('Checkout page - click edit address', storeInfoForCleverTap);
              }}
              to={{
                pathname: `${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${ROUTER_PATHS.ADDRESS_DETAIL}`,
                search: window.location.search,
                state: {
                  type: 'edit',
                },
              }}
              className="ordering-customer__address-detail-container button__link flex flex-start padding-top-bottom-smaller padding-left-right-small"
            >
              <article className="ordering-customer__address-detail flex flex-middle flex-space-between padding-smaller border-radius-base">
                <div className="ordering-customer__address-content">
                  <p className="padding-smaller text-size-small">{addressDetails}</p>
                  {deliveryComments ? <p className="padding-smaller text-size-small">{deliveryComments}</p> : null}
                </div>
                <button className="ordering-customer__address-edit-button button button__link flex__shrink-fixed padding-small text-weight-bolder text-capitalize">
                  {t('Edit')}
                </button>
              </article>
            </Link>
          ) : null}
        </div>
        {/* enf of Address Info of Delivery or Pickup */}
        {/* Time of Delivery or Pickup */}
        <Link
          onClick={() => {
            CleverTap.pushEvent('Checkout page - click change shipping details', storeInfoForCleverTap);
          }}
          to={{
            pathname: ROUTER_PATHS.ORDERING_LOCATION_AND_DATE,
            search: `${search}&callbackUrl=${callbackUrl}`,
            state: {
              from: ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
            },
          }}
          className="ordering-customer__time ordering-customer__detail button__link padding-left-right-smaller"
        >
          <div className="flex flex-middle">
            <IconMotorcycle className="icon icon__small icon__default margin-small" />
            <div className="ordering-customer__summary flex flex-middle flex-space-between padding-top-bottom-normal padding-small">
              <div className="padding-top-bottom-smaller">
                <label className="text-size-big padding-top-bottom-smaller text-weight-bolder">
                  {isDeliveryType ? t('Delivery') : t('PickupTime')}
                </label>
                <p className="padding-top-bottom-smaller">
                  {isDeliveryType ? this.getDeliveryTime() : this.getPickupTime()}
                </p>
              </div>
              <IconNext className="icon" />
            </div>
          </div>
        </Link>
        {/* end of Time of Delivery or Pickup */}
      </li>
    );
  }

  render() {
    const {
      t,
      history,
      deliveryDetails,
      cartBilling,
      customerError,
      storeInfoForCleverTap,
      isTNGMiniProgram,
    } = this.props;
    const { addressChange, processing } = this.state;
    const { username, phone } = deliveryDetails;
    const pageTitle = Utils.isDineInType() ? t('DineInCustomerPageTitle') : t('PickupCustomerPageTitle');
    const formatPhone = formatPhoneNumberIntl(phone);
    const splitIndex = phone ? formatPhone.indexOf(' ') : 0;
    const { total, shippingFee } = cartBilling || {};
    const shouldShowRedirectLoader = isTNGMiniProgram && processing;

    // FB-4026: For TnG MP, we won't go to the payment page once the user clicks the continue button, we will immediately create an order and call TnG payment API.
    // For such a case, we will show a redirect loader page to prevent users' further interaction and also provide the same payment flow as dine.
    if (shouldShowRedirectLoader) {
      return <RedirectPageLoader />;
    }

    return (
      <section className="ordering-customer flex flex-column" data-heap-name="ordering.customer.container">
        <HybridHeader
          headerRef={ref => (this.headerEl = ref)}
          className="flex-middle text-center"
          contentClassName="flex-middle"
          data-heap-name="ordering.customer.header"
          isPage={true}
          title={Utils.isDeliveryType() ? t('DeliveryCustomerPageTitle') : pageTitle}
          navFunc={() => {
            CleverTap.pushEvent('Checkout page - click back arrow');
            history.push({
              pathname: ROUTER_PATHS.ORDERING_CART,
              search: window.location.search,
            });
          }}
        ></HybridHeader>
        <div
          className="ordering-customer__container"
          style={{
            top: `${Utils.mainTop({
              headerEls: [this.headerEl],
            })}px`,
            height: `${Utils.windowSize().height -
              Utils.mainTop({
                headerEls: [this.deliveryEntryEl, this.headerEl, this.deliveryFeeEl],
              }) -
              Utils.marginBottom({
                footerEls: [this.footerEl],
              })}px`,
          }}
        >
          <ul>
            {this.renderDeliveryPickupDetail()}
            <li>
              <h4 className="padding-top-bottom-small padding-left-right-normal text-line-height-higher text-weight-bolder">
                {t('ContactDetails')}
              </h4>
              <Link
                onClick={() => {
                  CleverTap.pushEvent('Checkout page - click change contact details', storeInfoForCleverTap);
                }}
                to={{
                  pathname: `${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}${ROUTER_PATHS.CONTACT_DETAIL}`,
                  search: window.location.search,
                }}
                className="ordering-customer__detail button__link flex flex-middle padding-left-right-smaller"
              >
                <IconAccountCircle className="icon icon__small icon__default margin-small" />
                <div className="ordering-customer__summary flex flex-middle flex-space-between padding-top-bottom-normal padding-left-right-small">
                  <div className="padding-top-bottom-smaller">
                    <p className="padding-top-bottom-smaller">
                      {username ? (
                        <span className="text-size-big">{username}</span>
                      ) : (
                        <React.Fragment>
                          <label className="text-size-big text-opacity">{t('NameReplaceHolder')}</label>
                          <span className="text-size-big text-error"> - *</span>
                          <span className="text-size-big text-error text-lowercase">{t('Required')}</span>
                        </React.Fragment>
                      )}
                    </p>
                    {phone ? (
                      <p className="padding-top-bottom-smaller">
                        {/* Country Code */}
                        <span className="text-size-big text-weight-bolder">{`${formatPhone.substring(
                          0,
                          splitIndex
                        )} `}</span>
                        {/* end of Country Code */}
                        <span className="text-size-big">{formatPhone.substring(splitIndex + 1)}</span>
                      </p>
                    ) : null}
                  </div>
                  <IconNext className="icon" />
                </div>
              </Link>
            </li>
          </ul>
        </div>
        <footer
          ref={ref => (this.footerEl = ref)}
          className="footer padding-small flex flex-middle flex-space-between flex__shrink-fixed"
        >
          <button
            className="ordering-customer__button-back button button__fill dark text-uppercase text-weight-bolder flex__shrink-fixed"
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
          <CreateOrderButton
            className="padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase"
            history={history}
            data-testid="customerContinue"
            data-heap-name="ordering.customer.continue-btn"
            disabled={processing}
            validCreateOrder={(isTNGMiniProgram || !total) && !this.validateFields().show}
            beforeCreateOrder={() => {
              CleverTap.pushEvent('Checkout page - click continue', storeInfoForCleverTap);
              this.handleBeforeCreateOrder();
            }}
            afterCreateOrder={this.handleAfterCreateOrder}
            loaderText={t('Processing')}
            processing={processing}
          >
            {processing ? t('Processing') : isTNGMiniProgram ? t('PayNow') : t('Continue')}
          </CreateOrderButton>
        </footer>
        {customerError.show ? (
          <MessageModal
            data={customerError}
            onHide={() => {
              this.handleErrorHide();
            }}
          />
        ) : null}
        <AddressChangeModal deliveryFee={shippingFee} addressChange={addressChange} />
      </section>
    );
  }
}
CustomerInfo.displayName = 'CustomerInfo';

export default compose(
  withTranslation(['OrderingCustomer']),
  withAddressInfo(),
  withAvailableAddressDetails(),
  connect(
    state => ({
      user: getUser(state),
      userProfile: getUserProfile(state),
      business: getBusiness(state),
      businessInfo: getBusinessInfo(state),
      allBusinessInfo: getAllBusinesses(state),
      deliveryDetails: getDeliveryDetails(state),
      cartBilling: getCartBilling(state),
      cartCount: getCartCount(state),
      cartSubtotal: getCartSubtotal(state),
      minimumConsumption: getMinimumConsumption(state),
      requestInfo: getRequestInfo(state),
      customerError: getCustomerError(state),
      businessUTCOffset: getBusinessUTCOffset(state),
      storeInfoForCleverTap: getStoreInfoForCleverTap(state),
      shouldGoToAddNewAddressPage: getShouldGoToAddNewAddressPage(state),
      isTNGMiniProgram: getIsTNGMiniProgram(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      customerInfoActions: bindActionCreators(customerInfoActionCreators, dispatch),
    })
  )
)(CustomerInfo);
