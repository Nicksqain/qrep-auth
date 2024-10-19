import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Heading, Image, HStack, Input, PinInput, PinInputField, Stack, Text, VStack, Card, ScaleFade, Tooltip, Flex, FormControl, useToast } from '@chakra-ui/react';
import { motion, useAnimate } from 'framer-motion';
import Logo from '../../components/Logo';
import { useMutation, useQuery } from '@tanstack/react-query';
import InfoIcon from '../../components/icons/Info';
import QRLinks from './components/QRLinks';
import PhoneSVG from '../Auth/assets/phone.svg';
import NotificationSVG from '../Auth/assets/notification.svg';
import PhoneInput from './components/PhoneInput';
import { useAppSelector } from '../../store/hooks';
import { validateEmail } from '../../helpers/validation';
import { sendOTP, verifyOTP } from '../../api/services/otpAuthServices';

interface AuthProps { }

// @ts-ignore
const MotionBox = motion(Box);

const ResendButton = memo(({ countdown, isButtonDisabled, handleResendCode }: { countdown: number, isButtonDisabled: boolean, handleResendCode: () => void }) => {
  return (
    <Button colorScheme="blue" mt={4} onClick={handleResendCode} isDisabled={isButtonDisabled}>
      {isButtonDisabled ? `Отправить снова (${countdown})` : 'Отправить код повторно'}
    </Button>
  );
});

const Auth: FC<AuthProps> = () => {
  const toast = useToast()
  // Введен ли номер телефона или email
  const [phoneSubmitted, setPhoneSubmitted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [otp, setOtp] = useState('');
  const [isEmailLogin, setIsEmailLogin] = useState(false); // Состояние для переключения между email и телефоном
  const [email, setEmail] = useState(''); // Email
  const [emailError, setEmailError] = useState(''); // Email validation error
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

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
    setIsButtonDisabled(true);
    setCountdown(30);
    resendMutation.mutate(phoneNumber);
  }, [phoneNumber]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsButtonDisabled(false);
    }
  }, [countdown]);

  const mutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const res = await sendOTP(phoneNumber);
      setResponse(res);
      return res;
    },
    onSuccess: () => {
      setPhoneSubmitted(true);
    },
    onError: (error) => {
      console.error('Ошибка при отправке сообщения:', error);
    },
  });

  const resendMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const res = await sendOTP(phoneNumber, true); // Pass the resend parameter as true
      setResponse(res);
      return res;
    },
    onSuccess: () => {
      alert('Код отправлен снова!');
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
        // Обработка успешной валидации
        setPhoneSubmitted(true);
        // mutation.mutate(email);
      }
    }
  };

  const [response, setResponse] = useState<any>(null);

  useEffect(() => {
    setResponse(null);
  }, [isEmailLogin]);

  const { status, data, error } = useQuery({
    queryKey: ['todos'],
    queryFn: () => verifyOTP(phoneNumber, otp),
    enabled: phoneSubmitted && otp.length === 6,
    refetchOnWindowFocus: false,
    retry: false
  })

  // При успешной верификации OTP
  useEffect(() => {
    if (status === 'success') {
      if (data.is_valid) {
        toast({
          title: 'Success',
          description: "OTP verification successful!",
          status: 'success',
          duration: 1000,
          isClosable: true,
        });
        if (data.auth_redirect) {
          window.location.replace(import.meta.env.VITE_APP_SITE_URL + data.auth_redirect);
        }
      } else {
        // toast('Invalid OTP. Please try again.');
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
      <Card variant={"outline"} borderRadius={10}>
        <VStack align="start" textAlign={"start"} gap={10} p={50}>
          <Logo />
          <HStack justifyContent={"space-between"} height={330} width="100%" spacing={8}>
            <Box w={350} height={"100%"}>
              <Heading size={"lg"} mb={6}>
                {phoneSubmitted ? (mutation.data?.isRegistered ? 'Вход' : 'Регистрация') : 'Вход / Регистрация'}
              </Heading>

              {!phoneSubmitted && (
                <Stack spacing={10}>
                  <Flex alignItems="start">
                    <Text>Введите ваш {isEmailLogin ? 'email' : 'номер телефона'} для отправки кода верификации</Text>
                    <Tooltip label="Подсказка">
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
                        {phoneNumber}
                      </>
                    )}
                    <Button isLoading={isLoading} size="lg" colorScheme="blue" onClick={isEmailLogin ? handleEmailSubmit : handlePhoneSubmit} isDisabled={isEmailLogin ? !email : !isValidPhone}>
                      Отправить код
                    </Button>
                    <Button variant="link" onClick={() => setIsEmailLogin(!isEmailLogin)}>
                      {isEmailLogin ? 'Войти через телефон' : 'Войти через email'}
                    </Button>
                  </Stack>
                </Stack>
              )}

              {phoneSubmitted && (
                <VStack align={"start"}>
                  <Box mb={4}>
                    <Text>Введите код, отправленный в {isEmailLogin ? 'email' : mutation.data?.final_source}</Text>
                    {/* <Text>{isEmailLogin ? email : '+7 702 596 2345'}</Text> */}
                  </Box>
                  <HStack>
                    <PinInput size={"lg"} onChange={(value) => setOtp(value)}>
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
                    Ввести другой {isEmailLogin ? 'email' : 'номер телефона'}
                  </Button>
                </VStack>
              )}
            </Box>
            <MotionBox
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: !phoneSubmitted ? 330 : 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              overflow="hidden"
              // style={{ display: !phoneSubmitted ? 'block' : 'none' }}
              // onAnimationComplete={() => {
              //   if (phoneSubmitted) {
              //     (document.querySelector('.motion-box') as HTMLElement).style.display = 'none';
              //   }
              // }}
              className="motion-box"
            >
              <QRLinks />
            </MotionBox>
            <MotionBox
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