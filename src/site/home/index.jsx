import React from 'react';
import { useHistory } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { IconSearch } from '../../components/Icons';
import DeliverToBar from '../../components/DeliverToBar';
import Banner from './components/Banner';
import StoreList from './components/StoreList';

const Home = ({ t }) => {
  const history = useHistory();

  const gotoLocationPage = () => {
    history.push({
      pathname: '/ordering/location',
      state: {
        from: history.location,
      },
    });
  };

  return (
    <main className="entry fixed-wrapper">
      <Banner />
      <DeliverToBar
        title={t('DeliverTo')}
        address="10 Boulevard Damansara PJU 6A, 47400 Petaling"
        gotoLocationPage={gotoLocationPage}
      />
      <section className="entry-home wrapper">
        <div className="entry-home__search">
          <div className="form__group flex flex-middle">
            <IconSearch className="icon icon__normal icon__gray" />
            <input className="form__input" type="text" placeholder={t('SearchRestaurantPlaceholder')} />
          </div>
        </div>

        <div className="store-card-list__container padding-normal">
          <h2 className="text-size-biggest text-weight-bold">{t('NearbyRestaurants')}</h2>
          <StoreList />
        </div>
      </section>
    </main>
  );
};

export default withTranslation()(Home);
