import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';
import {Button, Collapse, Layout, theme} from 'antd'
import {MenuUnfoldOutlined,MenuFoldOutlined} from '@ant-design/icons'
import Sider from 'antd/es/layout/Sider';
import Logo from './Logo';

import ToggleThemeButton from './ToggleThemeButton';
import {HomeOutlined,UsergroupAddOutlined,UserAddOutlined,PlusCircleOutlined,LogoutOutlined } from '@ant-design/icons'
import {Menu} from "antd"

const SideBar = ({ onSelectMenuItem }) => {
  const handleMenuItemClick = (menuItem) => {
    onSelectMenuItem(menuItem);
  };
  
  const handleLogout = async () => {
    try {
      window.location.href = '/home';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const {Header,Sider} = Layout;
  const [darkTheme,setDarkTheme] = useState(true);
  const [collapsed,setCollapsed] = useState(false);

  const toggleTheme = ()=>
  {
    setDarkTheme(!darkTheme);
  };
  const {
    token : {colorBgContainer}
  } = theme.useToken()

  

  return (
    <>
    <Layout className='layout'>
      <Sider collapsed={collapsed} collapsible trigger ={null}className='sidebar' theme={darkTheme ? 'dark' :'light'}>
        <br></br>
        <Logo/>
        <Menu theme={darkTheme ? 'dark' : 'light'} mode='inline' className='menu-bar'>
        <Menu.Item key="home" icon={<HomeOutlined/>} onClick={() => handleMenuItemClick('home')}>
        <Link to="/dashboard">Home</Link>
        </Menu.Item>
        <Menu.Item key="createclass" icon={<UsergroupAddOutlined />} onClick={() => handleMenuItemClick('create-class')}>
        <Link to="/dashboard">Create Class</Link>
        </Menu.Item>
        <Menu.Item key="addstudent" icon={<UserAddOutlined />} onClick={() => handleMenuItemClick('add-student')}>
        <Link to="/dashboard">Add Student</Link>
        </Menu.Item>
        <Menu.Item key="enrollstudent" icon={<PlusCircleOutlined />} onClick={() => handleMenuItemClick('enroll-students')}>
        <Link to="/dashboard">Enroll Student</Link>
        </Menu.Item>
        <Menu.Item key="logout" icon={<LogoutOutlined />} danger={true} onClick={handleLogout}>
        Logout
        </Menu.Item>
      
    </Menu>
        <ToggleThemeButton darkTheme={darkTheme} toggleTheme={toggleTheme}/>
      </Sider>
      
        <Header style={{padding:0,background:colorBgContainer}}>
          <Button type='text' icon={collapsed ?<MenuUnfoldOutlined/> :<MenuFoldOutlined/> } className='toggle' onClick={()=>setCollapsed(!collapsed)}/>
        </Header>

      
    </Layout>
    </>
  )
};


export default SideBar;