import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import theme from './theme/index.ts'
import { ChakraBaseProvider } from '@chakra-ui/react'
import { Provider as ReduxProvider } from 'react-redux';
import { setupStore } from './store/index.ts'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <ReduxProvider store={setupStore()}>
      <QueryClientProvider client={queryClient}>
        <ChakraBaseProvider theme={theme}>
          <App />
        </ChakraBaseProvider>
      </QueryClientProvider>
  </ReduxProvider>
)
