const actionBeacon = (typeName, type, data = {
  name: '',
  value: null,
}) => {
  const {
    name,
    value,
  } = data;

  switch (type) {
    case 'error':
      return {
        type: typeName,
        errorMsg: 'error message here',
      };
    case 'success':
      return {
        type: typeName,
        [name]: value,
      };
    default:
      break;
  }
  return {
    type: typeName,
  };
};

export default actionBeacon;