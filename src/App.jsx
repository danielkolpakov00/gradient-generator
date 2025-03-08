import VisualPanel from './components/VisualPanel';
import SettingsPanel from './components/SettingsPanel';
import OtherPanel from './components/OtherPanel';
import { useRef } from 'react';

function App() {
  const visualPanelRef = useRef(null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-7xl">
        <div className="grid h-full grid-cols-1 gap-0 lg:grid-cols-[2fr,1fr] lg:grid-rows-[2fr,1fr]">
          <div className="min-h-[150px] order-first lg:order-last border border-white bg-black relative lg:col-span-2">
            <span className="absolute top-2 left-2 text-white text-xs sm:text-sm">GRAD_DUDE</span>
            <span className="text-white text-xs sm:text-sm absolute top-2 right-2">BUILT_WITH_REACT</span>
            <OtherPanel />
          </div>
          <div className="min-h-[300px] order-2 border border-white bg-black relative lg:min-h-[400px]">
            <span className="absolute -top-5 left-2 text-white text-xs sm:text-sm">VISUAL_PANEL</span>
            <VisualPanel ref={visualPanelRef} />
          </div>
          <div className="min-h-[200px] order-3 border border-white bg-black relative lg:min-h-[400px]">
            <span className="absolute top-2 left-2 text-white text-xs sm:text-sm">SETTINGS_PANEL</span>
            <SettingsPanel visualPanelRef={visualPanelRef} />
          </div>
        </div>
        
      </div>
    </main>
  );
}

export default App;