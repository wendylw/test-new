import React, { PureComponent } from 'react';
import { withTranslation, Trans } from 'react-i18next';

class Banner extends PureComponent {
  render() {
    return (
      <div className="entry-home__banner padding-left-right-normal absolute-wrapper">
        <h2 className="entry-home__banner-title text-size-huge text-weight-bold">
          <Trans i18nKey="DiscoverDescription">
            Discover new
            <br />
            restaurants around you
          </Trans>
        </h2>
      </div>
    );
  }
}

export default withTranslation()(Banner);
