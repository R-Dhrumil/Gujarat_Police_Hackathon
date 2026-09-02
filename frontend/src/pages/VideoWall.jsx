import React, { useEffect, useState } from 'react';
import { cameraApi } from '../services/cameraApi';
import { VideoWallTile } from '../components/video/VideoWallTile';
import { Loader } from '../components/common/Loader';
import { 
  Grid3X3, 
  Grid2X2, 
  Square, 
  LayoutGrid, 
  Maximize2, 
  RefreshCw, 
  RotateCcw,
  Sparkles,
  Shield
} from 'lucide-react';

export const VideoWall = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matrixSize, setMatrixSize] = useState('2x2'); // 1x1, 2x2, 3x3, 4x4
  const [tileAssignments, setTileAssignments] = useState({});

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const res = await cameraApi.getCameras({ limit: 50 });
        setCameras(res.data);

        // Auto-assign first N cameras to matrix
        const initial = {};
        res.data.slice(0, 16).forEach((cam, idx) => {
          initial[idx + 1] = cam;
        });
        setTileAssignments(initial);
      } catch (e) {
        console.error('Video wall load error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCameras();
  }, []);

  const getTileCount = () => {
    switch (matrixSize) {
      case '1x1': return 1;
      case '2x2': return 4;
      case '3x3': return 9;
      case '4x4': return 16;
      default: return 4;
    }
  };

  const getGridClass = () => {
    switch (matrixSize) {
      case '1x1': return 'grid-cols-1';
      case '2x2': return 'grid-cols-1 md:grid-cols-2';
      case '3x3': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case '4x4': return 'grid-cols-2 md:grid-cols-4';
      default: return 'grid-cols-2';
    }
  };

  const handleSelectCameraForTile = (tileId, camera) => {
    setTileAssignments(prev => ({
      ...prev,
      [tileId]: camera
    }));
  };

  const handleRemoveCameraFromTile = (tileId) => {
    setTileAssignments(prev => {
      const copy = { ...prev };
      delete copy[tileId];
      return copy;
    });
  };

  const handleAutoAssign = () => {
    const fresh = {};
    cameras.slice(0, getTileCount()).forEach((cam, idx) => {
      fresh[idx + 1] = cam;
    });
    setTileAssignments(fresh);
  };

  if (loading) return <Loader message="Initializing Video Wall Matrix..." size="lg" />;

  const tileCount = getTileCount();
  const tileIds = Array.from({ length: tileCount }, (_, i) => i + 1);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Wall Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Central Command Video Wall Matrix
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-800">
              MODEL 2 MULTI-TILE GRID
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simultaneous multi-camera grid monitoring across Police, Municipal, Transport, and Coastal checkpoints
          </p>
        </div>

        {/* Matrix Controls */}
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setMatrixSize('1x1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                matrixSize === '1x1' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Square className="w-3.5 h-3.5" /> 1×1
            </button>
            <button
              onClick={() => setMatrixSize('2x2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                matrixSize === '2x2' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid2X2 className="w-3.5 h-3.5" /> 2×2
            </button>
            <button
              onClick={() => setMatrixSize('3x3')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                matrixSize === '3x3' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" /> 3×3
            </button>
            <button
              onClick={() => setMatrixSize('4x4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                matrixSize === '4x4' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> 4×4
            </button>
          </div>

          <button
            onClick={handleAutoAssign}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="Auto-Fill Grid with Active Strategic Cameras"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Auto-Fill
          </button>
        </div>
      </div>

      {/* Dynamic Matrix Grid Container */}
      <div className={`grid ${getGridClass()} gap-4 min-h-[640px]`}>
        {tileIds.map((tileId) => (
          <div key={tileId} className="h-full min-h-[220px]">
            <VideoWallTile
              tileId={tileId}
              selectedCamera={tileAssignments[tileId]}
              availableCameras={cameras}
              onSelectCamera={handleSelectCameraForTile}
              onRemoveCamera={handleRemoveCameraFromTile}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
