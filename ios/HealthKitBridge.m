//
//  HealthKitBridge.m
//  Resistance Band Fitness
//
//  Full HKWorkoutSession + HKLiveWorkoutBuilder implementation.
//  Designed to run inside an Apple Watch-paired iPhone session OR
//  on watchOS via an embedded WatchKit extension. The configuration
//  below is the iPhone-side companion which authorizes + observes
//  HR data forwarded from a paired Watch via HealthKit.
//

#import "HealthKitBridge.h"

@implementation HealthKitBridge

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup { return NO; }

- (NSArray<NSString *> *)supportedEvents {
  return @[@"HealthKitHeartRate"];
}

- (instancetype)init {
  if ((self = [super init])) {
    if ([HKHealthStore isHealthDataAvailable]) {
      _healthStore = [[HKHealthStore alloc] init];
    }
    _hrSubscribed = NO;
  }
  return self;
}

#pragma mark - Authorization

- (void)requestAuthorizationWithCompletion:(void (^)(BOOL, NSError * _Nullable))completion {
  if (!self.healthStore) {
    completion(NO, [NSError errorWithDomain:@"HealthKitBridge" code:1
                                   userInfo:@{NSLocalizedDescriptionKey: @"HealthKit unavailable"}]);
    return;
  }
  HKQuantityType *hrType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierHeartRate];
  HKQuantityType *enType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierActiveEnergyBurned];
  HKQuantityType *dwType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDistanceWalkingRunning];
  HKWorkoutType *wkType = [HKObjectType workoutType];

  NSSet *readTypes  = [NSSet setWithObjects:hrType, enType, dwType, wkType, nil];
  NSSet *shareTypes = [NSSet setWithObjects:enType, dwType, wkType, nil];

  [self.healthStore requestAuthorizationToShareTypes:shareTypes
                                           readTypes:readTypes
                                          completion:completion];
}

#pragma mark - Start / Stop Workout

RCT_REMAP_METHOD(startWorkout,
                 startWorkoutWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  [self requestAuthorizationWithCompletion:^(BOOL ok, NSError * _Nullable err) {
    if (!ok) {
      reject(@"AUTH_FAILED", err.localizedDescription ?: @"Authorization failed", err);
      return;
    }
    NSError *cfgErr = nil;
    HKWorkoutConfiguration *configuration = [[HKWorkoutConfiguration alloc] init];
    configuration.activityType = HKWorkoutActivityTypeTraditionalStrengthTraining;
    configuration.locationType = HKWorkoutSessionLocationTypeIndoor;

    self.workoutSession = [[HKWorkoutSession alloc] initWithHealthStore:self.healthStore
                                                          configuration:configuration
                                                                  error:&cfgErr];
    if (!self.workoutSession) {
      reject(@"SESSION_FAILED", cfgErr.localizedDescription ?: @"Workout session error", cfgErr);
      return;
    }
    self.workoutSession.delegate = self;

    self.workoutBuilder = [self.workoutSession associatedWorkoutBuilder];
    self.workoutBuilder.delegate = self;
    self.workoutBuilder.dataSource =
      [[HKLiveWorkoutDataSource alloc] initWithHealthStore:self.healthStore
                                       workoutConfiguration:configuration];

    NSDate *start = [NSDate date];
    [self.workoutSession startActivity:start];
    [self.workoutBuilder beginCollectionWithStartDate:start completion:^(BOOL success, NSError * _Nullable e) {
      if (success) {
        resolve(@{ @"sessionId": [[NSUUID UUID] UUIDString] });
      } else {
        reject(@"BEGIN_FAILED", e.localizedDescription ?: @"Begin collection failed", e);
      }
    }];
  }];
}

RCT_REMAP_METHOD(stopWorkout,
                 stopWorkoutWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  if (!self.workoutSession || !self.workoutBuilder) {
    resolve(@{ @"saved": @NO });
    return;
  }
  [self.workoutSession endActivity:[NSDate date]];
  [self.workoutBuilder endCollectionWithEndDate:[NSDate date]
                                     completion:^(BOOL success, NSError * _Nullable e) {
    if (!success) {
      reject(@"END_FAILED", e.localizedDescription ?: @"End collection failed", e);
      return;
    }
    [self.workoutBuilder finishWorkoutWithCompletion:^(HKWorkout * _Nullable workout, NSError * _Nullable e2) {
      self.workoutBuilder = nil;
      self.workoutSession = nil;
      if (workout) {
        resolve(@{ @"saved": @YES });
      } else {
        reject(@"FINISH_FAILED", e2.localizedDescription ?: @"Finish workout failed", e2);
      }
    }];
  }];
}

#pragma mark - Heart Rate Subscription

RCT_REMAP_METHOD(subscribeHeartRate,
                 subscribeHRWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  self.hrSubscribed = YES;
  resolve(nil);
}

RCT_REMAP_METHOD(unsubscribeHeartRate,
                 unsubscribeHRWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  self.hrSubscribed = NO;
  resolve(nil);
}

#pragma mark - HKLiveWorkoutBuilderDelegate

- (void)workoutBuilder:(HKLiveWorkoutBuilder *)workoutBuilder
  didCollectDataOfTypes:(NSSet<HKSampleType *> *)collectedTypes {
  if (!self.hrSubscribed) return;
  HKQuantityType *hrType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierHeartRate];
  if (![collectedTypes containsObject:hrType]) return;

  HKStatistics *stats = [workoutBuilder statisticsForType:hrType];
  HKQuantity *q = stats.mostRecentQuantity;
  if (!q) return;
  HKUnit *bpmUnit = [[HKUnit countUnit] unitDividedByUnit:[HKUnit minuteUnit]];
  double bpm = [q doubleValueForUnit:bpmUnit];

  [self sendEventWithName:@"HealthKitHeartRate" body:@{ @"bpm": @((int)round(bpm)) }];
}

- (void)workoutBuilderDidCollectEvent:(HKLiveWorkoutBuilder *)workoutBuilder {
  // no-op
}

#pragma mark - HKWorkoutSessionDelegate

- (void)workoutSession:(HKWorkoutSession *)workoutSession
        didChangeToState:(HKWorkoutSessionState)toState
              fromState:(HKWorkoutSessionState)fromState
                  date:(NSDate *)date {
  // no-op
}

- (void)workoutSession:(HKWorkoutSession *)workoutSession
       didFailWithError:(NSError *)error {
  NSLog(@"[HealthKitBridge] session failed: %@", error);
}

@end
