import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

import { Provider as ChakraProvider } from './components/ui/provider'
import { Provider as ReduxProvider } from 'react-redux';
import { setupStore } from './store/index.ts'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <ReduxProvider store={setupStore()}>
      <QueryClientProvider client={queryClient}>
      <ChakraProvider enableSystem={false} defaultTheme='light' forcedTheme='light'>
          <App />
      </ChakraProvider>
      </QueryClientProvider>
  </ReduxProvider>
)
