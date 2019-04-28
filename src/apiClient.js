import ApolloClient from "apollo-boost";
import config from './config';
import cache from "./apiCache";
import { resolvers, typeDefs } from "./apiResolvers";

const client = new ApolloClient({
  uri: `${config.backendBaseUrl}/graphql`,
  cache,
  typeDefs,
  resolvers,
  // credentials: 'include',
});

if (process.env.NODE_ENV === 'development') {
  console.warn('development mode, exports window.apiClient for debugging.');
  window.apiClient = client;
}

export default client;
