import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import { IconAccountCircle, IconMotorcycle, IconLocation, IconNext } from '../../../components/Icons';
import CreateOrderButton from '../../components/CreateOrderButton';

import { connect } from 'react-redux';
import { compose } from 'redux';
import './OrderingCustomer.scss';

class Customer extends Component {
  render() {
    const { history } = this.props;

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
              <h4 className="padding-top-bottom-small padding-left-right-normal text-line-height-higher text-weight-bolder">
                Delivery To
              </h4>
              <div className="ordering-customer__detail padding-top-bottom-normal padding-left-right-smaller">
                <div className="flex flex-middle">
                  <IconLocation className="icon icon__small icon__default margin-left-right-small" />
                  <div className="ordering-customer__summary flex flex-middle flex-space-between padding-top-bottom-smaller padding-left-right-small">
                    <div>
                      {/* <React.Fragment>
                        <h5 className="ordering-customer__title padding-top-bottom-smaller text-weight-bolder">You’re in new location</h5>
                        <p className="padding-top-bottom-smaller text-size-big text-weight-bolder">Select Delivery Address</p>
                      </React.Fragment> */}
                      <React.Fragment>
                        <h3 className="padding-top-bottom-smaller text-size-big text-weight-bolder">KYM Tower</h3>
                        <address className="padding-top-bottom-smaller">Menara KYM</address>
                      </React.Fragment>
                    </div>
                    {/* <div>
                      <h3 className="padding-top-bottom-smaller text-size-big text-weight-bolder">Pickup Address</h3>
                      <time className="ordering-customer__time padding-top-bottom-smaller">645A, Jalan SS 20/10, Damansara Kim, 47400 Petaling Jaya, Selangor</time>
                    </div> */}
                    <IconNext className="icon" />
                  </div>
                </div>
                <div className="ordering-customer__address-detail-container flex flex-start padding-top-bottom-smaller padding-left-right-small">
                  <article className="ordering-customer__address-detail padding-smaller border-radius-base">
                    <p className="padding-smaller text-size-small">Level 7 - 01</p>
                    <p className="padding-smaller text-size-small">Please pass the pizza to receptionist</p>
                  </article>
                </div>
              </div>
              <div className="ordering-customer__detail padding-left-right-smaller">
                <div className="flex flex-middle">
                  <IconMotorcycle className="icon icon__small icon__default margin-small" />
                  <div className="ordering-customer__summary flex flex-middle flex-space-between padding-top-bottom-normal padding-small">
                    <div className="padding-top-bottom-smaller">
                      <label className="text-size-big padding-top-bottom-smaller text-weight-bolder">Delivery</label>
                      <p className="padding-top-bottom-smaller">Sunday, 29 April 2020, 05:00 PM - 06:00 PM</p>
                    </div>
                    <IconNext className="icon" />
                  </div>
                </div>
              </div>
            </li>
            <li>
              <h4 className="padding-top-bottom-small padding-left-right-normal text-line-height-higher text-weight-bolder">
                Contact Details
              </h4>
              <div className="ordering-customer__detail flex flex-middle padding-left-right-smaller">
                <IconAccountCircle className="icon icon__small icon__default margin-small" />
                <div className="ordering-customer__summary flex flex-middle flex-space-between padding-top-bottom-normal padding-left-right-small">
                  <div className="padding-top-bottom-smaller">
                    <p className="padding-top-bottom-smaller">
                      <label className="text-size-big text-opacity">Your name</label>
                      <span className="text-size-big text-error"> - *</span>
                      <span className="text-size-big text-error">required</span>
                    </p>
                    <p className="padding-top-bottom-smaller">
                      <span className="text-size-big text-weight-bolder">+60</span>
                      <span className="text-size-big">12 345 6789</span>
                    </p>
                  </div>
                  <IconNext className="icon" />
                </div>
              </div>
            </li>
          </ul>
        </div>
        <footer className="footer padding-small flex flex-middle flex-space-between flex__shrink-fixed">
          <button
            className="ordering-customer__button-back button button__fill dark text-uppercase text-weight-bolder flex__shrink-fixed"
            data-heap-name="ordering.customer.back-btn"
            onClick={() => {}}
          >
            Back
          </button>
          <CreateOrderButton
            className="padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase"
            history={history}
            data-testid="customerContinue"
            data-heap-name="ordering.customer.continue-btn"
            disabled={false}
            validCreateOrder={false}
            beforeCreateOrder={() => {}}
            afterCreateOrder={() => {}}
          >
            Continue
          </CreateOrderButton>
        </footer>
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
