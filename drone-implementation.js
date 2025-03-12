/**
 * Drone Implementation for "Fly By" Game
 * 
 * This file contains all the code changes needed to replace the bird with a drone.
 * Copy and adapt these functions to the appropriate locations in index.js.
 */

// ===============================================================
// 1. Character Loading - Replace the setCharacter function
// ===============================================================

const setCharacter = async () => {
  // Load drone model instead of bird
  const model = await gltfLoader.loadAsync('assets/drone/scene.gltf');
  
  // Find the main body mesh - adjust name if your model uses a different name
  const geo = model.scene.getObjectByName('Drone_Body_0').geometry.clone();
  character = model.scene;

  // Position and scale
  character.position.set(0, 25, 0);
  character.scale.set(1.3, 1.3, 1.3);

  // Set up drone-specific properties
  charPosYIncrement = 0;
  charRotateYIncrement = 0;
  charRotateYMax = 0.01;
  
  // Import the drone animation modules - if you're using dynamic imports
  // If you prefer, you can include this script in your HTML directly
  const animations = await import('./assets/drone/drone-animations.js');
  
  // Initialize drone animations
  propellerAnimation = animations.setupPropellerAnimation(character);
  droneTilt = animations.setupDroneTilt(character);
  hoverEffect = animations.setupHoverEffect(character, {
    amplitude: 0.05,  // Adjust as needed
    frequency: 0.003  // Adjust as needed
  });
  
  // Start animations
  propellerAnimation.start();
  hoverEffect.start();
  
  // Add collision detection
  geo.computeBoundsTree();
  scene.add(character);

  return;
};

// ===============================================================
// 2. Replace Bird's Eye View Function
// ===============================================================

const toggleDroneCameraView = () => {
  if(flyingIn) return;
  
  thirdPerson = !thirdPerson;
  
  if(!thirdPerson) {
    // First-person drone camera view - adjust values to match desired view
    camY = 3;
    camZ = 7;
  } else {
    // Return to third-person view
    camY = 160;
    camZ = -190;
  }
};

// ===============================================================
// 3. Update Movement Controls
// ===============================================================

const determineMovement = () => {
  // Basic forward movement
  character.translateZ(doubleSpeed ? 1 : 0.4);

  if(flyingIn) return;

  // Handle vertical movement (up/down)
  if(activeKeysPressed.includes(38)) { // up arrow
    if(character.position.y < 90) {
      character.position.y += charPosYIncrement;
      if(charPosYIncrement < 0.3) charPosYIncrement += 0.02;
      
      // Apply forward tilt effect
      droneTilt.tiltForward();
      
      // Increase propeller speed
      propellerAnimation.accelerate();
    }
  }
  
  if(activeKeysPressed.includes(40) && !movingCharDueToDistance) { // down arrow
    if(character.position.y > 27) {
      character.position.y -= charPosYIncrement;
      if(charPosYIncrement < 0.3) charPosYIncrement += 0.02;
      
      // Apply backward tilt effect
      droneTilt.tiltBackward();
      
      // Increase propeller speed
      propellerAnimation.accelerate();
    }
  }

  // Handle rotation (left/right)
  if(activeKeysPressed.includes(37)) { // left arrow
    character.rotateY(charRotateYIncrement);
    if(charRotateYIncrement < charRotateYMax) charRotateYIncrement += 0.0005;
    
    // Apply left tilt effect
    droneTilt.tiltLeft();
  }
  
  if(activeKeysPressed.includes(39)) { // right arrow
    character.rotateY(-charRotateYIncrement);
    if(charRotateYIncrement < charRotateYMax) charRotateYIncrement += 0.0005;
    
    // Apply right tilt effect
    droneTilt.tiltRight();
  }

  // Combined movements (diagonal)
  if(activeKeysPressed.includes(38) && activeKeysPressed.includes(37)) {
    droneTilt.tiltForwardLeft();
  }
  else if(activeKeysPressed.includes(38) && activeKeysPressed.includes(39)) {
    droneTilt.tiltForwardRight();
  }
  else if(activeKeysPressed.includes(40) && activeKeysPressed.includes(37)) {
    droneTilt.tiltBackwardLeft();
  }
  else if(activeKeysPressed.includes(40) && activeKeysPressed.includes(39)) {
    droneTilt.tiltBackwardRight();
  }

  // Revert to stable position when no keys are pressed
  if(!activeKeysPressed.includes(38) && !activeKeysPressed.includes(40) ||
     activeKeysPressed.includes(38) && activeKeysPressed.includes(40)) {
    if(charPosYIncrement > 0) charPosYIncrement -= 0.02;
    
    // Return to stable position (vertical axis)
    if(!activeKeysPressed.includes(37) && !activeKeysPressed.includes(39)) {
      droneTilt.stabilize();
    }
    
    // Gradually slow propellers when not moving vertically
    propellerAnimation.decelerate();
  }

  if(!activeKeysPressed.includes(37) && !activeKeysPressed.includes(39) ||
     activeKeysPressed.includes(37) && activeKeysPressed.includes(39)) {
    if(charRotateYIncrement > 0) charRotateYIncrement -= 0.0005;
    
    // Return to stable position (horizontal axis)
    if(!activeKeysPressed.includes(38) && !activeKeysPressed.includes(40)) {
      droneTilt.stabilize();
    }
  }
};

// ===============================================================
// 4. Update Key Handler Functions
// ===============================================================

const keyUp = (event) => {
  if(event.keyCode === 32) toggleDoubleSpeed();
  if(event.keyCode === 90) toggleDroneCameraView(); // Changed from toggleBirdsEyeView

  const index = activeKeysPressed.indexOf(event.keyCode);
  activeKeysPressed.splice(index, 1);
};

// ===============================================================
// 5. Update UI Event Listeners
// ===============================================================

const updateUIEventListeners = () => {
  // Update the birds-eye button to use the drone camera function
  document.querySelector('.hex-birds-eye')
    .addEventListener('click', () => toggleDroneCameraView());
};

// ===============================================================
// 6. Update Animation System
// ===============================================================

// Add this to your render function or animation loop
const updateDroneAnimations = (deltaTime) => {
  if (propellerAnimation && droneTilt && hoverEffect) {
    // These will be handled internally by the animation system
    // Just make sure they're initialized
  }
  
  // If you're using the THREE.js AnimationMixer for the bird,
  // you'll no longer need that for the drone
  // mixer.update(deltaTime);
};

// ===============================================================
// 7. Update HTML Elements
// ===============================================================

// In your HTML file, update:
/*
<div class="hex-container hex-birds-eye">
  <img 
   class="icon" 
   src="assets/icons/drone-camera.svg" 
   alt="Drone Camera">
  <div class="hex hex-one"></div>
  <div class="hex hex-two"></div>
</div>
*/

// ===============================================================
// 8. Global Variables to Add
// ===============================================================

// Add these to your global variables section:
let propellerAnimation;
let droneTilt;
let hoverEffect;

// ===============================================================
// 9. Cleanup Old Bird Animation Code
// ===============================================================

// You can remove or comment out:
// - setCharAnimation function (if it's only used for the bird)
// - Any bird-specific animation code
// - References to charNeck and charBody (the drone doesn't have these)

// ===============================================================
// 10. Adjust Double Speed for Drone
// ===============================================================

const toggleDoubleSpeed = () => {
  if(flyingIn) return;

  doubleSpeed = !doubleSpeed;
  charRotateYMax = doubleSpeed ? 0.02 : 0.01;
  
  // Update propeller speed based on drone speed
  if (propellerAnimation) {
    propellerAnimation.setSpeed(doubleSpeed ? 'fast' : 'medium');
  }
}; 