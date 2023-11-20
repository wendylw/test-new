import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Result from '../../../../../../../common/components/Result';
import ResultContent from '../../../../../../../common/components/Result/ResultContent';
import BeepWarningImage from '../../../../../../../images/beep-warning.png';

const ErrorResult = ({ onCloseButtonClick }) => {
  const { t } = useTranslation();

  return (
    <Result show closeButtonContent={t('Retry')} onClose={onCloseButtonClick} disableBackButtonSupport>
      <ResultContent
        content={t('SomethingWentWrongDescription')}
        title={t('SomethingWentWrongTitle')}
        imageSrc={BeepWarningImage}
      />
    </Result>
  );
};

ErrorResult.displayName = 'ErrorResult';

ErrorResult.propTypes = {
  onCloseButtonClick: PropTypes.func,
};

ErrorResult.defaultProps = {
  onCloseButtonClick: () => {},
};

export default ErrorResult;
