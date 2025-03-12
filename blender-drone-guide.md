# Drone 3D Model Creation with Blender

This guide provides step-by-step instructions for creating a simple drone model in Blender and integrating it with the "Quad Tok" project (formerly "Fly By").

## 1. Creating the Drone Model

### 1.1 Setup Blender

1. Install Blender from [blender.org](https://www.blender.org/download/) if you haven't already
2. Launch Blender and start a new project
3. Delete the default cube by selecting it and pressing `X` then confirming

### 1.2 Create the Drone Body

1. Add a cylinder for the drone body:
   - Press `Shift + A` → Mesh → Cylinder
   - In the popup dialog, set:
     - Vertices: 16
     - Radius: 0.5
     - Depth: 0.15
   - Press `S` → `Z` → `0.5` to flatten it slightly

2. Rename the object to "Drone_Body_0":
   - Press `F2` or right-click → Rename
   - Type "Drone_Body_0" (important for our animation scripts)

3. Add material to the body:
   - In the Materials panel, click "New"
   - Name it "DroneBody"
   - Set color to a dark gray (RGB: 0.2, 0.2, 0.2)
   - Set Metallic to 0.7
   - Set Roughness to 0.3

### 1.3 Create the Arms

1. Add a cylinder for the first arm:
   - Press `Shift + A` → Mesh → Cylinder
   - Set Radius: 0.05, Depth: 0.8
   - Rotate it 90 degrees on the Y-axis by pressing `R` → `Y` → `90`
   - Move it to position by pressing `G` → `X` → `0.4`

2. Duplicate and position the arms:
   - Select the first arm and press `Shift + D` → `R` → `Z` → `90` to duplicate and rotate
   - Repeat for all four arms, positioning them at 90-degree intervals around the body

3. Add material to the arms:
   - Create a new material called "DroneArms"
   - Set color to a slightly lighter gray (RGB: 0.3, 0.3, 0.3)
   - Set Metallic to 0.5
   - Set Roughness to 0.4

### 1.4 Create the Propellers

1. Create the first propeller:
   - Press `Shift + A` → Mesh → Cylinder
   - Set Radius: 0.25, Depth: 0.02
   - Move it to the end of one arm with `G` → `X` → `0.8`
   - Position it slightly above the arm with `G` → `Z` → `0.05`

2. Create propeller blades:
   - Press `Shift + A` → Mesh → Cube
   - Scale it to make a blade: `S` → `X` → `0.5` then `S` → `Y` → `0.1` then `S` → `Z` → `0.01`
   - Position it on the propeller disk
   - Duplicate and rotate to create all blades (usually 2-4 blades per propeller)

3. Join the propeller parts:
   - Select all parts of one propeller (disk and blades)
   - Press `Ctrl + J` to join them into a single object

4. Name each propeller according to position:
   - Rename to "propeller_front_left", "propeller_front_right", "propeller_back_left", "propeller_back_right"
   - These names are critical for the animation scripts

5. Add material to propellers:
   - Create a new material called "PropellerBlades"
   - Set color to black (RGB: 0.05, 0.05, 0.05)
   - Set Roughness to 0.7

### 1.5 Create the Camera Mount

1. Add a small downward-facing camera:
   - Press `Shift + A` → Mesh → Cube
   - Scale to a small rectangular shape
   - Position it at the bottom center of the drone body
   - Add a small cylindrical lens protruding from the bottom

2. Add material to camera:
   - Create a new material called "DroneCamera"
   - Set color to black with a slight blue tint (RGB: 0.0, 0.05, 0.1)
   - Set Metallic to 0.6
   - Set Roughness to 0.2
   - For the lens, use a glossy blue material

### 1.6 Final Organization

1. Create a parent-child hierarchy:
   - Select all propellers, then shift-select the Drone_Body_0 last
   - Press `Ctrl + P` → "Object (Keep Transform)"
   - This makes the body the parent, which is important for animations

2. Check your naming hierarchy:
   - Main body: "Drone_Body_0"
   - Propellers: "propeller_front_left", "propeller_front_right", "propeller_back_left", "propeller_back_right"

### 1.7 Export as GLTF

1. Prepare for export:
   - Select all drone parts
   - Make sure all object origins are properly set
   - Check that all materials are applied correctly

2. Export the model:
   - File → Export → glTF 2.0 (.glb/.gltf)
   - Navigate to your project's "assets/drone" folder
   - Name the file "scene.gltf" (to match the original bird model path)
   - Enable the following options:
     - Format: GLTF Embedded (.gltf)
     - Include: Selected Objects
     - Transform: +Y Up
     - Check "Apply Modifiers" if you used any
   - Click "Export GLTF 2.0"

## 2. Game Integration

After creating and exporting your drone model, follow these steps to integrate it into the game:

### 2.1 Update Character Loading

Edit the `setCharacter` function in `index.js`:

```javascript
const setCharacter = async () => {
  // Load drone model instead of bird
  const model = await gltfLoader.loadAsync('assets/drone/scene.gltf');
  
  // Find the main body mesh
  const geo = model.scene.getObjectByName('Drone_Body_0').geometry.clone();
  character = model.scene;

  // Position and scale
  character.position.set(0, 25, 0);
  character.scale.set(1.3, 1.3, 1.3);

  // Set up drone-specific properties
  charPosYIncrement = 0;
  charRotateYIncrement = 0;
  charRotateYMax = 0.01;
  
  // Import the drone animation modules
  import { setupPropellerAnimation, setupDroneTilt, setupHoverEffect } from './assets/drone/drone-animations.js';
  
  // Initialize drone animations
  propellerAnimation = setupPropellerAnimation(character);
  droneTilt = setupDroneTilt(character);
  hoverEffect = setupHoverEffect(character);
  
  // Start animations
  propellerAnimation.start();
  hoverEffect.start();
  
  // Add collision detection
  geo.computeBoundsTree();
  scene.add(character);

  return;
};
```

### 2.2 Update Bird's Eye View Function

Replace the `toggleBirdsEyeView` function with `toggleDroneCameraView`:

```javascript
const toggleDroneCameraView = () => {
  if(flyingIn) return;
  
  thirdPerson = !thirdPerson;
  
  if(!thirdPerson) {
    // First-person drone camera view
    camY = 3;
    camZ = 7;
  } else {
    // Return to third-person view
    camY = 160;
    camZ = -190;
  }
};
```

### 2.3 Update HTML References

Update the HTML to change references from "Bird's Eye" to "Drone Camera":

1. Change the icon reference in the HTML file:
   ```html
   <div class="hex-container hex-birds-eye">
     <img 
      class="icon" 
      src="assets/icons/drone-camera.svg" 
      alt="Drone Camera">
     <div class="hex hex-one"></div>
     <div class="hex hex-two"></div>
   </div>
   ```

2. Update all JavaScript references:
   - Change function calls from `toggleBirdsEyeView()` to `toggleDroneCameraView()`
   - Update event listeners
   - Rename CSS classes if needed

### 2.4 Update Movement Control

Modify the `determineMovement` function to use drone-specific movement:

```javascript
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

  // Revert to stable position when no keys are pressed
  if(!activeKeysPressed.includes(38) && !activeKeysPressed.includes(40) ||
     activeKeysPressed.includes(38) && activeKeysPressed.includes(40)) {
    if(charPosYIncrement > 0) charPosYIncrement -= 0.02;
    
    // Return to stable position
    droneTilt.stabilize();
    
    // Gradually slow propellers
    propellerAnimation.decelerate();
  }

  if(!activeKeysPressed.includes(37) && !activeKeysPressed.includes(39) ||
     activeKeysPressed.includes(37) && activeKeysPressed.includes(39)) {
    if(charRotateYIncrement > 0) charRotateYIncrement -= 0.0005;
    
    // Return to stable position
    droneTilt.stabilize();
  }
}
```

## 3. Testing and Refinement

After implementing these changes:

1. Test the drone model in the game
2. Check that propellers rotate correctly
3. Verify that the drone camera view works
4. Adjust model scale, position, and animation parameters as needed
5. Fine-tune the hovering effect and tilt animations

## 4. Common Issues and Solutions

### 4.1 Model Not Appearing

- Check that the file path is correct
- Verify that the model is exported with the correct settings
- Ensure the mesh names match what the code expects

### 4.2 Animation Issues

- Check that propeller names match the expected format in the animation script
- Verify that the model hierarchy is correct (all propellers should be children of the body)
- Adjust rotation speeds if propellers spin too fast or too slow

### 4.3 Movement Problems

- Fine-tune the tilt angles if the drone doesn't appear to respond correctly
- Adjust hovering amplitude if it's too subtle or too extreme
- Check collision detection if the drone passes through terrain

## 5. Further Enhancements

Once the basic drone implementation is working, consider these enhancements:

1. Add propeller blur effect when moving fast
2. Implement battery life indicator
3. Add particle effects for propeller wind disturbance
4. Create sound effects for the drone motors
5. Add camera feed effect in first-person view
6. Implement drone shadow for better ground tracking 