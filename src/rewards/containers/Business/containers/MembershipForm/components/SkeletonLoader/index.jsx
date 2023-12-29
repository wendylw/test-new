// This file is copied from https://github.com/dvtng/react-loading-skeleton.
// DON'T MODIFY THIS FILE IF YOU DON'T KNOW WHAT YOU ARE DOING!

import React from 'react';
import Skeleton, { SkeletonTheme } from '../../../../../../../common/components/ReactLoadingSkeleton';
import SquareSkeleton from '../../../../../../../common/components/SquareSkeleton';
import styles from './SkeletonLoader.module.scss';

const SkeletonLoader = () => (
  <SkeletonTheme duration={2}>
    <section className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-24 sm:tw-p-24px">
      <SquareSkeleton
        className="tw-rounded"
        wrapperClassName={styles.skeletonLoaderBusinessLogo}
        containerClassName="tw-flex tw-flex-1"
      />
      <div className="tw-flex tw-items-center tw-w-full tw-py-16 sm:tw-py-16px">
        <Skeleton
          className="tw-flex tw-items-center tw-py-8 sm:tw-py-8px"
          count={8}
          containerClassName="tw-flex-1 tw-flex-col"
        />
      </div>
    </section>
  </SkeletonTheme>
);

SkeletonLoader.displayName = 'SkeletonLoader';

export default SkeletonLoader;
