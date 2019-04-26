import { compose, graphql } from "react-apollo";
import apiGql from "../../apiGql";
import PayButtonComponent from "./PayButtonComponent";

export default compose(
  graphql(apiGql.ADD_OR_UPDATE_SHOPPING_CART_ITEM, {
    name: 'addOrUpdateShoppingCartItem',
    options: {
      refetchQueries: [ 'ShoppingCart' ],
    },
  }),
)(PayButtonComponent);
