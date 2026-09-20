import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, X, Check, AlertCircle, ShieldAlert, Zap, SwitchCamera, Image as ImageIcon } from 'lucide-react';
import { LabelType } from '../types';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, previewUrl: string, labelType: LabelType) => void;
  defaultLabelType?: LabelType;
  onSwitchToUpload?: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  defaultLabelType = 'front',
  onSwitchToUpload,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [capturedBlob, setCapturedBlob] = useState<{ blob: Blob; url: string } | null>(null);
  const [labelType, setLabelType] = useState<LabelType>(defaultLabelType);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isFlashOn, setIsFlashOn] = useState<boolean>(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);

  // Stop camera tracks cleanly
  const stopCameraTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.error('Error stopping track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  // Initialize camera stream
  const startCamera = useCallback(async (desiredFacingMode: 'environment' | 'user' = 'environment') => {
    stopCameraTracks();
    setErrorMessage(null);
    setErrorType(null);
    setIsInitializing(true);

    // 1. Secure context check
    if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setErrorMessage('Camera access requires a secure HTTPS connection. Please ensure the app is served via HTTPS.');
      setErrorType('SecurityError');
      setIsInitializing(false);
      return;
    }

    // 2. Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Your browser does not support live camera access. Please use the file upload option or try Chrome / Safari.');
      setErrorType('NotSupportedError');
      setIsInitializing(false);
      return;
    }

    try {
      // Check available devices for camera flipping support
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      } catch (devErr) {
        console.warn('Unable to enumerate devices:', devErr);
      }

      // 3. Request camera stream
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: desiredFacingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.muted = true;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err: unknown) {
      console.error('Camera initialization error:', err);
      const error = err as Error;
      const name = error.name || 'UnknownError';
      setErrorType(name);

      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setErrorMessage('Camera permission was blocked. Please allow camera permissions in your browser address bar and try again.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setErrorMessage('No camera device was detected on your system. Please connect a webcam or upload photo files.');
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        setErrorMessage('Camera hardware is currently in use by another application or tab. Please close other camera apps and retry.');
      } else if (name === 'OverconstrainedError') {
        // Fallback with simpler constraints
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          streamRef.current = fallbackStream;
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            await videoRef.current.play();
            setIsStreaming(true);
            setErrorMessage(null);
            setErrorType(null);
          }
        } catch (fallbackErr) {
          setErrorMessage('Camera does not satisfy resolution constraints. Please try file upload.');
        }
      } else if (name === 'SecurityError') {
        setErrorMessage('Security policy prevents camera usage in this context.');
      } else {
        setErrorMessage(error.message || 'Unable to open camera. Please check permissions or upload photos instead.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [stopCameraTracks]);

  // Start on open, stop on close or unmount
  useEffect(() => {
    if (isOpen) {
      setCapturedBlob(null);
      setLabelType(defaultLabelType);
      startCamera(facingMode);
    } else {
      stopCameraTracks();
    }

    return () => {
      stopCameraTracks();
    };
  }, [isOpen, defaultLabelType, facingMode, startCamera, stopCameraTracks]);

  // Switch facing mode
  const handleToggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Toggle flashlight / torch if supported by device
  const handleToggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const capabilities = (track.getCapabilities && track.getCapabilities()) || {};
      if ('torch' in capabilities) {
        const nextState = !isFlashOn;
        await (track as unknown as { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setIsFlashOn(nextState);
      } else {
        // Flash not supported on this track
        setIsFlashOn(!isFlashOn);
      }
    } catch (e) {
      console.warn('Torch not supported or permission denied:', e);
    }
  };

  // Capture current frame from video to canvas
  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
    }
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, width, height);

    // Convert to high-quality JPEG blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const previewUrl = URL.createObjectURL(blob);
          setCapturedBlob({ blob, url: previewUrl });
          // Stop stream during preview to save battery
          stopCameraTracks();
        }
      },
      'image/jpeg',
      0.95
    );
  };

  // Retake photo
  const handleRetake = () => {
    if (capturedBlob) {
      URL.revokeObjectURL(capturedBlob.url);
      setCapturedBlob(null);
    }
    startCamera(facingMode);
  };

  // Use captured photo and pass to parent inspection state
  const handleUsePhoto = () => {
    if (!capturedBlob) return;

    const fileName = `inspection_${labelType}_${Date.now()}.jpg`;
    const file = new File([capturedBlob.blob], fileName, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    onCapture(file, capturedBlob.url, labelType);
    stopCameraTracks();
    onClose();
  };

  // Close and cleanup
  const handleClose = () => {
    if (capturedBlob) {
      URL.revokeObjectURL(capturedBlob.url);
      setCapturedBlob(null);
    }
    stopCameraTracks();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="camera-capture-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 transition-opacity animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-modal-title"
    >
      <div
        id="camera-capture-modal-content"
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Hidden working canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90 z-10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 id="camera-modal-title" className="text-white font-semibold text-sm sm:text-base">
                {capturedBlob ? 'Review Captured Photo' : 'Live Package Label Camera'}
              </h2>
              <p className="text-slate-400 text-xs">
                {capturedBlob ? 'Ensure text is sharp and well-lit' : 'Align mandatory declarations inside target zone'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!capturedBlob && isStreaming && (
              <>
                {hasMultipleCameras && (
                  <button
                    id="btn-toggle-camera-facing"
                    type="button"
                    onClick={handleToggleCamera}
                    className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Flip camera"
                    aria-label="Switch camera"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                )}
                <button
                  id="btn-toggle-flash"
                  type="button"
                  onClick={handleToggleTorch}
                  className={`p-2 rounded-lg transition-colors ${
                    isFlashOn ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700'
                  }`}
                  title="Toggle light"
                  aria-label="Toggle flashlight"
                >
                  <Zap className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              id="btn-close-camera-modal"
              type="button"
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Close camera modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Camera Viewport / Preview Area */}
        <div className="relative flex-1 bg-black min-h-[340px] sm:min-h-[420px] flex items-center justify-center overflow-hidden">
          {/* Error State */}
          {errorMessage && (
            <div className="p-6 text-center max-w-md mx-auto z-20 space-y-4 animate-in fade-in">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-base sm:text-lg">CAMERA ACCESS BLOCKED</h3>
                <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">{errorMessage}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
                <button
                  id="btn-camera-retry"
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-medium rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                {onSwitchToUpload && (
                  <button
                    id="btn-camera-switch-upload"
                    type="button"
                    onClick={() => {
                      handleClose();
                      onSwitchToUpload();
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-xl transition-colors flex items-center justify-center space-x-2 border border-slate-700"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Upload Photo Instead</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Initializing Spinner */}
          {isInitializing && !errorMessage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 space-y-3">
              <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-300 text-xs font-medium">Requesting camera permissions & initializing feed...</p>
            </div>
          )}

          {/* Live Video Feed */}
          {!capturedBlob && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-contain max-h-[65vh] ${isStreaming ? 'block' : 'hidden'}`}
            />
          )}

          {/* Live Framing & Scanning Guides */}
          {!capturedBlob && isStreaming && !errorMessage && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
              {/* Corner Targets */}
              <div className="relative w-full max-w-sm aspect-[4/3] sm:aspect-[16/10] border-2 border-blue-400/40 rounded-xl">
                {/* 4 Corner Markers */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br" />

                {/* Animated Horizontal Scan Beam */}
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#06b6d4] animate-laser" />

                <div className="absolute bottom-2 inset-x-0 text-center">
                  <span className="bg-slate-950/75 text-cyan-300 text-[10px] sm:text-xs px-2.5 py-1 rounded-full border border-cyan-500/30">
                    Legal Metrology Label Alignment Zone
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Captured Image Review Freeze Frame */}
          {capturedBlob && (
            <div className="w-full h-full flex items-center justify-center p-2">
              <img
                src={capturedBlob.url}
                alt="Captured package label preview"
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-xl"
              />
            </div>
          )}
        </div>

        {/* Modal Controls & Label Tag Selector */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 space-y-3 z-10">
          {/* Label Type Selector Chips */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium whitespace-nowrap">Target Label:</span>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {(
                [
                  { type: 'front', label: 'Front Label' },
                  { type: 'back', label: 'Back Label' },
                  { type: 'side', label: 'Side Panel' },
                  { type: 'mrp', label: 'MRP & Batch' },
                ] as const
              ).map((item) => (
                <button
                  key={item.type}
                  id={`btn-label-select-${item.type}`}
                  type="button"
                  onClick={() => setLabelType(item.type)}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition-all text-xs whitespace-nowrap ${
                    labelType === item.type
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/50'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="flex items-center justify-between pt-1">
            {!capturedBlob ? (
              <>
                <button
                  id="btn-camera-cancel"
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-medium transition-colors"
                >
                  Cancel
                </button>

                {/* Big Shutter Button */}
                <button
                  id="btn-camera-shutter"
                  type="button"
                  onClick={handleCaptureFrame}
                  disabled={!isStreaming}
                  className="relative group p-1.5 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                  aria-label="Capture photo frame"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white flex items-center justify-center bg-white/20 group-hover:bg-white/30 transition-colors">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-inner flex items-center justify-center">
                      <Camera className="w-5 h-5 text-slate-900" />
                    </div>
                  </div>
                </button>

                {onSwitchToUpload ? (
                  <button
                    id="btn-camera-to-gallery"
                    type="button"
                    onClick={() => {
                      handleClose();
                      onSwitchToUpload();
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center space-x-1.5"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Gallery</span>
                  </button>
                ) : (
                  <div className="w-16" />
                )}
              </>
            ) : (
              /* Review actions */
              <div className="w-full flex items-center justify-between gap-3">
                <button
                  id="btn-camera-retake"
                  type="button"
                  onClick={handleRetake}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center space-x-2 border border-slate-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retake Photo</span>
                </button>

                <button
                  id="btn-camera-use-photo"
                  type="button"
                  onClick={handleUsePhoto}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30"
                >
                  <Check className="w-4 h-4" />
                  <span>Use Photo</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
