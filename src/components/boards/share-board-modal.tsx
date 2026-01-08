'use client';

import { Board } from '@/types';
import { X, Link2, Mail, Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

interface ShareBoardModalProps {
  board: Board;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareBoardModal({ board, isOpen, onClose }: ShareBoardModalProps) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  if (!isOpen) return null;

  const boardUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/boards/${board.id}` 
    : '';

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(boardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Invitation to collaborate on "${board.title}"`);
    const body = encodeURIComponent(`Hi,

I'd like to share a board with you on our project management platform.

Board: ${board.title}
${message ? `Message: ${message}\n` : ''}
Access the board here: ${boardUrl}

Let's collaborate and get things done!

Best regards`);

    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
    
    setEmailSent(true);
    setTimeout(() => {
      setEmailSent(false);
      setEmail('');
      setMessage('');
    }, 2000);
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-lg relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-2xl font-bold text-gray-900">Share Board</h2>
          <p className="text-sm text-gray-500 mt-1">{board.title}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Copy Link Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-700">Share Link</h3>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={boardUrl}
                readOnly
                className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleCopyUrl}
                className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
            </div>
          </div>

          {/* Email Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-700">Send via Email</h3>
            </div>
            
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message (optional)"
                rows={3}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              <button
                onClick={handleSendEmail}
                disabled={!email}
                className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  emailSent
                    ? 'bg-green-100 text-green-700'
                    : email
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {emailSent ? (
                  <>
                    <Check className="w-4 h-4" />
                    Email Opened!
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Anyone with this link can view this board. The email will open your default email client with a pre-filled message.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
