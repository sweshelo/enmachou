import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Ranking from './components/Ranking';
import UserDetails from './components/UserDetails';
import {DrawerMenu} from './components/DrawerMenu';
import Online from './components/Online';
import {About} from './components/About';

function App() {
  return (
    <div className="App">
      <header>
        <h1><a href='/'>閻魔帳</a></h1>
        <span>v0.1 - @sweshelo</span>
      </header>
      <DrawerMenu />
      <Router>
        <Routes>
          <Route path="/" element={<Ranking />} />
          <Route path='/player/:username' element={<UserDetails />} />
          <Route path='/online' element={<Online />} />
          <Route path='/about' element={<About />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
