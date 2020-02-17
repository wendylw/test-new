import React from 'react';
import { render, cleanup, getByTestId } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Header from './header';

afterEach(cleanup);

/** snapshot test case */
// it("renders", () => {
//     const { asFragment } = render(<Header text="Hello!" />);
//     expect(asFragment()).toMatchSnapshot();
// });

describe('testDemos/header', () => {
  test('should insert text in h1', () => {
    const { getByTestId, getByText } = render(<Header text="Hello!" />);
    expect(getByTestId('h1tag')).toHaveTextContent('Hello!');
  });
});
