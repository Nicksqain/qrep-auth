import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Heading, Image, HStack, Input, PinInput, PinInputField, Stack, Text, VStack, Card, ScaleFade, Tooltip, Flex, FormControl, useToast, useBreakpointValue } from '@chakra-ui/react';
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

interface AuthProps { }

// @ts-ignore
const MotionBox = motion(Box);

const ResendButton = memo(({ countdown, isButtonDisabled, handleResendCode }: { countdown: number, isButtonDisabled: boolean, handleResendCode: () => void }) => {
  const { t } = useTranslation()
  return (
    <Button colorScheme="blue" mt={4} onClick={handleResendCode} isDisabled={isButtonDisabled}>
      {`${t('resend_code')} ${isButtonDisabled ? `(${countdown})` : ''}`}
    </Button>
  );
});

const Auth: FC<AuthProps> = () => {
  const toast = useToast()
  const { t } = useTranslation()
  // Введен ли номер телефона или email
  const [phoneSubmitted, setPhoneSubmitted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [isInvalidOTP, setIsInvalidOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [isEmailLogin, setIsEmailLogin] = useState(false); // Состояние для переключения между email и телефоном
  const [email, setEmail] = useState(''); // Email
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
    if (phoneNumber) {
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
      setOtp('');
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: `Не удалось отправить код. Проверьте данные.`,
        status: 'error',
        duration: 3000,
        isClosable: true,
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
      setOtp('');
      setCountdown(60);
      toast({
        title: 'Отправлено',
        position: 'top',
        description: "Код верификации отправлен повторно",
        status: 'success',
        duration: 3000,
        isClosable: true,
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
      toast({
        title: t('authorization'),
        description: t('track_orders'),
        status: 'info',
        duration: null,
        isClosable: true,
      });
    }
  }, [location.search, dispatch, navigate]);

  useEffect(() => {
    setResponse(null);
  }, [isEmailLogin]);

  const { status, data, error } = useQuery({
    queryKey: ['verifyOTP', phoneNumber, otp],
    queryFn: () => isEmailLogin ? verifyOTP(siteURL, email, otp) : verifyOTP(siteURL, phoneNumber, otp),
    enabled: phoneSubmitted && otp.length === 6,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 2000,
    retry: false
  })

  // При успешной верификации OTP
  useEffect(() => {
    if (status === 'success') {
      if (otp.length === 6) {
        if (data.is_valid) {
        toast({
          title: 'Успех',
          description: "Добро пожаловать!",
          status: 'success',
          duration: 1000,
          isClosable: true,
        });
        if (data.auth_redirect) {
          const baseUrl = new URL(data.auth_redirect);
          const params = new URLSearchParams(baseUrl.search);
          params.append('referrer', referrer ?? '');
          baseUrl.search = params.toString();
          window.location.replace(baseUrl.toString());
          }
        }
        else {
          setIsInvalidOTP(true);
          setTimeout(() => setIsInvalidOTP(false), 200);
          setOtp('');
          pinInputRef.current?.focus();
          toast({
            title: 'Ошибка',
            description: `Неверный код верификации`,
            status: 'error',
            duration: 1000,
            isClosable: true,
          });
        }
      }
    } else if (status === 'error') {
      toast({
        title: 'Ошибка',
        description: `Ошибка при проверке OTP`,
        status: 'error',
        duration: 1000,
        isClosable: true,
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
    <ScaleFade initialScale={0.9} in>
      <Card className='auth-card' variant={"outline"} borderRadius={10}>
        <VStack className='auth-container' align="start" textAlign={"start"} gap={10}>
          <HStack justifyContent={"space-between"} w={"100%"}><Logo /><LanguageSwitcher /></HStack>
          <HStack className='auth-content-box' justifyContent={"space-between"} height={330} width="100%" spacing={8}>
            <VStack className='auth-form' align={"start"} w={350}>
              <Heading size={"lg"} mb={6}>
                {phoneSubmitted ? (mutation.data?.isRegistered ? t('login') : t('registration')) : t('login_registration')}
              </Heading>

              {!phoneSubmitted && (
                <Stack spacing={10}>
                  <Flex alignItems="start">
                    <Text>{isEmailLogin ? t('enter_email') : t('enter_phone_number')}</Text>
                    <Tooltip label={t('phone_number_info')}>
                      <Flex><InfoIcon width={25} height={25} /></Flex>
                    </Tooltip>
                  </Flex>
                  <Stack spacing={4}>
                    {isEmailLogin ? (
                      <FormControl isInvalid={!validateEmail(email)}>
                        <Input
                          size="lg"
                          ref={emailInputRef}
                          placeholder="Email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                          }}
                          type="email"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && email) {
                              handleEmailSubmit();
                            }
                          }}
                        />
                        {/* {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>} */}
                      </FormControl>
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
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && phoneNumber) {
                              handlePhoneSubmit();
                            }
                          }}
                          />
                      </>
                    )}
                    <Button isLoading={isLoading} size="lg" colorScheme="blue" onClick={isEmailLogin ? handleEmailSubmit : handlePhoneSubmit} isDisabled={isEmailLogin ? !email : !isValidPhone}>
                      {t('send_code')}
                    </Button>
                    <Button variant="link" onClick={() => setIsEmailLogin(!isEmailLogin)}>
                      {isEmailLogin ? t('login_with_phone') : t('login_with_email')}
                    </Button>
                  </Stack>
                </Stack>
              )}

              {phoneSubmitted && (
                <VStack align={"start"}>
                  <Box mb={4}>
                    <Text>{isEmailLogin ? t('enter_code_sent_email') : t('enter_code_sent', { source: mutation.data?.final_source })}</Text>
                    {/* <Text>{isEmailLogin ? email : '+7 702 596 2345'}</Text> */}
                  </Box>
                  <HStack>
                    <PinInput size={"lg"} value={otp} onChange={(value) => {
                      setIsInvalidOTP(false);
                      setOtp(value);
                    }} isInvalid={isInvalidOTP}>
                      <PinInputField ref={pinInputRef} />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                    </PinInput>
                  </HStack>

                  <ResendButton countdown={countdown} isButtonDisabled={isButtonDisabled} handleResendCode={handleResendCode} />

                  <Button variant="link" mt={4} onClick={handleResetPhone}>
                    {isEmailLogin ? t('enter_another_email') : t('enter_another_phone')}
                  </Button>
                </VStack>
              )}
            </VStack>
            {isMobile ? <QRLinks /> :
              <>
                <MotionBox
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: !phoneSubmitted ? 330 : 0 }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  overflow="hidden"
                  className="motion-box"
                >
                  <QRLinks />
                </MotionBox>
                <MotionBox
                  className={"hide-on-small"}
                  key={`image-${phoneSubmitted}`}
                  initial={{ opacity: 0, width: 0 }}
                  exit={{ opacity: 0, width: 330 }}
                  animate={{ opacity: phoneSubmitted ? 1 : 0, width: phoneSubmitted ? 330 : 0 }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  overflow="hidden"
                  // borderLeft="1px solid #e2e8f0"
                  onAnimationComplete={() => {
                    if (phoneSubmitted) {
                      myAnimation();
                    }
                  }}
                >
                  <Box style={{ position: "relative", backgroundColor: "#d3dfed", borderRadius: 10 }} height={330}>
                    <Image
                      ref={phoneImageRef}
                      zIndex={1}
                      style={{ position: "absolute", top: 0, right: 0, transform: 'translate(330px, -120px)' }}
                      src={PhoneSVG}
                      alt="Phone verification"
                      display={phoneSubmitted ? 'block' : 'none'}
                    />
                    <Image
                      ref={notificationImageRef}
                      zIndex={2}
                      transformOrigin={"bottom"}
                      style={{ position: "absolute", top: 0, right: 0, transform: 'translate(330px, -120px)' }}
                      src={NotificationSVG}
                      alt="Phone verification"
                      display={phoneSubmitted ? 'block' : 'none'}
                    />
                  </Box>
                </MotionBox>
              </>
            }
          </HStack>
        </VStack>
      </Card>
    </ScaleFade>
  );
};

export default memo(Auth);



// ! 1 version
// {!phoneSubmitted && (
//   <MotionBox
//   initial={{ opacity: 0 }}
//   animate={{ opacity: 1 }}
//   exit={{ opacity: 0 }}
//   transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
//   overflow="hidden"
//   >
//   <QRLinks />
//   </MotionBox>
// )}
// <MotionBox
//   initial={{ opacity: 0, width: 0 }}
//   animate={{ opacity: phoneSubmitted ? 1 : 0, width: phoneSubmitted ? 300 : 0 }}
//   transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
//   overflow="hidden"
//   borderLeft="1px solid #e2e8f0"
//   onAnimationComplete={myAnimation}
// >
//   <Image
//   ref={imageRef}
//   height={"100%"}
//   src="/phone.png"
//   alt="Phone verification"
//   display={phoneSubmitted ? 'block' : 'none'}
//   />
// </MotionBox>

// ! 2 version
{/* <MotionBox
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: !phoneSubmitted ? 300 : 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              overflow="hidden"
              >
              <QRLinks />
              </MotionBox>
            <MotionBox
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: phoneSubmitted ? 1 : 0, width: phoneSubmitted ? 300 : 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              overflow="hidden"
              borderLeft="1px solid #e2e8f0"
              onAnimationComplete={myAnimation}
            >
              <Image
              ref={imageRef}
              height={"100%"}
              src="/phone.png"
              alt="Phone verification"
              display={phoneSubmitted ? 'block' : 'none'}
              />
            </MotionBox> */}