import { Routes, Route, } from "react-router-dom";

import MarosaLocator from "./pages/MarosaLocator";
import MobileBrochureView from "./components/layout/mobile/MobileBrochureView";

export default function App() {
    return (
        <Routes>
            <Route path='/' element={<MarosaLocator />} />
            <Route path='/brochure' element={<MobileBrochureView />} />
            <Route path='/search' element={<MarosaLocator initialSearchState={true} />} />
        </Routes>
    );
}