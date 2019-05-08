import React, { Component } from 'react'
import { compose } from 'react-apollo';
import withOrderDetail from '../libs/withOrderDetail';
import config from '../config';
import CurrencyNumber from '../views/components/CurrencyNumber';

// Example1 URL: http://nike.storehub.local:3000/#/thank-you?receiptNumber=811588925877567
export class ThankYou extends Component {
  static propTypes = {

  }

  shouldComponentUpdate(nextProps) {
    if (!nextProps.order) {
      return false;
    }

    return true;
  }

  render() {
    const { match, order } = this.props;

    console.log('order =>', order);

    if (!order) {
      // TODO: render order not found message.
      return null;
    }

    return (
      <section className={`table-ordering__thanks ${match.isExact ? '' : 'hide'}`}>
        <header className="header border-botton__divider flex flex-middle flex-space-between">
          <figure className="header__image-container text-middle">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
          </figure>
          <h2 className="header__title font-weight-bold text-middle">Order Paid</h2>
          <span className="gray-font-opacity">Table {order.additionalComments}</span>
        </header>
        <div className="thanks text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          <h2 className="thanks__title font-weight-bold">Thank You!</h2>
          <h4 className="thanks__subtitle gray-font-opacity font-weight-bold">Total paid {<CurrencyNumber money={order.total} />}</h4>

          <form className="thanks__form form">
            <div className="input__group">
              <input className="input input__block" type="email" placeholder="Email"></input>
            </div>
            <div>
              <button className="font-weight-bold text-uppercase button button__fill button__block">Send receipt</button>
            </div>
          </form>
        </div>
      </section>
    )
  }
}

export default compose(withOrderDetail({
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
}))(ThankYou);
