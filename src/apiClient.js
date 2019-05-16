import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { ApolloLink, from } from 'apollo-link';

import cache from "./apiCache";
import { resolvers, typeDefs } from "./apiResolvers";

const uri = process.env.REACT_APP_GQL_ENTRY_MP;
const httpLink = new HttpLink({
  uri,
  credentials: 'same-origin',
});
export const client = new ApolloClient({
  link: from([
    httpLink,
  ]),
  cache,
  typeDefs,
  resolvers,
});

const uriCoreApi = process.env.REACT_APP_GQL_ENTRY_CO;
const httpLinkCoreApi = new HttpLink({
  uri: uriCoreApi,
  credentials: 'same-origin',
});
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
