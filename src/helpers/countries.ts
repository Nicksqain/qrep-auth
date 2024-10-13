export const checkCISCountry = (countryCode: string = "KZ") => {
  const cisCountries = ['KZ', 'RU', 'BY', 'UZ', 'MD', 'AM', 'KG', 'TJ'];
  return cisCountries.includes(countryCode);
};