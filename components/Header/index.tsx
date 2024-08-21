'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, Dropdown, Button, Drawer } from 'antd';
import { DownOutlined, MenuOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react'; // Use the correct hook

import SignIn from './SignIn';
import SignOut from './SignOut';

const Header = () => {
  const { data: session, status } = useSession(); // Fetch session data and status
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const user = session?.user?.name;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const connectMenu = (
    <Menu>
      <Menu.Item key="connect">
        <div className="m-auto">
          <w3m-button balance="hide" />
        </div>
      </Menu.Item>
      <Menu.Item key="sign">{user ? <SignOut /> : <SignIn />}</Menu.Item>
    </Menu>
  );
  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const menu = (
    <Menu>
      <Menu.Item key="staking">
        <Link href="/staking">Weights Staking</Link>
      </Menu.Item>

      {/* <Menu.Item key="bidform">
        <Link href="/bidform">Bid Form</Link>
      </Menu.Item> */}

      <Menu.Item key="profile">
        <Link href="/profile">Profile</Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <header className="mx-auto w-full max-w-screen-2xl p-4 text-white sm:px-10 sm:py-6">
      <div className="flex items-center justify-between">
        {/* Left section: Logo and navigation */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Image
              alt="mor"
              fetchPriority="high"
              width="32"
              height="32"
              decoding="async"
              className="h-8 w-auto"
              style={{ color: 'transparent' }}
              src="/logo.svg"
            />
          </Link>
          {isMobile ? (
            <>
              <Dropdown overlay={menu} trigger={['click']}>
                <Button className="bg-morGreen-700" type="text" icon={<MenuOutlined />} />
              </Dropdown>
            </>
          ) : (
            <>
              <nav className="flex gap-4">
                <Link href="/staking" className="">
                  Weights Staking
                </Link>
                {/* <Link href="/bidform" className="">
                  Bid Form
                </Link> */}

                <Link href="/profile" className="">
                  Profile
                </Link>
              </nav>
            </>
          )}
        </div>

        {/* Right section: Connect buttons */}
        <div className="flex items-center gap-4">
          {isMobile ? (
            <Dropdown className="bg-morGreen-600" overlay={connectMenu} trigger={['click']}>
              <Button type="text" icon={<DownOutlined />}>
                Connect
              </Button>
            </Dropdown>
          ) : (
            <div className="flex items-center gap-4">
              <w3m-button balance="hide" />
              {user ? <SignOut /> : <SignIn />}
            </div>
          )}
        </div>
      </div>
      <div className="mt-5 h-px w-full bg-neutral-600"></div>
    </header>
  );
};

export default Header;
