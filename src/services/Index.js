import Axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const baseURL = 'http://localhost:2511';
const baseURL = 'http://192.168.43.196:2511';
const apiPrefix = '/api';

export const CONFIG = Axios.create({
  baseURL: `${baseURL}${apiPrefix}`,
});

CONFIG.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('eb-mums-lunch:token');
  config.headers.Authorization = `${token}`;
  config.headers['Content-Type'] = 'application/json';
  return config;
});

export const isValidResponse = (resp) => {
  return resp && resp.status === 200 && resp.data.status === 1;
}

export const methods = {
  GET: 'GET',
  GET_CONFIG: 'GET_CONFIG',
  POST: 'POST',
  POST_CONFIG: 'POST_CONFIG',
  PUT: 'PUT',
  PUT_CONFIG: 'PUT_CONFIG',
  DELETE: 'DELETE',
  DELETE_CONFIG: 'DELETE_CONFIG',
  GET_IMAGE: 'GET_IMAGE',
};

export class APIError {
  data;

  constructor(msg) {
    this.data = msg.data;
  }

  get getMessage() {
    return this.message;
  }
}

export const serviceMaker = async (url, method, data = {}, config = {}) => {
  try {
    let result;
    let APIInstance = CONFIG;

    switch (method) {
      case 'GET': {
        result = await APIInstance.get(url);
        break;
      }
      case 'GET_CONFIG': {
        result = await APIInstance.get(url, config);
        break;
      }
      case 'POST': {
        result = await APIInstance.post(url, data);
        break;
      }
      case 'POST_CONFIG': {
        result = await APIInstance.post(url, data, config);
        break;
      }
      case 'PUT': {
        result = await await APIInstance.put(url, data);
        break;
      }
      case 'PUT_CONFIG': {
        result = await await APIInstance.put(url, data, config);
        break;
      }
      case 'DELETE': {
        result = await APIInstance.delete(url, data);
        break;
      }
      case 'DELETE_CONFIG': {
        result = await APIInstance.delete(url, data, config);
        break;
      }
      case 'GET_IMAGE': {
        result = await APIInstance.get(`${baseURL}${url}`, {
          responseType: 'arraybuffer',
        });
        break;
      }
      default: {
        throw 'InvalidMethod';
      }
    }
    // if (!isValidResponse) {
    //   throw 'InvalidResponse';
    // }
    return result.data;
  } catch (err) {
    console.log(err)
    throw new APIError(
      err.response
        ? err.response
        : {
            data: {
              status: 'error',
              code: 500,
              message: 'Something went wrong',
              data: null,
            },
          },
    );
  }
};
