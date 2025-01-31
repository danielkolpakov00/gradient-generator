import VisualPanel from './components/VisualPanel';
import SettingsPanel from './components/SettingsPanel';
import OtherPanel from './components/OtherPanel';

function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black">
      <div className="h-[600px] w-[1000px] relative">
        <div className="grid h-full grid-cols-[2fr,1fr] grid-rows-[2fr,1fr] gap-[1px]">
          <div className="border border-white bg-black relative">
            <span className="absolute -top-5 left-2 text-white text-xs">VISUAL_PANEL</span>
            <VisualPanel />
          </div>
          <div className="border border-white bg-black relative">
            <span className="absolute top-2 left-2 text-white text-xs">SETTINGS_PANEL</span>
            <SettingsPanel />
          </div>
          <div className="col-span-2 border border-white bg-black relative">
            <span className="absolute top-2 left-2 text-white text-xs">GRAD_DUDE</span>
            <OtherPanel />
          </div>
        </div>
        <span className="text-white text-xs mt-2 inline-block">GRADIENT_OUTPUT</span>
        <span className="text-white text-xs absolute bottom-2 right-2">BUILT_WITH_REACT</span>
      </div>
    </main>
  );
}

export default App;