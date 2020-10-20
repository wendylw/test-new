import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import { IconAccountCircle, IconMotorcycle, IconLocation, IconNext } from '../../../components/Icons';

import { connect } from 'react-redux';
import { compose } from 'redux';
import './OrderingCustomer.scss';

class Customer extends Component {
  render() {
    return (
      <section className="ordering-customer flex flex-column" data-heap-name="ordering.customer.container">
        <Header
          className="flex-middle text-center"
          contentClassName="flex-middle"
          data-heap-name="ordering.customer.header"
          isPage={true}
          title="Delivery & Payment Details"
          navFunc={() => {}}
        ></Header>
        <div className="ordering-customer__container">
          <ul>
            <li>
              <h4 className="padding-top-bottom-small padding-left-right-normal text-weight-bolder">Delivery To</h4>
              <div className="ordering-customer__detail flex flex-middle">
                <IconLocation className="icon icon__small icon__default margin-small" />
                <summary className="ordering-customer__summary flex flex-middle flex-space-between padding-small">
                  <div>
                    <h5>You’re in new location</h5>
                    <p>Select Delivery Address</p>
                  </div>
                  <IconNext className="icon margin-small" />
                </summary>
              </div>
              <div className="ordering-customer__detail flex flex-middle">
                <IconMotorcycle className="icon icon__small icon__default margin-small" />
                <summary className="ordering-customer__summary flex flex-middle flex-space-between padding-small">
                  <div>
                    <label className="text-weight-bolder">Delivery</label>
                    <p>Sunday, 29 April 2020, 05:00 PM - 06:00 PM</p>
                  </div>
                  <IconNext className="icon margin-small" />
                </summary>
              </div>
            </li>
            <li>
              <h4 className="padding-top-bottom-small padding-left-right-normal text-weight-bolder">Contact Details</h4>
              <div className="ordering-customer__detail flex flex-middle">
                <IconAccountCircle className="icon icon__small icon__default margin-small" />
                <summary className="ordering-customer__summary flex flex-middle flex-space-between padding-small">
                  <div>
                    <p>
                      <label className="text-size-big text-opacity">Your name</label>
                      <span className="text-size-big text-error"> - *</span>
                      <span className="text-size-big text-error">required</span>
                    </p>
                    <p>
                      <span className="text-size-big text-weight-bolder">+60</span>
                      <span className="text-size-big">12 345 6789</span>
                    </p>
                  </div>
                  <IconNext className="icon margin-small" />
                </summary>
              </div>
            </li>
          </ul>
        </div>
      </section>
    );
  }
}

export default compose(
  withTranslation(),
  connect(
    state => {},
    dispatch => ({})
  )
)(Customer);
