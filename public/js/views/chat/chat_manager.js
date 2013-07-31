/*globals Firebase*/
define(function(require){
	var Backbone = require("backbone");
	var api = require("api");
	var Chat = require("views/chat/chat");
	var config = require("config");

	var firebase = config.getValue('firebase');

	var  ChatManager = Backbone.View.extend({
		el: '#chat-manager',

		initialize: function(options){
			this.startup(options);
		},

		startup: function(){
			if(api.userIsLoggedIn()){
				this.closeEvents = [];
				this.render();
			}
		},

		render: function(){
			var userId = api.getUserId();
			//Crate a presence data
			var onlineRef = new Firebase(firebase + '/onlineRef/' + userId);
			var connectedRef = new Firebase(firebase + '/.info/connected');
			connectedRef.on('value', function(snap) {
				if (snap.val() === true) {
				// We're connected (or reconnected)!  Set up our presence state and
				// tell the server to set a timestamp when we leave.
					onlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
					onlineRef.set(true);
				}
			});
			var publicRoom = new Firebase(firebase + '/rooms/' + userId);
			console.log('loooooooool');
			publicRoom.on('child_added', function(snapshot) {
				var otherId = snapshot.name();
				if (otherId !== userId){
					var privateRoom = new Firebase(firebase + '/private/' + (otherId < userId ? otherId + '-' + userId: userId + '-' + otherId));
					var chatRoom = new Chat(privateRoom, publicRoom, otherId);
					//var contents = chatRoom.render();
					this.$('#chat-wrapper').append(chatRoom.$el);
				}
			});

		},

		loadProfileData: function(){
			debugger;
		},

		openRoom: function(otherId) {
			var userId = api.getUserId();
			if (otherId !== userId){
				var roomRefMine = new Firebase(firebase + '/rooms/' + userId + '/' + otherId);
				roomRefMine.set({'visible': true});
			}
		},

	});
	return new ChatManager;
});