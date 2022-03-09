export const fakeAuth = {
  isAuthenticated: false,
  authenticate(cb) {
    fakeAuth.isAuthenticated = true;
    setTimeout(cb, 100); // fake async
  },
  signout(cb) {
    fakeAuth.isAuthenticated = false;
    setTimeout(cb, 100);
  },
};

export const isSameAddressCoords = (thisCoords, anotherCoords) => {
  const { lat: thisLat, lng: thisLng } = thisCoords || {};
  const { lat: anotherLat, lng: anotherLng } = anotherCoords || {};

  return thisLat === anotherLat && thisLng === anotherLng;
};

export const scrollTopPosition = scrollParent => {
  const scrollBehavior = scrollParent.style.scrollBehavior;
  scrollParent.style.scrollBehavior = 'auto';
  scrollParent.scrollTo(0, 0, { behavior: 'instant' });
  scrollParent.style.scrollBehavior = scrollBehavior;
};
