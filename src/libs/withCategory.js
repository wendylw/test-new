import { graphql, compose } from 'react-apollo';
import apiGql from '../apiGql';
import withConfig from './withConfig';

export default compose(
  withConfig,
  graphql(apiGql.GET_ONLINE_CATEGORY, {
    name: 'gqlOnlineCategory',
    skip: ({ config }) => !config,
    options: ({ config }) => ({
      variables: {
        business: config.business,
      }
    }),
  }),
);
