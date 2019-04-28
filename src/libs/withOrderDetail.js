import { graphql, compose } from 'react-apollo';
import apiGql from '../apiGql';
// import config from '../config';

export default options => compose(
  graphql(apiGql.GET_ORDER_DETAIL, {
    name: 'gqlOrderDetail',
    ...options,
  }),
);
