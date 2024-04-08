import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import RewardsEmptyListImage from '../../../../../../images/rewards-empty-list-icon.svg';
import { ObjectFitImage } from '../../../../../../common/components/Image';
import styles from './HistoryList.module.scss';

const HistoryList = ({ isEmpty, emptyTitle, emptyDescription, historyList }) => {
  const { t } = useTranslation(['Rewards']);

  return isEmpty ? (
    <section className={styles.HistoryListEmptySection}>
      <div className={styles.HistoryListEmptyImage}>
        <ObjectFitImage noCompression src={RewardsEmptyListImage} />
      </div>
      <h4 className={styles.HistoryListEmptyTitle}>{emptyTitle}</h4>
      <p className={styles.HistoryListEmptyDescription}>{emptyDescription}</p>
    </section>
  ) : (
    <ul className={styles.HistoryList}>
      {historyList.map(historyItem => {
        const { id, nameI18nKey, logDateTime, changeValue, changeValueText, isReduce } = historyItem || {};

        return (
          <li key={id} className={styles.HistoryItem}>
            <div>
              <h4 className={styles.HistoryItemTitle}>{t(nameI18nKey)}</h4>
              <time className={styles.HistoryItemDateTime}>{logDateTime}</time>
            </div>
            <data
              className={isReduce ? styles.HistoryItemReduceAmount : styles.HistoryItemIncreaseAmount}
              value={changeValue}
            >
              {changeValueText}
            </data>
          </li>
        );
      })}
    </ul>
  );
};

HistoryList.displayName = 'HistoryList';

HistoryList.propTypes = {
  isEmpty: PropTypes.bool,
  emptyTitle: PropTypes.string,
  emptyDescription: PropTypes.string,
  historyList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      nameI18nKey: PropTypes.string,
      logDateTime: PropTypes.string,
      changeValue: PropTypes.string || PropTypes.number,
      changeValueText: PropTypes.string,
      isReduce: PropTypes.bool,
    })
  ),
};

HistoryList.defaultProps = {
  isEmpty: false,
  emptyTitle: '',
  emptyDescription: '',
  historyList: PropTypes.arrayOf(
    PropTypes.shape({
      id: '',
      nameI18nKey: '',
      logDateTime: '',
      changeValue: '',
      changeValueText: '',
      isReduce: false,
    })
  ),
};

export default HistoryList;
