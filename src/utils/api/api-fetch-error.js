class ApiFetchError extends Error {
  constructor(message, { category, code, status, extra }) {
    super(message || '');

    if (category) {
      this.category = category;
    }

    if (status || status === 0) {
      this.status = status;
    }

    if (code) {
      this.code = code;
    }

    if (extra) {
      this.extra = extra;
    }
  }
}

export default ApiFetchError;
