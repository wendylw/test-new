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
      markedSoldOut
    }
    markedSoldOut
    displayPrice
    quantity
    image
  }
`;

apiGql.FRAGMENT_PRODUCT_CHILDREN_MAP = gql`
  fragment ProductChildrenMap on Product {
    variation
    childId
    quantityOnHand
    displayPrice
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

apiGql.TOGGLE_MENU = gql`
  mutation {
    toggleMenu @client
  }
`;

// powered by core-api
apiGql.GET_CORE_BUSINESS = gql`
  query CoreBusiness($business: ID!, $storeId: ID!) {
    business(name: $business) {
      name
      enablePax
      enableServiceCharge
      serviceChargeRate
      serviceChargeTax
      subscriptionStatus
      stores(id: $storeId) {
        receiptTemplateData {
          taxName
        }
      }
    }
  }
`;

apiGql.GET_ONLINE_STORE_INFO = gql`
  query OnlineStoreInfo($business: String!) {
    onlineStoreInfo(business: $business) {
      id
      storeName
      logo
      favicon
      locale
      currency
      currencySymbol
      country
      state
      street
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
      unitPrice
      onlineUnitPrice
      inventoryType
      images
      variations {
        id
        name
        variationType
        optionValues {
          id
          value
          priceDiff
          markedSoldOut
        }
      }
      trackInventory
      childrenMap {
        childId
        quantityOnHand
        displayPrice
        variation
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
        trackInventory
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
        markedSoldOut
      }
    }
  }
`;

apiGql.GET_SHOPPING_CART = gql`
  ${apiGql.FRAGMENT_SHOPPNIG_CART_ITEMS}
  query ShoppingCart($business: String!) {
    shoppingCart(
      business: $business,
      userId: ""
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

apiGql.REMOVE_SHOPPING_CART_ITEM = gql`
  mutation RemoveShoppingCartItem($productId: String!, $variations: [inputVariation]) {
    removeShoppingCartItem(input: {
      productId: $productId,
      variations: $variations
    }) {
      productId
    }
  }
`;

// Field [additionalComments] stores table id here.
apiGql.GET_ORDER_DETAIL = gql`
  query Order($orderId: String!) {
    order(orderId: $orderId) {
      orderId
      status
      total
      storeId
      additionalComments
      pickUpId
    }
  }
`;

apiGql.SET_CURRENT_CATEGORY = gql`
  mutation SetCurrentCategory($category: Object!) {
    setCurrentCategory(category: $category) @client
  }
`;

apiGql.EMPTY_SHOPPING_CART = gql`
  mutation EmptyShoppingCart {
    emptyShoppingCart(input: {}) {
      success
    }
  }
`;

// [source] critirial: { ECOMMERCE: 1, QR: 2 }
apiGql.ADD_OR_UPDATE_SHOPPING_CART_ITEM = gql`
  mutation AddOrUpdateShoppingCartItem(
    $action: String!,
    $business: String!,
    $productId: String!,
    $quantity: Int!,
    $variations: [inputVariation]
  ) {
    addOrUpdateShoppingCartItem(input: {
      action: $action,
      business: $business,
      productId: $productId,
      userId: "",
      quantity: $quantity,
      variations: $variations,
      source: 2
    }) {
      shoppingCartItem {
        id
        business
        quantity
      }
    }
  }
`;

apiGql.CREATE_ORDER = gql`
  mutation CreateOrder(
    $business: String!,
    $storeId: String!,
    $tableId: String,
    $pax: Int!,
    $shoppingCartIds: [String]
  ) {
    createOrder(input: {
      business: $business,
      storeId: $storeId,
      shoppingCartIds: $shoppingCartIds,
      tableId: $tableId,
      pax: $pax,
      channel: 3
    }) {
      orders {
        id
        total
        orderId
      }
    }
  }
`;

export default apiGql;
