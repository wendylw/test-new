import React from 'react';
import { shallow } from 'enzyme';
import { Footer } from './Footer';

describe('testDemos/footer', () => {
  test('should render customer service', () => {
    const wrapper = shallow(<Footer />);
    const span = wrapper.find('span');
    const result = span.text();

    expect(result).toBe('Customer Service: 1-8000-555-444');
  });
});
