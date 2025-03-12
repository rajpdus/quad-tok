# Drone Implementation for "Quad Tok" (formerly "Fly By")

## Overview
This document outlines the plan to replace the bird character with a drone in the game. The changes include modifying the 3D model, animations, UI elements, and game mechanics to accurately represent drone-like flight characteristics.

## 1. Assets Creation/Collection

### 1.1 3D Drone Model
- **Option 1**: Find a CC-licensed 3D drone model (GLTF/GLB format) from sources like:
  - Sketchfab
  - TurboSquid
  - CGTrader
  - Free3D
- **Option 2**: Create a simple drone model using Blender:
  - Basic quadcopter design with propellers
  - Low-poly design to maintain performance
  - Animated propellers for realistic flight
- **Requirements**:
  - Model in GLTF format compatible with THREE.js
  - Properly rigged for animation
  - Dimensions comparable to the current bird model
  - Optimized for web performance (low poly count)

### 1.2 SVG Icons
Create or modify the following SVG icons:
- Replace "Bird's Eye View" icon (`assets/icons/eye.svg`) with a drone perspective icon
- Create additional UI elements if needed for drone-specific controls

### 1.3 Sound Effects
- Collect or create drone propeller/motor sounds to replace bird sounds:
  - Idle hovering sound
  - Acceleration sound
  - Deceleration sound

## 2. Code Modifications

### 2.1 Model Loading
Modify the `setCharacter()` function in `index.js`:
```javascript
const setCharacter = async () => {
  // Load drone model instead of bird
  const model = await gltfLoader.loadAsync('assets/drone/scene.gltf');
  // Update geometry reference to match drone model's mesh name
  const geo = model.scene.getObjectByName('Drone_Body_0').geometry.clone();
  character = model.scene;

  // Adjust position and scale for drone
  character.position.set(0, 25, 0);
  character.scale.set(1.3, 1.3, 1.3);
  
  // Setup drone-specific animations
  setupDroneAnimations(model);
  
  // Add propeller rotation animation
  setupPropellerAnimation();
  
  geo.computeBoundsTree();
  scene.add(character);
  
  return;
};
```

### 2.2 Flight Physics & Controls
Update flight mechanics to match drone behavior:
- Modify altitude control for more immediate response
- Adjust turning mechanics for drone-like rotation
- Add slight hovering motion when stationary
- Implement "stabilization" effect when no controls are pressed

```javascript
// Add drone-specific movement function
const updateDroneMovement = () => {
  // Propeller rotation speed based on movement
  updatePropellerSpeed();
  
  // Drone tilts forward when moving forward
  if (isMovingForward) {
    character.rotation.x = Math.min(character.rotation.x + 0.01, 0.2);
  } else {
    character.rotation.x *= 0.95; // Return to level
  }
  
  // Add slight hovering effect
  character.position.y += Math.sin(Date.now() * 0.003) * 0.05;
};
```

### 2.3 Camera Adjustments
Modify the "Bird's Eye View" function to a "Drone Camera View":
```javascript
const toggleDroneCameraView = () => {
  if (birdEyeView) {
    // Normal view
    camY = 160;
    camZ = -190;
  } else {
    // Drone camera view (could be front-mounted camera)
    camY = 25;
    camZ = -20;
  }
  birdEyeView = !birdEyeView;
};
```

### 2.4 UI Updates
Update UI references in HTML and JavaScript:
- Rename "Birds Eye View" to "Drone Camera" in UI elements
- Update icon references

## 3. Directory Structure for New Assets

```
assets/
├── drone/
│   ├── scene.gltf
│   ├── scene.bin
│   ├── textures/
│   │   ├── drone_baseColor.png
│   │   ├── drone_normal.png
│   │   └── drone_metallic.png
│   └── license.txt
└── icons/
    ├── drone-camera.svg (replacing eye.svg)
    └── [other updated icons]
```

## 4. Development Tools & Utilities Needed

1. **3D Model Tools**:
   - Blender (for model creation/modification)
   - gltf-pipeline (for model optimization)

2. **SVG Creation/Editing**:
   - Inkscape or Adobe Illustrator
   - SVGO (SVG Optimizer)

3. **Audio Editing** (if updating sounds):
   - Audacity
   - FFMPEG (for audio conversion)

4. **Testing Utilities**:
   - Three.js Inspector (Chrome extension)
   - Performance monitoring tools

## 5. Implementation Steps

1. **Setup & Preparation**:
   - Back up current bird assets
   - Create new directories for drone assets

2. **Assets Creation/Collection**:
   - Acquire or create drone 3D model
   - Create/modify SVG icons
   - Prepare sound files if needed

3. **Code Implementation**:
   - Update model loading code
   - Implement drone physics
   - Update camera controls
   - Modify UI elements

4. **Testing**:
   - Test performance on various devices
   - Test all controls and interactions
   - Optimize as needed

5. **Polish**:
   - Add particle effects for propellers
   - Fine-tune drone movement physics
   - Adjust camera follow behavior

## 6. Future Enhancements

- Add battery life mechanic
- Implement camera feed effect for drone camera view
- Add drone shadow for better ground tracking
- Create drone customization options
- Add environmental effects (wind affecting drone stability) 