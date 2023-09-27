import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import SquareSkeleton from '../../../../../common/components/SquareSkeleton';
import styles from './MenuSkeleton.module.scss';

const MenuSkeleton = () => (
  <SkeletonTheme duration={2}>
    <section className="tw-py-16 sm:tw-py-16px">
      {/* Menu Store Info */}
      <div className="tw-flex tw-items-center tw-px-16 sm:tw-px-16px">
        <SquareSkeleton
          className="tw-rounded"
          wrapperClassName={styles.menuSkeletonBusinessLogo}
          containerClassName="tw-flex tw-flex-1"
        />
        <div className="tw-flex-1 tw-flex-col">
          <Skeleton className={styles.menuSkeletonBusinessName} />
          <Skeleton className={styles.menuSkeletonStoreName} />
        </div>
      </div>
      {/* Promotion Bar */}
      <div className="tw-mx-16 sm:tw-mx-16px tw-mt-24 sm:tw-mt-24px">
        <Skeleton className="tw-p-12 sm:tw-p-12px tw-rounded" />
      </div>
      {/* Product Search Bar */}
      <div className="tw-flex tw-items-center tw-p-16 sm:tw-p-16px tw-pr-0 sm:tw-pr-0">
        <Skeleton className={styles.menuSkeletonSearchBox} containerClassName="tw-flex-1 tw-h-full" />
        <SquareSkeleton
          wrapperClassName="tw-flex tw-flex-shrink-0 tw-px-12 sm:tw-px-12px sm:tw-mr-4px tw-mr-4px"
          className={styles.menuSkeletonSearchIcon}
          containerClassName="tw-flex-1 tw-h-full"
        />
      </div>
      {/* Category List */}
      <div>
        {/* Best Seller Category Product List */}
        <div className="tw-pb-16 sm:tw-pb-16px tw-relative">
          <Skeleton className={styles.menuSkeletonCategoryProductTitle} />
          <ul className={styles.menuSkeletonBestSellerCategoryProductList}>
            {Array(4)
              .fill({})
              .map((_, index) => (
                <li
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  className={styles.menuSkeletonProductItem}
                >
                  <div className="tw-relative tw-p-4 sm:tw-p-4px">
                    <SquareSkeleton
                      className="tw-rounded"
                      wrapperClassName="tw-m-2 sm:tw-m-2px tw-relative tw-flex tw-flex-shrink-0"
                      containerClassName="tw-flex tw-flex-1"
                    />
                    <Skeleton
                      className={styles.menuSkeletonBestSellerCategoryProductItemTitle}
                      containerClassName="tw-flex-1"
                    />
                    <div className="tw-px-2 sm:tw-px-2px tw-my-4 sm:tw-my-4px">
                      <Skeleton
                        className={styles.menuSkeletonBestSellerCategoryProductItemPrice}
                        containerClassName="tw-flex-1"
                      />
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
        {/* Category Product List */}
        <div className="tw-pb-16 sm:tw-pb-16px tw-relative">
          <Skeleton className={styles.menuSkeletonCategoryProductTitle} />
          <ul className={styles.menuSkeletonCategoryProductList}>
            {Array(4)
              .fill({})
              .map((_, index) => (
                <li
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  className={`${styles.menuSkeletonProductItem} tw-mx-8 sm:tw-mx-8px`}
                >
                  <div className="tw-relative tw-p-4 sm:tw-p-4px tw-my-12 sm:tw-my-12px">
                    <div className="tw-flex tw-flex-1">
                      <div className="tw-flex-auto tw-relative">
                        <div className="tw-px-2 sm:tw-px-2px">
                          <Skeleton className={styles.menuSkeletonProductItemTitle} containerClassName="tw-flex-1" />
                          <div className="tw-my-2 sm:tw-my-2px">
                            <Skeleton
                              className="tw-my-2 sm:tw-my-2px"
                              containerClassName="tw-flex-1 tw-flex tw-flex-col tw-items-center tw-justify-center tw-mr-12 sm:tw-mr-12px"
                              count={2}
                              inline
                            />
                          </div>
                          <div className="tw-flex tw-items-center tw-mt-6 sm:tw-mt-6px tw-mb-4 sm:tw-mb-4px">
                            <Skeleton className="tw-w-1/4" containerClassName="tw-flex-1" />
                          </div>
                        </div>
                      </div>
                      <div
                        className={`${styles.menuSkeletonProductItemImageContainer} tw-ml-16 sm:tw-ml-16px tw-flex-shrink-0 tw-w-3/10`}
                      >
                        <SquareSkeleton
                          className="tw-rounded"
                          wrapperClassName="tw-m-2 sm:tw-m-2px tw-relative tw-flex tw-flex-shrink-0"
                          containerClassName="tw-flex tw-flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </section>
  </SkeletonTheme>
);

MenuSkeleton.displayName = 'MenuSkeleton';

export default MenuSkeleton;
