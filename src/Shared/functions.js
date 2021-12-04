const CryptoJS = require('crypto-js');
const CRYPTO_JS_KEY = 'ce99ad7767f981e6fd77895ca3b766b2';
const CRYPTO_JS_IV = '6a279fd5baeda3c760f639efb26777ea';

export const getEncryptedText = text => {
  const encryptedData = CryptoJS.AES.encrypt(text, CRYPTO_JS_KEY, {
    iv: CRYPTO_JS_IV,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  }).toString();
  const encrypted = encryptedData
    .replace(/["+"]/g, '%2B')
    .replace(/["/"]/g, '%2F');
  console.log(encrypted);
  return encrypted;
};

export const getDecryptedText = text => {
  try {
    if (!text) return null;
    const textToDecrypt = text.replaceAll('%2B', '+').replaceAll('%2F', '/');
    const descryptedText = CryptoJS.AES.decrypt(textToDecrypt, CRYPTO_JS_KEY, {
      iv: CRYPTO_JS_IV,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    }).toString(CryptoJS.enc.Utf8);
    return descryptedText;
  } catch (e) {
    return null;
  }
};

export const financial = x => {
  return Number.parseFloat(x).toFixed(2);
};

export const itemInformation = {
  Product: 1,
  Nutritional: 2,
  Allergen: 3,
};

export const UserType = {
  Administrator: 1,
  Restaurant: 2,
  School: 3,
  Parent: 4,
  Teacher: 5
}

export const getIpAddress = async () => {
  return "00:00:00:00"
}