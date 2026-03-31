// This is a workaround for the "'new NativeEventEmitter()' requires a non-null argument" warning
// This issue happens with React Native 0.70+ when using libraries that use NativeEventEmitter

import { NativeEventEmitter, NativeModules } from "react-native";

// Save the original constructor
const originalConstructor = NativeEventEmitter.prototype.constructor;

// Override the constructor to handle null native modules
NativeEventEmitter.prototype.constructor = function (nativeModule) {
  if (nativeModule === null || nativeModule === undefined) {
    // Use a dummy native module when null is passed
    return originalConstructor.call(this, {});
  }
  return originalConstructor.call(this, nativeModule);
};

export default NativeEventEmitter;
