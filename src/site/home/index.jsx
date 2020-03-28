import React from 'react';
import { useHistory } from 'react-router-dom';

const Home = () => {
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
    <div>
      <h2>home/index.jsx page</h2>
      <button onClick={gotoLocationPage}>Go to Location</button>
    </div>
  );
};

export default Home;
