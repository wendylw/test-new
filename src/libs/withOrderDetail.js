import { graphql, compose } from 'react-apollo';
import apiGql from '../apiGql';
import config from '../config';

export default options => compose(
  graphql(apiGql.GET_ORDER_DETAIL, {
    name: 'gqlOrderDetail',
    options: ({ history }) => {
      const query = new URLSearchParams(history.location.search);
      const orderId = query.get('orderId');

      return ({
        variables: {
          business: config.business,
          orderId,
        }
      });
    },
    ...options,
  }),
);
