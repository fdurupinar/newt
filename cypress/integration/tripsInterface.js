// /***
//  * Test for sending and receiving messages
//  */
//
// let io = require('socket.io-client');
//
// describe('TRIPS Interface Test', function () {
//
//
//     function getTripsAgent() {
//        it('get Trips Agent', function (done) {
//            cy.window().should(function (window) {
//                let tripsAgent = window.testApp.tripsAgent;
//                expect(tripsAgent).to.be.ok;
//                expect(tripsAgent.agentName).to.equal("Bob");
//                expect(tripsAgent.agentId).to.equal("Bob123");
//                expect(tripsAgent.socket).to.be.ok;
//                done();
//
//            });
//
//        });
//     }
//
//     function resetConversation(delay){
//         it('Reset conversation', function (done) {
//             cy.window().should(function (window) {
//                 let app = window.testApp;
//                 app.resetConversationOnTrips();
//
//                 setTimeout(function () {
//                     let pageList = app.model.get('_page.list');
//                     expect(pageList[pageList.length - 1].comment).to.equal("Tell me what you want to do now.");
//                     done();
//                 }, delay);
//
//
//             });
//         });
//     }
//
//     function speak(comment, answer, backInd, milliseconds){
//
//         it('speak', function (done) {
//
//             cy.window().should(function (window) {
//                 let app = window.testApp;
//                 let tripsAgent = app.tripsAgent;
//                 let $ = window.$;
//                 app.model.set('_page.newComment', comment);
//                 $('#send-message').trigger('click');
//
//
//                 setTimeout(function(){
//
//                     let pageList = app.model.get('_page.list');
//                     let bobMessages = pageList.filter(msg=>
//                         msg.userId === tripsAgent.agentId);
//
//                     expect(bobMessages).to.be.ok;
//                     expect(bobMessages[bobMessages.length - backInd].comment.toLowerCase()).to.include(answer.toLowerCase());
//                     done();
//
//                 }, milliseconds);
//                 //wait for Bob's answer
//
//             });
//         });
//
//     }
//
//
//
//
//     getTripsAgent();
//     resetConversation(1000);
//     speak("hello", "hello",1, 500);
//     speak("How does MAPK1 affect JUND?", "MAPK1 phosphorylated on Y187 phosphorylates JUND on S100.", 3, 6000);
//     speak("What genes does MAPK1 phosphorylate?", "MAPK1 phosphorylated on Y187", 3, 6000);
//     speak("What genes phosphorylate JUND?", "MAPK3 phosphorylated on T202", 3, 6000);
//
//
//
//
// });
