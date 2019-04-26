import MainTopComponent from "./MainTopComponent";
import { compose } from "react-apollo";
import withOnlineStoreInfo from "../../libs/withOnlineStoreInfo";
import withConfig from "../../libs/withConfig";

export default compose(
  withConfig(props => ({
    table: props.config && props.config.table,
  })),
  withOnlineStoreInfo({
    props: ({ gqlOnlineStoreInfo: { loading, onlineStoreInfo } }) => {
      const props = { loading };

      if (!loading && onlineStoreInfo) {
        Object.assign(props, {
          logo: onlineStoreInfo.logo,
          title: onlineStoreInfo.storeName,
        });
      }

      return props;
    },
  }),
)(MainTopComponent);