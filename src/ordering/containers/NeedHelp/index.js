import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
// import Header from '../../../components/Header';
// import PhoneLogin from './components/PhoneLogin';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { getOnlineStoreInfo } from '../../redux/modules/app';
import { actions as thankYouActionCreators, getOrder } from '../../redux/modules/thankYou';

export class NeedHelp extends Component {
  render() {
    return (
      <section>
        <ul>
          <li>
            <p>Store Name</p>
            <span>testing</span>
          </li>
          <li>
            <p>Contact information</p>
            <span>111111</span>
          </li>
          <li>
            <p>Store Address</p>
            <span>testing....</span>
          </li>
        </ul>
      </section>
    );
  }
}

export default compose(
  withTranslation(['OrderingThankYou']),
  connect(
    state => ({
      onlineStoreInfo: getOnlineStoreInfo(state),
      order: getOrder(state),
    }),
    dispatch => ({
      thankYouActions: bindActionCreators(thankYouActionCreators, dispatch),
    })
  )
)(NeedHelp);
