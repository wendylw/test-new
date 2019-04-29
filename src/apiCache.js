// import { InMemoryCache } from "apollo-boost";
import { InMemoryCache } from 'apollo-cache-inmemory';

const cache = new InMemoryCache({
  addTypename: false,
});

// localState initialization
const initialData = {
  data: {
    counts: 100,
    countsUpdatedAt: Date.now(),
    currentCategory: null,
    showMenu: false,
  },
};

cache.writeData(initialData);

export default cache;
