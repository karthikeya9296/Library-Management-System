import React from 'react'
import Body from './Body'
import Signin from './Admin/Signin'

const Logincontrol = () => {
    const checkUserId=localStorage.getItem("userId")

    if(checkUserId){
        return <Body/>
      
    }
    return <Signin/>
}

export default Logincontrol

