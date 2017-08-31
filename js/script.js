//Making the settings for the visjs visualizer
$("#advancedPathButton").hide();

var nodes, edges, network, selected, advancedPaths, pathSelect, selectedLabel, portrait, hierarchicalLayout;
hierarchicalLayout = true;
advancedPaths = false;
portrait = false;
var options = {
  physics: {
    hierarchicalRepulsion: {
      centralGravity: 0.0,
      springLength: 200,
      springConstant: 0.005,
      nodeDistance: 120,
      damping: 0.09
    }
  },
  layout: {
    hierarchical: {
      direction: "UD",
      sortMethod: "directed"
    }
  },
  groups:{
    person: {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf007',
        size: 50,
        color: '#111'
      }
    },
    people: {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf0c0',
        size: 50,
        color: '#111'
      }
    },
    company: {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf1ad',
        size: 50,
        color: '#f25050'
      }
    }
  }
};
// create an array with nodes
nodes = new vis.DataSet();
nodes.add([
    {id: '1', label: 'New Company', group: 'company'}
]);
//
// create an array with edges
edges = new vis.DataSet();


// create a network
var container = document.getElementById('network');
var data = {
    nodes: nodes,
    edges: edges
};

network = new vis.Network(container, data, options);

/*nodes.on('*', function () {
    document.getElementById('nodes').innerHTML = JSON.stringify(nodes.get(), null, 4);
});

edges.on('*', function () {
    document.getElementById('edges').innerHTML = JSON.stringify(edges.get(), null, 4);
});*/

//Selecting nodes



network.on("select", function (params) {
  //console.log('select Event:', params);
  if (params.nodes.length > 0) {
    selected = params.nodes[0];
    updateNodeDropdownMenu();
  } else {
    selected = null;
  }
  if (selected != null) {
    selectedLabel = nodes._data[selected].label
    var indexOfSelectedInidPaths = arrayObjectIndexOf(idPaths, selected, "id");
    if (indexOfSelectedInidPaths != -1) {
      selectedLabel = idPaths[indexOfSelectedInidPaths].label;
    }
    document.getElementById("selected").textContent = selectedLabel;

  }
});

//Double clicking nodes lets you edit them
$( "#network" ).dblclick(function() {
  if (selected != null) {
    $("#myModal").modal();
    $("#info").hide();
    if (getParents(selected).length === 0) {
      $("#advancedPathButton").hide();
    } else {
      $("#advancedPathButton").show();
    }
  }
});

function addNode() {
  hideAdvancedPaths();
  if (selected != null) {
    var percent_label = document.getElementById('percent-label');
    var relationship_label = document.getElementById('relationship-label');
    var type_label = document.getElementById('type-label');
    var name_label = document.getElementById('name-label');

    var newNodeID = '_' + Math.random().toString(36).substr(2, 9);
    var newEdgeID = '_' + Math.random().toString(36).substr(2, 9);
    try {
      if ((!isPercentageValid(selected, parseFloat(percent_label.value)) && relationship_label.value === 'owner') || parseFloat(percent_label.value) > 100) {
        alert("Company ownership cannot exceed 100%")
      }

      //adds node depending on relationship
      else {
        nodes.add({
            id: newNodeID,
            group: type_label.value,
            label: name_label.value
        });
        if (relationship_label.value === 'owner') {
          edges.add({
              id: newEdgeID,
              from: newNodeID,
              to: selected,
              label: percent_label.value,
              arrows: 'to'
          });
        } else {
          edges.add({
              id: newEdgeID,
              from: selected,
              to: newNodeID,
              label: percent_label.value,
              arrows: 'to'
          });
        }
        updateNodeDropdownMenu();
        $('#myModal').modal("toggle");
      }
    }
    catch (err) {
        alert(err);
    }
  }
}

function addPerson() {
  hideAdvancedPaths();
  if (selected != null) {
    var percent_label = document.getElementById('percent-person');
    var relationship_label = document.getElementById('relationship-person');
    var type_label = document.getElementById('type-person');
    var name_label = document.getElementById('name-person');

    var newNodeID = '_' + Math.random().toString(36).substr(2, 9);
    //newNodeID = document.getElementById('name-label').value
    var newEdgeID = '_' + Math.random().toString(36).substr(2, 9);
    try {
      if ((!isPercentageValid(selected, parseFloat(percent_label.value)) && relationship_label.value === 'owner') || parseFloat(percent_label.value) > 100) {
        alert("Company ownership cannot exceed 100%")
      }

      //adds node depending on relationship
      else {
        nodes.add({
            id: newNodeID,
            group: type_label.value,
            label: name_label.value
        });
        if (relationship_label.value === 'owner') {
          edges.add({
              id: newEdgeID,
              from: newNodeID,
              to: selected,
              label: percent_label.value,
              arrows: 'to'
          });
        } else {
          edges.add({
              id: newEdgeID,
              from: selected,
              to: newNodeID,
              label: percent_label.value,
              arrows: 'to'
          });
        }
        updateNodeDropdownMenu();
        $('#myModal').modal("toggle");
      }
    }
    catch (err) {
        alert(err);
    }
  }
}

function editNode() {
  hideAdvancedPaths();
  if (selected != null) {
    try {
      nodes.update({
          id: selected,
          group: document.getElementById('type-edit-label').value,
          label: document.getElementById('name-edit-label').value
      });
      updateNodeDropdownMenu();
    }
    catch (err) {
        alert(err);
    }
  }
}

function deleteNode() {
  hideAdvancedPaths();
  if (selected != null) {
    try {
      nodes.remove({
          id: selected
      });
      for (edge in edges._data) {
        if (edges._data[edge].to == selected || edges._data[edge].from == selected) {
          edges.remove({id:edge});
        }
      }
      selected = null;
      updateNodeDropdownMenu();
    }
    catch (err) {
        alert(err);
    }
  }
}

function addEdge() {
  hideAdvancedPaths();
  var newEdgeID = '_' + Math.random().toString(36).substr(2, 9);
  var ownedID = document.getElementById('owner-edit-menu').value;
  var ownedPercent = document.getElementById('percent-edit-label').value;
  if (selected != null) {
    try {
      if (doesEdgeExist(ownedID, selected)) {
        if (isPercentageValid(ownedID, parseFloat(ownedPercent))) {
          edges.remove({
            id: getEdge(ownedID, selected)
          });
          edges.add({
            id: newEdgeID,
            from: selected,
            to: ownedID,
            label: ownedPercent,
            arrows: 'to'
          });
          $('#myModal').modal("toggle");
        } else {
          alert("Percentage owned cannot exceed 100%");
        }
      }
      else if (doesEdgeExist(selected, ownedID)) {
          if (isPercentageValid(ownedID, parseFloat(ownedPercent) - parseFloat(edges._data[getEdge(selected, ownedID)].label))) {
            var edgeID = getEdge(selected, ownedID)
            edges.update({
              id: edgeID,
              label: ownedPercent
            })
            $('#myModal').modal("toggle");
          } else {
            alert("Percentage owned cannot exceed 100%");
          }
      } else {
        if (isPercentageValid(ownedID, parseFloat(ownedPercent))) {
            edges.add({
                id: newEdgeID,
                from: selected,
                to: ownedID,
                label: ownedPercent,
                arrows: 'to'
            })
            updateNodeDropdownMenu();
            $('#myModal').modal("toggle");
        } else {
            alert("Percentage owned cannot exceed 100%");
       }
    }
  } catch(err) {
      alert(err)
    }
  }
}

var idPaths = [];
$("#pathDiv").hide();
function showAdvancedPaths() {
  hideAdvancedPaths();
  var nodesFromLP = longestPaths(selected)
  for (var node in nodesFromLP) {
    node = node.toString();
    if (node != selected) {
      var edgeVal = nodesFromLP[node];
      idPaths.push({
        id: node,
        label: nodes._data[node].label,
        edge: edgeVal
      });
      nodes.update({
        id: node,
        label: nodes._data[node].label + ": ("+ (Math.round(edgeVal * 100 * 100) / 100).toString() +"%)"});
    }
  }
  advancedPaths = true;
  pathSelect = nodes._data[selected].label;
  document.getElementById("pathSelect").textContent = pathSelect;
  $("#pathDiv").show();
}

function hideAdvancedPaths() {
  for (var i = 0; i < idPaths.length; i += 1) {
    nodes.update({
      id: idPaths[i].id,
      label: idPaths[i].label
    })
  }
  idPaths = [];
  advancedPaths = false;
  pathSelect = null
  $("#pathDiv").hide();
}

function toggleView() {
  if (portrait) {
    document.getElementById("network").style.height = "600px"
    network.redraw();
    portrait = false;
  } else {
    document.getElementById("network").style.height = "1200px"
    network.redraw();
    portrait = true
  }
}

//got this directly from stackoverflow
function arrayObjectIndexOf(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}

//create dropdown menu for selectable nodes when editing ownership relations
function updateNodeDropdownMenu() {
  $("#owner-edit-menu").empty();
  for (node in nodes._data) {
    if (node != selected){
      var label = nodes._data[node].label
      var indexOfNodeInidPaths = arrayObjectIndexOf(idPaths, node, "id")
      if (indexOfNodeInidPaths != -1) {
        label = idPaths[indexOfNodeInidPaths].label
      }
       $('<option value="'+ node +'">' + label + '</option>').appendTo('#owner-edit-menu');
    }
  }
}

// *** BACKEND FUNCTIONS ***

function isPercentageValid(id, percent_to_add) {
  var totalPercent = 0
  //check if user can add it
  for (edge in edges._data){
    if (edges._data[edge].to === id) {
      totalPercent += parseFloat(edges._data[edge].label)
    }
  }
  return (totalPercent + percent_to_add) <= 100
}

function doesEdgeExist(from, to) {
  for (edge in edges._data) {
    if (edges._data[edge].to === to && edges._data[edge].from === from) {
      return true;
    }
  }
  return false;
}

function getEdge(from, to) {
  for (edge in edges._data) {
    if (edges._data[edge].to === to && edges._data[edge].from === from) {
      return edge;
    }
  }
  return null;
}

function getChildren(nodeId) {
  var result = [];
  for (edge in edges._data){
    if (edges._data[edge].from === nodeId) {
      result.push(edges._data[edge].to)
    }
  }
  return result;
}

function getParents(nodeId) {
  result = [];
  for (edge in edges._data){
    if (edges._data[edge].to === nodeId) {
      result.push(edges._data[edge].from)
    }
  }
  return result;
}

//longest paths algorithm
function longestPaths(from) {
  var stack = [];
  var paths = [];
  var visited = []
  var node, edgeval;
  stack.push(from);
  paths[from] = 1;
  while (stack.length > 0) {
    var node = stack.pop();
    var edgeVal = paths[node];
    for (var i = 0; i < getParents(node).length; i += 1) {
      var parent = getParents(node)[i];
      var parentPath = parseFloat(edges._data[getEdge(parent, node)].label) / 100.0;
      if (visited[parent]) {
        paths[parent] += edgeVal * parentPath;
      } else {
        visited[parent] = true;
        stack.push(parent);
        paths[parent] = edgeVal * parentPath
      }
    }
  }
  return paths
}

function CreateTestNodes() {
  nodes.add({
    id: "2",
    group: "company",
    label: "other parent"
    });
    nodes.add({
      id: "3",
      group: "company",
      label: "child"
    });
    nodes.add({
      id: "4",
      group: "company",
      label: "grandkid"
    });
    nodes.add({
      id: "5",
      group: "company",
      label: "other grandkid"
    });
    edges.add({
        id: "1",
        from: "1",
        to: "3",
        label: "50",
        arrows: 'to'
    });
    edges.add({
        id: "2",
        from: "2",
        to: "3",
        label: "50",
        arrows: 'to'
    });
    edges.add({
        id: "3",
        from: "3",
        to: "4",
        label: "50",
        arrows: 'to'
    });
    edges.add({
        id: "4",
        from: "3",
        to: "5",
        label: "50",
        arrows: 'to'
    });
    edges.add({
      id: "5",
      from: "1",
      to: "2",
      label: "50",
      arrows: 'to'
    });
    edges.add({
      id: "6",
      from: "4",
      to: "5",
      label: "50",
      arrows: 'to'
    });
}

//toggle hierarchical
function changeLayout() {
  var options;
  var image;
  if (hierarchicalLayout) {
    image = "img/hierarchy.svg"
    options = {
      physics: {
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 200,
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 0
        },
      },
      groups: {
        person: {
          shape: 'icon',
          icon: {
            face: 'FontAwesome',
            code: '\uf007',
            size: 50,
            color: '#111'
          }
        },
        people: {
          shape: 'icon',
          icon: {
            face: 'FontAwesome',
            code: '\uf0c0',
            size: 50,
            color: '#111'
          }
        },
        company: {
          shape: 'icon',
          icon: {
            face: 'FontAwesome',
            code: '\uf1ad',
            size: 50,
            color: '#f25050'
          }
        }
      }
    }
  } else {
    image = "img/free.png"
    options = {
      layout: {
        hierarchical: {
          direction: "UD",
          sortMethod: "directed"
        }
      },
      physics: {
        hierarchicalRepulsion: {
          centralGravity: 0.0,
          springLength: 200,
          springConstant: 0.005,
          nodeDistance: 120,
          damping: 0.09
        }
      },
      groups:{
        person: {
          shape: 'icon',
          icon: {
            face: 'FontAwesome',
            code: '\uf007',
            size: 50,
            color: '#111'
          }
        },
        people: {
          shape: 'icon',
          icon: {
            face: 'FontAwesome',
            code: '\uf0c0',
            size: 50,
            color: '#111'
          }
        },
        company: {
          shape: 'icon',
          icon: {
            face: 'FontAwesome',
            code: '\uf1ad',
            size: 50,
            color: '#f25050'
          }
        }
      }
    }
  }
  $("#layoutButton").attr("src", image);
  network = new vis.Network(container, data, options);
  hierarchicalLayout = !hierarchicalLayout;
  network.on("select", function (params) {
    //console.log('select Event:', params);
    if (params.nodes.length > 0) {
      selected = params.nodes[0];
      updateNodeDropdownMenu();
    } else {
      selected = null;
    }
    if (selected != null) {
      selectedLabel = nodes._data[selected].label
      var indexOfSelectedInidPaths = arrayObjectIndexOf(idPaths, selected, "id");
      if (indexOfSelectedInidPaths != -1) {
        selectedLabel = idPaths[indexOfSelectedInidPaths].label;
      }
      document.getElementById("selected").textContent = selectedLabel;
    }
  });
}
//show the icon because it needs to redraw half a second after loading the document
$(document).ready(function() {
  setTimeout(function() {
    network.redraw();
  }, 500);
});



//Press add/save button when hit "enter"
$("#myModal").keyup(function(event) {
  if (event.keyCode == 13) {
    $(".modal-footer").children()[$(".modal-footer").children().length - 1].click();
  }
});

function footerTab1() {
  $(".modal-footer").empty();
  $(".modal-footer").append('<button type="button" class="btn btn-danger" data-dismiss="modal" id="node-delete" onclick="deleteNode()">Delete</button>');
  $(".modal-footer").append('<button type = "button" class="btn btn-primary" data-dismiss="modal" id="node-edit" onclick="editNode()">Save</button>');
}

function footerTab2() {
  $(".modal-footer").empty();
  $(".modal-footer").append('<button type = "button" class="btn btn-primary" id="node-add" onclick="addNode();">Add</button>')
}

function footerTab3() {
  $(".modal-footer").empty();
  $(".modal-footer").append('<button type = "button" class="btn btn-primary" id="node-add" onclick="addPerson();">Add</button>')
}

function footerTab4() {
  $(".modal-footer").empty();
  $(".modal-footer").append('<button type = "button" class="btn btn-primary" id="add-edge" onclick="addEdge()">Save</button>');
}
