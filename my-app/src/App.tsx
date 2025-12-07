import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Tables from "./pages/Tables";
import TableView from "./pages/TableView";
import { HistoryPage } from "./pages/History";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/pdf/:pdfId/tables" element={<Tables />} />
        <Route path="/table/:tableName" element={<TableView />} />
      </Routes>
    </Router>
  );
}

export default App;
