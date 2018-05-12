------------------------------------------------------- Defines

#define LED_OFF 0
#define LED_ON 255
#define MAX_DISPLAY_LEDS 10
#define MAX_DISPLAY_VALUE 1023
#define SMOOTHING_GAIN 3.414213562

#define ACCELEROMETER_CS_PIN 8
#define ACCELEROMETER_INTERRUPT_PIN 7
#define RESET_INTERRUPT_PIN 19
#define START_INTERRUPT_PIN 4

--------------------------------------------------------- Types

//
// Been working with Windows kernel a little too much...
//

typedef bool                BOOLEAN;
typedef false               FALSE;
typedef float               FLOAT;
typedef true                TRUE;
typedef unsigned long long  ULONGLONG;
typedef unsigned short      USHORT;
typedef void                VOID;

------------------------------------------------------- Globals

FLOAT   accelXSmoothing[3];
FLOAT   accelYSmoothing[3];
FLOAT   lastMinMaxSmoothAccelMag;
FLOAT   prevSmoothAccelMag;
FLOAT   newAccelMag;
BOOLEAN newAccelAvailable;
BOOLEAN start;
USHORT  stepCount;

---------------------------------------------------- Prototypes

void 
accelIsr(
  VOID
  );

void
detectStep(
  FLOAT accelMagnitude
  );
  
void 
displayNumber(
  USHORT value
  );

FLOAT
getMagnitude(
  FLOAT x,
  FLOAT y,
  FLOAT z,
  ); 

void 
reset(
  VOID
  );

void 
resetIsr(
  VOID
  );

void 
startIsr(
  VOID
  );
  
----------------------------------------------------- Functions

void 
accelIsr(
  VOID
  ) 
{
  newAccelMag = getMagnitude(CircuitPlayground.motionX(),
                             CircuitPlayground.motionY(),
                             CircuitPlayground.motionZ());
                             
  newAccelAvailable = TRUE;
}

void
detectStep(
  FLOAT accelMagnitude
  )
{
  FLOAT firstDerivative;
  FLOAT smoothAccelMag;
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
  stepDetect = FALSE;
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
      
      if ((lastMinMaxSmoothAccelMag != 0.0) &&
          (smoothAccelMag - lastMinMaxSmoothAccelMag) > 5) {
          
          stepDetect = TRUE;
      }
      
      lastMinMaxSmoothAccelMag = smoothAccelMag;
    }
  }

  prevSmoothAccelMag = smoothAccelMag;
  return stepDetect;
}

void 
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
    enabledLed = (remainder % 2) != 0;
    remainder = remainder / 2;
    if (enableLed) {
      CircuitPlayground.setPixelColor(ledIndex, LED_ON, LED_ON, LED_ON);
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
  FLOAT z,
  ) 
{
  return sqrt(x*x + y*y + z*z);
}

void 
loop(
  VOID
  ) 
{
  BOOLEAN stepDetect;

  if (start) {
    if (newAccelAvailable) {
      stepDetect = detectStep(newAccelMag);
      if (stepDetect) {
        stepCount++;
        displayNumber(stepCount);
      }
      
      newAccelAvailable = FALSE;
    }
     
  } else {
    
  }
}

void 
reset(
  VOID
  ) 
{
  accelXSmoothing[0] = 0.0;
  accelXSmoothing[1] = 0.0;
  accelXSmoothing[2] = 0.0;
  accelYSmoothing[0] = 0.0;
  accelYSmoothing[1] = 0.0;
  accelYSmoothing[2] = 0.0;
  lastMinMaxSmoothAccelMag = 0.0;
  prevSmoothAccelMag = 0.0;
  newAccelMag = 0.0;
  newAccelAvailable = FALSE;
  start = FALSE;
  stepCount = 0;
}

void 
resetIsr(
  VOID
  ) 
{
  reset();
}

void 
setup(
  VOID
  ) 
{
  attachInterrupt(digitalPinToInterrupt(ACCELEROMETER_INTERRUPT_PIN), accelIsr, FALLING);
  attachInterrupt(digitalPinToInterrupt(RESET_INTERRUPT_PIN), resetIsr, FALLING);
  attachInterrupt(digitalPinToInterrupt(START_INTERRUPT_PIN), startIsr, FALLING);
  reset();
}

void 
startIsr(
  VOID
  ) 
{
  start = TRUE;
}
