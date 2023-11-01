import React, { Component } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import _values from 'lodash/values';
import _every from 'lodash/every';
import { NEW_PAYMENT_METHODS } from '../containers/Payment/constants';
import { getSelectedPaymentOption } from '../redux/common/selectors';
import { actions as paymentCommonActions } from '../redux/common/index';
import PaymentLogo from './PaymentLogo';
import Tag from '../../../../common/components/Tag';
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
    const { onSelect, updatePaymentOptionSelected } = this.props;
    const { disabledConditions, paymentProvider } = option;
    const selectedOption = this.getSelectedCurrentOptionState(paymentProvider, currentPaymentOption);
    const enabledOption = this.getAllDisabledConditionsAvailable(disabledConditions);

    if (!selectedOption && enabledOption) {
      onSelect();
      updatePaymentOptionSelected(paymentProvider);
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

    if (disabledConditions.unSupport) {
      return <p className="margin-top-bottom-smaller">{`${t('UnsupportedInThisStore')}`}</p>;
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
        id={`paymentItem-${key}`}
        className={classList.join(' ')}
        data-testid="paymentSelector"
        data-test-id="ordering.payment.payment-item"
        onClick={() => this.handleSelectPaymentOption(option, currentPaymentOption)}
      >
        <div className="ordering-payment__item-content">
          <figure className="ordering-payment__image-container text-middle margin-small">
            <PaymentLogo logo={logo} alt={key} />
          </figure>
          <div className="ordering-payment__description text-middle padding-left-right-normal">
            <label
              htmlFor={`paymentItem-${key}`}
              className="ordering-payment__label text-omit__single-line text-size-big text-weight-bolder"
            >
              {t(key)}
            </label>
            {this.renderDescription()}
          </div>
        </div>
        {NEW_PAYMENT_METHODS.includes(paymentProvider) && (
          <Tag className="ordering-payment__tag-new" color="red">
            {t('New')}
          </Tag>
        )}
        <Radio className="margin-left-right-small" checked={selectedOption} />
      </li>
    );
  }
}

PaymentItem.displayName = 'PaymentItem';

const optionType = PropTypes.shape({
  key: PropTypes.string,
  logo: PropTypes.string,
  paymentName: PropTypes.string,
  paymentProvider: PropTypes.string,
  available: PropTypes.bool,
  minAmount: PropTypes.number,
  pathname: PropTypes.string,
  selected: PropTypes.bool,
  disabledConditions: PropTypes.shape({
    minAmount: PropTypes.bool,
    available: PropTypes.bool,
    unSupport: PropTypes.bool,
  }),
});

PaymentItem.propTypes = {
  option: optionType,
  currentPaymentOption: optionType,
  onSelect: PropTypes.func,
  updatePaymentOptionSelected: PropTypes.func,
};

PaymentItem.defaultProps = {
  option: {
    paymentProvider: null,
  },
  currentPaymentOption: {
    paymentProvider: null,
  },
  onSelect: () => {},
  updatePaymentOptionSelected: () => {},
};

export default compose(
  withTranslation(['OrderingPayment']),
  connect(
    state => ({
      currentPaymentOption: getSelectedPaymentOption(state),
    }),
    {
      updatePaymentOptionSelected: paymentCommonActions.updatePaymentOptionSelected,
    }
  )
)(PaymentItem);
