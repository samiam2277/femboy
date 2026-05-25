import { LifeProvider } from './stores/LifeContext';
import LifeSimulator from './components/game/LifeSimulator';

function App() {
  return (
    <LifeProvider>
      <div className="w-full h-dvh flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="w-full max-w-md h-full max-h-[900px] relative overflow-hidden">
          <LifeSimulator />
        </div>
      </div>
    </LifeProvider>
  );
}

export default App;
