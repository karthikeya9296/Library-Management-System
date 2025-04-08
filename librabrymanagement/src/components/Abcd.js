import React from 'react'
import { Link } from 'react-router-dom'

const Abcd = () => {
  return (
    
    <div class="form-container">
    <p class="title">Modal</p>
    <form class="form">
      <div class="input-group">
        <label >Full Name</label>
        <input placeholder="" type="text" class="input" id="firstname"/>
      </div>
      <div class="input-group">
        <label >Email</label>
        <input placeholder="" type="email" class="input" id="email"/>  
      </div>
      <div class="input-group">
        <label >Mobile</label>
        <input placeholder="" type="tel" class="input" id="mobile"/>  
      </div>
      <div class="input-group">
        <label >Address</label>
        <input placeholder="" type="text" class="input" id="address"/>  
      </div>
      
      <Link class="sign" >Submit</Link>
    </form>

  </div>
  )
}

export default Abcd
