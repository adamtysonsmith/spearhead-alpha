///////////////////////////////////////////////
// Data initialization variables
///////////////////////////////////////////////
var allProjects = [];

var firstNote = new Note('This is your first note!');
var firstTask = new Task('This is your first task', [firstNote]);
var secondNote = new Note('This is another note!');
var secondTask = new Task('This is another task', [secondNote]);

var stageOne = new Stage('Sketch UI', [firstTask]);
var stageTwo = new Stage('Develop CSS', [secondTask]);
var stageOnePup = new Stage('Meet Client', [firstTask]);
var stageTwoPup = new Stage('Get Paid', [secondTask]);
var stageThreePup = new Stage('Design', [secondTask]);

var defaultProject1 = new Project('Midterm Project','07/01/2015','07/16/2015', [stageOne, stageTwo]);
var defaultProject2 = new Project('Website Design for Pup n\' Suds','08/01/2015','08/30/2015', [stageOnePup, stageTwoPup, stageThreePup]);

allProjects.push(defaultProject1, defaultProject2);


// Compile Handlebars Templates
var projectInfoTemplate = $('#project-info-template').text();
var tasksTemplate = $('#tasks-template').text();
var notesTemplate = $('#notes-template').text();

var renderProjectInfoTemplate = Handlebars.compile(projectInfoTemplate);
var renderTasksTemplate = Handlebars.compile(tasksTemplate);
var renderNotesTemplate = Handlebars.compile(notesTemplate);

var renderProjectTemplates = function(project, stage, task) {
    
    console.log('Triggered Render templates');
    $('.project-info').html(renderProjectInfoTemplate(project));
    
    // Nuke and repave Pipeline
    $('.pipeline-container').html('');
    initPipeline();
    drawPipeline(project.stages);
    
    $('.tasks-container').html(renderTasksTemplate(stage));
    $('.notes-container').html(renderNotesTemplate(task));
}


///////////////////////////////////////////////
// D3 Waterfall Visualization
///////////////////////////////////////////////

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
        .attr('data-project', function(d, i) {
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
// D3 Stage Pipeline Visualization
///////////////////////////////////////////////
var drawPipeline;

var initPipeline = function() {
    // Layout variables
    var width = 1000;
    var height = 100;
    //var sidePadding = 0;
    //var topPadding = 0;

    // Create a selection for the svgContainer
    var svgPipelineContainer = d3.selectAll('.pipeline-container').append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr('preserveAspectRatio','xMidYMid')
        .attr("class", "project-pipeline");
    
    // Create a color scale
    var pipelineColorScale = d3.scale.linear()
        .domain([0, 10])
        .range(['#1199BF', '#12BF25'])
        .interpolate(d3.interpolateHcl);
    
    drawPipeline = function(data) {
        // Append our polygon groups and specify data to be entered
        var polyGroup = svgPipelineContainer.append('g')
            .classed('stage-item-group', true)
            .selectAll('polygon')
            .data(data)
            .enter();
        
        var polys = polyGroup.insert('polygon', ':first-child')
            .classed('stage-item', true)
            .style('stroke','white')
            .style('stroke-width', 2)
            .style('fill', function(d, i) {
                return d3.rgb(pipelineColorScale(i));
            })
            .attr('points', function(d, i) {
                var points = [[0,0],[150,0],[170,30],[150,60],[0,60]];
                
                if (i === 0) {
                    return points.join(' ');
                } else {
                    points[0][0] = points[0][0] + i * 150;
                    points[1][0] = points[1][0] + i * 150;
                    points[2][0] = points[2][0] + i * 150;
                    points[3][0] = points[3][0] + i * 150;
                    points[4][0] = points[4][0] + i * 150;
                }
                
                return points.join(' ');
            })
            .attr('data-stage', function(d, i) {
                return i;
            });
            
            var polyText = polyGroup.append('text')
                .classed('stage-text',true)
                .attr('font-size','14')
                .attr('fill','white')
                .attr('y', 35)
                .attr('x', function(d, i) {
                    var x = 20;
                    if (i === 0) {
                        return x;
                    } else {
                        x = x + (i * 150) + 20;
                    }
                    return x;
                })
                .text(function(d) {
                    return d.name;
                });
        
            // Event Handlers on Polygons
            polys.on('mouseover', function() {
                var self = d3.select(this);
                var currentFill = self.style('fill');

                self.style('fill', function(){
                    return d3.rgb(currentFill).darker(1);
                });
            }).on('mouseout', function() {
                var self = d3.select(this);
                var currentFill = self.style('fill');

                self.style('fill', function(){
                    return d3.rgb(currentFill).brighter(1);
                });
            }).on('click', function(d, i) {
                var index = i;
                var self = d3.select(this);
                var currentColor;
                var x1 = 0;
                var x2 = 150;
                var stroke = 'black';
                
                // Remove all lines
                d3.selectAll('.active-stage').remove();
                console.log('All lines removed');
                
                // Add line under this polygon
                d3.selectAll('.stage-item-group').append('line', '.stage-item-group')
                    .classed('active-stage', true)
                    .attr('y1', '70')
                    .attr('y2', '70')
                    .style('stroke-width', 6)
                    .style('stroke', stroke)
                    .attr('x1', function() {
                        if (index === 0) {
                            return x1;
                        } else {
                            x1 = x1 + index * 150;
                            return x1;
                        }
                    })
                    .attr('x2', function() {
                        if (index === 0) {
                            return x2;
                        } else {
                            x2 = x2 + index * 150;
                            return x2;
                        }
                    });
                console.log('Line Added!');
            });

    } // End drawPipeline()
} // End initPipleline Function




///////////////////////////////////////////////
// Projects Initialization and Event Handlers
///////////////////////////////////////////////

$(document).ready(function() {
    //////////////////////////////////////////
    // Initializations
    //////////////////////////////////////////
    location.hash = '#';
//    var hash = location.hash.split('/');
//    var projectIndex = hash[0].slice(9);
//    var stageIndex = hash[1].slice(6);
//    var taskIndex = hash[2].slice(5);
    
    buildWaterfallNav(allProjects);
    initPipeline();
    
    //////////////////////////////////////////
    // Navigation
    //////////////////////////////////////////
    
    // Navigation: Waterfall Bars
    // #project=[index]/stage=0/task=0
    $('body').on('click', '.project-bar', function() {
        var projectIndex = $(this).attr('data-project');
        location.hash = 'project=' + projectIndex + '/stage=0/task=0';
    });
    
    // Navigation: Project Stages
    // #project=1/stage=[index]/task=0
    $('body').on('click', '.stage-item', function() {
        var stageIndex = $(this).attr('data-stage');
        console.log('Stage index is', stageIndex);
        var currentHash = location.hash.split('/');
        currentHash[1] = 'stage=' + stageIndex;
        location.hash = currentHash.join('/');
    });

    // Navigation: Project Tasks
    // #project=1/stage=2/task=[index]
    $('body').on('click', '.task', function() {
        var taskIndex = $(this).attr('data-task');
        console.log('Task index is', taskIndex);
        var currentHash = location.hash.split('/');
        currentHash[2] = 'task=' + taskIndex;
        location.hash = currentHash.join('/');
    });
    

    // Hash Change Logic
    $(window).on('hashchange', function(e) {
        // Create our hash array
        var hash = location.hash.split('/');
        var projectIndex = hash.length > 2 ? hash[0].slice(9) : null;
        var stageIndex = hash.length > 2 ? hash[1].slice(6) : null;
        var taskIndex = hash.length > 2 ? hash[2].slice(5) : null;
        
        console.log('Full hash is', hash);
        console.log('Project Index is', projectIndex);
        console.log('Stage Index is', stageIndex);
        console.log('Task Index is', taskIndex);
        // projectIndex >= 0 && projectIndex !== ''
        
        if (projectIndex >= 0 && projectIndex !== '' && projectIndex !== null) {
            // If hash is #project=[index]/stage=0/task=0 (You are showing the project details)
            // Hide waterfall and render project detail templates
            $('#waterfall-large').hide();
            renderProjectTemplates(
                allProjects[projectIndex], 
                allProjects[projectIndex].stages[stageIndex],
                allProjects[projectIndex].stages[stageIndex].tasks[taskIndex]
            );

            // Update Active task highlighting based on hash
            $('.task').each(function(index, value){
                if(index == taskIndex) {
                    $(this).css('background-color', 'rgb(255, 223, 163)');
                }
            });
            
            // Update Active stage highlighting based on hash
            $('.stage-item').each(function(index, value){
                if(index == stageIndex) {
                    // Works - Need to think about how to add line
                    // $(this).append('fill', 'cadetblue');
                }
            });
            
            
        }  else {
            // If hash is # (You are showing the waterfall nav)
            // Empty our templates
            $('.project-info').html('');
            $('.pipeline-container').html('');
            $('.tasks-container').html('');
            $('.notes-container').html('');
            
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
        
        var newProject = new Project(name, startDate, dueDate, [stageOne, stageTwo]);
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
    
    // Project Detail View: Add Stage
    $('body').on('click', '.add-stage-button', function() {
        $('.add-stage-input').show().focus();
    });
    
    $('body').on('keypress focusout', '.add-stage-input', function(e) {
        var hash = location.hash.split('/');
        var projectIndex = hash[0].slice(9);
        var stageIndex = hash[1].slice(6);
        var taskIndex = hash[2].slice(5);
        
        var name;
        
        if ((e.which === 13) || (e.type === 'focusout')) {
            name = $(this).val();
            // Reset the input field & Hide textarea
            $(this).val('');
            $(this).hide();
            
            // Then, if there is actually content we save it
            if (name.length > 0) {
                newStage = new Stage(name, [firstTask]);
                allProjects[projectIndex].stages.push(newStage);
                renderProjectTemplates(
                    allProjects[projectIndex], 
                    allProjects[projectIndex].stages[stageIndex],
                    allProjects[projectIndex].stages[stageIndex].tasks[taskIndex]
                );
            }
        }
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
//    $('body').on('click', '.task', function() {
//        $('.task').removeClass('active-task');
//        $(this).addClass('active-task');
//        // Not working
//    });
    
    // Project Detail View: Add Tasks
    $('body').on('click', '.add-task-button', function() {
        $('.add-task-container').show();
        $('.add-task-input').focus();
    });
    
    $('body').on('keypress focusout', '.add-task-input', function(e) {
        var hash = location.hash.split('/');
        var projectIndex = hash[0].slice(9);
        var stageIndex = hash[1].slice(6);
        var taskIndex = hash[2].slice(5);
        
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
                allProjects[projectIndex].stages[stageIndex].tasks.push(newTask);
                renderProjectTemplates(
                    allProjects[projectIndex], 
                    allProjects[projectIndex].stages[stageIndex],
                    allProjects[projectIndex].stages[stageIndex].tasks[taskIndex]
                );
            }
        }
    });
    
    // Project Detail View: Add Notes
    $('body').on('click', '.add-note-button', function() {
        $('.add-note-container').show();
        $('.add-note-input').focus();
    });
    
    $('body').on('keypress focusout', '.add-note-input', function(e) {
        var hash = location.hash.split('/');
        var projectIndex = hash[0].slice(9);
        var stageIndex = hash[1].slice(6);
        var taskIndex = hash[2].slice(5);
        
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
                allProjects[projectIndex].stages[stageIndex].tasks[taskIndex].notes.push(newNote);
                renderProjectTemplates(
                    allProjects[projectIndex], 
                    allProjects[projectIndex].stages[stageIndex],
                    allProjects[projectIndex].stages[stageIndex].tasks[taskIndex]
                );
            }
        }
    });
    
}); // End Ready