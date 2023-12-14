export const getPromoList = async ({ consumerId, business }) =>
  get(`/api/consumers/${consumerId}/promos`, {
    queryParams: {
      business,
    },
  });
