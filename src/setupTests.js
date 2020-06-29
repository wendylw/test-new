/**
 * enzyme document: https://airbnb.io/enzyme/
 * Adapter configuration: https://airbnb.io/enzyme/docs/installation/react-16.html
 */

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import '@testing-library/jest-dom/extend-expect';

configure({ adapter: new Adapter() });
