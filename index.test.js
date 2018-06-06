import expect from 'expect';
import thunk from 'redux-thunk';
import moxios from 'moxios';
import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import asyncApiCallAction from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

// Action Types
const START = 'test api call starts';
const SUCCESS = 'test api call success';
const ERROR = 'test api call error';
const START_ACTION_TYPE = {
  type: START,
};
const ERROR_ACTION_TYPE = {
  type: ERROR,
  errorMsg: 'Not Found',
};

// Api calls
const RAW_GET_RESPONSE_DATA = {
  payload: [{
    id: 1,
  }],
};
const GET_RESPONSE_VALUE = RAW_GET_RESPONSE_DATA.payload;
const FAKE_ENDPOINT_URL = 'fake/endpoint';
function FakeApiGetCall() {
  return axios({
    method: 'get',
    url: FAKE_ENDPOINT_URL,

  });
}
function FakeApiPostCall(itemId) {
  return axios({
    method: 'post',
    url: FAKE_ENDPOINT_URL,
    body: itemId,
  });
}

function makeGetCall() {
  moxios.stubRequest(FAKE_ENDPOINT_URL, {
    status: 200,
    response: RAW_GET_RESPONSE_DATA,
  });
}

function makeGetCallError() {
  moxios.stubRequest(FAKE_ENDPOINT_URL, {
    status: 400,
    response: { payload: 'error' },
  });
}

function makePostCall(id, collection) {
  moxios.stubRequest(FAKE_ENDPOINT_URL, {
    status: 200,
    response: { payload: collection[id] },
  });
}
function makePostCallError() {
  moxios.stubRequest(FAKE_ENDPOINT_URL, {
    status: 400,
    response: { payload: 'error' },
  });
}

describe('asyncApiCallAction', () => {
  /**
   * Testing Scenarios
   * - when there is custom responseName defined
   * - when api service is missing
   * - when one or all of the action types missing
   * - when there is params
   */

  describe('have default action type names and response name', () => {
    // NOTE: currently default value in the asyncApiCallAction responseName is 'data'
    const RESPONSE_NAME = 'data';

    let store;
    beforeEach(() => {
      moxios.install();
      store = mockStore({});
    });

    afterEach(() => {
      moxios.uninstall();
    });

    it('should success', () => {
      const EXPECTED_SUCCESS = [
        {
          type: 'start',
        },
        {
          type: 'success',
          [RESPONSE_NAME]: GET_RESPONSE_VALUE,
        },
      ];

      makeGetCall();

      return store.dispatch((asyncApiCallAction(FakeApiGetCall))).then(() => {
        expect(store.getActions()).toEqual(EXPECTED_SUCCESS);
      });
    });

    it('should error', () => {
      const EXPECTED_ERROR = [
        {
          type: 'start',
        },
        {
          type: 'error',
          errorMsg: 'Not Found',
        },
      ];

      makeGetCallError();

      return store.dispatch((asyncApiCallAction(FakeApiGetCall))).then(() => {
        expect(store.getActions()).toEqual(EXPECTED_ERROR);
      });
    });
  });

  describe('has custom action types and response name', () => {
    const RESPONSE_NAME = 'myData';

    let store;
    beforeEach(() => {
      moxios.install();
      store = mockStore({});
    });

    afterEach(() => {
      moxios.uninstall();
    });

    it('should success', () => {
      const EXPECTED_SUCCESS = [
        START_ACTION_TYPE,
        {
          type: SUCCESS,
          [RESPONSE_NAME]: GET_RESPONSE_VALUE,
        },
      ];

      makeGetCall();

      return store.dispatch((asyncApiCallAction(
        FakeApiGetCall,
        null,
        START,
        SUCCESS,
        ERROR,
        RESPONSE_NAME
      ))).then(() => {
        expect(store.getActions()).toEqual(EXPECTED_SUCCESS);
      });
    });

    it('should error', () => {
      const EXPECTED_ERROR = [
        START_ACTION_TYPE,
        ERROR_ACTION_TYPE,
      ];

      makeGetCallError();

      return store.dispatch((asyncApiCallAction(
        FakeApiGetCall,
        null,
        START,
        SUCCESS,
        ERROR,
        RESPONSE_NAME
      ))).then(() => {
        expect(store.getActions()).toEqual(EXPECTED_ERROR);
      });
    });
  });

  describe('no api service', () => {
    it('should return error object', () => (
      expect(asyncApiCallAction()).toEqual(Error('no api service is provided'))
    ));
  });

  describe('has data body', () => {
    const RESPONSE_NAME = 'myData';
    const COLLECTION = {
      1: 'correct-data',
    };
    const POSTED_ID = 1;
    const RAW_POST_RESPONSE_DATA = {
      payload: 'correct-data',
    };
    const POST_RESPONSE_VALUE = RAW_POST_RESPONSE_DATA.payload;
    let store;
    beforeEach(() => {
      moxios.install();
      store = mockStore({});
    });

    afterEach(() => {
      moxios.uninstall();
    });

    it('should success', () => {
      const EXPECTED_SUCCESS = [
        START_ACTION_TYPE,
        {
          type: SUCCESS,
          [RESPONSE_NAME]: POST_RESPONSE_VALUE,
        },
      ];

      makePostCall(POSTED_ID, COLLECTION);

      return store.dispatch((asyncApiCallAction(
        FakeApiPostCall,
        { itemId: POSTED_ID },
        START,
        SUCCESS,
        ERROR,
        RESPONSE_NAME
      ))).then(() => {
        expect(store.getActions()).toEqual(EXPECTED_SUCCESS);
      });
    });

    it('should error', () => {
      const EXPECTED_ERROR = [
        START_ACTION_TYPE,
        {
          type: ERROR,
          errorMsg: 'Not Found',
        },
      ];
      makePostCallError();

      return store.dispatch((asyncApiCallAction(
        FakeApiPostCall,
        { itemId: POSTED_ID },
        START,
        SUCCESS,
        ERROR,
        RESPONSE_NAME
      ))).then(() => {
        expect(store.getActions()).toEqual(EXPECTED_ERROR);
      });
    });
  });
});