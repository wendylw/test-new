import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter, withRouter } from 'react-router';
import { defaultsDeep } from 'lodash';
import { ThankYou } from './';
import { onlineStoreInfo, order } from './__fixtures__';

jest.mock('./components/PhoneLogin', () => () => <div data-testid="phone-login--mock">Phone Login Component</div>);

const ThankYouWithRouter = withRouter(ThankYou);

const getMockProps = (props = {}) => {
  const defaultProps = {
    onlineStoreInfo,
    order,
    thankYouActions: {
      loadOrder: () => {},
      getCashbackInfo: () => {},
      createCashbackInfo: () => {},
    },
  };
  return defaultsDeep(props, defaultProps);
};

describe('ordering/containers/ThankYou', () => {
  it('should render correctly with order info', () => {
    const mockLoadOrder = jest.fn();
    const props = getMockProps({
      thankYouActions: {
        loadOrder: mockLoadOrder,
      },
    });
    const result = render(
      <MemoryRouter>
        <ThankYouWithRouter {...props} />
      </MemoryRouter>
    );
    expect(mockLoadOrder).toHaveBeenCalledTimes(1);
    expect(result.queryByTestId('thanks__pickup-number')).toHaveTextContent(order.pickUpId);
    expect(result.queryByTestId('thanks__view-receipt')).toBeInTheDocument();
    expect(result.queryByTestId('phone-login--mock')).toBeInTheDocument();
    expect(result.queryByTestId('thanks__self-pickup')).toBeInTheDocument();
  });

  it('should render table id if provided', () => {
    const props = getMockProps({
      order: {
        tableId: '234',
      },
    });
    const result = render(
      <MemoryRouter>
        <ThankYouWithRouter {...props} />
      </MemoryRouter>
    );
    expect(result.queryByTestId('thanks__table-id')).toHaveTextContent('234');
  });

  it('should render correctly without order info', () => {
    const props = getMockProps({
      order: null,
    });
    const result = render(
      <MemoryRouter>
        <ThankYouWithRouter {...props} />
      </MemoryRouter>
    );
    expect(result.queryByTestId('thanks__pickup-number')).toBe(null);
  });

  it('should perform navigation when view receipt is clicked', () => {
    const pushMock = jest.fn();
    const props = getMockProps({
      match: {},
      history: {
        push: pushMock,
        location: {},
      },
    });
    const result = render(<ThankYou {...props} />);
    fireEvent.click(result.getByTestId('thanks__view-receipt'));
    expect(pushMock).toHaveBeenCalledWith({
      pathname: '/receipt',
      search: `?receiptNumber=${order.orderId}`,
    });
  });
});
