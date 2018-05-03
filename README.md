# Welcome to Gesture!

This is a react-native application which can do some very basic gesture recognition of phone motion on Android!

There are additional Android files which are auto-generated when the project is created. I believe getting the project
going would consist of getting the react-native toolchain running and running "yarn" to auto-download all the dependencies.

The business logic for the Random Forest trainer used for recognition can be found [here](https://github.com/samuraijourney/EE590/blob/A2/storybook/stories/trainer.js)

The features used for the recognition of a sampled signal (Accel X,Y,Z and Gyro X,Y,Z) are the frequency and magnitude of the largest contributor to the signal (via FFT). This resulted in a feature vector of length 12 to represent a single sample.

The final application looks like this!

![Alt Text](https://media.giphy.com/media/i32etVHEo2qmxZmPxh/giphy.gif)
