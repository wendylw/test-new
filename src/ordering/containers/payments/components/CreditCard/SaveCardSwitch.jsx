import React, { useCallback } from 'react';
import _isFunction from 'lodash/isFunction';
import SwitchButton from '../../../../../../src/components/SwitchButton';
import { useTranslation } from 'react-i18next';

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
        <label className="text-size-bigger text-weight-bolder padding-top-bottom-small">{t('SaveCard')}</label>
        <SwitchButton checked={value} onChange={handleChange} />
      </div>
      <p className="text-line-height-normal payment-credit-card__save-text text-line-height-base">
        {t('SaveCardAuthorize')}
      </p>
    </div>
  );
}
SaveCardSwitch.displayName = 'SaveCardSwitch';

export default SaveCardSwitch;
