/**
 * Drone Animation Functions
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
  // For the DJI FPV drone model, we need to find the propeller parts
  // Since the model doesn't have specifically named propellers, we'll search for them
  
  // These are potential propeller parts based on the model structure
  const defaultPropNames = [
    // Try to find objects that might be propellers
    // We'll look for objects at specific positions in the model
    'Object_50', 'Object_51', 'Object_52', 'Object_53',
    'Object_54', 'Object_55', 'Object_56', 'Object_57'
  ];
  
  const propNames = propellerNames || defaultPropNames;
  const propellers = [];
  
  // Get propeller meshes from the model
  propNames.forEach(name => {
    const prop = findObjectByName(droneModel, name);
    if (prop) propellers.push(prop);
  });
  
  // If no propellers found by name, try to find them by position
  if (propellers.length === 0) {
    console.log("No propellers found by name, searching by position...");
    findPropellersByPosition(droneModel, propellers);
  }
  
  console.log(`Found ${propellers.length} propellers`);
  
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
 * Helper function to find an object by name in the model hierarchy
 */
function findObjectByName(model, name) {
  let result = null;
  
  model.traverse((object) => {
    if (object.name === name) {
      result = object;
    }
  });
  
  return result;
}

/**
 * Helper function to find propellers by their position in the model
 * This is a fallback if named propellers aren't found
 */
function findPropellersByPosition(model, propellersArray) {
  // For the DJI FPV drone, propellers are likely at the extremities
  // We'll look for objects that are far from the center and have a small size
  
  const potentialPropellers = [];
  
  model.traverse((object) => {
    // Only consider meshes
    if (object.isMesh) {
      // Check if the object is at an extremity position
      const position = object.position;
      const distance = Math.sqrt(position.x * position.x + position.z * position.z);
      
      // If the object is far from center and small, it might be a propeller
      if (distance > 0.5) {
        potentialPropellers.push(object);
      }
    }
  });
  
  // Sort by distance from center (furthest first)
  potentialPropellers.sort((a, b) => {
    const distA = Math.sqrt(a.position.x * a.position.x + a.position.z * a.position.z);
    const distB = Math.sqrt(b.position.x * b.position.x + b.position.z * b.position.z);
    return distB - distA;
  });
  
  // Take the first 4 objects as propellers
  for (let i = 0; i < Math.min(4, potentialPropellers.length); i++) {
    propellersArray.push(potentialPropellers[i]);
  }
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