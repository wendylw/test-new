import { graphql, compose } from 'react-apollo';
import apiGql from '../apiGql';
import config from '../config';

export default options => compose(
  graphql(apiGql.GET_SHOPPING_CART, {
    name: 'gqlShoppingCart',
    options: () => ({
      variables: {
        business: config.business,
      }
    }),
    ...options,
  }),
);
