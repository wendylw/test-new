import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';
import Constants from '../Constants';

// Example1 URL: http://nike.storehub.local:3000/#/thank-you?receiptNumber=811588925877567
export class Sorry extends Component {
  static propTypes = {

  }

  componentWillMount() {
    const { history } = this.props;
    const query = new URLSearchParams(history.location.search);
    const receiptNumber = query.get('receiptNumber');

    console.log('receiptNumber => %o', receiptNumber);

    const error = new Error('Payment Failed');
    // eslint-disable-next-line no-useless-escape
    error.description = 'We couldn\’t process your payment. The contents of your cart have been saved for you.';

    history.push({
      pathname: Constants.ROUTER_PATHS.CART,
      search: '?modal=message',
      state: { error }
    });
  }

  shouldComponentUpdate(nextProps) {
    if (!nextProps.order) {
      return false;
    }

    return true;
  }

  render() {
    return (
      <div>
        loading..
      </div>
    )
  }
}

export default withRouter(Sorry);
