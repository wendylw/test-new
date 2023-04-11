import React, { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import _debounce from 'lodash/debounce';
import BeepNoResultImage from '../../../../../images/beep-no-results.svg';
import CategoryDropdown from './CategoryDropdown';
import SearchProductsBanner from './SearchProductsBanner';
import CategoryItem from './CategoryItem';
import {
  getProductsByCategory,
  getIsProductListReady,
  getIsSearchingBannerVisible,
  getSearchingProductKeywords,
  getSearchingProducts,
  getIsSearchingEmptyProducts,
} from '../../redux/common/selectors';
import { selectCategory } from '../../redux/common/thunks';
import { actions as commonActions } from '../../redux/common';
import styles from './MenuProductList.module.scss';

const generateScrollHandleId = id => `menu__category-scroll-handle--${id}`;

const SearchProductsResult = () => {
  const { t } = useTranslation();
  const isSearchingBannerVisible = useSelector(getIsSearchingBannerVisible);
  const searchingProductKeywords = useSelector(getSearchingProductKeywords);
  const searchingProductList = useSelector(getSearchingProducts);
  const isSearchingEmptyProducts = useSelector(getIsSearchingEmptyProducts);

  // Empty result UI
  if (isSearchingBannerVisible && isSearchingEmptyProducts) {
    return (
      <div className={styles.menuProductNoResult}>
        <img className={styles.menuProductNoResultImage} src={BeepNoResultImage} alt="StoreHub beep no result" />
        <p className="tw-px-8 sm:tw-px-8px tw-my-8 sm:tw-my-8px tw-leading-loose tw-font-bold tw-text-gray-700">
          <Trans
            t={t}
            i18nKey="SearchingProductsNoResult"
            values={{ searchingProductKeywords }}
            components={[<br />]}
          />
        </p>
      </div>
    );
  }

  return (
    <>
      {searchingProductList.map(category => {
        const { products = [] } =
          searchingProductList.find(currentCategory => currentCategory.id === category.id) || {};
        return <CategoryItem key={category.id} category={category} products={products} />;
      })}
    </>
  );
};

SearchProductsResult.displayName = 'SearchProductsResult';

// This is to detect when scrollIntoView is finished. The idea is that scrollIntoView will trigger scroll event
// continuously, so when the scroll events stopped, we know the scrollIntoView is finished.
const waitForScrollComplete = callback => {
  const listener = _debounce(() => {
    callback();
    window.removeEventListener('scroll', listener);
  }, 500);
  window.addEventListener('scroll', listener);
  // fires even if no scroll happens
  window.dispatchEvent(new Event('scroll'));
};

const MenuProductList = () => {
  const dispatch = useDispatch();
  const productList = useSelector(getProductsByCategory);
  const isProductListReady = useSelector(getIsProductListReady);
  // This is to detect when scrollIntoView is finished. The idea is that scrollIntoView will trigger scroll event
  const isSearchingBannerVisible = useSelector(getIsSearchingBannerVisible);
  const blockIntersectionObserver = useRef(false); // do not use state to avoid async issues.
  const menuProductListRef = useRef(null);
  const menuProductCategorySearchRef = useRef(null);
  const searchInputRef = useRef(null);
  const handleOnIntersectionChange = useCallback(
    ({ inView, categoryId }) => {
      if (blockIntersectionObserver.current) return;
      dispatch(commonActions.setCategoriesInView({ categoryId, inView }));
    },
    [dispatch]
  );

  // is product list data ready, if not UI can display a loading
  if (!isProductListReady) {
    return null;
  }

  return (
    <>
      <div className={styles.menuProductCategorySearchContainer} ref={menuProductCategorySearchRef}>
        {isSearchingBannerVisible ? null : (
          <CategoryDropdown
            onCategoryItemClick={categoryId => {
              const categoryElement = document.getElementById(generateScrollHandleId(categoryId));

              if (categoryElement) {
                blockIntersectionObserver.current = true;
                categoryElement.scrollIntoView({ behavior: 'smooth' });
                dispatch(selectCategory(categoryId));
                waitForScrollComplete(() => {
                  blockIntersectionObserver.current = false;
                });
              }
            }}
          />
        )}
        <SearchProductsBanner
          menuProductCategorySearchRef={menuProductCategorySearchRef}
          menuProductListRef={menuProductListRef}
          searchInputRef={searchInputRef}
        />
      </div>

      {isSearchingBannerVisible ? (
        <div
          ref={menuProductListRef}
          onTouchStart={() => {
            searchInputRef.current?.blur();
          }}
        >
          <SearchProductsResult />
        </div>
      ) : (
        <div>
          {productList.map(category => (
            <CategoryItem
              key={category.id}
              category={category}
              products={category.products}
              onIntersectionChange={handleOnIntersectionChange}
            />
          ))}
        </div>
      )}
    </>
  );
};

MenuProductList.displayName = 'MenuProductList';

export default MenuProductList;
