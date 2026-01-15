import { useState } from 'react';
import { Save, X, Calendar, MapPin, Users } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { toast } from 'sonner';

interface Player {
  id: number;
  name: string;
  position: string;
  number: number;
}

const mockPlayers: Player[] = [
  { id: 1, name: 'Alex Johnson', position: 'Forward', number: 9 },
  { id: 2, name: 'Sam Martinez', position: 'Midfielder', number: 10 },
  { id: 3, name: 'Jordan Lee', position: 'Defender', number: 4 },
  { id: 4, name: 'Taylor Brown', position: 'Goalkeeper', number: 1 },
  { id: 5, name: 'Casey Wilson', position: 'Midfielder', number: 8 },
  { id: 6, name: 'Morgan Davis', position: 'Forward', number: 11 },
  { id: 7, name: 'River Thompson', position: 'Defender', number: 5 },
  { id: 8, name: 'Avery Garcia', position: 'Midfielder', number: 7 },
  { id: 9, name: 'Jamie Parker', position: 'Defender', number: 3 },
  { id: 10, name: 'Riley Chen', position: 'Defender', number: 2 },
  { id: 11, name: 'Cameron White', position: 'Midfielder', number: 6 },
];

interface PositionSlot {
  id: string;
  position: string;
  x: number;
  y: number;
}

const formationPositions: PositionSlot[] = [
  { id: 'gk-1', position: 'GK', x: 50, y: 90 },
  { id: 'lb-1', position: 'LB', x: 20, y: 70 },
  { id: 'cb-1', position: 'CB', x: 40, y: 70 },
  { id: 'cb-2', position: 'CB', x: 60, y: 70 },
  { id: 'rb-1', position: 'RB', x: 80, y: 70 },
  { id: 'lm-1', position: 'LM', x: 20, y: 45 },
  { id: 'cm-1', position: 'CM', x: 40, y: 45 },
  { id: 'cm-2', position: 'CM', x: 60, y: 45 },
  { id: 'rm-1', position: 'RM', x: 80, y: 45 },
  { id: 'st-1', position: 'ST', x: 35, y: 20 },
  { id: 'st-2', position: 'ST', x: 65, y: 20 },
];

interface LineupPlayer extends Player {
  positionSlot: string;
  isStarter: boolean;
}

interface DraggablePlayerProps {
  player: Player;
  onClick: () => void;
}

function DraggablePlayer({ player, onClick }: DraggablePlayerProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'player',
    item: player,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      onClick={onClick}
      className={`bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
          {player.number}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 truncate">{player.name}</p>
          <p className="text-xs text-gray-500">{player.position}</p>
        </div>
      </div>
    </div>
  );
}

interface PositionSlotComponentProps {
  slot: PositionSlot;
  player: LineupPlayer | null;
  onDrop: (player: Player, slotId: string) => void;
  onRemove: (slotId: string) => void;
  onClick: () => void;
}

function PositionSlotComponent({ slot, player, onDrop, onRemove, onClick }: PositionSlotComponentProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'player',
    drop: (item: Player) => {
      onDrop(item, slot.id);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
      className="absolute -translate-x-1/2 -translate-y-1/2"
    >
      {player ? (
        <div
          onClick={onClick}
          className="relative group cursor-pointer"
        >
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors">
            <span className="text-lg">{player.number}</span>
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
            <p className="text-xs text-white bg-gray-900 bg-opacity-75 px-2 py-1 rounded">
              {player.name.split(' ')[0]}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(slot.id);
            }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div
          className={`w-16 h-16 border-2 border-dashed rounded-full flex items-center justify-center text-xs transition-colors ${
            isOver
              ? 'border-blue-500 bg-blue-100 text-blue-700'
              : 'border-gray-400 bg-white bg-opacity-20 text-white'
          }`}
        >
          {slot.position}
        </div>
      )}
    </div>
  );
}

export default function MatchLineup() {
  const [lineup, setLineup] = useState<Map<string, LineupPlayer>>(new Map());
  const [substitutes, setSubstitutes] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<LineupPlayer | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const availablePlayers = mockPlayers.filter(
    player => !Array.from(lineup.values()).some(lp => lp.id === player.id) &&
              !substitutes.some(sp => sp.id === player.id)
  );

  const handleDropToField = (player: Player, slotId: string) => {
    const newLineup = new Map(lineup);
    newLineup.set(slotId, { ...player, positionSlot: slotId, isStarter: true });
    setLineup(newLineup);
    toast.success(`${player.name} added to lineup`);
  };

  const handleRemoveFromField = (slotId: string) => {
    const newLineup = new Map(lineup);
    newLineup.delete(slotId);
    setLineup(newLineup);
    toast.success('Player removed from lineup');
  };

  const handleAddSubstitute = (player: Player) => {
    setSubstitutes([...substitutes, player]);
    toast.success(`${player.name} added to substitutes`);
  };

  const handleSaveLineup = () => {
    if (lineup.size < 11) {
      toast.error('Please fill all 11 positions');
      return;
    }
    toast.success('Lineup saved successfully!');
    setShowSaveModal(false);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-gray-100 mb-2">Match & Lineup Builder</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage your match lineup</p>
        </div>
        <button
          onClick={() => setShowSaveModal(true)}
          disabled={lineup.size < 11}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          Save Lineup
        </button>
      </div>

      {/* Match Info */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-2">U-17 Premier Team vs City Rovers FC</h3>
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Saturday, Dec 21, 2024
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                City Stadium (Away)
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                10:00 AM Kickoff
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Formation</p>
            <p className="text-2xl text-gray-900 dark:text-gray-100">4-4-2</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Available Players */}
        <div className="col-span-3 space-y-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <h3 className="text-gray-900 dark:text-gray-100 mb-4">Available Players</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {availablePlayers.map(player => (
                <DraggablePlayer
                  key={player.id}
                  player={player}
                  onClick={() => handleAddSubstitute(player)}
                />
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <h3 className="text-gray-900 dark:text-gray-100 mb-4">Substitutes</h3>
            <div className="space-y-2">
              {substitutes.map(player => (
                <div key={player.id} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm">
                      {player.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{player.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{player.position}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Field View */}
        <div className="col-span-9">
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-8 relative" style={{ minHeight: '700px' }}>
            {/* Field markings */}
            <div className="absolute inset-8 border-2 border-white border-opacity-30 rounded-lg">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-white border-opacity-30 border-t-0"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-white border-opacity-30 border-b-0"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0 border-t-2 border-white border-opacity-30"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white border-opacity-30 rounded-full"></div>
            </div>

            {/* Position Slots */}
            <div className="absolute inset-8">
              {formationPositions.map((slot) => (
                <PositionSlotComponent
                  key={slot.id}
                  slot={slot}
                  player={lineup.get(slot.id) || null}
                  onDrop={handleDropToField}
                  onRemove={handleRemoveFromField}
                  onClick={() => {
                    const player = lineup.get(slot.id);
                    if (player) setSelectedPlayer(player);
                  }}
                />
              ))}
            </div>

            {/* Lineup Counter */}
            <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg px-4 py-2">
              <p className="text-sm text-gray-600">Starting XI</p>
              <p className="text-2xl text-gray-900">{lineup.size} / 11</p>
            </div>
          </div>
        </div>
      </div>

      {/* Player Mini Profile Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-900">Player Info</h2>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl">
                {selectedPlayer.number}
              </div>
              <h3 className="text-lg text-gray-900">{selectedPlayer.name}</h3>
              <p className="text-gray-600">{selectedPlayer.position}</p>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Assigned Position</p>
                <p className="text-gray-900">{selectedPlayer.positionSlot}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-gray-900">{selectedPlayer.isStarter ? 'Starter' : 'Substitute'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Recent Form</p>
                  <p className="text-lg text-blue-600">8.5/10</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Fitness</p>
                  <p className="text-lg text-green-600">95%</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedPlayer(null)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Save Lineup Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-900">Confirm Lineup</h2>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Starters</span>
                  <span className="text-sm text-gray-900">{lineup.size}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Substitutes</span>
                  <span className="text-sm text-gray-900">{substitutes.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Formation</span>
                  <span className="text-sm text-gray-900">4-4-2</span>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                This lineup will be saved for the match against City Rovers FC on Saturday, Dec 21.
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLineup}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}