import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Result from '../../../../../../../common/components/Result';
import PageHeader from '../../../../../../../common/components/PageHeader';
import ResultContent from '../../../../../../../common/components/Result/ResultContent';
import { getShouldShowBackButton } from '../../redux/selectors';
import { getOffline } from '../../../../redux/selector';
import styles from './ErrorResult.module.scss';

const ErrorResult = ({ title, content, buttonText, imageSrc, onCloseButtonClick, onBackArrowClick }) => {
  const { t } = useTranslation('OrderingThankYou');

  const shouldShowBackButton = useSelector(getShouldShowBackButton);
  const offline = useSelector(getOffline);

  return (
    <Result
      /* TODO: This is a workaround to hide OKAY button. Will change Result button to give an attribute to do it. */
      closeButtonClassName={offline ? styles.ErrorResultButtonHidden : ''}
      show
      mountAtRoot
      closeButtonContent={buttonText}
      onClose={onCloseButtonClick}
      header={
        <PageHeader
          title={t('StoreReview')}
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
