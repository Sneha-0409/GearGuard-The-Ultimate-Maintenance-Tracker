import React, { useState, useEffect } from 'react';
import { Wifi, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const NFCScanner: React.FC = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if ('NDEFReader' in window) {
      setIsSupported(true);
    }
  }, []);

  const handleScan = async () => {
    if (!isSupported) {
      toast.error('NFC scanning is not supported on this device or browser.');
      return;
    }

    try {
      setIsScanning(true);
      // @ts-ignore - Web NFC API is not in standard TypeScript lib yet
      const ndef = new NDEFReader();
      await ndef.scan();

      toast.loading('Ready to scan. Tap NFC tag...', { id: 'nfc-scan' });

      // @ts-ignore
      ndef.addEventListener("readingerror", () => {
        toast.error("Cannot read data from the NFC tag. Try another one.", { id: 'nfc-scan' });
        setIsScanning(false);
      });

      // @ts-ignore
      ndef.addEventListener("reading", ({ message, serialNumber }) => {
        const record = message.records[0];
        if (!record) {
          toast.error("NFC tag is empty.", { id: 'nfc-scan' });
          setIsScanning(false);
          return;
        }

        // @ts-ignore
        const textDecoder = new TextDecoder(record.encoding || 'utf-8');
        const equipmentId = textDecoder.decode(record.data).trim();

        if (equipmentId) {
          toast.success(`Scanned: ${equipmentId}`, { id: 'nfc-scan' });
          setIsScanning(false);
          navigate(`/equipment/${equipmentId}`);
        } else {
          toast.error("Invalid equipment ID on tag.", { id: 'nfc-scan' });
          setIsScanning(false);
        }
      });
    } catch (error: any) {
      console.error(error);
      setIsScanning(false);
      toast.error(`NFC Error: ${error.message}`, { id: 'nfc-scan' });
    }
  };

  const cancelScan = () => {
    setIsScanning(false);
    toast.dismiss('nfc-scan');
    // Note: The Web NFC API currently does not have a reliable abort() mechanism across all implementations.
    // The easiest way is to let the user know it's cancelled and ignore further events via state, 
    // or just let it timeout. For simplicity, we just reset the UI state.
  };

  if (!isSupported) {
    return null; // Don't show the button if the device doesn't support Web NFC
  }

  return (
    <div className="relative">
      {isScanning ? (
        <button
          onClick={cancelScan}
          className="flex items-center justify-center p-3 h-12 w-12 rounded-2xl bg-red-100 text-red-600 hover:bg-red-200 transition-all border border-red-200 shadow-sm animate-pulse"
          title="Cancel NFC Scan"
        >
          <X className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={handleScan}
          className="flex items-center justify-center p-3 h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all border border-blue-200 shadow-sm group relative"
          title="Scan NFC Tag"
        >
          <Wifi className="w-5 h-5 rotate-90 group-hover:scale-110 transition-transform" />
          
          {/* Tooltip */}
          <div className="absolute top-full mt-2 w-max left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            Tap NFC Tag
          </div>
        </button>
      )}
    </div>
  );
};

export default NFCScanner;
