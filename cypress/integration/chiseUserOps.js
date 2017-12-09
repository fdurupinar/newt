function addNodeTest(cyId, id, className, posX, posY) {

  it('chise.addNode()', function () {
    cy.window().should(function(window){
      let chise = window.appUtilities.getActiveChiseInstance();
      chise.addNode(posX, posY, className, id);
      let node = window.appUtilities.getActiveCy().getElementById(id);
      // expect(node, "A node with id: " + id + " is added.").to.be.ok;
      expect(node.length, "A node with id: " + id + " is added.").to.equal(1);
      expect(node.position('x'), 'x position of the node is as expected').to.equal(posX);
      expect(node.position('y'), 'y position of the node is as expected').to.equal(posY);
      expect(node.data('class'), 'the node has the expected sbgn class').to.equal(className);

      let modelManager = window.testModelManager;
      expect(modelManager, 'model manager is available here').to.be.ok;
      let nodeModel = modelManager.getModelNode(id, cyId);
      expect(nodeModel, 'node model is available here').to.be.ok;
      expect(modelManager.getModelNodeAttribute("data.id", id, cyId), "Node is equal in model and cytoscape").to.be.equal(window.appUtilities.getActiveCy().getElementById(id).data("id"));
      expect(modelManager.getModelNodeAttribute("data.class", id, cyId), "Node class is equal in model and cytoscape.").to.be.equal(node.data("class"));
      expect(modelManager.getModelNodeAttribute("position.x", id, cyId), "Node position x is equal in model and cytoscape.").to.be.equal(node.position('x'));
      expect(modelManager.getModelNodeAttribute("position.y", id, cyId), "Node position y is equal in model and cytoscape.").to.be.equal(node.position('y'));
    });
  });
}

function addEdgeTest(cyId, id, src, tgt, className) {

  it('chise.addEdge()', function () {
    cy.window().should(function(window){
      let chise = window.appUtilities.getActiveChiseInstance();
      chise.addEdge(src, tgt, className, id);
      let edge = window.appUtilities.getActiveCy().getElementById(id);
      expect(edge, "An edge with id: " + id + " is added.").to.be.ok;
      expect(edge.data('source'), "the edge has the expected source").to.be.equal(src);
      expect(edge.data('target'), "the edge has the expected target").to.be.equal(tgt);

      let modelManager = window.testModelManager;
      let edgeModel = modelManager.getModelEdge(id, cyId);

      expect(edgeModel, "Edge is added to the model.").to.be.ok;
      expect(modelManager.getModelEdgeAttribute("data.id", id, cyId) , "Edge is equal in model and cytoscape").to.be.equal(window.appUtilities.getActiveCy().getElementById(id).data("id"));
      expect(modelManager.getModelEdgeAttribute("data.class", id, cyId), "Edge class is equal in model and cytoscape.").to.be.equal(edge.data("class"));
      expect(modelManager.getModelEdgeAttribute("data.source", id, cyId), "Edge target x is equal in model and cytoscape.").to.be.equal(edge.data('source'));
      expect(modelManager.getModelEdgeAttribute("data.target", id, cyId), "Edge source y is equal in model and cytoscape.").to.be.equal(edge.data('target'));
    });
  });
}

function createCompoundTest(cyId, compoundType) {

  it('chise.createCompoundForGivenNodes()', function () {
    cy.window().should(function(window){
      let chise = window.appUtilities.getActiveChiseInstance();
      chise.addNode(100, 100, 'macromolecule', 'macromoleculeToCreateCompound');

      let existingIdMap = {};

      // Map the existing nodes before creating the compound
      window.appUtilities.getActiveCy().nodes().forEach(function (ele) {
        existingIdMap[ele.id()] = true;
      });

      chise.createCompoundForGivenNodes(window.appUtilities.getActiveCy().getElementById('macromoleculeToCreateCompound'), compoundType);

      // The element who is not mapped before the operation is supposed to be the new compound
      let newEle = window.appUtilities.getActiveCy().nodes().filter(function (ele) {
        return existingIdMap[ele.id()] !== true;
      });

      expect(newEle.length, "New compound is created").to.be.equal(1);
      expect(newEle.data('class'), "New compound has the expected class").to.be.equal(compoundType);

      let modelManager = window.testModelManager;
      let compoundModel = modelManager.getModelNode(newEle.id(), cyId);

      expect(compoundModel, "Compound is added to the model.").to.be.ok;
      expect(modelManager.getModelNodeAttribute("data.id", newEle.id(), cyId), "Compound is the parent of the node.").to.be.equal(window.appUtilities.getActiveCy().getElementById('macromoleculeToCreateCompound').data("parent"));

      expect(modelManager.getModelNodeAttribute("data.class", newEle.id(), cyId), "Model compound has the correct sbgn class.").to.be.equal(compoundType);
    });
  });
}

function cloneElementsTest(cyId) {

  it('chise.cloneElements()', function () {
    cy.window().should(function(window){
      let initialSize = window.appUtilities.getActiveCy().elements().length;
      window.appUtilities.getActiveChiseInstance().cloneElements(window.appUtilities.getActiveCy().elements());
      expect(window.appUtilities.getActiveCy().elements().length, "Clone operation is successful").to.be.equal(initialSize * 2);
    });
  });
}

function cloneNodeTest(cyId, id) {

  it('chise.cloneElements()', function () {
    cy.window().should(function(window){
      let node = window.appUtilities.getActiveCy().getElementById(id);

        window.appUtilities.getActiveChiseInstance().cloneElements(node);

      let modelManager = window.testModelManager;
      let nodeModel = modelManager.getModelNode(id, cyId);

      for(let att in node.data()){
        if(node.data().hasOwnProperty(att) && att !== "bbox"){
          // assert.propEqual(nodeModel.data[att],node.data(att), 'Data ' + att +' of actual and cloned elements are the same.');
          expect(nodeModel.data[att], 'In model data ' + att +' of actual and cloned elements are the same.').to.deep.equal(node.data(att));
        }
      }
    });
  });
}

function expandCollapseTest(cyId, selector) {

  it('chise.collapseNodes() and chise.expandNodes()', function () {
    cy.window().should(function(window){
      let filteredNodes = window.appUtilities.getActiveCy().nodes(selector);
      let initilChildrenSize = filteredNodes.children().length;
      let initialNodesSize = window.appUtilities.getActiveCy().nodes().length;
      let initialEdgesSize = window.appUtilities.getActiveCy().edges().length;

      let chise = window.appUtilities.getActiveChiseInstance();

      chise.collapseNodes(filteredNodes);
      expect(filteredNodes.children().length, "Collapse operation is successful").to.be.equal(0);
      chise.expandNodes(filteredNodes);
      expect(filteredNodes.children().length, "Initial children size is protected after expand operation").to.be.equal(initilChildrenSize);
      expect(window.appUtilities.getActiveCy().nodes().length, "Initial nodes size is protected after expand operation").to.be.equal(initialNodesSize);
      expect(window.appUtilities.getActiveCy().edges().length, "Initial edges size is protected after expand operation").to.be.equal(initialEdgesSize);

      let modelManager = window.testModelManager;

      filteredNodes.forEach(function(node){
        let expandCollapseStatus = modelManager.getModelNodeAttribute('expandCollapseStatus', node.id(), cyId);
        expect(expandCollapseStatus, "In model expand on node " + node.id()  + " is successful").to.be.equal("expand");
      });
    });
  });
}

function deleteElesTest(cyId, selector) {

  it('chise.deleteElesSimple()', function () {
    cy.window().should(function(window){
      let nodeIds = [];
      let edgeIds = [];

      window.appUtilities.getActiveCy().elements(selector).forEach(function(ele){
        if(ele.isNode())
        nodeIds.push(ele.id());
        else
        edgeIds.push(ele.id());
      });

      window.appUtilities.getActiveChiseInstance().deleteElesSimple(window.appUtilities.getActiveCy().elements(selector));
      expect(window.appUtilities.getActiveCy().elements(selector).length, "Delete simple operation is successful").to.be.equal(0);

      nodeIds.forEach(function(nodeId){
        expect(modelManager.getModelNode(nodeId, cyId), "In model node " + nodeId + " removed successfully.").not.to.be.ok;
      });

      edgeIds.forEach(function(edgeId){
        expect(modelManager.getModelEdge(edgeId, cyId), "In model edge " + edgeId + " removed successfully.").not.to.be.ok;
      });
    });
  });
}

function deleteNodesSmartTest(cyId, selector) {

  it('chise.deleteElesSmart()', function () {
    cy.window().should(function(window){
      let chise = window.appUtilities.getActiveChiseInstance();
      let allNodes = window.appUtilities.getActiveCy().nodes();
      let nodes = window.appUtilities.getActiveCy().nodes(selector);
      let nodesToKeep = chise.elementUtilities.extendRemainingNodes(nodes, allNodes);
      let nodesNotToKeep = allNodes.not(nodesToKeep);

      let removedIds = [];
      let removedIdsSelector = '';

      nodesNotToKeep.forEach(function(node){
        if (removedIdsSelector != '') {
          removedIdsSelector += ',';
        }
        removedIds.push(node.id());
        removedIdsSelector += '#' + node.id();
      });

      chise.deleteNodesSmart(nodes);
      expect(window.appUtilities.getActiveCy().nodes(removedIdsSelector).length, "Delete smart operation is successful").to.be.equal(0);

      let modelManager = window.testModelManager;
      removedIds.forEach(function(nodeId){
        expect(modelManager.getModelNode(nodeId, cyId), "In model node " + nodeId + " removed successfully.").not.to.be.ok;
      });
    });
  });
}

function hideElesTest(cyId, selector) {

  it('chise.hideNodesSmart()', function () {
    cy.window().should(function(window){

      // get the active chise instance
      let chiseInstance = window.appUtilities.getActiveChiseInstance();
      // since both cypress and cytoscape.js instances are created as cy by convention
      // use cytoscape.js instance as _cy
      let _cy = chiseInstance.getCy();

      // get nodes to perform operation on
      let nodes = _cy.nodes(selector);

      // get the nodes that are already visible before the operation
      let alreadyVisibleNodes = _cy.nodes(':visible');

      // get the nodes that are already hidden before the operation
      let alreadyHiddenNodes = _cy.nodes(':hidden');

      // get the nodes that are not to be hidden during the operation
      let nodesNotToHide = chiseInstance.elementUtilities.extendRemainingNodes(nodes, alreadyVisibleNodes).nodes();

      // get the nodes that are to be hidden during the operation
      let nodesToHide = alreadyVisibleNodes.not(nodesNotToHide);

      // the whole nodes that are expected to be hidden after the operation is performed
      let nodesExpectedToBeHidden = nodesToHide.union(alreadyHiddenNodes);

      // perform the operation
      chiseInstance.hideNodesSmart(nodes);

      // expect that nodes expected to be hidden after the operation has the same length with the nodes
      // that actully has the hidden status after the operation is performed
      expect(_cy.nodes().filter(':hidden').length, "Hide operation is successful").to.be.equal(nodesExpectedToBeHidden.length);

      let modelManager = window.testModelManager;

      // check if the nodes are hidden on model manager as well
      nodes.forEach(function(node){
        let visibilityStatus = modelManager.getModelNodeAttribute('visibilityStatus', node.id(), cyId);
        expect(visibilityStatus, "In model hide on node " + node.id()  + " is successful").to.be.equal("hide");
      });
    });
  });
}

function showAllElesTest(cyId,) {

  it('chise.showAll()', function () {
    cy.window().should(function(window){
      window.appUtilities.getActiveChiseInstance().showAll();
      expect(window.appUtilities.getActiveCy().nodes().length, "Show all operation is successful").to.be.equal(window.appUtilities.getActiveCy().nodes(':visible').length);

      let modelManager = window.testModelManager;

      window.appUtilities.getActiveCy().nodes().forEach(function(node){
        let visibilityStatus = modelManager.getModelNodeAttribute('visibilityStatus', node.id(), cyId);
        expect(visibilityStatus, "In model show on node " + node.id()  + " is successful").not.to.be.equal("hide");
      });
    });
  });
}

function alignTest (cyId, selector, horizontal, vertical, alignToId) {

  it('chise.align()', function () {
    cy.window().should(function(window){
      let nodes = window.appUtilities.getActiveCy().nodes(selector);

      // If node to align to is not set use the first node in the list
      let alignToNode = alignToId ? window.appUtilities.getActiveCy().getElementById(alignToId) : nodes[0];

      // Return the alignment coordinate of the given node. This alignment coordinate is depandent on
      // the horizontal and vertical parameters and after the align operation all nodes should have the same
      // alignment coordinate of the align to node.
      let getAlignmentCoord = function(node) {
        if (vertical === 'center') {
          return node.position('x');
        }
        if (vertical === 'left') {
          return node.position('x') - node.outerWidth() / 2;
        }
        if (vertical === 'right') {
          return node.position('x') + node.outerWidth() / 2;
        }
        if (horizontal === 'middle') {
          return node.position('y');
        }
        if (horizontal === 'top') {
          return node.position('y') - node.outerHeight() / 2;
        }
        if (horizontal === 'bottom') {
          return node.position('y') + node.outerHeight() / 2;
        }
      }

      let expectedCoord = getAlignmentCoord(alignToNode);

      window.appUtilities.getActiveChiseInstance().align(nodes, horizontal, vertical, alignToNode);
      let filteredNodes = nodes.filter(function(node) {
        let coord = getAlignmentCoord(node);
        return coord === expectedCoord;
      });

      expect(filteredNodes.length, "Align operation is successful for all nodes " + horizontal + " " + vertical).to.be.equal(nodes.length);

      let modelManager = window.testModelManager;

      nodes.forEach(function(node){
        let posX = modelManager.getModelNodeAttribute('position.x', node.id(), cyId);
        let posY = modelManager.getModelNodeAttribute('position.y', node.id(), cyId);
        expect(posX, "In model x position of " + node.id()  + " is updated successfully").to.be.equal(node.position('x'));
        expect(posY, "In model y position of " + node.id()  + " is updated successfully").to.be.equal(node.position('y'));
      });
    });
  });
}

function highlightElesTest(cyId, selector) {

  it('chise.highlightEles()', function () {
    cy.window().should(function(window){
      let eles = window.appUtilities.getActiveCy().$(selector);
      window.appUtilities.getActiveChiseInstance().highlightSelected(eles); // This method highlights the given eles not the selected ones. It has an unfortune name.
      expect(eles.filter('.highlighted').length, "Highlight operation is successful").to.be.equal(eles.length);

      let modelManager = window.testModelManager;

      eles.forEach(function(ele){
        if(ele.isNode()){
          let highlightStatus = modelManager.getModelNodeAttribute('highlightStatus', ele.id(), cyId);
          expect(highlightStatus, "In model highlight on node " + ele.id()  + " is successful").to.be.equal("highlighted");
        }
        else{
          let highlightStatus = modelManager.getModelEdgeAttribute('highlightStatus', ele.id(), cyId);
          expect(highlightStatus, "In model highlight on edge " + ele.id()  + " is successful").to.be.equal("highlighted");
        }
      });
    });
  });
}

function removeHighlightsTest(cyId) {

  it('chise.removeHighlights()', function () {
    cy.window().should(function(window){
      window.appUtilities.getActiveChiseInstance().removeHighlights();
      expect(window.appUtilities.getActiveCy().elements('.highlighted').length, "Remove highlights operation is successful").to.be.equal(0);

      let modelManager = window.testModelManager;

      window.appUtilities.getActiveCy().elements().forEach(function(ele){
        if(ele.isNode()){
          let highlightStatus = modelManager.getModelNodeAttribute('highlightStatus', ele.id(), cyId);
          expect(highlightStatus, "In model unhighlight on node " + ele.id()  + " is successful").to.be.equal("unhighlighted");
        }
        else{
          let highlightStatus = modelManager.getModelEdgeAttribute('highlightStatus', ele.id(), cyId);
          expect(highlightStatus, "In model unhighlight on edge " + ele.id()  + " is successful").to.be.equal("unhighlighted");
        }
      });
    });
  });
}

function highlightProcessesTest(cyId, selector) {

  it('chise.highlightProcesses()', function () {
    cy.window().should(function(window){
      let chise = window.appUtilities.getActiveChiseInstance();
      let nodes = window.appUtilities.getActiveCy().nodes(selector);
      let elesToHighlight = chise.elementUtilities.extendNodeList(nodes);
      chise.highlightProcesses(nodes);
      assert.equal(elesToHighlight.filter('.highlighted').length, elesToHighlight.length, "Highlight processes operation is successful");

      let modelManager = window.testModelManager;

      elesToHighlight.forEach(function(ele){
        if(ele.isNode()){
          let highlightStatus = modelManager.getModelNodeAttribute('highlightStatus', ele.id(), cyId);
          expect(highlightStatus, "In model highlight on node " + ele.id()  + " is successful").to.be.equal("highlighted");
        }
        else{
          let highlightStatus = modelManager.getModelEdgeAttribute('highlightStatus', ele.id(), cyId);
          expect(highlightStatus, "In model highlight on edge " + ele.id()  + " is successful").to.be.equal("highlighted");
        }
      });
    });
  });
}

function highlightNeighboursTest (cyId, selector) {

  it('chise.highlightNeighbours()', function () {
    cy.window().should(function(window){
      let chise = window.appUtilities.getActiveChiseInstance();
      let nodes = window.appUtilities.getActiveCy().nodes(selector);
      let elesToHighlight = chise.elementUtilities.getNeighboursOfNodes(nodes);
      chise.highlightNeighbours(nodes);
      expect(elesToHighlight.filter('.highlighted').length, "Highlight neighbours operation is successful").to.be.equal(elesToHighlight.length);

      let modelManager = window.testModelManager;

      elesToHighlight.forEach(function(ele){
        if(ele.isNode()){
          let highlightStatus = modelManager.getModelNodeAttribute('highlightStatus', ele.id(), cyId);
          expect(highlightStatus, "In model highlight on node " + ele.id()  + " is successful").to.be.equal("highlighted");
        }
        else{
          let highlightStatus = modelManager.getModelEdgeAttribute('highlightStatus', ele.id(), cyId);
          expect(highlightStatus, "In model highlight on edge " + ele.id()  + " is successful").to.be.equal("highlighted");
        }
      });
    });
  });
}

function changeNodeLabelTest(cyId, selector) {

  it('chise.changeNodeLabel()', function () {
    cy.window().should(function(window){
      let nodes = window.appUtilities.getActiveCy().nodes(selector);
      window.appUtilities.getActiveChiseInstance().changeNodeLabel(nodes, 'test label');
      expect(nodes.filter('[label="test label"]').length, "Change node label operation is successful").to.be.equal(nodes.length);

      let modelManager = window.testModelManager;

      nodes.forEach(function(node){
        let newNodeLabel = modelManager.getModelNodeAttribute('data.label', node.id(), cyId);
        expect(newNodeLabel,  "In model change node label operation is successful").to.be.equal('test label');
      });
    });
  });
}

function resizeNodesTest(cyId, dimension) {

  it('chise.resizeNodes()', function () {
    cy.window().should(function(window){
      let chise = window.appUtilities.getActiveChiseInstance();
      let nodes = window.appUtilities.getActiveCy().nodes('[class="macromolecule"]');

      if (dimension === 'w') {
        chise.resizeNodes(nodes, 100);
      }
      else {
        chise.resizeNodes(nodes, undefined, 100);
      }

      let filteredNodes = nodes.filter(function(node) {
        return node.data('bbox')[dimension] === 100;
      });

      expect(filteredNodes.length, "Change " + dimension + " operation is successful").to.be.equal(nodes.length);

      let modelManager = window.testModelManager;

      filteredNodes.forEach(function(node){
        let newNodeDimension = modelManager.getModelNodeAttribute('data.bbox', node.id(), cyId);
        console.log(newNodeDimension[dimension]);
        console.log(node.data('bbox')[dimension]);

        expect(newNodeDimension[dimension],  "In model change " + dimension + " operation is successful").to.be.equal(node.data('bbox')[dimension]);
      });
    });
  });
}

function changeDataTest(cyId, selector, name, testVal, parseFloatOnCompare, omitStyle) {

  it('chise.changeData()', function () {
    cy.window().should(function(window){
      let chise = window.appUtilities.getActiveChiseInstance();
      let elements = window.appUtilities.getActiveCy().$(selector);
      elements.unselect(); // Unselect the nodes because node selection affects some style properties like border color
      chise.changeData(elements, name, testVal);

      let evalByParseOpt = function(val) {
        if (parseFloatOnCompare) {
          return parseFloat(val);
        }
        return val;
      }

      let dataUpdated = elements.filter(function(ele) {
        return evalByParseOpt(ele.data(name)) === testVal;
      });

      expect(dataUpdated.length, "Change " + name + " operation is successfully changed element data").to.be.equal(elements.length);

      // Generally data fields have a corresponding style fields that are updated by their values.
      // If there is an exceptional case 'omitStyle' flag should be set upon calling this function.
      if (!omitStyle) {
        let styleUpdated = elements.filter(function(ele) {
          return evalByParseOpt(ele.css(name)) === testVal;
        });

        expect(styleUpdated.length, "Change " + name + " operation is successfully changed element style").to.be.equal(elements.length);
      }

      let modelManager = window.testModelManager;

      elements.forEach(function(ele){
        let attStr = 'data.' + name;
        let attVal = ele.isNode() ? modelManager.getModelNodeAttribute(attStr, ele.id(), cyId) : modelManager.getModelEdgeAttribute(attStr, ele.id(), cyId);
        expect(attVal, "Change " + name + " operation is successful in the model.").to.be.equal(testVal);
      });
    });
  });
}

function addStateOrInfoboxTest (cyId, id, obj) {

  it('chise.addStateOrInfoBox()', function () {
    cy.window().should(function(window){
      let chise = window.appUtilities.getActiveChiseInstance();
      let node = window.appUtilities.getActiveCy().getElementById(id);
      let initialUnitsSize = node.data('statesandinfos').length;
      chise.addStateOrInfoBox(node, obj);

      function performAssertions(statesandinfos, inModel) {
        let inModelStr = inModel ? 'In model ' : '';

        expect(statesandinfos.length, inModelStr + "a new auxiliary unit is successfully added").to.be.equal(initialUnitsSize + 1);
        let newUnit = statesandinfos[statesandinfos.length - 1];
        expect(newUnit.clazz, inModelStr + "new unit has the expected unit type").to.be.equal(obj.clazz);
        expect(JSON.stringify(newUnit.bbox), inModelStr + "new unit has the expected sizes").to.be.equal(JSON.stringify(obj.bbox));

        if (obj.state) {
          expect(JSON.stringify(newUnit.state), inModelStr + "new unit has the expected state object").to.be.equal(JSON.stringify(obj.state));
        }

        if (obj.label) {
          expect(JSON.stringify(newUnit.label), inModelStr + "new unit has the expected label object").to.be.equal(JSON.stringify(obj.label));
        }
      }

      let statesandinfos = node.data('statesandinfos');
      let modelManager = window.testModelManager;
      let modelStatesandinfos = modelManager.getModelNodeAttribute("data.statesandinfos", node.id(), cyId);

      performAssertions(statesandinfos);
      performAssertions(modelStatesandinfos, true);
    });
  });
}

function changeStateOrInfoBoxTest (cyId, id, index, value, type) {

  it('chise.changeStateOrInfoBox()', function () {
    cy.window().should(function(window){
      let chise = window.appUtilities.getActiveChiseInstance();
      let node = window.appUtilities.getActiveCy().getElementById(id);
      chise.changeStateOrInfoBox(node, index, value, type);

      function performAssertions(unit, inModel) {
        let inModelStr = inModel ? 'In model ' : '';
        // If type is not set we assume that it is a unit of information
        if (type) {
          expect(unit.state[type], inModelStr + "state variable is updated by " + type + " field.").to.be.equal(value);
        }
        else {
          expect(unit.label['text'], inModelStr + "unit of information label text is updated correctly.").to.be.equal(value)
        }
      }

      // Get the updated unit to check if it is updated correctly
      let unit = node.data('statesandinfos')[index];
      performAssertions(unit);

      let modelManager = window.testModelManager;
      let modelUnit = modelManager.getModelNodeAttribute("data.statesandinfos", node.id(), cyId)[index];
      performAssertions(modelUnit, true);
    });
  });
}

function removeStateOrInfoBoxTest (cyId, id, index) {

  it('chise.removeStateOrInfoBox()', function () {
    cy.window().should(function(window){
      let node = window.appUtilities.getActiveCy().getElementById(id);
      let modelManager = window.testModelManager;

      let modelUnitToRemove = modelManager.getModelNodeAttribute("data.statesandinfos", node.id(), cyId)[index];
      let unitToRemove = node.data('statesandinfos')[index];

      window.appUtilities.getActiveChiseInstance().removeStateOrInfoBox(node, index);

      let checkIndex = node.data('statesandinfos').indexOf(unitToRemove);
      expect(checkIndex, "Auxiliary unit is removed successfully").to.be.equal(-1);

      let modelCheckIndex = modelManager.getModelNodeAttribute("data.statesandinfos", node.id(), cyId).indexOf(modelUnitToRemove);
      expect(modelCheckIndex, "Auxiliary unit is removed successfully from the model").to.be.equal(-1);
    });
  });
}

function setMultimerStatusTest (cyId, selector, status) {

  it('chise.setMultimerStatus()', function () {
    cy.window().should(function(window){
      let chise = window.appUtilities.getActiveChiseInstance();
      let nodes = window.appUtilities.getActiveCy().nodes(selector);

      chise.setMultimerStatus(nodes, status);

      let filteredNodes = nodes.filter(function(node) {
        let isMultimer = node.data('class').indexOf('multimer') > -1;
        return isMultimer === status;
      });

      expect(filteredNodes.length, "Multimer status is set/unset for all nodes").to.be.equal(nodes.length);

      let modelManager = window.testModelManager;

      nodes.forEach(function(node){
        let isMultimer = modelManager.getModelNodeAttribute('data.class', node.id(), cyId).indexOf('multimer') > -1;
        expect(isMultimer,  "In model multimer status is set/unset for node#" + node.id()).to.be.equal(status);
      });
    });
  });
}

function setCloneMarkerStatusTest (cyId, selector, status) {

  it('chise.setCloneMarkerStatus()', function () {
    cy.window().should(function(window){
      let nodes = window.appUtilities.getActiveCy().nodes(selector);
      window.appUtilities.getActiveChiseInstance().setCloneMarkerStatus(nodes, status);

      let filteredNodes = nodes.filter(function(node) {
        let isCloneMarker = ( node.data('clonemarker') === true );
        return isCloneMarker === status;
      });

      expect(filteredNodes.length, "clonemarker status is set/unset for all nodes").to.be.equal(nodes.length);

      let modelManager = window.testModelManager;

      nodes.forEach(function(node){
        let isCloneMarker = modelManager.getModelNodeAttribute('data.clonemarker', node.id(), cyId) === true;
        expect(isCloneMarker,  "in model clonemarker status is set/unset for node#" + node.id()).to.be.equal(status);
      });
    });
  });
}

function changeFontPropertiesTest (cyId, selector, data) {

  it('chise.changeFontProperties()', function () {
    cy.window().should(function(window){
      let nodes = window.appUtilities.getActiveCy().nodes(selector);
      window.appUtilities.getActiveChiseInstance().changeFontProperties(nodes, data);

      let filteredNodes = nodes.filter(function(node) {
        for (let prop in data) {
          if (node.data(prop) !== data[prop]) {
            return false;
          }

          return true;
        }
      });

      expect(filteredNodes.length, "Font properties are updated for all nodes").to.be.equal(nodes.length);

      let modelManager = window.testModelManager;

      nodes.forEach(function(node){
        for (let prop in data) {
          let propStr = 'data.' + prop;
          let val = modelManager.getModelNodeAttribute(propStr, node.id(), cyId);
          expect(val, "In model font properties are updated node#" + node.id()).to.be.equal(data[prop]);
        }
      });
    });
  });
}

function changeParentTest(cyId, selector, newParentId, posDiffX, posDiffY) {

  it('chise.changeParentTest()', function () {
    cy.window().should(function(window){
      // Keep initial positions of the nodes to be able to check if they are repositioned as expected
      let oldPositions = {};
      let nodes = window.appUtilities.getActiveCy().nodes(selector);
      let modelManager = window.testModelManager;

      nodes.forEach(function(node) {
        oldPositions[node.id()] = {
          x: node.position('x'),
          y: node.position('y')
        };
      });

      window.appUtilities.getActiveChiseInstance().changeParent(nodes, newParentId, posDiffX, posDiffY);

      let updatedNodes = window.appUtilities.getActiveCy().nodes(selector); // Node list should be updated after change parent operation

      // Filter the nodes that are moved to the new parent
      let filteredNodes = updatedNodes.filter(function (node) {
        return node.data('parent') === newParentId;
      });

      expect(filteredNodes.length, "All nodes are moved to the new parent").to.be.equal(nodes.length);

      updatedNodes.forEach(function(node){
        let parentId = modelManager.getModelNodeAttribute('data.parent', node.id(), cyId);
        expect(parentId, "In model parent node is updated node#" + node.id()).to.be.equal(newParentId);
      });

      let allRepositionedCorrectly = true;

      // Check if the nodes are repositioned as expected
      updatedNodes.forEach(function(node) {
        if (node.position('x') - oldPositions[node.id()].x !== posDiffX
        || node.position('y') - oldPositions[node.id()].y !== posDiffY) {
          allRepositionedCorrectly = false;
        }
      });

      expect(allRepositionedCorrectly, "All nodes are repositioned as expected").to.be.equal(true);

      updatedNodes.forEach(function(node){
        let posX = modelManager.getModelNodeAttribute('position.x', node.id(), cyId);
        let posY = modelManager.getModelNodeAttribute('position.y', node.id(), cyId);
        expect(posX - oldPositions[node.id()].x, "In model pos x is updated correctly for node#" + node.id()).to.be.equal(posDiffX);
        expect(posY - oldPositions[node.id()].y, "In model pos y is updated correctly for node#" + node.id()).to.be.equal(posDiffY);
      });
    });
  });
}

function setPortsOrderingTest(cyId, selector, ordering) {

  it('chise.setPortsOrdering()', function () {
    cy.window().should(function(window){
      let nodes = window.appUtilities.getActiveCy().nodes(selector);
      let chise = window.appUtilities.getActiveChiseInstance();

      chise.setPortsOrdering(nodes, ordering);
      let commonOrdering = chise.elementUtilities.getPortsOrdering(nodes);

      expect(commonOrdering, "Ports ordering is set for all nodes").to.be.equal(ordering);

      let modelManager = window.testModelManager;

      nodes.forEach(function(node){
        let modelOrdering = modelManager.getModelNodeAttribute('data.portsordering', node.id(), cyId);
        expect(modelOrdering, "In model ports ordering is updated correctly for node#" + node.id()).to.be.equal(ordering);
      });
    });
  });
}

function resetMapTypeTest(cyId) {

  it('chise.resetMapType()', function () {
    cy.window().should(function(window){
      window.appUtilities.getActiveChiseInstance().resetMapType();
      expect(window.appUtilities.getActiveChiseInstance().elementUtilities.mapType).not.to.be.ok;
    });
  });
}

function checkVisibility(cyId, selector) {

  it('checkVisibility', function () {
    cy.window().should(function(window){
      let _cy = window.appUtilities.getActiveCy();
      expect(_cy.nodes(selector).length, "It is visible").to.be.equal(_cy.nodes(selector).filter(":visible").length);
    });
  });
}


describe('CWC Test', function(){

    let cyId = 0;
    addNodeTest(cyId, 'pdNode0', 'macromolecule', 100, 100);
    addNodeTest(cyId, 'pdNode1', 'process', 100, 200);
    checkVisibility(cyId, '#pdNode1');
    addNodeTest(cyId, 'pdNode2', 'macromolecule', 200, 200);

    addEdgeTest(cyId, 'pdEdge', 'pdNode1', 'pdNode2', 'necessary stimulation');

    let pdNodeTypes = ['macromolecule', 'complex', 'simple chemical', 'unspecified entity',
    'nucleic acid feature', 'perturbing agent', 'source and sink', 'phenotype', 'process',
    'omitted process', 'uncertain process', 'association', 'dissociation', 'tag',
    'compartment', 'submap', 'and', 'or', 'not'
    ];

    for (let i = 0; i < pdNodeTypes.length; i++) {
    let id = 'pdNode' + (i + 3);
        addNodeTest(cyId, id, pdNodeTypes[i], 300, 200);
    }

    resetMapTypeTest(cyId); // Reset the map type here to unknown to allow adding AF elements

    let afNodeTypes = ['biological activity', 'BA plain', 'BA unspecified entity',
    'BA simple chemical', 'BA macromolecule', 'BA nucleic acid feature',
    'BA perturbing agent', 'BA complex', 'delay'];

    for (let i = 0; i < afNodeTypes.length; i++) {
    let id = 'afNode' + i;
        addNodeTest(cyId, id, afNodeTypes[i], 300, 200);
    }

    let pdEdgeTypes = ['consumption', 'production', 'modulation', 'stimulation',
    'catalysis', 'necessary stimulation', 'logic arc', 'equivalence arc'];

    for (let i = 0; i < pdEdgeTypes.length; i++) {
        let id = 'pdEdge' + i;
        let src = 'pdNode' + i;
        let tgt = 'pdNode' + (pdNodeTypes.length - i - 1);
        addEdgeTest(cyId, id, src, tgt, pdEdgeTypes[i]);
    }

    let afEdgeTypes = ['unknown influence', 'positive influence', 'negative influence'];

    for (let i = 0; i < afEdgeTypes.length; i++) {
        let id = 'afEdge' + i;
        let src = 'afNode' + i;
        let tgt = 'afNode' + (afNodeTypes.length - i - 1);
        addEdgeTest(cyId, id, src, tgt, afEdgeTypes[i]);
    }

    createCompoundTest(cyId, 'complex');
    cloneElementsTest(cyId);
    cloneNodeTest(cyId, 'pdNode5');

    expandCollapseTest(cyId, ':parent');
    deleteElesTest(cyId, '#pdNodeO');
    deleteNodesSmartTest(cyId, '#pdNode7');

    checkVisibility(cyId, '#pdNode1');
    // checkVisibility(cyId, '#pdNode1');
    hideElesTest(cyId, '#pdNode1');
    showAllElesTest(cyId);

    alignTest(cyId, 'node', 'left');
    alignTest(cyId, 'node', 'center');
    alignTest(cyId, 'node', 'none', 'top');
    alignTest(cyId, 'node', 'none', 'bottom');
    alignTest(cyId, 'node', 'none', 'middle');

    highlightElesTest(cyId, '[class="macromolecule"]');
    removeHighlightsTest(cyId);
    highlightNeighboursTest(cyId, '[class="macromolecule"]');
    removeHighlightsTest(cyId);
    highlightProcessesTest(cyId, '[class="macromolecule"]');
    removeHighlightsTest(cyId);

    changeNodeLabelTest(cyId, '[class="macromolecule"]');
    resizeNodesTest(cyId, 'w');
    resizeNodesTest(cyId, 'h');

    changeDataTest(cyId, '[class="macromolecule"]', 'border-color', '#b6f442');
    changeDataTest(cyId, '[class="macromolecule"]', 'background-color', '#15076d');
    changeDataTest(cyId, '[class="macromolecule"]', 'border-width', 2, true);
    changeDataTest(cyId, '[class="macromolecule"]', 'background-opacity', 1, true);
    changeDataTest(cyId, 'edge', 'width', 3.5, true);
    changeDataTest(cyId, 'edge', 'cardinality', 3, true, true);
    changeDataTest(cyId, 'edge', 'line-color', '#b6f442');

    let stateVarObj = {};
    stateVarObj.clazz = 'state variable';
    stateVarObj.state = {
        value: 'val',
        variable: 'let'
    };
    stateVarObj.bbox = {
        w: 40,
        h: 20
    };

    let unitOfInfoObj = {};
    unitOfInfoObj.clazz = 'unit of information';
    unitOfInfoObj.label = {
        text: 'label'
    };
    unitOfInfoObj.bbox = {
        w: 40,
        h: 20
    };

    addStateOrInfoboxTest(cyId, 'pdNode3', stateVarObj);
    addStateOrInfoboxTest(cyId, 'pdNode3', unitOfInfoObj);

    changeStateOrInfoBoxTest(cyId, 'pdNode3', 0, 'updated val', 'value');
    changeStateOrInfoBoxTest(cyId, 'pdNode3', 0, 'updated let', 'variable');
    changeStateOrInfoBoxTest(cyId, 'pdNode3', 1, 'updated label');

    removeStateOrInfoBoxTest(cyId, 'pdNode3', 0);

    setMultimerStatusTest(cyId, '[class="macromolecule"]', true);
    setCloneMarkerStatusTest(cyId, '[class="macromolecule multimer"]', true);

    setMultimerStatusTest(cyId, '[class="macromolecule multimer"]', false);
    setCloneMarkerStatusTest(cyId, '[class="macromolecule"]', false);

    changeFontPropertiesTest(cyId, '[class="macromolecule"]', {
    'font-size': '10px',
    'font-family': 'Arial',
    'font-weight': 'bolder'
    });

    addNodeTest(cyId, 'aCompartment', 'compartment', 100, 1000);
    addNodeTest(cyId, 'mm1', 'macromolecule', 150, 150);
    addNodeTest(cyId, 'mm2', 'macromolecule', 150, 190);
    changeParentTest(cyId, '#mm1, #mm2', 'aCompartment', 5, 5);

    addNodeTest(cyId, 'process1', 'process', 50, 50);
    addNodeTest(cyId, 'process2', 'omitted process', 50, 100);
    setPortsOrderingTest(cyId, '#process1, #process2', 'T-to-B');


});
