//
//  HealthKitBridge.h
//  Resistance Band Fitness
//
//  Native bridge exposing HealthKit live workout + HR streaming to JS.
//  Methods exposed to RN:
//    - startWorkout            (HKWorkoutSession, strengthTraining)
//    - stopWorkout             (ends session, saves to Apple Fitness)
//    - subscribeHeartRate      (begins HKLiveWorkoutBuilder HR data collection)
//    - unsubscribeHeartRate
//
//  Events emitted (DeviceEventEmitter):
//    - "HealthKitHeartRate"    { bpm: NSNumber }
//
//  Apple Watch is the HR + motion source via HealthKit sync. When no Watch
//  is paired, no HR samples will arrive — JS shows "–" by design.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <HealthKit/HealthKit.h>

NS_ASSUME_NONNULL_BEGIN

API_AVAILABLE(ios(10.0))
@interface HealthKitBridge : RCTEventEmitter <RCTBridgeModule, HKWorkoutSessionDelegate, HKLiveWorkoutBuilderDelegate>

@property (nonatomic, strong, nullable) HKHealthStore *healthStore;
@property (nonatomic, strong, nullable) HKWorkoutSession *workoutSession;
@property (nonatomic, strong, nullable) HKLiveWorkoutBuilder *workoutBuilder;
@property (nonatomic, assign) BOOL hrSubscribed;

@end

NS_ASSUME_NONNULL_END
