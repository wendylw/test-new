import { graphql, compose } from 'react-apollo';
import apiGql from '../apiGql';
import withConfig from './withConfig';

export default options => compose(
  withConfig(),
  graphql(apiGql.GET_PRODUCT_DETAIL, {
    name: 'gqlProductDetail',
    options: ({ config, productId }) => {
      if (!config) {
        return null;
      }

      console.log('request gqlProductDetail with productId=%o', productId);

      return ({
        variables: {
          business: config.business,
          productId,
        }
      });
    },
    ...options,
  }),
);
