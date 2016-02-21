(function (app) {
    'use strict';

    app.controller('MeetingCtrl',
        function ($scope, $state, $stateParams, $localStorage, $rootScope, Pusher, Constants, Video, Speech, Api, DataChan, Error, Utils, Room, $timeout, roomDetails) {

            var timeout;

            Room.setId($stateParams.roomId);

            Pusher.init(Room.getId());

            // Chat Handle Events
            $scope.messages = [];

            $scope.handleCaption = function(event, data) {
                if(typeof(data) === 'undefinded') {
                    data = event;
                }

                if(data) {
                    $scope.currentMessage = data.text;

                    $timeout.cancel(timeout);
                    timeout = $timeout(function() { $scope.currentMessage = ''; }, 1500);

                    if(data.streamId) {
                        Video.setMainStreamById(data.streamId);
                    }

                    if (!$scope.$$phase) {
                        $scope.$digest();
                    }
                }
            };

            $scope.handleMessage = function(event, data) {
                if(typeof(data) === 'undefinded') {
                    data = event;
                }
                $scope.messages.push(data);
            };

            Pusher.on(Constants.events.message, $scope.handleMessage);
            Pusher.on(Constants.events.caption, $scope.handleCaption);
            $rootScope.$on(Constants.events.captionLocal, $scope.handleCaption);
            $rootScope.$on(Constants.events.message, $scope.handleMessage);

            $scope.sendMessage = function (message) {
                var payload = {
                    id: Utils.generateId(),
                    text: message,
                    userName: $localStorage.userName
                };

                Pusher.emit(Constants.events.message, payload);
                $scope.handleMessage(payload);
            };


            // Video
            Video.init(Room.getId());

            $scope.recording = false;

            $scope.startRecording = function () {
                Video.startRecording();
                $scope.recording = true;
            };

            $scope.stopRecording = function () {
                Video.stopRecording();
                $scope.recording = false;
            };

            // Speech
            Speech.init();

            // Translations

            $scope.toggleSide = function(feature, force) {
                if (typeof force !== 'undefined') {
                    $scope.side.show = force;
                } else {
                    $scope.side.show = !$scope.side.show;
                }

                $scope.toggleFeature(feature);
            };

            $scope.toggleScreenShare = function() {
                var feature = 'screen-share';
                if (!$scope.isFeatureActive(feature)) {
                    Video.shareScreen(function(error) {
                        removeFeature(feature);
                    });
                    addFeature(feature);
                } else {
                    Video.stopScreen();
                    removeFeature(feature);
                }
            };

            $scope.toggleFeature = function(feature, force) {
                var index = $scope.side.activeFeatures.indexOf(feature);

                if (index === -1) {
                    $scope.side.activeFeatures.push(feature);
                } else {
                    $scope.side.activeFeatures.splice(index, 1);
                }
            };

            function addFeature(feature) {
                var index = $scope.side.activeFeatures.indexOf(feature);

                if (index === -1) {
                    $scope.side.activeFeatures.push(feature);
                }
            }

            function removeFeature(feature) {
                var index = $scope.side.activeFeatures.indexOf(feature);

                if (index !== -1) {
                    $scope.side.activeFeatures.splice(index, 1);
                }
            }

            $scope.isFeatureActive = function(feature) {
                return $scope.side.activeFeatures.indexOf(feature) !== -1;
            };
        });

}(angular.module('cahoots')));
