import logger from '../../utils/monitoring/logger';

class Poller {
  constructor(options) {
    try {
      if (typeof this.fetchData !== 'function') {
        throw new Error('apiFetch is not a function');
      }

      this.fetchData = options.fetchData;
      this.onData = options.onData;
      this.onTimeout = options.onTimeout;
      this.onError = options.onError;
      // timeout and interval are in seconds
      this.timeout = options.timeout || null;
      this.interval = options.interval || 5 * 1000;
      this.intervalTimer = null;
      this.timeOutTimer = null;
    } catch (error) {
      logger.error('Common_Utils_Poller_constructorFailed', {
        message: error?.message,
      });

      throw error;
    }
  }

  start() {
    const fetchData = async () => {
      try {
        const result = await this.fetchData.call(null);

        this.onData?.(result);
      } catch (error) {
        this.onError(error);

        logger.error('Common_Utils_Poller_fetchDataFailed', {
          message: error?.message,
        });
      }
    };

    fetchData(); // fetch data immediately

    this.intervalTimer = setInterval(fetchData, this.interval);

    if (this.timeout) {
      this.timeOutTimer = setTimeout(() => {
        this.stop();
        this.onTimeout();
      }, this.timeout);
    }
  }

  stop() {
    if (this.timeout !== null) {
      clearTimeout(this.timeOutTimer);
    }

    clearInterval(this.intervalTimer);

    this.timeOutTimer = null;
    this.intervalTimer = null;
  }
}

export default Poller;
