import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { QrCode, CheckCircle, XCircle, Camera, CameraOff, User, X } from 'lucide-react';
import QrScanner from 'qr-scanner';
import api from '../services/api';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [assigningMembership, setAssigningMembership] = useState(false);
  const [scanCooldown, setScanCooldown] = useState(false);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup QR scanner when component unmounts
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      console.log('Starting camera...');
      
      // Set scanning state first to show the video element
      setScanning(true);
      
      // Small delay to ensure video element is rendered
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (!videoRef.current) {
        console.error('Video element not found after delay');
        setScanning(false);
        toast.error('Video element not found. Please try again.');
        return;
      }
      
      console.log('Video element found, creating QR scanner...');

      // Try to create QR scanner instance
      try {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            console.log('QR Code detected:', result.data);
            handleQRCodeDetected(result.data);
          },
          {
            onDecodeError: (error) => {
              // Silently handle decode errors - they're normal during scanning
              // console.log('QR decode error (normal during scanning):', error);
            },
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment', // Use back camera if available
          }
        );

        // Start scanning
        await qrScannerRef.current.start();
        console.log('QR Scanner started successfully');
        toast.success('Camera started! You can see your camera feed now. Point at a QR code to scan.');
      } catch (qrError) {
        console.warn('QR Scanner failed, using basic camera access:', qrError);
        // Fallback: just show camera without QR scanning
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        videoRef.current.srcObject = stream;
        toast.info('Camera started! QR scanning may not work, but you can see the camera feed.');
      }
      setResult(null);
    } catch (error) {
      console.error('Error starting camera:', error);
      setScanning(false);
      toast.error('Unable to access camera. Please check permissions and try again.');
    }
  };

  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setScanning(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    toast.info('Camera stopped');
  };

  const handleQRCodeDetected = async (qrCodeData) => {
    if (loading || scanCooldown) return; // Prevent multiple simultaneous scans and cooldown
    
    setLoading(true);
    setScanCooldown(true);
    
    // Temporarily pause QR scanner during processing
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
    }
    
    try {
      console.log('Processing QR code:', qrCodeData);
      await validateQRCode(qrCodeData);
    } catch (error) {
      console.error('Error processing QR code:', error);
      toast.error('Error processing QR code');
    } finally {
      setLoading(false);
      
      // Set cooldown for 3 seconds to prevent rapid scanning
      setTimeout(() => {
        setScanCooldown(false);
        // Resume QR scanner after cooldown
        if (qrScannerRef.current && scanning) {
          qrScannerRef.current.start();
        }
      }, 3000);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    return canvas.toDataURL('image/jpeg');
  };

  const scanQRCode = async () => {
    if (!scanning) return;
    
    setLoading(true);
    try {
      // Manual input fallback
      const qrCode = prompt('Enter QR code manually:');
      
      if (qrCode) {
        await validateQRCode(qrCode);
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
      toast.error('Error scanning QR code');
    } finally {
      setLoading(false);
    }
  };

  const validateQRCode = async (qrCode) => {
    try {
      const response = await api.post('/api/access/validate', { qr_code: qrCode });
      const data = response.data;
      
      setResult(data);
      
      if (data.access) {
        toast.success('Access Granted!');
        // Auto-scroll to scan results section after successful scan
        setTimeout(() => {
          const scanResultsElement = document.getElementById('scan-results');
          if (scanResultsElement) {
            scanResultsElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 500); // Small delay to ensure the result section is rendered
      } else {
        // Check if the reason is no active membership
        if (data.reason === 'No active membership' && data.member) {
          setSelectedMember(data.member);
          setShowMembershipModal(true);
          toast.warning('Member has no active membership');
        } else {
          toast.error('Access Denied!');
          // Also scroll for denied access to show the reason
          setTimeout(() => {
            const scanResultsElement = document.getElementById('scan-results');
            if (scanResultsElement) {
              scanResultsElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
              });
            }
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error validating QR code:', error);
      toast.error('Error validating QR code');
      setResult({
        access: false,
        message: 'Access Denied',
        reason: 'Validation error'
      });
      // Scroll even for errors to show the error message
      setTimeout(() => {
        const scanResultsElement = document.getElementById('scan-results');
        if (scanResultsElement) {
          scanResultsElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 500);
    }
  };

  const handleManualInput = () => {
    const qrCode = prompt('Enter QR code manually:');
    if (qrCode) {
      validateQRCode(qrCode);
    }
  };

  const resetScanner = () => {
    setResult(null);
    setScanning(false);
    stopCamera();
  };

  const assignMembership = async (membershipType) => {
    if (!selectedMember) return;

    setAssigningMembership(true);
    try {
      // Calculate expiration date based on membership type
      const expirationDate = new Date();
      switch (membershipType) {
        case 'MONTHLY':
          expirationDate.setMonth(expirationDate.getMonth() + 1);
          break;
        case 'QUARTERLY':
          expirationDate.setMonth(expirationDate.getMonth() + 3);
          break;
        case 'YEARLY':
          expirationDate.setFullYear(expirationDate.getFullYear() + 1);
          break;
        default:
          expirationDate.setMonth(expirationDate.getMonth() + 1);
      }

      // Find the member by email to get their member_id
      const memberResponse = await api.get('/api/members');
      const members = memberResponse.data;
      const member = members.find(m => m.email === selectedMember.email);

      if (!member) {
        toast.error('Member not found');
        return;
      }

      // Create the membership
      await api.post('/api/memberships', {
        member_id: member.member_id,
        membership_type: membershipType,
        purchase_date: new Date().toISOString(),
        expiration_date: expirationDate.toISOString()
      });

      // Close modal and show success
      setShowMembershipModal(false);
      setSelectedMember(null);
      
      const membershipName = membershipType === 'MONTHLY' ? '1-Month' : 
                           membershipType === 'QUARTERLY' ? '3-Month' : 'Annual';
      
      toast.success(`${membershipName} Membership activated for ${selectedMember.first_name} ${selectedMember.last_name}`);
      
      // Reset the scanner for a new scan
      resetScanner();
      
    } catch (error) {
      console.error('Error assigning membership:', error);
      toast.error('Error assigning membership');
    } finally {
      setAssigningMembership(false);
    }
  };

  const closeMembershipModal = () => {
    setShowMembershipModal(false);
    setSelectedMember(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">QR Code Scanner</h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-300">
          Use your camera to scan a member's QR code or enter it manually
        </p>
      </div>

      {/* Scanner Controls */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-medium text-white">Scanner</h2>
          <div className="flex space-x-2">
            {!scanning ? (
              <button
                onClick={startCamera}
                className="btn-primary flex items-center"
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="btn-secondary flex items-center"
              >
                <CameraOff className="h-4 w-4 mr-2" />
                Stop Camera
              </button>
            )}
            <button
              onClick={handleManualInput}
              className="btn-secondary flex items-center"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Manual Input
            </button>
          </div>
        </div>

        {/* Camera View */}
        <div className="relative">
          <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden">
            {/* Video Element - Always present */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ 
                display: scanning ? 'block' : 'none',
                transform: 'scaleX(-1)' // Mirror the camera feed
              }}
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {/* Camera Feed Overlay */}
            {scanning && (
              <>
                {/* QR Code Targeting Frame */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative">
                    {/* Outer frame */}
                    <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg opacity-80"></div>
                    {/* Corner markers */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                    {/* Center QR icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <QrCode className="h-12 w-12 text-white opacity-60" />
                    </div>
                  </div>
                </div>
                
                {/* Status Bar */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing QR code...
                      </div>
                    ) : scanCooldown ? (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                        Please wait 3 seconds before next scan...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                        Point QR code at the frame above
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {/* Placeholder when not scanning */}
            {!scanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Camera Ready</p>
                  <p className="text-sm text-gray-500 mt-1">Click "Start Camera" to see your camera feed</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scan Result */}
      {result && (
        <div id="scan-results" className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-medium text-white">Scan Result</h2>
            <button
              onClick={resetScanner}
              className="btn-secondary"
            >
              New Scan
            </button>
          </div>

          <div className={`p-4 sm:p-6 rounded-lg ${
            result.access ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'
          }`}>
            <div className="flex items-center mb-4">
              {result.access ? (
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mr-3" />
              ) : (
                <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-400 mr-3" />
              )}
              <div>
                <h3 className={`text-lg sm:text-xl font-semibold ${
                  result.access ? 'text-green-300' : 'text-red-300'
                }`}>
                  {result.message}
                </h3>
                {result.reason && (
                  <p className={`text-sm ${
                    result.access ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {result.reason}
                  </p>
                )}
              </div>
            </div>

            {result.member && (
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-3">Member Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400">Name</p>
                    <p className="font-medium text-white">{result.member.first_name} {result.member.last_name}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400">Email</p>
                    <p className="font-medium text-white">{result.member.email}</p>
                  </div>
                  {result.member.phone_number && (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">Phone</p>
                      <p className="font-medium text-white">{result.member.phone_number}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {result.membership && (
              <div className="bg-gray-800/50 p-4 rounded-lg mt-4">
                <h4 className="font-medium text-white mb-3">Membership Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400">Type</p>
                    <p className="font-medium text-white">{result.membership.membership_type}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      result.membership.status === 'ACTIVE' 
                        ? 'bg-green-900/50 text-green-300 border border-green-500/30' 
                        : 'bg-red-900/50 text-red-300 border border-red-500/30'
                    }`}>
                      {result.membership.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400">Purchase Date</p>
                    <p className="font-medium text-white">
                      {new Date(result.membership.purchase_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400">Expiration Date</p>
                    <p className="font-medium text-white">
                      {new Date(result.membership.expiration_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Membership Assignment Modal */}
      {showMembershipModal && selectedMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" onClick={closeMembershipModal}></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-red-600">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-white">No Active Membership</h3>
                      <p className="text-sm text-gray-300">This member needs a membership to access the gym</p>
                    </div>
                  </div>
                  <button
                    onClick={closeMembershipModal}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Member Info */}
                <div className="bg-gray-700 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-white mb-2">Member Information</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-200">
                      <span className="font-medium">Name:</span> {selectedMember.first_name} {selectedMember.last_name}
                    </p>
                    <p className="text-sm text-gray-200">
                      <span className="font-medium">Email:</span> {selectedMember.email}
                    </p>
                  </div>
                </div>

                {/* Membership Options */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-white mb-3">Select Membership Type</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => assignMembership('MONTHLY')}
                      disabled={assigningMembership}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {assigningMembership ? 'Assigning...' : '1-Month Membership'}
                    </button>
                    <button
                      onClick={() => assignMembership('QUARTERLY')}
                      disabled={assigningMembership}
                      className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {assigningMembership ? 'Assigning...' : '3-Month Membership'}
                    </button>
                    <button
                      onClick={() => assignMembership('YEARLY')}
                      disabled={assigningMembership}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {assigningMembership ? 'Assigning...' : 'Annual Membership'}
                    </button>
                  </div>
                </div>

                {/* Cancel Button */}
                <div className="flex justify-end">
                  <button
                    onClick={closeMembershipModal}
                    disabled={assigningMembership}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
