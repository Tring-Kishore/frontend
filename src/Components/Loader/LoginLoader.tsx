import React from 'react'
import Lottie from 'lottie-react'
import LoginLottie from '../../asserts/lottie/login.json'
const LoginLoader = () => {
  return (
    <div>
        <div style={{position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor:'white', zIndex:1001}}>
        <Lottie 
            animationData={LoginLottie} 
            className='lottieStyle'
            style={{height:'200px',width:'200px'}}
        />
    </div>
    </div>
  )
}

export default LoginLoader