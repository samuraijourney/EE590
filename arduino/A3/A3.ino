#include <Adafruit_CircuitPlayground.h>

// ------------------------------------------------------- Defines

#define LED_OFF 0
#define LED_ON 255
#define MAX_DISPLAY_LEDS 10
#define MAX_DISPLAY_VALUE 1023
#define SMOOTHING_GAIN 3.414213562
#define STEP_DELTA_THRESHOLD 8

#define RESET_PIN 19
#define START_PIN 4

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
FLOAT   prevSmoothAccelMag;
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
reset();
  
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
                       ( -0.6413515381 * accelYSmoothing[0]) + 
                       (1.5610180758 * accelYSmoothing[1]);
                       
  smoothAccelMag = accelYSmoothing[2];
  stepDetect = false;
  if (prevSmoothAccelMag != 0.0) {

    //
    // Compute the first derivative of the smoothen accel magnitudes using first order
    // backward finite difference.
    //
    
    firstDerivative = smoothAccelMag - prevSmoothAccelMag;
    if (firstDerivative < 0.01) {

      //
      // Looking for rising edge magnitude between detected minima/maxima greater than
      // an empirically determined threshold.
      //
      stepDelta = smoothAccelMag - lastMinMaxSmoothAccelMag;
      if ((lastMinMaxSmoothAccelMag != 0.0) &&
          (stepDelta > STEP_DELTA_THRESHOLD)) {

        Serial.print("Step Delta: ");
        Serial.println(stepDelta);   
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
  BOOLEAN startButtonState;
  BOOLEAN stepDetect;

  resetButtonState = digitalRead(RESET_PIN);
  if (resetButtonState) {
    reset();
    displayNumber(0);
  }

  startButtonState = digitalRead(START_PIN);
  if ((startButtonState) && (start == false)) {
    start = true;
    displayNumber(0);
  }
  
  if (start) {
    newAccelMag = getMagnitude(CircuitPlayground.motionX(),
                               CircuitPlayground.motionY(),
                               CircuitPlayground.motionZ());
                               
    stepDetect = detectStep(newAccelMag);
    if (stepDetect) {
      stepCount++;
      displayNumber(stepCount);
      Serial.print("Step Count: ");
      Serial.println(stepCount);   
    }

    delay(10);
    
  } else {
    displayIdlePattern();
    delay(100);
  }
}

VOID 
reset() 
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
  prevSmoothAccelMag = 0.0;
  start = false;
  stepCount = 0;
}

VOID 
setup() 
{
  while (!Serial);  
  Serial.begin(9600);
  CircuitPlayground.begin();
  pinMode(RESET_PIN, INPUT);
  pinMode(START_PIN, INPUT);
  reset();
}
