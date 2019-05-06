import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { ApolloLink, from } from 'apollo-link';

import config from './config';
import cache from "./apiCache";
import { resolvers, typeDefs } from "./apiResolvers";

const uri = `${config.backendBaseUrl || ''}/graphql`;
const httpLink = new HttpLink({ uri });
export const client = new ApolloClient({
  link: from([
    httpLink,
  ]),
  cache,
  typeDefs,
  resolvers,
  // credentials: 'include',
});

// TODO: will use backendBaseUrl as proxy when api is ready.
// const uriCoreApi = `${config.backendBaseUrl || ''}/graphql-c`;
const uriCoreApi = 'http://localhost:4000/graphql';

const httpLinkCoreApi = new HttpLink({ uri: uriCoreApi });
const basicRequest = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      'storehub-source': 'open-api',
    }
  }));

  return forward(operation);
});

export const clientCoreApi = new ApolloClient({
  link: from([
    basicRequest,
    httpLinkCoreApi,
  ]),
  cache,
});

if (process.env.NODE_ENV === 'development') {
  console.warn('development mode, exports window.apiClient for debugging.');
  window.apiClient = client;
}

export default {};
