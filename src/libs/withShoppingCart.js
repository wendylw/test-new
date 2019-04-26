import { graphql, compose } from 'react-apollo';
import apiGql from '../apiGql';
import withConfig from './withConfig';
import withSession from './withSession';

export default options => compose(
  withConfig(),
  withSession,
  graphql(apiGql.GET_SHOPPING_CART, {
    name: 'gqlShoppingCart',
    skip: ({ config, sessionId }) => {
      return (!config | !sessionId);
    },
    options: ({ config, sessionId }) => {

      return ({
        variables: {
          business: config.business,
          sessionId,
        }
      });
    },
    ...options,
  }),
);
