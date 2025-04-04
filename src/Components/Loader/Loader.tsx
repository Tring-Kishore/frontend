import React from 'react'
import Lottie from 'lottie-react'
import lottieLoader from '../../asserts/lottie/loading.json'
const Loader = () => {
  return (
    <>
    <div style={{display:'flex',justifyContent:'center',position:'relative',top:'235px'}}>
        <Lottie 
            animationData={lottieLoader} 
            className='lottieStyle'
            style={{height:'400px',width:'400px'}}
        />
    </div>
    </>
  )
}

export default Loader