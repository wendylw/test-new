import React, { Component } from 'react';
import Constants from '../../../utils/constants';
import { IconNext } from '../../../components/Icons';

class AddAddress extends Component {
  render() {
    const { history, deliveryAddress } = this.props;

    return (
      <div>
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
      </div>
    );
  }
}
