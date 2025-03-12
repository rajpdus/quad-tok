/**
 * Drone Animation Functions for Quad Tok
 * 
 * This file contains utility functions to animate a drone model in THREE.js
 */

/**
 * Sets up propeller animation for a drone model
 * @param {Object} droneModel - The THREE.js model of the drone
 * @param {Array} propellerNames - Array of propeller mesh names in the model
 * @returns {Object} Animation controls
 */
function setupPropellerAnimation(droneModel, propellerNames) {
  // Default propeller names if not provided
  const defaultPropNames = ['propeller_front_left', 'propeller_front_right', 
                           'propeller_back_left', 'propeller_back_right'];
  
  const propNames = propellerNames || defaultPropNames;
  const propellers = [];
  
  // Get propeller meshes from the model
  propNames.forEach(name => {
    const prop = droneModel.getObjectByName(name);
    if (prop) propellers.push(prop);
  });
  
  // Set initial rotation speeds (radians per frame)
  const rotationSpeeds = {
    idle: 0.1,
    slow: 0.15,
    medium: 0.25,
    fast: 0.4
  };
  
  // Current state
  let currentSpeed = rotationSpeeds.idle;
  let isAnimating = false;
  
  // Animation function
  function animatePropellers() {
    if (!isAnimating) return;
    
    propellers.forEach((prop, index) => {
      // Alternate rotation direction for adjacent propellers
      // for stability in quadcopters
      const direction = index % 2 === 0 ? 1 : -1; 
      prop.rotation.y += currentSpeed * direction;
    });
    
    requestAnimationFrame(animatePropellers);
  }
  
  // Control functions
  return {
    start: () => {
      isAnimating = true;
      animatePropellers();
    },
    
    stop: () => {
      isAnimating = false;
    },
    
    setSpeed: (speedLevel) => {
      if (rotationSpeeds[speedLevel]) {
        currentSpeed = rotationSpeeds[speedLevel];
      }
    },
    
    getSpeed: () => currentSpeed,
    
    accelerate: (factor = 1.2) => {
      currentSpeed = Math.min(currentSpeed * factor, rotationSpeeds.fast);
    },
    
    decelerate: (factor = 0.8) => {
      currentSpeed = Math.max(currentSpeed * factor, rotationSpeeds.idle);
    }
  };
}

/**
 * Creates a drone tilt animation based on movement direction
 * @param {Object} droneModel - The THREE.js model of the drone
 * @returns {Object} Tilt control functions
 */
function setupDroneTilt(droneModel) {
  // Maximum tilt angles in radians
  const maxTiltAngles = {
    forward: 0.2,    // Forward tilt
    backward: -0.1,  // Backward tilt
    left: 0.15,      // Left tilt
    right: -0.15     // Right tilt
  };
  
  // Current tilt values
  let currentTilt = {
    x: 0, // Forward/backward tilt
    z: 0  // Left/right tilt
  };
  
  // Tilt smoothing factor (0-1, higher = more responsive)
  const tiltFactor = 0.1;
  const returnFactor = 0.05; // Speed to return to level
  
  // Update the drone's rotation based on current tilt
  function updateTilt() {
    droneModel.rotation.x = currentTilt.x;
    droneModel.rotation.z = currentTilt.z;
  }
  
  // Gradually move the drone toward the target tilt
  function applyTilt(targetX, targetZ) {
    currentTilt.x += (targetX - currentTilt.x) * tiltFactor;
    currentTilt.z += (targetZ - currentTilt.z) * tiltFactor;
    updateTilt();
  }
  
  // Return the drone to level position
  function returnToLevel() {
    currentTilt.x *= (1 - returnFactor);
    currentTilt.z *= (1 - returnFactor);
    updateTilt();
  }
  
  return {
    // Tilt based on movement direction
    tiltForward: () => applyTilt(maxTiltAngles.forward, currentTilt.z),
    tiltBackward: () => applyTilt(maxTiltAngles.backward, currentTilt.z),
    tiltLeft: () => applyTilt(currentTilt.x, maxTiltAngles.left),
    tiltRight: () => applyTilt(currentTilt.x, maxTiltAngles.right),
    
    // Combined tilts
    tiltForwardLeft: () => applyTilt(maxTiltAngles.forward * 0.7, maxTiltAngles.left * 0.7),
    tiltForwardRight: () => applyTilt(maxTiltAngles.forward * 0.7, maxTiltAngles.right * 0.7),
    tiltBackwardLeft: () => applyTilt(maxTiltAngles.backward * 0.7, maxTiltAngles.left * 0.7),
    tiltBackwardRight: () => applyTilt(maxTiltAngles.backward * 0.7, maxTiltAngles.right * 0.7),
    
    // Return to level position
    stabilize: returnToLevel,
    
    // Get current tilt
    getCurrentTilt: () => ({ x: currentTilt.x, z: currentTilt.z }),
    
    // Reset tilt immediately
    resetTilt: () => {
      currentTilt.x = 0;
      currentTilt.z = 0;
      updateTilt();
    }
  };
}

/**
 * Creates a hovering effect for the drone to simulate air currents
 * @param {Object} droneModel - The THREE.js model of the drone
 * @param {Object} options - Configuration options
 * @returns {Object} Hover control functions
 */
function setupHoverEffect(droneModel, options = {}) {
  const config = {
    amplitude: options.amplitude || 0.05,  // How much the drone moves up/down
    frequency: options.frequency || 0.003,  // How fast the hovering cycle is
    lateralAmount: options.lateralAmount || 0.025  // Slight sideways movement
  };
  
  let baseY = droneModel.position.y;
  let time = 0;
  let isActive = false;
  let animationFrame;
  
  function updateHover() {
    if (!isActive) return;
    
    time += 0.016; // Approximate time for a frame at 60fps
    
    // Vertical hovering (sine wave)
    const verticalOffset = Math.sin(time * config.frequency) * config.amplitude;
    
    // Slight lateral hovering (cosine wave with different frequency)
    const lateralOffset = Math.cos(time * config.frequency * 0.7) * config.lateralAmount;
    
    droneModel.position.y = baseY + verticalOffset;
    droneModel.position.x += lateralOffset * 0.01; // Very subtle x movement
    
    animationFrame = requestAnimationFrame(updateHover);
  }
  
  return {
    start: () => {
      if (isActive) return;
      baseY = droneModel.position.y;
      isActive = true;
      updateHover();
    },
    
    stop: () => {
      isActive = false;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      // Reset to base position
      droneModel.position.y = baseY;
    },
    
    setBaseHeight: (height) => {
      baseY = height;
    },
    
    updateConfig: (newConfig) => {
      Object.assign(config, newConfig);
    }
  };
}

// Export functions
export {
  setupPropellerAnimation,
  setupDroneTilt,
  setupHoverEffect
}; 