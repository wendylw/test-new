import React, { Component } from 'react';
import _isFunction from 'lodash/isFunction';
import AdyenCheckout from '@adyen/adyen-web';
import '@adyen/adyen-web/dist/adyen.css';

/**
 * TODO: Adyen is unavailable at long time, so we needn't maintenance this file for now
 */
class AdyenCVV extends Component {
  componentDidMount() {
    this.initAdyenCheckout();
  }

  handleOnChange = (state, component) => {
    const { onChange } = this.props;
    const { state: CardComponentState } = component;
    const isValid = CardComponentState.valid.encryptedSecurityCode;

    if (_isFunction(onChange)) {
      onChange(isValid);
    }
  };

  handleOnLoad = () => {
    const { onLoad } = this.props;

    if (_isFunction(onLoad)) {
      onLoad();
    }
  };

  initAdyenCheckout() {
    const configuration = {
      environment: process.env.REACT_APP_ADYEN_PAYMENT_ENV, // Change this value to live env when go prod. Use test. When you're ready to accept live payments, change the value to one of our live environments.
      clientKey: process.env.REACT_APP_ADYEN_PAYMENT_CLIENTKEY,
      onChange: this.handleOnChange,
      translations: {
        'en-US': {
          'creditCard.cvcField.placeholder': 'CVC',
        },
      },
    };

    const checkout = new AdyenCheckout(configuration);

    this.card = checkout
      .create('card', {
        type: 'card',
        brands: ['mc', 'visa'],
        showPayButton: false,
        hasHolderName: false,
        showBrandIcon: true,
        styles: {
          base: {
            padding: '0',
            lineHeight: '54px',
            fontSmoothing: 'antialiased',
            fontSize: '1.25rem',
            outline: 'none',
            color: '#303030',
          },
          placeholder: {
            color: '#dededf',
          },
          validated: {
            outline: 'none',
          },
        },
        onError: error => {},
        onChange: this.handleOnChange,
        onFieldValid: () => {},
        onSubmit: (state, component) => {
          return false;
        },
        onValid: () => {},
        onLoad: this.handleOnLoad,
      })
      .mount('#adyen-cvv');
  }

  render() {
    return <div id="adyen-cvv"></div>;
  }
}

export default AdyenCVV;
