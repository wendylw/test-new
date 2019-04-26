import gql from "graphql-tag";

const apiGql = {};

apiGql.FRAGMENT_SHOPPNIG_CART_ITEMS = gql`
  fragment ShoppingCartItem on shoppingCartItem {
    id
    productId
    title
    variationTexts
    variations {
      variationId
      optionId
    }
    displayPrice
    quantity
    image
  }
`;

apiGql.FRAGMENT_ONLINE_CATEGORY = gql`
  fragment OnlineCategoryFragment on OnlineCategory {
    id
    name
    isEnabled
  }
`;

// localState holds on browser cache, a serverless state.
apiGql.GET_LOCAL_STATE = gql`
  ${apiGql.FRAGMENT_ONLINE_CATEGORY}
  query LocalState {
    counts @client
    countsUpdatedAt @client
    currentCategory @client {
      ...OnlineCategoryFragment
    }
  }
`;

apiGql.GET_ONLINE_CATEGORY_SIMPLE = gql`
  ${apiGql.FRAGMENT_ONLINE_CATEGORY}
  query OnlineCategory($business: String!) {
    onlineCategory(business: $business) {
      ...OnlineCategoryFragment
    }
  }
`;

apiGql.GET_ONLINE_STORE_INFO = gql`
  query OnlineStoreInfo($business: String!) {
    onlineStoreInfo(business: $business) {
      id
      storeName
      logo
      locale
      currency
      currencySymbol
    }
  }
`;

apiGql.GET_PRODUCT_DETAIL = gql`
  query ProductDetail (
    $business: String!,
    $productId: String!
  ) {
    product(
      business: $business,
      productId: $productId
    ) {
      id
      title
      displayPrice
      images
      variations {
        id
        name
        variationType
        optionValues {
          id
          value
        }
      }
    }
  }
`;

apiGql.GET_PRODUCTS = gql`
  query ProductList($page: Int!, $size: Int!, $business: String!) {
    products(page: $page, size: $size, business: $business) {
      total
      productlist {
        id
        title
        displayPrice
      }
    }
  }
`;

apiGql.GET_ONLINE_CATEGORY = gql`
  query OnlineCategory($business: String!) {
    onlineCategory(business: $business) {
      id
      name
      isEnabled
      products {
        id
        title
        displayPrice
        images
        variations {
          id
          name
          variationType
          optionValues {
            id
            value
          }
        }
      }
    }
  }
`;

apiGql.GET_SHOPPING_CART = gql`
  ${apiGql.FRAGMENT_SHOPPNIG_CART_ITEMS}
  query ShoppingCart($business: String!, $sessionId: String!) {
    shoppingCart(
      business: $business,
      userId: "",
      sessionId: $sessionId,
    ) {
      total
      subtotal
      count
      discount
      tax
      items {
        ...ShoppingCartItem
      }
      unavailableItems {
        ...ShoppingCartItem
      }
    }
  }
`;

apiGql.GET_SHOPPING_CART_COUNT = gql`
  query ShoppingCartCount($business: String!, $sessionId: String!) {
    shoppingCartCount(business: $business, userId: "", sessionId: $sessionId) {
      count
    }
  }
`;

apiGql.SET_CURRENT_CATEGORY = gql`
  mutation SetCurrentCategory($category: Object!) {
    setCurrentCategory(category: $category) @client
  }
`;

apiGql.ADD_OR_UPDATE_SHOPPING_CART_ITEM = gql`
  mutation AddOrUpdateShoppingCartItem(
    $action: String!,
    $business: String!,
    $productId: String!,
    $sessionId: String!,
    $quantity: Int!,
    $variations: [inputVariation],
  ) {
    addOrUpdateShoppingCartItem(input: {
      action: $action,
      business: $business,
      productId: $productId,
      sessionId: $sessionId,
      userId: "",
      quantity: $quantity,
      variations: $variations
    }) {
      shoppingCartItem {
        id
        business
        quantity
      }
    }
  }
`;

export default apiGql;
