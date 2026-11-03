import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import MySkill from "./components/MySkill";
import SkillManager from "./components/SkillManager";
import ExploreSkills from "./components/ExploreSkills";
import Requests from "./components/Request";
import Notification from "./components/Notification";
import Chat from "./components/Chat";
import Messages from "./components/Messages";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />

      <Route path="/myskill" element={<MySkill />} />
      <Route path="/learning-goals" element={<SkillManager mode="goals" />} />
      <Route path="/explore-skills" element={<ExploreSkills />} />
      <Route path="/requests" element={<Requests />} />
      <Route path="/notifications" element={<Notification />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/chat/:requestId" element={<Chat />} />
      <Route path="/messages" element={<Messages />} />
    </Routes>
  );
}

export default App;