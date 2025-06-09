import { Routes, Route } from "react-router-dom";
import Container from "react-bootstrap/Container";
import HomeScreen from "./screens/HomeScreen.jsx";
import AdminScreen from "./screens/AdminScreen.jsx";
import DoctorScreen from "./screens/DoctorScreen.jsx";
import PatientScreen from "./screens/PatientScreen.jsx";
import LoginScreen from './screens/LoginScreen.jsx'
import RegisterScreen from './screens/RegisterScreen.jsx'
import ProfileScreen from './screens/ProfileScreen.jsx'
import Footer from "./components/Footer";
import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <main className="py-3">
        <Container>
          <Routes>
            <Route path="/" element={<HomeScreen />} exact />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/admin" element={<AdminScreen />} />
            <Route path="/doctor" element={<DoctorScreen />} />
            <Route path="/patients/:id" element={<PatientScreen />} />
          </Routes>
        </Container>
      </main>
      <Footer />
    </>
  );
}

export default App;
