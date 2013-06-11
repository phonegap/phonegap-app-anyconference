define(function(require, exports, module) {

    //var SessionView = require('sessions/sessionView');
    //var SessionModel = require('sessions/sessionModel');
    var sessionCollectionViewTemplate = require('text!sessions/templates/sessionCollectionViewTemplate.html');

    var SessionCollectionView = Backbone.View.extend({
        className: 'topcoat-list__container',
        pages: [],
        pageHeight: null,
        prevPage: null,
        currentPage: null,
        nextPage: null,
        pageOverlay: null,
        template: _.template(sessionCollectionViewTemplate),
        initialize: function() {
            this.listenTo(this.collection, 'sync', this.render);
            this.collection.fetch({
                error: function() {
                    console.log("ERROR");
                }
            });

            this.pageHeight = window.innerHeight;
            this.pageOverlay = document.createElement('div');
            this.pageOverlay.className = 'js-page-overlay';
        },

        render: function() {
            this.$el.html(this.template({
                data: this.collection.toJSON()
            }));

            this.setCurrentPage(this.pages[0]);
            this.pageOverlay.classList.remove('js-page-overlay-removed');
            this.el.insertBefore(this.pageOverlay, this.currentPage.el);
            this.animating = false;
            window.addEventListener('touchstart', this.touchStart);

            return this;
        }
    });

        hide: function() {
            window.removeEventListener('touchstart', this.touchStart);
            this.el.style.display = 'none';
        },

        leave: function() {
            this.el.style.display = 'none';
        },

        setCurrentPage: function(sessionPage) {
            if (this.animating) {
                return;
            }
            this.currentPage = sessionPage;
            this.nextPage = null;
            this.prevPage = null;
            for (var i = 0; i < this.pages.length; i++) {
                var page = this.pages[i];
                if (page === sessionPage) {
                    if (i > 0) {
                        this.prevPage = this.pages[i - 1];
                    }
                    if (i < this.pages.length - 1) {
                        this.nextPage = this.pages[i + 1];
                        this.nextPage.render();
                    }
                    page.render();
                } else {
                    page.hide();
                }
            }
            if (this.prevPage) {
                this.prevPage.renderAsPrevious();
            }
            if (this.nextPage) {
                this.nextPage.render();
                this.updateOverlay();
            } else {
                this.updateOverlay();
            }
        },

        updateOverlay: function() {
            var _this = this;
            _this.animating = true;

            var onTransitionEnd = function(evt) {
                    _this.animating = false;
                    _this.pageOverlay.classList.remove('js-page-overlay-removed');
                    evt.target.removeEventListener('webkitTransitionEnd', onTransitionEnd);
                    _this.el.insertBefore(_this.pageOverlay, _this.currentPage.el);
                };

            this.pageOverlay.classList.add('js-page-overlay-removed');
            this.pageOverlay.addEventListener('webkitTransitionEnd', onTransitionEnd);
        },

        addToNewPage: function() {
            this.currentPage = new SessionPage({
                pageHeight: this.pageHeight
            });
            this.pages.push(this.currentPage);
            this.el.insertBefore(this.currentPage.el, this.el.firstChild);
        },

        addSession: function(sessionModel) {
            if (!this.currentPage) {
                this.addToNewPage();
            }
            var sessionView = new SessionView({
                model: sessionModel
            }).render();

            // See if it fits on the page
            this.currentPage.el.appendChild(sessionView.el);
            var viewBottom = sessionView.el.offsetTop + sessionView.el.offsetHeight;
            var pageBottom = this.currentPage.el.offsetTop + this.currentPage.el.offsetHeight;

            if (viewBottom > pageBottom) {
                this.addToNewPage();
                this.currentPage.el.appendChild(sessionView.el);
            }

            // this.el.appendChild(sessionView.render().el);
        },

        transitionToNext: function() {
            var _this = this;
            this.animating = true;
            // animate current page up
            this.currentPage.transitionOut(function() {
                _this.animating = false;
                _this.setCurrentPage(_this.nextPage);
            });
        },

        transitionToPrevious: function() {
            var _this = this;
            this.animating = true;
            // pull previous from top
            this.prevPage.transitionIn(function() {
                _this.animating = false;
                _this.setCurrentPage(_this.prevPage);
            });
        },

        transitionNextAway: function() {
            var _this = this;
            this.animating = true;
            this.nextPage.transitionOut(function() {
                _this.animating = false;
                _this.setCurrentPage(_this.currentPage);
            });
        },

        transitionCurrentBack: function() {
            var _this = this;
            this.animating = true;
            this.currentPage.transitionIn(function() {
                _this.animating = false;
                _this.setCurrentPage(_this.currentPage);
            });
        },

        touchStart: function(evt) {
            var _this = sessionListView;

            console.log('touchstart');
            if (_this.animating) {
                return;
            }
            // evt.preventDefault();
            // evt.stopPropagation();
            _this.startPoint = {
                x: evt.touches[0].pageX,
                y: evt.touches[0].pageY
            };
            _this.lastPoint = {
                x: _this.startPoint.x,
                y: _this.startPoint.y
            };
            _this.lastDiff = {
                x: 0,
                y: 0
            }
            window.addEventListener('touchmove', sessionListView.touchMove, false);
            window.addEventListener('touchend', sessionListView.touchEnd, false);
        },

        touchMove: function(evt) {
            console.log('touchmove');
            evt.preventDefault();
            var _this = sessionListView;
            var targetEl = _this.currentPage.el;
            var prevEl;
            if (_this.prevPage) {
                prevEl = _this.prevPage.el;
            }
            var currentPoint = {
                x: evt.touches[0].pageX,
                y: evt.touches[0].pageY
            };
            _this.lastDiff = {
                x: currentPoint.x - _this.lastPoint.x,
                y: currentPoint.y - _this.lastPoint.y
            };
            _this.lastPoint = currentPoint;
            var offsetY = currentPoint.y - _this.startPoint.y;
            if (offsetY < 0) {
                // drag current page up
                targetEl.style.webkitTransform = 'translateY(' + offsetY + 'px) translateZ(0)';
                _this.pendingPage = _this.nextPage;
            } else if (prevEl) {
                // drag previous page down
                offsetY = Math.min(-_this.pageHeight + offsetY * 1.5, 0);
                prevEl.style.webkitTransform = 'translateY(' + offsetY + 'px) translateZ(0)';
                _this.pendingPage = _this.prevPage;
            }
        },

        touchEnd: function(evt) {
            var _this = sessionListView;
            var targetEl = _this.currentPage.el;
            if (_this.lastDiff.y > 0) {
                evt.preventDefault();
                if (!_this.prevPage) {
                    // do nothing?
                } else if (_this.pendingPage === _this.prevPage) {
                    _this.transitionToPrevious();
                } else {
                    _this.transitionCurrentBack();
                }
            } else if (_this.lastDiff.y < 0) {
                evt.preventDefault();
                if (!_this.nextPage) {
                    _this.transitionCurrentBack();
                } else if (_this.pendingPage === _this.nextPage) {
                    _this.transitionToNext();
                } else if (_this.nextPage) {
                    _this.transitionNextAway();
                }
            }

            window.removeEventListener('touchmove', sessionListView.touchMove);
            window.removeEventListener('touchend', sessionListView.touchEnd);
        }

    });

    return SessionCollectionView;
});
