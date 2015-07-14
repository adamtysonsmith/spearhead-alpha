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



///////////////////////////////////////////////
// Waterfall Navigation
///////////////////////////////////////////////

$(document).ready(function() {
    var project1 = $('<div class="waterfall-large-project"><p>Project 1</p></div>');
    var project2 = $('<div class="waterfall-large-project"><p>Project 2</p></div>');
    var project3 = $('<div class="waterfall-large-project"><p>Project 3</p></div>');
    var project4 = $('<div class="waterfall-large-project"><p>Project 4</p></div>');
    var project5 = $('<div class="waterfall-large-project"><p>Project 5</p></div>');
    
    project1.css({
        position: 'relative',
        left: '0%',
        width: '12%',
        height: '30px',
        margin: '8px',
        backgroundColor: '#C3A5FF'
    });
    
    project2.css({
        position: 'relative',
        left: '2%',
        width: '18%',
        height: '30px',
        margin: '8px',
        backgroundColor: '#9B96E8'
    });
    
    project3.css({
        position: 'relative',
        left: '5%',
        width: '25%',
        height: '30px',
        margin: '8px',
        backgroundColor: '#B2C1FF'
    });
    
    project4.css({
        position: 'relative',
        left: '10%',
        width: '40%',
        height: '30px',
        margin: '8px',
        backgroundColor: '#96BCE8'
    });
    
    project5.css({
        position: 'relative',
        left: '26%',
        width: '50%',
        height: '30px',
        margin: '8px',
        backgroundColor: '#A5E6FF'
    });
    
    $('.waterfall-large').append(project1, project2, project3, project4, project5);
    
    $('#save-new-project').click(function() {
        var name = $('#project-name').val();
        var startDate = $('#project-start-date').val();
        var dueDate = $('#project-due-date').val();

//        return new Project(name, startDate, dueDate);
        console.log('New Project Saved!', name, startDate, dueDate);
    });
    
    $('#cancel-new-project').click(function() {
        console.log('New Project Canceled =(');
    });
    
}); // End Ready




///////////////////////////////////////////////
// D3 Waterfall Visualization
///////////////////////////////////////////////

/////////////////////////
// Test Data 
/////////////////////////
var testData = [
    { name: 'Design Website', startDate: '2014-07-01', dueDate: '2015-08-15'},
    { name: 'Logo Mockup', startDate: '2015-07-15', dueDate: '2015-08-15'},
    { name: 'Build Plugin', startDate: '2015-07-15', dueDate: '2015-08-15'},
    { name: 'Write Script', startDate: '2015-07-15', dueDate: '2015-08-15'},
    { name: 'Redesign Database', startDate: '2015-07-15', dueDate: '2015-08-15'}
];



/////////////////////////
// Visualization 
/////////////////////////

// Layout variables
var width = 1200;
var height = 500;
var sidePadding = 0;
var topPadding = 0;

// Create a selection for the svgContainer
var svgContainer = d3.selectAll(".waterfall-large-svg")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("class", "svg-container");


// Format the dates and times
var dateFormat = d3.time.format("%Y-%m-%d");
var timeFormat = d3.time.format('%b %e, %Y');

// Return minimum and maximum dates
var min = d3.min(testData, function(d) { 
    return dateFormat.parse(d.startDate);
});
var max = d3.max(testData, function(d) { 
    return dateFormat.parse(d.dueDate);
});

// Pass the min and max dates, create our time scale
var timeScale = d3.time.scale().domain([min, max]).range([40, width - 40]);


// Draw the Timeline Axis and Grid
var drawAxis = function(sidePadding, topPadding, width, height) {

    var interval = d3.time.day;
    var tickWidth = 100; // Set maximum tick width
    var maxTicks = width / tickWidth;
    var skip = Math.ceil(interval.range(min, max).length / maxTicks); // Reference our dynamic min and max
    
    var xAxis = d3.svg.axis()
        .scale(timeScale)
        .orient('bottom')
        .tickValues(interval.range(min, max).filter(function(d, i) {
            return !(i % skip);
        }))
        .tickSize(-height + topPadding + 20, 0, 0)
        .tickFormat(timeFormat);
    
    var ticks = svgContainer.append('g')
        .attr('class', 'grid')
        .attr('transform', 'translate(' + sidePadding + ', ' + (height - 50) + ')')
        .call(xAxis)
        .selectAll("text")  
        .style("text-anchor", "middle")
        .attr("fill", "#000")
        .attr("stroke", "none")
        .attr("font-size", 10);
    
    return ticks;
}

// Finally, draw our axis!
drawAxis(0, 0, width, height);

