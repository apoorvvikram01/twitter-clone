import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import LoginPage from './pages/auth/login/LoginPage';
import NotificationPage from './pages/notification/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage';

import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';
import {Toaster} from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const {data:authData,isLoading} = useQuery({
    // We use query key to give a unique name to our query and refer to it later 
    queryKey: ['authUser'],
    queryFn: async() => {
try {
  const res = await fetch ('/api/users/me')
  const data = await res.json()
  if(data.error) return null;
  if(!data.ok) throw new Error(data.error | "Something went wrong")
} catch (error) {
  throw new Error(error)
}
    },
    retry: false
  })
  if(isLoading){
    return (
      <div className='h-screen items-center justify-center flex'>
<LoadingSpinner size='lg'/>
      </div>
    )
    
  }
  return (
   
        <div className='flex max-w-6xl mx-auto'>
         { authUser && <Sidebar/>}
          <Routes>
            <Route path='/' element={authData? <HomePage /> : <Navigate to='/login'/>} />
            <Route path='/signup' element={!authData?<SignUpPage /> : <Navigate to='/'/>} /> 
            <Route path='/login' element={!authData?<LoginPage /> : <Navigate to='/'/>} />
            <Route path='/notifications' element={authData?<NotificationPage/> : <Navigate to='/login'/>} />
            <Route path='/profile/:username' element={authData?<ProfilePage/> : <Navigate to='/login'/>}  />
          </Routes>
         { authUser && <RightPanel/>}
          <Toaster/>
        </div>
      );
    }
  


export default App