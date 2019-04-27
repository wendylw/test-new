import { graphql, compose } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import apiGql from '../apiGql';
import config from '../config';

export default options => compose(
  withRouter,
  graphql(apiGql.GET_PRODUCT_DETAIL, {
    name: 'gqlProductDetail',
    options: ({ match }) => {
      return ({
        variables: {
          business: config.business,
          productId: match.params.productId,
        }
      });
    },
    ...options,
  }),
);
