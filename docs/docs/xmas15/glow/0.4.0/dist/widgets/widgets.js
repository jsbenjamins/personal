/*
 * Glow JavaScript Library
 * Copyright (c) 2008 British Broadcasting Corporation
 */
/*@cc_on @*/
/*@if (@_jscript_version > 5.1)@*/
;
glow.module("glow.widgets", "0.4.0", {
    require: ["glow.dom", "glow.events"],
    implementation: function() {
        var C, B, A = glow.env;
        glow.ready(function() {
            C = document;
            B = C.body;
            var D = glow.dom.create('<div class="glow-cssTest"></div>').appendTo(B);
            if (D.css("z-index") != "1234" || D.css("background-image").indexOf("ctr.png")==-1) {
                B.className += " glow-basic";
            }
            D.remove();
            A.ie && (B.className += " glow-ie");
            (A.ie < 7 ||!A.standardsMode) && (B.className += " glow-ielt7");
            A.gecko && (B.className += " glow-gecko");
        });
        return {
            _scrollPos: function() {
                var E = window, D = A.standardsMode ? C.documentElement: B;
                return {
                    x: D.scrollLeft || E.pageXOffset || 0,
                    y: D.scrollTop || E.pageYOffset || 0
                };
            }
        };
    }
});;
glow.module("glow.widgets.Mask", "0.4.0", {
    require: ["glow.dom", "glow.events", "glow.widgets"],
    implementation: function() {
        var E = glow.dom, F = E.get, I = glow.events, G = glow.widgets, C, A = '<div class="glow-noMask" style="margin:0;padding:0;position:absolute;width:100%;top:0;left:0;overflow:auto;', B, H = '<iframe class="glow-noMask" style="margin:0;padding:0;position:absolute;top:0;left:0;filter:alpha(opacity=0);display:none"></iframe>';
        function D(M) {
            this.opts = glow.lang.apply({
                color: "#000",
                opacity: 0.7,
                zIndex: 9900,
                disableScroll: false
            }, M || {});
            var K = document.body, J = this.maskElement = E.create(A + "z-index:" + this.opts.zIndex + ";background:" + this.opts.color + ';visibility:hidden"></div>').appendTo(K), L = this;
            J.css("opacity", this.opts.opacity);
            if (glow.env.ie < 7) {
                this._iframe = E.create(H).css("z-index", this.opts.zIndex - 1).appendTo(K);
            }
            I.addListener(J, "click", function() {
                I.fire(L, "click");
            });
            if (this.opts.onClick) {
                I.addListener(this, "click", M.onClick);
            }
        }
        D.prototype = {
            add: function() {
                var T = F(document), M = F(document.body), N = F(window), O = this;
                if (this.opts.disableScroll&&!B) {
                    B = glow.dom.create(A + 'height:100%;overflow:hidden;">' + A + '"></div></div>');
                    var R = G._scrollPos(), P = M[0].style, L = N.height(), S = N.width(), K = B.get("div"), J = M.children().filter(function() {
                        return (" " + this.className + " ").indexOf("glow-noMask")==-1;
                    });
                    C = {
                        margin: [M.css("margin-top"), M.css("margin-right"), M.css("margin-bottom"), M.css("margin-left")],
                        padding: [M.css("padding-top"), M.css("padding-right"), M.css("padding-bottom"), M.css("padding-left")],
                        height: M.css("height")
                    };
                    P.margin = P.padding = 0;
                    P.height = "100%";
                    K[0].style.zIndex = this.opts.zIndex - 1;
                    B.appendTo(M);
                    K.css("margin", C.margin.join(" ")).css("padding", C.padding.join(" ")).css("top", - R.y - parseFloat(C.margin[0]) + "px").css("left", - R.x + "px").append(J);
                }
                function Q() {
                    var W = M.height();
                    for (var U = 0; U < 2; U++) {
                        O.maskElement.css("width", "100%").css("height", (O.opts.disableScroll ? B.height() : Math.max(W, N.height())) + "px");
                    }
                    if (glow.env.ie < 7) {
                        var V = O.maskElement[0].style;
                        O._iframe.css("width", V.width).css("height", V.height);
                    }
                }
                this.maskElement.css("visibility", "visible").css("display", "block");
                if (glow.env.ie < 7) {
                    this._iframe.css("display", "block");
                }
                Q();
                this._resizeListener = I.addListener(window, "resize", Q);
            },
            remove: function() {
                this.maskElement.css("visibility", "hidden").css("display", "none");
                if (glow.env.ie < 7) {
                    this._iframe.css("display", "none");
                }
                I.removeListener(this._resizeListener);
                if (this.opts.disableScroll) {
                    var J = F(document.body), K = B.children();
                    K.children().appendTo(J);
                    window.scroll( - parseInt(K.css("left")), - parseInt(K.css("top")));
                    B.remove();
                    J.css("margin", C.margin.join(" ")).css("padding", C.padding.join(" ")).css("height", C.height);
                    delete B;
                    B = undefined;
                }
            }
        };
        return D;
    }
});;
glow.module("glow.widgets.Overlay", "0.4.0", {
    require: ["glow.dom", "glow.events", "glow.anim", "glow.widgets", "glow.widgets.Mask"],
    implementation: function() {
        var K = glow.dom, D = K.get, A = glow.events, I = glow.widgets, L = glow.env, J = glow.anim, H = glow.tweens, E = '<div class="glow-overlay glow-noMask"></div>', N = '<iframe class="glow-noMask" style="display:none;margin:0;padding:0;position:absolute;filter:alpha(opacity=0)"></iframe>', Q = [], G = /.swf($|\?)/i, B = /<param\s+(?:[^>]*(?:name=["'?]\bwmode["'?][\s\/>]|\bvalue=["'?](?:opaque|transparent)["'?][\s\/>])[^>]*){2}/i;
        function C(S) {
            if (Q.length) {
                return ;
            }
            var T = 0;
            D("object, embed").each(function() {
                var U = this, V;
                if ((U.getAttribute("type") == "application/x-shockwave-flash" || G.test(U.getAttribute("data") || U.getAttribute("src") || "") || (U.getAttribute("classid") || "").toLowerCase() == "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000")&&!D(U).isWithin(S.content)) {
                    V = U.getAttribute("wmode");
                    if ((U.nodeName == "OBJECT"&&!B.test(U.innerHTML)) || (V != "transparent" && V != "opaque")) {
                        Q[T++] = [U, U.style.visibility];
                        U.style.visibility = "hidden";
                    }
                }
            });
        }
        function R() {
            for (var T = 0, S = Q.length; T < S; T++) {
                Q[T][0].style.visibility = Q[T][1];
            }
            Q = [];
        }
        function M(X, a) {
            var Y = [], Z = [], U = 0, W = 0, b = X.opts.anim, c = X.opts.mask, S = X.container, T, V = 0;
            if (b == "fade") {
                S.css("opacity", (a ? 0 : 1));
                Y[W++] = [J.css(S, 0.3, {
                    opacity: {
                        from: (a ? 0 : 1),
                        to: (a ? 1 : 0)
                    }
                })];
                if (a) {
                    Y[W - 1][1] = function() {
                        S.css("opacity", "");
                    };
                }
                Y[W++] = [O(X, a)];
            } else {
                if (b == "roll") {
                    if (a) {
                        S.css("height", "");
                        V = S.height();
                        S.css("height", "0");
                    }
                    Y[W++] = [function() {
                        if (L.webkit < 522 && a) {
                            S.css("display", "none");
                            setTimeout(function() {
                                S.css("overflow", "hidden").css("display", "block");
                            }, 0);
                        } else {
                            S.css("overflow", "hidden");
                        }
                    }, J.css(S, 0.3, {
                        height: {
                            to: V
                        }
                    }, {
                        tween: a ? H.easeOut(): H.easeIn()
                    }), function() {
                        if (!a) {
                            S.css("visibility", "hidden");
                        }
                        S.css("height", "");
                        S.css("overflow", "");
                    }
                    ];
                    Y[W++] = [O(X, a)];
                }
            }
            return new J.Timeline(Y);
        }
        function O(U, T) {
            if (!U.opts.modal) {
                return 0;
            }
            var S = U.opts.mask, W = S.opts.opacity, V = S.maskElement;
            V.css("opacity", (T ? 0 : W));
            return J.css(V, 0.1, {
                opacity: {
                    from: (T ? 0 : W),
                    to: (T ? W : 0)
                }
            });
        }
        function P(S) {
            R();
            S.container.css("visibility", "").css("display", "");
            if (S.opts.modal) {
                S.opts.mask.remove();
            } else {
                if (glow.env.ie < 7) {
                    S._iframe.css("display", "none");
                }
            }
            A.removeListener(S._scrollEvt);
            A.removeListener(S._resizeEvt);
        }
        function F(X, W) {
            if (W && W.mask) {
                W.modal = true;
            }
            this.opts = glow.lang.apply({
                modal: false,
                mask: new glow.widgets.Mask(W.zIndex ? {
                    zIndex: W.zIndex - 1
                } : {}),
                closeOnMaskClick: true,
                zIndex: 9990,
                autoPosition: true,
                x: "50%",
                y: "50%"
            }, W || {});
            var S = this.content = D(X), V = this, U = this.container = K.create(E).css("z-index", this.opts.zIndex), T = document.body;
            this.autoPosition = this.opts.autoPosition;
            this.isShown = false;
            this._blockActions = false;
            U.appendTo(T).append(S);
            if (this.opts.closeOnMaskClick) {
                A.addListener(this.opts.mask, "click", function() {
                    V.hide();
                });
            }
            if (glow.env.ie < 7&&!this.opts.modal) {
                this._iframe = K.create(N).css("z-index", this.opts.zIndex - 1).appendTo(T);
            }
        }
        F.prototype = {
            setPosition: function(Z, X) {
                if (!this.autoPosition) {
                    return this;
                }
                if (Z !== undefined&&!(Z.source)) {
                    this.opts.x = Z;
                    this.opts.y = X;
                }
                var V = D(window), Z = this.opts.x, X = this.opts.y, T = (!L.ie&&!(L.webkit < 522)) || (L.ie > 6 && L.standardsMode), a = parseFloat(this.opts.x), W = parseFloat(this.opts.y), Y = (this.opts.mask.opts.disableScroll || T) ? {
                    x: 0,
                    y: 0
                }
                : I._scrollPos(), S = this.container;
                T && S.css("position", "fixed");
                if (typeof Z == "string" && Z.indexOf("%")!=-1) {
                    S.css("left", Math.max(((V.width() - S[0].offsetWidth) * (a / 100)) + Y.x, Y.x) + "px");
                } else {
                    S.css("left", a + Y.x + "px");
                }
                if (typeof X == "string" && X.indexOf("%")!=-1) {
                    S.css("top", Math.max(((V.height() - S[0].offsetHeight) * (W / 100)) + Y.y, Y.y) + "px");
                } else {
                    S.css("top", W + Y.y + "px");
                }
                if (glow.env.ie < 7&&!this.opts.modal) {
                    var U = S[0].style;
                    this._iframe.css("top", U.top).css("left", U.left).css("width", S[0].offsetWidth + "px").css("height", S[0].offsetHeight + "px");
                }
                return this;
            },
            show: function() {
                var T = this, S, U = T.opts.anim;
                if (T._blockActions || T.isShown) {
                    return T;
                }
                if (A.fire(T, "show").defaultPrevented()) {
                    return T;
                }
                C(T);
                T.container.css("display", "block");
                if (T.opts.modal) {
                    T.opts.mask.add();
                } else {
                    if (glow.env.ie < 7) {
                        T._iframe.css("display", "block");
                    }
                }
                T._scrollEvt = A.addListener(window, "scroll", T.setPosition, T);
                T._resizeEvt = A.addListener(window, "resize", T.setPosition, T);
                T.setPosition();
                if (typeof U == "string") {
                    S = M(T, true);
                } else {
                    if (typeof U == "function") {
                        S = U(T, true);
                    } else {
                        if (U) {
                            S = U.show;
                        }
                    }
                }
                if (S) {
                    if (!S._overlayEvtAttached) {
                        A.addListener(S, "complete", function() {
                            T._blockActions = false;
                            T.isShown = true;
                            A.fire(T, "afterShow");
                        });
                        S._overlayEvtAttached = true;
                    }
                    T._blockActions = true;
                    S.start();
                    T.container.css("visibility", "visible");
                } else {
                    T.container.css("visibility", "visible");
                    T.isShown = true;
                    A.fire(T, "afterShow");
                }
                return T;
            },
            hide: function() {
                var T = this, S, U = T.opts.anim;
                if (this._blockActions ||!T.isShown) {
                    return T;
                }
                if (A.fire(T, "hide").defaultPrevented()) {
                    return T;
                }
                if (typeof U == "string") {
                    S = M(T, false);
                } else {
                    if (typeof U == "function") {
                        S = U(T, false);
                    } else {
                        if (U) {
                            S = U.hide;
                        }
                    }
                }
                if (S) {
                    if (!S._overlayEvtAttached) {
                        A.addListener(S, "complete", function() {
                            P(T);
                            T._blockActions = false;
                            T.isShown = false;
                            A.fire(T, "afterHide");
                        });
                        S._overlayEvtAttached = true;
                    }
                    T._blockActions = true;
                    S.start();
                } else {
                    P(T);
                    T.isShown = false;
                    A.fire(T, "afterHide");
                }
                return T;
            }
        };
        return F;
    }
});;
glow.module("glow.widgets.Panel", "0.4.0", {
    require: ["glow.dom", "glow.events", "glow.widgets.Overlay"],
    implementation: function() {
        var E = glow.dom, F = E.get, K = glow.events, H = glow.widgets, A = H.Overlay, C = glow.lang, G = glow.env, B, J = {};
        function D(P) {
            var N = P ? "<div></div>": "";
            for (var M = 1, L = arguments.length, O = []; M < L; M++) {
                O[M - 1] = '<div class="' + arguments[M] + '">' + N + "</div>";
            }
            return O.join("");
        }
        B = function() {
            var M = [], L = 0;
            M[L++] = '<div class="glow-panel">';
            M[L++] = '<div class="glow-defaultSkin">';
            M[L++] = D(false, "glow-infoPanel-pointerT", "glow-infoPanel-pointerL", "glow-infoPanel-pointerR");
            M[L++] = '<div class="pc">';
            M[L++] = D(false, "tr", "tl");
            M[L++] = D(true, "tb");
            M[L++] = '<div class="tc">';
            M[L++] = D(false, "bars");
            M[L++] = '<div class="c">';
            M[L++] = '<a class="glow-panel-close" href="#" title="close">X</a>';
            M[L++] = D(false, "glow-panel-hd", "glow-panel-bd", "glow-panel-ft");
            M[L++] = "</div>";
            M[L++] = "</div>";
            M[L++] = D(false, "br", "bl");
            M[L++] = D(true, "bb");
            M[L++] = "</div>";
            M[L++] = D(false, "glow-infoPanel-pointerB");
            M[L++] = "</div>";
            M[L++] = "</div>";
            return M.join("");
        }();
        function I(R, L) {
            R = F(R);
            L = L || {};
            if (typeof L.width == "number") {
                L.width += "px";
            }
            if (L.template) {
                var M = true;
            }
            L = glow.lang.apply({
                template: B,
                width: "400px",
                modal: true,
                theme: "dark"
            }, L);
            var T = E.create(L.template), P = R.get("> .hd"), N = R.get("> .ft"), O = document.body, Q = this, S;
            if (!M) {
                T.addClass("glow-panel-" + L.theme);
                if (!J[L.theme] && O.className.indexOf("glow-basic")==-1) {
                    S = T.clone().addClass("glow-panel-preload").appendTo(O);
                    J[L.theme] = true;
                }
            }
            if (R.length > 1) {
                R.each(function() {
                    var U = F(this);
                    if (U.hasClass("hd")) {
                        P = U;
                    } else {
                        if (U.hasClass("ft")) {
                            N = U;
                        }
                    }
                });
            }
            this.header = T.get(".glow-panel-hd");
            this.footer = T.get(".glow-panel-ft");
            this.body = T.get(".glow-panel-bd");
            if (R.isWithin(O)) {
                T.insertBefore(R);
            } else {
                T.appendTo(O);
            }
            this.body.append(R);
            if (P.length) {
                this.header.append(P);
            } else {
                if (!M) {
                    T.addClass("glow-panel-noHeader");
                }
            }
            if (N.length) {
                this.footer.append(N);
            }
            K.addListener(T.get(".glow-panel-close"), "click", function() {
                Q.hide();
                return false;
            });
            A.call(this, T, L);
            this.container.css("width", L.width);
        }
        C.extend(I, A);
        return I;
    }
});;
glow.module("glow.widgets.Sortable", "0.4.0", {
    require: ["glow.dom", "glow.events", "glow.dragdrop"],
    implementation: function() {
        var E = glow.dom.get, H = glow.events, B = H.fire, A = H.addListener;
        function C(K) {
            var J = 0, L = K[0], M;
            if (glow.env.ie) {
                do {
                    J += L.offsetTop;
                    L = L.offsetParent;
                    if (L) {
                        M = E(L).css("position");
                    }
                }
                while (L&&!(M == "absolute" || M == "fixed" || M == "relative"));
            } else {
                J = L.offsetTop;
            }
            return J;
        }
        var D = function(K, J) {
            this._opts = J = glow.lang.apply({
                dropIndicatorClass: "glow-sortable-dropindicator",
                equaliseColumns: true,
                draggableOptions: {}
            }, J || {});
            this.constrainDragTo = J.constrainDragTo;
            this.axis = J.axis;
            this.draggables = [];
            var K = this.containers = E(K), L = this.dropTargets = [];
            if (J.onSort) {
                A(this, "sort", J.onSort);
            }
            K.each(function(M) {
                L[M] = new glow.dragdrop.DropTarget(this, {
                    tolerance: "intersect",
                    dropIndicator: "spacer",
                    dropIndicatorClass: J.dropIndicatorClass
                });
            });
            this.addItems(K.get("> *"));
        };
        function F() {
            var M = [], N = 0, K, O = this.dropTargets;
            this.containers.each(function(P) {
                var Q = E(this);
                M[P] = C(Q);
                K = M[P] + Q[0].offsetHeight;
                if (glow.env.khtml) {
                    K -= Q.css("margin-top") + Q.css("margin-bottom");
                }
                if (K > N) {
                    N = K;
                }
            });
            for (var L = 0, J = this.dropTargets.length; L < J; L++) {
                this.dropTargets[L].setLogicalBottom(N);
            }
        }
        function I(M) {
            var J = M.attachedTo, K = J.element, L = J.activeTarget;
            this._previous = K.prev();
            this._parent = K.parent();
            if (L) {
                L.moveToPosition(J);
            }
        }
        function G(L) {
            var J = L.attachedTo, K = J.element;
            if (!K.prev().eq(this._previous || []) ||!K.parent().eq(this._parent)) {
                B(this, "sort");
            }
            delete this._prev;
            delete this._parent;
        }
        D.prototype = {
            addItems: function(K) {
                var L = this, J = this._opts.draggableOptions;
                E(K).each(function() {
                    var M = new glow.dragdrop.Draggable(this, glow.lang.apply({
                        placeholder: "none",
                        axis: L.axis,
                        container: L.constrainDragTo,
                        dropTargets: L.dropTargets,
                        acceptDropOutside: (L.containers.length == 1)
                    }, J));
                    if (L._opts.equaliseColumns) {
                        A(M, "drag", F, L);
                    }
                    A(M, "drop", I, L);
                    A(M, "afterDrop", G, L);
                    L.draggables.push(M);
                });
            }
        };
        return D;
    }
});;
glow.module("glow.widgets.InfoPanel", "0.4.0", {
    require: ["glow.dom", "glow.events", "glow.widgets.Panel"],
    implementation: function() {
        var C = glow.dom, E = C.get, L = glow.events, K = glow.widgets, B = glow.lang, H = glow.env, G, J = /glow\-infoPanel\-point[TRBL]/, F = {
            T: {
                x: "50%",
                y: "100%"
            },
            R: {
                x: 0,
                y: "50%"
            },
            B: {
                x: "50%",
                y: 0
            },
            L: {
                x: "100%",
                y: "50%"
            }
        };
        glow.ready(function() {
            G = E(window);
        });
        function D(M, O) {
            var R = [M.x, M.y], P = ["x", "y"], Q = ["Width", "Height"], N = 0;
            for (; N < 2; N++) {
                if (R[N].slice) {
                    R[N] = parseFloat(M[P[N]]);
                    if (M[P[N]].slice( - 1) == "%") {
                        R[N] = O[0]["offset" + Q[N]] * (R[N] / 100);
                    }
                }
            }
            return {
                x: R[0],
                y: R[1]
            };
        }
        function I(R, Q) {
            var P = K._scrollPos(), M = {
                x: G.width(),
                y: G.height()
            }, O = {
                T: M.y - R.y - Q.y + P.y,
                R: R.x - P.x,
                B: R.y - P.y,
                L: M.x - R.x - Q.x + P.x
            }, N = ["T", "R", "B", "L"];
            N.sort(function(T, S) {
                return O[S] - O[T];
            });
            return N[0];
        }
        function A(O, N) {
            N = N || {};
            if (N.template) {
                var M = true;
            }
            N = glow.lang.apply({
                modal: false,
                theme: "light",
                autoPosition: !!N.context,
                pointerRegisters: {
                    t: {
                        x: "50%",
                        y: 0
                    },
                    r: {
                        x: "100%",
                        y: "50%"
                    },
                    b: {
                        x: "50%",
                        y: "100%"
                    },
                    l: {
                        x: 0,
                        y: "50%"
                    }
                }
            }, N);
            N.context = N.context && E(N.context);
            K.Panel.call(this, O, N);
            if (!M) {
                this.content.addClass("glow-infoPanel");
            }
            this.content.addClass("glow-infoPanel-point" + (N.pointerPosition || "t").toUpperCase());
        }
        B.extend(A, K.Panel);
        B.apply(A.prototype, {
            setPosition: function(T, R) {
                var U = (T !== undefined&&!(T.source));
                if (!(this.autoPosition || U)) {
                    return this;
                } else {
                    if (U) {
                        this.autoPosition = false;
                    }
                }
                var X = this.opts, O = this.content[0], Y = X.pointerPosition, M = X.context, W = this.container, N, S = U ? {
                    x: T,
                    y: R
                }
                : M.offset(), V = U ? {
                    x: 0,
                    y: 0
                }
                : {
                    x: M[0].offsetWidth,
                    y: M[0].offsetHeight
                }, Z, a, Q, d = W.offset(), b, c;
                if (!Y) {
                    Y = I(S, V);
                    if (c != Y) {
                        c = Y;
                        O.className = O.className.replace(J, "glow-infoPanel-point" + Y);
                        N = W.get(".glow-infoPanel-pointer" + Y);
                    }
                } else {
                    Y = Y.toUpperCase();
                }
                if (!N) {
                    N = W.get(".glow-infoPanel-pointer" + Y);
                }
                Z = U ? {
                    x: 0,
                    y: 0
                } : D(X.offsetInContext || F[Y], M);
                Q = D(X.pointerRegisters[Y.toLowerCase()], N);
                b = N.offset();
                a = {
                    x: b.x - d.x + Q.x,
                    y: b.y - d.y + Q.y
                };
                W.css("left", S.x + Z.x - a.x + "px").css("top", S.y + Z.y - a.y + "px");
                if (H.ie < 7&&!X.modal) {
                    var P = W[0].style;
                    this._iframe.css("top", P.top).css("left", P.left).css("width", W[0].offsetWidth + "px").css("height", W[0].offsetHeight + "px");
                }
                return this;
            },
            setContext: function(M) {
                this.opts.context = E(M);
                this.autoPosition = true;
                if (this.container[0].style.display == "block") {
                    this.setPosition();
                }
                return this;
            }
        });
        return A;
    }
}); /*@end @*/

