/*
 * Glow JavaScript Library
 * Copyright (c) 2008 British Broadcasting Corporation
 */
/*@cc_on @*/
/*@if (@_jscript_version > 5.1)@*/
;
glow.module("glow.tweens", "0.4.0", {
    require: [],
    implementation: function() {
        function A(B) {
            return function(C) {
                return 1 - B(1 - C);
            };
        }
        return {
            linear: function() {
                return function(B) {
                    return B;
                };
            },
            easeIn: function(B) {
                B = B || 2;
                return function(C) {
                    return Math.pow(1, B - 1) * Math.pow(C, B);
                };
            },
            easeOut: function(B) {
                return A(this.easeIn(B));
            },
            easeBoth: function(B) {
                return this.combine(this.easeIn(B), this.easeOut(B));
            },
            overshootIn: function(B) {
                return A(this.overshootOut(B));
            },
            overshootOut: function(B) {
                B = B || 1.70158;
                return function(C) {
                    if (C == 0 || C == 1) {
                        return C;
                    }
                    return ((C -= 1) * C * ((B + 1) * C + B) + 1);
                };
            },
            overshootBoth: function(B) {
                return this.combine(this.overshootIn(B), this.overshootOut(B));
            },
            bounceIn: function() {
                return A(this.bounceOut());
            },
            bounceOut: function() {
                return function(B) {
                    if (B < (1 / 2.75)) {
                        return 7.5625 * B * B;
                    } else {
                        if (B < (2 / 2.75)) {
                            return (7.5625 * (B -= (1.5 / 2.75)) * B + 0.75);
                        } else {
                            if (B < (2.5 / 2.75)) {
                                return (7.5625 * (B -= (2.25 / 2.75)) * B + 0.9375);
                            } else {
                                return (7.5625 * (B -= (2.625 / 2.75)) * B + 0.984375);
                            }
                        }
                    }
                };
            },
            bounceBoth: function() {
                return this.combine(this.bounceIn(), this.bounceOut());
            },
            elasticIn: function(B, C) {
                return A(this.elasticOut(B, C));
            },
            elasticOut: function(B, C) {
                return function(D) {
                    if (D == 0 || D == 1) {
                        return D;
                    }
                    if (!C) {
                        C = 0.3;
                    }
                    if (!B || B < 1) {
                        B = 1;
                        var E = C / 4;
                    } else {
                        var E = C / (2 * Math.PI) * Math.asin(1 / B);
                    }
                    return B * Math.pow(2, - 10 * D) * Math.sin((D - E) * (2 * Math.PI) / C) + 1;
                };
            },
            elasticBoth: function(B, C) {
                C = C || 0.45;
                return this.combine(this.elasticIn(B, C), this.elasticOut(B, C));
            },
            combine: function(C, B) {
                return function(D) {
                    if (D < 0.5) {
                        return C(D * 2) / 2;
                    } else {
                        return B((D - 0.5) * 2) / 2 + 0.5;
                    }
                };
            }
        };
    }
});;
glow.module("glow.anim", "0.4.0", {
    require: ["glow.tweens", "glow.events", "glow.dom"],
    implementation: function() {
        var manager, events = glow.events, dom = glow.dom, get = dom.get, debug = glow.debug, hasUnits = /width|height|top$|bottom$|left$|right$|spacing$|indent$|font-size/, noNegatives = /width|height|padding|opacity/, usesYAxis = /height|top/, getUnit = /[\d\.]+(\D+)/, testElement = dom.create('<div style="position:absolute;visibility:hidden"></div>');
        (function() {
            var queue = [], queueLen = 0, intervalTime = 1, interval;
            manager = {
                addToQueue: function(anim) {
                    queue[queueLen++] = anim;
                    anim._playing = true;
                    anim._timeAnchor = anim._timeAnchor || new Date().valueOf();
                    if (!interval) {
                        this.startInterval();
                    }
                },
                removeFromQueue: function(anim) {
                    for (var i = 0; i < queueLen; i++) {
                        if (queue[i] == anim) {
                            queue.splice(i, 1);
                            anim._timeAnchor = null;
                            anim._playing = false;
                            if (--queueLen == 0) {
                                this.stopInterval();
                            }
                            return ;
                        }
                    }
                },
                startInterval: function() {
                    interval = window.setInterval(this.processQueue, intervalTime);
                },
                stopInterval: function() {
                    window.clearInterval(interval);
                    interval = null;
                },
                processQueue: function() {
                    var anim, i, now = new Date().valueOf();
                    for (i = 0; i < queueLen; i++) {
                        anim = queue[i];
                        if (anim.position == anim.duration) {
                            manager.removeFromQueue(anim);
                            i--;
                            events.fire(anim, "complete");
                            continue;
                        }
                        if (anim.useSeconds) {
                            anim.position = (now - anim._timeAnchor) / 1000;
                            if (anim.position > anim.duration) {
                                anim.position = anim.duration;
                            }
                        } else {
                            anim.position++;
                        }
                        anim.value = anim.tween(anim.position / anim.duration);
                        events.fire(anim, "frame");
                    }
                }
            };
        })();
        function convertCssUnit(element, fromValue, toUnit, axis) {
            var elmStyle = testElement[0].style, axisProp = (axis == "x") ? "width": "height", startPixelValue, toUnitPixelValue;
            elmStyle.margin = elmStyle.padding = elmStyle.border = "0";
            startPixelValue = testElement.css(axisProp, fromValue).insertAfter(element)[axisProp]();
            toUnitPixelValue = testElement.css(axisProp, 10 + toUnit)[axisProp]() / 10;
            testElement.remove();
            return startPixelValue / toUnitPixelValue;
        }
        function keepWithinRange(num, start, end) {
            if (start !== undefined && num < start) {
                return start;
            }
            if (end !== undefined && num > end) {
                return end;
            }
            return num;
        }
        function buildAnimFunction(element, spec) {
            var cssProp, r = ["a=(function(){"], rLen = 1, fromUnit, unitDefault = [0, "px"], to, from, unit, a;
            for (cssProp in spec) {
                r[rLen++] = 'element.css("' + cssProp + '", ';
                to = spec[cssProp].to;
                if ((from = spec[cssProp].from) === undefined) {
                    if (cssProp == "font-size" || cssProp == "background-position") {
                        throw new Error("From value must be set for " + cssProp);
                    }
                    from = element.css(cssProp);
                }
                if (hasUnits.test(cssProp)) {
                    unit = (getUnit.exec(spec[cssProp].to) || unitDefault)[1];
                    fromUnit = (getUnit.exec(from) || unitDefault)[1];
                    from = parseFloat(from) || 0;
                    to = parseFloat(to) || 0;
                    if (from && unit != fromUnit) {
                        if (cssProp == "font-size") {
                            throw new Error("Units must be the same for font-size");
                        }
                        from = convertCssUnit(element, from + fromUnit, unit, usesYAxis.test(cssProp) ? "y" : "x");
                    }
                    if (noNegatives.test(cssProp)) {
                        r[rLen++] = "keepWithinRange((" + (to - from) + " * this.value) + " + from + ', 0) + "' + unit + '"';
                    } else {
                        r[rLen++] = "(" + (to - from) + " * this.value) + " + from + ' + "' + unit + '"';
                    }
                } else {
                    if (!(isNaN(from) || isNaN(to))) {
                        from = Number(from);
                        to = Number(to);
                        r[rLen++] = "(" + (to - from) + " * this.value) + " + from;
                    } else {
                        if (cssProp.indexOf("color")!=-1) {
                            to = dom.parseCssColor(spec[cssProp].to);
                            if (!glow.lang.hasOwnProperty(from, "r")) {
                                from = dom.parseCssColor(from);
                            }
                            r[rLen++] = '"rgb(" + keepWithinRange(Math.round(' + (to.r - from.r) + " * this.value + " + from.r + '), 0, 255) + "," + keepWithinRange(Math.round(' + (to.g - from.g) + " * this.value + " + from.g + '), 0, 255) + "," + keepWithinRange(Math.round(' + (to.b - from.b) + " * this.value + " + from.b + '), 0, 255) + ")"';
                        } else {
                            if (cssProp == "background-position") {
                                var vals = {}, fromTo = ["from", "to"], unit = (getUnit.exec(from) || unitDefault)[1];
                                vals.fromOrig = from.toString().split(/\s/);
                                vals.toOrig = to.toString().split(/\s/);
                                if (vals.fromOrig[1] === undefined) {
                                    vals.fromOrig[1] = "50%";
                                }
                                if (vals.toOrig[1] === undefined) {
                                    vals.toOrig[1] = "50%";
                                }
                                for (var i = 0; i < 2; i++) {
                                    vals[fromTo[i] + "X"] = parseFloat(vals[fromTo[i] + "Orig"][0]);
                                    vals[fromTo[i] + "Y"] = parseFloat(vals[fromTo[i] + "Orig"][1]);
                                    vals[fromTo[i] + "XUnit"] = (getUnit.exec(vals[fromTo[i] + "Orig"][0]) || unitDefault)[1];
                                    vals[fromTo[i] + "YUnit"] = (getUnit.exec(vals[fromTo[i] + "Orig"][1]) || unitDefault)[1];
                                }
                                if ((vals.fromXUnit !== vals.toXUnit) || (vals.fromYUnit !== vals.toYUnit)) {
                                    throw new Error("Mismatched axis units cannot be used for " + cssProp);
                                }
                                r[rLen++] = "(" + (vals.toX - vals.fromX) + " * this.value + " + vals.fromX + ') + "' + vals.fromXUnit + ' " + (' + (vals.toY - vals.fromY) + " * this.value + " + vals.fromY + ') + "' + vals.fromYUnit + '"';
                            }
                        }
                    }
                }
                r[rLen++] = ");";
            }
            r[rLen++] = "})";
            return eval(r.join(""));
        }
        var r = {};
        r.css = function(element, duration, spec, opts) {
            element = get(element);
            var anim = new r.Animation(duration, opts), cssProp;
            events.addListener(anim, "frame", buildAnimFunction(element, spec));
            return anim;
        };
        r.Animation = function(duration, opts) {
            opts = glow.lang.apply({
                useSeconds: true,
                tween: glow.tweens.linear()
            }, opts);
            this._playing = false;
            this._timeAnchor = null;
            this.duration = duration;
            this.useSeconds = opts.useSeconds;
            this.tween = opts.tween;
            this.position = 0;
            this.value = 0;
        };
        r.Animation.prototype = {
            start: function() {
                if (this._playing) {
                    this.stop();
                }
                var e = events.fire(this, "start");
                if (e.defaultPrevented()) {
                    return this;
                }
                this.position = 0;
                manager.addToQueue(this);
                return this;
            },
            stop: function() {
                if (this._playing) {
                    var e = events.fire(this, "stop");
                    if (e.defaultPrevented()) {
                        return this;
                    }
                    manager.removeFromQueue(this);
                }
                return this;
            },
            resume: function() {
                if (!this._playing) {
                    var e = events.fire(this, "resume");
                    if (e.defaultPrevented()) {
                        return this;
                    }
                    this._timeAnchor = new Date().valueOf() - (this.position * 1000);
                    manager.addToQueue(this);
                }
                return this;
            },
            isPlaying: function() {
                return this._playing;
            },
            goTo: function(pos) {
                this._timeAnchor = new Date().valueOf() - ((this.position = pos) * 1000);
                this.value = this.tween(this.duration && this.position / this.duration);
                events.fire(this, "frame");
                return this;
            }
        };
        r.Timeline = function(channels, opts) {
            this._channels = (channels[0] && channels[0].push) ? channels : [channels];
            this._channelPos = [];
            this._playing = false;
            this.loop=!!(opts && opts.loop);
            var i, j, iLen, jLen, channel, allChannels = this._channels, totalDuration = 0, channelDuration;
            for (i = 0, iLen = allChannels.length; i < iLen; i++) {
                channel = allChannels[i];
                channelDuration = 0;
                for (j = 0, jLen = channel.length; j < jLen; j++) {
                    if (typeof channel[j] == "number") {
                        channel[j] = new r.Animation(channel[j]);
                    }
                    if (channel[j] instanceof r.Animation) {
                        if (!channel[j].useSeconds) {
                            throw new Error("Timelined animations must be timed in seconds");
                        }
                        channel[j]._timelineOffset = channelDuration * 1000;
                        channelDuration += channel[j].duration;
                        channel[j]._channelIndex = i;
                    }
                }
                totalDuration = Math.max(channelDuration, totalDuration);
            }
            this._controlAnim = new r.Animation(totalDuration);
            events.addListener(this._controlAnim, "frame", this._processFrame, this);
            events.addListener(this._controlAnim, "complete", this._complete, this);
        };
        r.Timeline.prototype = {
            _advanceChannel: function(i) {
                var currentAnim = this._channels[i][this._channelPos[i]], nextAnim = this._channels[i][++this._channelPos[i]];
                if (currentAnim && currentAnim._playing) {
                    currentAnim._playing = false;
                    events.fire(currentAnim, "complete");
                }
                if ((nextAnim) !== undefined) {
                    if (typeof nextAnim == "function") {
                        nextAnim();
                        this._advanceChannel(i);
                    } else {
                        nextAnim.position = 0;
                        nextAnim._channelIndex = i;
                        events.fire(nextAnim, "start");
                        nextAnim._playing = true;
                    }
                }
            },
            _complete: function() {
                if (this.loop) {
                    this.start();
                    return ;
                }
                events.fire(this, "complete");
            },
            _processFrame: function() {
                var i, len, anim, controlAnim = this._controlAnim, msFromStart = (new Date().valueOf()) - controlAnim._timeAnchor;
                for (i = 0, len = this._channels.length; i < len; i++) {
                    if (!(anim = this._channels[i][this._channelPos[i]])) {
                        continue;
                    }
                    anim.position = (msFromStart - anim._timelineOffset) / 1000;
                    if (anim.position > anim.duration) {
                        anim.position = anim.duration;
                    }
                    anim.value = anim.tween(anim.position / anim.duration);
                    events.fire(anim, "frame");
                    if (anim.position == anim.duration) {
                        this._advanceChannel(i);
                    }
                }
            },
            start: function() {
                var e = events.fire(this, "start");
                if (e.defaultPrevented()) {
                    return this;
                }
                var i, iLen, j, jLen, anim;
                this._playing = true;
                for (i = 0, iLen = this._channels.length; i < iLen; i++) {
                    this._channelPos[i] =- 1;
                    this._advanceChannel(i);
                    for (j = this._channels[i].length; j; j--) {
                        anim = this._channels[i][j];
                        if (anim instanceof r.Animation) {
                            anim.goTo(0);
                        }
                    }
                }
                this._controlAnim.start();
            },
            stop: function() {
                if (this._playing) {
                    var e = events.fire(this, "stop");
                    if (e.defaultPrevented()) {
                        return this;
                    }
                    this._playing = false;
                    var anim;
                    for (var i = 0, len = this._channels.length; i < len; i++) {
                        anim = this._channels[i][this._channelPos[i]];
                        if (anim instanceof r.Animation && anim._playing) {
                            events.fire(anim, "stop");
                            anim._playing = false;
                        }
                    }
                    this._controlAnim.stop();
                }
            },
            resume: function() {
                if (!this._playing) {
                    var e = events.fire(this, "resume");
                    if (e.defaultPrevented()) {
                        return this;
                    }
                    this._playing = true;
                    var anim;
                    for (var i = 0, len = this._channels.length; i < len; i++) {
                        anim = this._channels[i][this._channelPos[i]];
                        if (anim instanceof r.Animation&&!anim._playing) {
                            events.fire(anim, "resume");
                            anim._playing = true;
                        }
                    }
                    this._controlAnim.resume();
                }
            },
            isPlaying: function() {
                return this._playing;
            }
        };
        return r;
    }
});;
glow.module("glow.dragdrop", "0.4.0", {
    require: ["glow.tweens", "glow.events", "glow.dom", "glow.anim"],
    implementation: function() {
        var C = glow.events, I = C.addListener, Q = C.fire, G = C.removeListener, O = glow.dom, H = O.get, K = O.create;
        var L = {}, R = 1000, A = (document.compatMode == "CSS1Compat" && glow.env.ie >= 5) ? true: false, S = (document.compatMode != "CSS1Compat" && glow.env.ie >= 5) ? true: false, D = glow.env.ie >= 5;
        function B(T, V) {
            var W = T.prototype[V];
            var U = "cached_" + V;
            T.prototype[V] = function() {
                if (U in this) {
                    return this[U];
                }
                return this[U] = W.apply(this, arguments);
            };
        }
        function F(T, U) {
            var W = T.prototype[U];
            var V = "cached_" + U;
            T.prototype[U] = function(X) {
                if (!this[V]) {
                    this[V] = {};
                }
                if (X in this[V]) {
                    return this[V][X];
                }
                return this[V][X] = W.apply(this, arguments);
            };
        }
        function P(W, V) {
            for (var U = 0, T = V.length; U < T; U++) {
                delete W["cached_" + V[U]];
            }
        }
        var M = function(T) {
            this.el = T;
        };
        M.prototype = {
            val: function(T) {
                var U = parseInt(this.el.css(T));
                return isNaN(U) ? 0 : U;
            },
            width: function() {
                return this.borderWidth() - this.val("border-left-width") - this.val("padding-left") - this.val("padding-right") - this.val("border-right-width");
            },
            height: function() {
                return this.borderHeight() - this.val("border-top-width") - this.val("padding-top") - this.val("padding-bottom") - this.val("border-bottom-width");
            },
            offsetParentPageTop: function() {
                var T = this.el[0], V, U;
                while (T = T.offsetParent) {
                    V = H(T).css("position");
                    if (V == "absolute" || V == "fixed" || V == "relative") {
                        break;
                    }
                }
                if (!T) {
                    return 0;
                }
                U = T.offsetTop;
                while (T = T.offsetParent) {
                    U += T.offsetTop;
                }
                return U;
            },
            offsetTop: function() {
                var U = 0, V = this.el[0], a, Z;
                if (glow.env.ie) {
                    do {
                        Z = V.offsetTop;
                        if (!isNaN(Z)) {
                            U += Z;
                        }
                        V = V.offsetParent;
                        if (V) {
                            a = H(V).css("position");
                        }
                    }
                    while (V&&!(a == "absolute" || a == "fixed" || a == "relative"));
                } else {
                    U = V.offsetTop;
                }
                if (glow.env.opera) {
                    var X = parseInt(H(V.offsetParent).css("border-top-width"));
                    U -= isNaN(X) ? 0 : X;
                }
                if (glow.env.gecko) {
                    var Y = document, T = Y.defaultView && (Y.defaultView.getComputedStyle(V.offsetParent, null) || Y.defaultView.getComputedStyle), W;
                    if (T.position == "relative" && T.overflow == "hidden" && (W = parseInt(T.borderTopWidth))) {
                        U += W;
                    }
                }
                return U;
            },
            offsetLeft: function() {
                var U = 0, V = this.el[0], a, Z;
                if (glow.env.ie) {
                    do {
                        Z = V.offsetLeft;
                        if (!isNaN(Z)) {
                            U += Z;
                        }
                        V = V.offsetParent;
                        if (V) {
                            a = H(V).css("position");
                        }
                    }
                    while (V&&!(a == "absolute" || a == "fixed" || a == "relative"));
                } else {
                    U = V.offsetLeft;
                }
                if (glow.env.opera) {
                    var X = parseInt(H(V.offsetParent).css("border-left-width"));
                    U -= isNaN(X) ? 0 : X;
                }
                if (glow.env.gecko) {
                    var Y = document, T = Y.defaultView && (Y.defaultView.getComputedStyle(V.offsetParent, null) || Y.defaultView.getComputedStyle), W;
                    if (T.position == "relative" && T.overflow == "hidden" && (W = parseInt(T.borderLeftWidth))) {
                        U += W;
                    }
                }
                return U;
            },
            borderWidth: function() {
                var T = this.el[0].offsetWidth;
                if (glow.env.khtml) {
                    T -= this.val("margin-left") + this.val("margin-right") + this.val("border-left-width") + this.val("border-right-width");
                }
                return T;
            },
            borderHeight: function() {
                if (this._logicalBottom) {
                    return this._logicalBottom - this.offsetTop();
                }
                var T = this.el[0].offsetHeight;
                if (glow.env.khtml) {
                    T -= this.val("margin-top") + this.val("margin-bottom") + this.val("border-top-width") + this.val("border-bottom-width");
                }
                return T;
            },
            outerWidth: function() {
                return this.borderWidth() + this.val("margin-left") + this.val("margin-right");
            },
            outerHeight: function() {
                return this.borderHeight() + this.val("margin-top") + this.val("margin-bottom");
            },
            innerLeftPos: function() {
                return this.offsetLeft() + this.val("border-left-width") + this.val("padding-left");
            },
            innerTopPos: function() {
                return this.offsetTop() + this.val("border-top-width") + this.val("padding-top");
            },
            surroundWidth: function() {
                return this.val("margin-left") + this.val("border-left-width") + this.val("padding-left") + this.val("padding-right") + this.val("border-right-width") + this.val("margin-right");
            },
            surroundHeight: function() {
                return this.val("margin-top") + this.val("border-top-width") + this.val("padding-top") + this.val("padding-bottom") + this.val("border-bottom-width") + this.val("margin-bottom");
            },
            verticalCenter: function() {
                return this.offsetTop() + (this.outerHeight() / 2);
            },
            horizontalCenter: function() {
                return this.offsetTop() + (this.outerWidth() / 2);
            }
        };
        for (var N in M.prototype) {
            if (N == "val") {
                F(M, N);
            } else {
                B(M, N);
            }
        }
        glow.lang.apply(M.prototype, {
            resetPosition: function() {
                P(this, ["offsetTop", "offsetLeft", "borderTopPos", "borderLeftPos", "innerTopPos", "innerLeftPos", "verticalCenter", "horizontalCenter"]);
            },
            setLogicalBottom: function(T) {
                this._logicalBottom = T;
            },
            boundsFor: function(V) {
                var U, T, W = this.el.css("position");
                if (W == "relative" || W == "absolute" || W == "fixed") {
                    U = T = 0;
                } else {
                    U = this.innerTopPos();
                    T = this.innerLeftPos();
                }
                return [U, T + this.width() - V.outerWidth(), U + this.height() - V.outerHeight(), T];
            },
            outerBounds: function() {
                var U = this.offsetLeft(), T = this.offsetTop();
                return [T, U + this.borderWidth(), T + this.borderHeight(), U];
            },
            intersectSize: function(V, W) {
                var U = this.outerBounds(), T = V.outerBounds();
                if (W) {
                    U[1]++;
                    T[1]++;
                    U[2]++;
                    T[2]++;
                }
                return (U[2] < T[0] ? 0 : T[2] < U[0] ? 0 : U[0] < T[0] ? (U[2] < T[2] ? U[2] - T[0] : T[2] - T[0]) : T[2] < U[2] ? T[2] - U[0] : U[2] - U[0]) * (U[1] < T[3] ? 0 : T[1] < U[3] ? 0 : U[3] < T[3] ? (U[1] < T[1] ? U[1] - T[3] : T[1] - T[3]) : T[1] < U[1] ? T[1] - U[3] : U[1] - U[3]);
            },
            sizePlaceholder: function(Y, Z, W, U) {
                var X = new M(Y), V = this.el, T = Z || V.css("position");
                Y.css("display", "none");
                V.after(Y);
                Y.css("width", (this.outerWidth() - X.surroundWidth()) + "px");
                Y.css("height", (this.outerHeight() - X.surroundHeight()) + "px");
                Y.remove();
                Y.css("display", "block");
                if (T != "static") {
                    Y.css("left", W + "px");
                    Y.css("top", U + "px");
                }
                Y.css("position", T);
            },
            contains: function(U) {
                var T = this.boundsFor(U), W = U.offsetTop(), V = U.offsetLeft();
                return W >= T[0] && V <= T[1] && W <= T[2] && V >= T[3];
            },
            containsPoint: function(U) {
                var T = this.el.offset();
                return U.x >= T.x && U.y >= T.y && U.x <= T.x + this.borderWidth() && U.y <= T.y + this.borderHeight();
            },
            positionedAncestorBox: function() {
                var T = this.el.parent(), U;
                while (T[0]) {
                    U = T.css("position") || "static";
                    if (U == "relative" || U == "absolute" || U == "fixed") {
                        return new M(T);
                    }
                    T = T.parent();
                }
                return null;
            }
        });
        function E(U) {
            var T = U[0].tagName.toLowerCase() == "li" ? "li": "div";
            var V = K("<" + T + "></" + T + ">");
            if (T == "li") {
                V.css("list-style-type", "none");
            }
            return V;
        }
        L.Draggable = function(W, X) {
            this.element = H(W);
            this._opts = X = glow.lang.apply({
                dragPrevention: ["input", "textarea", "button", "select", "option", "a"],
                placeholder: "spacer",
                placeholderClass: "glow-dragdrop-placeholder"
            }, X || {});
            this._preventDrag = [];
            for (var U = 0, T = X.dragPrevention.length; U < T; U++) {
                this._preventDrag[U] = X.dragPrevention[U].toLowerCase();
            }
            if (X.container) {
                this.container = H(X.container);
            }
            this._handle = X.handle && this.element.get(X.handle) || this.element;
            if (X.dropTargets) {
                this.dropTargets = H(X.dropTargets);
            }
            var V = this._listeners = [], U = 0;
            if (X.onDrag) {
                V[U++] = I(this, "drag", this._opts.onDrag, this);
            }
            if (X.onEnter) {
                V[U++] = I(this, "enter", this._opts.onEnter, this);
            }
            if (X.onLeave) {
                V[U++] = I(this, "leave", this._opts.onLeave, this);
            }
            if (X.onDrop) {
                V[U++] = I(this, "drop", this._opts.onDrop, this);
            }
            this._dragListener = I(this._handle, "mousedown", this._startDragMouse, this);
            return ;
        };
        L.Draggable.prototype = {
            _createPlaceholder: function() {
                var T = this.element, V, U = this._box;
                if (this._opts.placeholder == "clone") {
                    V = T.clone();
                } else {
                    V = E(T);
                }
                if (this._opts.placeholderClass) {
                    V.addClass(this._opts.placeholderClass);
                }
                U.sizePlaceholder(V, null, this._startLeft, this._startTop);
                T.after(V);
                this._placeholder = V;
            },
            _removePlaceholder: function() {
                this._placeholder.remove();
            },
            _resetPosition: function() {
                var b = this._preDragPosition, T = this.element, V = this._box, W = this._startOffset, Y = T.css("position"), a, X;
                V.resetPosition();
                var U = {
                    x: V.offsetLeft() - V.val("margin-left"),
                    y: V.offsetTop() - V.val("margin-top")
                };
                if (this._placeholder || this._dropIndicator) {
                    T.remove();
                }
                if (b == "static" && U.y == W.y && U.x == W.x) {
                    T.css("position", "static");
                    T.css("left", "");
                    T.css("top", "");
                } else {
                    T.css("z-index", this._preDragZIndex);
                    T.css("position", b == "static" ? "relative" : b);
                    if (b == "static") {
                        a = U.x - W.x;
                        X = U.y - W.y;
                    } else {
                        if (b == "relative" && Y != "relative") {
                            a = this._startLeft + (U.x - W.x);
                            X = this._startTop + (U.y - W.y);
                        }
                    }
                    if (Y != b) {
                        T.css("left", a ? a + "px" : "");
                        T.css("top", X ? X + "px" : "");
                    }
                }
                if (this._dropIndicator) {
                    var Z = this._dropIndicator.parent()[0];
                    if (Z) {
                        Z.replaceChild(T[0], this._dropIndicator[0]);
                    }
                    delete this._dropIndicator;
                    if (this._placeholder) {
                        this._placeholder.remove();
                        delete this._placeholder;
                    }
                } else {
                    if (this._placeholder) {
                        var Z = this._placeholder.parent()[0];
                        if (Z) {
                            Z.replaceChild(T[0], this._placeholder[0]);
                        }
                        delete this._placeholder;
                    }
                }
            },
            _startDragMouse: function(c) {
                var Y = this._preventDrag, U = c.source, j = U.tagName.toLowerCase();
                for (var a = 0, Z = Y.length; a < Z; a++) {
                    if (Y[a] == j) {
                        return ;
                    }
                }
                if (this._dragging == 1) {
                    return this.endDrag();
                } else {
                    if (this._dragging) {
                        return ;
                    }
                }
                this._dragging = 1;
                var X = this.element, W = this.container, T = this._opts, b = this._box = new M(X);
                this._preDragPosition = X.css("position");
                if (W) {
                    this._containerBox = new M(W);
                    this._bounds = this._containerBox.boundsFor(b);
                } else {
                    delete this._bounds;
                }
                this._mouseStart = {
                    x: c.pageX,
                    y: c.pageY
                };
                var d = this._startOffset = {
                    x: b.offsetLeft(),
                    y: b.offsetTop()
                };
                this._preDragStyle = X.attr("style");
                this._preDragZIndex = X.css("z-index");
                X.css("z-index", R++);
                this._startLeft = X[0].style.left ? parseInt(X[0].style.left) : 0;
                this._startTop = X[0].style.top ? parseInt(X[0].style.top) : 0;
                if (T.placeholder && T.placeholder != "none") {
                    this._createPlaceholder();
                }
                X.css("position", "absolute");
                X.css("left", d.x + "px");
                X.css("top", d.y + "px");
                if (A) {
                    this._scrollY = document.documentElement.scrollTop;
                    this._innerHeight = document.documentElement.clientHeight;
                } else {
                    if (S) {
                        this._scrollY = document.body.scrollTop;
                        this._innerHeight = document.body.clientHeight;
                    } else {
                        this._scrollY = window.scrollY;
                        this._innerHeight = window.innerHeight;
                    }
                }
                var h = H(document).height();
                this._bodyHeight = h < this._innerHeight ? this._innerHeight : h;
                Q(this, "drag");
                var f = function() {
                    return false;
                }, g = document.documentElement;
                if (this.dropTargets) {
                    var V = new C.Event();
                    V.draggable = this;
                    for (var a = 0, Z = this.dropTargets.length; a < Z; a++) {
                        Q(this.dropTargets[a], "active", V);
                    }
                    this._mousePos = {
                        x: c.pageX,
                        y: c.pageY
                    };
                    this._testForDropTargets();
                }
                this._dragListeners = [I(g, "selectstart", f), I(g, "dragstart", f), I(g, "mousedown", f), I(g, "mousemove", this._dragMouse, this), I(g, "mouseup", this._releaseElement, this)];
                return false;
            },
            _dragMouse: function(W) {
                var T = this.element, X = this._opts.axis == "y" ? this._startOffset.x: (this._startOffset.x + W.pageX - this._mouseStart.x), V = this._opts.axis == "x" ? this._startOffset.y: (this._startOffset.y + W.pageY - this._mouseStart.y), U = this._bounds;
                if (U) {
                    X = X < U[3] ? U[3] : X > U[1] ? U[1] : X;
                    V = V < U[0] ? U[0] : V > U[2] ? U[2] : V;
                }
                T[0].style.left = X + "px";
                T[0].style.top = V + "px";
                if (this.dropTargets) {
                    this._mousePos = {
                        x: W.pageX,
                        y: W.pageY
                    };
                }
                if (D && W.nativeEvent.button == 0) {
                    this._releaseElement(W);
                    return false;
                }
                return false;
            },
            _testForDropTargets: function(d) {
                if (!this._lock) {
                    this._lock = 0;
                }
                if (d) {
                    this._lock--;
                } else {
                    if (this.lock) {
                        return ;
                    }
                }
                if (this._dragging != 1) {
                    return ;
                }
                var V = this.activeTarget, U, p = this.dropTargets, q, Y, b = this._box, g = this._mousePos;
                b.resetPosition();
                var Z = 0;
                for (var h = 0, f = p.length; h < f; h++) {
                    q = p[h];
                    Y = q._box;
                    if (q._opts.tolerance == "contained") {
                        if (Y.contains(b)) {
                            U = q;
                            break;
                        }
                    } else {
                        if (q._opts.tolerance == "cursor") {
                            if (Y.containsPoint(g)) {
                                U = q;
                                break;
                            }
                        } else {
                            var j = Y.intersectSize(b, true);
                            if (j > Z) {
                                Z = j;
                                U = q;
                            }
                        }
                    }
                }
                this.activeTarget = U;
                if (U !== V) {
                    if (U) {
                        var e = new C.Event();
                        e.draggable = this;
                        Q(U, "enter", e);
                        var T = new C.Event();
                        T.dropTarget = U;
                        Q(this, "enter", T);
                    }
                    if (V) {
                        var a = new C.Event();
                        a.draggable = this;
                        Q(V, "leave", a);
                        var c = new C.Event();
                        c.dropTarget = V;
                        Q(this, "leave", c);
                    }
                }
                if (U && U._opts.dropIndicator != "none") {
                    var n, k = U._childBoxes, W = U._children;
                    b.resetPosition();
                    var o = U._box.innerTopPos();
                    var r = g.y - b.offsetParentPageTop();
                    var m = 0;
                    for (var h = 0, f = k.length; h < f; h++) {
                        if (W[h] == this.element[0]) {
                            continue;
                        }
                        n = k[h];
                        o += n.outerHeight();
                        if (r <= o) {
                            if (U._dropIndicatorAt != h) {
                                H(n.el).before(U._dropIndicator);
                                U._dropIndicatorAt = h;
                            }
                            m = 1;
                            break;
                        }
                    }
                    if (!m) {
                        if (n) {
                            H(n.el).after(U._dropIndicator);
                            U._dropIndicatorAt = h + 1;
                        } else {
                            U.element.append(U._dropIndicator);
                            U._dropIndicatorAt = 0;
                        }
                    }
                }
                this._lock++;
                var X = this;
                setTimeout(function() {
                    X._testForDropTargets(1);
                }, 100);
            },
            _releaseElement: function() {
                if (this._dragging != 1) {
                    return ;
                }
                this._dragging = 2;
                var V, T;
                var Z = this.dropTargets, Y = this.activeTarget;
                if (Z) {
                    for (V = 0, T = Z.length; V < T; V++) {
                        var X = new C.Event();
                        X.draggable = this;
                        X.droppedOnThis = Y && Y == Z[V];
                        Q(Z[V], "inactive", X);
                    }
                }
                if (Y) {
                    var X = new C.Event();
                    X.draggable = this;
                    Q(Y, "drop", X);
                }
                var U = this._dragListeners;
                for (V = 0, T = U.length; V < T; V++) {
                    C.removeListener(U[V]);
                }
                var W = Q(this, "drop");
                if (!W.defaultPrevented() && this.dropTargets) {
                    this.returnHome();
                } else {
                    this.endDrag();
                }
            },
            endDrag: function() {
                if (this._dragging != 2) {
                    return ;
                }
                this._dragging = 0;
                if (this._reset) {
                    this._reset();
                    delete this._reset;
                }
                if (this.placeholder) {
                    this.placeholder.remove();
                }
                this._resetPosition();
                delete this.activeTarget;
                Q(this, "afterDrop");
            },
            returnHome: function(U) {
                var X = (U) ? U: glow.tweens.linear(), V = this.element, Z = Math.pow(Math.pow(this._startOffset.x - this._box.offsetLeft(), 2) + Math.pow(this._startOffset.y - this._box.offsetTop(), 2), 0.5), Y = 0.3 + (Z / 1000);
                var T = [[glow.anim.css(V, Y, {
                    left: {
                        from: this._box.offsetLeft(),
                        to: this._startOffset.x
                    },
                    top: {
                        from: this._box.offsetTop(),
                        to: this._startOffset.y
                    }
                }, {
                    tween: X
                })]];
                if (this._dropIndicator) {
                    T.push([glow.anim.css(this._dropIndicator, Y - 0.1, {
                        opacity: {
                            to: 0
                        }
                    })]);
                }
                var W = new glow.anim.Timeline(T);
                I(W, "complete", function() {
                    this.endDrag();
                }, this);
                W.start();
                return ;
            }
        };
        var J = 0;
        L.DropTarget = function(T, U) {
            T = this.element = H(T);
            if (!T.length) {
                throw "no element passed into DropTarget constuctor";
            }
            if (T.length > 1) {
                throw "more than one element passed into DropTarget constructor";
            }
            this._id=++J;
            this._opts = U = glow.lang.apply({
                dropIndicator: "none",
                acceptDropOutside: false,
                dropIndicatorClass: "glow-dragdrop-dropindicator",
                tolerance: "intersect"
            }, U || {});
            if (U.onActive) {
                I(this, "active", U.onActive);
            }
            if (U.onInactive) {
                I(this, "inactive", U.onInactive);
            }
            if (U.onEnter) {
                I(this, "enter", U.onEnter);
            }
            if (U.onLeave) {
                I(this, "leave", U.onLeave);
            }
            if (U.onDrop) {
                I(this, "drop", U.onDrop);
            }
            this._activeListener = I(this, "active", this._onActive);
            this._activeListener = I(this, "inactive", this._onInactive);
            return this;
        };
        L.DropTarget.prototype = {
            setLogicalBottom: function(T) {
                this._logicalBottom = T;
            },
            _onActive: function(W) {
                var U = W.draggable;
                this._box = new M(this.element);
                if (this._logicalBottom) {
                    this._box.setLogicalBottom(this._logicalBottom);
                }
                if (this._opts.dropIndicator == "none") {
                    return ;
                }
                this._onEnterListener = I(this, "enter", this._onEnter);
                this._onLeaveListener = I(this, "leave", this._onLeave);
                this._dropIndicator = E(U.element);
                if (this._opts.dropIndicatorClass) {
                    this._dropIndicator.addClass(this._opts.dropIndicatorClass);
                }
                U._box.sizePlaceholder(this._dropIndicator, "relative", 0, 0);
                var V = this._children = H(this.element.children()).filter(function() {
                    var X = H(this);
                    return (!W.draggable._placeholder ||!X.eq(W.draggable._placeholder)) && (!this._dropIndicator ||!X.eq(this._dropIndicator));
                });
                var T = this._childBoxes = [];
                V.each(function(X) {
                    T[X] = new M(H(V[X]));
                });
            },
            _onInactive: function(T) {
                G(this._onEnterListener);
                G(this._onLeaveListener);
                delete this._box;
                if (this._opts.dropIndicator == "none") {
                    return ;
                }
                if (!T.droppedOnThis && this._dropIndicator) {
                    this._dropIndicator.remove();
                    delete this._dropIndicator;
                }
                delete this._childBoxes;
                delete this._children;
            },
            _onEnter: function() {
                this._dropIndicatorAt =- 1;
            },
            _onLeave: function() {
                this._dropIndicator.remove();
            },
            moveToPosition: function(T) {
                var X = this._dropIndicator, U = new M(X);
                var W = parseInt(X.css("margin-left")), V = parseInt(X.css("margin-top"));
                if (isNaN(W)) {
                    W = 0;
                }
                if (isNaN(V)) {
                    V = 0;
                }
                T._startOffset = {
                    x: U.offsetLeft() - W,
                    y: U.offsetTop() - V
                };
                T._dropIndicator = X;
                delete this._dropIndicator;
            }
        };
        return L;
    }
}); /*@end @*/

