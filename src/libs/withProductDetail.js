import { graphql, compose } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import apiGql from '../apiGql';
import config from '../config';

export default options => compose(
  withRouter,
  graphql(apiGql.GET_PRODUCT_DETAIL, {
    name: 'gqlProductDetail',
    skip: ownProps => !ownProps.productId,
    options: ({ productId }) => {
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
