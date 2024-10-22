import React from 'react';
import Skeleton, { SkeletonTheme } from '../../../../../common/components/ReactLoadingSkeleton';
import SquareSkeleton from '../../../../../common/components/SquareSkeleton';
import styles from './SkeletonLoader.module.scss';

const SkeletonLoader = () => (
  <SkeletonTheme duration={2}>
    <SquareSkeleton
      className="tw-rounded"
      wrapperClassName={styles.SkeletonLoaderBanner}
      containerClassName="tw-flex tw-flex-1"
    />
    <div className="tw-flex tw-flex-col tw-w-full tw-px-12 sm:tw-px-12px tw-py-24 sm:tw-py-24px">
      <Skeleton
        className="tw-flex tw-items-center tw-py-20 sm:tw-py-20px"
        count={1}
        containerClassName="tw-flex-1 tw-flex-col"
      />
      <Skeleton
        className="tw-flex tw-items-center tw-py-20 sm:tw-py-20px"
        count={1}
        containerClassName={styles.SkeletonLoaderFormItem}
      />
      <Skeleton
        className="tw-flex tw-items-center tw-py-20 sm:tw-py-20px"
        count={1}
        containerClassName={styles.SkeletonLoaderFormItem}
      />
      <Skeleton
        className="tw-flex tw-items-center tw-py-20 sm:tw-py-20px"
        count={1}
        containerClassName={styles.SkeletonLoaderFormItem}
      />
    </div>
    <div className="tw-absolute tw-bottom-0 tw-flex tw-flex-col tw-w-full tw-pt-4 sm:tw-pt-4px tw-bg-gray-50 tw-shadow-sm">
      <Skeleton
        className="tw-flex tw-items-center tw-py-20 sm:tw-py-20px tw-mx-8 sm:tw-mx-8px"
        count={2}
        containerClassName="tw-flex-1 tw-flex tw-items-center tw-px-4 sm:tw-px-4px tw-py-8 sm:tw-py-8px"
      />
    </div>
  </SkeletonTheme>
);

SkeletonLoader.displayName = 'SkeletonLoader';

export default SkeletonLoader;
