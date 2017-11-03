/***
 * Test for sending and receiving messages
 */

let io = require('socket.io-client');

describe('Agent API Test', function () {
    let agent;
    let agentId = '103abc';
    let agentName = "testAgent";



    function newAgent() {
       it('new Agent', function () {
           let Agent = require("../../agent-interaction/agentAPI.js");
           agent = new Agent(agentName, agentId, io);
           expect(agent).to.be.ok;
        });
    }

    function agentProperties(){
        it('Agent properties', function() {
            expect(agent.agentId).to.be.equal(agentId);
            expect(agent.agentName).to.be.equal(agentName);
            expect(agent.colorCode).to.be.equal("#00bfff");

        });
    }


    function loadModel() {
       it('connectToServer', function (done) {
            agent.connectToServer("http://localhost:3000/",  function (socket) {
                expect(socket).to.be.ok;
                agent.loadModel( function () {
                    agent.loadOperationHistory( function () {
                        expect(agent.opHistory).to.be.ok;
                        expect(agent.pageDoc).to.be.ok;
                        done();
                    });
                });
            });

       });
    }


    function changeName() {
        it('changeName', function (done) {
            agent.changeName("HAL", function () {
                setTimeout(function () { //should wait here as well
                    expect(agent.agentName).to.equal("HAL");
                    done();
                }, 100);

            });

        });
    }

    newAgent();
    agentProperties();
    loadModel();
    changeName();

});
