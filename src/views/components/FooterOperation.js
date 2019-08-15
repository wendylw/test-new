import { compose, graphql } from "react-apollo";
import withOnlineCategoryMergedCart from "../../libs/withOnlineCategoryMergedShoppingCart";
import FooterOperationComponent from "./FooterOperationComponent";
import withOnlineStoreInfo from "../../libs/withOnlineStoreInfo";
import apiGql from "../../apiGql";

export default compose(
  withOnlineCategoryMergedCart,
  withOnlineStoreInfo({
    props: ({ gqlOnlineStoreInfo: { onlineStoreInfo } }) => {
      const props = { onlineStoreInfo };

      return props;
    },
  }),
  graphql(apiGql.TOGGLE_MENU, { name: 'toggleMenu' })
)(FooterOperationComponent);
