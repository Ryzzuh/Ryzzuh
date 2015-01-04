var app = angular.module('notesApp', [])
//add data dependency to the module
//follow these instructions https://docs.angularjs.org/tutorial/step_11

// Run

app.run(function () {
  var tag = document.createElement('script');
  tag.src = "http://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  console.log(firstScriptTag);

  var tag = document.createElement('script');
  tag.src = "https://w.soundcloud.com/player/api.js"
  var secondScriptTag = document.getElementsByTagName('script')[0];
  secondScriptTag.parentNode.insertBefore(tag, secondScriptTag);
  console.log(secondScriptTag);
  widgetIframe = document.getElementById('sc-widget');
  //widget = SC.Widget(widgetIframe);
  
});

// Main Ctrl

app.controller('MainCtrl', function($log, $scope, $http, $filter, $window, myService) {
	myService.bindPlayer2();

	//initialize Soundcloud
	setTimeout(function(){widget = $window.SC.Widget(widgetIframe)},400);

	this.logWidget = function() {console.log($window.SC)};
  	var self = this;

	myService.getData().then(function(data) {
		//pull data from service
		//
        $scope.todos = data;
    });

  	self.logAll = function(){console.log($scope.todos)};
  	self.logView = function(){console.log($scope.data)};

  	init();
    function init() {
      $scope.youtube = myService.getYoutube();
      //$scope.results = myService.getResults();
      //$scope.upcoming = myService.getUpcoming();
      //$scope.history = myService.getHistory();
      $scope.playlist = true;
    }

    self.playSomething = function (id, title) {
	    console.log("you pressed play something");
	    console.log("data length: ", $scope.data.length);
	    var x = Math.floor((Math.random() * $scope.data.length));
	    track = $scope.data[x];
		$scope.source = track.source
	    $scope.id = track.Id;
	    $scope.title = track.title;

	    launchSource($scope.id, $scope.title, $scope.source)
	    function launchSource(id, title, source) {
	    	console.log(id, title)
	    	if(source == 'YT'){
	    		myService.launchPlayer($scope.id, title);
	    	} else if (source == "SC"){
	    		myService.launchPlayerSC(track.link, title);
	    		console.log("sjdkjsdkjk");
	    		setTimeout(function(){widget.play();},3000)
	    	};	
	    };
	    

	     
	     

	      //myService.archiveVideo(id, title);
	      //myService.deleteVideo($scope.upcoming, id);
	     


	     $log.info('Launched id:' + $scope.id + ' and title:' + $scope.title);
    };
//end
//

 })

//myService

app.service('myService', function ($window, $rootScope, $log, $http, $q){
	var self = this;

	self.getData = function() { 
	    var defer = $q.defer();
	        $http({method: 'POST', url: 'data.json', data: {}})
	            .success(function(data, status, headers, config) {
	                // return tracklist data
	                //
	                defer.resolve(data);
	                    })
	            .error(function(data, status, headers, config) {
	                // called asynchronously if an error occurs
	                // or server returns response with an error status.
	                window.data = data;
	            });

	    return defer.promise;
		}

	var youtube = {
	    ready: false,
	    player: null,
	    playerId: null,
	    videoId: null,
	    videoTitle: null,
	    playerHeight: '150',
	    playerWidth: '480',
	    state: 'stopped'
	  };

	 $window.onYouTubeIframeAPIReady = function () {
	    $log.info('Youtube API is ready');
	    youtube.ready = true;
	    self.bindPlayer('player');
	    self.loadPlayer();
	    $rootScope.$apply();
  	};

  	function onYoutubeReady (event) {
	    $log.info('YouTube Player is ready');
	    //youtube.player.cueVideoById(history[0].id);
	    //youtube.videoId = history[0].id;
	    //youtube.videoTitle = history[0].title;
	  }

	function onYoutubeStateChange (event) {
	    if (event.data == YT.PlayerState.PLAYING) {
	      youtube.state = 'playing';
	    } else if (event.data == YT.PlayerState.PAUSED) {
	      youtube.state = 'paused';
	    } else if (event.data == YT.PlayerState.ENDED) {
	      youtube.state = 'ended';
	      //self.launchPlayer(upcoming[0].id, upcoming[0].title);
	      //self.archiveVideo(upcoming[0].id, upcoming[0].title);
	      //self.deleteVideo(upcoming, upcoming[0].id);
	    }
	    $rootScope.$apply();
	 }

  	self.bindPlayer = function (elementId) {
	    $log.info('Binding to ' + elementId);
	    youtube.playerId = elementId;
	  };

	self.createPlayer = function () {
    $log.info('Creating a new Youtube player for DOM id ' + youtube.playerId + ' and video ' + youtube.videoId);
    return new YT.Player(youtube.playerId, {
      height: youtube.playerHeight,
      width: youtube.playerWidth,
      playerVars: {
        rel: 0,
        showinfo: 0
      },
      events: {
        'onReady': onYoutubeReady,
        'onStateChange': onYoutubeStateChange
      }
    });
  };

	self.loadPlayer = function () {
	    if (youtube.ready && youtube.playerId) {
	      if (youtube.player) {
	        youtube.player.destroy();
	      }
	      youtube.player = self.createPlayer();
	    }
	  };

	self.launchPlayer = function (id, title) {
	    youtube.player.loadVideoById(id);
	    youtube.videoId = id;
	    youtube.videoTitle = title;
	    return youtube;
	  }

	self.getYoutube = function () {
	    return youtube;
	  };

	  //SC testing
	self.bindPlayer2 = function () {
		//elementId = 'sc-widget';
	    //$log.info('Binding to ' + elementId);
	    //SC = elementId;
	    console.log("SC");
	    //console.log(SC);
	    console.log("SC");
	    //widget = SC.Widget(widgetIframe);
	  };

	self.launchPlayerSC = function (id, title) {
		console.log("launching SC");
	    widget.load(id);
	    youtube.videoTitle = title;
	  };

})

