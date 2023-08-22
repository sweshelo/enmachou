import React, {useState, useLayoutEffect} from "react"
import Drawer from "react-modern-drawer"
import "react-modern-drawer/dist/index.css"
import {useSelector} from "react-redux";
import {Link} from "react-router-dom";
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
  const { token } = useSelector((state) => state.accountReducer)
  return(
    <>
      <ul>
        <li><Link to="/">月間ランキング</Link></li>
        <li><Link to="/ranking/max">最高貢献ポイントランキング</Link></li>
        <li><Link to="/ranking/average">平均貢献ポイントランキング</Link></li>
        <li><Link to="/online">オンラインのプレイヤー</Link></li>
        <li><Link to="/stats">統計</Link></li>
        <li><Link to="/about">このアプリについて</Link></li>
      </ul>
      <div className="horizon-bar"></div>
      <ul>
        { !token
          ? (
            <>
              <li><Link to="/login">ログイン</Link></li>
            </>
          )
          : (
            <>
              {/*<li><Link to="/mypage">マイページ</Link></li>*/}
              <li><Link to="/settings">設定</Link></li>
            </>
          )
        }
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
      <aside className="view-on-pc">
        <DrawerBody />
      </aside>
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
