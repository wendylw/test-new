/* eslint-disable no-underscore-dangle */
export default class MessagePortal {
  callbackCursor = 0;

  callbackQueues = {};

  responderMap = {};

  constructor(name, messageSender) {
    this.name = name;
    this.messageSender = messageSender;
    // if (input) {
    //   this.initializeDataInput(input);
    // }
  }

  _getCallId() {
    this.callbackCursor += 1;
    return this.callbackCursor;
  }

  _onRawMessageReceived(rawMessage) {
    if (rawMessage && rawMessage.name) {
      const queue = this.callbackQueues[rawMessage.name];
      if (queue) {
        queue.forEach(callback => {
          if (rawMessage.callId) {
            callback(rawMessage.data, rawMessage);
          } else {
            callback(rawMessage.data);
          }
        });
      }
    }
  }

  _postRawMessage(message) {
    this.messageSender(message);
  }

  _waitForResponse(name, callId) {
    return new Promise((resolve, reject) => {
      const callback = (data, rawMessage) => {
        const { callId: respondedCallId, error } = rawMessage;
        if (respondedCallId === callId) {
          this.unsubscribe(name, callback);
          if (error) {
            reject(new Error(error));
          } else {
            resolve(data);
          }
        }
      };
      this.subscribe(name, callback);
    });
    // todo: timeout
  }

  receiveRawMessage(message) {
    this._onRawMessageReceived(message);
  }

  dispatch(name, data) {
    this._postRawMessage({ name, data });
  }

  subscribe(name, callback) {
    if (!this.callbackQueues[name]) {
      // todo: use Set?
      this.callbackQueues[name] = [];
    }
    const queue = this.callbackQueues[name];
    if (queue.indexOf(callback) !== -1) {
      return;
    }
    queue.push(callback);
  }

  unsubscribe(name, callback) {
    if (!this.callbackQueues[name]) {
      return;
    }
    const queue = this.callbackQueues[name];
    const index = queue.indexOf(callback);
    if (index !== -1) {
      queue.splice(index, 1);
    }
    if (!queue.length) {
      delete this.callbackQueues[name];
    }
  }

  call(name, data) {
    const callId = `@portal-${this.name}-call-${this._getCallId()}`;
    this._postRawMessage({ name, data, callId });
    return this._waitForResponse(name, callId);
  }

  registerResponder(name, responder) {
    const callback = async (data, rawMessage) => {
      const { callId } = rawMessage;
      let response = null;
      let error = null;
      try {
        response = await responder(data);
      } catch (e) {
        error = e.message || e.toString();
      }
      this._postRawMessage({ name, data: response, callId, error });
    };
    this.responderMap[name] = callback;
    this.subscribe(name, callback);
  }

  unregisterResponder(name) {
    const callback = this.responderMap[name];
    if (callback) {
      this.unsubscribe(name, callback);
      delete this.responderMap[name];
    }
  }
}
