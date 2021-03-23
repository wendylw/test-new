function ErrorModel(error = {}) {
  const BeepError = class extends Error {
    constructor({ status = null, message = '', code = null, extraInfo = {}, type = null }) {
      super();

      this.status = status;
      this.code = code;
      this.message = message;
      this.extraInfo = extraInfo;
      this.type = type;
    }
  };

  const error = new BeepError(error);

  return error;
}

exports.ErrorModel = ErrorModel;
