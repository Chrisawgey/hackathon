// src/components/AR/ARNavigation.js
import React, { useEffect, useRef, useState } from 'react';

const ARNavigation = ({ routePoints, active, onClose }) => {
  const videoRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // Start camera when component mounts
  useEffect(() => {
    if (!active) return;
    
    let stream = null;
    const startCamera = async () => {
      try {
        // Request camera permissions and get stream
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment', // Use back camera if available
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        // Set video source to camera stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraReady(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera access denied or not available");
        setUsingFallback(true);
      }
    };
    
    startCamera();
    
    // Clean up when component unmounts
    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [active]);

  // Just a minimal implementation to avoid errors
  if (!active) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: usingFallback ? '#1a1a1a' : 'black',
      zIndex: 2000,
      overflow: 'hidden'
    }}>
      {!usingFallback && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: cameraReady ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
          onCanPlay={() => setCameraReady(true)}
        />
      )}
      
      {/* Fallback background with gradient when camera not available */}
      {usingFallback && (
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #303030 100%)',
          opacity: 0.8
        }}></div>
      )}
      
      {/* Map-like grid pattern for fallback */}
      {usingFallback && (
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          opacity: 0.1
        }}></div>
      )}
      
      {/* AR overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px',
        boxSizing: 'border-box',
        pointerEvents: 'none'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: '10px 15px',
          borderRadius: '10px',
          alignSelf: 'center',
          color: 'white',
          pointerEvents: 'auto'
        }}>
          <h3 style={{ margin: 0, textAlign: 'center' }}>
            {usingFallback ? 'AR Navigation (Simulation)' : 'AR Navigation Active'}
          </h3>
        </div>
        
        {/* AR direction arrow (center) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '80px',
          textShadow: '0 0 10px rgba(0,0,0,0.8)'
        }}>
          ⬆️
        </div>
        
        {/* Distance indicator */}
        <div style={{
          position: 'absolute',
          top: '60%',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: '8px 15px',
          borderRadius: '20px',
          textAlign: 'center'
        }}>
          Next waypoint: 120m
        </div>
        
        {/* Bottom controls */}
        <div style={{
          alignSelf: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '20px',
          width: '100%',
          maxWidth: '400px',
          pointerEvents: 'auto'
        }}>
          {error && !usingFallback && (
            <div style={{
              backgroundColor: 'rgba(220,53,69,0.8)',
              color: 'white',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '15px',
              textAlign: 'center',
              width: '100%'
            }}>
              {error}
            </div>
          )}
          
          {usingFallback && (
            <div style={{
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '10px 15px',
              borderRadius: '5px',
              marginBottom: '15px',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              Camera not available. Showing simulated AR view.
            </div>
          )}
          
          <button 
            onClick={onClose}
            style={{
              padding: '15px 25px',
              backgroundColor: '#3a86ff',
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              width: '100%'
            }}
          >
            Exit AR Navigation
          </button>
        </div>
      </div>
      
      {/* Simulated AR direction markers for other waypoints */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div 
          key={i}
          style={{
            position: 'absolute',
            top: `${30 + Math.random() * 30}%`,
            left: `${20 + i * 30}%`,
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '30px',
            opacity: 0.8,
            textShadow: '0 0 10px rgba(0,0,0,0.8)'
          }}
        >
          ⬆️
          <div style={{
            fontSize: '12px',
            textAlign: 'center',
            marginTop: '5px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: '3px 8px',
            borderRadius: '10px'
          }}>
            {i + 1}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ARNavigation;