import React from 'react'
import {FireFilled} from '@ant-design/icons'
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Space } from 'antd';

const Logo = () => {
  return (
    <div className='logo1'>
       <div className="logo-icon">
        {/* <FireFilled /> */}
        
        {/* <Avatar size="large" icon={<UserOutlined />} /> */}
        {/* <Avatar size={60} icon={<UserOutlined />} /> */}
        <Avatar size={60}><img src='src/assets/logo.png'/></Avatar>

       </div>
    </div>
  )
}

export default Logo