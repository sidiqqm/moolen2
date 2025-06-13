import React, { useEffect, useRef, useState } from "react";

const CameraCapture = ({ onCapture, disabled }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      } catch (err) {
        console.error("Tidak bisa mengakses kamera:", err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Capture gambar dan kirim ke parent
  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) onCapture(blob);
    }, "image/jpeg", 0.9);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded-lg shadow-md lg:w-[640px] lg:h-[360px] w-[100%] object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      <button
        onClick={handleCapture}
        disabled={disabled}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Capture Mood
      </button>
    </div>
  );
};

export default CameraCapture;