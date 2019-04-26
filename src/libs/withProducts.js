import { graphql, compose } from 'react-apollo';
import apiGql from '../apiGql';
import withConfig from './withConfig';

export default options => compose(
  withConfig(),
  graphql(apiGql.GET_PRODUCTS_WITH_CATEGORY, {
    name: 'gqlProducts',
    options: ({ config }) => {
      if (!config) {
        return null;
      }

      return ({
        variables: {
          business: config.business,
        }
      });
    },
    ...options,
  }),
);
