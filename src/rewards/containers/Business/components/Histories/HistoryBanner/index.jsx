import React from 'react';
import { Info } from 'phosphor-react';
import PropTypes from 'prop-types';
import RewardsHistoryBannerImage from '../../../../../../images/rewards-history-banner.svg';
import Button from '../../../../../../common/components/Button';
import { ObjectFitImage } from '../../../../../../common/components/Image';
import styles from './HistoryBanner.module.scss';

const HistoryBanner = ({ title, value, valueText, prompt, infoButtonText, onClickInfoButton, infoButtonTestId }) => (
  <section className={styles.HistoryBanner}>
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
    <div className={styles.HistoryBannerImage}>
      <ObjectFitImage noCompression src={RewardsHistoryBannerImage} alt="Beep Rewards Banner" />
    </div>
  </section>
);

HistoryBanner.displayName = 'HistoryBanner';

HistoryBanner.propTypes = {
  title: PropTypes.string,
  value: PropTypes.string || PropTypes.number,
  valueText: PropTypes.string,
  prompt: PropTypes.string,
  infoButtonText: PropTypes.string,
  onClickInfoButton: PropTypes.func,
  infoButtonTestId: PropTypes.string,
};

HistoryBanner.defaultProps = {
  title: '',
  value: '',
  valueText: '',
  prompt: '',
  infoButtonText: '',
  onClickInfoButton: () => {},
  infoButtonTestId: '',
};

export default HistoryBanner;
