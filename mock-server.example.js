const { MOCK_SERVER_PROJECTS_IDS } = require('frontend-mock-server/build/utils/constants');

module.exports = {
  /**
   * projectIdMapping:
   * beep-v1-bff: MOCK_SERVER_PROJECTS_IDS.BEEP_V1_BFF
   * backoffice-v2-bff: MOCK_SERVER_PROJECTS_IDS.BACKOFFICE_V2_BFF
   * shmanager-v1-bff: MOCK_SERVER_PROJECTS_IDS.SH_MANAGER_V1_BFF
   */
  projectId: MOCK_SERVER_PROJECTS_IDS.BEEP_V1_BFF,
  /**
   * @key '[method array][server name] {API url}'
   * [server name] mapping (Check api url prefix of `本地 Mock` in Apifox, compare with under prefix)
   * default - http://127.0.0.1:4523/m1/2755399-0-default
   * ordering - http://127.0.0.1:4523/m1/2755399-0-0a18a6d8
   * home - http://127.0.0.1:4523/m1/2755399-0-fff498c8
   * home - http://127.0.0.1:4523/m1/2755399-0-36d50f9b
   * pos - http://127.0.0.1:4523/m1/2755399-0-53c847ce
   * @value {apifoxResponseId?: string}
   */
  mockApis: {
    '[GET][ordering] /api/ping': {},
    '[DELETE][default] /api/v3/cart/items/:itemId': {},
    '[GET][default] /api/consumers/:consumerId/store/:storeId/address': {},
  },
};
