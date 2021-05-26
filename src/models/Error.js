function ErrorModel(error = {}) {
  const BeepError = class extends Error {
    constructor({ status = null, message = '', code = null, key = null, extra = {}, type = null }) {
      super();

      // this.code = code;
      // this.key = key;
      this.status = status;
      this.message = message;
      this.extra = extra;
      this.type = type;
    }
  };

  const error = new BeepError(error);

  return error;
}

exports.ErrorModel = ErrorModel;
