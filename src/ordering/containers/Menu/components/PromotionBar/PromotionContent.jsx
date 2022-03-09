import React from 'react';
import PropTypes from 'prop-types';
import PromotionText from './PromotionText';
import PromotionPrompt from './PromotionPrompt';
import PromotionShape from './PromotionShape';

const PromotionContent = props => {
  const { promotion, singleLine, textClassName, promptClassName } = props;
  return (
    <>
      <PromotionText promotion={promotion} className={textClassName} />
      {singleLine ? <>&nbsp;</> : <br />}
      <PromotionPrompt promotion={promotion} className={promptClassName} />
    </>
  );
};
PromotionContent.displayName = 'PromotionContent';
PromotionContent.propTypes = {
  promotion: PromotionShape.isRequired,
  singleLine: PropTypes.bool,
  textClassName: PropTypes.string,
  promptClassName: PropTypes.string,
};
PromotionContent.defaultProps = {
  singleLine: false,
  textClassName: '',
  promptClassName: '',
};

export default PromotionContent;
