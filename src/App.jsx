import {BrowserRouter as Router , Routes , Route} from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Mychats from "./pages/Mychats";
import Chat from "./pages/Chat";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/my-chats" element={<Mychats/>}/>
        <Route path="/new-chat" element={<Chat/>}/>
        <Route path="/chat/:sessionId" element={<Chat/>}/>
      </Routes>
    </Router>
  );
}

export default App;