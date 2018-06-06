
import get from 'lodash/get';
import actionBeacon from './actionBeacon';

export default function asyncApiCallAction(
  apiCall = null,
  apiCallBody = {},
  startFlag = 'start',
  successFlag = 'success',
  errorFlag = 'error',
  responseName = 'data',
  reponseDataPath = 'data.payload'
) {
  if (!apiCall) {
    return new Error('no api service is provided');
  }
  return (dispatch) => {
    dispatch(actionBeacon(startFlag));
    const body = apiCallBody || {};
    return apiCall(...body)
      .then((response) => {
        const data = get(response, `${reponseDataPath || ''}`);
        dispatch(actionBeacon(successFlag, 'success', {
          name: responseName,
          value: data,
        }));
      })
      .catch(() => {
        dispatch(actionBeacon(errorFlag, 'error'));
      });
  };
}
