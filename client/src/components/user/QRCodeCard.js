import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Download, Copy, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const QRCodeCard = ({ qrCode }) => {
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchQRCode();
  }, [qrCode]);

  const fetchQRCode = async () => {
    try {
      const response = await api.get('/api/user/qr-code');
      setQrCodeImage(response.data.qr_code_image);
    } catch (error) {
      console.error('Error fetching QR code:', error);
      toast.error('Error loading QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (qrCodeImage) {
      const link = document.createElement('a');
      link.href = qrCodeImage;
      link.download = 'gym-qr-code.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded!');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      toast.success('QR code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy QR code');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="card card-hover glow-red"
    >
      <div className="text-center">
        <div className="flex items-center justify-center mb-8">
          <div className="h-16 w-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <QrCode className="h-8 w-8 text-white" />
          </div>
          <h2 className="ml-4 text-3xl font-bold text-white">Your Gym <span className="gradient-text">QR Code</span></h2>
        </div>

        <motion.div 
          className="bg-white p-8 rounded-2xl border-2 border-dashed border-gray-300 mb-8 shadow-2xl"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {qrCodeImage ? (
            <img
              src={qrCodeImage}
              alt="Gym QR Code"
              className="mx-auto w-72 h-72 rounded-xl shadow-lg"
            />
          ) : (
            <div className="w-72 h-72 mx-auto bg-gray-100 rounded-xl flex items-center justify-center">
              <QrCode className="h-20 w-20 text-gray-400" />
            </div>
          )}
        </motion.div>

        <div className="mb-8">
          <p className="text-sm text-gray-300 mb-3 font-semibold">QR Code ID:</p>
          <div className="bg-gray-800 p-4 rounded-xl font-mono text-sm break-all text-gray-300 border border-gray-600">
            {qrCode}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <motion.button
            onClick={handleDownload}
            className="btn-primary flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="h-5 w-5 mr-2" />
            Download QR Code
          </motion.button>
          
          <motion.button
            onClick={handleCopy}
            className="btn-secondary flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {copied ? (
              <Check className="h-5 w-5 mr-2" />
            ) : (
              <Copy className="h-5 w-5 mr-2" />
            )}
            {copied ? 'Copied!' : 'Copy QR Code'}
          </motion.button>
        </div>

        <motion.div 
          className="p-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <div className="h-6 w-6 bg-red-500 rounded-full mr-3"></div>
            How to use your QR Code:
          </h3>
          <ul className="text-sm text-gray-300 text-left space-y-2">
            <li className="flex items-start">
              <span className="text-red-400 mr-2">•</span>
              Show this QR code to gym staff at the entrance
            </li>
            <li className="flex items-start">
              <span className="text-red-400 mr-2">•</span>
              Staff will scan it to verify your membership
            </li>
            <li className="flex items-start">
              <span className="text-red-400 mr-2">•</span>
              Keep this QR code safe and don't share it with others
            </li>
            <li className="flex items-start">
              <span className="text-red-400 mr-2">•</span>
              You can download it to your phone for easy access
            </li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default QRCodeCard;
