import { compose } from "react-apollo";
import withOnlineCategoryMergedCart from "../../libs/withOnlineCategoryMergedShoppingCart";
import FooterOperationComponent from "./FooterOperationComponent";

export default compose(
  withOnlineCategoryMergedCart,
)(FooterOperationComponent);
