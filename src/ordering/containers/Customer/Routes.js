import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, withRouter } from 'react-router-dom';
import AddressDetail from './containers/AddressDetail';
import AddressList from './containers/AddressList';
import ContactDetails from './containers/ContactDetails';
import constants from '../../../utils/constants';

const { ROUTER_PATHS } = constants;
class CustomerRoute extends Component {
  // const { match } = this.props;
  render() {
    return (
      <Router basename={'/customer'}>
        <Switch>
          <Route exact path={ROUTER_PATHS.ADDRESS_DETAIL} component={AddressDetail} />
          <Route exact path={ROUTER_PATHS.ADDRESS_LIST} component={AddressList} />
          <Route exact path={ROUTER_PATHS.CONTACT_DETAIL} component={ContactDetails} />
        </Switch>
      </Router>
    );
  }
}

export default withRouter(CustomerRoute);
