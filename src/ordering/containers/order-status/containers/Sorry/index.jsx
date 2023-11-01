import PropTypes from 'prop-types';
import React, { Component } from 'react';
import qs from 'qs';
import _pick from 'lodash/pick';
import { withTranslation } from 'react-i18next';
import prefetch from '../../../../../common/utils/prefetch-assets';
import Constants, { PAYMENT_FAILED_ERROR_CODES, PAYMENT_FAILED_ERROR_I18N_KEYS } from '../../../../../utils/constants';
import Utils from '../../../../../utils/utils';
import { alert } from '../../../../../common/utils/feedback';
import logger from '../../../../../utils/monitoring/logger';

const { ROUTER_PATHS } = Constants;

class Sorry extends Component {
  async componentDidMount() {
    const { t, history } = this.props;
    const queryParams = Utils.getQueryString();
    const { errorCode, paymentProvider, paidAmount, refundDays } = queryParams || {};
    const isPayLater = queryParams.isPayLater === 'true';
    const errorDescription = this.getErrorDescription(errorCode, { paidAmount, refundDays });

    alert(errorDescription, { title: t('PaymentFailed') });

    logger.error('Ordering_Sorry_CompletePaymentFailed', {
      name: paymentProvider,
      code: errorCode,
      type: isPayLater ? 'Pay Later' : 'Pay First',
    });

    // for pay later order, the page will redirect to Table Summary
    if (isPayLater) {
      const queryObject = _pick(queryParams, ['h', 'type', 'receiptNumber']);

      history.push({
        pathname: ROUTER_PATHS.ORDERING_TABLE_SUMMARY,
        search: qs.stringify(queryObject, {
          addQueryPrefix: true,
        }),
      });
    } else {
      const queryObject = _pick(queryParams, ['h', 'type']);

      history.push({
        pathname: ROUTER_PATHS.ORDERING_CART,
        search: qs.stringify(queryObject, {
          addQueryPrefix: true,
        }),
      });
    }

    prefetch(['ORD_MNU', 'ORD_SC'], ['OrderingDelivery', 'OrderingCart']);
  }

  shouldComponentUpdate(nextProps) {
    return !!nextProps.order;
  }

  getErrorDescription(errorCode, errorInfo = {}) {
    const { t } = this.props;
    const { paidAmount, refundDays } = errorInfo;
    const i18nKey = PAYMENT_FAILED_ERROR_I18N_KEYS[errorCode];

    // Safety check: if i18n key is not defined, return a general error message
    if (!i18nKey) {
      return t('GeneralPaymentFailedDescription');
    }

    if (errorCode === PAYMENT_FAILED_ERROR_CODES.UNKNOWN_ERROR) {
      // For unknown errors, we need to dynamically interpolate refund information into the description
      return t(i18nKey, { paidAmount, refundDays });
    }

    // For rest of the errors, we can just return the fixed description directly
    return t(i18nKey);
  }

  render() {
    return <div className="loader theme full-page" data-test-id="ordering.sorry.container" />;
  }
}

Sorry.displayName = 'OrderingSorry';

Sorry.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  order: PropTypes.object,
};

Sorry.defaultProps = {
  order: {},
};

export default withTranslation('OrderingPayment')(Sorry);
