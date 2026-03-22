import React from 'react';
import { Call } from '../services/calls';

interface CallModalProps {
  call: Call;
  onClose: () => void;
  onAnswer: () => void;
  onReject: () => void;
  onEnd: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({ call, onClose, onAnswer, onReject, onEnd }) => {
  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString();
    } catch {
      return 'Unknown time';
    }
  };

  // Defensive checks for all call properties
  const callType = call?.type || 'VOICE';
  const callStatus = call?.status || 'UNKNOWN';
  const receiverName = call?.receiver?.name || 'Unknown User';
  const roomId = call?.roomId || 'Generating...';
  const startTime = call?.startTime;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {callType === 'VOICE' ? '📞 Voice Call' : '📹 Video Call'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Call Info */}
        <div className="text-center mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <div className="font-medium">{receiverName}</div>
            <div className="text-xs text-gray-500">
              {callType === 'VOICE' ? 'Voice call' : 'Video call'} • {callStatus}
            </div>
          </div>
          
          {/* Room ID for WebRTC */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 mb-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Room ID</div>
            <div className="font-mono text-sm font-medium text-gray-900 dark:text-white select-all">
              {roomId}
            </div>
          </div>
        </div>

        {/* Call Actions */}
        <div className="flex gap-3">
          {callStatus === 'RINGING' && (
            <>
              <button
                onClick={onAnswer}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition"
              >
                📞 Answer
              </button>
              <button
                onClick={onReject}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-medium transition"
              >
                🗑️ Decline
              </button>
            </>
          )}
          
          {callStatus === 'CONNECTED' && (
            <button
              onClick={onEnd}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-medium transition"
            >
              📞 End Call
            </button>
          )}
        </div>

        {/* Call Duration */}
        {startTime && (
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            Started at {formatTime(startTime)}
            {call?.endTime && ` • Ended at ${formatTime(call.endTime)}`}
          </div>
        )}
      </div>
    </div>
  );
};
