import React from 'react';
import Skeleton, { SkeletonTheme } from '../../../../../../../common/components/ReactLoadingSkeleton';
import styles from './SkeletonLoader.module.scss';

const SkeletonLoader = () => (
  <SkeletonTheme duration={2}>
    <div className={styles.SkeletonLoaderForm}>
      <Skeleton
        className={styles.SkeletonLoaderFormItem}
        count={1}
        containerClassName={styles.SkeletonLoaderFormItemContainer}
      />
      <Skeleton
        className={styles.SkeletonLoaderFormItem}
        count={1}
        containerClassName={styles.SkeletonLoaderFormItemContainer}
      />
      <Skeleton
        className={styles.SkeletonLoaderFormItem}
        count={1}
        containerClassName={styles.SkeletonLoaderFormItemContainer}
      />
      <Skeleton
        className={styles.SkeletonLoaderFormItem}
        count={1}
        containerClassName={styles.SkeletonLoaderFormItemContainer}
      />
      <Skeleton
        className={styles.SkeletonLoaderFormItem}
        count={1}
        containerClassName={styles.SkeletonLoaderFormItemContainer}
      />
    </div>
  </SkeletonTheme>
);

SkeletonLoader.displayName = 'SkeletonLoader';

export default SkeletonLoader;
