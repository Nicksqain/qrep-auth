import { lazy, Suspense, useEffect } from 'react'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Spinner } from '@chakra-ui/react';
import { useAppDispatch } from './store/hooks';
import { fetchCountry } from './slices/country.slice';

const AuthPage = lazy(() => import('./pages/Auth'));
// const PageNotFound = lazy(() => import('./pages/404/PageNotFound'));

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchCountry());
  }, [dispatch]);
  
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Suspense fallback={<Spinner size={"xl"} color="#1818cf" />}>
      <AuthPage />
    </Suspense>,
    },
    {
      path: "*", element:
        <Suspense fallback={<div>Loading...</div>}>
          <AuthPage />
        </Suspense>
    },
  ]);
  return (
    <>
      <RouterProvider router={router} fallbackElement={<Spinner />} />
    </>
  )
}

export default App
