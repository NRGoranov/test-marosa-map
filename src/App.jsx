import { Routes, Route, } from "react-router-dom";

import MarosaLocator from "./pages/MarosaLocator";

export default function App() {
    return (
        <Routes>
            <Route path='/' element={<MarosaLocator />} />
        </Routes>
    );
}