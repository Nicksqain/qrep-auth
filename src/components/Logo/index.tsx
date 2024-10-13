import { HStack, Text} from '@chakra-ui/react';
import { FC } from 'react'
import LogoIcon from '../icons/Logo';

interface LogoProps {
  
}

const Logo: FC<LogoProps> = (  ) => {
  return (
    <HStack>
     <LogoIcon width={20} height={25} />
     <Text fontFamily={"Poppins"}>QAZAQ REPUBLIC</Text>
    </HStack>
  )
}

export default Logo;