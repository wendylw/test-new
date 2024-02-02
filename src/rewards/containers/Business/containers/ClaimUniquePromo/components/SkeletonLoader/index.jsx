import React from 'react';
import Skeleton, { SkeletonTheme } from '../../../../../../../common/components/ReactLoadingSkeleton';
import SquareSkeleton from '../../../../../../../common/components/SquareSkeleton';
import styles from './SkeletonLoader.module.scss';

const SkeletonLoader = () => (
  <SkeletonTheme duration={2}>
    <section className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-px-16 sm:tw-px-16px tw-py-24 sm:tw-py-24px">
      <SquareSkeleton
        className="tw-rounded"
        wrapperClassName={styles.SkeletonLoaderLogo}
        containerClassName="tw-flex tw-flex-1"
      />
      <div className="tw-flex tw-flex-col tw-w-full tw-pt-24 sm:tw-pt-24px">
        <Skeleton
          className="tw-flex tw-items-center tw-py-8 sm:tw-py-8px"
          count={1}
          containerClassName="tw-flex-1 tw-flex-col"
        />
        <Skeleton
          className="tw-flex tw-items-center tw-py-8 sm:tw-py-8px"
          count={1}
          containerClassName={styles.SkeletonLoaderPromoNameSecondLine}
        />
      </div>
      <div className="tw-flex tw-flex-col tw-w-full tw-pt-4 sm:tw-pt-4px">
        <Skeleton
          className="tw-flex tw-items-center tw-py-2 sm:tw-py-2px"
          count={1}
          containerClassName={styles.SkeletonLoaderPromoTermsTitle}
        />
        <Skeleton className="tw-flex tw-items-center" count={3} containerClassName="tw-flex-1 tw-flex-col" />
      </div>
      <div className="tw-flex tw-flex-col tw-w-full tw-pt-4 sm:tw-pt-4px">
        <Skeleton
          className="tw-flex tw-items-center tw-py-2 sm:tw-py-2px"
          count={1}
          containerClassName={styles.SkeletonLoaderPromoTermsTitle}
        />
        <Skeleton className="tw-flex tw-items-center" count={7} containerClassName="tw-flex-1 tw-flex-col" />
      </div>
    </section>
  </SkeletonTheme>
);

SkeletonLoader.displayName = 'SkeletonLoader';

export default SkeletonLoader;
