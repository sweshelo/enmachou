import React, {useState, useLayoutEffect} from "react"
import Drawer from "react-modern-drawer"
import "react-modern-drawer/dist/index.css"
import "./DrawerMenu.css"

const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    const updateSize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
};

const DrawerBody = () => {
  return(
    <>
      <ul>
        <li><a href="/">月間ランキング</a></li>
        <li><a href="/ranking/max">最高貢献ポイントランキング</a></li>
        <li><a href="/online">オンラインのプレイヤー</a></li>
        <li><a href="/about">このアプリについて</a></li>
      </ul>
    </>
  )
}

export const DrawerMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState)
  }
  const [width, height] = useWindowSize();
  return width >= 959
    ? (
      <div className="view-on-pc">
        <DrawerBody />
      </div>
    )
    : (
      <div>
        <button onClick={toggleDrawer} id="drawer-toggle" />
        <Drawer
          open={isOpen}
          onClose={toggleDrawer}
          direction='left'
          className='drawer-wrapper'
        >
          <div id="drawer-body-wrapper">
            <DrawerBody />
          </div>
        </Drawer>
      </div>
    )
}
