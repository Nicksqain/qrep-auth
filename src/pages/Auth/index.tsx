import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Heading, Image, HStack, Input, Stack, Text, VStack, Flex, Field, useBreakpointValue, PinInput, Group } from '@chakra-ui/react';
import { motion, useAnimate } from 'framer-motion';
import Logo from '../../components/Logo';
import { useMutation, useQuery } from '@tanstack/react-query';
import InfoIcon from '../../components/icons/Info';
import QRLinks from './components/QRLinks';
import PhoneSVG from '../Auth/assets/phone.svg';
import NotificationSVG from '../Auth/assets/notification.svg';
import PhoneInput from './components/PhoneInput';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { validateEmail } from '../../helpers/validation';
import { sendOTP, verifyOTP } from '../../api/services/otpAuthServices';

import './styles.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { setReferrer } from '../../slices/referrer.slice';
import LanguageSwitcher from '../../shared/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../../slices/language.slice';
import { Language } from '../../constants/languages';
import { toaster } from '../../components/ui/toaster';
import { Tooltip } from '../../components/ui/tooltip';
import { FloatingInput } from '../../components/ui/floating-input';

interface AuthProps { }

// @ts-ignore
const MotionBox = motion(Box);

const ResendButton = memo(({ countdown, isButtonDisabled, handleResendCode }: { countdown: number, isButtonDisabled: boolean, handleResendCode: () => void }) => {
  const { t } = useTranslation()
  return (
    <Button variant={"outline"} w={"100%"} mt={4} onClick={handleResendCode} disabled={isButtonDisabled}>
      {`${t('resend_code')} ${isButtonDisabled ? `(${countdown})` : ''}`}
    </Button>
  );
});

const Auth: FC<AuthProps> = () => {
  const { t } = useTranslation()
  // Введен ли номер телефона или email
  const [phoneSubmitted, setPhoneSubmitted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [isInvalidOTP, setIsInvalidOTP] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isEmailLogin, setIsEmailLogin] = useState(false); // Состояние для переключения между email и телефоном
  const [email, setEmail] = useState(''); // Email
  const [isTouched, setIsTouched] = useState(false);
  const [emailError, setEmailError] = useState(''); // Email validation error
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const isMobile = useBreakpointValue({ base: true, md: false });
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { referrer } = useAppSelector(state => state.referrerSlice)

  const siteURL = referrer ? new URL(referrer).origin : '';

  // is СНГ страна
  const { countryInfo, isCIS } = useAppSelector((state) => state.countrySlice);

  useEffect(() => {
    setIsEmailLogin(!isCIS);
  }, [isCIS]);

  const handlePhoneSubmit = async () => {
    if (phoneNumber && isValidPhone) {
      // setPhoneSubmitted(true);
      mutation.mutate(phoneNumber);
    }
  };

  const handleResendCode = useCallback(() => {
    resendMutation.mutate(phoneNumber);
  }, [phoneNumber]);

  useEffect(() => {
    if (countdown > 0) {
      setIsButtonDisabled(true);
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsButtonDisabled(false);
    }
  }, [countdown]);

  const mutation = useMutation({
    mutationFn: async (contact: string) => {
      const res = await sendOTP(siteURL, contact);
      setResponse(res);
      return res;
    },
    onSuccess: () => {
      setPhoneSubmitted(true);
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
    },
    onError: (error) => {
      toaster.create({
        title: 'Ошибка',
        description: `Не удалось отправить код. Проверьте данные.`,
        type: 'error',
        duration: 3000,
      });
      console.error('Ошибка при отправке сообщения:', error);
    },
  });

  const resendMutation = useMutation({
    mutationFn: async (contact: string) => {
      const res = await sendOTP(siteURL, contact, true); // Pass the resend parameter as true
      setResponse(res);
      return res;
    },
    onSuccess: () => {
      setOtp(["", "", "", "", "", ""]);
      setCountdown(60);
      toaster.create({
        title: 'Отправлено',
        placement: 'top',
        description: "Код верификации отправлен повторно",
        type: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Ошибка при повторной отправке сообщения:', error);
    },
  });

  const handleEmailSubmit = async () => {
    if (email) {
      if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
        mutation.mutate(email);
      }
    }
  };

  const [response, setResponse] = useState<any>(null);

  // Проверка наличия параметра referrer в URL (откуда пришел пользователь)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const referrer = params.get('referrer');
    const language = params.get('lang') as Language;

    // Сохранение в Redux и localStorage
    if (language) {
      dispatch(setLanguage(language))
    }
    if (referrer) {
      dispatch(setReferrer(referrer));
    }

    // Удаление параметра из URL
    params.delete('referrer');
    navigate({ search: params.toString() }, { replace: true });

    if (referrer?.endsWith('/order')) {
      toaster.create({
        title: t('authorization'),
        description: t('track_orders'),
        type: 'info',
        duration: undefined,
      });
    }
  }, [location.search, dispatch, navigate]);

  useEffect(() => {
    setResponse(null);
  }, [isEmailLogin]);

  const { status, data, error } = useQuery({
    queryKey: ['verifyOTP', phoneNumber, otp],
    queryFn: () => isEmailLogin ? verifyOTP(siteURL, email, otp?.join('') || '') : verifyOTP(siteURL, phoneNumber, otp?.join('') || ''),
    enabled: phoneSubmitted && otp.join('')?.length === 6,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 2000,
    retry: false
  })

  // При успешной верификации OTP
  useEffect(() => {
    if (status === 'success') {
      if (otp.join('')?.length === 6) {
        if (data.is_valid) {
          toaster.create({
          title: 'Успех',
          description: "Добро пожаловать!",
            type: 'success',
            duration: 1000,
        });
        if (data.auth_redirect) {
          const baseUrl = new URL(data.auth_redirect);
          const params = new URLSearchParams(baseUrl.search);
          params.append('referrer', referrer ?? '');
          baseUrl.search = params.toString();
          window.parent.postMessage({ type: 'auth_success', redirectUrl: baseUrl.toString() }, '*');
          }
        }
        else {
          setIsInvalidOTP(true);
          setTimeout(() => setIsInvalidOTP(false), 200);
          setOtp(["", "", "", "", "", ""]);
          pinInputRef.current?.focus();
          toaster.create({
            title: 'Ошибка',
            description: `Неверный код верификации`,
            type: 'error',
            duration: 1000,
          });
        }
      }
    } else if (status === 'error') {
      toaster.create({
        title: 'Ошибка',
        description: `Ошибка при проверке OTP`,
        type: 'error',
        duration: 1000,
      })
    }
  }, [status, data, error]);

  const isLoading = mutation.status === 'pending';

  const handleResetPhone = () => {
    setPhoneNumber('');
    setPhoneSubmitted(false);
  };

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const phoneImageRef = useRef<HTMLImageElement>(null);
  const notificationImageRef = useRef<HTMLImageElement>(null);
  const [_scope, animate] = useAnimate();

  const myAnimation = async () => {
    if (phoneImageRef.current && notificationImageRef.current) {
      await animate(phoneImageRef.current, { x: 330, y: 230, rotate: -35 }, { duration: 0, ease: [0.4, 0, 0.2, 1] });
      await animate(phoneImageRef.current, { x: 0, y: 100, rotate: -15 }, { duration: 0.4, ease: [0.4, 0, 0.2, 1] });
      await animate(notificationImageRef.current, { scale: 0.3, x: 0, y: 30, rotate: -35 }, { duration: 0, ease: [0.4, 0, 0.2, 1] });
      await animate(notificationImageRef.current, { scale: 1, x: -20, y: 50, rotate: 0 }, { duration: 0.4, ease: [0.4, 0, 0.2, 1] });
    }
  };

  useEffect(() => {
    const focusField = () => {
      if (phoneSubmitted) {
        if (pinInputRef.current) {
          pinInputRef.current.focus();
        }
      } else {
        if (isEmailLogin) {
          if (emailInputRef.current) {
            emailInputRef.current.focus();
          }
        } else {
          if (phoneInputRef.current) {
            phoneInputRef.current.focus();
          }
        }
      }
    }

    // Устанавливаем фокус с задержкой, чтобы избежать проблем с синхронизацией
    const timeoutId = setTimeout(focusField, 0);

    // Очищаем таймер при размонтировании или изменении зависимостей
    return () => clearTimeout(timeoutId);
  }, [phoneSubmitted, isEmailLogin]);

  return (
    <Box>
      <Box className='auth-card' borderRadius={10}>
        <VStack className='auth-container' align="start" textAlign={"start"} gap={10}>
          <HStack className='auth-content-box' justifyContent={"space-between"} align={"start"} height={330} width="100%" gap={16}>
            <VStack className='auth-form' w={"100%"}>
              <Heading size={"lg"} textTransform={"uppercase"} textAlign={"start"} w={"100%"}>
                {phoneSubmitted ? (mutation.data?.isRegistered ? t('login') : t('registration')) : t('login_registration')}
              </Heading>

              {!phoneSubmitted && (
                <Stack gap={10} w={"100%"}>
                  <Flex justify={"space-between"} gap={2}>
                    <Text w={"350px"}>{isEmailLogin ? t('enter_email') : t('enter_phone_number')}</Text>
                    <Tooltip content={t('phone_number_info')}>
                      <Flex><InfoIcon width={25} height={25} /></Flex>
                    </Tooltip>
                  </Flex>
                  <Stack gap={4}>
                    {isEmailLogin ? (
                      <Field.Root invalid={isTouched && !validateEmail(email)}>
                        <FloatingInput
                          label='Email'
                          variant={'flushed'}
                          height={"48px"}
                          size="lg"
                          ref={emailInputRef}
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                          }}
                          onFocus={() => setIsTouched(false)}
                          type="email"
                          onBlur={() => setIsTouched(true)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && email) {
                              handleEmailSubmit();
                            }
                          }}
                        />
                        {/* {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>} */}
                      </Field.Root>
                    ) : (
                      <>
                        <PhoneInput
                          countryCode={countryInfo?.country_code ?? 'KZ'}
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          onValidChange={(isValid) => setIsValidPhone(isValid)}
                          size="lg"
                          ref={phoneInputRef}
                          placeholder="Номер телефона"
                          type="tel"
                          autoComplete='phone'
                            onFocus={() => setIsTouched(false)}
                            onBlur={() => setIsTouched(true)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && phoneNumber) {
                              handlePhoneSubmit();
                            }
                          }}
                          />
                      </>
                    )}
                    <Button variant={"outline"} w={"100%"} loading={isLoading} size="lg" colorScheme="blue" onClick={isEmailLogin ? handleEmailSubmit : handlePhoneSubmit} disabled={isEmailLogin ? !validateEmail(email) : !isValidPhone}>
                      {t('send_code')}
                    </Button>
                    <Button variant="plain" w={"100%"} onClick={() => setIsEmailLogin(!isEmailLogin)}>
                      {isEmailLogin ? t('login_with_phone') : t('login_with_email')}
                    </Button>
                  </Stack>
                </Stack>
              )}
              {/* <PinInput.Root placeholder='-' size={"lg"} otp value={otp} variant={"outline"} colorScheme='red' onValueChange={(e) => {
                console.debug('value', e);
                setIsInvalidOTP(false);
                setOtp(e.value);
              }} invalid={isInvalidOTP}>
                <PinInput.HiddenInput />
                <PinInput.Control>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <PinInput.Input key={index} index={index} value={otp[index]} />
                  ))}
                </PinInput.Control>
              </PinInput.Root> */}
              {phoneSubmitted && (
                <VStack align={"start"}>
                  <Box mb={4}>
                    <Text>{isEmailLogin ? t('enter_code_sent_email') : t('enter_code_sent', { source: mutation.data?.final_source })}</Text>
                  </Box>
                  <HStack>
                    <PinInput.Root size={{ base: "md", md: "2xl" }} placeholder='—' otp value={otp} variant={"flushed"} onValueChange={(e) => {
                      console.debug('value', e);
                      setIsInvalidOTP(false);
                      setOtp(e.value);
                    }} invalid={isInvalidOTP}>
                      <PinInput.HiddenInput />
                      <PinInput.Control>
                        <Group gap={2}>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <PinInput.Input w={"100%"} key={index} index={index} ref={index === 0 ? pinInputRef : undefined} />
                          ))}
                        </Group>
                      </PinInput.Control>
                    </PinInput.Root>
                  </HStack>

                  <ResendButton countdown={countdown} isButtonDisabled={isButtonDisabled} handleResendCode={handleResendCode} />

                  <Button variant="plain" w={"100%"} mt={4} onClick={handleResetPhone}>
                    {isEmailLogin ? t('enter_another_email') : t('enter_another_phone')}
                  </Button>
                </VStack>
              )}
            </VStack>
            {isMobile ? <QRLinks /> :
              <>
                <Box
                  w={"100%"}
                >
                  <QRLinks />
                </Box>
              </>
            }
          </HStack>
        </VStack>
      </Box >
    </Box >
  );
};

export default memo(Auth);