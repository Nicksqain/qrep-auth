import React, { forwardRef } from 'react';
import 'react-phone-input-2/lib/high-res.css';
import { InputProps } from '@chakra-ui/react';
import PhoneInput, { CountryData } from 'react-phone-input-2';
import theme from '../../../../theme';
import { parsePhoneNumber } from 'libphonenumber-js/max';


interface PhoneInputProps extends InputProps {
  countryCode: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidChange?: (isValid: boolean) => void;
}

const CustomPhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ countryCode, value, onChange, onValidChange, ...inputProps }, ref) => {

    const fontFamily = theme?.fonts?.body;

    const handleChange = (phone: string, data: CountryData) => {
      onChange({ target: { value: phone } } as React.ChangeEvent<HTMLInputElement>);
    };

    const validPhone = (phone: string, country: any) => {
      try {
        let phoneNumberWithoutDialCode = value.startsWith(`+${country.dialCode}`)
          ? value.slice(country.dialCode.length + 1) // Удаляем код страны из номера
          : value.slice(country.dialCode.length);
        const phoneNumber = parsePhoneNumber("+"+value, country.iso2.toUpperCase() as any)
        const isValid = phoneNumber.isValid();
        onValidChange?.(isValid);
        return isValid;
      } catch (error) {
        return false;
      }
    };

    return (
      <PhoneInput
        countryCodeEditable={false}
        preferredCountries={['kz', 'ru']}
        priority={{ kz: 0, ru: 1, }}
        isValid={(value, country: any,) => {
          return validPhone(value, country);
        }}
        country={countryCode.toLowerCase()}
        value={value}
        onChange={handleChange}
        inputProps={{
          ...inputProps,
          ref,
        }}
        inputStyle={{
          width: '100%',
          height: '48px',
          fontFamily,
          fontSize: `${theme?.fontSizes[inputProps.size as string]}`,
        }}
        inputClass="chakra-input" // Используем класс Chakra UI для инпута
        containerClass="chakra-input__group" // Используем класс Chakra UI для контейнера
      />
    );
  }
);

export default CustomPhoneInput;
