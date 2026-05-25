import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/Sidebar";
import { StepContent } from "@/components/StepContent";
import { MobileHeader } from "@/components/MobileHeader";
import { LandingPage } from "@/components/LandingPage";
import { LipSyncWorkshop } from "@/components/LipSyncWorkshop";
import { VFXWorkshop } from "@/components/VFXWorkshop";
import { useWorkshopProgress } from "@/hooks/useWorkshopProgress";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

function WorkshopPage() {
  const [steps, setSteps] = useState([]);
  const [currentStepData, setCurrentStepData] = useState(null);
  const [directorLevels, setDirectorLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const progress = useWorkshopProgress();

  // Fetch sidebar steps
  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const res = await axios.get(`${API}/steps`);
        setSteps(res.data);
      } catch (e) {
        console.error("Failed to fetch steps:", e);
      }
    };
    const fetchLevels = async () => {
      try {
        const res = await axios.get(`${API}/director-levels`);
        setDirectorLevels(res.data);
      } catch (e) {
        console.error("Failed to fetch levels:", e);
      }
    };
    fetchSteps();
    fetchLevels();
  }, []);

  // Fetch current step data
  const fetchStepData = useCallback(async (order) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/steps/${order}`);
      setCurrentStepData(res.data);
    } catch (e) {
      console.error("Failed to fetch step:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (progress.currentStep) {
      fetchStepData(progress.currentStep);
    }
  }, [progress.currentStep, fetchStepData]);

  // Get current director level
  const getCurrentLevel = () => {
    const sorted = [...directorLevels].sort((a, b) => b.min_steps - a.min_steps);
    return sorted.find(l => progress.completedCount >= l.min_steps) || directorLevels[0];
  };

  // Get next badge
  const getNextBadge = () => {
    const nextStep = steps.find(s => !progress.isStepCompleted(s.order));
    return nextStep || null;
  };

  const handleStepClick = (order) => {
    progress.goToStep(order);
    setMobileMenuOpen(false);
  };

  const handleComplete = () => {
    progress.completeStep(progress.currentStep);
  };

  const handlePrevious = () => {
    if (progress.currentStep > 1) {
      progress.goToStep(progress.currentStep - 1);
    }
  };

  const currentLevel = getCurrentLevel();
  const nextBadge = getNextBadge();

  return (
    <div className="app-shell">
      {/* Mobile header */}
      <MobileHeader
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        steps={steps}
        progress={progress}
        currentLevel={currentLevel}
        nextBadge={nextBadge}
        onStepClick={handleStepClick}
        directorLevels={directorLevels}
      />

      {/* Desktop sidebar */}
      <div className="sidebar-wrapper">
        <Sidebar
          steps={steps}
          progress={progress}
          currentLevel={currentLevel}
          nextBadge={nextBadge}
          onStepClick={handleStepClick}
          directorLevels={directorLevels}
        />
      </div>

      {/* Main content */}
      <div className="main-content">
        <StepContent
          stepData={currentStepData}
          loading={loading}
          progress={progress}
          onComplete={handleComplete}
          onPrevious={handlePrevious}
          totalSteps={8}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/workshop" element={<WorkshopPage />} />
        <Route path="/lip-sync" element={<LipSyncWorkshop />} />
        <Route path="/vfx-workspace" element={<VFXWorkshop />} />
      </Routes>
      <Toaster position="bottom-right" theme="dark" />
    </BrowserRouter>
  );
}

export default App;
