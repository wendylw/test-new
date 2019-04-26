import { graphql, compose } from 'react-apollo';
import apiGql from '../apiGql';
import config from '../config';

export default options => compose(
  graphql(apiGql.GET_ONLINE_CATEGORY, {
    name: 'gqlProducts',
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
