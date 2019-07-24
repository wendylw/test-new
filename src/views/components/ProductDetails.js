import { compose, graphql } from "react-apollo";
import { withRouter } from 'react-router-dom';
import apiGql from "../../apiGql";
import withProductDetail from "../../libs/withProductDetail";
import ProductDetailsComponent from "./ProductDetailsComponent";
import withOnlineStoreInfo from "../../libs/withOnlineStoreInfo";

export default compose(
  withRouter,
  withOnlineStoreInfo({
    props: ({ gqlOnlineStoreInfo: { onlineStoreInfo } }) => {
      const props = { onlineStoreInfo };

      return props;
    },
  }),
  withProductDetail({
    props: ({ gqlProductDetail: { loading, product } }) => ({
      loading,
      product,
    }),
  }),
  graphql(apiGql.ADD_OR_UPDATE_SHOPPING_CART_ITEM, {
    name: 'addOrUpdateShoppingCartItem',
    options: {
      refetchQueries: ['ShoppingCart'],
    },
  }),
)(ProductDetailsComponent);
