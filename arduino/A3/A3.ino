#include <Adafruit_CircuitPlayground.h>

// ------------------------------------------------------- Defines

#define FIRST_DERIVATIVE_THRESHOLD  0.01
#define LED_OFF                     0
#define LED_ON                      255
#define MAX_DISPLAY_LEDS            9
#define MAX_DISPLAY_VALUE           511
#define RESET_PIN                   19
#define SMOOTHING_GAIN              1058.546241
#define STATE_LED                   9
#define STEP_DELTA_THRESHOLD        0.1
#define TOGGLE_PIN                  4

// --------------------------------------------------------- Types

//
// Been working with Windows kernel a little too much...
//

typedef bool                BOOLEAN;
typedef float               FLOAT;
typedef unsigned long long  ULONGLONG;
typedef unsigned short      USHORT;
typedef void                VOID;

// ------------------------------------------------------- Globals

FLOAT   accelXSmoothing[3];
FLOAT   accelYSmoothing[3];
USHORT  idleStateIndex;
BOOLEAN idleStateOn;
FLOAT   lastMinMaxSmoothAccelMag;
BOOLEAN lastResetButtonState;
BOOLEAN lastToggleButtonState;
FLOAT   prevSmoothAccelMag;
BOOLEAN reset;
BOOLEAN start;
USHORT  stepCount;

// ---------------------------------------------------- Prototypes

BOOLEAN
detectStep(
  FLOAT accelMagnitude
  );

VOID
displayIdlePattern();

VOID 
displayNumber(
  USHORT value
  );

FLOAT
getMagnitude(
  FLOAT x,
  FLOAT y,
  FLOAT z
  ); 

VOID 
resetState();
  
// ----------------------------------------------------- Functions

BOOLEAN
detectStep(
  FLOAT accelMagnitude
  )
{
  FLOAT firstDerivative;
  FLOAT smoothAccelMag;
  FLOAT stepDelta;
  BOOLEAN stepDetect;

  //
  // Smooth out acceleration magnitude with second order low pass filter with a corner
  // frequency of 1Hz. Second order is used to attentuate faster at the corner (double pole).
  //
  
  accelXSmoothing[0] = accelXSmoothing[1]; 
  accelXSmoothing[1] = accelXSmoothing[2]; 
  accelXSmoothing[2] = accelMagnitude / SMOOTHING_GAIN;
  accelYSmoothing[0] = accelYSmoothing[1]; 
  accelYSmoothing[1] = accelYSmoothing[2]; 
  accelYSmoothing[2] = (accelXSmoothing[0] + accelXSmoothing[2]) + 
                       (2 * accelXSmoothing[1]) + 
                       (-0.9149758348 * accelYSmoothing[0]) + 
                       (1.9111970674 * accelYSmoothing[1]);
                       
  smoothAccelMag = accelYSmoothing[2];
  stepDetect = false;
  if (prevSmoothAccelMag != 0.0) {

    //
    // Compute the first derivative of the smoothen accel magnitudes using first order
    // backward finite difference.
    //
    
    firstDerivative = smoothAccelMag - prevSmoothAccelMag;
    if (abs(firstDerivative) < FIRST_DERIVATIVE_THRESHOLD) {

      //
      // Looking for rising edge magnitude between detected minima/maxima greater than
      // an empirically determined threshold.
      //

      stepDelta = smoothAccelMag - lastMinMaxSmoothAccelMag;
      if ((lastMinMaxSmoothAccelMag != 0.0) &&
          (stepDelta > STEP_DELTA_THRESHOLD)) {

        stepDetect = true;
      }
      
      lastMinMaxSmoothAccelMag = smoothAccelMag;
    }
  }

  prevSmoothAccelMag = smoothAccelMag;
  return stepDetect;
}

VOID
displayIdlePattern() 
{
  USHORT value;

  if (idleStateOn) {
    value = LED_ON;
    
  } else {
    value = LED_OFF;
  }
  
  CircuitPlayground.setPixelColor(idleStateIndex, value, value, value);
  idleStateIndex++;
  if (idleStateIndex == MAX_DISPLAY_LEDS) {
    idleStateOn = !idleStateOn;
  }
  
  idleStateIndex %= MAX_DISPLAY_LEDS;
}

VOID 
displayNumber(
  USHORT value
  ) 
{
  BOOLEAN enableLed;
  USHORT ledIndex;
  USHORT remainder;
  
  if (value > MAX_DISPLAY_VALUE) {
    value = MAX_DISPLAY_VALUE;
  }

  ledIndex = 0;
  remainder = value;
  while (remainder > 0) {
    enableLed = (remainder % 2) != 0;
    remainder = remainder / 2;
    if (enableLed) {
      CircuitPlayground.setPixelColor(ledIndex, LED_ON, LED_ON, LED_ON);
      
    } else {
      CircuitPlayground.setPixelColor(ledIndex, LED_OFF, LED_OFF, LED_OFF);
    }

    ledIndex++;
  }

  for (; ledIndex < MAX_DISPLAY_LEDS; ledIndex++) {
    CircuitPlayground.setPixelColor(ledIndex, LED_OFF, LED_OFF, LED_OFF);
  }
}

FLOAT
getMagnitude(
  FLOAT x,
  FLOAT y,
  FLOAT z
  ) 
{
  return sqrt(x*x + y*y + z*z);
}

VOID 
loop() 
{
  FLOAT newAccelMag;
  BOOLEAN resetButtonState;
  BOOLEAN toggleButtonState;
  BOOLEAN stepDetect;

  resetButtonState = digitalRead(RESET_PIN);
  if (resetButtonState && !lastResetButtonState) {
    resetState();
    displayNumber(0);
  }

  lastResetButtonState = resetButtonState;
  toggleButtonState = digitalRead(TOGGLE_PIN);
  if (toggleButtonState && !lastToggleButtonState) {
    if (reset) {
        reset = false;
        displayNumber(0);
    }

    start = !start;
    if (start) {
      CircuitPlayground.setPixelColor(STATE_LED, LED_OFF, LED_ON, LED_OFF);
      
    } else if (!start && !reset) {
      CircuitPlayground.setPixelColor(STATE_LED, LED_ON, LED_OFF, LED_OFF);
    }
  }

  lastToggleButtonState = toggleButtonState;
  if (start) {
    newAccelMag = getMagnitude(CircuitPlayground.motionX(),
                               CircuitPlayground.motionY(),
                               CircuitPlayground.motionZ());
                               
    stepDetect = detectStep(newAccelMag);
    if (stepDetect) {
      stepCount++;
      displayNumber(stepCount);
    }

    delay(10);
    
  } else if (reset) {
    displayIdlePattern();
    delay(100);

  } else {
    delay(10);
  }
}

VOID 
resetState() 
{
  accelXSmoothing[0] = 0.0;
  accelXSmoothing[1] = 0.0;
  accelXSmoothing[2] = 0.0;
  accelYSmoothing[0] = 0.0;
  accelYSmoothing[1] = 0.0;
  accelYSmoothing[2] = 0.0;
  idleStateIndex = 0;
  idleStateOn = true;
  lastMinMaxSmoothAccelMag = 0.0;
  lastResetButtonState = true;
  lastToggleButtonState = false;
  prevSmoothAccelMag = 0.0;
  reset = true;
  start = false;
  stepCount = 0;
  CircuitPlayground.setPixelColor(STATE_LED, LED_OFF, LED_OFF, LED_ON);
}

VOID 
setup() 
{
  CircuitPlayground.begin();
  pinMode(RESET_PIN, INPUT);
  pinMode(TOGGLE_PIN, INPUT);
  resetState();
}
