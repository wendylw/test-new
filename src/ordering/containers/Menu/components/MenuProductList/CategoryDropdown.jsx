import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { CaretDown, X } from 'phosphor-react';
import Button from '../../../../../common/components/Button';
import Badge from '../../../../../common/components/Badge';
import Drawer from '../../../../../common/components/Drawer';
import DrawerHeader from '../../../../../common/components/Drawer/DrawerHeader';
import { getCategories, getIsProductListReady, getHighlightedCategory } from '../../redux/common/selectors';
import styles from './CategoryDropdown.module.scss';
import MenuFilled from '../../../../../images/menu-filled.svg';

const categoriesPropTypes = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string,
    isActive: PropTypes.bool,
    name: PropTypes.string,
    cartQuantity: PropTypes.number,
  })
);

const CategoryList = ({ categories, onCategoryItemClick }) => {
  const highlightedCategory = useSelector(getHighlightedCategory);
  return (
    <ul className="tw-divide-x-0 tw-divide-y tw-divide-solid tw-divide-gray-200 tw-px-16 sm:tw-px-16px tw-py-8 sm:tw-py-8px">
      {categories.map(category => (
        <li
          key={`categoryItem-${category.id}`}
          className={`${styles.menuProductCategoryItem} tw-cursor-default beep-line-clamp-flex-container ${
            (highlightedCategory && highlightedCategory.id) === category.id ? ' active' : ''
          }`}
          data-test-id="ordering.menu.product-list.category-item"
          onClick={() => {
            onCategoryItemClick(category.id);
          }}
        >
          <span className={styles.menuProductCategoryItemText}>{category.name}</span>
          {category.cartQuantity ? <Badge className="tw-flex-shrink-0" value={category.cartQuantity} /> : null}
        </li>
      ))}
    </ul>
  );
};

CategoryList.displayName = 'CategoryList';

CategoryList.propTypes = {
  categories: categoriesPropTypes,
  onCategoryItemClick: PropTypes.func,
};
CategoryList.defaultProps = {
  categories: [],
  onCategoryItemClick: () => {},
};

const CategoryDropdown = ({ onCategoryItemClick }) => {
  const { t } = useTranslation();
  // Get category list
  const categories = useSelector(getCategories);
  // is product list data ready, if not UI can display a loading
  const isProductListReady = useSelector(getIsProductListReady);
  // current highlighted category
  const highlightedCategory = useSelector(getHighlightedCategory);

  // The history.back will restore the body scroll position. So if we need set the scroll position, we must wait util the
  // history.back finished. So we will store the categoryId in stagedCategoryId, and then close the drawer first, and then
  // trigger onCategoryItemClick after the history.back finished.
  const [showDrawer, setShowDrawer] = useState(false);
  const [stagedCategoryId, setStagedCategoryId] = useState(null);
  const onHiddenCategoryDrawer = useCallback(() => {
    setStagedCategoryId(null);
    // Must add this setTimeout, otherwise scrollIntoView won't work. I suspect that the history.back
    // will restore the position in an async way.
    onCategoryItemClick(stagedCategoryId);
  }, [stagedCategoryId, onCategoryItemClick]);
  const onCategorySelected = useCallback(id => {
    setStagedCategoryId(id);
    setShowDrawer(false);
  }, []);

  return (
    <div className="tw-flex-1 beep-line-clamp-flex-container">
      <Button
        block
        type="text"
        theme="ghost"
        className={styles.menuProductCategoryButton}
        contentClassName={styles.menuProductCategoryContentButton}
        data-test-id="ordering.menu.product-list.show-btn"
        onClick={() => {
          if (isProductListReady) {
            setShowDrawer(true);
          }
        }}
      >
        <img className="tw-flex-shrink-0 tw-text-2xl" src={MenuFilled} alt="Selected Category" />
        <span className={styles.menuProductHighlightedCategory}>
          {highlightedCategory ? highlightedCategory.name : null}
        </span>
        <CaretDown className="tw-flex-shrink-0 tw-my-4 sm:tw-my-4px tw-text-gray-600" size={16} />
      </Button>
      <Drawer
        className={styles.menuProductCategoryDrawer}
        show={showDrawer}
        onClose={() => setShowDrawer(false)}
        onHidden={onHiddenCategoryDrawer}
        header={
          <DrawerHeader
            left={
              <Button
                type="text"
                theme="ghost"
                data-test-id="ordering.menu.product-list.close-btn"
                onClick={() => setShowDrawer(false)}
                className={styles.menuProductCategoryDrawerHeaderCloseButton}
                contentClassName={styles.menuProductCategoryDrawerHeaderCloseButtonContent}
              >
                <X weight="light" className="tw-flex-shrink-0 tw-text-2xl tw-text-gray" />
              </Button>
            }
          >
            <h2 className="tw-flex-1 tw-text-center tw-px-16 sm:tw-px-16px tw-font-bold">{t('Menu')}</h2>
          </DrawerHeader>
        }
      >
        <CategoryList categories={categories} onCategoryItemClick={onCategorySelected} />
      </Drawer>
    </div>
  );
};

CategoryDropdown.displayName = 'CategoryDropdown';

CategoryDropdown.propTypes = {
  onCategoryItemClick: PropTypes.func,
};
CategoryDropdown.defaultProps = {
  onCategoryItemClick: () => {},
};

export default CategoryDropdown;
