let jsonMerger = require('./merger/json-merger.js');

module.exports = function(){

    return {
        //Merge an array of json objects with the json of the current sbgn network
        //on display to output a single json object.
        mergeJsonWithCurrent: function (jsonGraph, cyId, modelManager, callback) {
            let currJson = appUtilities.getActiveChiseInstance().createJson();
            modelManager.setRollbackPoint(cyId); //before merging.. for undo

            let jsonObj = jsonMerger.mergeJsonWithCurrent(jsonGraph, currJson);

            //get another sbgncontainer and display the new SBGN model.
            modelManager.newModel(cyId, "me", true);

            //this takes a while so wait before initiating the model
            appUtilities.getActiveChiseInstance().updateGraph(jsonObj, function () {

                modelManager.initModel(appUtilities.getActiveCy().nodes(), appUtilities.getActiveCy().edges(), cyId, appUtilities, "me");

                //select the new graph
                jsonGraph.nodes.forEach(function (node) {
                    appUtilities.getActiveCy().getElementById(node.data.id).select();
                });

                $("#perform-layout").trigger('click');

                appUtilities.getActiveCy().elements().unselect();

                // Call merge notification after the layout
                setTimeout(function () {
                    modelManager.mergeJsons(cyId, "me", true);
                    if (callback) callback("success");
                }, 1000);

            });
        }
    }
}