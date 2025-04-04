import React from 'react'
import logo from '../../asserts/images/logo.png'
import './CustomNavbar.css'
const CustomNavbar = () => {
  return (
    <>
        <div className="navbar">
            <div className='logo'>
                <img src={logo} alt="logo" width='120px' height='120px'/>
            </div>
            <div className='authenticationBtns'>
                <button className='authBtns'>Sign In</button>
                <button className='authBtns'>Sign Up</button>
            </div>
            <div>

            </div>
        </div>
    </>
  )
}

export default CustomNavbar