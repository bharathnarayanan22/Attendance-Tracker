import React from 'react'
import {FireFilled} from '@ant-design/icons'
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Space } from 'antd';

const Logo = () => {
  return (
    <div className='logo'>
       <div className="logo-icon">
        {/* <FireFilled /> */}
        
        {/* <Avatar size="large" icon={<UserOutlined />} /> */}
        <Avatar size={60} icon={<UserOutlined />} />
       

       </div>
    </div>
  )
}

export default Logo