import { Route, Routes } from "react-router-dom";
import Home from "./Page/Home";
import About from "./Page/About";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/about" element={<About/>}/>
      </Routes>
    </div>
  );
}

export default App;


