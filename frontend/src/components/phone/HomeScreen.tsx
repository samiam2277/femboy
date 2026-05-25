import RoomDesktop from '../room/RoomDesktop';
import NavBar from './NavBar';

export default function HomeScreen() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <RoomDesktop />
      </div>
      <NavBar />
    </div>
  );
}
