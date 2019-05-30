import React, { Component } from 'react';
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
      <button className="thanks__link link font-weight-bold text-uppercase" onClick={() => this.setState({ needReceipt: 'detail' })}>
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

    return (text);
  }

  renderPickupInfo() {
    const { pickUpId } = this.props.order;

    if (!pickUpId) {
      return null;
    }

    return (
      <div className="thanks-pickup">
        <div className="thanks-pickup__id-container">
          <label className="gray-font-opacity font-weight-bold text-uppercase">Order Number</label>
          <span className="thanks-pickup__id-number">{pickUpId}</span>
        </div>
        <p className="thanks-pickup__prompt-text">Collect your order when your number is called/displayed</p>
      </div>
    );
  }

  renderMain() {
    const { history, match, order } = this.props;
    const date = new Date();

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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
          </figure>
          <h2 className="header__title font-weight-bold text-middle">Order Paid</h2>
          <span className="gray-font-opacity text-uppercase">
            {
              order.additionalComments
              ? `Table ${order.additionalComments}`
              : 'Self pick-up'
            }
          </span>
        </header>
        <div className="thanks text-center">
          <img src="/img/beep-thank-you.png" />
          <h2 className="thanks__title font-weight-light">Thank You!</h2>
          {this.renderPickupInfo()}
          {this.renderNeedReceipt()}
        </div>
        <footer className="footer-link">
          <ul className="flex flex-middle flex-space-between">
            <li><span>&copy; {date.getFullYear()} </span><a className="link link__non-underline" href="https://www.storehub.com/">StoreHub</a></li>
          </ul>
        </footer>
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
