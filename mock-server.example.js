module.exports = {
  projectId: '2755399',
  /**
   * @key '[method array][server name] {API url}'
   * server name:
   * ordering:
   * @value {apifoxResponseId?: string}
   */
  mockApis: {
    '[GET][ordering] /api/ping': {
      apifoxResponseId: 216836707,
    },
    '[DELETE][default] /api/v3/cart/items/:itemId': {},
    '[GET][default] /api/consumers/:consumerId/store/:storeId/address': {},
  },
};
