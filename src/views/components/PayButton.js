import { compose, graphql } from "react-apollo";
import apiGql from "../../apiGql";
import withSession from "../../libs/withSession";
import withConfig from "../../libs/withConfig";
import PayButtonComponent from "./PayButtonComponent";

export default compose(
  withConfig(),
  withSession,
  graphql(apiGql.ADD_OR_UPDATE_SHOPPING_CART_ITEM, {
    name: 'addOrUpdateShoppingCartItem',
    options: {
      refetchQueries: [ 'ShoppingCart' ],
    },
  }),
)(PayButtonComponent);
