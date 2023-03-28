/**
 * enzyme document: https://airbnb.io/enzyme/
 * Adapter configuration: https://airbnb.io/enzyme/docs/installation/react-16.html
 */
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import '@testing-library/jest-dom/extend-expect';
require('jest-fetch-mock').enableMocks();

// yarn test:coverage will response `ReferenceError: React is not defined`
// solutions refer: https://github.com/aelbore/esbuild-jest/issues/61#issuecomment-1061011148
configure({ adapter: new Adapter() });
