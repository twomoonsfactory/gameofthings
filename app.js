angular.module('gameMaster', ['gameMaster.controllers', 'gameMaster.services', 'gameMaster.castServices']);

angular.module('gameMaster.controllers', [])
  .controller('gameController', ['$scope', '$log', 'imageProvider', /*'castMessageBus',*/ function($scope, $log, imageProvider/*, castMessageBus*/) {
      $scope.message = 'Waiting to hear Marco...';
      $scope.hulk = imageProvider.getPic('waiting');
      
      /*/here's the chromecast message handler:
      castMessageBus.onMessage = function(event){
        $log.log("Message received: " + event.data);
        $scope.message = event.data;
        $scope.hulk = imageProvider.getPic('done');
        $scope.$apply();
      };*/
      
  }]);

angular.module('gameMaster.services', [])
  .service('imageProvider', function() {
    var images = [{
      id: "waiting",
      image: "https://33.media.tumblr.com/48b1991b8026737f52d607651be4a43e/tumblr_nkpb0640Of1qcm3fwo1_500.gif"
    }, {
      id: "done",
      image: "https://31.media.tumblr.com/9609c3e2cd75207185faeff18e44d2ab/tumblr_mthtpofxcy1rdbd0qo2_500.gif"
    }];

    this.getPic = function(arg) {
      for (var i = 0; i < images.length; i++) {
        if (images[i].id === arg)
          return images[i].image;
      }

    };

  });

angular.module('gameMaster.castServices', [])
  .value('cast', cast)
  .factory('castMessageBus', function(cast, $log) {

    // start up chromecast
    cast.receiver.logger.setLevelValue(0);
    var castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    $log.log('Starting Receiver Manager');

    // 'ready' event handler
    castReceiverManager.onReady = function(event) {
      $log.log('Received Ready event: ' + JSON.stringify(event.data));
      castReceiverManager.setApplicationState("Application status is ready...");
    };

    // 'senderconnected' event handler
    castReceiverManager.onSenderConnected = function(event) {
      $log.log('Received Sender Connected event: ' + event.data);
      $log.log(castReceiverManager.getSender(event.data).userAgent);
    };

    // 'senderdisconnected' event handler
    castReceiverManager.onSenderDisconncted = function(event) {
      $log.log('Received Sender Disconnected event: ' + event.data);
      if (castReceiverManager.getSenders().length === 0) {
        close();
      }
    };

    // 'systemvolumechanged' event handler
    castReceiverManager.onSystemVolumeChanged = function(event) {
      $log.log('Received System Volume Changed event: ' + event.data.level + ' ' + event.data.muted);
    };

    // test CastMessageBus for the app connection -- we will be creating
    // more as we need more for the actual app functionality
    var messageBus = castReceiverManager.getCastMessageBus('urn:x-cast:com.pt.basic');

    // initialization for the manager and log
    castReceiverManager.start({statusText: "Application is starting"});
    $log.log('Receiver Manager started');

    return messageBus;
  });