import gql from 'graphql-tag';
import apiGql from './apiGql';

// localState types, this will not validate anything, but helpful for chrome devtool.
// local state reference: https://www.apollographql.com/docs/tutorial/local-state
export const typeDefs = gql`
  extend type Query {
    counts: Int!
    countsUpdatedAt: Int!
    showMenu: Boolean!
  }

  extend type Mutation {
    toggleCounts: Int!
    toggleMenu: Boolean!
  }
`;

// localState mutations
const toggleCountMutation = (obj, args, context) => {
  const { cache } = context;

  const { counts } = cache.readQuery({ query: apiGql.GET_LOCAL_STATE });
  const data = {
    counts: counts + 1,
    countsUpdatedAt: Date.now(),
  };
  cache.writeQuery({ query: apiGql.GET_LOCAL_STATE, data });

  return data.counts;
};

const toggleMenuMutation = (obj, args, context) => {
  const { cache } = context;

  const { showMenu = false } = cache.readQuery({ query: apiGql.GET_LOCAL_STATE });
  const data = {
    showMenu: !showMenu,
  };
  cache.writeQuery({ query: apiGql.GET_LOCAL_STATE, data });

  return data.showMenu;
};

const setCurrentCategoryMutation = (obj, { category }, context) => {
  if (!category) {
    return null;
  }

  const data = { currentCategory: category };
  context.cache.writeData({ data });

  return null;
};

export const resolvers = {
  Mutation: {
    toggleCounts: toggleCountMutation,
    toggleMenu: toggleMenuMutation,
    setCurrentCategory: setCurrentCategoryMutation,
  },
};
