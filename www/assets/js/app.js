Backendless.initApp("8364C802-B6B5-F3C4-FF3E-B48D04222A00", "AE8854AA-AFB4-1DB7-FF7A-87AED2E58000");

var app = {
	storage: {},
	events: {},
	display: {},
	debug: {},
	data: {
		activeTasks: [],
		deleteQueue: [],
		deletionGrace: 0
	},
	util: {}
}

const DEFAULT_NEGATIVE = 0;
const DEFAULT_NEUTRAL = 1;
const DEFAULT_POSITIVE = 2;
const NEGATIVE_DEFAULT = 3;
const NEGATIVE_NEUTRAL = 5;
const NEGATIVE_POSITIVE = 5;
const NEUTRAL_DEFAULT = 6;
const NEUTRAL_NEGATIVE = 7;
const NEUTRAL_POSITIVE = 8;
const POSITIVE_DEFAULT = 9;
const POSITIVE_NEUTRAL = 10;
const POSITIVE_NEGATIVE = 11;

document.addEventListener("deviceready", app.events.onDeviceReady, false);

app.debug = function(str) {
	console.log(str);
}

app.util.eventHandler = function(func, ...args) {
	return function() {
		func(args);
	}
}

app.util.inArray = function(array, value) {
	return $.inArray(value, array) != -1;
}

app.util.randomItemFromArray = function(array) {
	var item = array[Math.floor(Math.random() * array.length)];
	return item
}

app.storage.setItem = function(key, value) {
	window.localStorage.setItem(key, value);
}

app.storage.getItem = function(key) {
	return window.localStorage.getItem(key);
}

app.storage.getKeyFromIndex = function(index) {
	return window.localStorage.key(index);
}

app.storage.getItemFromIndex = function(index) {
	var key = app.storage.getKeyFromIndex(index);
	var value = app.storage.getItem(key);

	return {key, value}
}

app.events.setupListeners = function() {
	app.debug("app.events.setupListeners");
	document.addEventListener("resume", app.events.onResume, false);
	document.addEventListener("pause", app.events.onPause, false);
	document.addEventListener("online", app.events.onOnline, false);
	document.addEventListener("offline", app.events.onOffline, false);
	$(document).on("click", "#task-add", app.data.createTask);
	$(document).on("click", "#task-generate", app.data.generateTasks)
}

app.events.setupIntervals = function() {
	setInterval(function() {
		if (app.data.deletionGrace >= 0) {
			app.data.deletionGrace -= 1;
		}

		if (app.data.deletionGrace == 0) {
			app.display.updateTaskList(app.data.activeTasks);
		}
	}, 100);
}

app.events.onDeviceReady = function() {
	app.debug("app.events.onDeviceReady");
	app.events.setupListeners();
	app.events.setupIntervals();
	app.display.doJQueryMobileOverrides();
	app.data.fetchTasks();
}

app.events.onPause = function() {
	app.debug("app.events.onPause");
}

app.events.onResume = function() {
	app.debug("app.events.onResume");
}

app.events.onPageShow = function() {
	app.debug("app.events.onPageShow");
}

app.display.doJQueryMobileOverrides = function() {
	$("#task-add").parent().html("");
	$("#task-generate").parent().html("");
	$("h1").each(function() {
		if ($(this).text() == "loading") {
			$(this).text("");
		}
	});
}

app.display.updateTaskList = function(tasks) {
	app.debug("app.display.updateTaskList");

	$("#task-list").empty();
	for (var i = 0; i < tasks.length; i++) {
		$("#task-list").append("<li><span class=\"task-number\">" + i + "</span><input id=\"title-" + tasks[i].objectId + "\" type=\"text\" value=\"" + tasks[i].task + "\" class=\"task-title\"><i class=\"fa fa-chevron-circle-up update-icon\"></i><input id=\"update-" + tasks[i].objectId + "\" type=\"button\" value=\"\" class=\"task-update button\"><i class=\"fa fa-bomb delete-icon\"></i><input id=\"delete-" + tasks[i].objectId + "\" type=\"button\" value=\"\" class=\"task-delete button-neutral\"></li>");
		$("#update-" + tasks[i].objectId).click(app.util.eventHandler(app.data.updateTask, tasks[i].objectId));
		$("#delete-" + tasks[i].objectId).click(app.util.eventHandler(app.data.deleteTask, tasks[i].objectId));
	}

	$("#task-list").listview("refresh");
}

app.display.phaseButton = function(element, type, textToShow, revertAfterDelay) {
	app.debug("app.display.phaseButton");

	var wasDisabled = element.prop("disabled");
	var oldText = element.val();
	var oldClass = "button-neutral"
	var newClass = "button-neutral"

	switch(type) {
		case DEFAULT_NEGATIVE:
			oldClass = "button";
			newClass = "button-negative";
			break;
		case DEFAULT_NEUTRAL:
			oldClass = "button";
			newClass = "button-neutral";
			break;
		case DEFAULT_POSITIVE:
			oldClass = "button";
			newClass = "button-positive";
			break;
		case NEGATIVE_DEFAULT:
			oldClass = "button-negative";
			newClass = "button";
			break;
		case NEGATIVE_NEUTRAL:
			oldClass = "button-negative";
			newClass = "button-neutral";
			break;
		case NEGATIVE_POSITIVE:
			oldClass = "button-negative";
			newClass = "button-positive";
			break;
		case NEUTRAL_DEFAULT:
			oldClass = "button-neutral";
			newClass = "button";
			break;
		case NEUTRAL_NEGATIVE:
			oldClass = "button-neutral";
			newClass = "button-negative";
			break;
		case NEUTRAL_POSITIVE:
			oldClass = "button-neutral";
			newClass = "button-positive";
			break;
		case POSITIVE_DEFAULT:
			oldClass = "button-positive";
			newClass = "button-default";
			break;
		case POSITIVE_NEGATIVE:
			oldClass = "button-positive";
			newClass = "button-negative";
			break;
		case POSITIVE_NEUTRAL:
			oldClass = "button-positive";
			newClass = "button-neutral";
			break;
	}

	element.removeClass(oldClass);
	element.addClass(newClass);
	element.attr("disabled", true);
	element.attr("value", textToShow);

	if (revertAfterDelay) {
		window.setTimeout(function() {
			element.removeClass(newClass);
			element.addClass(oldClass);
			element.attr("disabled", wasDisabled);
			element.attr("value", oldText);
		}, 800);
	}
}

app.data.generateTasks = function() {
	app.debug("app.data.generateTasks");

	var verbs = ["Eat", "Shoot", "Swallow", "Unlock", "Activate", "Smash", "Question", "Discover", "Destroy", "Bang"];
	var determiners = ["a", "the", "every", "this"];
	var adjectives = ["smelly", "great", "big", "small", "hairy", "brown", "strong", "pretty", "handsome", "powerful", "rotten"];
	var nouns = ["cat", "wall", "hammer", "dog", "wallet", "jar of dirt", "bean", "human leg"];

	for (var i = 0; i < 20; i++) {
		var verb = app.util.randomItemFromArray(verbs);
		var determiner = app.util.randomItemFromArray(determiners);
		var adjective = app.util.randomItemFromArray(adjectives);
		var noun = app.util.randomItemFromArray(nouns);
		var title = verb + " " + determiner + " " + adjective + " " + noun + ".";
		var data = {task: title};

		var taskStorage = Backendless.Data.of("Tasks");
		taskStorage.save(data).then(saveTasks).catch(app.data.handleError);
		function saveTasks(savedTask) {
			app.debug(savedTask)
		}
	}

	app.display.phaseButton($("#task-generate"), DEFAULT_POSITIVE, "Generating..", true)
	app.data.fetchTasks();
}

app.data.createTask = function() {
	app.debug("app.data.createTask");

	var data = {task: $("#task-input").val()}

	if (data.task != "") {
		var taskStorage = Backendless.Data.of("Tasks");
		taskStorage.save(data).then(saveTasks).catch(app.data.handleError);

		function saveTasks(savedTask) {
			app.debug(savedTask)
			$("#task-input").attr("value", "");
			app.display.phaseButton($("#task-add"), NEUTRAL_POSITIVE, "Successfully added!", true)
			app.data.fetchTasks();
		}
	} else {
		app.display.phaseButton($("#task-add"), NEUTRAL_NEGATIVE, "Enter some text..", true)
	}
}

app.data.fetchTasks = function() {
	app.debug("app.data.fetchTasks");

	var taskStorage = Backendless.Data.of("Tasks");
	var queryBuilder = Backendless.DataQueryBuilder.create();
	queryBuilder.setSortBy(["created desc"]);
	queryBuilder.setPageSize(100);
	taskStorage.find(queryBuilder).then(processResults).catch(app.data.handleError);
	function processResults(tasks) {
		app.display.updateTaskList(tasks)
		app.data.activeTasks = tasks;
	}
}

app.data.updateTask = function(objectId) {
	app.debug("app.data.updateTask");

	var shouldContinue = true;
	var data = {
		objectId: objectId[0],
		task: $("#title-" + objectId).val()
	}

	$.each(app.data.deleteQueue, function(index, value) {
		if (objectId[0] == value) {
			shouldContinue = false;
		}
	});

	if (shouldContinue) {
		if (data.task != "") {
			var taskStorage = Backendless.Data.of("Tasks");
			taskStorage.save(data).then(saveTasks).catch(app.data.handleError);
			function saveTasks(savedTask) {
				app.debug(savedTask);
				app.display.phaseButton($("#update-" + objectId), DEFAULT_POSITIVE, "", true);
			}
		} else {
			app.display.phaseButton($("#update-" + objectId), DEFAULT_NEGATIVE, "", true);
		}
	}
}

app.data.deleteTask = function(objectId) {
	app.debug("app.data.deleteTask");
	app.display.phaseButton($("#delete-" + objectId), NEUTRAL_NEGATIVE, "", false);
	app.data.deleteQueue.push(objectId);

	var taskStorage = Backendless.Data.of("Tasks");
	taskStorage.remove({objectId: objectId}).then(deleteTask).catch(app.data.handleError);
	function deleteTask(deletionTime) {
		if (deletionTime) {
			$.each(app.data.activeTasks, function(index, value) {
				if (value) {
					if (value.objectId == objectId[0]) {
						app.data.activeTasks.splice(index, 1);
					}
				}
			});

			app.data.deletionGrace = 6;
		}
	}
}

app.data.handleError = function(e) {
	app.debug(e)
}

window.onload = function() {
	app.events.onDeviceReady();
}
