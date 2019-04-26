import { graphql, compose } from 'react-apollo';
import apiGql from '../apiGql';
import withConfig from './withConfig';

export default options => compose(
  withConfig(),
  graphql(apiGql.GET_ONLINE_STORE_INFO, {
    name: 'gqlOnlineStoreInfo',
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
