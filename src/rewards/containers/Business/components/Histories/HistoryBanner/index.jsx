import React from 'react';
import { Info } from 'phosphor-react';
import PropTypes from 'prop-types';
import { getClassName } from '../../../../../../common/utils/ui';
import Button from '../../../../../../common/components/Button';
import styles from './HistoryBanner.module.scss';

const HistoryBanner = ({
  className,
  title,
  value,
  valueText,
  prompt,
  infoButtonText,
  historyBannerRightClassName,
  historyButton,
  historyBannerImage,
  onClickInfoButton,
  infoButtonTestId,
}) => (
  <section className={getClassName([styles.HistoryBanner, className])}>
    <div className={styles.HistoryBannerCustomerInfo}>
      <h4 className={styles.HistoryBannerTitle}>{title}:</h4>
      <data className={styles.HistoryBannerPoints} value={value}>
        {valueText}
      </data>
      <div className={styles.HistoryBannerPrompts}>
        <p className={styles.HistoryBannerExpiringTimePrompt}>{prompt}</p>
        <Button
          className={styles.HistoryBannerHowToUseButton}
          contentClassName={styles.HistoryBannerHowToUseButtonContent}
          type="text"
          size="small"
          theme="info"
          data-test-id={infoButtonTestId}
          icon={<Info size={18} />}
          onClick={onClickInfoButton}
        >
          {infoButtonText}
        </Button>
      </div>
    </div>
    <div className={getClassName([styles.HistoryBannerRight, historyBannerRightClassName])}>
      {historyButton}
      {historyBannerImage}
    </div>
  </section>
);

HistoryBanner.displayName = 'HistoryBanner';

HistoryBanner.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  valueText: PropTypes.string,
  prompt: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  infoButtonText: PropTypes.string,
  historyBannerRightClassName: PropTypes.string,
  historyButton: PropTypes.node,
  historyBannerImage: PropTypes.node,
  onClickInfoButton: PropTypes.func,
  infoButtonTestId: PropTypes.string,
};

HistoryBanner.defaultProps = {
  className: null,
  title: '',
  value: '',
  valueText: '',
  prompt: '',
  infoButtonText: '',
  historyBannerRightClassName: null,
  historyButton: null,
  historyBannerImage: null,
  onClickInfoButton: () => {},
  infoButtonTestId: '',
};

export default HistoryBanner;
