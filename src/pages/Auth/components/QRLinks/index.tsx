import { Button, Heading, HStack, Image, Link, Text, VStack } from '@chakra-ui/react';
import { FC } from 'react'
import tgbotqr from '../../../../assets/tg_qrcode.png';
import wabotqr from '../../../../assets/wa_qrcode.png';
import ExternalLinkIcon from '../../../../components/icons/ExternalLinkIcon';
interface QRLinksProps {

}

const QRLinks: FC<QRLinksProps> = () => {
  return (
    <VStack align={"start"} w={330} overflow={"hidden"}>
      <Heading size={"md"}>QR В ТВОЕМ ТЕЛЕФОНЕ</Heading>
      <Text>Используйте чат-боты в whatsapp и telegram, чтобы иметь доступ к сервисам QR, где бы вы ни находились</Text>
      <HStack>
        <Image height={100} src={tgbotqr} alt="" />
        <Text>
          QR в{' '}
          <Link color='telegram.500' href='https://t.me/qrep1465bot' target='_blank'>
            Telegram
          </Link>
        </Text>
      </HStack>
      <HStack>
        <Image height={100} src={wabotqr} alt="" />
        <Text>
          QR в{' '}
          <Link color='whatsapp.500' href='https://wa.me/77015722440' target='_blank'>
            WhatsApp
          </Link>
        </Text>
      </HStack>
    </VStack>
  )
}

export default QRLinks;