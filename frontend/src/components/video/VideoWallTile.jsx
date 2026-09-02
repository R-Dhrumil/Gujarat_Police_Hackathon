import React, { useState } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { Settings, Maximize2, X, Activity, Camera as CameraIcon } from 'lucide-react';

export const VideoWallTile = ({
  tileId,
  selectedCamera,
  availableCameras = [],
  onSelectCamera,
  onRemoveCamera
}) => {
  const [isChangingCamera, setIsChangingCamera] = useState(false);

  return (
    <div className="relative w-full h-full min-h-[220px] bg-[#090e1b] rounded-xl border border-slate-800/80 overflow-hidden flex flex-col group hover:border-blue-700/60 transition-colors shadow-lg">
      {selectedCamera ? (
        <div className="relative w-full h-full flex flex-col">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#0d1527] border-b border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className={`w-2 h-2 rounded-full ${selectedCamera.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
              <span className="font-mono font-bold text-slate-200 truncate">{selectedCamera.camera_code}</span>
              <span className="text-slate-400 truncate hidden md:inline">{selectedCamera.name}</span>
            </div>

            <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
              <button
                onClick={() => setIsChangingCamera(!isChangingCamera)}
                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                title="Change Camera"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              {onRemoveCamera && (
                <button
                  onClick={() => onRemoveCamera(tileId)}
                  className="p-1 rounded hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                  title="Remove from Wall"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Video Feed */}
          <div className="flex-1 relative w-full h-full">
            <VideoPlayer
              hlsUrl={selectedCamera.hls_url}
              cameraName={selectedCamera.name}
              cameraCode={selectedCamera.camera_code}
              departmentName={selectedCamera.department_name || 'Gujarat Police'}
              isLive={selectedCamera.status === 'Active'}
              aspectRatio="h-full w-full"
              showControls={true}
            />
          </div>

          {/* Quick Switch Dropdown Overlay */}
          {isChangingCamera && (
            <div className="absolute inset-0 z-30 bg-[#090e1b]/95 p-4 flex flex-col animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-white uppercase tracking-wider">Assign Camera to Tile #{tileId}</span>
                <button onClick={() => setIsChangingCamera(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 flex-1 overflow-y-auto space-y-1.5 pr-1">
                {availableCameras.map(cam => (
                  <button
                    key={cam.id}
                    onClick={() => {
                      onSelectCamera(tileId, cam);
                      setIsChangingCamera(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between border transition-all ${
                      selectedCamera.id === cam.id
                        ? 'bg-blue-950/80 border-blue-600 text-white'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <span className="font-mono font-bold block">{cam.camera_code}</span>
                      <span className="text-[11px] text-slate-400 block truncate">{cam.name} ({cam.district})</span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${cam.status === 'Active' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                      {cam.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty Slot State */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-3 group-hover:text-blue-400 group-hover:border-blue-600/50 transition-colors">
            <CameraIcon className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-slate-300">Tile #{tileId} Unassigned</p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-[180px]">Select a camera feed to display on this matrix tile</p>
          
          <select
            onChange={(e) => {
              const cam = availableCameras.find(c => String(c.id) === e.target.value);
              if (cam) onSelectCamera(tileId, cam);
            }}
            defaultValue=""
            className="mt-3 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="" disabled>Choose Camera Feed...</option>
            {availableCameras.map(cam => (
              <option key={cam.id} value={cam.id}>
                {cam.camera_code} - {cam.name} ({cam.district})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
