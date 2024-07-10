import React, { useEffect, useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLifecycles } from 'react-use';
import { useTranslation } from 'react-i18next';
import Loader from '../../../common/components/Loader';
import Result from '../../../common/components/Result';
import styles from './SubmissionProcess.module.scss';

const INTERVAL_TIME = 1 * 1000;
const COUNTDOWN_TIME = 10 * 1000;

const SubmissionProcess = ({ breakSubmission, onTimeOut }) => {
  const { t } = useTranslation(['EInvoice']);
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_TIME);
  const timer = useRef(null);
  const handleTimerCountDown = useCallback(() => {
    // eslint-disable-next-line no-shadow
    setTimeLeft(timeLeft => timeLeft - INTERVAL_TIME);
  }, []);

  useLifecycles(
    () => {
      timer.current = setInterval(handleTimerCountDown, INTERVAL_TIME);
    },
    () => {
      clearInterval(timer.current);
    }
  );

  useEffect(() => {
    if (timeLeft === 0) {
      clearInterval(timer.current);
      onTimeOut();
    }
  }, [timeLeft, onTimeOut]);

  useEffect(() => {
    if (breakSubmission) {
      clearInterval(timer.current);
    }
  }, [breakSubmission]);

  return (
    <Result className={styles.SubmissionProcess} show isCloseButtonShow={false}>
      <Loader className={styles.SubmissionProcessLoader} />
      <h3 className={styles.SubmissionProcessTitle}>{t('SubmissionProcessingTitle')}</h3>
      <p className={styles.SubmissionProcessDescription}>
        {t('SubmissionProcessingCountDownText', { timeLeft: timeLeft / 1000 })}
      </p>
    </Result>
  );
};

SubmissionProcess.displayName = 'SubmissionProcess';

SubmissionProcess.propTypes = {
  breakSubmission: PropTypes.bool,
  onTimeOut: PropTypes.func,
};

SubmissionProcess.defaultProps = {
  breakSubmission: false,
  onTimeOut: () => {},
};

SubmissionProcess.displayName = 'SubmissionProcess';

export default SubmissionProcess;
