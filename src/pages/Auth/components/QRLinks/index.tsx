import { Box, Button, Heading, HStack, Image, Link, Text, useBreakpointValue, VStack } from '@chakra-ui/react';
import { FC } from 'react'
import tgbotqr from '../../../../assets/tg_qrcode.png';
import wabotqr from '../../../../assets/wa_qrcode.png';
import waiCon from '../../../../assets/whatsapp_icon.svg';
import tgIcon from '../../../../assets/telegram_icon.svg';
interface QRLinksProps {

}

const QRLinks: FC<QRLinksProps> = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <VStack align={"start"} w={330} overflow={"hidden"}>
      <Heading size={"md"}>QR В ТВОЕМ ТЕЛЕФОНЕ</Heading>
      <Text>Используйте чат-боты в whatsapp и telegram, чтобы иметь доступ к сервисам QR, где бы вы не находились</Text>
      {
        !isMobile ?
          <Box>
            <HStack>
              <Image height={100} src={tgbotqr} alt="" />
              <Text>
                QR в{' '}
                <Link color='telegram.500' textDecoration={"underline dotted"} href='https://t.me/qrep1465bot' target='_blank'>
                  Telegram
                </Link>
              </Text>
            </HStack>
            <HStack>
              <Image height={100} src={wabotqr} alt="" />
              <Text>
                QR в{' '}
                <Link color='whatsapp.500' textDecoration={"underline dotted"} href='https://wa.me/77015722440' target='_blank'>
                  WhatsApp
                </Link>
              </Text>
            </HStack>
          </Box>
          :
          <HStack gap={5}>
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