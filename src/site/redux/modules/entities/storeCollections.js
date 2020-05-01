const initialState = {};

// TODO: remove it and use api
const collectionDataSource = [
  {
    slug: 'self-pickup',
    label: 'CollectionPickUp',
    tags: [],
    icon: 'IconPickup',
  },
  {
    slug: 'iftar-with-beep',
    label: 'CollectionIftarWithBeep',
    tags: ['Halal'],
    icon: 'IconHalal',
  },
  {
    slug: 'desserts',
    label: 'CollectionDesserts',
    tags: ['Cakes', 'Bubble Tea', 'Ice Cream', 'Brownie'],
    icon: 'IconDessert',
    name: 'Desserts',
  },
  {
    slug: 'western',
    label: 'CollectionWestern',
    tags: ['Western'],
    icon: 'IconWestern',
  },
];

collectionDataSource.forEach(collection => {
  Object.assign(initialState, {
    [collection.slug]: collection,
  });
});

// @reducers
const reducer = (state = initialState, action) => {
  return state;
};

export default reducer;

// @selector
export const getAllStoreCollections = state => state.entities.storeCollections;
export const getCollectionBySlug = (state, slug) => getAllStoreCollections(state)[slug] || null;
