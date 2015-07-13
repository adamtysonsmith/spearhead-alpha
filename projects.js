///////////////////////////////////////////////
// Spearhead: Data Modeling, Classes
///////////////////////////////////////////////
// The scope of this data model is one user with localStorage in the broswer

///////////////////////////////////////////////
// Relationships
///////////////////////////////////////////////

// Projects
    // hasMany StagesTasks

// Stages
    // belongsTo on Project
    // hasMany Tasks

// Tasks
    // belongTo one Project
    // blongsTo one Stage
    // hasMany Notes
    // hasMany Subtasks

// Notes                        // Subtask
    // belongTo one Project         // belongsTo one task
    // blongsTo one Stage
    // belongTo one Task


///////////////////////////////////////////////
// Properties
///////////////////////////////////////////////

// Actual vs. User Defined
    // Actual properties are calculated based on events (tasks completed, stage completed)
    // User defined props are up to the user to enforce (project start date).  There is no way to know when they actually started.
        // The user must explicitly choose to "Start" a project so the tracking is accurate.
        // Maybe the first time clicking on a project you need to click a button to start the project
        // Maybe you can add tasks & notes but you cannot check one off until the project has been "started"

// The more properties that are user defined, the more innacurate our data will be. Minimize user defined properties.
// This app is only valuable to people if they actually use it.
// It needs to be a joy to use, so that people can get value from it.


// Project:
    // name
    // duration
    // startDate
    // dueDate
    // timestamp
    // isStarted
    // isActive: bool
    // isAbandoned
    // isCompleted
    // isDeferred
    // stages array

    // start date gives the user more control if they are adding a project to be started in the future
    // end date = startDate + duration? This will need to be calcuated.  This is the actual calculated end date based on tasks
    // the due date is the estimated end date
    // duration is the calculated accumulated task duration
    // The project states will need to be represented in the waterfall UI along with dueDate, and actual endDate


// Stage:
    // name
    // duration - calculated based on tasks
    // startDate - the moment the first task was checked
    // dueDate - calculated based on tasks
    // timestamp - when the stage was instantiated
    // isStarted - Was the first task checked off?
    // isActive: bool
    // isCompleted
    // isDeferred - stages can be put on hold
    // tasks array
    
    // User must add tasks to estimate stage duration and all the other data

// Task:
    // content
    // duration - subtasks or/and calendar entry
    // timestamp
    // isCompleted
    // isDeferred
    // Notes Array

    // We dont really care about due dates and start dates of tasks, it only really matters for stages and projects IMO
    // When the user adds these tasks to the calendar, we can calculate the actual duration (startDate and endDate if we need them)

// Subtask:
    // content
    // duration
    // timestamp
    // isCompleted
    // isDeferred

// Note:
    // content
    // timestamp

    // Lives inside notes array in the parent task


///////////////////////////////////////////////
// Class helper functions
///////////////////////////////////////////////
var getTimestamp = function() {
    // YYYY-MM-DD_HH:MM:SS
    function format(n) {
        return n < 10 ? '0' + n
                      : ''  + n;
    }
    function formatMonth(m) {
        return parseInt(m, 10) + 1;
    }
    
    var date = new Date();
    var year = date.getFullYear();
    var month = format(formatMonth(date.getMonth()));
    var day = format(date.getDate());
    var hours = format(date.getHours());
    var minutes = format(date.getMinutes());
    var seconds = format(date.getSeconds());
    var time = hours + ':' + minutes + ':' + seconds;
    
    return year + '-' + month + '-' + day + '_' + time;
}

var getDuration = function() {
    return 'The duration is XXX';
}

var getDueDate = function() {
    return 'The due date is XXX';
}

///////////////////////////////////////////////
// Classes
///////////////////////////////////////////////

// This class may be instantiated without having the stages array to pass in
// We may need to push the stages later
var Project = function(name, startDate, dueDate, stages) {
    this.name = name;
    this.startDate = startDate;
    this.dueDate = dueDate;
    
    // Calculated Properties
    this.duration = getDuration();
    this.timestamp = getTimestamp();
    
    // Status tracking
    this.isStarted = false;
    this.isActive = false;
    this.isAbandoned = false;
    this.isCompleted = false;
    this.isDeferred = false;
    
    // Stages array
    this.stages = stages; //[]
}

// This class may be instantiated without having the tasks array to pass in
// We may need to push the tasks later
var Stage = function(name, tasks) {
    this.name = name;
    
    // Calculated Properties
    this.dueDate = getDueDate();
    this.duration = getDuration();
    this.timestamp = getTimestamp();
    
    // Status tracking
    this.startDate = undefined;
    this.isStarted = false;
    this.isActive = false;
    this.isCompleted = false;
    this.isDeferred = false;

    // Tasks array
    this.tasks = tasks; // []
}

// This class may be instantiated without having the notes array to pass in
// We may need to push the notes later
var Task = function(content, notes) {
    this.content = content;
    
    // Calculated Properties
    this.duration = getDuration();
    this.timestamp = getTimestamp();

    // Status Tracking
    this.isCompleted = false;
    this.isDeferred = false;
    
    // Notes array
    this.notes = notes; // []
}


 // Will inherit from task excluding notes array
var Subtask = function(content) {
    Task.call(this, content);
    this.notes = undefined;
}


var Note = function(content) { 
    this.content = content;
    this.timestamp = getTimestamp();
}