import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {createBrowserRouter,RouterProvider,Navigate} from "react-router-dom";
import LoginPage from './pages/login-page.jsx';
import RegisterPage from './pages/register-page.jsx';
import LandingPage from './pages/landing-page.jsx';
import App from './App.jsx'
import './output.css'


const router = createBrowserRouter([
  {
    path: '/',    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
