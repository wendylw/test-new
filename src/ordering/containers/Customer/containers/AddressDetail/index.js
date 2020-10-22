import React, { Component } from 'react';
import Constants from '../../../../../utils/constants';
import { IconNext } from '../../../../../components/Icons';
import { withTranslation } from 'react-i18next';
import Header from '../../../../../components/Header';

class AddressDetail extends Component {
  handleClickBack = () => {};

  render() {
    const { t, history, addressName, deliveryToAddress, addressDetails, deliveryComments } = this.props;

    return (
      <div>
        <Header
          className="flex-middle"
          contentClassName="flex-middle"
          isPage={true}
          title={t('AddNewAddress')}
          navFunc={this.handleClickBack.bind(this)}
        />
        <section className="padding-left-right-normal">
          <div className="padding-top-bottom-small">
            <div className="ordering-customer__group form__group">
              <input
                className="ordering-customer__input form__input padding-left-right-normal text-size-big text-line-height-base"
                data-heap-name="ordering.customer.delivery-address-detail"
                type="text"
                maxLength="140"
                placeholder={t('Name')}
                value={addressName}
                name="addressDetails"
                onChange={this.handleInputChange}
              />
            </div>
          </div>

          <div className="padding-top-bottom-small">
            <div
              className="form__group flex flex-middle flex-space-between"
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
              <p
                className={`padding-normal text-size-big text-line-height-base ${
                  deliveryToAddress ? '' : 'text-opacity'
                }`}
              >
                {deliveryToAddress || t('AddAddressPlaceholder')}
              </p>
              <IconNext className="icon icon__normal flex__shrink-fixed" />
            </div>
          </div>

          <div className="padding-top-bottom-small">
            <div className="ordering-customer__group form__group">
              <input
                className="ordering-customer__input form__input padding-left-right-normal text-size-big text-line-height-base"
                data-heap-name="ordering.customer.delivery-address-detail"
                type="text"
                maxLength="140"
                placeholder={t('AddressDetailsPlaceholder')}
                value={addressDetails}
                name="addressDetails"
                onChange={this.handleInputChange}
              />
            </div>
          </div>

          <div className="padding-top-bottom-small">
            <div className="ordering-customer__group form__group">
              <input
                className="ordering-customer__input form__input padding-left-right-normal text-size-big"
                data-heap-name="ordering.customer.delivery-note"
                type="text"
                maxLength="140"
                value={deliveryComments}
                name="deliveryComments"
                onChange={this.handleInputChange}
                placeholder={`${t('AddNoteToDriverPlaceholder')}: ${t('AddNoteToDriverOrMerchantPlaceholderExample')}`}
              />
            </div>
          </div>
          <div className="margin-top-bottom-normal">
            <button className="button button__fill button__block padding-small text-size-big text-weight-bolder text-uppercase">
              {t('AddAddress')}
            </button>
          </div>
        </section>
      </div>
    );
  }
}

export default withTranslation()(AddressDetail);
