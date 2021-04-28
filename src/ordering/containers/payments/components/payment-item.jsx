import React, { Component } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import PropTypes from 'prop-types';
import _values from 'lodash/values';
import _every from 'lodash/every';

import { getSelectedPaymentOption } from '../redux/common/selectors';
import * as paymentCommonThunks from '../redux/common/thunks';
import PaymentLogo from './payment-logo';
import CurrencyNumber from '../../../components/CurrencyNumber';
import Radio from '../../../../components/Radio';

class PaymentItem extends Component {
  getSelectedCurrentOptionState(paymentProvider, currentPaymentOption) {
    return paymentProvider === currentPaymentOption.paymentProvider;
  }

  getAllDisabledConditionsAvailable(disabledConditions) {
    return _every(_values(disabledConditions), value => value === false);
  }

  handleSelectPaymentOption = (option, currentPaymentOption) => {
    const { paymentsActions } = this.props;
    const { disabledConditions, paymentProvider } = option;
    const selectedOption = this.getSelectedCurrentOptionState(paymentProvider, currentPaymentOption);
    const enabledOption = this.getAllDisabledConditionsAvailable(disabledConditions);

    if (!selectedOption && enabledOption) {
      paymentsActions.updatePaymentOptionSelected(paymentProvider);
    }
  };

  renderDescription() {
    const { t, option } = this.props;
    const { disabledConditions, minAmount: minAvailablePriceAmount } = option;
    const enabledOption = this.getAllDisabledConditionsAvailable(disabledConditions);

    if (enabledOption) {
      return null;
    }

    if (disabledConditions.minAmount) {
      return (
        <p className="margin-top-bottom-smaller">
          ({' '}
          <Trans i18nKey="MinimumConsumption">
            <span>Min</span>
            <CurrencyNumber money={minAvailablePriceAmount} />
          </Trans>{' '}
          )
        </p>
      );
    }

    return <p className="margin-top-bottom-smaller">{`(${t('TemporarilyUnavailable')})`}</p>;
  }

  render() {
    const { t, option, currentPaymentOption } = this.props;
    const { key, logo, paymentProvider, disabledConditions } = option;
    const selectedOption = this.getSelectedCurrentOptionState(paymentProvider, currentPaymentOption);
    const enabledOption = this.getAllDisabledConditionsAvailable(disabledConditions);
    const classList = [
      'ordering-payment__item flex flex-middle flex-space-between padding-small border__bottom-divider',
      ...(enabledOption ? [] : ['disabled']),
    ];

    if (!paymentProvider) {
      return null;
    }

    return (
      <li
        key={key}
        className={classList.join(' ')}
        data-testid="paymentSelector"
        data-heap-name="ordering.payment.payment-item"
        data-heap-payment-name={key}
        onClick={() => this.handleSelectPaymentOption(option, currentPaymentOption)}
      >
        <div className="ordering-payment__item-content">
          <figure className="ordering-payment__image-container text-middle margin-small">
            <PaymentLogo logo={logo} alt={key} />
          </figure>
          <div className="ordering-payment__description text-middle padding-left-right-normal">
            <label className="ordering-payment__label text-omit__single-line text-size-big text-weight-bolder">
              {t(key)}
            </label>
            {this.renderDescription()}
          </div>
        </div>
        <Radio className="margin-left-right-small" checked={selectedOption} />
      </li>
    );
  }
}

PaymentItem.propTypes = {
  option: PropTypes.shape({
    key: PropTypes.string,
    logo: PropTypes.string,
    paymentName: PropTypes.string,
    paymentProvider: PropTypes.string,
    available: PropTypes.bool,
    pathname: PropTypes.string,
    selected: PropTypes.bool,
    disabledConditions: PropTypes.object,
  }),
};

PaymentItem.defaultProps = {
  option: {},
};

export default compose(
  withTranslation(['OrderingPayment']),
  connect(
    state => ({
      currentPaymentOption: getSelectedPaymentOption(state),
    }),
    dispatch => ({
      paymentsActions: bindActionCreators(paymentCommonThunks, dispatch),
    })
  )
)(PaymentItem);
