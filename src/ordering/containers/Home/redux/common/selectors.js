import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { getAllCategories } from '../../../../../redux/modules/entities/categories';
import { getAllProducts } from '../../../../../redux/modules/entities/products';

export const getSelectedProductId = state => state.home.common.selectedProductDetail.productId;

export const getSelectedCategoryId = state => state.home.common.selectedProductDetail.categoryId;

export const getSelectedProduct = createSelector(getSelectedProductId, getAllProducts, (productId, products) =>
  _get(products, productId, null)
);

export const getSelectedCategory = createSelector(getSelectedCategoryId, getAllCategories, (categoryId, categories) =>
  _get(categories, categoryId, null)
);

export const getSelectedProductDetail = createSelector(getSelectedProduct, getSelectedCategory, (product, category) => {
  if (!product) {
    return null;
  }

  return {
    ...product,
    categoryName: _get(category, 'name', null),
    categoryRank: _get(category, 'rank', null),
  };
});
