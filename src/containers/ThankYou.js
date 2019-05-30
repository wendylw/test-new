import React, { Component } from 'react'
import { compose } from 'react-apollo';
import withOrderDetail from '../libs/withOrderDetail';
import config from '../config';
import CurrencyNumber from '../views/components/CurrencyNumber';
import Constants from '../Constants';
import DocumentTitle from '../views/components/DocumentTitle';

// Example1 URL: http://nike.storehub.local:3000/#/thank-you?receiptNumber=811588925877567
export class ThankYou extends Component {
  static propTypes = {

  }

  state = {
    needReceipt: 'remind'
  };

  shouldComponentUpdate(nextProps) {
    if (!nextProps.order) {
      return false;
    }

    return true;
  }

  renderNeedReceipt() {
    const { orderId } = this.props.order;
    let text = (
      <button className="thanks__link link text-uppercase" onClick={() => this.setState({ needReceipt: 'detail' })}>
        Need a receipt?
      </button>
    );

    if (this.state.needReceipt === 'detail') {
      text = (
        <div className="thanks__receipt-info">
          <h4 className="thanks__receipt-title font-weight-bold">Ping the staff for a receipt</h4>
          <div>
            <label className="thanks__receipt-label">Receipt Number: </label>
            <span className="thanks__receipt-number font-weight-bold">{orderId}</span>
          </div>
        </div>
      );
    }

    return (
      <>{text}</>
    );
  }

  renderSendReceipt() {

    // TODO: when email receipt API is supported, then we can remove this and render form below.
    if (true) {
      return null;
    }

    return (
      <form className="thanks__form form">
        <div className="input__group">
          <input className="input input__block" type="email" placeholder="Email"></input>
        </div>
        <div>
          <button className="font-weight-bold text-uppercase button button__fill button__block">Send receipt</button>
        </div>
      </form>
    );
  }

  renderMain() {
    const { history, match, order } = this.props;

    if (!order) {
      return <div>Order Not Found</div>;
    }

    return (
      <section className={`table-ordering__thanks ${match.isExact ? '' : 'hide'}`}>
        <header className="header border__bottom-divider flex flex-middle flex-space-between">
          <figure className="header__image-container text-middle" onClick={() => history.replace({
            pathname: `${Constants.ROUTER_PATHS.HOME}`,
            search: `?table=${order.additionalComments}&storeId=${order.storeId}`
          })}>
            <img src="/img/beep-error.png" alt="Thank you" />
          </figure>
          <h2 className="header__title font-weight-bold text-middle">Order Paid</h2>
          <span className="gray-font-opacity text-uppercase">Selk pick-up</span>
        </header>
        <div className="thanks text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          <h2 className="thanks__title font-weight-bold">Thank You!</h2>
          <h4 className="thanks__subtitle gray-font-opacity font-weight-bold">Total paid {<CurrencyNumber money={order.total} />}</h4>
          {this.renderNeedReceipt()}
          {this.renderSendReceipt()}
        </div>
      </section>
    )
  }

  render() {
    return (
      <DocumentTitle title={Constants.DOCUMENT_TITLE.THANK_YOU}>
        {this.renderMain()}
      </DocumentTitle>
    );
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
