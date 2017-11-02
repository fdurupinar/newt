/***
 * This should be the first test as it opens a window
 * Tests are run alphabetically, hence the file name
 * TODO: look at order of runs
 */
describe('Window access', function () {
    before(()=>{
        cy.visit('http://localhost:3000');
        it('Access global window object', function (done) {
            cy.window().should(function (window) {
                expect(window.testApp).to.be.ok;
                expect(window.testApp.model).to.be.ok;
                expect(window.testApp.docId).to.be.ok;
                expect(window.$).to.be.ok;
                expect(window.location.hostname).to.eq('localhost');

                done();
            })
        });
    });


});

