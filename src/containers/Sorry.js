import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';
import Constants from '../Constants';
import DocumentTitle from '../views/components/DocumentTitle';

// Example1 URL: http://nike.storehub.local:3000/#/thank-you?receiptNumber=811588925877567
export class Sorry extends Component {
  static propTypes = {

  }

  componentWillMount() {
    const { history } = this.props;
    const query = new URLSearchParams(history.location.search);
    const receiptNumber = query.get('receiptNumber');

    console.log('receiptNumber => %o', receiptNumber);

    history.push({
      pathname: Constants.ROUTER_PATHS.CART,
      search: '?modal=message',
      state: {
        error: {
          message: 'Payment Failed',
          description: `We could not process your payment. The contents of your cart have been saved for you.`,
        },
      }
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
      <DocumentTitle title={Constants.DOCUMENT_TITLE.SORRY}>
        loading..
      </DocumentTitle>
    )
  }
}

export default withRouter(Sorry);
