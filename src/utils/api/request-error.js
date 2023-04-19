class RequestError extends Error {
  constructor(message, { type, code, status, extra }) {
    super(message || '');

    this.type = type;
    this.status = status;

    if (code) {
      this.code = code;
    }

    if (extra) {
      this.extra = extra;
    }
  }
}

export default RequestError;
