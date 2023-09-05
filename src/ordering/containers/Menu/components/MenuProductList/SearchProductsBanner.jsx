import _isEmpty from 'lodash/isEmpty';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { MagnifyingGlass } from 'phosphor-react';
import {
  hideSearchingBox,
  showSearchingBox,
  updateSearchingKeyword,
  clearSearchingKeyword,
  setBeforeStartToSearchScrollTopPosition,
  clearBeforeStartToSearchScrollTopPosition,
  updateStatusVirtualKeyboard,
} from '../../redux/common/thunks';
import {
  getIsSearchingBannerVisible,
  getSearchingProductKeywords,
  getBeforeStartToSearchScrollTopPosition,
} from '../../redux/common/selectors';
import Button from '../../../../../common/components/Button';
import Search from '../../../../../common/components/Input/Search';
import {
  bodyScrollTopPosition,
  getSearchingBannerHeight,
  getSearchingBannerOffsetTop,
  getProductListOffsetTop,
  getWindowScrollingPositionForSearchingProductList,
  getWindowInnerHeight,
} from '../../utils';
import styles from './SearchProductsBanner.module.scss';
import { isMobile, isSafari } from '../../../../../common/utils';

const originalHeight = getWindowInnerHeight();
const isIosMobile = isSafari();
const SearchProductsBanner = ({ menuProductCategorySearchRef, menuProductListRef, searchInputRef }) => {
  const { t } = useTranslation();
  // for whether display searching banner
  const isSearchingBannerVisible = useSelector(getIsSearchingBannerVisible);
  // get searching product keywords
  const searchingProductKeywords = useSelector(getSearchingProductKeywords);
  // get scrolling top position before starting to search, after clear keyword
  const beforeStartToSearchScrollTopPosition = useSelector(getBeforeStartToSearchScrollTopPosition);
  const dispatch = useDispatch();
  useEffect(() => {
    const visualViewportObj = window.visualViewport;
    const onUpdateStatusVirtualKeyboard = async () => {
      if (originalHeight - visualViewport.height <= 50) {
        await dispatch(updateStatusVirtualKeyboard(false));
      } else if (originalHeight - visualViewport.height > 50) {
        await dispatch(updateStatusVirtualKeyboard(true));
      }
    };

    // If the visualViewport height is smaller than the original height, indicates that the virtual keyboard is shown.
    // So, we need to update the virtual keyboard status.
    isMobile() && !isIosMobile && visualViewportObj?.addEventListener('resize', onUpdateStatusVirtualKeyboard);

    return () => {
      isMobile() && !isIosMobile && visualViewportObj?.removeEventListener('resize', onUpdateStatusVirtualKeyboard);
    };
  }, [dispatch]);

  useEffect(() => {
    if (isSearchingBannerVisible) {
      searchInputRef.current?.focus();
    }
  }, [isSearchingBannerVisible, searchInputRef]);

  return (
    <div className={`${styles.menuSearchProductsBanner} ${isSearchingBannerVisible ? 'tw-flex-1' : ''}`}>
      {isSearchingBannerVisible ? null : (
        <Button
          type="text"
          theme="ghost"
          className={styles.menuSearchProductsBannerButton}
          contentClassName={styles.menuSearchProductsBannerButtonContent}
          data-test-id="ordering.menu.product-list.search-banner.show-btn"
          onClick={async () => {
            // get window scroll position
            const scrollTopPosition = bodyScrollTopPosition();
            // get height from product list to page top
            const productListOffsetTop = getProductListOffsetTop(menuProductListRef.current);
            // get height of searching banner
            const searchingBannerHeight = getSearchingBannerHeight(menuProductCategorySearchRef.current);
            // get height from searching banner to page top
            const searchingBannerOffsetTop = getSearchingBannerOffsetTop(menuProductCategorySearchRef.current);
            /**
             * Search banner has sticky on top.
             * Window scrolling keep on current product list position when elements hide above searching banner
             * */
            const windowScrollingPosition = getWindowScrollingPositionForSearchingProductList({
              scrollTopPosition,
              productListOffsetTop,
              searchingBannerHeight,
              searchingBannerOffsetTop,
            });

            if (windowScrollingPosition) {
              window.scrollTo({
                top: windowScrollingPosition,
                left: 0,
                behavior: 'instant',
              });
            }

            dispatch(showSearchingBox());
          }}
        >
          <MagnifyingGlass weight="light" className="tw-flex-shrink-0 tw-text-2xl tw-text-black" />
        </Button>
      )}
      {isSearchingBannerVisible ? (
        <>
          <Search
            ref={searchInputRef}
            placeholder={t('MenuSearchingBoxPlaceholder')}
            defaultSearchKeyword={searchingProductKeywords}
            onChangeInputValue={async value => {
              dispatch(updateSearchingKeyword(value));

              if (_isEmpty(searchingProductKeywords)) {
                await dispatch(setBeforeStartToSearchScrollTopPosition(bodyScrollTopPosition()));
                window.scrollTo({
                  top: 0,
                  left: 0,
                  behavior: 'instant',
                });
              }
            }}
            onClearInput={async () => {
              await dispatch(clearSearchingKeyword());
              await window.scrollTo({
                top: beforeStartToSearchScrollTopPosition,
                left: 0,
                behavior: 'instant',
              });
            }}
          />
          <Button
            type="text"
            className={styles.menuSearchProductsBannerCancelButton}
            data-test-id="ordering.menu.product-list.search-banner.cancel-btn"
            onClick={async () => {
              await dispatch(hideSearchingBox());
              dispatch(clearSearchingKeyword());
              dispatch(clearBeforeStartToSearchScrollTopPosition());
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant',
              });
            }}
          >
            {t('Cancel')}
          </Button>
        </>
      ) : null}
    </div>
  );
};

SearchProductsBanner.displayName = 'SearchProductsBanner';

SearchProductsBanner.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  menuProductCategorySearchRef: PropTypes.any,
  // eslint-disable-next-line react/forbid-prop-types
  menuProductListRef: PropTypes.any,
  // eslint-disable-next-line react/forbid-prop-types
  searchInputRef: PropTypes.any,
};
SearchProductsBanner.defaultProps = {
  menuProductCategorySearchRef: null,
  menuProductListRef: null,
  searchInputRef: null,
};

export default SearchProductsBanner;
