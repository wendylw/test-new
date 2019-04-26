import { graphql, compose } from 'react-apollo';
import apiGql from '../apiGql';
import config from '../config';

export default options => compose(
  graphql(apiGql.GET_PRODUCT_DETAIL, {
    name: 'gqlProductDetail',
    options: ({ productId }) => {
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
