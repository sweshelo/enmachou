import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Ranking from './components/Ranking';
import UserDetails from './components/UserDetails';

function App() {
  return (
    <div className="App">
      <header>
        <h1><a href='/'>閻魔帳</a></h1>
        <span>v0.1 - @sweshelo</span>
      </header>
      <Router>
        <Routes>
          <Route path="/" element={<Ranking />} />
          <Route path='/player/:username' element={<UserDetails />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
