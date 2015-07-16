///////////////////////////////////////////////
// Data initialization variables
///////////////////////////////////////////////
var allProjects = [];

var firstNote = new Note('This is your first note!');
var firstTask = new Task('This is your first task', [firstNote]);
var stageOne = new Stage('Stage 1', [firstTask]);
var defaultProject = new Project('Example Project','07/01/2015','07/30/2015', [stageOne]);

allProjects.push(defaultProject);


// Compile Handlebars Template
var projectDetailsTemplate = $('#project-detail-view-template').text();
var renderProjectDetailsTemplate = Handlebars.compile(projectDetailsTemplate);


///////////////////////////////////////////////
// D3 Waterfall Visualization
///////////////////////////////////////////////

///////////////////////////////////////
// Test Data 
///////////////////////////////////////
//var testData = [
//    { name: 'Design Website', startDate: '2015-06-01', dueDate: '2015-07-05'},
//    { name: 'Logo Mockup', startDate: '2015-07-01', dueDate: '2015-07-31'},
//    { name: 'Build Plugin', startDate: '2015-07-20', dueDate: '2015-09-10'},
//    { name: 'Write Script', startDate: '2015-07-15', dueDate: '2015-09-30'},
//    { name: 'Redesign Database', startDate: '2015-08-15', dueDate: '2015-10-15'},
//    { name: 'Design Website', startDate: '2015-06-01', dueDate: '2015-07-05'},
//    { name: 'Logo Mockup', startDate: '2015-07-01', dueDate: '2015-07-31'},
//    { name: 'Design Website', startDate: '2015-07-10', dueDate: '2015-09-25'}
//];


///////////////////////////////////////
// Visualization Variables and Scales
///////////////////////////////////////

// Layout variables
var width = 1200;
var height = 500;
var sidePadding = 0;
var topPadding = 0;

// Create a selection for the svgContainer
var svgContainer = d3.selectAll('#waterfall-large').append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', '0 0 ' + width + ' ' + height)
    .attr('preserveAspectRatio','xMidYMid')
    .attr("class", "svg-container");

// Format the dates and times
var dateFormat = d3.time.format('%Y-%m-%d');
var timeFormat = d3.time.format('%b %e, %Y');

// Return minimum and maximum dates
var min = d3.min(allProjects, function(d) {
    return dateFormat.parse(d.startDate);
});
var max = d3.max(allProjects, function(d) {
    return dateFormat.parse(d.dueDate);
});

// Pass the min and max dates, create our time scale
var timeScale = d3.time.scale().domain([min, max]).range([40, width - 40]);

// Create a color scale for our bars
var colorScale = d3.scale.linear()
    .domain([0, allProjects.length])
    .range(['#1199BF', '#12BF25'])
    .interpolate(d3.interpolateHcl);


///////////////////////////////////////
// Visualization Functions
///////////////////////////////////////

// Function to draw the timeline axis and gridlines
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
        .selectAll('text')  
        .style('text-anchor', 'middle')
        .attr('fill', '#000')
        .attr('stroke', 'none')
        .attr('font-size', 10);
    
    return ticks;
    
} // End drawAxis()


// Function to draw the bars and labels
function drawBars(data, theGap, theTopPad, theSidePad, theBarHeight, theColorScale, w, h) {
    
    // Append our bars
    var barGroup = svgContainer.append('g')
        .selectAll('rect')
        .data(data)
        .enter();

   var bars = barGroup.append('rect')
        .classed('project-bar', true)
        .attr('data-index', function(d, i) {
            return i;
        })
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('x', function(d){
            return timeScale(dateFormat.parse(d.startDate)) + theSidePad;
        })
        .attr('y', function(d, i){
            return i * theGap + theTopPad;
        })
        .attr('width', function(d){
            return (timeScale(dateFormat.parse(d.dueDate)) - timeScale(dateFormat.parse(d.startDate)));
        })
        .attr('height', theBarHeight)
        .attr('stroke', 'none')
        .attr('fill', function(d, i){
            return d3.rgb(theColorScale(i));
        });
   

    var barText = barGroup.append('text')
        .text(function(d){
            return d.name;
        })
        .attr('x', function(d){
            return timeScale(dateFormat.parse(d.startDate)) + 15;
            //return (timeScale(dateFormat.parse(d.dueDate)) - timeScale(dateFormat.parse(d.startDate))) / 2 + timeScale(dateFormat.parse(d.startDate)) + theSidePad;
        })
        .attr('y', function(d, i){
            return i * theGap + 25 + theTopPad;
        })
        .attr('font-size', 14)
        //.attr("text-anchor", "left")
        .attr('text-height', theBarHeight)
        .attr('fill', '#fff');

    // Event Handlers on bars
    bars.on('mouseover', function() {
        var self = d3.select(this);
        var currentFill = self.attr('fill');
        
        self.attr('fill', function(){
            return d3.rgb(currentFill).darker(1);
        });
    }).on('mouseout', function() {
        var self = d3.select(this);
        var currentFill = self.attr('fill');
        
        self.attr('fill', function(){
            return d3.rgb(currentFill).brighter(1);
        });
    });

    // Event Handlers on text
    barText.on('mouseover', function(d, i) {
        var selfBar = d3.select(this.parentNode.childNodes[i]);
        var currentFill = selfBar.attr('fill');
        
        selfBar.attr('fill', function(){
            return d3.rgb(currentFill).darker(1);
        });
        
    }).on('mouseout', function(d, i) {
        var selfBar = d3.select(this.parentNode.childNodes[i]);
        var currentFill = selfBar.attr('fill');
        
        selfBar.attr('fill', function(){
            return d3.rgb(currentFill).brighter(1);
        });
    });
    
} // End drawBars()


// Function to build our Waterfall Nav
var buildWaterfallNav = function(data) {
    // Finally, draw our axis!
    drawAxis(0, 0, width, height);
    
    // Finally, draw our bars!
    // @params: data, theGap, theTopPad, theSidePad, theBarHeight, theColorScale, width, height
    drawBars(data, 50, 0, 0, 40, colorScale, width, height);
}






///////////////////////////////////////////////
// Projects Initialization and Event Handlers
///////////////////////////////////////////////

$(document).ready(function() {
    //////////////////////////////////////////
    // Initializations
    //////////////////////////////////////////
    location.hash = '#';
    buildWaterfallNav(allProjects);
    
    
    //////////////////////////////////////////
    // Navigation
    //////////////////////////////////////////
    
    // Navigation: Waterfall Bars
    $('body').on('click', '.project-bar', function() {
        var projectIndex = $(this).attr('data-index');
        location.hash = projectIndex;
    });
    
    // Navigation: Project Stages
    $('body').on('click', '.project-bar', function() {
//        // Get the data index and update URL hash
//        var dataIndex = $(this).attr('data-index');
//        location.hash = dataIndex;
    });
    
    // Navigation: Project Tasks
    $('body').on('click', '.project-bar', function() {
//        // Get the data index and update URL hash
//        var dataIndex = $(this).attr('data-index');
//        location.hash = dataIndex;
    });
    
    // Hash Change Logic
    $(window).on('hashchange', function(e) {
        var projectIndex = location.hash.substring(1);
        var stageIndex;
        var taskIndex;
            
        console.log(projectIndex);
        
        if (projectIndex >= 0 && projectIndex !== '') {
        // If hash is #project=123 (You are showing the project details)
            // Hide waterfall and render detail template
            $('#waterfall-large').hide();
            return $('#project-detail-view').html(renderProjectDetailsTemplate(allProjects[projectIndex]));
            // Breaks out of this function
        //} else if () {
        // If hash is #project=123/#stage=10 (You are showing the tasks for the stage)
        //} else if () {
        // If hash is #123/#stage=10/#task=20 (You are showing the notes for the task)
        }  else {
        // If hash is # (You are showing the waterfall nav)
            // Remove detail view, and show the hidden waterfall nav
            $('#project-detail-view').html('');
            $('#waterfall-large').show();
        }
    });
    
    
    //////////////////////////////////////////
    // Project Main View
    //////////////////////////////////////////
    
    // Project Main View:  'Add Project'
    $('#project-start-date').datepicker();
    $('#project-due-date').datepicker();
    
    $('body').on('click', '#save-new-project', function() {
        var name = $('#project-name').val();
        var startDate = $('#project-start-date').val();
        var dueDate = $('#project-due-date').val();
        
        var newProject = new Project(name, startDate, dueDate);
        allProjects.push(newProject);
        
        // Remove the current waterfall and build a new one
        buildWaterfallNav(allProjects);
        
        // Reset the input fields
        $('#project-name').val('');
        $('#project-start-date').val('');
        $('#project-due-date').val('');
        
        console.log('New Project Saved!', name, startDate, dueDate);
    });
    
    // Project Main View:  'Cancel Project'
    $('body').on('click', '#cancel-new-project', function() {
        console.log('New Project Canceled =(');
    });
    
    
    //////////////////////////////////////////
    // Project Detail View
    //////////////////////////////////////////
    
    // Project Detail View: Stage Hover & Active
    $('body').on('mouseover', '.stage-item-group', function() {
        $(this).find('.stage-item').hide();
    }).on('mouseleave', '.stage-item-group', function() {
        $(this).find('.stage-item').show();
    });
    
    $('body').on('click', '.stage-item-group', function() {
        console.log('Should be active');
        $('.stage-item-active').css('stroke','white');
        var underlineColor = $(this).find('.stage-item').css('fill');
        $(this).find('.stage-item-active').css('stroke', underlineColor);
    });
    
    // Project Detail View: Task Checkbox
    $('body').on('click', '.custom-checkbox', function() {
        if ($(this).hasClass('checked')) {
            $(this).removeClass('checked');
            $(this).next().removeClass('strike-through');
        } else {
            $(this).addClass('checked');
            $(this).next().addClass('strike-through');
        }
        // Now perform a sort and move the checked tasks to bottom
    });
    
    // Project Detail View: Active Task Highlight
    $('body').on('click', '.task', function() {
        $('.task').removeClass('active-task');
        $(this).addClass('active-task');
        // Give me the task data index
        // render the relevant notes
    });
    
    // Project Detail View: Add Tasks
    $('body').on('click', '.add-task-button', function() {
        $('.add-task-container').show();
        $('.add-task-input').focus();
    });
    
    $('body').on('keypress focusout', '.add-task-input', function(e) {
        var hash = location.hash.substring(1);
        var content;
        var newTask;
        
        if ((e.which === 13) || (e.type === 'focusout')) {
            content = $(this).val();
            // Reset the input field & Hide textarea
            $(this).val('');
            $(this).parent().hide();
            
            // Then, if there is actually content we save it
            if (content.length > 0) {
                newTask = new Task(content,[]);
                allProjects[hash].stages[0].tasks.push(newTask);
                $('#project-detail-view').html(renderProjectDetailsTemplate(allProjects[hash]));
                // allProjects[hash].stages[currentStage].tasks[currentTask].notes[].push(newNote);
            }
        }
    });
    
    // Project Detail View: Add Notes
    $('body').on('click', '.add-note-button', function() {
        $('.add-note-container').show();
        $('.add-note-input').focus();
    });
    
    $('body').on('keypress focusout', '.add-note-input', function(e) {
        var hash = location.hash.substring(1);
        var content;
        var newNote;
        
        if ((e.which === 13) || (e.type === 'focusout')) {
            content = $(this).val();
            // Reset the input field & Hide textarea
            $(this).val('');
            $(this).parent().hide();
            
            // Then, if there is actually content we save it
            if (content.length > 0) {
                newNote = new Note(content);
                allProjects[hash].stages[0].tasks[0].notes.push(newNote);
                $('#project-detail-view').html(renderProjectDetailsTemplate(allProjects[hash]));
            // allProjects[hash].stages[currentStage].tasks[currentTask].notes[].push(newNote);
            }
        }
    });
    
}); // End Ready