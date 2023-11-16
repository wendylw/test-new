import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Result from '../../../../../../../common/components/Result';
import PageHeader from '../../../../../../../common/components/PageHeader';
import ResultContent from '../../../../../../../common/components/Result/ResultContent';
import { getShouldShowBackButton } from '../../redux/selectors';

const ErrorResult = ({ title, content, buttonText, imageSrc, onCloseButtonClick, onBackArrowClick }) => {
  const { t } = useTranslation('Rewards');

  const shouldShowBackButton = useSelector(getShouldShowBackButton);

  return (
    <Result
      show
      mountAtRoot
      closeButtonContent={buttonText}
      onClose={onCloseButtonClick}
      header={
        <PageHeader
          title={t('JoinOurMembership')}
          onBackArrowClick={onBackArrowClick}
          isShowBackButton={shouldShowBackButton}
        />
      }
      disableBackButtonSupport
    >
      <ResultContent content={content} title={title} imageSrc={imageSrc} />
    </Result>
  );
};

ErrorResult.displayName = 'ErrorResult';

ErrorResult.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  buttonText: PropTypes.string,
  imageSrc: PropTypes.string,
  onCloseButtonClick: PropTypes.func,
  onBackArrowClick: PropTypes.func,
};

ErrorResult.defaultProps = {
  title: '',
  content: '',
  buttonText: '',
  imageSrc: '',
  onCloseButtonClick: () => {},
  onBackArrowClick: () => {},
};

export default ErrorResult;
