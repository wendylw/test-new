import MainTopComponent from "./MainTopComponent";
import { compose } from "react-apollo";
import withOnlineStoreInfo from "../../libs/withOnlineStoreInfo";
import withConfig from "../../libs/withConfig";

export default compose(
  withConfig(props => ({
    table: props.config && props.config.table,
  })),
  withOnlineStoreInfo({
    props: ({ gqlOnlineStoreInfo/*, ownProps */ }) => {
      const loading = gqlOnlineStoreInfo.loading;
      const props = { loading };

      if (!loading) {
        Object.assign(props, {
          logo: gqlOnlineStoreInfo.onlineStoreInfo.logo,
          title: gqlOnlineStoreInfo.onlineStoreInfo.storeName,
        });
      }

      return props;
    },
  }),
)(MainTopComponent);