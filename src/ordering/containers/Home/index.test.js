import React from 'react';
import { render, fireEvent, queryByDisplayValue } from '@testing-library/react';
import { defaultsDeep } from 'lodash';
import { MemoryRouter, withRouter } from 'react-router';
import { Home } from './';
import { onlineStoreInfo, requestInfo, categories } from './__fixtures__';
import MiniCartListModal from './components/MiniCartListModal';
import ProductDetail from './components/ProductDetail';

const HomeWithRouter = withRouter(Home);

jest.mock('../../../components/Header', () => () => <div data-testid="header--mock" />);

jest.mock('./components/Footer', () => ({ onClickCart }) => (
  <div data-testid="order-home__footer--mock" onClick={() => onClickCart && onClickCart()} />
));

jest.mock('./components/ProductDetail', () =>
  jest.fn(({ onToggle }) => (
    <div data-testid="order-home__product-detail--mock" onClick={() => onToggle && onToggle()} />
  ))
);

jest.mock('./components/MiniCartListModal', () =>
  jest.fn(({ onToggle }) => (
    <div data-testid="order-home__mini-cart-list-modal--mock" onClick={() => onToggle && onToggle()} />
  ))
);

jest.mock('./components/CurrentCategoryBar', () => () => <div data-testid="order-home__current-category-bar--mock" />);

jest.mock('./components/CategoryProductList', () => ({ onToggle }) => (
  <div data-testid="order-home__category-product--mock" onClick={() => onToggle && onToggle('PRODUCT_DETAIL')} />
));

const getMockProps = (props = {}) => {
  const defaultProps = {
    onlineStoreInfo,
    requestInfo,
    categories,
    homeActions: {
      loadProductList: () => {},
    },
  };
  return defaultsDeep(props, defaultProps);
};

describe('ordering/containers/Home', () => {
  it('should render correctly', () => {
    const mockLoadProductList = jest.fn();
    const props = getMockProps({
      homeActions: {
        loadProductList: mockLoadProductList,
      },
    });
    const result = render(
      <MemoryRouter>
        <HomeWithRouter {...props} />
      </MemoryRouter>
    );
    expect(result.queryByTestId('header--mock')).toBeInTheDocument();
    expect(result.queryByTestId('order-home__category-product--mock')).toBeInTheDocument();
    expect(result.queryByTestId('order-home__current-category-bar--mock')).toBeInTheDocument();
    expect(result.queryByTestId('order-home__footer--mock')).toBeInTheDocument();
    expect(result.queryByTestId('order-home__mini-cart-list-modal--mock')).toBeInTheDocument();
    expect(result.queryByTestId('order-home__product-detail--mock')).toBeInTheDocument();
    expect(mockLoadProductList).toHaveBeenCalledTimes(1);
  });

  it('should be able to toggle cart', async () => {
    const props = getMockProps();
    const result = render(
      <MemoryRouter>
        <HomeWithRouter {...props} />
      </MemoryRouter>
    );
    fireEvent.click(result.getByTestId('order-home__footer--mock'));
    expect(MiniCartListModal).toHaveBeenLastCalledWith(expect.objectContaining({ show: true }), expect.anything());
    fireEvent.click(result.getByTestId('order-home__mini-cart-list-modal--mock'));
    expect(MiniCartListModal).toHaveBeenLastCalledWith(expect.objectContaining({ show: false }), expect.anything());
  });

  it('should be able to toggle product detail', async () => {
    const props = getMockProps();
    const result = render(
      <MemoryRouter>
        <HomeWithRouter {...props} />
      </MemoryRouter>
    );
    fireEvent.click(result.getByTestId('order-home__category-product--mock'));
    expect(ProductDetail).toHaveBeenLastCalledWith(expect.objectContaining({ show: true }), expect.anything());
    fireEvent.click(result.getByTestId('order-home__product-detail--mock'));
    expect(ProductDetail).toHaveBeenLastCalledWith(expect.objectContaining({ show: false }), expect.anything());
  });
});
