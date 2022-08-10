import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import styles from './RedirectPageLoader.module.scss';

const RedirectPageLoader = ({ className }) => {
  const { t } = useTranslation('OrderingCart');
  const classNameList = [styles.RedirectPageLoaderContainer, 'text-size-reset'];

  if (className) {
    classNameList.push(className);
  }

  return (
    <section className={classNameList.join(' ')}>
      <div className="sm:tw-m-4px tw-m-4">
        <i className={`${styles.RedirectPageLoaderIcon} loader default`} />
        <p className={styles.RedirectPageLoaderDescription}>{t('LoadingRedirectingDescription')}</p>
      </div>
    </section>
  );
};

RedirectPageLoader.displayName = 'RedirectPageLoader';
RedirectPageLoader.propTypes = {
  className: PropTypes.string,
};
RedirectPageLoader.defaultProps = {
  className: '',
};

export default RedirectPageLoader;
