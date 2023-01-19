import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Result from '../../../../../../../common/components/Result';
import PageHeader from '../../../../../../../common/components/PageHeader';
import ResultContent from '../../../../../../../common/components/Result/ResultContent';
import { goBack } from '../../redux/thunks';
import { gotoHome } from '../../../../../../../utils/native-methods';
import { isWebview } from '../../../../../../../common/utils';
import { getOffline } from '../../redux/selectors';

const isInWebview = isWebview();

const ErrorResult = ({ title, content, buttonText, imageSrc, onCloseButtonClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation('OrderingThankYou');

  const offline = useSelector(getOffline);

  const handleClickBackButton = useCallback(() => dispatch(goBack()), [dispatch]);

  return (
    <Result
      show
      mountAtRoot
      closeButtonContent={buttonText}
      onClose={onCloseButtonClick}
      header={
        <PageHeader
          title={t('StoreReview')}
          onBackArrowClick={isInWebview ? gotoHome : handleClickBackButton}
          isShowBackButton={!offline || isInWebview}
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
};

ErrorResult.defaultProps = {
  title: '',
  content: '',
  buttonText: '',
  imageSrc: '',
  onCloseButtonClick: () => {},
};

export default ErrorResult;
