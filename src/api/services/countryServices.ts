import axios, { AxiosResponse } from 'axios';
import { checkCISCountry } from '../../helpers/countries';
import { ICountryInfo } from './countryServicesModel';

export const getCurrentCountryInfo = (): Promise<ICountryInfo> =>
  axios
    .get('https://ipapi.co/json/')
    .then((response: AxiosResponse<ICountryInfo>) => response.data);

export const isCIS = async (): Promise<boolean> => {
  try {
    const response = await axios.get<ICountryInfo>('https://ipapi.co/json/');
    const countryCode = response.data.country_code;

    return checkCISCountry(countryCode);
  } catch (error) {
    console.error('Ошибка при получении данных о стране:', error);
    throw new Error('Не удалось получить информацию о стране.');
  }
};