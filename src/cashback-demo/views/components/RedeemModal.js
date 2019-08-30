/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { withRouter } from "react-router";
import IconRedeemed from '../../images/icon-redeemed.svg';

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
          <h2 className="header__title font-weight-bold text-middle text-center text-uppercase">Redeem info</h2>
        </header>

        <section className="full-aside__content text-center">
          <figure className="full-aside__image-container">
            <img src={IconRedeemed} alt="CashBack redeemed"/>
          </figure>
          <h2 className="full-aside__title">How to use your Cashback?</h2>
          <ol className="redeem__list">
            <li className="redeem__item">When paying your bill, tell the cashier your phone number.</li>
	          <li className="redeem__item">Your bill will be discounted based on your remaining cashback.</li>
          </ol>
        </section>
      </div>
    );
  }
}

export default withRouter(RedeemModal);
