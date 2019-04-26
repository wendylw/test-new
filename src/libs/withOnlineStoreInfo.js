import { graphql, compose } from 'react-apollo';
import apiGql from '../apiGql';
import config from '../config';

export default options => compose(
  graphql(apiGql.GET_ONLINE_STORE_INFO, {
    name: 'gqlOnlineStoreInfo',
    options: () => {
      return ({
        variables: {
          business: config.business,
        }
      });
    },
    ...options,
  }),
);
