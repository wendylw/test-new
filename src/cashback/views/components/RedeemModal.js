/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { withRouter } from "react-router";

class RedeemModal extends React.Component {
  render() {
    const { onClose, show } = this.props;

    if (typeof onClose !== 'function') {
      console.error('onClose is required');
      return null;
    }

    if (!show) {
      return null;
    }

    return (
      <div className="full-aside">
        <header className="header border__bottom-divider flex flex-middle flex-space-between">
          <figure
            className="header__image-container text-middle"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              <path d="M0 0h24v24H0z" fill="none"/>
            </svg>
          </figure>
          <h2 className="header__title font-weight-bold text-middle text-center">REDEEM INFO</h2>
        </header>

        <section className="full-aside__content text-center">
          <figure className="full-aside__image-container">
            <svg className="full-aside__image-phone" enable-background="new 0 0 455 455" viewBox="0 0 455 455">
              <path d="m272.87 249.9c-4.143 0-7.5 3.358-7.5 7.5v111.92h-189.21v-189.22h84.338c4.143 0 7.5-3.358 7.5-7.5s-3.357-7.5-7.5-7.5h-84.338v-31.768c0-13.188 10.729-23.917 23.917-23.917h29.42c4.143 0 7.5-3.358 7.5-7.5s-3.357-7.5-7.5-7.5h-29.42c-21.459 0-38.917 17.458-38.917 38.917v282.76c0 21.459 17.458 38.917 38.917 38.917h141.38c21.459 0 38.917-17.458 38.917-38.917v-158.69c0-4.142-3.357-7.5-7.5-7.5zm-31.417 190.1h-141.38c-13.188 0-23.917-10.729-23.917-23.917v-31.768h189.21v31.768c0 13.188-10.729 23.917-23.917 23.917z"/>
              <path d="m272.87 0c-66.704 0-120.97 43.792-120.97 97.619 0 46.06 39.338 85.365 94.387 95.258 0.723 13.676-4.319 27.18-13.992 36.945-2.131 2.15-2.759 5.371-1.594 8.165s3.895 4.614 6.922 4.614c29.638 0 55.124-20.982 61.444-49.654 55.253-9.778 94.779-49.156 94.779-95.327 1e-3 -53.828-54.268-97.62-120.97-97.62zm18.541 178.97c-3.896 0.538-6.714 3.994-6.459 7.917-2.782 17.498-14.8 31.667-30.57 37.646 5.84-11.484 8.16-24.652 6.387-37.691 0.231-3.904-2.578-7.337-6.46-7.874-50.649-7-87.411-41.212-87.411-81.347-1e-3 -45.557 47.539-82.62 105.97-82.62s105.97 37.063 105.97 82.619c0 40.143-36.771 74.356-87.433 81.35z"/>
              <path d="m232.87 89.619c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8z"/>
              <path d="m312.87 89.619c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8z"/>
              <path d="m272.87 89.619c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8z"/>
            </svg>
          </figure>
          <h2 className="full-aside__title">How to use your Cashback?</h2>
          <ol className="full-aside__ordered-list">
            <li>When paying your bill, tell the cashier your phone number.</li>
	          <li>Your bill will be discounted based on your remaining cashback.</li>
          </ol>
        </section>
      </div>
    );
  }
}

export default withRouter(RedeemModal);
