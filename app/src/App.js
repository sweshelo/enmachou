import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import {useCookies} from 'react-cookie'
import Ranking from './components/Ranking';
import UserDetails from './components/UserDetails';
import {DrawerMenu} from './components/DrawerMenu';
import Online from './components/Online';
import {About} from './components/About';
import MaxPointRanking from './components/MaxPointRanking';
import Statistics from './components/Statistics';
import {useState} from 'react';
import {config} from './config';

function App() {

  const [ cookie, setCookie ] = useCookies(['tracker'])
  useState(()=>{
    if(!cookie.tracker){
      fetch(config.baseEndpoint + '/api/tracker', {method:'POST'}).then(r => r.json()).then(
        r => setCookie('tracker', r.tracker, {
          expires: new Date(Date.now() + (90 * 24 * 60 * 60 * 1000))
        })
      )
    }
  }, [])

  return (
    <div className="App">
      <header>
        <h1><a href='/'>閻魔帳</a></h1>
        <span>v0.7 - @sweshelo</span>
      </header>
      <DrawerMenu />
      <Router>
        <Routes>
          <Route path="/" element={<Ranking />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/ranking/max" element={<MaxPointRanking />} />
          <Route path='/player/:username' element={<UserDetails />} />
          <Route path='/online' element={<Online />} />
          <Route path='/about' element={<About />} />
          <Route path='/stats' element={<Statistics />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
