import React from 'react';
import PropTypes from 'prop-types';
import Result from '../../../../../../../common/components/Result';
import ResultContent from '../../../../../../../common/components/Result/ResultContent';

const ErrorResult = ({ title, content, buttonText, imageSrc, isCloseButtonVisible, onCloseButtonClick }) => (
  <Result
    show
    closeButtonStyle={isCloseButtonVisible ? null : { display: 'none' }}
    closeButtonContent={buttonText}
    onClose={onCloseButtonClick}
    disableBackButtonSupport
  >
    <ResultContent content={content} title={title} imageSrc={imageSrc} />
  </Result>
);

ErrorResult.displayName = 'ErrorResult';

ErrorResult.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  buttonText: PropTypes.string,
  imageSrc: PropTypes.string,
  isCloseButtonVisible: PropTypes.bool,
  onCloseButtonClick: PropTypes.func,
};

ErrorResult.defaultProps = {
  title: '',
  content: '',
  buttonText: '',
  imageSrc: '',
  isCloseButtonVisible: true,
  onCloseButtonClick: () => {},
};

export default ErrorResult;
