class ApiFetchError extends Error {
  // Some Api errors contain extra, some contain extraInfo, so we keep them both
  constructor(message, { category, code, status, extra, extraInfo, error }) {
    super(message || '');
    this.name = category || this.name;

    this.category = category;
    this.status = status;
    this.code = code;
    this.extra = extra;
    this.extraInfo = extraInfo;
    // error is the error string returned from the api
    this.error = error;
  }
}

export default ApiFetchError;
