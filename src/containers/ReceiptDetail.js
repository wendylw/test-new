/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import { compose } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import withOrderDetail from '../libs/withOrderDetail';
import withOnlinstStoreInfo from '../libs/withOnlineStoreInfo';

import Item from '../components/Item';
import CurrencyNumber from '../components/CurrencyNumber';
import ItemOperator from '../components/ItemOperator';
import Billing from '../views/components/Billing';

import config from '../config';
import Constants from '../Constants';

export class ReceiptDetail extends Component {
  backToThankYou() {
    const { history } = this.props;
    const h = config.h();
    const query = new URLSearchParams(history.location.search);
    const receiptNumber = query.get('receiptNumber');

    history.replace(`${Constants.ROUTER_PATHS.THANK_YOU}?h=${h}&receiptNumber=${receiptNumber}`, history.location.state);
  }

  render() {
    const {
      order = {},
      onlineStoreInfo,
    } = this.props;
    const {
      locale,
      currency,
    } = onlineStoreInfo;
    const {
      tax,
      serviceCharge,
      subtotal,
      total,
      items,
    } = order || {};

    return (
      <section className="table-ordering__receipt">
        <header className="header border__bottom-divider flex flex-middle flex-space-between">
          <figure className="header__image-container text-middle" onClick={this.backToThankYou.bind(this)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /><path d="M0 0h24v24H0z" fill="none" /></svg>
          </figure>
          <h2 className="header__title font-weight-bold text-middle">View Receipt</h2>
          <span className="gray-font-opacity text-uppercase">
            {
              order.tableId
                ? `Table ${order.tableId}`
                : 'Self pick-up'
            }
          </span>
        </header>
        <div className="receipt__content text-center">
          <label className="receipt__label gray-font-opacity font-weight-bold text-uppercase">Receipt Number</label>
          <span className="receipt__id-number">{order.orderId}</span>
        </div>
        <div className="list__container">
          {
            (items || []).map(item => {
              const {
                id,
                title,
                variationTexts,
                displayPrice,
                quantity,
                image,
              } = item;

              if (item.itemType) {
                return null;
              }

              return (
                <Item
                  contentClassName="flex-top"
                  key={id}
                  image={image}
                  title={title}
                  variation={(variationTexts || []).join(', ')}
                  detail={
                    <CurrencyNumber
                      money={displayPrice || 0}
                      locale={locale}
                      currency={currency}
                    />
                  }
                >

                  <ItemOperator
                    className="flex-middle exhibit"
                    quantity={quantity}
                    decreaseDisabled={quantity === 0}
                  />
                </Item>
              );
            })
          }
        </div>
        <Billing
          tax={tax}
          serviceCharge={serviceCharge}
          subtotal={subtotal}
          total={total}
          productList={items}
          onlineStoreInfo={onlineStoreInfo}
        />
      </section>
    )
  }
}

export default compose(withRouter,
  withOnlinstStoreInfo({
    props: ({ gqlOnlineStoreInfo: { loading, onlineStoreInfo } }) => {
      if (loading) {
        return null;
      }
      return { onlineStoreInfo };
    },
  }),
  withOrderDetail({
    options: ({ history }) => {
      const query = new URLSearchParams(history.location.search);
      const orderId = query.get('receiptNumber');

      return ({
        variables: {
          business: config.business,
          orderId,
        }
      });
    },
    props: ({ gqlOrderDetail: { loading, order } }) => {
      if (loading) {
        return null;
      }

      return { order };
    }
  }),
)(ReceiptDetail);