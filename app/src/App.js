import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";
import {useCookies} from 'react-cookie'
import Ranking from './components/Ranking';
import PlayerDetails from './components/PlayerDetails';
import {DrawerMenu} from './components/DrawerMenu';
import Online from './components/Online';
import {About} from './components/About';
import MaxPointRanking from './components/MaxPointRanking';
import Statistics from './components/Statistics';
import {useState} from 'react';
import {config} from './config';
import {Login} from './components/LoginPage';
import Matching from './components/Matching';
import {MiAuth} from './components/MiAuthPage';

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
    <Router>
      <div className="App">
        <header>
          <h1 className='ccj-font'><Link to='/'>閻魔帳</Link></h1>
          <span>v0.9.12 - @sweshelo</span>
        </header>
        <div id='container'>
          <DrawerMenu />
          <main>
            <Routes>
              <Route path="/" element={<Ranking />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/ranking/max" element={<MaxPointRanking />} />
              <Route path='/player/:playername' element={<PlayerDetails />} />
              <Route path='/matching/:timelineId' element={<Matching />} />
              <Route path='/online' element={<Online />} />
              <Route path='/about' element={<About />} />
              <Route path='/stats' element={<Statistics />} />
              <Route path='/login' element={<Login />} />
              <Route path='/miauth' element={<MiAuth />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
