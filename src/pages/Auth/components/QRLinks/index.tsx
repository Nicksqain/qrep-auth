import { Box, Button, Heading, HStack, Image, Link, Text, useBreakpointValue, VStack } from '@chakra-ui/react';
import { FC } from 'react'
import tgbotqr from '../../../../assets/tg_qrcode.png';
import wabotqr from '../../../../assets/wa_qrcode.png';
import waiCon from '../../../../assets/whatsapp_icon.svg';
import tgIcon from '../../../../assets/telegram_icon.svg';
import { useTranslation } from 'react-i18next';
interface QRLinksProps {

}

const QRLinks: FC<QRLinksProps> = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { t } = useTranslation();

  return (
    <VStack align={"start"} overflow={"hidden"} textAlign={"center"}>
      <Heading size={"md"} w={"100%"}>{t('qr_in_your_phone')}</Heading>
      <Text>{t('use_chatbots')}</Text>
      {
        !isMobile ?
          <HStack justifyContent={"center"} w={"100%"}>
            <VStack>
              <Image height={100} src={tgbotqr} alt="" />
              <Text>
                QR в{' '}
                <Link color='blue.400' textDecoration={"underline dotted"} href='https://t.me/qrep1465bot' target='_blank'>
                  Telegram
                </Link>
              </Text>
            </VStack>
            <VStack>
              <Image height={100} src={wabotqr} alt="" />
              <Text>
                QR в{' '}
                <Link color='green.500' textDecoration={"underline dotted"} href='https://wa.me/77015721064' target='_blank'>
                  WhatsApp
                </Link>
              </Text>
            </VStack>
          </HStack>
          :
          <HStack gap={5} justifyContent={"center"} w={"100%"}>
            <HStack gap={4}>
              <Image height={"3rem"} src={tgIcon} alt="" />
              <Link color='telegram.500' textDecoration={"underline dotted"} href='tg://resolve?domain=qrep1465bot' target='_blank'>
                Telegram
              </Link>
            </HStack>
            <HStack gap={4}>
              <Image height={"3rem"} src={waiCon} alt="" />
              <Link color='whatsapp.500' textDecoration={"underline dotted"} href='whatsapp://send?phone=77015721064' target='_blank'>
                WhatsApp
              </Link>
            </HStack>
          </HStack>
      }
    </VStack>
  )
}

export default QRLinks;