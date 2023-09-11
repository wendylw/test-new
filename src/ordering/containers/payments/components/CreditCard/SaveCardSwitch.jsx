import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import _isFunction from 'lodash/isFunction';
import { useTranslation } from 'react-i18next';
import SwitchButton from '../../../../../components/SwitchButton';

function SaveCardSwitch(props) {
  const { value, onChange } = props;
  const { t } = useTranslation('OrderingPayment');

  const handleChange = useCallback(() => {
    if (_isFunction(onChange)) {
      onChange(!value);
    }
  }, [onChange, value]);

  return (
    <div className="margin-top-bottom-small payment-credit-card__save">
      <div className={`flex flex-middle flex-space-between payment-credit-card__save-switch ${value ? 'active' : ''}`}>
        <span className="text-size-bigger text-weight-bolder padding-top-bottom-small">{t('SaveCard')}</span>
        <SwitchButton checked={value} onChange={handleChange} data-test-id="ordering.payments.credit-card.switch-btn" />
      </div>
      <p className="text-line-height-normal payment-credit-card__save-text text-line-height-base">
        {t('SaveCardAuthorize')}
      </p>
    </div>
  );
}

SaveCardSwitch.displayName = 'SaveCardSwitch';

SaveCardSwitch.propTypes = {
  value: PropTypes.bool,
  onChange: PropTypes.func,
};

SaveCardSwitch.defaultProps = {
  value: false,
  onChange: () => {},
};

export default SaveCardSwitch;
