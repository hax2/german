import { useState, useCallback } from 'react';
import ModuleSelector from './components/ModuleSelector';
import LessonPlayer from './components/LessonPlayer';
import modulesData from './data/modules.json';
import './App.css';

function App() {
  const [activeModule, setActiveModule] = useState(null);

  const handleSelectModule = useCallback((module) => {
    setActiveModule(module);
  }, []);

  const handleBackToModules = useCallback(() => {
    setActiveModule(null);
  }, []);

  const handleNextModule = useCallback(() => {
    const currentIndex = modulesData.findIndex(m => m.id === activeModule?.id);
    if (currentIndex < modulesData.length - 1) {
      setActiveModule(modulesData[currentIndex + 1]);
    } else {
      setActiveModule(null);
    }
  }, [activeModule]);


  return (
    <div className="app-container animate-fade-in">
      <header className="app-header">
        <div className="app-logo" onClick={handleBackToModules} style={{ cursor: 'pointer' }}>
          GemLang
        </div>
      </header>
      
      <main className="main-content">
        {!activeModule ? (
          <ModuleSelector modules={modulesData} onSelect={handleSelectModule} />
        ) : (
          <LessonPlayer 
            module={activeModule} 
            onBack={handleBackToModules} 
            onNextModule={handleNextModule}
            isLast={modulesData.findIndex(m => m.id === activeModule.id) === modulesData.length - 1}
          />
        )}
      </main>
    </div>
  );
}

export default App;
