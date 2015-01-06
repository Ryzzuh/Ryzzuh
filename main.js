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
  //console.log(SC);
  //setTimeout(function(){console.log("blah",SC)},700);
  
  // var tag = document.createElement('script');
  // tag.src = "css/bootstrap.css"
  // var thirdScriptTag = document.getElementsByTagName('script')[0];
  // thirdScriptTag.parentNode.insertBefore(tag, thirdScriptTag);
  // console.log(thirdScriptTag);

});

// Main Ctrl

app.controller('MainCtrl', function($log, $scope, $http, $filter, $window, myService) {

	myService.getData().then(function(data) {
		//pull data from service
		//
        $scope.todos = data;
        $scope.SC = $window.SC;
    });

    var self = this;

  	self.logAll = function(){console.log($scope.todos)};
  	self.logView = function(){console.log($scope.data)};
  	self.logSource = function(){myService.logTrack()};
  	self.logHistory = function(){myService.logHistory()};

  	init();
    function init() {
      $scope.youtube = myService.getYoutube();
      //$scope.results = myService.getResults();
      //$scope.upcoming = myService.getUpcoming();
      //$scope.history = myService.getHistory();
      $scope.playlist = true;
    }

    self.playSomething = function (id, title) {
	    console.log("playing something");
	    console.log("data length: ", $scope.data.length);
	    var x = Math.floor((Math.random() * $scope.data.length));
	    track = $scope.data[x];

	    myService.launchPlayer(track);

	    
	    $log.info('Launched id:' + $scope.id + ' and title:' + $scope.title);

    };

    self.pausePlayers = function(){myService.pausePlayers()};

    //links in tracklists
    self.clicked = function (index) {
    	console.log(index);
    	track = $scope.data[index];
    	console.log(track);
    	console.log(track.source);
    	myService.launchPlayer(track);
    }

    self.logFavourite = function(index){myService.logFavourite($scope.todos[index])}
//end
//

 })

//myService

app.service('myService', function ($window, $rootScope, $log, $http, $q){
	var self = this;
	//pull data from file
	//
	self.getData = function() { 
	    var defer = $q.defer();
	        $http({method: 'GET', url: 'data/data.json', data: {}})
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

	var history = [];
	self.addHistory = function(item){history.push(item)}
	self.logHistory = function(){console.log(history)};

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

	self.pausePlayers = function(){
		youtube.player.pauseVideo();
		widget.pause();
	}

	self.launchPlayer = function (track) {
	 	$rootScope.nowPlaying = track;
	 	self.addHistory(track);

	 	self.pausePlayers();
		if (track.source == "YT"){
		    youtube.player.loadVideoById(track.Id);
		    youtube.videoId = track.id;
		    youtube.videoTitle = track.title;
		    return youtube;
		}
		else if (track.source = "SC"){
			console.log("launching SC", track.id, track.title);
		    widget.load(track.link, {auto_play:true});
		    youtube.videoTitle = track.title;
		}
	  }

	self.getYoutube = function () {
	    return youtube;
	  };


	self.launchPlayerSC = function (id, title) {
		console.log("launching SC", id, title);
	    widget.load(id, {auto_play:true});
	    youtube.videoTitle = title;
	  };
	  //
	  //
	setTimeout(function(){
							console.log("initializing widget")
							widget = SC.Widget('sc-widget');
							console.log(widget);
							widget.bind(SC.Widget.Events.READY, function() {widget.play()})}
							,2800);
	//setTimeout(function(){widget.bind(SC.Widget.Events.READY, function() {widget.play()},800)});
	self.logTrack = function(){console.log($rootScope.nowPlaying.source == "YT")}
	self.logFavourite = function(item){
							console.log(item);
							if (localStorage[item.Id]){
								console.log("removing Item")
								localStorage.removeItem(item.Id);
							} else{
								console.log("adding Item")
								localStorage.setItem(item.Id, true);
							}
						}

	console.log("blah blah blah", localStorage);
	$rootScope.fap = localStorage;

})

