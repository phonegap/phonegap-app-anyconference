/*global jQuery:false, Backbone:false, _:false, app:false, expect:false*/
 /*global describe:false, it:false*/

describe('anyconference', function() {

    describe('jQuery', function() {
        it('should be available', function() {
            expect(jQuery).not.to.be(undefined);
        });
    });

    describe('Backbone', function() {
        it('should be available', function() {
            expect(Backbone).not.to.be(undefined);
        });
    });


    describe('Lo-Dash', function() {
        it('should be available', function() {
            expect(_).not.to.be(undefined);
        });
    });


    describe('Backbone.LayoutManager', function() {
        it('should be available', function() {
            expect(Backbone.Layout).not.to.be(undefined);
        });
    });

    describe('app', function() {
        it('should be available', function() {
            expect(app).not.to.be(undefined);
        });

        it('should have useLayout function', function() {
            expect(app.useLayout).not.to.be(undefined);
        });

        it('should have useLayout function', function() {
            expect(app.useLayout).not.to.be(undefined);
        });

        it('should have Router', function() {
            expect(app.router).not.to.be(undefined);
        });
    });
});
