import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Tables from "./pages/Tables";
import TableView from "./pages/Tableview";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/pdf/:pdfId/tables" element={<Tables />} />
        <Route path="/table/:tableName" element={<TableView />} />
      </Routes>
    </Router>
  );
}

export default App;
