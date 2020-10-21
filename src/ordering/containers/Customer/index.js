import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Link } from 'react-router-dom';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';
import { formatToDeliveryTime } from '../../../utils/datetime-lib';

import Header from '../../../components/Header';
import { IconAccountCircle, IconMotorcycle, IconLocation, IconNext } from '../../../components/Icons';
import CreateOrderButton from '../../components/CreateOrderButton';
import { getBusinessInfo } from '../../redux/modules/cart';
import { getDeliveryDetails } from '../../redux/modules/customer';

import './OrderingCustomer.scss';

class Customer extends Component {
  renderDeliveryPickupDetail() {
    if (Utils.isDineInType()) {
      return null;
    }

    const { t, businessInfo = {}, deliveryDetails } = this.props;
    const { stores = [], locale } = businessInfo;
    const isDeliveryType = Utils.isDeliveryType();
    const { deliveryToAddress, addressDetails, deliveryComments, deliveryToAddressName } = deliveryDetails;
    const pickUpAddress = stores.length && Utils.getValidAddress(stores[0], Constants.ADDRESS_RANGE.COUNTRY);
    const { date, hour } = Utils.getExpectedDeliveryDateFromSession();
    const pickUpTime = date && date.date && formatToDeliveryTime({ date, hour, locale });

    return (
      <li>
        <h4 className="padding-top-bottom-small padding-left-right-normal text-line-height-higher text-weight-bolder text-capitalize">
          {isDeliveryType ? t('DeliveryTo') : t('PickupOn')}
        </h4>
        {/* Address Info of Delivery or Pickup */}
        <div className="ordering-customer__detail padding-top-bottom-normal padding-left-right-smaller">
          <div className="flex flex-middle">
            <IconLocation className="icon icon__small icon__default margin-left-right-small" />
            <div className="ordering-customer__summary flex flex-middle flex-space-between padding-top-bottom-smaller padding-left-right-small">
              {isDeliveryType ? (
                <div>
                  <React.Fragment>
                    <h5 className="ordering-customer__title padding-top-bottom-smaller text-weight-bolder">
                      {t('DeliveryLocationLabel')}
                    </h5>
                    <p className="padding-top-bottom-smaller text-size-big text-weight-bolder text-capitalize">
                      {' '}
                      {t('DeliveryLocationDescription')}
                    </p>
                  </React.Fragment>
                  <React.Fragment>
                    <h3 className="padding-top-bottom-smaller text-size-big text-weight-bolder">
                      {deliveryToAddressName}
                    </h3>
                    <address className="padding-top-bottom-smaller">{deliveryToAddress}</address>
                  </React.Fragment>
                </div>
              ) : (
                <div>
                  <h3 className="padding-top-bottom-smaller text-size-big text-weight-bolder">
                    {t('PickupLocationTitle')}
                  </h3>
                  <time className="ordering-customer__time padding-top-bottom-smaller">{pickUpAddress}</time>
                </div>
              )}
              <IconNext className="icon" />
            </div>
          </div>
          {isDeliveryType ? (
            <div className="ordering-customer__address-detail-container flex flex-start padding-top-bottom-smaller padding-left-right-small">
              <article className="ordering-customer__address-detail flex flex-middle flex-space-between padding-smaller border-radius-base">
                <div className="ordering-customer__address-content">
                  <p className="padding-smaller text-size-small">{addressDetails}</p>
                  <p className="padding-smaller text-size-small">{deliveryComments}</p>
                </div>
                <button className="ordering-customer__address-edit-button button button__link flex__shrink-fixed padding-small text-weight-bolder">
                  {t('Edit')}
                </button>
              </article>
            </div>
          ) : null}
        </div>
        {/* enf of Address Info of Delivery or Pickup */}
        {/* Time of Delivery or Pickup */}
        <div className="ordering-customer__detail padding-left-right-smaller">
          <div className="flex flex-middle">
            <IconMotorcycle className="icon icon__small icon__default margin-small" />
            <div className="ordering-customer__summary flex flex-middle flex-space-between padding-top-bottom-normal padding-small">
              <div className="padding-top-bottom-smaller">
                <label className="text-size-big padding-top-bottom-smaller text-weight-bolder">
                  {isDeliveryType ? t('Delivery') : t('PickupTime')}
                </label>
                <p className="padding-top-bottom-smaller">{pickUpTime}</p>
              </div>
              <IconNext className="icon" />
            </div>
          </div>
        </div>
        {/* end of Time of Delivery or Pickup */}
      </li>
    );
  }

  render() {
    const { t, history, deliveryDetails } = this.props;
    const { username, phone } = deliveryDetails;
    const pageTitle = Utils.isDineInType() ? t('DineInCustomerPageTitle') : t('PickupCustomerPageTitle');

    return (
      <section className="ordering-customer flex flex-column" data-heap-name="ordering.customer.container">
        <Header
          className="flex-middle text-center"
          contentClassName="flex-middle"
          data-heap-name="ordering.customer.header"
          isPage={true}
          title={Utils.isDeliveryType() ? t('DeliveryCustomerPageTitle') : pageTitle}
          navFunc={() => {}}
        ></Header>
        <div className="ordering-customer__container">
          <ul>
            {this.renderDeliveryPickupDetail()}
            <li>
              <h4 className="padding-top-bottom-small padding-left-right-normal text-line-height-higher text-weight-bolder">
                {t('ContactDetails')}
              </h4>
              <Link className="ordering-customer__detail button__link flex flex-middle padding-left-right-smaller">
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
                    <p className="padding-top-bottom-smaller">
                      <span className="text-size-big">{phone}</span>
                      {/* <span className="text-size-big text-weight-bolder">+60</span>
                      <span className="text-size-big">12 345 6789</span> */}
                    </p>
                  </div>
                  <IconNext className="icon" />
                </div>
              </Link>
            </li>
          </ul>
        </div>
        <footer className="footer padding-small flex flex-middle flex-space-between flex__shrink-fixed">
          <button
            className="ordering-customer__button-back button button__fill dark text-uppercase text-weight-bolder flex__shrink-fixed"
            data-heap-name="ordering.customer.back-btn"
            onClick={() => {}}
          >
            {t('Back')}
          </button>
          <CreateOrderButton
            className="padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase"
            history={history}
            data-testid="customerContinue"
            data-heap-name="ordering.customer.continue-btn"
            disabled={false}
            validCreateOrder={false}
            beforeCreateOrder={() => {}}
            afterCreateOrder={() => {}}
          >
            {t('Continue')}
          </CreateOrderButton>
        </footer>
      </section>
    );
  }
}

export default compose(
  withTranslation(['OrderingCustomer']),
  connect(
    state => ({
      businessInfo: getBusinessInfo(state),
      deliveryDetails: getDeliveryDetails(state),
    }),
    dispatch => ({})
  )
)(Customer);
