import React, { useEffect } from 'react'
import { useState } from 'react'
import NavBar from '../components/navigation-bar'; 
import GreetingCard from '../components/greeting-card';
import { useAuthStore } from '../store/useAuthStore';
import CardGridContainer from '../components/card-grid-container';


function HomePage() {
  const {authUser} = useAuthStore();
  
  return (
    <>
      <div >
        <NavBar />
        <GreetingCard  name={authUser.firstName + " " + authUser.lastName} />
        <CardGridContainer currentRole = {authUser.role} />
      </div>
 
    </>
  )
}

export default HomePage
