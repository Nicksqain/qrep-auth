import { useTranslation } from 'react-i18next';
import { setLanguage } from '../../slices/language.slice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { IconButton, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { Language } from '../../constants/languages';

const LanguageSwitcher = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector((state) => state.languageSlice.language);

  const handleLanguageChange = (lang: Language) => {
    dispatch(setLanguage(lang));
  };

  return (
    <>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label='Language switcher'
          icon={<span>{currentLanguage === 'en' ? '🇬🇧' : currentLanguage === 'ru' ? '🇷🇺' : '🇰🇿'}</span>}
          variant='outline'
        />
        <MenuList>
          <MenuItem onClick={() => handleLanguageChange('en')}>
            {t('english')}
          </MenuItem>
          <MenuItem onClick={() => handleLanguageChange('ru')}>
            {t('russian')}
          </MenuItem>
          <MenuItem onClick={() => handleLanguageChange('kz')}>
            {t('kazakh')}
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
};

export default LanguageSwitcher;