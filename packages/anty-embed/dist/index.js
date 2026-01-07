'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

/*!
 * GSAP 3.14.2
 * https://gsap.com
 *
 * @license Copyright 2008-2025, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/

/* eslint-disable */
var _config = {
  autoSleep: 120,
  force3D: "auto",
  nullTargetWarn: 1,
  units: {
    lineHeight: ""
  }
},
    _defaults = {
  duration: .5,
  overwrite: false,
  delay: 0
},
    _suppressOverwrites,
    _reverting$1,
    _context,
    _bigNum$1 = 1e8,
    _tinyNum = 1 / _bigNum$1,
    _2PI = Math.PI * 2,
    _HALF_PI = _2PI / 4,
    _gsID = 0,
    _sqrt = Math.sqrt,
    _cos = Math.cos,
    _sin = Math.sin,
    _isString = function _isString(value) {
  return typeof value === "string";
},
    _isFunction = function _isFunction(value) {
  return typeof value === "function";
},
    _isNumber = function _isNumber(value) {
  return typeof value === "number";
},
    _isUndefined = function _isUndefined(value) {
  return typeof value === "undefined";
},
    _isObject = function _isObject(value) {
  return typeof value === "object";
},
    _isNotFalse = function _isNotFalse(value) {
  return value !== false;
},
    _windowExists$1 = function _windowExists() {
  return typeof window !== "undefined";
},
    _isFuncOrString = function _isFuncOrString(value) {
  return _isFunction(value) || _isString(value);
},
    _isTypedArray = typeof ArrayBuffer === "function" && ArrayBuffer.isView || function () {},
    // note: IE10 has ArrayBuffer, but NOT ArrayBuffer.isView().
_isArray = Array.isArray,
    _randomExp = /random\([^)]+\)/g,
    _commaDelimExp = /,\s*/g,
    _strictNumExp = /(?:-?\.?\d|\.)+/gi,
    //only numbers (including negatives and decimals) but NOT relative values.
_numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,
    //finds any numbers, including ones that start with += or -=, negative numbers, and ones in scientific notation like 1e-8.
_numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g,
    _complexStringNumExp = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,
    //duplicate so that while we're looping through matches from exec(), it doesn't contaminate the lastIndex of _numExp which we use to search for colors too.
_relExp = /[+-]=-?[.\d]+/,
    _delimitedValueExp = /[^,'"\[\]\s]+/gi,
    // previously /[#\-+.]*\b[a-z\d\-=+%.]+/gi but didn't catch special characters.
_unitExp = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,
    _globalTimeline,
    _win$1,
    _coreInitted,
    _doc$1,
    _globals = {},
    _installScope = {},
    _coreReady,
    _install = function _install(scope) {
  return (_installScope = _merge(scope, _globals)) && gsap;
},
    _missingPlugin = function _missingPlugin(property, value) {
  return console.warn("Invalid property", property, "set to", value, "Missing plugin? gsap.registerPlugin()");
},
    _warn = function _warn(message, suppress) {
  return !suppress && console.warn(message);
},
    _addGlobal = function _addGlobal(name, obj) {
  return name && (_globals[name] = obj) && _installScope && (_installScope[name] = obj) || _globals;
},
    _emptyFunc = function _emptyFunc() {
  return 0;
},
    _startAtRevertConfig = {
  suppressEvents: true,
  isStart: true,
  kill: false
},
    _revertConfigNoKill = {
  suppressEvents: true,
  kill: false
},
    _revertConfig = {
  suppressEvents: true
},
    _reservedProps = {},
    _lazyTweens = [],
    _lazyLookup = {},
    _lastRenderedFrame,
    _plugins = {},
    _effects = {},
    _nextGCFrame = 30,
    _harnessPlugins = [],
    _callbackNames = "",
    _harness = function _harness(targets) {
  var target = targets[0],
      harnessPlugin,
      i;
  _isObject(target) || _isFunction(target) || (targets = [targets]);

  if (!(harnessPlugin = (target._gsap || {}).harness)) {
    // find the first target with a harness. We assume targets passed into an animation will be of similar type, meaning the same kind of harness can be used for them all (performance optimization)
    i = _harnessPlugins.length;

    while (i-- && !_harnessPlugins[i].targetTest(target)) {}

    harnessPlugin = _harnessPlugins[i];
  }

  i = targets.length;

  while (i--) {
    targets[i] && (targets[i]._gsap || (targets[i]._gsap = new GSCache(targets[i], harnessPlugin))) || targets.splice(i, 1);
  }

  return targets;
},
    _getCache = function _getCache(target) {
  return target._gsap || _harness(toArray(target))[0]._gsap;
},
    _getProperty = function _getProperty(target, property, v) {
  return (v = target[property]) && _isFunction(v) ? target[property]() : _isUndefined(v) && target.getAttribute && target.getAttribute(property) || v;
},
    _forEachName = function _forEachName(names, func) {
  return (names = names.split(",")).forEach(func) || names;
},
    //split a comma-delimited list of names into an array, then run a forEach() function and return the split array (this is just a way to consolidate/shorten some code).
_round = function _round(value) {
  return Math.round(value * 100000) / 100000 || 0;
},
    _roundPrecise = function _roundPrecise(value) {
  return Math.round(value * 10000000) / 10000000 || 0;
},
    // increased precision mostly for timing values.
_parseRelative = function _parseRelative(start, value) {
  var operator = value.charAt(0),
      end = parseFloat(value.substr(2));
  start = parseFloat(start);
  return operator === "+" ? start + end : operator === "-" ? start - end : operator === "*" ? start * end : start / end;
},
    _arrayContainsAny = function _arrayContainsAny(toSearch, toFind) {
  //searches one array to find matches for any of the items in the toFind array. As soon as one is found, it returns true. It does NOT return all the matches; it's simply a boolean search.
  var l = toFind.length,
      i = 0;

  for (; toSearch.indexOf(toFind[i]) < 0 && ++i < l;) {}

  return i < l;
},
    _lazyRender = function _lazyRender() {
  var l = _lazyTweens.length,
      a = _lazyTweens.slice(0),
      i,
      tween;

  _lazyLookup = {};
  _lazyTweens.length = 0;

  for (i = 0; i < l; i++) {
    tween = a[i];
    tween && tween._lazy && (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
  }
},
    _isRevertWorthy = function _isRevertWorthy(animation) {
  return !!(animation._initted || animation._startAt || animation.add);
},
    _lazySafeRender = function _lazySafeRender(animation, time, suppressEvents, force) {
  _lazyTweens.length && !_reverting$1 && _lazyRender();
  animation.render(time, suppressEvents, !!(_reverting$1 && time < 0 && _isRevertWorthy(animation)));
  _lazyTweens.length && !_reverting$1 && _lazyRender(); //in case rendering caused any tweens to lazy-init, we should render them because typically when someone calls seek() or time() or progress(), they expect an immediate render.
},
    _numericIfPossible = function _numericIfPossible(value) {
  var n = parseFloat(value);
  return (n || n === 0) && (value + "").match(_delimitedValueExp).length < 2 ? n : _isString(value) ? value.trim() : value;
},
    _passThrough = function _passThrough(p) {
  return p;
},
    _setDefaults = function _setDefaults(obj, defaults) {
  for (var p in defaults) {
    p in obj || (obj[p] = defaults[p]);
  }

  return obj;
},
    _setKeyframeDefaults = function _setKeyframeDefaults(excludeDuration) {
  return function (obj, defaults) {
    for (var p in defaults) {
      p in obj || p === "duration" && excludeDuration || p === "ease" || (obj[p] = defaults[p]);
    }
  };
},
    _merge = function _merge(base, toMerge) {
  for (var p in toMerge) {
    base[p] = toMerge[p];
  }

  return base;
},
    _mergeDeep = function _mergeDeep(base, toMerge) {
  for (var p in toMerge) {
    p !== "__proto__" && p !== "constructor" && p !== "prototype" && (base[p] = _isObject(toMerge[p]) ? _mergeDeep(base[p] || (base[p] = {}), toMerge[p]) : toMerge[p]);
  }

  return base;
},
    _copyExcluding = function _copyExcluding(obj, excluding) {
  var copy = {},
      p;

  for (p in obj) {
    p in excluding || (copy[p] = obj[p]);
  }

  return copy;
},
    _inheritDefaults = function _inheritDefaults(vars) {
  var parent = vars.parent || _globalTimeline,
      func = vars.keyframes ? _setKeyframeDefaults(_isArray(vars.keyframes)) : _setDefaults;

  if (_isNotFalse(vars.inherit)) {
    while (parent) {
      func(vars, parent.vars.defaults);
      parent = parent.parent || parent._dp;
    }
  }

  return vars;
},
    _arraysMatch = function _arraysMatch(a1, a2) {
  var i = a1.length,
      match = i === a2.length;

  while (match && i-- && a1[i] === a2[i]) {}

  return i < 0;
},
    _addLinkedListItem = function _addLinkedListItem(parent, child, firstProp, lastProp, sortBy) {

  var prev = parent[lastProp],
      t;

  if (sortBy) {
    t = child[sortBy];

    while (prev && prev[sortBy] > t) {
      prev = prev._prev;
    }
  }

  if (prev) {
    child._next = prev._next;
    prev._next = child;
  } else {
    child._next = parent[firstProp];
    parent[firstProp] = child;
  }

  if (child._next) {
    child._next._prev = child;
  } else {
    parent[lastProp] = child;
  }

  child._prev = prev;
  child.parent = child._dp = parent;
  return child;
},
    _removeLinkedListItem = function _removeLinkedListItem(parent, child, firstProp, lastProp) {
  if (firstProp === void 0) {
    firstProp = "_first";
  }

  if (lastProp === void 0) {
    lastProp = "_last";
  }

  var prev = child._prev,
      next = child._next;

  if (prev) {
    prev._next = next;
  } else if (parent[firstProp] === child) {
    parent[firstProp] = next;
  }

  if (next) {
    next._prev = prev;
  } else if (parent[lastProp] === child) {
    parent[lastProp] = prev;
  }

  child._next = child._prev = child.parent = null; // don't delete the _dp just so we can revert if necessary. But parent should be null to indicate the item isn't in a linked list.
},
    _removeFromParent = function _removeFromParent(child, onlyIfParentHasAutoRemove) {
  child.parent && (!onlyIfParentHasAutoRemove || child.parent.autoRemoveChildren) && child.parent.remove && child.parent.remove(child);
  child._act = 0;
},
    _uncache = function _uncache(animation, child) {
  if (animation && (!child || child._end > animation._dur || child._start < 0)) {
    // performance optimization: if a child animation is passed in we should only uncache if that child EXTENDS the animation (its end time is beyond the end)
    var a = animation;

    while (a) {
      a._dirty = 1;
      a = a.parent;
    }
  }

  return animation;
},
    _recacheAncestors = function _recacheAncestors(animation) {
  var parent = animation.parent;

  while (parent && parent.parent) {
    //sometimes we must force a re-sort of all children and update the duration/totalDuration of all ancestor timelines immediately in case, for example, in the middle of a render loop, one tween alters another tween's timeScale which shoves its startTime before 0, forcing the parent timeline to shift around and shiftChildren() which could affect that next tween's render (startTime). Doesn't matter for the root timeline though.
    parent._dirty = 1;
    parent.totalDuration();
    parent = parent.parent;
  }

  return animation;
},
    _rewindStartAt = function _rewindStartAt(tween, totalTime, suppressEvents, force) {
  return tween._startAt && (_reverting$1 ? tween._startAt.revert(_revertConfigNoKill) : tween.vars.immediateRender && !tween.vars.autoRevert || tween._startAt.render(totalTime, true, force));
},
    _hasNoPausedAncestors = function _hasNoPausedAncestors(animation) {
  return !animation || animation._ts && _hasNoPausedAncestors(animation.parent);
},
    _elapsedCycleDuration = function _elapsedCycleDuration(animation) {
  return animation._repeat ? _animationCycle(animation._tTime, animation = animation.duration() + animation._rDelay) * animation : 0;
},
    // feed in the totalTime and cycleDuration and it'll return the cycle (iteration minus 1) and if the playhead is exactly at the very END, it will NOT bump up to the next cycle.
_animationCycle = function _animationCycle(tTime, cycleDuration) {
  var whole = Math.floor(tTime = _roundPrecise(tTime / cycleDuration));
  return tTime && whole === tTime ? whole - 1 : whole;
},
    _parentToChildTotalTime = function _parentToChildTotalTime(parentTime, child) {
  return (parentTime - child._start) * child._ts + (child._ts >= 0 ? 0 : child._dirty ? child.totalDuration() : child._tDur);
},
    _setEnd = function _setEnd(animation) {
  return animation._end = _roundPrecise(animation._start + (animation._tDur / Math.abs(animation._ts || animation._rts || _tinyNum) || 0));
},
    _alignPlayhead = function _alignPlayhead(animation, totalTime) {
  // adjusts the animation's _start and _end according to the provided totalTime (only if the parent's smoothChildTiming is true and the animation isn't paused). It doesn't do any rendering or forcing things back into parent timelines, etc. - that's what totalTime() is for.
  var parent = animation._dp;

  if (parent && parent.smoothChildTiming && animation._ts) {
    animation._start = _roundPrecise(parent._time - (animation._ts > 0 ? totalTime / animation._ts : ((animation._dirty ? animation.totalDuration() : animation._tDur) - totalTime) / -animation._ts));

    _setEnd(animation);

    parent._dirty || _uncache(parent, animation); //for performance improvement. If the parent's cache is already dirty, it already took care of marking the ancestors as dirty too, so skip the function call here.
  }

  return animation;
},

/*
_totalTimeToTime = (clampedTotalTime, duration, repeat, repeatDelay, yoyo) => {
	let cycleDuration = duration + repeatDelay,
		time = _round(clampedTotalTime % cycleDuration);
	if (time > duration) {
		time = duration;
	}
	return (yoyo && (~~(clampedTotalTime / cycleDuration) & 1)) ? duration - time : time;
},
*/
_postAddChecks = function _postAddChecks(timeline, child) {
  var t;

  if (child._time || !child._dur && child._initted || child._start < timeline._time && (child._dur || !child.add)) {
    // in case, for example, the _start is moved on a tween that has already rendered, or if it's being inserted into a timeline BEFORE where the playhead is currently. Imagine it's at its end state, then the startTime is moved WAY later (after the end of this timeline), it should render at its beginning. Special case: if it's a timeline (has .add() method) and no duration, we can skip rendering because the user may be populating it AFTER adding it to a parent timeline (unconventional, but possible, and we wouldn't want it to get removed if the parent's autoRemoveChildren is true).
    t = _parentToChildTotalTime(timeline.rawTime(), child);

    if (!child._dur || _clamp(0, child.totalDuration(), t) - child._tTime > _tinyNum) {
      child.render(t, true);
    }
  } //if the timeline has already ended but the inserted tween/timeline extends the duration, we should enable this timeline again so that it renders properly. We should also align the playhead with the parent timeline's when appropriate.


  if (_uncache(timeline, child)._dp && timeline._initted && timeline._time >= timeline._dur && timeline._ts) {
    //in case any of the ancestors had completed but should now be enabled...
    if (timeline._dur < timeline.duration()) {
      t = timeline;

      while (t._dp) {
        t.rawTime() >= 0 && t.totalTime(t._tTime); //moves the timeline (shifts its startTime) if necessary, and also enables it. If it's currently zero, though, it may not be scheduled to render until later so there's no need to force it to align with the current playhead position. Only move to catch up with the playhead.

        t = t._dp;
      }
    }

    timeline._zTime = -_tinyNum; // helps ensure that the next render() will be forced (crossingStart = true in render()), even if the duration hasn't changed (we're adding a child which would need to get rendered). Definitely an edge case. Note: we MUST do this AFTER the loop above where the totalTime() might trigger a render() because this _addToTimeline() method gets called from the Animation constructor, BEFORE tweens even record their targets, etc. so we wouldn't want things to get triggered in the wrong order.
  }
},
    _addToTimeline = function _addToTimeline(timeline, child, position, skipChecks) {
  child.parent && _removeFromParent(child);
  child._start = _roundPrecise((_isNumber(position) ? position : position || timeline !== _globalTimeline ? _parsePosition(timeline, position, child) : timeline._time) + child._delay);
  child._end = _roundPrecise(child._start + (child.totalDuration() / Math.abs(child.timeScale()) || 0));

  _addLinkedListItem(timeline, child, "_first", "_last", timeline._sort ? "_start" : 0);

  _isFromOrFromStart(child) || (timeline._recent = child);
  skipChecks || _postAddChecks(timeline, child);
  timeline._ts < 0 && _alignPlayhead(timeline, timeline._tTime); // if the timeline is reversed and the new child makes it longer, we may need to adjust the parent's _start (push it back)

  return timeline;
},
    _scrollTrigger = function _scrollTrigger(animation, trigger) {
  return (_globals.ScrollTrigger || _missingPlugin("scrollTrigger", trigger)) && _globals.ScrollTrigger.create(trigger, animation);
},
    _attemptInitTween = function _attemptInitTween(tween, time, force, suppressEvents, tTime) {
  _initTween(tween, time, tTime);

  if (!tween._initted) {
    return 1;
  }

  if (!force && tween._pt && !_reverting$1 && (tween._dur && tween.vars.lazy !== false || !tween._dur && tween.vars.lazy) && _lastRenderedFrame !== _ticker.frame) {
    _lazyTweens.push(tween);

    tween._lazy = [tTime, suppressEvents];
    return 1;
  }
},
    _parentPlayheadIsBeforeStart = function _parentPlayheadIsBeforeStart(_ref) {
  var parent = _ref.parent;
  return parent && parent._ts && parent._initted && !parent._lock && (parent.rawTime() < 0 || _parentPlayheadIsBeforeStart(parent));
},
    // check parent's _lock because when a timeline repeats/yoyos and does its artificial wrapping, we shouldn't force the ratio back to 0
_isFromOrFromStart = function _isFromOrFromStart(_ref2) {
  var data = _ref2.data;
  return data === "isFromStart" || data === "isStart";
},
    _renderZeroDurationTween = function _renderZeroDurationTween(tween, totalTime, suppressEvents, force) {
  var prevRatio = tween.ratio,
      ratio = totalTime < 0 || !totalTime && (!tween._start && _parentPlayheadIsBeforeStart(tween) && !(!tween._initted && _isFromOrFromStart(tween)) || (tween._ts < 0 || tween._dp._ts < 0) && !_isFromOrFromStart(tween)) ? 0 : 1,
      // if the tween or its parent is reversed and the totalTime is 0, we should go to a ratio of 0. Edge case: if a from() or fromTo() stagger tween is placed later in a timeline, the "startAt" zero-duration tween could initially render at a time when the parent timeline's playhead is technically BEFORE where this tween is, so make sure that any "from" and "fromTo" startAt tweens are rendered the first time at a ratio of 1.
  repeatDelay = tween._rDelay,
      tTime = 0,
      pt,
      iteration,
      prevIteration;

  if (repeatDelay && tween._repeat) {
    // in case there's a zero-duration tween that has a repeat with a repeatDelay
    tTime = _clamp(0, tween._tDur, totalTime);
    iteration = _animationCycle(tTime, repeatDelay);
    tween._yoyo && iteration & 1 && (ratio = 1 - ratio);

    if (iteration !== _animationCycle(tween._tTime, repeatDelay)) {
      // if iteration changed
      prevRatio = 1 - ratio;
      tween.vars.repeatRefresh && tween._initted && tween.invalidate();
    }
  }

  if (ratio !== prevRatio || _reverting$1 || force || tween._zTime === _tinyNum || !totalTime && tween._zTime) {
    if (!tween._initted && _attemptInitTween(tween, totalTime, force, suppressEvents, tTime)) {
      // if we render the very beginning (time == 0) of a fromTo(), we must force the render (normal tweens wouldn't need to render at a time of 0 when the prevTime was also 0). This is also mandatory to make sure overwriting kicks in immediately.
      return;
    }

    prevIteration = tween._zTime;
    tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0); // when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect.

    suppressEvents || (suppressEvents = totalTime && !prevIteration); // if it was rendered previously at exactly 0 (_zTime) and now the playhead is moving away, DON'T fire callbacks otherwise they'll seem like duplicates.

    tween.ratio = ratio;
    tween._from && (ratio = 1 - ratio);
    tween._time = 0;
    tween._tTime = tTime;
    pt = tween._pt;

    while (pt) {
      pt.r(ratio, pt.d);
      pt = pt._next;
    }

    totalTime < 0 && _rewindStartAt(tween, totalTime, suppressEvents, true);
    tween._onUpdate && !suppressEvents && _callback(tween, "onUpdate");
    tTime && tween._repeat && !suppressEvents && tween.parent && _callback(tween, "onRepeat");

    if ((totalTime >= tween._tDur || totalTime < 0) && tween.ratio === ratio) {
      ratio && _removeFromParent(tween, 1);

      if (!suppressEvents && !_reverting$1) {
        _callback(tween, ratio ? "onComplete" : "onReverseComplete", true);

        tween._prom && tween._prom();
      }
    }
  } else if (!tween._zTime) {
    tween._zTime = totalTime;
  }
},
    _findNextPauseTween = function _findNextPauseTween(animation, prevTime, time) {
  var child;

  if (time > prevTime) {
    child = animation._first;

    while (child && child._start <= time) {
      if (child.data === "isPause" && child._start > prevTime) {
        return child;
      }

      child = child._next;
    }
  } else {
    child = animation._last;

    while (child && child._start >= time) {
      if (child.data === "isPause" && child._start < prevTime) {
        return child;
      }

      child = child._prev;
    }
  }
},
    _setDuration = function _setDuration(animation, duration, skipUncache, leavePlayhead) {
  var repeat = animation._repeat,
      dur = _roundPrecise(duration) || 0,
      totalProgress = animation._tTime / animation._tDur;
  totalProgress && !leavePlayhead && (animation._time *= dur / animation._dur);
  animation._dur = dur;
  animation._tDur = !repeat ? dur : repeat < 0 ? 1e10 : _roundPrecise(dur * (repeat + 1) + animation._rDelay * repeat);
  totalProgress > 0 && !leavePlayhead && _alignPlayhead(animation, animation._tTime = animation._tDur * totalProgress);
  animation.parent && _setEnd(animation);
  skipUncache || _uncache(animation.parent, animation);
  return animation;
},
    _onUpdateTotalDuration = function _onUpdateTotalDuration(animation) {
  return animation instanceof Timeline ? _uncache(animation) : _setDuration(animation, animation._dur);
},
    _zeroPosition = {
  _start: 0,
  endTime: _emptyFunc,
  totalDuration: _emptyFunc
},
    _parsePosition = function _parsePosition(animation, position, percentAnimation) {
  var labels = animation.labels,
      recent = animation._recent || _zeroPosition,
      clippedDuration = animation.duration() >= _bigNum$1 ? recent.endTime(false) : animation._dur,
      //in case there's a child that infinitely repeats, users almost never intend for the insertion point of a new child to be based on a SUPER long value like that so we clip it and assume the most recently-added child's endTime should be used instead.
  i,
      offset,
      isPercent;

  if (_isString(position) && (isNaN(position) || position in labels)) {
    //if the string is a number like "1", check to see if there's a label with that name, otherwise interpret it as a number (absolute value).
    offset = position.charAt(0);
    isPercent = position.substr(-1) === "%";
    i = position.indexOf("=");

    if (offset === "<" || offset === ">") {
      i >= 0 && (position = position.replace(/=/, ""));
      return (offset === "<" ? recent._start : recent.endTime(recent._repeat >= 0)) + (parseFloat(position.substr(1)) || 0) * (isPercent ? (i < 0 ? recent : percentAnimation).totalDuration() / 100 : 1);
    }

    if (i < 0) {
      position in labels || (labels[position] = clippedDuration);
      return labels[position];
    }

    offset = parseFloat(position.charAt(i - 1) + position.substr(i + 1));

    if (isPercent && percentAnimation) {
      offset = offset / 100 * (_isArray(percentAnimation) ? percentAnimation[0] : percentAnimation).totalDuration();
    }

    return i > 1 ? _parsePosition(animation, position.substr(0, i - 1), percentAnimation) + offset : clippedDuration + offset;
  }

  return position == null ? clippedDuration : +position;
},
    _createTweenType = function _createTweenType(type, params, timeline) {
  var isLegacy = _isNumber(params[1]),
      varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1),
      vars = params[varsIndex],
      irVars,
      parent;

  isLegacy && (vars.duration = params[1]);
  vars.parent = timeline;

  if (type) {
    irVars = vars;
    parent = timeline;

    while (parent && !("immediateRender" in irVars)) {
      // inheritance hasn't happened yet, but someone may have set a default in an ancestor timeline. We could do vars.immediateRender = _isNotFalse(_inheritDefaults(vars).immediateRender) but that'd exact a slight performance penalty because _inheritDefaults() also runs in the Tween constructor. We're paying a small kb price here to gain speed.
      irVars = parent.vars.defaults || {};
      parent = _isNotFalse(parent.vars.inherit) && parent.parent;
    }

    vars.immediateRender = _isNotFalse(irVars.immediateRender);
    type < 2 ? vars.runBackwards = 1 : vars.startAt = params[varsIndex - 1]; // "from" vars
  }

  return new Tween(params[0], vars, params[varsIndex + 1]);
},
    _conditionalReturn = function _conditionalReturn(value, func) {
  return value || value === 0 ? func(value) : func;
},
    _clamp = function _clamp(min, max, value) {
  return value < min ? min : value > max ? max : value;
},
    getUnit = function getUnit(value, v) {
  return !_isString(value) || !(v = _unitExp.exec(value)) ? "" : v[1];
},
    // note: protect against padded numbers as strings, like "100.100". That shouldn't return "00" as the unit. If it's numeric, return no unit.
clamp = function clamp(min, max, value) {
  return _conditionalReturn(value, function (v) {
    return _clamp(min, max, v);
  });
},
    _slice = [].slice,
    _isArrayLike = function _isArrayLike(value, nonEmpty) {
  return value && _isObject(value) && "length" in value && (!nonEmpty && !value.length || value.length - 1 in value && _isObject(value[0])) && !value.nodeType && value !== _win$1;
},
    _flatten = function _flatten(ar, leaveStrings, accumulator) {
  if (accumulator === void 0) {
    accumulator = [];
  }

  return ar.forEach(function (value) {
    var _accumulator;

    return _isString(value) && !leaveStrings || _isArrayLike(value, 1) ? (_accumulator = accumulator).push.apply(_accumulator, toArray(value)) : accumulator.push(value);
  }) || accumulator;
},
    // takes any value and returns an Array. If it's a string (and leaveStrings isn't true), it'll use document.querySelectorAll() and convert that to an array. It'll also accept iterables like jQuery objects.
toArray = function toArray(value, scope, leaveStrings) {
  return _context && !scope && _context.selector ? _context.selector(value) : _isString(value) && !leaveStrings && (_coreInitted || !_wake()) ? _slice.call((scope || _doc$1).querySelectorAll(value), 0) : _isArray(value) ? _flatten(value, leaveStrings) : _isArrayLike(value) ? _slice.call(value, 0) : value ? [value] : [];
},
    selector = function selector(value) {
  value = toArray(value)[0] || _warn("Invalid scope") || {};
  return function (v) {
    var el = value.current || value.nativeElement || value;
    return toArray(v, el.querySelectorAll ? el : el === value ? _warn("Invalid scope") || _doc$1.createElement("div") : value);
  };
},
    shuffle = function shuffle(a) {
  return a.sort(function () {
    return .5 - Math.random();
  });
},
    // alternative that's a bit faster and more reliably diverse but bigger:   for (let j, v, i = a.length; i; j = (Math.random() * i) | 0, v = a[--i], a[i] = a[j], a[j] = v); return a;
// for distributing values across an Array. Can accept a number, a function or (most commonly) an object which can contain the following properties: {base, amount, from, ease, grid, axis, length, each}. Returns a function that expects the following parameters: index, target, array.
distribute = function distribute(v) {
  if (_isFunction(v)) {
    return v;
  }

  var vars = _isObject(v) ? v : {
    each: v
  },
      //n:1 is just to indicate v was a number; we leverage that later to set v according to the length we get. If a number is passed in, we treat it like the old stagger value where 0.1, for example, would mean that things would be distributed with 0.1 between each element in the array rather than a total "amount" that's chunked out among them all.
  ease = _parseEase(vars.ease),
      from = vars.from || 0,
      base = parseFloat(vars.base) || 0,
      cache = {},
      isDecimal = from > 0 && from < 1,
      ratios = isNaN(from) || isDecimal,
      axis = vars.axis,
      ratioX = from,
      ratioY = from;

  if (_isString(from)) {
    ratioX = ratioY = {
      center: .5,
      edges: .5,
      end: 1
    }[from] || 0;
  } else if (!isDecimal && ratios) {
    ratioX = from[0];
    ratioY = from[1];
  }

  return function (i, target, a) {
    var l = (a || vars).length,
        distances = cache[l],
        originX,
        originY,
        x,
        y,
        d,
        j,
        max,
        min,
        wrapAt;

    if (!distances) {
      wrapAt = vars.grid === "auto" ? 0 : (vars.grid || [1, _bigNum$1])[1];

      if (!wrapAt) {
        max = -_bigNum$1;

        while (max < (max = a[wrapAt++].getBoundingClientRect().left) && wrapAt < l) {}

        wrapAt < l && wrapAt--;
      }

      distances = cache[l] = [];
      originX = ratios ? Math.min(wrapAt, l) * ratioX - .5 : from % wrapAt;
      originY = wrapAt === _bigNum$1 ? 0 : ratios ? l * ratioY / wrapAt - .5 : from / wrapAt | 0;
      max = 0;
      min = _bigNum$1;

      for (j = 0; j < l; j++) {
        x = j % wrapAt - originX;
        y = originY - (j / wrapAt | 0);
        distances[j] = d = !axis ? _sqrt(x * x + y * y) : Math.abs(axis === "y" ? y : x);
        d > max && (max = d);
        d < min && (min = d);
      }

      from === "random" && shuffle(distances);
      distances.max = max - min;
      distances.min = min;
      distances.v = l = (parseFloat(vars.amount) || parseFloat(vars.each) * (wrapAt > l ? l - 1 : !axis ? Math.max(wrapAt, l / wrapAt) : axis === "y" ? l / wrapAt : wrapAt) || 0) * (from === "edges" ? -1 : 1);
      distances.b = l < 0 ? base - l : base;
      distances.u = getUnit(vars.amount || vars.each) || 0; //unit

      ease = ease && l < 0 ? _invertEase(ease) : ease;
    }

    l = (distances[i] - distances.min) / distances.max || 0;
    return _roundPrecise(distances.b + (ease ? ease(l) : l) * distances.v) + distances.u; //round in order to work around floating point errors
  };
},
    _roundModifier = function _roundModifier(v) {
  //pass in 0.1 get a function that'll round to the nearest tenth, or 5 to round to the closest 5, or 0.001 to the closest 1000th, etc.
  var p = Math.pow(10, ((v + "").split(".")[1] || "").length); //to avoid floating point math errors (like 24 * 0.1 == 2.4000000000000004), we chop off at a specific number of decimal places (much faster than toFixed())

  return function (raw) {
    var n = _roundPrecise(Math.round(parseFloat(raw) / v) * v * p);

    return (n - n % 1) / p + (_isNumber(raw) ? 0 : getUnit(raw)); // n - n % 1 replaces Math.floor() in order to handle negative values properly. For example, Math.floor(-150.00000000000003) is 151!
  };
},
    snap = function snap(snapTo, value) {
  var isArray = _isArray(snapTo),
      radius,
      is2D;

  if (!isArray && _isObject(snapTo)) {
    radius = isArray = snapTo.radius || _bigNum$1;

    if (snapTo.values) {
      snapTo = toArray(snapTo.values);

      if (is2D = !_isNumber(snapTo[0])) {
        radius *= radius; //performance optimization so we don't have to Math.sqrt() in the loop.
      }
    } else {
      snapTo = _roundModifier(snapTo.increment);
    }
  }

  return _conditionalReturn(value, !isArray ? _roundModifier(snapTo) : _isFunction(snapTo) ? function (raw) {
    is2D = snapTo(raw);
    return Math.abs(is2D - raw) <= radius ? is2D : raw;
  } : function (raw) {
    var x = parseFloat(is2D ? raw.x : raw),
        y = parseFloat(is2D ? raw.y : 0),
        min = _bigNum$1,
        closest = 0,
        i = snapTo.length,
        dx,
        dy;

    while (i--) {
      if (is2D) {
        dx = snapTo[i].x - x;
        dy = snapTo[i].y - y;
        dx = dx * dx + dy * dy;
      } else {
        dx = Math.abs(snapTo[i] - x);
      }

      if (dx < min) {
        min = dx;
        closest = i;
      }
    }

    closest = !radius || min <= radius ? snapTo[closest] : raw;
    return is2D || closest === raw || _isNumber(raw) ? closest : closest + getUnit(raw);
  });
},
    random = function random(min, max, roundingIncrement, returnFunction) {
  return _conditionalReturn(_isArray(min) ? !max : roundingIncrement === true ? !!(roundingIncrement = 0) : !returnFunction, function () {
    return _isArray(min) ? min[~~(Math.random() * min.length)] : (roundingIncrement = roundingIncrement || 1e-5) && (returnFunction = roundingIncrement < 1 ? Math.pow(10, (roundingIncrement + "").length - 2) : 1) && Math.floor(Math.round((min - roundingIncrement / 2 + Math.random() * (max - min + roundingIncrement * .99)) / roundingIncrement) * roundingIncrement * returnFunction) / returnFunction;
  });
},
    pipe = function pipe() {
  for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) {
    functions[_key] = arguments[_key];
  }

  return function (value) {
    return functions.reduce(function (v, f) {
      return f(v);
    }, value);
  };
},
    unitize = function unitize(func, unit) {
  return function (value) {
    return func(parseFloat(value)) + (unit || getUnit(value));
  };
},
    normalize = function normalize(min, max, value) {
  return mapRange(min, max, 0, 1, value);
},
    _wrapArray = function _wrapArray(a, wrapper, value) {
  return _conditionalReturn(value, function (index) {
    return a[~~wrapper(index)];
  });
},
    wrap = function wrap(min, max, value) {
  // NOTE: wrap() CANNOT be an arrow function! A very odd compiling bug causes problems (unrelated to GSAP).
  var range = max - min;
  return _isArray(min) ? _wrapArray(min, wrap(0, min.length), max) : _conditionalReturn(value, function (value) {
    return (range + (value - min) % range) % range + min;
  });
},
    wrapYoyo = function wrapYoyo(min, max, value) {
  var range = max - min,
      total = range * 2;
  return _isArray(min) ? _wrapArray(min, wrapYoyo(0, min.length - 1), max) : _conditionalReturn(value, function (value) {
    value = (total + (value - min) % total) % total || 0;
    return min + (value > range ? total - value : value);
  });
},
    _replaceRandom = function _replaceRandom(s) {
  return s.replace(_randomExp, function (match) {
    //replaces all occurrences of random(...) in a string with the calculated random value. can be a range like random(-100, 100, 5) or an array like random([0, 100, 500])
    var arIndex = match.indexOf("[") + 1,
        values = match.substring(arIndex || 7, arIndex ? match.indexOf("]") : match.length - 1).split(_commaDelimExp);
    return random(arIndex ? values : +values[0], arIndex ? 0 : +values[1], +values[2] || 1e-5);
  });
},
    mapRange = function mapRange(inMin, inMax, outMin, outMax, value) {
  var inRange = inMax - inMin,
      outRange = outMax - outMin;
  return _conditionalReturn(value, function (value) {
    return outMin + ((value - inMin) / inRange * outRange || 0);
  });
},
    interpolate = function interpolate(start, end, progress, mutate) {
  var func = isNaN(start + end) ? 0 : function (p) {
    return (1 - p) * start + p * end;
  };

  if (!func) {
    var isString = _isString(start),
        master = {},
        p,
        i,
        interpolators,
        l,
        il;

    progress === true && (mutate = 1) && (progress = null);

    if (isString) {
      start = {
        p: start
      };
      end = {
        p: end
      };
    } else if (_isArray(start) && !_isArray(end)) {
      interpolators = [];
      l = start.length;
      il = l - 2;

      for (i = 1; i < l; i++) {
        interpolators.push(interpolate(start[i - 1], start[i])); //build the interpolators up front as a performance optimization so that when the function is called many times, it can just reuse them.
      }

      l--;

      func = function func(p) {
        p *= l;
        var i = Math.min(il, ~~p);
        return interpolators[i](p - i);
      };

      progress = end;
    } else if (!mutate) {
      start = _merge(_isArray(start) ? [] : {}, start);
    }

    if (!interpolators) {
      for (p in end) {
        _addPropTween.call(master, start, p, "get", end[p]);
      }

      func = function func(p) {
        return _renderPropTweens(p, master) || (isString ? start.p : start);
      };
    }
  }

  return _conditionalReturn(progress, func);
},
    _getLabelInDirection = function _getLabelInDirection(timeline, fromTime, backward) {
  //used for nextLabel() and previousLabel()
  var labels = timeline.labels,
      min = _bigNum$1,
      p,
      distance,
      label;

  for (p in labels) {
    distance = labels[p] - fromTime;

    if (distance < 0 === !!backward && distance && min > (distance = Math.abs(distance))) {
      label = p;
      min = distance;
    }
  }

  return label;
},
    _callback = function _callback(animation, type, executeLazyFirst) {
  var v = animation.vars,
      callback = v[type],
      prevContext = _context,
      context = animation._ctx,
      params,
      scope,
      result;

  if (!callback) {
    return;
  }

  params = v[type + "Params"];
  scope = v.callbackScope || animation;
  executeLazyFirst && _lazyTweens.length && _lazyRender(); //in case rendering caused any tweens to lazy-init, we should render them because typically when a timeline finishes, users expect things to have rendered fully. Imagine an onUpdate on a timeline that reports/checks tweened values.

  context && (_context = context);
  result = params ? callback.apply(scope, params) : callback.call(scope);
  _context = prevContext;
  return result;
},
    _interrupt = function _interrupt(animation) {
  _removeFromParent(animation);

  animation.scrollTrigger && animation.scrollTrigger.kill(!!_reverting$1);
  animation.progress() < 1 && _callback(animation, "onInterrupt");
  return animation;
},
    _quickTween,
    _registerPluginQueue = [],
    _createPlugin = function _createPlugin(config) {
  if (!config) return;
  config = !config.name && config["default"] || config; // UMD packaging wraps things oddly, so for example MotionPathHelper becomes {MotionPathHelper:MotionPathHelper, default:MotionPathHelper}.

  if (_windowExists$1() || config.headless) {
    // edge case: some build tools may pass in a null/undefined value
    var name = config.name,
        isFunc = _isFunction(config),
        Plugin = name && !isFunc && config.init ? function () {
      this._props = [];
    } : config,
        //in case someone passes in an object that's not a plugin, like CustomEase
    instanceDefaults = {
      init: _emptyFunc,
      render: _renderPropTweens,
      add: _addPropTween,
      kill: _killPropTweensOf,
      modifier: _addPluginModifier,
      rawVars: 0
    },
        statics = {
      targetTest: 0,
      get: 0,
      getSetter: _getSetter,
      aliases: {},
      register: 0
    };

    _wake();

    if (config !== Plugin) {
      if (_plugins[name]) {
        return;
      }

      _setDefaults(Plugin, _setDefaults(_copyExcluding(config, instanceDefaults), statics)); //static methods


      _merge(Plugin.prototype, _merge(instanceDefaults, _copyExcluding(config, statics))); //instance methods


      _plugins[Plugin.prop = name] = Plugin;

      if (config.targetTest) {
        _harnessPlugins.push(Plugin);

        _reservedProps[name] = 1;
      }

      name = (name === "css" ? "CSS" : name.charAt(0).toUpperCase() + name.substr(1)) + "Plugin"; //for the global name. "motionPath" should become MotionPathPlugin
    }

    _addGlobal(name, Plugin);

    config.register && config.register(gsap, Plugin, PropTween);
  } else {
    _registerPluginQueue.push(config);
  }
},

/*
 * --------------------------------------------------------------------------------------
 * COLORS
 * --------------------------------------------------------------------------------------
 */
_255 = 255,
    _colorLookup = {
  aqua: [0, _255, _255],
  lime: [0, _255, 0],
  silver: [192, 192, 192],
  black: [0, 0, 0],
  maroon: [128, 0, 0],
  teal: [0, 128, 128],
  blue: [0, 0, _255],
  navy: [0, 0, 128],
  white: [_255, _255, _255],
  olive: [128, 128, 0],
  yellow: [_255, _255, 0],
  orange: [_255, 165, 0],
  gray: [128, 128, 128],
  purple: [128, 0, 128],
  green: [0, 128, 0],
  red: [_255, 0, 0],
  pink: [_255, 192, 203],
  cyan: [0, _255, _255],
  transparent: [_255, _255, _255, 0]
},
    // possible future idea to replace the hard-coded color name values - put this in the ticker.wake() where we set the _doc:
// let ctx = _doc.createElement("canvas").getContext("2d");
// _forEachName("aqua,lime,silver,black,maroon,teal,blue,navy,white,olive,yellow,orange,gray,purple,green,red,pink,cyan", color => {ctx.fillStyle = color; _colorLookup[color] = splitColor(ctx.fillStyle)});
_hue = function _hue(h, m1, m2) {
  h += h < 0 ? 1 : h > 1 ? -1 : 0;
  return (h * 6 < 1 ? m1 + (m2 - m1) * h * 6 : h < .5 ? m2 : h * 3 < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * _255 + .5 | 0;
},
    splitColor = function splitColor(v, toHSL, forceAlpha) {
  var a = !v ? _colorLookup.black : _isNumber(v) ? [v >> 16, v >> 8 & _255, v & _255] : 0,
      r,
      g,
      b,
      h,
      s,
      l,
      max,
      min,
      d,
      wasHSL;

  if (!a) {
    if (v.substr(-1) === ",") {
      //sometimes a trailing comma is included and we should chop it off (typically from a comma-delimited list of values like a textShadow:"2px 2px 2px blue, 5px 5px 5px rgb(255,0,0)" - in this example "blue," has a trailing comma. We could strip it out inside parseComplex() but we'd need to do it to the beginning and ending values plus it wouldn't provide protection from other potential scenarios like if the user passes in a similar value.
      v = v.substr(0, v.length - 1);
    }

    if (_colorLookup[v]) {
      a = _colorLookup[v];
    } else if (v.charAt(0) === "#") {
      if (v.length < 6) {
        //for shorthand like #9F0 or #9F0F (could have alpha)
        r = v.charAt(1);
        g = v.charAt(2);
        b = v.charAt(3);
        v = "#" + r + r + g + g + b + b + (v.length === 5 ? v.charAt(4) + v.charAt(4) : "");
      }

      if (v.length === 9) {
        // hex with alpha, like #fd5e53ff
        a = parseInt(v.substr(1, 6), 16);
        return [a >> 16, a >> 8 & _255, a & _255, parseInt(v.substr(7), 16) / 255];
      }

      v = parseInt(v.substr(1), 16);
      a = [v >> 16, v >> 8 & _255, v & _255];
    } else if (v.substr(0, 3) === "hsl") {
      a = wasHSL = v.match(_strictNumExp);

      if (!toHSL) {
        h = +a[0] % 360 / 360;
        s = +a[1] / 100;
        l = +a[2] / 100;
        g = l <= .5 ? l * (s + 1) : l + s - l * s;
        r = l * 2 - g;
        a.length > 3 && (a[3] *= 1); //cast as number

        a[0] = _hue(h + 1 / 3, r, g);
        a[1] = _hue(h, r, g);
        a[2] = _hue(h - 1 / 3, r, g);
      } else if (~v.indexOf("=")) {
        //if relative values are found, just return the raw strings with the relative prefixes in place.
        a = v.match(_numExp);
        forceAlpha && a.length < 4 && (a[3] = 1);
        return a;
      }
    } else {
      a = v.match(_strictNumExp) || _colorLookup.transparent;
    }

    a = a.map(Number);
  }

  if (toHSL && !wasHSL) {
    r = a[0] / _255;
    g = a[1] / _255;
    b = a[2] / _255;
    max = Math.max(r, g, b);
    min = Math.min(r, g, b);
    l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }

    a[0] = ~~(h + .5);
    a[1] = ~~(s * 100 + .5);
    a[2] = ~~(l * 100 + .5);
  }

  forceAlpha && a.length < 4 && (a[3] = 1);
  return a;
},
    _colorOrderData = function _colorOrderData(v) {
  // strips out the colors from the string, finds all the numeric slots (with units) and returns an array of those. The Array also has a "c" property which is an Array of the index values where the colors belong. This is to help work around issues where there's a mis-matched order of color/numeric data like drop-shadow(#f00 0px 1px 2px) and drop-shadow(0x 1px 2px #f00). This is basically a helper function used in _formatColors()
  var values = [],
      c = [],
      i = -1;
  v.split(_colorExp).forEach(function (v) {
    var a = v.match(_numWithUnitExp) || [];
    values.push.apply(values, a);
    c.push(i += a.length + 1);
  });
  values.c = c;
  return values;
},
    _formatColors = function _formatColors(s, toHSL, orderMatchData) {
  var result = "",
      colors = (s + result).match(_colorExp),
      type = toHSL ? "hsla(" : "rgba(",
      i = 0,
      c,
      shell,
      d,
      l;

  if (!colors) {
    return s;
  }

  colors = colors.map(function (color) {
    return (color = splitColor(color, toHSL, 1)) && type + (toHSL ? color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : color.join(",")) + ")";
  });

  if (orderMatchData) {
    d = _colorOrderData(s);
    c = orderMatchData.c;

    if (c.join(result) !== d.c.join(result)) {
      shell = s.replace(_colorExp, "1").split(_numWithUnitExp);
      l = shell.length - 1;

      for (; i < l; i++) {
        result += shell[i] + (~c.indexOf(i) ? colors.shift() || type + "0,0,0,0)" : (d.length ? d : colors.length ? colors : orderMatchData).shift());
      }
    }
  }

  if (!shell) {
    shell = s.split(_colorExp);
    l = shell.length - 1;

    for (; i < l; i++) {
      result += shell[i] + colors[i];
    }
  }

  return result + shell[l];
},
    _colorExp = function () {
  var s = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b",
      //we'll dynamically build this Regular Expression to conserve file size. After building it, it will be able to find rgb(), rgba(), # (hexadecimal), and named color values like red, blue, purple, etc.,
  p;

  for (p in _colorLookup) {
    s += "|" + p + "\\b";
  }

  return new RegExp(s + ")", "gi");
}(),
    _hslExp = /hsl[a]?\(/,
    _colorStringFilter = function _colorStringFilter(a) {
  var combined = a.join(" "),
      toHSL;
  _colorExp.lastIndex = 0;

  if (_colorExp.test(combined)) {
    toHSL = _hslExp.test(combined);
    a[1] = _formatColors(a[1], toHSL);
    a[0] = _formatColors(a[0], toHSL, _colorOrderData(a[1])); // make sure the order of numbers/colors match with the END value.

    return true;
  }
},

/*
 * --------------------------------------------------------------------------------------
 * TICKER
 * --------------------------------------------------------------------------------------
 */
_tickerActive,
    _ticker = function () {
  var _getTime = Date.now,
      _lagThreshold = 500,
      _adjustedLag = 33,
      _startTime = _getTime(),
      _lastUpdate = _startTime,
      _gap = 1000 / 240,
      _nextTime = _gap,
      _listeners = [],
      _id,
      _req,
      _raf,
      _self,
      _delta,
      _i,
      _tick = function _tick(v) {
    var elapsed = _getTime() - _lastUpdate,
        manual = v === true,
        overlap,
        dispatch,
        time,
        frame;

    (elapsed > _lagThreshold || elapsed < 0) && (_startTime += elapsed - _adjustedLag);
    _lastUpdate += elapsed;
    time = _lastUpdate - _startTime;
    overlap = time - _nextTime;

    if (overlap > 0 || manual) {
      frame = ++_self.frame;
      _delta = time - _self.time * 1000;
      _self.time = time = time / 1000;
      _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
      dispatch = 1;
    }

    manual || (_id = _req(_tick)); //make sure the request is made before we dispatch the "tick" event so that timing is maintained. Otherwise, if processing the "tick" requires a bunch of time (like 15ms) and we're using a setTimeout() that's based on 16.7ms, it'd technically take 31.7ms between frames otherwise.

    if (dispatch) {
      for (_i = 0; _i < _listeners.length; _i++) {
        // use _i and check _listeners.length instead of a variable because a listener could get removed during the loop, and if that happens to an element less than the current index, it'd throw things off in the loop.
        _listeners[_i](time, _delta, frame, v);
      }
    }
  };

  _self = {
    time: 0,
    frame: 0,
    tick: function tick() {
      _tick(true);
    },
    deltaRatio: function deltaRatio(fps) {
      return _delta / (1000 / (fps || 60));
    },
    wake: function wake() {
      if (_coreReady) {
        if (!_coreInitted && _windowExists$1()) {
          _win$1 = _coreInitted = window;
          _doc$1 = _win$1.document || {};
          _globals.gsap = gsap;
          (_win$1.gsapVersions || (_win$1.gsapVersions = [])).push(gsap.version);

          _install(_installScope || _win$1.GreenSockGlobals || !_win$1.gsap && _win$1 || {});

          _registerPluginQueue.forEach(_createPlugin);
        }

        _raf = typeof requestAnimationFrame !== "undefined" && requestAnimationFrame;
        _id && _self.sleep();

        _req = _raf || function (f) {
          return setTimeout(f, _nextTime - _self.time * 1000 + 1 | 0);
        };

        _tickerActive = 1;

        _tick(2);
      }
    },
    sleep: function sleep() {
      (_raf ? cancelAnimationFrame : clearTimeout)(_id);
      _tickerActive = 0;
      _req = _emptyFunc;
    },
    lagSmoothing: function lagSmoothing(threshold, adjustedLag) {
      _lagThreshold = threshold || Infinity; // zero should be interpreted as basically unlimited

      _adjustedLag = Math.min(adjustedLag || 33, _lagThreshold);
    },
    fps: function fps(_fps) {
      _gap = 1000 / (_fps || 240);
      _nextTime = _self.time * 1000 + _gap;
    },
    add: function add(callback, once, prioritize) {
      var func = once ? function (t, d, f, v) {
        callback(t, d, f, v);

        _self.remove(func);
      } : callback;

      _self.remove(callback);

      _listeners[prioritize ? "unshift" : "push"](func);

      _wake();

      return func;
    },
    remove: function remove(callback, i) {
      ~(i = _listeners.indexOf(callback)) && _listeners.splice(i, 1) && _i >= i && _i--;
    },
    _listeners: _listeners
  };
  return _self;
}(),
    _wake = function _wake() {
  return !_tickerActive && _ticker.wake();
},
    //also ensures the core classes are initialized.

/*
* -------------------------------------------------
* EASING
* -------------------------------------------------
*/
_easeMap = {},
    _customEaseExp = /^[\d.\-M][\d.\-,\s]/,
    _quotesExp = /["']/g,
    _parseObjectInString = function _parseObjectInString(value) {
  //takes a string like "{wiggles:10, type:anticipate})" and turns it into a real object. Notice it ends in ")" and includes the {} wrappers. This is because we only use this function for parsing ease configs and prioritized optimization rather than reusability.
  var obj = {},
      split = value.substr(1, value.length - 3).split(":"),
      key = split[0],
      i = 1,
      l = split.length,
      index,
      val,
      parsedVal;

  for (; i < l; i++) {
    val = split[i];
    index = i !== l - 1 ? val.lastIndexOf(",") : val.length;
    parsedVal = val.substr(0, index);
    obj[key] = isNaN(parsedVal) ? parsedVal.replace(_quotesExp, "").trim() : +parsedVal;
    key = val.substr(index + 1).trim();
  }

  return obj;
},
    _valueInParentheses = function _valueInParentheses(value) {
  var open = value.indexOf("(") + 1,
      close = value.indexOf(")"),
      nested = value.indexOf("(", open);
  return value.substring(open, ~nested && nested < close ? value.indexOf(")", close + 1) : close);
},
    _configEaseFromString = function _configEaseFromString(name) {
  //name can be a string like "elastic.out(1,0.5)", and pass in _easeMap as obj and it'll parse it out and call the actual function like _easeMap.Elastic.easeOut.config(1,0.5). It will also parse custom ease strings as long as CustomEase is loaded and registered (internally as _easeMap._CE).
  var split = (name + "").split("("),
      ease = _easeMap[split[0]];
  return ease && split.length > 1 && ease.config ? ease.config.apply(null, ~name.indexOf("{") ? [_parseObjectInString(split[1])] : _valueInParentheses(name).split(",").map(_numericIfPossible)) : _easeMap._CE && _customEaseExp.test(name) ? _easeMap._CE("", name) : ease;
},
    _invertEase = function _invertEase(ease) {
  return function (p) {
    return 1 - ease(1 - p);
  };
},
    // allow yoyoEase to be set in children and have those affected when the parent/ancestor timeline yoyos.
_propagateYoyoEase = function _propagateYoyoEase(timeline, isYoyo) {
  var child = timeline._first,
      ease;

  while (child) {
    if (child instanceof Timeline) {
      _propagateYoyoEase(child, isYoyo);
    } else if (child.vars.yoyoEase && (!child._yoyo || !child._repeat) && child._yoyo !== isYoyo) {
      if (child.timeline) {
        _propagateYoyoEase(child.timeline, isYoyo);
      } else {
        ease = child._ease;
        child._ease = child._yEase;
        child._yEase = ease;
        child._yoyo = isYoyo;
      }
    }

    child = child._next;
  }
},
    _parseEase = function _parseEase(ease, defaultEase) {
  return !ease ? defaultEase : (_isFunction(ease) ? ease : _easeMap[ease] || _configEaseFromString(ease)) || defaultEase;
},
    _insertEase = function _insertEase(names, easeIn, easeOut, easeInOut) {
  if (easeOut === void 0) {
    easeOut = function easeOut(p) {
      return 1 - easeIn(1 - p);
    };
  }

  if (easeInOut === void 0) {
    easeInOut = function easeInOut(p) {
      return p < .5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2;
    };
  }

  var ease = {
    easeIn: easeIn,
    easeOut: easeOut,
    easeInOut: easeInOut
  },
      lowercaseName;

  _forEachName(names, function (name) {
    _easeMap[name] = _globals[name] = ease;
    _easeMap[lowercaseName = name.toLowerCase()] = easeOut;

    for (var p in ease) {
      _easeMap[lowercaseName + (p === "easeIn" ? ".in" : p === "easeOut" ? ".out" : ".inOut")] = _easeMap[name + "." + p] = ease[p];
    }
  });

  return ease;
},
    _easeInOutFromOut = function _easeInOutFromOut(easeOut) {
  return function (p) {
    return p < .5 ? (1 - easeOut(1 - p * 2)) / 2 : .5 + easeOut((p - .5) * 2) / 2;
  };
},
    _configElastic = function _configElastic(type, amplitude, period) {
  var p1 = amplitude >= 1 ? amplitude : 1,
      //note: if amplitude is < 1, we simply adjust the period for a more natural feel. Otherwise the math doesn't work right and the curve starts at 1.
  p2 = (period || (type ? .3 : .45)) / (amplitude < 1 ? amplitude : 1),
      p3 = p2 / _2PI * (Math.asin(1 / p1) || 0),
      easeOut = function easeOut(p) {
    return p === 1 ? 1 : p1 * Math.pow(2, -10 * p) * _sin((p - p3) * p2) + 1;
  },
      ease = type === "out" ? easeOut : type === "in" ? function (p) {
    return 1 - easeOut(1 - p);
  } : _easeInOutFromOut(easeOut);

  p2 = _2PI / p2; //precalculate to optimize

  ease.config = function (amplitude, period) {
    return _configElastic(type, amplitude, period);
  };

  return ease;
},
    _configBack = function _configBack(type, overshoot) {
  if (overshoot === void 0) {
    overshoot = 1.70158;
  }

  var easeOut = function easeOut(p) {
    return p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0;
  },
      ease = type === "out" ? easeOut : type === "in" ? function (p) {
    return 1 - easeOut(1 - p);
  } : _easeInOutFromOut(easeOut);

  ease.config = function (overshoot) {
    return _configBack(type, overshoot);
  };

  return ease;
}; // a cheaper (kb and cpu) but more mild way to get a parameterized weighted ease by feeding in a value between -1 (easeIn) and 1 (easeOut) where 0 is linear.
// _weightedEase = ratio => {
// 	let y = 0.5 + ratio / 2;
// 	return p => (2 * (1 - p) * p * y + p * p);
// },
// a stronger (but more expensive kb/cpu) parameterized weighted ease that lets you feed in a value between -1 (easeIn) and 1 (easeOut) where 0 is linear.
// _weightedEaseStrong = ratio => {
// 	ratio = .5 + ratio / 2;
// 	let o = 1 / 3 * (ratio < .5 ? ratio : 1 - ratio),
// 		b = ratio - o,
// 		c = ratio + o;
// 	return p => p === 1 ? p : 3 * b * (1 - p) * (1 - p) * p + 3 * c * (1 - p) * p * p + p * p * p;
// };


_forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", function (name, i) {
  var power = i < 5 ? i + 1 : i;

  _insertEase(name + ",Power" + (power - 1), i ? function (p) {
    return Math.pow(p, power);
  } : function (p) {
    return p;
  }, function (p) {
    return 1 - Math.pow(1 - p, power);
  }, function (p) {
    return p < .5 ? Math.pow(p * 2, power) / 2 : 1 - Math.pow((1 - p) * 2, power) / 2;
  });
});

_easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;

_insertEase("Elastic", _configElastic("in"), _configElastic("out"), _configElastic());

(function (n, c) {
  var n1 = 1 / c,
      n2 = 2 * n1,
      n3 = 2.5 * n1,
      easeOut = function easeOut(p) {
    return p < n1 ? n * p * p : p < n2 ? n * Math.pow(p - 1.5 / c, 2) + .75 : p < n3 ? n * (p -= 2.25 / c) * p + .9375 : n * Math.pow(p - 2.625 / c, 2) + .984375;
  };

  _insertEase("Bounce", function (p) {
    return 1 - easeOut(1 - p);
  }, easeOut);
})(7.5625, 2.75);

_insertEase("Expo", function (p) {
  return Math.pow(2, 10 * (p - 1)) * p + p * p * p * p * p * p * (1 - p);
}); // previously 2 ** (10 * (p - 1)) but that doesn't end up with the value quite at the right spot so we do a blended ease to ensure it lands where it should perfectly.


_insertEase("Circ", function (p) {
  return -(_sqrt(1 - p * p) - 1);
});

_insertEase("Sine", function (p) {
  return p === 1 ? 1 : -_cos(p * _HALF_PI) + 1;
});

_insertEase("Back", _configBack("in"), _configBack("out"), _configBack());

_easeMap.SteppedEase = _easeMap.steps = _globals.SteppedEase = {
  config: function config(steps, immediateStart) {
    if (steps === void 0) {
      steps = 1;
    }

    var p1 = 1 / steps,
        p2 = steps + (immediateStart ? 0 : 1),
        p3 = immediateStart ? 1 : 0,
        max = 1 - _tinyNum;
    return function (p) {
      return ((p2 * _clamp(0, max, p) | 0) + p3) * p1;
    };
  }
};
_defaults.ease = _easeMap["quad.out"];

_forEachName("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function (name) {
  return _callbackNames += name + "," + name + "Params,";
});
/*
 * --------------------------------------------------------------------------------------
 * CACHE
 * --------------------------------------------------------------------------------------
 */


var GSCache = function GSCache(target, harness) {
  this.id = _gsID++;
  target._gsap = this;
  this.target = target;
  this.harness = harness;
  this.get = harness ? harness.get : _getProperty;
  this.set = harness ? harness.getSetter : _getSetter;
};
/*
 * --------------------------------------------------------------------------------------
 * ANIMATION
 * --------------------------------------------------------------------------------------
 */

var Animation = /*#__PURE__*/function () {
  function Animation(vars) {
    this.vars = vars;
    this._delay = +vars.delay || 0;

    if (this._repeat = vars.repeat === Infinity ? -2 : vars.repeat || 0) {
      // TODO: repeat: Infinity on a timeline's children must flag that timeline internally and affect its totalDuration, otherwise it'll stop in the negative direction when reaching the start.
      this._rDelay = vars.repeatDelay || 0;
      this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
    }

    this._ts = 1;

    _setDuration(this, +vars.duration, 1, 1);

    this.data = vars.data;

    if (_context) {
      this._ctx = _context;

      _context.data.push(this);
    }

    _tickerActive || _ticker.wake();
  }

  var _proto = Animation.prototype;

  _proto.delay = function delay(value) {
    if (value || value === 0) {
      this.parent && this.parent.smoothChildTiming && this.startTime(this._start + value - this._delay);
      this._delay = value;
      return this;
    }

    return this._delay;
  };

  _proto.duration = function duration(value) {
    return arguments.length ? this.totalDuration(this._repeat > 0 ? value + (value + this._rDelay) * this._repeat : value) : this.totalDuration() && this._dur;
  };

  _proto.totalDuration = function totalDuration(value) {
    if (!arguments.length) {
      return this._tDur;
    }

    this._dirty = 0;
    return _setDuration(this, this._repeat < 0 ? value : (value - this._repeat * this._rDelay) / (this._repeat + 1));
  };

  _proto.totalTime = function totalTime(_totalTime, suppressEvents) {
    _wake();

    if (!arguments.length) {
      return this._tTime;
    }

    var parent = this._dp;

    if (parent && parent.smoothChildTiming && this._ts) {
      _alignPlayhead(this, _totalTime);

      !parent._dp || parent.parent || _postAddChecks(parent, this); // edge case: if this is a child of a timeline that already completed, for example, we must re-activate the parent.
      //in case any of the ancestor timelines had completed but should now be enabled, we should reset their totalTime() which will also ensure that they're lined up properly and enabled. Skip for animations that are on the root (wasteful). Example: a TimelineLite.exportRoot() is performed when there's a paused tween on the root, the export will not complete until that tween is unpaused, but imagine a child gets restarted later, after all [unpaused] tweens have completed. The start of that child would get pushed out, but one of the ancestors may have completed.

      while (parent && parent.parent) {
        if (parent.parent._time !== parent._start + (parent._ts >= 0 ? parent._tTime / parent._ts : (parent.totalDuration() - parent._tTime) / -parent._ts)) {
          parent.totalTime(parent._tTime, true);
        }

        parent = parent.parent;
      }

      if (!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && _totalTime < this._tDur || this._ts < 0 && _totalTime > 0 || !this._tDur && !_totalTime)) {
        //if the animation doesn't have a parent, put it back into its last parent (recorded as _dp for exactly cases like this). Limit to parents with autoRemoveChildren (like globalTimeline) so that if the user manually removes an animation from a timeline and then alters its playhead, it doesn't get added back in.
        _addToTimeline(this._dp, this, this._start - this._delay);
      }
    }

    if (this._tTime !== _totalTime || !this._dur && !suppressEvents || this._initted && Math.abs(this._zTime) === _tinyNum || !this._initted && this._dur && _totalTime || !_totalTime && !this._initted && (this.add || this._ptLookup)) {
      // check for _ptLookup on a Tween instance to ensure it has actually finished being instantiated, otherwise if this.reverse() gets called in the Animation constructor, it could trigger a render() here even though the _targets weren't populated, thus when _init() is called there won't be any PropTweens (it'll act like the tween is non-functional)
      this._ts || (this._pTime = _totalTime); // otherwise, if an animation is paused, then the playhead is moved back to zero, then resumed, it'd revert back to the original time at the pause
      //if (!this._lock) { // avoid endless recursion (not sure we need this yet or if it's worth the performance hit)
      //   this._lock = 1;

      _lazySafeRender(this, _totalTime, suppressEvents); //   this._lock = 0;
      //}

    }

    return this;
  };

  _proto.time = function time(value, suppressEvents) {
    return arguments.length ? this.totalTime(Math.min(this.totalDuration(), value + _elapsedCycleDuration(this)) % (this._dur + this._rDelay) || (value ? this._dur : 0), suppressEvents) : this._time; // note: if the modulus results in 0, the playhead could be exactly at the end or the beginning, and we always defer to the END with a non-zero value, otherwise if you set the time() to the very end (duration()), it would render at the START!
  };

  _proto.totalProgress = function totalProgress(value, suppressEvents) {
    return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
  };

  _proto.progress = function progress(value, suppressEvents) {
    return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - value : value) + _elapsedCycleDuration(this), suppressEvents) : this.duration() ? Math.min(1, this._time / this._dur) : this.rawTime() > 0 ? 1 : 0;
  };

  _proto.iteration = function iteration(value, suppressEvents) {
    var cycleDuration = this.duration() + this._rDelay;

    return arguments.length ? this.totalTime(this._time + (value - 1) * cycleDuration, suppressEvents) : this._repeat ? _animationCycle(this._tTime, cycleDuration) + 1 : 1;
  } // potential future addition:
  // isPlayingBackwards() {
  // 	let animation = this,
  // 		orientation = 1; // 1 = forward, -1 = backward
  // 	while (animation) {
  // 		orientation *= animation.reversed() || (animation.repeat() && !(animation.iteration() & 1)) ? -1 : 1;
  // 		animation = animation.parent;
  // 	}
  // 	return orientation < 0;
  // }
  ;

  _proto.timeScale = function timeScale(value, suppressEvents) {
    if (!arguments.length) {
      return this._rts === -_tinyNum ? 0 : this._rts; // recorded timeScale. Special case: if someone calls reverse() on an animation with timeScale of 0, we assign it -_tinyNum to remember it's reversed.
    }

    if (this._rts === value) {
      return this;
    }

    var tTime = this.parent && this._ts ? _parentToChildTotalTime(this.parent._time, this) : this._tTime; // make sure to do the parentToChildTotalTime() BEFORE setting the new _ts because the old one must be used in that calculation.
    // future addition? Up side: fast and minimal file size. Down side: only works on this animation; if a timeline is reversed, for example, its childrens' onReverse wouldn't get called.
    //(+value < 0 && this._rts >= 0) && _callback(this, "onReverse", true);
    // prioritize rendering where the parent's playhead lines up instead of this._tTime because there could be a tween that's animating another tween's timeScale in the same rendering loop (same parent), thus if the timeScale tween renders first, it would alter _start BEFORE _tTime was set on that tick (in the rendering loop), effectively freezing it until the timeScale tween finishes.

    this._rts = +value || 0;
    this._ts = this._ps || value === -_tinyNum ? 0 : this._rts; // _ts is the functional timeScale which would be 0 if the animation is paused.

    this.totalTime(_clamp(-Math.abs(this._delay), this.totalDuration(), tTime), suppressEvents !== false);

    _setEnd(this); // if parent.smoothChildTiming was false, the end time didn't get updated in the _alignPlayhead() method, so do it here.


    return _recacheAncestors(this);
  };

  _proto.paused = function paused(value) {
    if (!arguments.length) {
      return this._ps;
    } // possible future addition - if an animation is removed from its parent and then .restart() or .play() or .resume() is called, perhaps we should force it back into the globalTimeline but be careful because what if it's already at its end? We don't want it to just persist forever and not get released for GC.
    // !this.parent && !value && this._tTime < this._tDur && this !== _globalTimeline && _globalTimeline.add(this);


    if (this._ps !== value) {
      this._ps = value;

      if (value) {
        this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()); // if the pause occurs during the delay phase, make sure that's factored in when resuming.

        this._ts = this._act = 0; // _ts is the functional timeScale, so a paused tween would effectively have a timeScale of 0. We record the "real" timeScale as _rts (recorded time scale)
      } else {
        _wake();

        this._ts = this._rts; //only defer to _pTime (pauseTime) if tTime is zero. Remember, someone could pause() an animation, then scrub the playhead and resume(). If the parent doesn't have smoothChildTiming, we render at the rawTime() because the startTime won't get updated.

        this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== _tinyNum && (this._tTime -= _tinyNum)); // edge case: animation.progress(1).pause().play() wouldn't render again because the playhead is already at the end, but the call to totalTime() below will add it back to its parent...and not remove it again (since removing only happens upon rendering at a new time). Offsetting the _tTime slightly is done simply to cause the final render in totalTime() that'll pop it off its timeline (if autoRemoveChildren is true, of course). Check to make sure _zTime isn't -_tinyNum to avoid an edge case where the playhead is pushed to the end but INSIDE a tween/callback, the timeline itself is paused thus halting rendering and leaving a few unrendered. When resuming, it wouldn't render those otherwise.
      }
    }

    return this;
  };

  _proto.startTime = function startTime(value) {
    if (arguments.length) {
      this._start = _roundPrecise(value);
      var parent = this.parent || this._dp;
      parent && (parent._sort || !this.parent) && _addToTimeline(parent, this, this._start - this._delay);
      return this;
    }

    return this._start;
  };

  _proto.endTime = function endTime(includeRepeats) {
    return this._start + (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
  };

  _proto.rawTime = function rawTime(wrapRepeats) {
    var parent = this.parent || this._dp; // _dp = detached parent

    return !parent ? this._tTime : wrapRepeats && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : !this._ts ? this._tTime : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
  };

  _proto.revert = function revert(config) {
    if (config === void 0) {
      config = _revertConfig;
    }

    var prevIsReverting = _reverting$1;
    _reverting$1 = config;

    if (_isRevertWorthy(this)) {
      this.timeline && this.timeline.revert(config);
      this.totalTime(-0.01, config.suppressEvents);
    }

    this.data !== "nested" && config.kill !== false && this.kill();
    _reverting$1 = prevIsReverting;
    return this;
  };

  _proto.globalTime = function globalTime(rawTime) {
    var animation = this,
        time = arguments.length ? rawTime : animation.rawTime();

    while (animation) {
      time = animation._start + time / (Math.abs(animation._ts) || 1);
      animation = animation._dp;
    }

    return !this.parent && this._sat ? this._sat.globalTime(rawTime) : time; // the _startAt tweens for .fromTo() and .from() that have immediateRender should always be FIRST in the timeline (important for context.revert()). "_sat" stands for _startAtTween, referring to the parent tween that created the _startAt. We must discern if that tween had immediateRender so that we can know whether or not to prioritize it in revert().
  };

  _proto.repeat = function repeat(value) {
    if (arguments.length) {
      this._repeat = value === Infinity ? -2 : value;
      return _onUpdateTotalDuration(this);
    }

    return this._repeat === -2 ? Infinity : this._repeat;
  };

  _proto.repeatDelay = function repeatDelay(value) {
    if (arguments.length) {
      var time = this._time;
      this._rDelay = value;

      _onUpdateTotalDuration(this);

      return time ? this.time(time) : this;
    }

    return this._rDelay;
  };

  _proto.yoyo = function yoyo(value) {
    if (arguments.length) {
      this._yoyo = value;
      return this;
    }

    return this._yoyo;
  };

  _proto.seek = function seek(position, suppressEvents) {
    return this.totalTime(_parsePosition(this, position), _isNotFalse(suppressEvents));
  };

  _proto.restart = function restart(includeDelay, suppressEvents) {
    this.play().totalTime(includeDelay ? -this._delay : 0, _isNotFalse(suppressEvents));
    this._dur || (this._zTime = -_tinyNum); // ensures onComplete fires on a zero-duration animation that gets restarted.

    return this;
  };

  _proto.play = function play(from, suppressEvents) {
    from != null && this.seek(from, suppressEvents);
    return this.reversed(false).paused(false);
  };

  _proto.reverse = function reverse(from, suppressEvents) {
    from != null && this.seek(from || this.totalDuration(), suppressEvents);
    return this.reversed(true).paused(false);
  };

  _proto.pause = function pause(atTime, suppressEvents) {
    atTime != null && this.seek(atTime, suppressEvents);
    return this.paused(true);
  };

  _proto.resume = function resume() {
    return this.paused(false);
  };

  _proto.reversed = function reversed(value) {
    if (arguments.length) {
      !!value !== this.reversed() && this.timeScale(-this._rts || (value ? -_tinyNum : 0)); // in case timeScale is zero, reversing would have no effect so we use _tinyNum.

      return this;
    }

    return this._rts < 0;
  };

  _proto.invalidate = function invalidate() {
    this._initted = this._act = 0;
    this._zTime = -_tinyNum;
    return this;
  };

  _proto.isActive = function isActive() {
    var parent = this.parent || this._dp,
        start = this._start,
        rawTime;
    return !!(!parent || this._ts && this._initted && parent.isActive() && (rawTime = parent.rawTime(true)) >= start && rawTime < this.endTime(true) - _tinyNum);
  };

  _proto.eventCallback = function eventCallback(type, callback, params) {
    var vars = this.vars;

    if (arguments.length > 1) {
      if (!callback) {
        delete vars[type];
      } else {
        vars[type] = callback;
        params && (vars[type + "Params"] = params);
        type === "onUpdate" && (this._onUpdate = callback);
      }

      return this;
    }

    return vars[type];
  };

  _proto.then = function then(onFulfilled) {
    var self = this,
        prevProm = self._prom;
    return new Promise(function (resolve) {
      var f = _isFunction(onFulfilled) ? onFulfilled : _passThrough,
          _resolve = function _resolve() {
        var _then = self.then;
        self.then = null; // temporarily null the then() method to avoid an infinite loop (see https://github.com/greensock/GSAP/issues/322)

        prevProm && prevProm();
        _isFunction(f) && (f = f(self)) && (f.then || f === self) && (self.then = _then);
        resolve(f);
        self.then = _then;
      };

      if (self._initted && self.totalProgress() === 1 && self._ts >= 0 || !self._tTime && self._ts < 0) {
        _resolve();
      } else {
        self._prom = _resolve;
      }
    });
  };

  _proto.kill = function kill() {
    _interrupt(this);
  };

  return Animation;
}();

_setDefaults(Animation.prototype, {
  _time: 0,
  _start: 0,
  _end: 0,
  _tTime: 0,
  _tDur: 0,
  _dirty: 0,
  _repeat: 0,
  _yoyo: false,
  parent: null,
  _initted: false,
  _rDelay: 0,
  _ts: 1,
  _dp: 0,
  ratio: 0,
  _zTime: -_tinyNum,
  _prom: 0,
  _ps: false,
  _rts: 1
});
/*
 * -------------------------------------------------
 * TIMELINE
 * -------------------------------------------------
 */


var Timeline = /*#__PURE__*/function (_Animation) {
  _inheritsLoose(Timeline, _Animation);

  function Timeline(vars, position) {
    var _this;

    if (vars === void 0) {
      vars = {};
    }

    _this = _Animation.call(this, vars) || this;
    _this.labels = {};
    _this.smoothChildTiming = !!vars.smoothChildTiming;
    _this.autoRemoveChildren = !!vars.autoRemoveChildren;
    _this._sort = _isNotFalse(vars.sortChildren);
    _globalTimeline && _addToTimeline(vars.parent || _globalTimeline, _assertThisInitialized(_this), position);
    vars.reversed && _this.reverse();
    vars.paused && _this.paused(true);
    vars.scrollTrigger && _scrollTrigger(_assertThisInitialized(_this), vars.scrollTrigger);
    return _this;
  }

  var _proto2 = Timeline.prototype;

  _proto2.to = function to(targets, vars, position) {
    _createTweenType(0, arguments, this);

    return this;
  };

  _proto2.from = function from(targets, vars, position) {
    _createTweenType(1, arguments, this);

    return this;
  };

  _proto2.fromTo = function fromTo(targets, fromVars, toVars, position) {
    _createTweenType(2, arguments, this);

    return this;
  };

  _proto2.set = function set(targets, vars, position) {
    vars.duration = 0;
    vars.parent = this;
    _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
    vars.immediateRender = !!vars.immediateRender;
    new Tween(targets, vars, _parsePosition(this, position), 1);
    return this;
  };

  _proto2.call = function call(callback, params, position) {
    return _addToTimeline(this, Tween.delayedCall(0, callback, params), position);
  } //ONLY for backward compatibility! Maybe delete?
  ;

  _proto2.staggerTo = function staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
    vars.duration = duration;
    vars.stagger = vars.stagger || stagger;
    vars.onComplete = onCompleteAll;
    vars.onCompleteParams = onCompleteAllParams;
    vars.parent = this;
    new Tween(targets, vars, _parsePosition(this, position));
    return this;
  };

  _proto2.staggerFrom = function staggerFrom(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
    vars.runBackwards = 1;
    _inheritDefaults(vars).immediateRender = _isNotFalse(vars.immediateRender);
    return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams);
  };

  _proto2.staggerFromTo = function staggerFromTo(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams) {
    toVars.startAt = fromVars;
    _inheritDefaults(toVars).immediateRender = _isNotFalse(toVars.immediateRender);
    return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams);
  };

  _proto2.render = function render(totalTime, suppressEvents, force) {
    var prevTime = this._time,
        tDur = this._dirty ? this.totalDuration() : this._tDur,
        dur = this._dur,
        tTime = totalTime <= 0 ? 0 : _roundPrecise(totalTime),
        // if a paused timeline is resumed (or its _start is updated for another reason...which rounds it), that could result in the playhead shifting a **tiny** amount and a zero-duration child at that spot may get rendered at a different ratio, like its totalTime in render() may be 1e-17 instead of 0, for example.
    crossingStart = this._zTime < 0 !== totalTime < 0 && (this._initted || !dur),
        time,
        child,
        next,
        iteration,
        cycleDuration,
        prevPaused,
        pauseTween,
        timeScale,
        prevStart,
        prevIteration,
        yoyo,
        isYoyo;
    this !== _globalTimeline && tTime > tDur && totalTime >= 0 && (tTime = tDur);

    if (tTime !== this._tTime || force || crossingStart) {
      if (prevTime !== this._time && dur) {
        //if totalDuration() finds a child with a negative startTime and smoothChildTiming is true, things get shifted around internally so we need to adjust the time accordingly. For example, if a tween starts at -30 we must shift EVERYTHING forward 30 seconds and move this timeline's startTime backward by 30 seconds so that things align with the playhead (no jump).
        tTime += this._time - prevTime;
        totalTime += this._time - prevTime;
      }

      time = tTime;
      prevStart = this._start;
      timeScale = this._ts;
      prevPaused = !timeScale;

      if (crossingStart) {
        dur || (prevTime = this._zTime); //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration timeline, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect.

        (totalTime || !suppressEvents) && (this._zTime = totalTime);
      }

      if (this._repeat) {
        //adjust the time for repeats and yoyos
        yoyo = this._yoyo;
        cycleDuration = dur + this._rDelay;

        if (this._repeat < -1 && totalTime < 0) {
          return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
        }

        time = _roundPrecise(tTime % cycleDuration); //round to avoid floating point errors. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)

        if (tTime === tDur) {
          // the tDur === tTime is for edge cases where there's a lengthy decimal on the duration and it may reach the very end but the time is rendered as not-quite-there (remember, tDur is rounded to 4 decimals whereas dur isn't)
          iteration = this._repeat;
          time = dur;
        } else {
          prevIteration = _roundPrecise(tTime / cycleDuration); // full decimal version of iterations, not the previous iteration (we're reusing prevIteration variable for efficiency)

          iteration = ~~prevIteration;

          if (iteration && iteration === prevIteration) {
            time = dur;
            iteration--;
          }

          time > dur && (time = dur);
        }

        prevIteration = _animationCycle(this._tTime, cycleDuration);
        !prevTime && this._tTime && prevIteration !== iteration && this._tTime - prevIteration * cycleDuration - this._dur <= 0 && (prevIteration = iteration); // edge case - if someone does addPause() at the very beginning of a repeating timeline, that pause is technically at the same spot as the end which causes this._time to get set to 0 when the totalTime would normally place the playhead at the end. See https://gsap.com/forums/topic/23823-closing-nav-animation-not-working-on-ie-and-iphone-6-maybe-other-older-browser/?tab=comments#comment-113005 also, this._tTime - prevIteration * cycleDuration - this._dur <= 0 just checks to make sure it wasn't previously in the "repeatDelay" portion

        if (yoyo && iteration & 1) {
          time = dur - time;
          isYoyo = 1;
        }
        /*
        make sure children at the end/beginning of the timeline are rendered properly. If, for example,
        a 3-second long timeline rendered at 2.9 seconds previously, and now renders at 3.2 seconds (which
        would get translated to 2.8 seconds if the timeline yoyos or 0.2 seconds if it just repeats), there
        could be a callback or a short tween that's at 2.95 or 3 seconds in which wouldn't render. So
        we need to push the timeline to the end (and/or beginning depending on its yoyo value). Also we must
        ensure that zero-duration tweens at the very beginning or end of the Timeline work.
        */


        if (iteration !== prevIteration && !this._lock) {
          var rewinding = yoyo && prevIteration & 1,
              doesWrap = rewinding === (yoyo && iteration & 1);
          iteration < prevIteration && (rewinding = !rewinding);
          prevTime = rewinding ? 0 : tTime % dur ? dur : tTime; // if the playhead is landing exactly at the end of an iteration, use that totalTime rather than only the duration, otherwise it'll skip the 2nd render since it's effectively at the same time.

          this._lock = 1;
          this.render(prevTime || (isYoyo ? 0 : _roundPrecise(iteration * cycleDuration)), suppressEvents, !dur)._lock = 0;
          this._tTime = tTime; // if a user gets the iteration() inside the onRepeat, for example, it should be accurate.

          !suppressEvents && this.parent && _callback(this, "onRepeat");

          if (this.vars.repeatRefresh && !isYoyo) {
            this.invalidate()._lock = 1;
            prevIteration = iteration; // otherwise, the onStart() may fire on the 2nd iteration.
          }

          if (prevTime && prevTime !== this._time || prevPaused !== !this._ts || this.vars.onRepeat && !this.parent && !this._act) {
            // if prevTime is 0 and we render at the very end, _time will be the end, thus won't match. So in this edge case, prevTime won't match _time but that's okay. If it gets killed in the onRepeat, eject as well.
            return this;
          }

          dur = this._dur; // in case the duration changed in the onRepeat

          tDur = this._tDur;

          if (doesWrap) {
            this._lock = 2;
            prevTime = rewinding ? dur : -1e-4;
            this.render(prevTime, true);
            this.vars.repeatRefresh && !isYoyo && this.invalidate();
          }

          this._lock = 0;

          if (!this._ts && !prevPaused) {
            return this;
          } //in order for yoyoEase to work properly when there's a stagger, we must swap out the ease in each sub-tween.


          _propagateYoyoEase(this, isYoyo);
        }
      }

      if (this._hasPause && !this._forcing && this._lock < 2) {
        pauseTween = _findNextPauseTween(this, _roundPrecise(prevTime), _roundPrecise(time));

        if (pauseTween) {
          tTime -= time - (time = pauseTween._start);
        }
      }

      this._tTime = tTime;
      this._time = time;
      this._act = !timeScale; //as long as it's not paused, force it to be active so that if the user renders independent of the parent timeline, it'll be forced to re-render on the next tick.

      if (!this._initted) {
        this._onUpdate = this.vars.onUpdate;
        this._initted = 1;
        this._zTime = totalTime;
        prevTime = 0; // upon init, the playhead should always go forward; someone could invalidate() a completed timeline and then if they restart(), that would make child tweens render in reverse order which could lock in the wrong starting values if they build on each other, like tl.to(obj, {x: 100}).to(obj, {x: 0}).
      }

      if (!prevTime && tTime && dur && !suppressEvents && !prevIteration) {
        _callback(this, "onStart");

        if (this._tTime !== tTime) {
          // in case the onStart triggered a render at a different spot, eject. Like if someone did animation.pause(0.5) or something inside the onStart.
          return this;
        }
      }

      if (time >= prevTime && totalTime >= 0) {
        child = this._first;

        while (child) {
          next = child._next;

          if ((child._act || time >= child._start) && child._ts && pauseTween !== child) {
            if (child.parent !== this) {
              // an extreme edge case - the child's render could do something like kill() the "next" one in the linked list, or reparent it. In that case we must re-initiate the whole render to be safe.
              return this.render(totalTime, suppressEvents, force);
            }

            child.render(child._ts > 0 ? (time - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (time - child._start) * child._ts, suppressEvents, force);

            if (time !== this._time || !this._ts && !prevPaused) {
              //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
              pauseTween = 0;
              next && (tTime += this._zTime = -_tinyNum); // it didn't finish rendering, so flag zTime as negative so that the next time render() is called it'll be forced (to render any remaining children)

              break;
            }
          }

          child = next;
        }
      } else {
        child = this._last;
        var adjustedTime = totalTime < 0 ? totalTime : time; //when the playhead goes backward beyond the start of this timeline, we must pass that information down to the child animations so that zero-duration tweens know whether to render their starting or ending values.

        while (child) {
          next = child._prev;

          if ((child._act || adjustedTime <= child._end) && child._ts && pauseTween !== child) {
            if (child.parent !== this) {
              // an extreme edge case - the child's render could do something like kill() the "next" one in the linked list, or reparent it. In that case we must re-initiate the whole render to be safe.
              return this.render(totalTime, suppressEvents, force);
            }

            child.render(child._ts > 0 ? (adjustedTime - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (adjustedTime - child._start) * child._ts, suppressEvents, force || _reverting$1 && _isRevertWorthy(child)); // if reverting, we should always force renders of initted tweens (but remember that .fromTo() or .from() may have a _startAt but not _initted yet). If, for example, a .fromTo() tween with a stagger (which creates an internal timeline) gets reverted BEFORE some of its child tweens render for the first time, it may not properly trigger them to revert.

            if (time !== this._time || !this._ts && !prevPaused) {
              //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
              pauseTween = 0;
              next && (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum); // it didn't finish rendering, so adjust zTime so that so that the next time render() is called it'll be forced (to render any remaining children)

              break;
            }
          }

          child = next;
        }
      }

      if (pauseTween && !suppressEvents) {
        this.pause();
        pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime = time >= prevTime ? 1 : -1;

        if (this._ts) {
          //the callback resumed playback! So since we may have held back the playhead due to where the pause is positioned, go ahead and jump to where it's SUPPOSED to be (if no pause happened).
          this._start = prevStart; //if the pause was at an earlier time and the user resumed in the callback, it could reposition the timeline (changing its startTime), throwing things off slightly, so we make sure the _start doesn't shift.

          _setEnd(this);

          return this.render(totalTime, suppressEvents, force);
        }
      }

      this._onUpdate && !suppressEvents && _callback(this, "onUpdate", true);
      if (tTime === tDur && this._tTime >= this.totalDuration() || !tTime && prevTime) if (prevStart === this._start || Math.abs(timeScale) !== Math.abs(this._ts)) if (!this._lock) {
        // remember, a child's callback may alter this timeline's playhead or timeScale which is why we need to add some of these checks.
        (totalTime || !dur) && (tTime === tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1); // don't remove if the timeline is reversed and the playhead isn't at 0, otherwise tl.progress(1).reverse() won't work. Only remove if the playhead is at the end and timeScale is positive, or if the playhead is at 0 and the timeScale is negative.

        if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime || !tDur)) {
          _callback(this, tTime === tDur && totalTime >= 0 ? "onComplete" : "onReverseComplete", true);

          this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
        }
      }
    }

    return this;
  };

  _proto2.add = function add(child, position) {
    var _this2 = this;

    _isNumber(position) || (position = _parsePosition(this, position, child));

    if (!(child instanceof Animation)) {
      if (_isArray(child)) {
        child.forEach(function (obj) {
          return _this2.add(obj, position);
        });
        return this;
      }

      if (_isString(child)) {
        return this.addLabel(child, position);
      }

      if (_isFunction(child)) {
        child = Tween.delayedCall(0, child);
      } else {
        return this;
      }
    }

    return this !== child ? _addToTimeline(this, child, position) : this; //don't allow a timeline to be added to itself as a child!
  };

  _proto2.getChildren = function getChildren(nested, tweens, timelines, ignoreBeforeTime) {
    if (nested === void 0) {
      nested = true;
    }

    if (tweens === void 0) {
      tweens = true;
    }

    if (timelines === void 0) {
      timelines = true;
    }

    if (ignoreBeforeTime === void 0) {
      ignoreBeforeTime = -_bigNum$1;
    }

    var a = [],
        child = this._first;

    while (child) {
      if (child._start >= ignoreBeforeTime) {
        if (child instanceof Tween) {
          tweens && a.push(child);
        } else {
          timelines && a.push(child);
          nested && a.push.apply(a, child.getChildren(true, tweens, timelines));
        }
      }

      child = child._next;
    }

    return a;
  };

  _proto2.getById = function getById(id) {
    var animations = this.getChildren(1, 1, 1),
        i = animations.length;

    while (i--) {
      if (animations[i].vars.id === id) {
        return animations[i];
      }
    }
  };

  _proto2.remove = function remove(child) {
    if (_isString(child)) {
      return this.removeLabel(child);
    }

    if (_isFunction(child)) {
      return this.killTweensOf(child);
    }

    child.parent === this && _removeLinkedListItem(this, child);

    if (child === this._recent) {
      this._recent = this._last;
    }

    return _uncache(this);
  };

  _proto2.totalTime = function totalTime(_totalTime2, suppressEvents) {
    if (!arguments.length) {
      return this._tTime;
    }

    this._forcing = 1;

    if (!this._dp && this._ts) {
      //special case for the global timeline (or any other that has no parent or detached parent).
      this._start = _roundPrecise(_ticker.time - (this._ts > 0 ? _totalTime2 / this._ts : (this.totalDuration() - _totalTime2) / -this._ts));
    }

    _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);

    this._forcing = 0;
    return this;
  };

  _proto2.addLabel = function addLabel(label, position) {
    this.labels[label] = _parsePosition(this, position);
    return this;
  };

  _proto2.removeLabel = function removeLabel(label) {
    delete this.labels[label];
    return this;
  };

  _proto2.addPause = function addPause(position, callback, params) {
    var t = Tween.delayedCall(0, callback || _emptyFunc, params);
    t.data = "isPause";
    this._hasPause = 1;
    return _addToTimeline(this, t, _parsePosition(this, position));
  };

  _proto2.removePause = function removePause(position) {
    var child = this._first;
    position = _parsePosition(this, position);

    while (child) {
      if (child._start === position && child.data === "isPause") {
        _removeFromParent(child);
      }

      child = child._next;
    }
  };

  _proto2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
    var tweens = this.getTweensOf(targets, onlyActive),
        i = tweens.length;

    while (i--) {
      _overwritingTween !== tweens[i] && tweens[i].kill(targets, props);
    }

    return this;
  };

  _proto2.getTweensOf = function getTweensOf(targets, onlyActive) {
    var a = [],
        parsedTargets = toArray(targets),
        child = this._first,
        isGlobalTime = _isNumber(onlyActive),
        // a number is interpreted as a global time. If the animation spans
    children;

    while (child) {
      if (child instanceof Tween) {
        if (_arrayContainsAny(child._targets, parsedTargets) && (isGlobalTime ? (!_overwritingTween || child._initted && child._ts) && child.globalTime(0) <= onlyActive && child.globalTime(child.totalDuration()) > onlyActive : !onlyActive || child.isActive())) {
          // note: if this is for overwriting, it should only be for tweens that aren't paused and are initted.
          a.push(child);
        }
      } else if ((children = child.getTweensOf(parsedTargets, onlyActive)).length) {
        a.push.apply(a, children);
      }

      child = child._next;
    }

    return a;
  } // potential future feature - targets() on timelines
  // targets() {
  // 	let result = [];
  // 	this.getChildren(true, true, false).forEach(t => result.push(...t.targets()));
  // 	return result.filter((v, i) => result.indexOf(v) === i);
  // }
  ;

  _proto2.tweenTo = function tweenTo(position, vars) {
    vars = vars || {};

    var tl = this,
        endTime = _parsePosition(tl, position),
        _vars = vars,
        startAt = _vars.startAt,
        _onStart = _vars.onStart,
        onStartParams = _vars.onStartParams,
        immediateRender = _vars.immediateRender,
        initted,
        tween = Tween.to(tl, _setDefaults({
      ease: vars.ease || "none",
      lazy: false,
      immediateRender: false,
      time: endTime,
      overwrite: "auto",
      duration: vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale()) || _tinyNum,
      onStart: function onStart() {
        tl.pause();

        if (!initted) {
          var duration = vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale());
          tween._dur !== duration && _setDuration(tween, duration, 0, 1).render(tween._time, true, true);
          initted = 1;
        }

        _onStart && _onStart.apply(tween, onStartParams || []); //in case the user had an onStart in the vars - we don't want to overwrite it.
      }
    }, vars));

    return immediateRender ? tween.render(0) : tween;
  };

  _proto2.tweenFromTo = function tweenFromTo(fromPosition, toPosition, vars) {
    return this.tweenTo(toPosition, _setDefaults({
      startAt: {
        time: _parsePosition(this, fromPosition)
      }
    }, vars));
  };

  _proto2.recent = function recent() {
    return this._recent;
  };

  _proto2.nextLabel = function nextLabel(afterTime) {
    if (afterTime === void 0) {
      afterTime = this._time;
    }

    return _getLabelInDirection(this, _parsePosition(this, afterTime));
  };

  _proto2.previousLabel = function previousLabel(beforeTime) {
    if (beforeTime === void 0) {
      beforeTime = this._time;
    }

    return _getLabelInDirection(this, _parsePosition(this, beforeTime), 1);
  };

  _proto2.currentLabel = function currentLabel(value) {
    return arguments.length ? this.seek(value, true) : this.previousLabel(this._time + _tinyNum);
  };

  _proto2.shiftChildren = function shiftChildren(amount, adjustLabels, ignoreBeforeTime) {
    if (ignoreBeforeTime === void 0) {
      ignoreBeforeTime = 0;
    }

    var child = this._first,
        labels = this.labels,
        p;
    amount = _roundPrecise(amount);

    while (child) {
      if (child._start >= ignoreBeforeTime) {
        child._start += amount;
        child._end += amount;
      }

      child = child._next;
    }

    if (adjustLabels) {
      for (p in labels) {
        if (labels[p] >= ignoreBeforeTime) {
          labels[p] += amount;
        }
      }
    }

    return _uncache(this);
  };

  _proto2.invalidate = function invalidate(soft) {
    var child = this._first;
    this._lock = 0;

    while (child) {
      child.invalidate(soft);
      child = child._next;
    }

    return _Animation.prototype.invalidate.call(this, soft);
  };

  _proto2.clear = function clear(includeLabels) {
    if (includeLabels === void 0) {
      includeLabels = true;
    }

    var child = this._first,
        next;

    while (child) {
      next = child._next;
      this.remove(child);
      child = next;
    }

    this._dp && (this._time = this._tTime = this._pTime = 0);
    includeLabels && (this.labels = {});
    return _uncache(this);
  };

  _proto2.totalDuration = function totalDuration(value) {
    var max = 0,
        self = this,
        child = self._last,
        prevStart = _bigNum$1,
        prev,
        start,
        parent;

    if (arguments.length) {
      return self.timeScale((self._repeat < 0 ? self.duration() : self.totalDuration()) / (self.reversed() ? -value : value));
    }

    if (self._dirty) {
      parent = self.parent;

      while (child) {
        prev = child._prev; //record it here in case the tween changes position in the sequence...

        child._dirty && child.totalDuration(); //could change the tween._startTime, so make sure the animation's cache is clean before analyzing it.

        start = child._start;

        if (start > prevStart && self._sort && child._ts && !self._lock) {
          //in case one of the tweens shifted out of order, it needs to be re-inserted into the correct position in the sequence
          self._lock = 1; //prevent endless recursive calls - there are methods that get triggered that check duration/totalDuration when we add().

          _addToTimeline(self, child, start - child._delay, 1)._lock = 0;
        } else {
          prevStart = start;
        }

        if (start < 0 && child._ts) {
          //children aren't allowed to have negative startTimes unless smoothChildTiming is true, so adjust here if one is found.
          max -= start;

          if (!parent && !self._dp || parent && parent.smoothChildTiming) {
            self._start += _roundPrecise(start / self._ts);
            self._time -= start;
            self._tTime -= start;
          }

          self.shiftChildren(-start, false, -Infinity);
          prevStart = 0;
        }

        child._end > max && child._ts && (max = child._end);
        child = prev;
      }

      _setDuration(self, self === _globalTimeline && self._time > max ? self._time : max, 1, 1);

      self._dirty = 0;
    }

    return self._tDur;
  };

  Timeline.updateRoot = function updateRoot(time) {
    if (_globalTimeline._ts) {
      _lazySafeRender(_globalTimeline, _parentToChildTotalTime(time, _globalTimeline));

      _lastRenderedFrame = _ticker.frame;
    }

    if (_ticker.frame >= _nextGCFrame) {
      _nextGCFrame += _config.autoSleep || 120;
      var child = _globalTimeline._first;
      if (!child || !child._ts) if (_config.autoSleep && _ticker._listeners.length < 2) {
        while (child && !child._ts) {
          child = child._next;
        }

        child || _ticker.sleep();
      }
    }
  };

  return Timeline;
}(Animation);

_setDefaults(Timeline.prototype, {
  _lock: 0,
  _hasPause: 0,
  _forcing: 0
});

var _addComplexStringPropTween = function _addComplexStringPropTween(target, prop, start, end, setter, stringFilter, funcParam) {
  //note: we call _addComplexStringPropTween.call(tweenInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.
  var pt = new PropTween(this._pt, target, prop, 0, 1, _renderComplexString, null, setter),
      index = 0,
      matchIndex = 0,
      result,
      startNums,
      color,
      endNum,
      chunk,
      startNum,
      hasRandom,
      a;
  pt.b = start;
  pt.e = end;
  start += ""; //ensure values are strings

  end += "";

  if (hasRandom = ~end.indexOf("random(")) {
    end = _replaceRandom(end);
  }

  if (stringFilter) {
    a = [start, end];
    stringFilter(a, target, prop); //pass an array with the starting and ending values and let the filter do whatever it needs to the values.

    start = a[0];
    end = a[1];
  }

  startNums = start.match(_complexStringNumExp) || [];

  while (result = _complexStringNumExp.exec(end)) {
    endNum = result[0];
    chunk = end.substring(index, result.index);

    if (color) {
      color = (color + 1) % 5;
    } else if (chunk.substr(-5) === "rgba(") {
      color = 1;
    }

    if (endNum !== startNums[matchIndex++]) {
      startNum = parseFloat(startNums[matchIndex - 1]) || 0; //these nested PropTweens are handled in a special way - we'll never actually call a render or setter method on them. We'll just loop through them in the parent complex string PropTween's render method.

      pt._pt = {
        _next: pt._pt,
        p: chunk || matchIndex === 1 ? chunk : ",",
        //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
        s: startNum,
        c: endNum.charAt(1) === "=" ? _parseRelative(startNum, endNum) - startNum : parseFloat(endNum) - startNum,
        m: color && color < 4 ? Math.round : 0
      };
      index = _complexStringNumExp.lastIndex;
    }
  }

  pt.c = index < end.length ? end.substring(index, end.length) : ""; //we use the "c" of the PropTween to store the final part of the string (after the last number)

  pt.fp = funcParam;

  if (_relExp.test(end) || hasRandom) {
    pt.e = 0; //if the end string contains relative values or dynamic random(...) values, delete the end it so that on the final render we don't actually set it to the string with += or -= characters (forces it to use the calculated value).
  }

  this._pt = pt; //start the linked list with this new PropTween. Remember, we call _addComplexStringPropTween.call(tweenInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.

  return pt;
},
    _addPropTween = function _addPropTween(target, prop, start, end, index, targets, modifier, stringFilter, funcParam, optional) {
  _isFunction(end) && (end = end(index || 0, target, targets));
  var currentValue = target[prop],
      parsedStart = start !== "get" ? start : !_isFunction(currentValue) ? currentValue : funcParam ? target[prop.indexOf("set") || !_isFunction(target["get" + prop.substr(3)]) ? prop : "get" + prop.substr(3)](funcParam) : target[prop](),
      setter = !_isFunction(currentValue) ? _setterPlain : funcParam ? _setterFuncWithParam : _setterFunc,
      pt;

  if (_isString(end)) {
    if (~end.indexOf("random(")) {
      end = _replaceRandom(end);
    }

    if (end.charAt(1) === "=") {
      pt = _parseRelative(parsedStart, end) + (getUnit(parsedStart) || 0);

      if (pt || pt === 0) {
        // to avoid isNaN, like if someone passes in a value like "!= whatever"
        end = pt;
      }
    }
  }

  if (!optional || parsedStart !== end || _forceAllPropTweens) {
    if (!isNaN(parsedStart * end) && end !== "") {
      // fun fact: any number multiplied by "" is evaluated as the number 0!
      pt = new PropTween(this._pt, target, prop, +parsedStart || 0, end - (parsedStart || 0), typeof currentValue === "boolean" ? _renderBoolean : _renderPlain, 0, setter);
      funcParam && (pt.fp = funcParam);
      modifier && pt.modifier(modifier, this, target);
      return this._pt = pt;
    }

    !currentValue && !(prop in target) && _missingPlugin(prop, end);
    return _addComplexStringPropTween.call(this, target, prop, parsedStart, end, setter, stringFilter || _config.stringFilter, funcParam);
  }
},
    //creates a copy of the vars object and processes any function-based values (putting the resulting values directly into the copy) as well as strings with "random()" in them. It does NOT process relative values.
_processVars = function _processVars(vars, index, target, targets, tween) {
  _isFunction(vars) && (vars = _parseFuncOrString(vars, tween, index, target, targets));

  if (!_isObject(vars) || vars.style && vars.nodeType || _isArray(vars) || _isTypedArray(vars)) {
    return _isString(vars) ? _parseFuncOrString(vars, tween, index, target, targets) : vars;
  }

  var copy = {},
      p;

  for (p in vars) {
    copy[p] = _parseFuncOrString(vars[p], tween, index, target, targets);
  }

  return copy;
},
    _checkPlugin = function _checkPlugin(property, vars, tween, index, target, targets) {
  var plugin, pt, ptLookup, i;

  if (_plugins[property] && (plugin = new _plugins[property]()).init(target, plugin.rawVars ? vars[property] : _processVars(vars[property], index, target, targets, tween), tween, index, targets) !== false) {
    tween._pt = pt = new PropTween(tween._pt, target, property, 0, 1, plugin.render, plugin, 0, plugin.priority);

    if (tween !== _quickTween) {
      ptLookup = tween._ptLookup[tween._targets.indexOf(target)]; //note: we can't use tween._ptLookup[index] because for staggered tweens, the index from the fullTargets array won't match what it is in each individual tween that spawns from the stagger.

      i = plugin._props.length;

      while (i--) {
        ptLookup[plugin._props[i]] = pt;
      }
    }
  }

  return plugin;
},
    _overwritingTween,
    //store a reference temporarily so we can avoid overwriting itself.
_forceAllPropTweens,
    _initTween = function _initTween(tween, time, tTime) {
  var vars = tween.vars,
      ease = vars.ease,
      startAt = vars.startAt,
      immediateRender = vars.immediateRender,
      lazy = vars.lazy,
      onUpdate = vars.onUpdate,
      runBackwards = vars.runBackwards,
      yoyoEase = vars.yoyoEase,
      keyframes = vars.keyframes,
      autoRevert = vars.autoRevert,
      dur = tween._dur,
      prevStartAt = tween._startAt,
      targets = tween._targets,
      parent = tween.parent,
      fullTargets = parent && parent.data === "nested" ? parent.vars.targets : targets,
      autoOverwrite = tween._overwrite === "auto" && !_suppressOverwrites,
      tl = tween.timeline,
      cleanVars,
      i,
      p,
      pt,
      target,
      hasPriority,
      gsData,
      harness,
      plugin,
      ptLookup,
      index,
      harnessVars,
      overwritten;
  tl && (!keyframes || !ease) && (ease = "none");
  tween._ease = _parseEase(ease, _defaults.ease);
  tween._yEase = yoyoEase ? _invertEase(_parseEase(yoyoEase === true ? ease : yoyoEase, _defaults.ease)) : 0;

  if (yoyoEase && tween._yoyo && !tween._repeat) {
    //there must have been a parent timeline with yoyo:true that is currently in its yoyo phase, so flip the eases.
    yoyoEase = tween._yEase;
    tween._yEase = tween._ease;
    tween._ease = yoyoEase;
  }

  tween._from = !tl && !!vars.runBackwards; //nested timelines should never run backwards - the backwards-ness is in the child tweens.

  if (!tl || keyframes && !vars.stagger) {
    //if there's an internal timeline, skip all the parsing because we passed that task down the chain.
    harness = targets[0] ? _getCache(targets[0]).harness : 0;
    harnessVars = harness && vars[harness.prop]; //someone may need to specify CSS-specific values AND non-CSS values, like if the element has an "x" property plus it's a standard DOM element. We allow people to distinguish by wrapping plugin-specific stuff in a css:{} object for example.

    cleanVars = _copyExcluding(vars, _reservedProps);

    if (prevStartAt) {
      prevStartAt._zTime < 0 && prevStartAt.progress(1); // in case it's a lazy startAt that hasn't rendered yet.

      time < 0 && runBackwards && immediateRender && !autoRevert ? prevStartAt.render(-1, true) : prevStartAt.revert(runBackwards && dur ? _revertConfigNoKill : _startAtRevertConfig); // if it's a "startAt" (not "from()" or runBackwards: true), we only need to do a shallow revert (keep transforms cached in CSSPlugin)
      // don't just _removeFromParent(prevStartAt.render(-1, true)) because that'll leave inline styles. We're creating a new _startAt for "startAt" tweens that re-capture things to ensure that if the pre-tween values changed since the tween was created, they're recorded.

      prevStartAt._lazy = 0;
    }

    if (startAt) {
      _removeFromParent(tween._startAt = Tween.set(targets, _setDefaults({
        data: "isStart",
        overwrite: false,
        parent: parent,
        immediateRender: true,
        lazy: !prevStartAt && _isNotFalse(lazy),
        startAt: null,
        delay: 0,
        onUpdate: onUpdate && function () {
          return _callback(tween, "onUpdate");
        },
        stagger: 0
      }, startAt))); //copy the properties/values into a new object to avoid collisions, like var to = {x:0}, from = {x:500}; timeline.fromTo(e, from, to).fromTo(e, to, from);


      tween._startAt._dp = 0; // don't allow it to get put back into root timeline! Like when revert() is called and totalTime() gets set.

      tween._startAt._sat = tween; // used in globalTime(). _sat stands for _startAtTween

      time < 0 && (_reverting$1 || !immediateRender && !autoRevert) && tween._startAt.revert(_revertConfigNoKill); // rare edge case, like if a render is forced in the negative direction of a non-initted tween.

      if (immediateRender) {
        if (dur && time <= 0 && tTime <= 0) {
          // check tTime here because in the case of a yoyo tween whose playhead gets pushed to the end like tween.progress(1), we should allow it through so that the onComplete gets fired properly.
          time && (tween._zTime = time);
          return; //we skip initialization here so that overwriting doesn't occur until the tween actually begins. Otherwise, if you create several immediateRender:true tweens of the same target/properties to drop into a Timeline, the last one created would overwrite the first ones because they didn't get placed into the timeline yet before the first render occurs and kicks in overwriting.
        }
      }
    } else if (runBackwards && dur) {
      //from() tweens must be handled uniquely: their beginning values must be rendered but we don't want overwriting to occur yet (when time is still 0). Wait until the tween actually begins before doing all the routines like overwriting. At that time, we should render at the END of the tween to ensure that things initialize correctly (remember, from() tweens go backwards)
      if (!prevStartAt) {
        time && (immediateRender = false); //in rare cases (like if a from() tween runs and then is invalidate()-ed), immediateRender could be true but the initial forced-render gets skipped, so there's no need to force the render in this context when the _time is greater than 0

        p = _setDefaults({
          overwrite: false,
          data: "isFromStart",
          //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
          lazy: immediateRender && !prevStartAt && _isNotFalse(lazy),
          immediateRender: immediateRender,
          //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
          stagger: 0,
          parent: parent //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y: gsap.utils.wrap([-100,100]), stagger: 0.5})

        }, cleanVars);
        harnessVars && (p[harness.prop] = harnessVars); // in case someone does something like .from(..., {css:{}})

        _removeFromParent(tween._startAt = Tween.set(targets, p));

        tween._startAt._dp = 0; // don't allow it to get put back into root timeline!

        tween._startAt._sat = tween; // used in globalTime()

        time < 0 && (_reverting$1 ? tween._startAt.revert(_revertConfigNoKill) : tween._startAt.render(-1, true));
        tween._zTime = time;

        if (!immediateRender) {
          _initTween(tween._startAt, _tinyNum, _tinyNum); //ensures that the initial values are recorded

        } else if (!time) {
          return;
        }
      }
    }

    tween._pt = tween._ptCache = 0;
    lazy = dur && _isNotFalse(lazy) || lazy && !dur;

    for (i = 0; i < targets.length; i++) {
      target = targets[i];
      gsData = target._gsap || _harness(targets)[i]._gsap;
      tween._ptLookup[i] = ptLookup = {};
      _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender(); //if other tweens of the same target have recently initted but haven't rendered yet, we've got to force the render so that the starting values are correct (imagine populating a timeline with a bunch of sequential tweens and then jumping to the end)

      index = fullTargets === targets ? i : fullTargets.indexOf(target);

      if (harness && (plugin = new harness()).init(target, harnessVars || cleanVars, tween, index, fullTargets) !== false) {
        tween._pt = pt = new PropTween(tween._pt, target, plugin.name, 0, 1, plugin.render, plugin, 0, plugin.priority);

        plugin._props.forEach(function (name) {
          ptLookup[name] = pt;
        });

        plugin.priority && (hasPriority = 1);
      }

      if (!harness || harnessVars) {
        for (p in cleanVars) {
          if (_plugins[p] && (plugin = _checkPlugin(p, cleanVars, tween, index, target, fullTargets))) {
            plugin.priority && (hasPriority = 1);
          } else {
            ptLookup[p] = pt = _addPropTween.call(tween, target, p, "get", cleanVars[p], index, fullTargets, 0, vars.stringFilter);
          }
        }
      }

      tween._op && tween._op[i] && tween.kill(target, tween._op[i]);

      if (autoOverwrite && tween._pt) {
        _overwritingTween = tween;

        _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(time)); // make sure the overwriting doesn't overwrite THIS tween!!!


        overwritten = !tween.parent;
        _overwritingTween = 0;
      }

      tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
    }

    hasPriority && _sortPropTweensByPriority(tween);
    tween._onInit && tween._onInit(tween); //plugins like RoundProps must wait until ALL of the PropTweens are instantiated. In the plugin's init() function, it sets the _onInit on the tween instance. May not be pretty/intuitive, but it's fast and keeps file size down.
  }

  tween._onUpdate = onUpdate;
  tween._initted = (!tween._op || tween._pt) && !overwritten; // if overwrittenProps resulted in the entire tween being killed, do NOT flag it as initted or else it may render for one tick.

  keyframes && time <= 0 && tl.render(_bigNum$1, true, true); // if there's a 0% keyframe, it'll render in the "before" state for any staggered/delayed animations thus when the following tween initializes, it'll use the "before" state instead of the "after" state as the initial values.
},
    _updatePropTweens = function _updatePropTweens(tween, property, value, start, startIsRelative, ratio, time, skipRecursion) {
  var ptCache = (tween._pt && tween._ptCache || (tween._ptCache = {}))[property],
      pt,
      rootPT,
      lookup,
      i;

  if (!ptCache) {
    ptCache = tween._ptCache[property] = [];
    lookup = tween._ptLookup;
    i = tween._targets.length;

    while (i--) {
      pt = lookup[i][property];

      if (pt && pt.d && pt.d._pt) {
        // it's a plugin, so find the nested PropTween
        pt = pt.d._pt;

        while (pt && pt.p !== property && pt.fp !== property) {
          // "fp" is functionParam for things like setting CSS variables which require .setProperty("--var-name", value)
          pt = pt._next;
        }
      }

      if (!pt) {
        // there is no PropTween associated with that property, so we must FORCE one to be created and ditch out of this
        // if the tween has other properties that already rendered at new positions, we'd normally have to rewind to put them back like tween.render(0, true) before forcing an _initTween(), but that can create another edge case like tweening a timeline's progress would trigger onUpdates to fire which could move other things around. It's better to just inform users that .resetTo() should ONLY be used for tweens that already have that property. For example, you can't gsap.to(...{ y: 0 }) and then tween.restTo("x", 200) for example.
        _forceAllPropTweens = 1; // otherwise, when we _addPropTween() and it finds no change between the start and end values, it skips creating a PropTween (for efficiency...why tween when there's no difference?) but in this case we NEED that PropTween created so we can edit it.

        tween.vars[property] = "+=0";

        _initTween(tween, time);

        _forceAllPropTweens = 0;
        return skipRecursion ? _warn(property + " not eligible for reset") : 1; // if someone tries to do a quickTo() on a special property like borderRadius which must get split into 4 different properties, that's not eligible for .resetTo().
      }

      ptCache.push(pt);
    }
  }

  i = ptCache.length;

  while (i--) {
    rootPT = ptCache[i];
    pt = rootPT._pt || rootPT; // complex values may have nested PropTweens. We only accommodate the FIRST value.

    pt.s = (start || start === 0) && !startIsRelative ? start : pt.s + (start || 0) + ratio * pt.c;
    pt.c = value - pt.s;
    rootPT.e && (rootPT.e = _round(value) + getUnit(rootPT.e)); // mainly for CSSPlugin (end value)

    rootPT.b && (rootPT.b = pt.s + getUnit(rootPT.b)); // (beginning value)
  }
},
    _addAliasesToVars = function _addAliasesToVars(targets, vars) {
  var harness = targets[0] ? _getCache(targets[0]).harness : 0,
      propertyAliases = harness && harness.aliases,
      copy,
      p,
      i,
      aliases;

  if (!propertyAliases) {
    return vars;
  }

  copy = _merge({}, vars);

  for (p in propertyAliases) {
    if (p in copy) {
      aliases = propertyAliases[p].split(",");
      i = aliases.length;

      while (i--) {
        copy[aliases[i]] = copy[p];
      }
    }
  }

  return copy;
},
    // parses multiple formats, like {"0%": {x: 100}, {"50%": {x: -20}} and { x: {"0%": 100, "50%": -20} }, and an "ease" can be set on any object. We populate an "allProps" object with an Array for each property, like {x: [{}, {}], y:[{}, {}]} with data for each property tween. The objects have a "t" (time), "v", (value), and "e" (ease) property. This allows us to piece together a timeline later.
_parseKeyframe = function _parseKeyframe(prop, obj, allProps, easeEach) {
  var ease = obj.ease || easeEach || "power1.inOut",
      p,
      a;

  if (_isArray(obj)) {
    a = allProps[prop] || (allProps[prop] = []); // t = time (out of 100), v = value, e = ease

    obj.forEach(function (value, i) {
      return a.push({
        t: i / (obj.length - 1) * 100,
        v: value,
        e: ease
      });
    });
  } else {
    for (p in obj) {
      a = allProps[p] || (allProps[p] = []);
      p === "ease" || a.push({
        t: parseFloat(prop),
        v: obj[p],
        e: ease
      });
    }
  }
},
    _parseFuncOrString = function _parseFuncOrString(value, tween, i, target, targets) {
  return _isFunction(value) ? value.call(tween, i, target, targets) : _isString(value) && ~value.indexOf("random(") ? _replaceRandom(value) : value;
},
    _staggerTweenProps = _callbackNames + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert",
    _staggerPropsToSkip = {};

_forEachName(_staggerTweenProps + ",id,stagger,delay,duration,paused,scrollTrigger", function (name) {
  return _staggerPropsToSkip[name] = 1;
});
/*
 * --------------------------------------------------------------------------------------
 * TWEEN
 * --------------------------------------------------------------------------------------
 */


var Tween = /*#__PURE__*/function (_Animation2) {
  _inheritsLoose(Tween, _Animation2);

  function Tween(targets, vars, position, skipInherit) {
    var _this3;

    if (typeof vars === "number") {
      position.duration = vars;
      vars = position;
      position = null;
    }

    _this3 = _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars)) || this;
    var _this3$vars = _this3.vars,
        duration = _this3$vars.duration,
        delay = _this3$vars.delay,
        immediateRender = _this3$vars.immediateRender,
        stagger = _this3$vars.stagger,
        overwrite = _this3$vars.overwrite,
        keyframes = _this3$vars.keyframes,
        defaults = _this3$vars.defaults,
        scrollTrigger = _this3$vars.scrollTrigger,
        yoyoEase = _this3$vars.yoyoEase,
        parent = vars.parent || _globalTimeline,
        parsedTargets = (_isArray(targets) || _isTypedArray(targets) ? _isNumber(targets[0]) : "length" in vars) ? [targets] : toArray(targets),
        tl,
        i,
        copy,
        l,
        p,
        curTarget,
        staggerFunc,
        staggerVarsToMerge;
    _this3._targets = parsedTargets.length ? _harness(parsedTargets) : _warn("GSAP target " + targets + " not found. https://gsap.com", !_config.nullTargetWarn) || [];
    _this3._ptLookup = []; //PropTween lookup. An array containing an object for each target, having keys for each tweening property

    _this3._overwrite = overwrite;

    if (keyframes || stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
      vars = _this3.vars;
      tl = _this3.timeline = new Timeline({
        data: "nested",
        defaults: defaults || {},
        targets: parent && parent.data === "nested" ? parent.vars.targets : parsedTargets
      }); // we need to store the targets because for staggers and keyframes, we end up creating an individual tween for each but function-based values need to know the index and the whole Array of targets.

      tl.kill();
      tl.parent = tl._dp = _assertThisInitialized(_this3);
      tl._start = 0;

      if (stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
        l = parsedTargets.length;
        staggerFunc = stagger && distribute(stagger);

        if (_isObject(stagger)) {
          //users can pass in callbacks like onStart/onComplete in the stagger object. These should fire with each individual tween.
          for (p in stagger) {
            if (~_staggerTweenProps.indexOf(p)) {
              staggerVarsToMerge || (staggerVarsToMerge = {});
              staggerVarsToMerge[p] = stagger[p];
            }
          }
        }

        for (i = 0; i < l; i++) {
          copy = _copyExcluding(vars, _staggerPropsToSkip);
          copy.stagger = 0;
          yoyoEase && (copy.yoyoEase = yoyoEase);
          staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
          curTarget = parsedTargets[i]; //don't just copy duration or delay because if they're a string or function, we'd end up in an infinite loop because _isFuncOrString() would evaluate as true in the child tweens, entering this loop, etc. So we parse the value straight from vars and default to 0.

          copy.duration = +_parseFuncOrString(duration, _assertThisInitialized(_this3), i, curTarget, parsedTargets);
          copy.delay = (+_parseFuncOrString(delay, _assertThisInitialized(_this3), i, curTarget, parsedTargets) || 0) - _this3._delay;

          if (!stagger && l === 1 && copy.delay) {
            // if someone does delay:"random(1, 5)", repeat:-1, for example, the delay shouldn't be inside the repeat.
            _this3._delay = delay = copy.delay;
            _this3._start += delay;
            copy.delay = 0;
          }

          tl.to(curTarget, copy, staggerFunc ? staggerFunc(i, curTarget, parsedTargets) : 0);
          tl._ease = _easeMap.none;
        }

        tl.duration() ? duration = delay = 0 : _this3.timeline = 0; // if the timeline's duration is 0, we don't need a timeline internally!
      } else if (keyframes) {
        _inheritDefaults(_setDefaults(tl.vars.defaults, {
          ease: "none"
        }));

        tl._ease = _parseEase(keyframes.ease || vars.ease || "none");
        var time = 0,
            a,
            kf,
            v;

        if (_isArray(keyframes)) {
          keyframes.forEach(function (frame) {
            return tl.to(parsedTargets, frame, ">");
          });
          tl.duration(); // to ensure tl._dur is cached because we tap into it for performance purposes in the render() method.
        } else {
          copy = {};

          for (p in keyframes) {
            p === "ease" || p === "easeEach" || _parseKeyframe(p, keyframes[p], copy, keyframes.easeEach);
          }

          for (p in copy) {
            a = copy[p].sort(function (a, b) {
              return a.t - b.t;
            });
            time = 0;

            for (i = 0; i < a.length; i++) {
              kf = a[i];
              v = {
                ease: kf.e,
                duration: (kf.t - (i ? a[i - 1].t : 0)) / 100 * duration
              };
              v[p] = kf.v;
              tl.to(parsedTargets, v, time);
              time += v.duration;
            }
          }

          tl.duration() < duration && tl.to({}, {
            duration: duration - tl.duration()
          }); // in case keyframes didn't go to 100%
        }
      }

      duration || _this3.duration(duration = tl.duration());
    } else {
      _this3.timeline = 0; //speed optimization, faster lookups (no going up the prototype chain)
    }

    if (overwrite === true && !_suppressOverwrites) {
      _overwritingTween = _assertThisInitialized(_this3);

      _globalTimeline.killTweensOf(parsedTargets);

      _overwritingTween = 0;
    }

    _addToTimeline(parent, _assertThisInitialized(_this3), position);

    vars.reversed && _this3.reverse();
    vars.paused && _this3.paused(true);

    if (immediateRender || !duration && !keyframes && _this3._start === _roundPrecise(parent._time) && _isNotFalse(immediateRender) && _hasNoPausedAncestors(_assertThisInitialized(_this3)) && parent.data !== "nested") {
      _this3._tTime = -_tinyNum; //forces a render without having to set the render() "force" parameter to true because we want to allow lazying by default (using the "force" parameter always forces an immediate full render)

      _this3.render(Math.max(0, -delay) || 0); //in case delay is negative

    }

    scrollTrigger && _scrollTrigger(_assertThisInitialized(_this3), scrollTrigger);
    return _this3;
  }

  var _proto3 = Tween.prototype;

  _proto3.render = function render(totalTime, suppressEvents, force) {
    var prevTime = this._time,
        tDur = this._tDur,
        dur = this._dur,
        isNegative = totalTime < 0,
        tTime = totalTime > tDur - _tinyNum && !isNegative ? tDur : totalTime < _tinyNum ? 0 : totalTime,
        time,
        pt,
        iteration,
        cycleDuration,
        prevIteration,
        isYoyo,
        ratio,
        timeline,
        yoyoEase;

    if (!dur) {
      _renderZeroDurationTween(this, totalTime, suppressEvents, force);
    } else if (tTime !== this._tTime || !totalTime || force || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== isNegative || this._lazy) {
      // this senses if we're crossing over the start time, in which case we must record _zTime and force the render, but we do it in this lengthy conditional way for performance reasons (usually we can skip the calculations): this._initted && (this._zTime < 0) !== (totalTime < 0)
      time = tTime;
      timeline = this.timeline;

      if (this._repeat) {
        //adjust the time for repeats and yoyos
        cycleDuration = dur + this._rDelay;

        if (this._repeat < -1 && isNegative) {
          return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
        }

        time = _roundPrecise(tTime % cycleDuration); //round to avoid floating point errors. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)

        if (tTime === tDur) {
          // the tDur === tTime is for edge cases where there's a lengthy decimal on the duration and it may reach the very end but the time is rendered as not-quite-there (remember, tDur is rounded to 4 decimals whereas dur isn't)
          iteration = this._repeat;
          time = dur;
        } else {
          prevIteration = _roundPrecise(tTime / cycleDuration); // full decimal version of iterations, not the previous iteration (we're reusing prevIteration variable for efficiency)

          iteration = ~~prevIteration;

          if (iteration && iteration === prevIteration) {
            time = dur;
            iteration--;
          } else if (time > dur) {
            time = dur;
          }
        }

        isYoyo = this._yoyo && iteration & 1;

        if (isYoyo) {
          yoyoEase = this._yEase;
          time = dur - time;
        }

        prevIteration = _animationCycle(this._tTime, cycleDuration);

        if (time === prevTime && !force && this._initted && iteration === prevIteration) {
          //could be during the repeatDelay part. No need to render and fire callbacks.
          this._tTime = tTime;
          return this;
        }

        if (iteration !== prevIteration) {
          timeline && this._yEase && _propagateYoyoEase(timeline, isYoyo); //repeatRefresh functionality

          if (this.vars.repeatRefresh && !isYoyo && !this._lock && time !== cycleDuration && this._initted) {
            // this._time will === cycleDuration when we render at EXACTLY the end of an iteration. Without this condition, it'd often do the repeatRefresh render TWICE (again on the very next tick).
            this._lock = force = 1; //force, otherwise if lazy is true, the _attemptInitTween() will return and we'll jump out and get caught bouncing on each tick.

            this.render(_roundPrecise(cycleDuration * iteration), true).invalidate()._lock = 0;
          }
        }
      }

      if (!this._initted) {
        if (_attemptInitTween(this, isNegative ? totalTime : time, force, suppressEvents, tTime)) {
          this._tTime = 0; // in constructor if immediateRender is true, we set _tTime to -_tinyNum to have the playhead cross the starting point but we can't leave _tTime as a negative number.

          return this;
        }

        if (prevTime !== this._time && !(force && this.vars.repeatRefresh && iteration !== prevIteration)) {
          // rare edge case - during initialization, an onUpdate in the _startAt (.fromTo()) might force this tween to render at a different spot in which case we should ditch this render() call so that it doesn't revert the values. But we also don't want to dump if we're doing a repeatRefresh render!
          return this;
        }

        if (dur !== this._dur) {
          // while initting, a plugin like InertiaPlugin might alter the duration, so rerun from the start to ensure everything renders as it should.
          return this.render(totalTime, suppressEvents, force);
        }
      }

      this._tTime = tTime;
      this._time = time;

      if (!this._act && this._ts) {
        this._act = 1; //as long as it's not paused, force it to be active so that if the user renders independent of the parent timeline, it'll be forced to re-render on the next tick.

        this._lazy = 0;
      }

      this.ratio = ratio = (yoyoEase || this._ease)(time / dur);

      if (this._from) {
        this.ratio = ratio = 1 - ratio;
      }

      if (!prevTime && tTime && !suppressEvents && !prevIteration) {
        _callback(this, "onStart");

        if (this._tTime !== tTime) {
          // in case the onStart triggered a render at a different spot, eject. Like if someone did animation.pause(0.5) or something inside the onStart.
          return this;
        }
      }

      pt = this._pt;

      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }

      timeline && timeline.render(totalTime < 0 ? totalTime : timeline._dur * timeline._ease(time / this._dur), suppressEvents, force) || this._startAt && (this._zTime = totalTime);

      if (this._onUpdate && !suppressEvents) {
        isNegative && _rewindStartAt(this, totalTime, suppressEvents, force); //note: for performance reasons, we tuck this conditional logic inside less traveled areas (most tweens don't have an onUpdate). We'd just have it at the end before the onComplete, but the values should be updated before any onUpdate is called, so we ALSO put it here and then if it's not called, we do so later near the onComplete.

        _callback(this, "onUpdate");
      }

      this._repeat && iteration !== prevIteration && this.vars.onRepeat && !suppressEvents && this.parent && _callback(this, "onRepeat");

      if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
        isNegative && !this._onUpdate && _rewindStartAt(this, totalTime, true, true);
        (totalTime || !dur) && (tTime === this._tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1); // don't remove if we're rendering at exactly a time of 0, as there could be autoRevert values that should get set on the next tick (if the playhead goes backward beyond the startTime, negative totalTime). Don't remove if the timeline is reversed and the playhead isn't at 0, otherwise tl.progress(1).reverse() won't work. Only remove if the playhead is at the end and timeScale is positive, or if the playhead is at 0 and the timeScale is negative.

        if (!suppressEvents && !(isNegative && !prevTime) && (tTime || prevTime || isYoyo)) {
          // if prevTime and tTime are zero, we shouldn't fire the onReverseComplete. This could happen if you gsap.to(... {paused:true}).play();
          _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);

          this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
        }
      }
    }

    return this;
  };

  _proto3.targets = function targets() {
    return this._targets;
  };

  _proto3.invalidate = function invalidate(soft) {
    // "soft" gives us a way to clear out everything EXCEPT the recorded pre-"from" portion of from() tweens. Otherwise, for example, if you tween.progress(1).render(0, true true).invalidate(), the "from" values would persist and then on the next render, the from() tweens would initialize and the current value would match the "from" values, thus animate from the same value to the same value (no animation). We tap into this in ScrollTrigger's refresh() where we must push a tween to completion and then back again but honor its init state in case the tween is dependent on another tween further up on the page.
    (!soft || !this.vars.runBackwards) && (this._startAt = 0);
    this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0;
    this._ptLookup = [];
    this.timeline && this.timeline.invalidate(soft);
    return _Animation2.prototype.invalidate.call(this, soft);
  };

  _proto3.resetTo = function resetTo(property, value, start, startIsRelative, skipRecursion) {
    _tickerActive || _ticker.wake();
    this._ts || this.play();
    var time = Math.min(this._dur, (this._dp._time - this._start) * this._ts),
        ratio;
    this._initted || _initTween(this, time);
    ratio = this._ease(time / this._dur); // don't just get tween.ratio because it may not have rendered yet.
    // possible future addition to allow an object with multiple values to update, like tween.resetTo({x: 100, y: 200}); At this point, it doesn't seem worth the added kb given the fact that most users will likely opt for the convenient gsap.quickTo() way of interacting with this method.
    // if (_isObject(property)) { // performance optimization
    // 	for (p in property) {
    // 		if (_updatePropTweens(this, p, property[p], value ? value[p] : null, start, ratio, time)) {
    // 			return this.resetTo(property, value, start, startIsRelative); // if a PropTween wasn't found for the property, it'll get forced with a re-initialization so we need to jump out and start over again.
    // 		}
    // 	}
    // } else {

    if (_updatePropTweens(this, property, value, start, startIsRelative, ratio, time, skipRecursion)) {
      return this.resetTo(property, value, start, startIsRelative, 1); // if a PropTween wasn't found for the property, it'll get forced with a re-initialization so we need to jump out and start over again.
    } //}


    _alignPlayhead(this, 0);

    this.parent || _addLinkedListItem(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0);
    return this.render(0);
  };

  _proto3.kill = function kill(targets, vars) {
    if (vars === void 0) {
      vars = "all";
    }

    if (!targets && (!vars || vars === "all")) {
      this._lazy = this._pt = 0;
      this.parent ? _interrupt(this) : this.scrollTrigger && this.scrollTrigger.kill(!!_reverting$1);
      return this;
    }

    if (this.timeline) {
      var tDur = this.timeline.totalDuration();
      this.timeline.killTweensOf(targets, vars, _overwritingTween && _overwritingTween.vars.overwrite !== true)._first || _interrupt(this); // if nothing is left tweening, interrupt.

      this.parent && tDur !== this.timeline.totalDuration() && _setDuration(this, this._dur * this.timeline._tDur / tDur, 0, 1); // if a nested tween is killed that changes the duration, it should affect this tween's duration. We must use the ratio, though, because sometimes the internal timeline is stretched like for keyframes where they don't all add up to whatever the parent tween's duration was set to.

      return this;
    }

    var parsedTargets = this._targets,
        killingTargets = targets ? toArray(targets) : parsedTargets,
        propTweenLookup = this._ptLookup,
        firstPT = this._pt,
        overwrittenProps,
        curLookup,
        curOverwriteProps,
        props,
        p,
        pt,
        i;

    if ((!vars || vars === "all") && _arraysMatch(parsedTargets, killingTargets)) {
      vars === "all" && (this._pt = 0);
      return _interrupt(this);
    }

    overwrittenProps = this._op = this._op || [];

    if (vars !== "all") {
      //so people can pass in a comma-delimited list of property names
      if (_isString(vars)) {
        p = {};

        _forEachName(vars, function (name) {
          return p[name] = 1;
        });

        vars = p;
      }

      vars = _addAliasesToVars(parsedTargets, vars);
    }

    i = parsedTargets.length;

    while (i--) {
      if (~killingTargets.indexOf(parsedTargets[i])) {
        curLookup = propTweenLookup[i];

        if (vars === "all") {
          overwrittenProps[i] = vars;
          props = curLookup;
          curOverwriteProps = {};
        } else {
          curOverwriteProps = overwrittenProps[i] = overwrittenProps[i] || {};
          props = vars;
        }

        for (p in props) {
          pt = curLookup && curLookup[p];

          if (pt) {
            if (!("kill" in pt.d) || pt.d.kill(p) === true) {
              _removeLinkedListItem(this, pt, "_pt");
            }

            delete curLookup[p];
          }

          if (curOverwriteProps !== "all") {
            curOverwriteProps[p] = 1;
          }
        }
      }
    }

    this._initted && !this._pt && firstPT && _interrupt(this); //if all tweening properties are killed, kill the tween. Without this line, if there's a tween with multiple targets and then you killTweensOf() each target individually, the tween would technically still remain active and fire its onComplete even though there aren't any more properties tweening.

    return this;
  };

  Tween.to = function to(targets, vars) {
    return new Tween(targets, vars, arguments[2]);
  };

  Tween.from = function from(targets, vars) {
    return _createTweenType(1, arguments);
  };

  Tween.delayedCall = function delayedCall(delay, callback, params, scope) {
    return new Tween(callback, 0, {
      immediateRender: false,
      lazy: false,
      overwrite: false,
      delay: delay,
      onComplete: callback,
      onReverseComplete: callback,
      onCompleteParams: params,
      onReverseCompleteParams: params,
      callbackScope: scope
    }); // we must use onReverseComplete too for things like timeline.add(() => {...}) which should be triggered in BOTH directions (forward and reverse)
  };

  Tween.fromTo = function fromTo(targets, fromVars, toVars) {
    return _createTweenType(2, arguments);
  };

  Tween.set = function set(targets, vars) {
    vars.duration = 0;
    vars.repeatDelay || (vars.repeat = 0);
    return new Tween(targets, vars);
  };

  Tween.killTweensOf = function killTweensOf(targets, props, onlyActive) {
    return _globalTimeline.killTweensOf(targets, props, onlyActive);
  };

  return Tween;
}(Animation);

_setDefaults(Tween.prototype, {
  _targets: [],
  _lazy: 0,
  _startAt: 0,
  _op: 0,
  _onInit: 0
}); //add the pertinent timeline methods to Tween instances so that users can chain conveniently and create a timeline automatically. (removed due to concerns that it'd ultimately add to more confusion especially for beginners)
// _forEachName("to,from,fromTo,set,call,add,addLabel,addPause", name => {
// 	Tween.prototype[name] = function() {
// 		let tl = new Timeline();
// 		return _addToTimeline(tl, this)[name].apply(tl, toArray(arguments));
// 	}
// });
//for backward compatibility. Leverage the timeline calls.


_forEachName("staggerTo,staggerFrom,staggerFromTo", function (name) {
  Tween[name] = function () {
    var tl = new Timeline(),
        params = _slice.call(arguments, 0);

    params.splice(name === "staggerFromTo" ? 5 : 4, 0, 0);
    return tl[name].apply(tl, params);
  };
});
/*
 * --------------------------------------------------------------------------------------
 * PROPTWEEN
 * --------------------------------------------------------------------------------------
 */


var _setterPlain = function _setterPlain(target, property, value) {
  return target[property] = value;
},
    _setterFunc = function _setterFunc(target, property, value) {
  return target[property](value);
},
    _setterFuncWithParam = function _setterFuncWithParam(target, property, value, data) {
  return target[property](data.fp, value);
},
    _setterAttribute = function _setterAttribute(target, property, value) {
  return target.setAttribute(property, value);
},
    _getSetter = function _getSetter(target, property) {
  return _isFunction(target[property]) ? _setterFunc : _isUndefined(target[property]) && target.setAttribute ? _setterAttribute : _setterPlain;
},
    _renderPlain = function _renderPlain(ratio, data) {
  return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1000000) / 1000000, data);
},
    _renderBoolean = function _renderBoolean(ratio, data) {
  return data.set(data.t, data.p, !!(data.s + data.c * ratio), data);
},
    _renderComplexString = function _renderComplexString(ratio, data) {
  var pt = data._pt,
      s = "";

  if (!ratio && data.b) {
    //b = beginning string
    s = data.b;
  } else if (ratio === 1 && data.e) {
    //e = ending string
    s = data.e;
  } else {
    while (pt) {
      s = pt.p + (pt.m ? pt.m(pt.s + pt.c * ratio) : Math.round((pt.s + pt.c * ratio) * 10000) / 10000) + s; //we use the "p" property for the text inbetween (like a suffix). And in the context of a complex string, the modifier (m) is typically just Math.round(), like for RGB colors.

      pt = pt._next;
    }

    s += data.c; //we use the "c" of the PropTween to store the final chunk of non-numeric text.
  }

  data.set(data.t, data.p, s, data);
},
    _renderPropTweens = function _renderPropTweens(ratio, data) {
  var pt = data._pt;

  while (pt) {
    pt.r(ratio, pt.d);
    pt = pt._next;
  }
},
    _addPluginModifier = function _addPluginModifier(modifier, tween, target, property) {
  var pt = this._pt,
      next;

  while (pt) {
    next = pt._next;
    pt.p === property && pt.modifier(modifier, tween, target);
    pt = next;
  }
},
    _killPropTweensOf = function _killPropTweensOf(property) {
  var pt = this._pt,
      hasNonDependentRemaining,
      next;

  while (pt) {
    next = pt._next;

    if (pt.p === property && !pt.op || pt.op === property) {
      _removeLinkedListItem(this, pt, "_pt");
    } else if (!pt.dep) {
      hasNonDependentRemaining = 1;
    }

    pt = next;
  }

  return !hasNonDependentRemaining;
},
    _setterWithModifier = function _setterWithModifier(target, property, value, data) {
  data.mSet(target, property, data.m.call(data.tween, value, data.mt), data);
},
    _sortPropTweensByPriority = function _sortPropTweensByPriority(parent) {
  var pt = parent._pt,
      next,
      pt2,
      first,
      last; //sorts the PropTween linked list in order of priority because some plugins need to do their work after ALL of the PropTweens were created (like RoundPropsPlugin and ModifiersPlugin)

  while (pt) {
    next = pt._next;
    pt2 = first;

    while (pt2 && pt2.pr > pt.pr) {
      pt2 = pt2._next;
    }

    if (pt._prev = pt2 ? pt2._prev : last) {
      pt._prev._next = pt;
    } else {
      first = pt;
    }

    if (pt._next = pt2) {
      pt2._prev = pt;
    } else {
      last = pt;
    }

    pt = next;
  }

  parent._pt = first;
}; //PropTween key: t = target, p = prop, r = renderer, d = data, s = start, c = change, op = overwriteProperty (ONLY populated when it's different than p), pr = priority, _next/_prev for the linked list siblings, set = setter, m = modifier, mSet = modifierSetter (the original setter, before a modifier was added)


var PropTween = /*#__PURE__*/function () {
  function PropTween(next, target, prop, start, change, renderer, data, setter, priority) {
    this.t = target;
    this.s = start;
    this.c = change;
    this.p = prop;
    this.r = renderer || _renderPlain;
    this.d = data || this;
    this.set = setter || _setterPlain;
    this.pr = priority || 0;
    this._next = next;

    if (next) {
      next._prev = this;
    }
  }

  var _proto4 = PropTween.prototype;

  _proto4.modifier = function modifier(func, tween, target) {
    this.mSet = this.mSet || this.set; //in case it was already set (a PropTween can only have one modifier)

    this.set = _setterWithModifier;
    this.m = func;
    this.mt = target; //modifier target

    this.tween = tween;
  };

  return PropTween;
}(); //Initialization tasks

_forEachName(_callbackNames + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function (name) {
  return _reservedProps[name] = 1;
});

_globals.TweenMax = _globals.TweenLite = Tween;
_globals.TimelineLite = _globals.TimelineMax = Timeline;
_globalTimeline = new Timeline({
  sortChildren: false,
  defaults: _defaults,
  autoRemoveChildren: true,
  id: "root",
  smoothChildTiming: true
});
_config.stringFilter = _colorStringFilter;

var _media = [],
    _listeners = {},
    _emptyArray = [],
    _lastMediaTime = 0,
    _contextID = 0,
    _dispatch = function _dispatch(type) {
  return (_listeners[type] || _emptyArray).map(function (f) {
    return f();
  });
},
    _onMediaChange = function _onMediaChange() {
  var time = Date.now(),
      matches = [];

  if (time - _lastMediaTime > 2) {
    _dispatch("matchMediaInit");

    _media.forEach(function (c) {
      var queries = c.queries,
          conditions = c.conditions,
          match,
          p,
          anyMatch,
          toggled;

      for (p in queries) {
        match = _win$1.matchMedia(queries[p]).matches; // Firefox doesn't update the "matches" property of the MediaQueryList object correctly - it only does so as it calls its change handler - so we must re-create a media query here to ensure it's accurate.

        match && (anyMatch = 1);

        if (match !== conditions[p]) {
          conditions[p] = match;
          toggled = 1;
        }
      }

      if (toggled) {
        c.revert();
        anyMatch && matches.push(c);
      }
    });

    _dispatch("matchMediaRevert");

    matches.forEach(function (c) {
      return c.onMatch(c, function (func) {
        return c.add(null, func);
      });
    });
    _lastMediaTime = time;

    _dispatch("matchMedia");
  }
};

var Context = /*#__PURE__*/function () {
  function Context(func, scope) {
    this.selector = scope && selector(scope);
    this.data = [];
    this._r = []; // returned/cleanup functions

    this.isReverted = false;
    this.id = _contextID++; // to work around issues that frameworks like Vue cause by making things into Proxies which make it impossible to do something like _media.indexOf(this) because "this" would no longer refer to the Context instance itself - it'd refer to a Proxy! We needed a way to identify the context uniquely

    func && this.add(func);
  }

  var _proto5 = Context.prototype;

  _proto5.add = function add(name, func, scope) {
    // possible future addition if we need the ability to add() an animation to a context and for whatever reason cannot create that animation inside of a context.add(() => {...}) function.
    // if (name && _isFunction(name.revert)) {
    // 	this.data.push(name);
    // 	return (name._ctx = this);
    // }
    if (_isFunction(name)) {
      scope = func;
      func = name;
      name = _isFunction;
    }

    var self = this,
        f = function f() {
      var prev = _context,
          prevSelector = self.selector,
          result;
      prev && prev !== self && prev.data.push(self);
      scope && (self.selector = selector(scope));
      _context = self;
      result = func.apply(self, arguments);
      _isFunction(result) && self._r.push(result);
      _context = prev;
      self.selector = prevSelector;
      self.isReverted = false;
      return result;
    };

    self.last = f;
    return name === _isFunction ? f(self, function (func) {
      return self.add(null, func);
    }) : name ? self[name] = f : f;
  };

  _proto5.ignore = function ignore(func) {
    var prev = _context;
    _context = null;
    func(this);
    _context = prev;
  };

  _proto5.getTweens = function getTweens() {
    var a = [];
    this.data.forEach(function (e) {
      return e instanceof Context ? a.push.apply(a, e.getTweens()) : e instanceof Tween && !(e.parent && e.parent.data === "nested") && a.push(e);
    });
    return a;
  };

  _proto5.clear = function clear() {
    this._r.length = this.data.length = 0;
  };

  _proto5.kill = function kill(revert, matchMedia) {
    var _this4 = this;

    if (revert) {
      (function () {
        var tweens = _this4.getTweens(),
            i = _this4.data.length,
            t;

        while (i--) {
          // Flip plugin tweens are very different in that they should actually be pushed to their end. The plugin replaces the timeline's .revert() method to do exactly that. But we also need to remove any of those nested tweens inside the flip timeline so that they don't get individually reverted.
          t = _this4.data[i];

          if (t.data === "isFlip") {
            t.revert();
            t.getChildren(true, true, false).forEach(function (tween) {
              return tweens.splice(tweens.indexOf(tween), 1);
            });
          }
        } // save as an object so that we can cache the globalTime for each tween to optimize performance during the sort


        tweens.map(function (t) {
          return {
            g: t._dur || t._delay || t._sat && !t._sat.vars.immediateRender ? t.globalTime(0) : -Infinity,
            t: t
          };
        }).sort(function (a, b) {
          return b.g - a.g || -Infinity;
        }).forEach(function (o) {
          return o.t.revert(revert);
        }); // note: all of the _startAt tweens should be reverted in reverse order that they were created, and they'll all have the same globalTime (-1) so the " || -1" in the sort keeps the order properly.

        i = _this4.data.length;

        while (i--) {
          // make sure we loop backwards so that, for example, SplitTexts that were created later on the same element get reverted first
          t = _this4.data[i];

          if (t instanceof Timeline) {
            if (t.data !== "nested") {
              t.scrollTrigger && t.scrollTrigger.revert();
              t.kill(); // don't revert() the timeline because that's duplicating efforts since we already reverted all the tweens
            }
          } else {
            !(t instanceof Tween) && t.revert && t.revert(revert);
          }
        }

        _this4._r.forEach(function (f) {
          return f(revert, _this4);
        });

        _this4.isReverted = true;
      })();
    } else {
      this.data.forEach(function (e) {
        return e.kill && e.kill();
      });
    }

    this.clear();

    if (matchMedia) {
      var i = _media.length;

      while (i--) {
        // previously, we checked _media.indexOf(this), but some frameworks like Vue enforce Proxy objects that make it impossible to get the proper result that way, so we must use a unique ID number instead.
        _media[i].id === this.id && _media.splice(i, 1);
      }
    }
  } // killWithCleanup() {
  // 	this.kill();
  // 	this._r.forEach(f => f(false, this));
  // }
  ;

  _proto5.revert = function revert(config) {
    this.kill(config || {});
  };

  return Context;
}();

var MatchMedia = /*#__PURE__*/function () {
  function MatchMedia(scope) {
    this.contexts = [];
    this.scope = scope;
    _context && _context.data.push(this);
  }

  var _proto6 = MatchMedia.prototype;

  _proto6.add = function add(conditions, func, scope) {
    _isObject(conditions) || (conditions = {
      matches: conditions
    });
    var context = new Context(0, scope || this.scope),
        cond = context.conditions = {},
        mq,
        p,
        active;
    _context && !context.selector && (context.selector = _context.selector); // in case a context is created inside a context. Like a gsap.matchMedia() that's inside a scoped gsap.context()

    this.contexts.push(context);
    func = context.add("onMatch", func);
    context.queries = conditions;

    for (p in conditions) {
      if (p === "all") {
        active = 1;
      } else {
        mq = _win$1.matchMedia(conditions[p]);

        if (mq) {
          _media.indexOf(context) < 0 && _media.push(context);
          (cond[p] = mq.matches) && (active = 1);
          mq.addListener ? mq.addListener(_onMediaChange) : mq.addEventListener("change", _onMediaChange);
        }
      }
    }

    active && func(context, function (f) {
      return context.add(null, f);
    });
    return this;
  } // refresh() {
  // 	let time = _lastMediaTime,
  // 		media = _media;
  // 	_lastMediaTime = -1;
  // 	_media = this.contexts;
  // 	_onMediaChange();
  // 	_lastMediaTime = time;
  // 	_media = media;
  // }
  ;

  _proto6.revert = function revert(config) {
    this.kill(config || {});
  };

  _proto6.kill = function kill(revert) {
    this.contexts.forEach(function (c) {
      return c.kill(revert, true);
    });
  };

  return MatchMedia;
}();
/*
 * --------------------------------------------------------------------------------------
 * GSAP
 * --------------------------------------------------------------------------------------
 */


var _gsap$1 = {
  registerPlugin: function registerPlugin() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    args.forEach(function (config) {
      return _createPlugin(config);
    });
  },
  timeline: function timeline(vars) {
    return new Timeline(vars);
  },
  getTweensOf: function getTweensOf(targets, onlyActive) {
    return _globalTimeline.getTweensOf(targets, onlyActive);
  },
  getProperty: function getProperty(target, property, unit, uncache) {
    _isString(target) && (target = toArray(target)[0]); //in case selector text or an array is passed in

    var getter = _getCache(target || {}).get,
        format = unit ? _passThrough : _numericIfPossible;

    unit === "native" && (unit = "");
    return !target ? target : !property ? function (property, unit, uncache) {
      return format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
    } : format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
  },
  quickSetter: function quickSetter(target, property, unit) {
    target = toArray(target);

    if (target.length > 1) {
      var setters = target.map(function (t) {
        return gsap.quickSetter(t, property, unit);
      }),
          l = setters.length;
      return function (value) {
        var i = l;

        while (i--) {
          setters[i](value);
        }
      };
    }

    target = target[0] || {};

    var Plugin = _plugins[property],
        cache = _getCache(target),
        p = cache.harness && (cache.harness.aliases || {})[property] || property,
        // in case it's an alias, like "rotate" for "rotation".
    setter = Plugin ? function (value) {
      var p = new Plugin();
      _quickTween._pt = 0;
      p.init(target, unit ? value + unit : value, _quickTween, 0, [target]);
      p.render(1, p);
      _quickTween._pt && _renderPropTweens(1, _quickTween);
    } : cache.set(target, p);

    return Plugin ? setter : function (value) {
      return setter(target, p, unit ? value + unit : value, cache, 1);
    };
  },
  quickTo: function quickTo(target, property, vars) {
    var _setDefaults2;

    var tween = gsap.to(target, _setDefaults((_setDefaults2 = {}, _setDefaults2[property] = "+=0.1", _setDefaults2.paused = true, _setDefaults2.stagger = 0, _setDefaults2), vars || {})),
        func = function func(value, start, startIsRelative) {
      return tween.resetTo(property, value, start, startIsRelative);
    };

    func.tween = tween;
    return func;
  },
  isTweening: function isTweening(targets) {
    return _globalTimeline.getTweensOf(targets, true).length > 0;
  },
  defaults: function defaults(value) {
    value && value.ease && (value.ease = _parseEase(value.ease, _defaults.ease));
    return _mergeDeep(_defaults, value || {});
  },
  config: function config(value) {
    return _mergeDeep(_config, value || {});
  },
  registerEffect: function registerEffect(_ref3) {
    var name = _ref3.name,
        effect = _ref3.effect,
        plugins = _ref3.plugins,
        defaults = _ref3.defaults,
        extendTimeline = _ref3.extendTimeline;
    (plugins || "").split(",").forEach(function (pluginName) {
      return pluginName && !_plugins[pluginName] && !_globals[pluginName] && _warn(name + " effect requires " + pluginName + " plugin.");
    });

    _effects[name] = function (targets, vars, tl) {
      return effect(toArray(targets), _setDefaults(vars || {}, defaults), tl);
    };

    if (extendTimeline) {
      Timeline.prototype[name] = function (targets, vars, position) {
        return this.add(_effects[name](targets, _isObject(vars) ? vars : (position = vars) && {}, this), position);
      };
    }
  },
  registerEase: function registerEase(name, ease) {
    _easeMap[name] = _parseEase(ease);
  },
  parseEase: function parseEase(ease, defaultEase) {
    return arguments.length ? _parseEase(ease, defaultEase) : _easeMap;
  },
  getById: function getById(id) {
    return _globalTimeline.getById(id);
  },
  exportRoot: function exportRoot(vars, includeDelayedCalls) {
    if (vars === void 0) {
      vars = {};
    }

    var tl = new Timeline(vars),
        child,
        next;
    tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);

    _globalTimeline.remove(tl);

    tl._dp = 0; //otherwise it'll get re-activated when adding children and be re-introduced into _globalTimeline's linked list (then added to itself).

    tl._time = tl._tTime = _globalTimeline._time;
    child = _globalTimeline._first;

    while (child) {
      next = child._next;

      if (includeDelayedCalls || !(!child._dur && child instanceof Tween && child.vars.onComplete === child._targets[0])) {
        _addToTimeline(tl, child, child._start - child._delay);
      }

      child = next;
    }

    _addToTimeline(_globalTimeline, tl, 0);

    return tl;
  },
  context: function context(func, scope) {
    return func ? new Context(func, scope) : _context;
  },
  matchMedia: function matchMedia(scope) {
    return new MatchMedia(scope);
  },
  matchMediaRefresh: function matchMediaRefresh() {
    return _media.forEach(function (c) {
      var cond = c.conditions,
          found,
          p;

      for (p in cond) {
        if (cond[p]) {
          cond[p] = false;
          found = 1;
        }
      }

      found && c.revert();
    }) || _onMediaChange();
  },
  addEventListener: function addEventListener(type, callback) {
    var a = _listeners[type] || (_listeners[type] = []);
    ~a.indexOf(callback) || a.push(callback);
  },
  removeEventListener: function removeEventListener(type, callback) {
    var a = _listeners[type],
        i = a && a.indexOf(callback);
    i >= 0 && a.splice(i, 1);
  },
  utils: {
    wrap: wrap,
    wrapYoyo: wrapYoyo,
    distribute: distribute,
    random: random,
    snap: snap,
    normalize: normalize,
    getUnit: getUnit,
    clamp: clamp,
    splitColor: splitColor,
    toArray: toArray,
    selector: selector,
    mapRange: mapRange,
    pipe: pipe,
    unitize: unitize,
    interpolate: interpolate,
    shuffle: shuffle
  },
  install: _install,
  effects: _effects,
  ticker: _ticker,
  updateRoot: Timeline.updateRoot,
  plugins: _plugins,
  globalTimeline: _globalTimeline,
  core: {
    PropTween: PropTween,
    globals: _addGlobal,
    Tween: Tween,
    Timeline: Timeline,
    Animation: Animation,
    getCache: _getCache,
    _removeLinkedListItem: _removeLinkedListItem,
    reverting: function reverting() {
      return _reverting$1;
    },
    context: function context(toAdd) {
      if (toAdd && _context) {
        _context.data.push(toAdd);

        toAdd._ctx = _context;
      }

      return _context;
    },
    suppressOverwrites: function suppressOverwrites(value) {
      return _suppressOverwrites = value;
    }
  }
};

_forEachName("to,from,fromTo,delayedCall,set,killTweensOf", function (name) {
  return _gsap$1[name] = Tween[name];
});

_ticker.add(Timeline.updateRoot);

_quickTween = _gsap$1.to({}, {
  duration: 0
}); // ---- EXTRA PLUGINS --------------------------------------------------------

var _getPluginPropTween = function _getPluginPropTween(plugin, prop) {
  var pt = plugin._pt;

  while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) {
    pt = pt._next;
  }

  return pt;
},
    _addModifiers = function _addModifiers(tween, modifiers) {
  var targets = tween._targets,
      p,
      i,
      pt;

  for (p in modifiers) {
    i = targets.length;

    while (i--) {
      pt = tween._ptLookup[i][p];

      if (pt && (pt = pt.d)) {
        if (pt._pt) {
          // is a plugin
          pt = _getPluginPropTween(pt, p);
        }

        pt && pt.modifier && pt.modifier(modifiers[p], tween, targets[i], p);
      }
    }
  }
},
    _buildModifierPlugin = function _buildModifierPlugin(name, modifier) {
  return {
    name: name,
    headless: 1,
    rawVars: 1,
    //don't pre-process function-based values or "random()" strings.
    init: function init(target, vars, tween) {
      tween._onInit = function (tween) {
        var temp, p;

        if (_isString(vars)) {
          temp = {};

          _forEachName(vars, function (name) {
            return temp[name] = 1;
          }); //if the user passes in a comma-delimited list of property names to roundProps, like "x,y", we round to whole numbers.


          vars = temp;
        }

        if (modifier) {
          temp = {};

          for (p in vars) {
            temp[p] = modifier(vars[p]);
          }

          vars = temp;
        }

        _addModifiers(tween, vars);
      };
    }
  };
}; //register core plugins


var gsap = _gsap$1.registerPlugin({
  name: "attr",
  init: function init(target, vars, tween, index, targets) {
    var p, pt, v;
    this.tween = tween;

    for (p in vars) {
      v = target.getAttribute(p) || "";
      pt = this.add(target, "setAttribute", (v || 0) + "", vars[p], index, targets, 0, 0, p);
      pt.op = p;
      pt.b = v; // record the beginning value so we can revert()

      this._props.push(p);
    }
  },
  render: function render(ratio, data) {
    var pt = data._pt;

    while (pt) {
      _reverting$1 ? pt.set(pt.t, pt.p, pt.b, pt) : pt.r(ratio, pt.d); // if reverting, go back to the original (pt.b)

      pt = pt._next;
    }
  }
}, {
  name: "endArray",
  headless: 1,
  init: function init(target, value) {
    var i = value.length;

    while (i--) {
      this.add(target, i, target[i] || 0, value[i], 0, 0, 0, 0, 0, 1);
    }
  }
}, _buildModifierPlugin("roundProps", _roundModifier), _buildModifierPlugin("modifiers"), _buildModifierPlugin("snap", snap)) || _gsap$1; //to prevent the core plugins from being dropped via aggressive tree shaking, we must include them in the variable declaration in this way.

Tween.version = Timeline.version = gsap.version = "3.14.2";
_coreReady = 1;
_windowExists$1() && _wake();
_easeMap.Power0;
    _easeMap.Power1;
    _easeMap.Power2;
    _easeMap.Power3;
    _easeMap.Power4;
    _easeMap.Linear;
    _easeMap.Quad;
    _easeMap.Cubic;
    _easeMap.Quart;
    _easeMap.Quint;
    _easeMap.Strong;
    _easeMap.Elastic;
    _easeMap.Back;
    _easeMap.SteppedEase;
    _easeMap.Bounce;
    _easeMap.Sine;
    _easeMap.Expo;
    _easeMap.Circ;

/*!
 * CSSPlugin 3.14.2
 * https://gsap.com
 *
 * Copyright 2008-2025, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/


var _win,
    _doc,
    _docElement,
    _pluginInitted,
    _tempDiv,
    _recentSetterPlugin,
    _reverting,
    _windowExists = function _windowExists() {
  return typeof window !== "undefined";
},
    _transformProps = {},
    _RAD2DEG = 180 / Math.PI,
    _DEG2RAD = Math.PI / 180,
    _atan2 = Math.atan2,
    _bigNum = 1e8,
    _capsExp = /([A-Z])/g,
    _horizontalExp = /(left|right|width|margin|padding|x)/i,
    _complexExp = /[\s,\(]\S/,
    _propertyAliases = {
  autoAlpha: "opacity,visibility",
  scale: "scaleX,scaleY",
  alpha: "opacity"
},
    _renderCSSProp = function _renderCSSProp(ratio, data) {
  return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u, data);
},
    _renderPropWithEnd = function _renderPropWithEnd(ratio, data) {
  return data.set(data.t, data.p, ratio === 1 ? data.e : Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u, data);
},
    _renderCSSPropWithBeginning = function _renderCSSPropWithBeginning(ratio, data) {
  return data.set(data.t, data.p, ratio ? Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u : data.b, data);
},
    //if units change, we need a way to render the original unit/value when the tween goes all the way back to the beginning (ratio:0)
_renderCSSPropWithBeginningAndEnd = function _renderCSSPropWithBeginningAndEnd(ratio, data) {
  return data.set(data.t, data.p, ratio === 1 ? data.e : ratio ? Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u : data.b, data);
},
    //if units change, we need a way to render the original unit/value when the tween goes all the way back to the beginning (ratio:0)
_renderRoundedCSSProp = function _renderRoundedCSSProp(ratio, data) {
  var value = data.s + data.c * ratio;
  data.set(data.t, data.p, ~~(value + (value < 0 ? -0.5 : .5)) + data.u, data);
},
    _renderNonTweeningValue = function _renderNonTweeningValue(ratio, data) {
  return data.set(data.t, data.p, ratio ? data.e : data.b, data);
},
    _renderNonTweeningValueOnlyAtEnd = function _renderNonTweeningValueOnlyAtEnd(ratio, data) {
  return data.set(data.t, data.p, ratio !== 1 ? data.b : data.e, data);
},
    _setterCSSStyle = function _setterCSSStyle(target, property, value) {
  return target.style[property] = value;
},
    _setterCSSProp = function _setterCSSProp(target, property, value) {
  return target.style.setProperty(property, value);
},
    _setterTransform = function _setterTransform(target, property, value) {
  return target._gsap[property] = value;
},
    _setterScale = function _setterScale(target, property, value) {
  return target._gsap.scaleX = target._gsap.scaleY = value;
},
    _setterScaleWithRender = function _setterScaleWithRender(target, property, value, data, ratio) {
  var cache = target._gsap;
  cache.scaleX = cache.scaleY = value;
  cache.renderTransform(ratio, cache);
},
    _setterTransformWithRender = function _setterTransformWithRender(target, property, value, data, ratio) {
  var cache = target._gsap;
  cache[property] = value;
  cache.renderTransform(ratio, cache);
},
    _transformProp = "transform",
    _transformOriginProp = _transformProp + "Origin",
    _saveStyle = function _saveStyle(property, isNotCSS) {
  var _this = this;

  var target = this.target,
      style = target.style,
      cache = target._gsap;

  if (property in _transformProps && style) {
    this.tfm = this.tfm || {};

    if (property !== "transform") {
      property = _propertyAliases[property] || property;
      ~property.indexOf(",") ? property.split(",").forEach(function (a) {
        return _this.tfm[a] = _get(target, a);
      }) : this.tfm[property] = cache.x ? cache[property] : _get(target, property); // note: scale would map to "scaleX,scaleY", thus we loop and apply them both.

      property === _transformOriginProp && (this.tfm.zOrigin = cache.zOrigin);
    } else {
      return _propertyAliases.transform.split(",").forEach(function (p) {
        return _saveStyle.call(_this, p, isNotCSS);
      });
    }

    if (this.props.indexOf(_transformProp) >= 0) {
      return;
    }

    if (cache.svg) {
      this.svgo = target.getAttribute("data-svg-origin");
      this.props.push(_transformOriginProp, isNotCSS, "");
    }

    property = _transformProp;
  }

  (style || isNotCSS) && this.props.push(property, isNotCSS, style[property]);
},
    _removeIndependentTransforms = function _removeIndependentTransforms(style) {
  if (style.translate) {
    style.removeProperty("translate");
    style.removeProperty("scale");
    style.removeProperty("rotate");
  }
},
    _revertStyle = function _revertStyle() {
  var props = this.props,
      target = this.target,
      style = target.style,
      cache = target._gsap,
      i,
      p;

  for (i = 0; i < props.length; i += 3) {
    // stored like this: property, isNotCSS, value
    if (!props[i + 1]) {
      props[i + 2] ? style[props[i]] = props[i + 2] : style.removeProperty(props[i].substr(0, 2) === "--" ? props[i] : props[i].replace(_capsExp, "-$1").toLowerCase());
    } else if (props[i + 1] === 2) {
      // non-CSS value (function-based)
      target[props[i]](props[i + 2]);
    } else {
      // non-CSS value (not function-based)
      target[props[i]] = props[i + 2];
    }
  }

  if (this.tfm) {
    for (p in this.tfm) {
      cache[p] = this.tfm[p];
    }

    if (cache.svg) {
      cache.renderTransform();
      target.setAttribute("data-svg-origin", this.svgo || "");
    }

    i = _reverting();

    if ((!i || !i.isStart) && !style[_transformProp]) {
      _removeIndependentTransforms(style);

      if (cache.zOrigin && style[_transformOriginProp]) {
        style[_transformOriginProp] += " " + cache.zOrigin + "px"; // since we're uncaching, we must put the zOrigin back into the transformOrigin so that we can pull it out accurately when we parse again. Otherwise, we'd lose the z portion of the origin since we extract it to protect from Safari bugs.

        cache.zOrigin = 0;
        cache.renderTransform();
      }

      cache.uncache = 1; // if it's a startAt that's being reverted in the _initTween() of the core, we don't need to uncache transforms. This is purely a performance optimization.
    }
  }
},
    _getStyleSaver = function _getStyleSaver(target, properties) {
  var saver = {
    target: target,
    props: [],
    revert: _revertStyle,
    save: _saveStyle
  };
  target._gsap || gsap.core.getCache(target); // just make sure there's a _gsap cache defined because we read from it in _saveStyle() and it's more efficient to just check it here once.

  properties && target.style && target.nodeType && properties.split(",").forEach(function (p) {
    return saver.save(p);
  }); // make sure it's a DOM node too.

  return saver;
},
    _supports3D,
    _createElement = function _createElement(type, ns) {
  var e = _doc.createElementNS ? _doc.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : _doc.createElement(type); //some servers swap in https for http in the namespace which can break things, making "style" inaccessible.

  return e && e.style ? e : _doc.createElement(type); //some environments won't allow access to the element's style when created with a namespace in which case we default to the standard createElement() to work around the issue. Also note that when GSAP is embedded directly inside an SVG file, createElement() won't allow access to the style object in Firefox (see https://gsap.com/forums/topic/20215-problem-using-tweenmax-in-standalone-self-containing-svg-file-err-cannot-set-property-csstext-of-undefined/).
},
    _getComputedProperty = function _getComputedProperty(target, property, skipPrefixFallback) {
  var cs = getComputedStyle(target);
  return cs[property] || cs.getPropertyValue(property.replace(_capsExp, "-$1").toLowerCase()) || cs.getPropertyValue(property) || !skipPrefixFallback && _getComputedProperty(target, _checkPropPrefix(property) || property, 1) || ""; //css variables may not need caps swapped out for dashes and lowercase.
},
    _prefixes = "O,Moz,ms,Ms,Webkit".split(","),
    _checkPropPrefix = function _checkPropPrefix(property, element, preferPrefix) {
  var e = element || _tempDiv,
      s = e.style,
      i = 5;

  if (property in s && !preferPrefix) {
    return property;
  }

  property = property.charAt(0).toUpperCase() + property.substr(1);

  while (i-- && !(_prefixes[i] + property in s)) {}

  return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? _prefixes[i] : "") + property;
},
    _initCore = function _initCore() {
  if (_windowExists() && window.document) {
    _win = window;
    _doc = _win.document;
    _docElement = _doc.documentElement;
    _tempDiv = _createElement("div") || {
      style: {}
    };
    _createElement("div");
    _transformProp = _checkPropPrefix(_transformProp);
    _transformOriginProp = _transformProp + "Origin";
    _tempDiv.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0"; //make sure to override certain properties that may contaminate measurements, in case the user has overreaching style sheets.

    _supports3D = !!_checkPropPrefix("perspective");
    _reverting = gsap.core.reverting;
    _pluginInitted = 1;
  }
},
    _getReparentedCloneBBox = function _getReparentedCloneBBox(target) {
  //works around issues in some browsers (like Firefox) that don't correctly report getBBox() on SVG elements inside a <defs> element and/or <mask>. We try creating an SVG, adding it to the documentElement and toss the element in there so that it's definitely part of the rendering tree, then grab the bbox and if it works, we actually swap out the original getBBox() method for our own that does these extra steps whenever getBBox is needed. This helps ensure that performance is optimal (only do all these extra steps when absolutely necessary...most elements don't need it).
  var owner = target.ownerSVGElement,
      svg = _createElement("svg", owner && owner.getAttribute("xmlns") || "http://www.w3.org/2000/svg"),
      clone = target.cloneNode(true),
      bbox;

  clone.style.display = "block";
  svg.appendChild(clone);

  _docElement.appendChild(svg);

  try {
    bbox = clone.getBBox();
  } catch (e) {}

  svg.removeChild(clone);

  _docElement.removeChild(svg);

  return bbox;
},
    _getAttributeFallbacks = function _getAttributeFallbacks(target, attributesArray) {
  var i = attributesArray.length;

  while (i--) {
    if (target.hasAttribute(attributesArray[i])) {
      return target.getAttribute(attributesArray[i]);
    }
  }
},
    _getBBox = function _getBBox(target) {
  var bounds, cloned;

  try {
    bounds = target.getBBox(); //Firefox throws errors if you try calling getBBox() on an SVG element that's not rendered (like in a <symbol> or <defs>). https://bugzilla.mozilla.org/show_bug.cgi?id=612118
  } catch (error) {
    bounds = _getReparentedCloneBBox(target);
    cloned = 1;
  }

  bounds && (bounds.width || bounds.height) || cloned || (bounds = _getReparentedCloneBBox(target)); //some browsers (like Firefox) misreport the bounds if the element has zero width and height (it just assumes it's at x:0, y:0), thus we need to manually grab the position in that case.

  return bounds && !bounds.width && !bounds.x && !bounds.y ? {
    x: +_getAttributeFallbacks(target, ["x", "cx", "x1"]) || 0,
    y: +_getAttributeFallbacks(target, ["y", "cy", "y1"]) || 0,
    width: 0,
    height: 0
  } : bounds;
},
    _isSVG = function _isSVG(e) {
  return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _getBBox(e));
},
    //reports if the element is an SVG on which getBBox() actually works
_removeProperty = function _removeProperty(target, property) {
  if (property) {
    var style = target.style,
        first2Chars;

    if (property in _transformProps && property !== _transformOriginProp) {
      property = _transformProp;
    }

    if (style.removeProperty) {
      first2Chars = property.substr(0, 2);

      if (first2Chars === "ms" || property.substr(0, 6) === "webkit") {
        //Microsoft and some Webkit browsers don't conform to the standard of capitalizing the first prefix character, so we adjust so that when we prefix the caps with a dash, it's correct (otherwise it'd be "ms-transform" instead of "-ms-transform" for IE9, for example)
        property = "-" + property;
      }

      style.removeProperty(first2Chars === "--" ? property : property.replace(_capsExp, "-$1").toLowerCase());
    } else {
      //note: old versions of IE use "removeAttribute()" instead of "removeProperty()"
      style.removeAttribute(property);
    }
  }
},
    _addNonTweeningPT = function _addNonTweeningPT(plugin, target, property, beginning, end, onlySetAtEnd) {
  var pt = new PropTween(plugin._pt, target, property, 0, 1, onlySetAtEnd ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue);
  plugin._pt = pt;
  pt.b = beginning;
  pt.e = end;

  plugin._props.push(property);

  return pt;
},
    _nonConvertibleUnits = {
  deg: 1,
  rad: 1,
  turn: 1
},
    _nonStandardLayouts = {
  grid: 1,
  flex: 1
},
    //takes a single value like 20px and converts it to the unit specified, like "%", returning only the numeric amount.
_convertToUnit = function _convertToUnit(target, property, value, unit) {
  var curValue = parseFloat(value) || 0,
      curUnit = (value + "").trim().substr((curValue + "").length) || "px",
      // some browsers leave extra whitespace at the beginning of CSS variables, hence the need to trim()
  style = _tempDiv.style,
      horizontal = _horizontalExp.test(property),
      isRootSVG = target.tagName.toLowerCase() === "svg",
      measureProperty = (isRootSVG ? "client" : "offset") + (horizontal ? "Width" : "Height"),
      amount = 100,
      toPixels = unit === "px",
      toPercent = unit === "%",
      px,
      parent,
      cache,
      isSVG;

  if (unit === curUnit || !curValue || _nonConvertibleUnits[unit] || _nonConvertibleUnits[curUnit]) {
    return curValue;
  }

  curUnit !== "px" && !toPixels && (curValue = _convertToUnit(target, property, value, "px"));
  isSVG = target.getCTM && _isSVG(target);

  if ((toPercent || curUnit === "%") && (_transformProps[property] || ~property.indexOf("adius"))) {
    px = isSVG ? target.getBBox()[horizontal ? "width" : "height"] : target[measureProperty];
    return _round(toPercent ? curValue / px * amount : curValue / 100 * px);
  }

  style[horizontal ? "width" : "height"] = amount + (toPixels ? curUnit : unit);
  parent = unit !== "rem" && ~property.indexOf("adius") || unit === "em" && target.appendChild && !isRootSVG ? target : target.parentNode;

  if (isSVG) {
    parent = (target.ownerSVGElement || {}).parentNode;
  }

  if (!parent || parent === _doc || !parent.appendChild) {
    parent = _doc.body;
  }

  cache = parent._gsap;

  if (cache && toPercent && cache.width && horizontal && cache.time === _ticker.time && !cache.uncache) {
    return _round(curValue / cache.width * amount);
  } else {
    if (toPercent && (property === "height" || property === "width")) {
      // if we're dealing with width/height that's inside a container with padding and/or it's a flexbox/grid container, we must apply it to the target itself rather than the _tempDiv in order to ensure complete accuracy, factoring in the parent's padding.
      var v = target.style[property];
      target.style[property] = amount + unit;
      px = target[measureProperty];
      v ? target.style[property] = v : _removeProperty(target, property);
    } else {
      (toPercent || curUnit === "%") && !_nonStandardLayouts[_getComputedProperty(parent, "display")] && (style.position = _getComputedProperty(target, "position"));
      parent === target && (style.position = "static"); // like for borderRadius, if it's a % we must have it relative to the target itself but that may not have position: relative or position: absolute in which case it'd go up the chain until it finds its offsetParent (bad). position: static protects against that.

      parent.appendChild(_tempDiv);
      px = _tempDiv[measureProperty];
      parent.removeChild(_tempDiv);
      style.position = "absolute";
    }

    if (horizontal && toPercent) {
      cache = _getCache(parent);
      cache.time = _ticker.time;
      cache.width = parent[measureProperty];
    }
  }

  return _round(toPixels ? px * curValue / amount : px && curValue ? amount / px * curValue : 0);
},
    _get = function _get(target, property, unit, uncache) {
  var value;
  _pluginInitted || _initCore();

  if (property in _propertyAliases && property !== "transform") {
    property = _propertyAliases[property];

    if (~property.indexOf(",")) {
      property = property.split(",")[0];
    }
  }

  if (_transformProps[property] && property !== "transform") {
    value = _parseTransform(target, uncache);
    value = property !== "transformOrigin" ? value[property] : value.svg ? value.origin : _firstTwoOnly(_getComputedProperty(target, _transformOriginProp)) + " " + value.zOrigin + "px";
  } else {
    value = target.style[property];

    if (!value || value === "auto" || uncache || ~(value + "").indexOf("calc(")) {
      value = _specialProps[property] && _specialProps[property](target, property, unit) || _getComputedProperty(target, property) || _getProperty(target, property) || (property === "opacity" ? 1 : 0); // note: some browsers, like Firefox, don't report borderRadius correctly! Instead, it only reports every corner like  borderTopLeftRadius
    }
  }

  return unit && !~(value + "").trim().indexOf(" ") ? _convertToUnit(target, property, value, unit) + unit : value;
},
    _tweenComplexCSSString = function _tweenComplexCSSString(target, prop, start, end) {
  // note: we call _tweenComplexCSSString.call(pluginInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.
  if (!start || start === "none") {
    // some browsers like Safari actually PREFER the prefixed property and mis-report the unprefixed value like clipPath (BUG). In other words, even though clipPath exists in the style ("clipPath" in target.style) and it's set in the CSS properly (along with -webkit-clip-path), Safari reports clipPath as "none" whereas WebkitClipPath reports accurately like "ellipse(100% 0% at 50% 0%)", so in this case we must SWITCH to using the prefixed property instead. See https://gsap.com/forums/topic/18310-clippath-doesnt-work-on-ios/
    var p = _checkPropPrefix(prop, target, 1),
        s = p && _getComputedProperty(target, p, 1);

    if (s && s !== start) {
      prop = p;
      start = s;
    } else if (prop === "borderColor") {
      start = _getComputedProperty(target, "borderTopColor"); // Firefox bug: always reports "borderColor" as "", so we must fall back to borderTopColor. See https://gsap.com/forums/topic/24583-how-to-return-colors-that-i-had-after-reverse/
    }
  }

  var pt = new PropTween(this._pt, target.style, prop, 0, 1, _renderComplexString),
      index = 0,
      matchIndex = 0,
      a,
      result,
      startValues,
      startNum,
      color,
      startValue,
      endValue,
      endNum,
      chunk,
      endUnit,
      startUnit,
      endValues;
  pt.b = start;
  pt.e = end;
  start += ""; // ensure values are strings

  end += "";

  if (end.substring(0, 6) === "var(--") {
    end = _getComputedProperty(target, end.substring(4, end.indexOf(")")));
  }

  if (end === "auto") {
    startValue = target.style[prop];
    target.style[prop] = end;
    end = _getComputedProperty(target, prop) || end;
    startValue ? target.style[prop] = startValue : _removeProperty(target, prop);
  }

  a = [start, end];

  _colorStringFilter(a); // pass an array with the starting and ending values and let the filter do whatever it needs to the values. If colors are found, it returns true and then we must match where the color shows up order-wise because for things like boxShadow, sometimes the browser provides the computed values with the color FIRST, but the user provides it with the color LAST, so flip them if necessary. Same for drop-shadow().


  start = a[0];
  end = a[1];
  startValues = start.match(_numWithUnitExp) || [];
  endValues = end.match(_numWithUnitExp) || [];

  if (endValues.length) {
    while (result = _numWithUnitExp.exec(end)) {
      endValue = result[0];
      chunk = end.substring(index, result.index);

      if (color) {
        color = (color + 1) % 5;
      } else if (chunk.substr(-5) === "rgba(" || chunk.substr(-5) === "hsla(") {
        color = 1;
      }

      if (endValue !== (startValue = startValues[matchIndex++] || "")) {
        startNum = parseFloat(startValue) || 0;
        startUnit = startValue.substr((startNum + "").length);
        endValue.charAt(1) === "=" && (endValue = _parseRelative(startNum, endValue) + startUnit);
        endNum = parseFloat(endValue);
        endUnit = endValue.substr((endNum + "").length);
        index = _numWithUnitExp.lastIndex - endUnit.length;

        if (!endUnit) {
          //if something like "perspective:300" is passed in and we must add a unit to the end
          endUnit = endUnit || _config.units[prop] || startUnit;

          if (index === end.length) {
            end += endUnit;
            pt.e += endUnit;
          }
        }

        if (startUnit !== endUnit) {
          startNum = _convertToUnit(target, prop, startValue, endUnit) || 0;
        } // these nested PropTweens are handled in a special way - we'll never actually call a render or setter method on them. We'll just loop through them in the parent complex string PropTween's render method.


        pt._pt = {
          _next: pt._pt,
          p: chunk || matchIndex === 1 ? chunk : ",",
          //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
          s: startNum,
          c: endNum - startNum,
          m: color && color < 4 || prop === "zIndex" ? Math.round : 0
        };
      }
    }

    pt.c = index < end.length ? end.substring(index, end.length) : ""; //we use the "c" of the PropTween to store the final part of the string (after the last number)
  } else {
    pt.r = prop === "display" && end === "none" ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue;
  }

  _relExp.test(end) && (pt.e = 0); //if the end string contains relative values or dynamic random(...) values, delete the end it so that on the final render we don't actually set it to the string with += or -= characters (forces it to use the calculated value).

  this._pt = pt; //start the linked list with this new PropTween. Remember, we call _tweenComplexCSSString.call(pluginInstance...) to ensure that it's scoped properly. We may call it from within another plugin too, thus "this" would refer to the plugin.

  return pt;
},
    _keywordToPercent = {
  top: "0%",
  bottom: "100%",
  left: "0%",
  right: "100%",
  center: "50%"
},
    _convertKeywordsToPercentages = function _convertKeywordsToPercentages(value) {
  var split = value.split(" "),
      x = split[0],
      y = split[1] || "50%";

  if (x === "top" || x === "bottom" || y === "left" || y === "right") {
    //the user provided them in the wrong order, so flip them
    value = x;
    x = y;
    y = value;
  }

  split[0] = _keywordToPercent[x] || x;
  split[1] = _keywordToPercent[y] || y;
  return split.join(" ");
},
    _renderClearProps = function _renderClearProps(ratio, data) {
  if (data.tween && data.tween._time === data.tween._dur) {
    var target = data.t,
        style = target.style,
        props = data.u,
        cache = target._gsap,
        prop,
        clearTransforms,
        i;

    if (props === "all" || props === true) {
      style.cssText = "";
      clearTransforms = 1;
    } else {
      props = props.split(",");
      i = props.length;

      while (--i > -1) {
        prop = props[i];

        if (_transformProps[prop]) {
          clearTransforms = 1;
          prop = prop === "transformOrigin" ? _transformOriginProp : _transformProp;
        }

        _removeProperty(target, prop);
      }
    }

    if (clearTransforms) {
      _removeProperty(target, _transformProp);

      if (cache) {
        cache.svg && target.removeAttribute("transform");
        style.scale = style.rotate = style.translate = "none";

        _parseTransform(target, 1); // force all the cached values back to "normal"/identity, otherwise if there's another tween that's already set to render transforms on this element, it could display the wrong values.


        cache.uncache = 1;

        _removeIndependentTransforms(style);
      }
    }
  }
},
    // note: specialProps should return 1 if (and only if) they have a non-zero priority. It indicates we need to sort the linked list.
_specialProps = {
  clearProps: function clearProps(plugin, target, property, endValue, tween) {
    if (tween.data !== "isFromStart") {
      var pt = plugin._pt = new PropTween(plugin._pt, target, property, 0, 0, _renderClearProps);
      pt.u = endValue;
      pt.pr = -10;
      pt.tween = tween;

      plugin._props.push(property);

      return 1;
    }
  }
  /* className feature (about 0.4kb gzipped).
  , className(plugin, target, property, endValue, tween) {
  	let _renderClassName = (ratio, data) => {
  			data.css.render(ratio, data.css);
  			if (!ratio || ratio === 1) {
  				let inline = data.rmv,
  					target = data.t,
  					p;
  				target.setAttribute("class", ratio ? data.e : data.b);
  				for (p in inline) {
  					_removeProperty(target, p);
  				}
  			}
  		},
  		_getAllStyles = (target) => {
  			let styles = {},
  				computed = getComputedStyle(target),
  				p;
  			for (p in computed) {
  				if (isNaN(p) && p !== "cssText" && p !== "length") {
  					styles[p] = computed[p];
  				}
  			}
  			_setDefaults(styles, _parseTransform(target, 1));
  			return styles;
  		},
  		startClassList = target.getAttribute("class"),
  		style = target.style,
  		cssText = style.cssText,
  		cache = target._gsap,
  		classPT = cache.classPT,
  		inlineToRemoveAtEnd = {},
  		data = {t:target, plugin:plugin, rmv:inlineToRemoveAtEnd, b:startClassList, e:(endValue.charAt(1) !== "=") ? endValue : startClassList.replace(new RegExp("(?:\\s|^)" + endValue.substr(2) + "(?![\\w-])"), "") + ((endValue.charAt(0) === "+") ? " " + endValue.substr(2) : "")},
  		changingVars = {},
  		startVars = _getAllStyles(target),
  		transformRelated = /(transform|perspective)/i,
  		endVars, p;
  	if (classPT) {
  		classPT.r(1, classPT.d);
  		_removeLinkedListItem(classPT.d.plugin, classPT, "_pt");
  	}
  	target.setAttribute("class", data.e);
  	endVars = _getAllStyles(target, true);
  	target.setAttribute("class", startClassList);
  	for (p in endVars) {
  		if (endVars[p] !== startVars[p] && !transformRelated.test(p)) {
  			changingVars[p] = endVars[p];
  			if (!style[p] && style[p] !== "0") {
  				inlineToRemoveAtEnd[p] = 1;
  			}
  		}
  	}
  	cache.classPT = plugin._pt = new PropTween(plugin._pt, target, "className", 0, 0, _renderClassName, data, 0, -11);
  	if (style.cssText !== cssText) { //only apply if things change. Otherwise, in cases like a background-image that's pulled dynamically, it could cause a refresh. See https://gsap.com/forums/topic/20368-possible-gsap-bug-switching-classnames-in-chrome/.
  		style.cssText = cssText; //we recorded cssText before we swapped classes and ran _getAllStyles() because in cases when a className tween is overwritten, we remove all the related tweening properties from that class change (otherwise class-specific stuff can't override properties we've directly set on the target's style object due to specificity).
  	}
  	_parseTransform(target, true); //to clear the caching of transforms
  	data.css = new gsap.plugins.css();
  	data.css.init(target, changingVars, tween);
  	plugin._props.push(...data.css._props);
  	return 1;
  }
  */

},

/*
 * --------------------------------------------------------------------------------------
 * TRANSFORMS
 * --------------------------------------------------------------------------------------
 */
_identity2DMatrix = [1, 0, 0, 1, 0, 0],
    _rotationalProperties = {},
    _isNullTransform = function _isNullTransform(value) {
  return value === "matrix(1, 0, 0, 1, 0, 0)" || value === "none" || !value;
},
    _getComputedTransformMatrixAsArray = function _getComputedTransformMatrixAsArray(target) {
  var matrixString = _getComputedProperty(target, _transformProp);

  return _isNullTransform(matrixString) ? _identity2DMatrix : matrixString.substr(7).match(_numExp).map(_round);
},
    _getMatrix = function _getMatrix(target, force2D) {
  var cache = target._gsap || _getCache(target),
      style = target.style,
      matrix = _getComputedTransformMatrixAsArray(target),
      parent,
      nextSibling,
      temp,
      addedToDOM;

  if (cache.svg && target.getAttribute("transform")) {
    temp = target.transform.baseVal.consolidate().matrix; //ensures that even complex values like "translate(50,60) rotate(135,0,0)" are parsed because it mashes it into a matrix.

    matrix = [temp.a, temp.b, temp.c, temp.d, temp.e, temp.f];
    return matrix.join(",") === "1,0,0,1,0,0" ? _identity2DMatrix : matrix;
  } else if (matrix === _identity2DMatrix && !target.offsetParent && target !== _docElement && !cache.svg) {
    //note: if offsetParent is null, that means the element isn't in the normal document flow, like if it has display:none or one of its ancestors has display:none). Firefox returns null for getComputedStyle() if the element is in an iframe that has display:none. https://bugzilla.mozilla.org/show_bug.cgi?id=548397
    //browsers don't report transforms accurately unless the element is in the DOM and has a display value that's not "none". Firefox and Microsoft browsers have a partial bug where they'll report transforms even if display:none BUT not any percentage-based values like translate(-50%, 8px) will be reported as if it's translate(0, 8px).
    temp = style.display;
    style.display = "block";
    parent = target.parentNode;

    if (!parent || !target.offsetParent && !target.getBoundingClientRect().width) {
      // note: in 3.3.0 we switched target.offsetParent to _doc.body.contains(target) to avoid [sometimes unnecessary] MutationObserver calls but that wasn't adequate because there are edge cases where nested position: fixed elements need to get reparented to accurately sense transforms. See https://github.com/greensock/GSAP/issues/388 and https://github.com/greensock/GSAP/issues/375. Note: position: fixed elements report a null offsetParent but they could also be invisible because they're in an ancestor with display: none, so we check getBoundingClientRect(). We only want to alter the DOM if we absolutely have to because it can cause iframe content to reload, like a Vimeo video.
      addedToDOM = 1; //flag

      nextSibling = target.nextElementSibling;

      _docElement.appendChild(target); //we must add it to the DOM in order to get values properly

    }

    matrix = _getComputedTransformMatrixAsArray(target);
    temp ? style.display = temp : _removeProperty(target, "display");

    if (addedToDOM) {
      nextSibling ? parent.insertBefore(target, nextSibling) : parent ? parent.appendChild(target) : _docElement.removeChild(target);
    }
  }

  return force2D && matrix.length > 6 ? [matrix[0], matrix[1], matrix[4], matrix[5], matrix[12], matrix[13]] : matrix;
},
    _applySVGOrigin = function _applySVGOrigin(target, origin, originIsAbsolute, smooth, matrixArray, pluginToAddPropTweensTo) {
  var cache = target._gsap,
      matrix = matrixArray || _getMatrix(target, true),
      xOriginOld = cache.xOrigin || 0,
      yOriginOld = cache.yOrigin || 0,
      xOffsetOld = cache.xOffset || 0,
      yOffsetOld = cache.yOffset || 0,
      a = matrix[0],
      b = matrix[1],
      c = matrix[2],
      d = matrix[3],
      tx = matrix[4],
      ty = matrix[5],
      originSplit = origin.split(" "),
      xOrigin = parseFloat(originSplit[0]) || 0,
      yOrigin = parseFloat(originSplit[1]) || 0,
      bounds,
      determinant,
      x,
      y;

  if (!originIsAbsolute) {
    bounds = _getBBox(target);
    xOrigin = bounds.x + (~originSplit[0].indexOf("%") ? xOrigin / 100 * bounds.width : xOrigin);
    yOrigin = bounds.y + (~(originSplit[1] || originSplit[0]).indexOf("%") ? yOrigin / 100 * bounds.height : yOrigin); // if (!("xOrigin" in cache) && (xOrigin || yOrigin)) { // added in 3.12.3, reverted in 3.12.4; requires more exploration
    // 	xOrigin -= bounds.x;
    // 	yOrigin -= bounds.y;
    // }
  } else if (matrix !== _identity2DMatrix && (determinant = a * d - b * c)) {
    //if it's zero (like if scaleX and scaleY are zero), skip it to avoid errors with dividing by zero.
    x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + (c * ty - d * tx) / determinant;
    y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - (a * ty - b * tx) / determinant;
    xOrigin = x;
    yOrigin = y; // theory: we only had to do this for smoothing and it assumes that the previous one was not originIsAbsolute.
  }

  if (smooth || smooth !== false && cache.smooth) {
    tx = xOrigin - xOriginOld;
    ty = yOrigin - yOriginOld;
    cache.xOffset = xOffsetOld + (tx * a + ty * c) - tx;
    cache.yOffset = yOffsetOld + (tx * b + ty * d) - ty;
  } else {
    cache.xOffset = cache.yOffset = 0;
  }

  cache.xOrigin = xOrigin;
  cache.yOrigin = yOrigin;
  cache.smooth = !!smooth;
  cache.origin = origin;
  cache.originIsAbsolute = !!originIsAbsolute;
  target.style[_transformOriginProp] = "0px 0px"; //otherwise, if someone sets  an origin via CSS, it will likely interfere with the SVG transform attribute ones (because remember, we're baking the origin into the matrix() value).

  if (pluginToAddPropTweensTo) {
    _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOrigin", xOriginOld, xOrigin);

    _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOrigin", yOriginOld, yOrigin);

    _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOffset", xOffsetOld, cache.xOffset);

    _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOffset", yOffsetOld, cache.yOffset);
  }

  target.setAttribute("data-svg-origin", xOrigin + " " + yOrigin);
},
    _parseTransform = function _parseTransform(target, uncache) {
  var cache = target._gsap || new GSCache(target);

  if ("x" in cache && !uncache && !cache.uncache) {
    return cache;
  }

  var style = target.style,
      invertedScaleX = cache.scaleX < 0,
      px = "px",
      deg = "deg",
      cs = getComputedStyle(target),
      origin = _getComputedProperty(target, _transformOriginProp) || "0",
      x,
      y,
      z,
      scaleX,
      scaleY,
      rotation,
      rotationX,
      rotationY,
      skewX,
      skewY,
      perspective,
      xOrigin,
      yOrigin,
      matrix,
      angle,
      cos,
      sin,
      a,
      b,
      c,
      d,
      a12,
      a22,
      t1,
      t2,
      t3,
      a13,
      a23,
      a33,
      a42,
      a43,
      a32;
  x = y = z = rotation = rotationX = rotationY = skewX = skewY = perspective = 0;
  scaleX = scaleY = 1;
  cache.svg = !!(target.getCTM && _isSVG(target));

  if (cs.translate) {
    // accommodate independent transforms by combining them into normal ones.
    if (cs.translate !== "none" || cs.scale !== "none" || cs.rotate !== "none") {
      style[_transformProp] = (cs.translate !== "none" ? "translate3d(" + (cs.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") " : "") + (cs.rotate !== "none" ? "rotate(" + cs.rotate + ") " : "") + (cs.scale !== "none" ? "scale(" + cs.scale.split(" ").join(",") + ") " : "") + (cs[_transformProp] !== "none" ? cs[_transformProp] : "");
    }

    style.scale = style.rotate = style.translate = "none";
  }

  matrix = _getMatrix(target, cache.svg);

  if (cache.svg) {
    if (cache.uncache) {
      // if cache.uncache is true (and maybe if origin is 0,0), we need to set element.style.transformOrigin = (cache.xOrigin - bbox.x) + "px " + (cache.yOrigin - bbox.y) + "px". Previously we let the data-svg-origin stay instead, but when introducing revert(), it complicated things.
      t2 = target.getBBox();
      origin = cache.xOrigin - t2.x + "px " + (cache.yOrigin - t2.y) + "px";
      t1 = "";
    } else {
      t1 = !uncache && target.getAttribute("data-svg-origin"); //  Remember, to work around browser inconsistencies we always force SVG elements' transformOrigin to 0,0 and offset the translation accordingly.
    }

    _applySVGOrigin(target, t1 || origin, !!t1 || cache.originIsAbsolute, cache.smooth !== false, matrix);
  }

  xOrigin = cache.xOrigin || 0;
  yOrigin = cache.yOrigin || 0;

  if (matrix !== _identity2DMatrix) {
    a = matrix[0]; //a11

    b = matrix[1]; //a21

    c = matrix[2]; //a31

    d = matrix[3]; //a41

    x = a12 = matrix[4];
    y = a22 = matrix[5]; //2D matrix

    if (matrix.length === 6) {
      scaleX = Math.sqrt(a * a + b * b);
      scaleY = Math.sqrt(d * d + c * c);
      rotation = a || b ? _atan2(b, a) * _RAD2DEG : 0; //note: if scaleX is 0, we cannot accurately measure rotation. Same for skewX with a scaleY of 0. Therefore, we default to the previously recorded value (or zero if that doesn't exist).

      skewX = c || d ? _atan2(c, d) * _RAD2DEG + rotation : 0;
      skewX && (scaleY *= Math.abs(Math.cos(skewX * _DEG2RAD)));

      if (cache.svg) {
        x -= xOrigin - (xOrigin * a + yOrigin * c);
        y -= yOrigin - (xOrigin * b + yOrigin * d);
      } //3D matrix

    } else {
      a32 = matrix[6];
      a42 = matrix[7];
      a13 = matrix[8];
      a23 = matrix[9];
      a33 = matrix[10];
      a43 = matrix[11];
      x = matrix[12];
      y = matrix[13];
      z = matrix[14];
      angle = _atan2(a32, a33);
      rotationX = angle * _RAD2DEG; //rotationX

      if (angle) {
        cos = Math.cos(-angle);
        sin = Math.sin(-angle);
        t1 = a12 * cos + a13 * sin;
        t2 = a22 * cos + a23 * sin;
        t3 = a32 * cos + a33 * sin;
        a13 = a12 * -sin + a13 * cos;
        a23 = a22 * -sin + a23 * cos;
        a33 = a32 * -sin + a33 * cos;
        a43 = a42 * -sin + a43 * cos;
        a12 = t1;
        a22 = t2;
        a32 = t3;
      } //rotationY


      angle = _atan2(-c, a33);
      rotationY = angle * _RAD2DEG;

      if (angle) {
        cos = Math.cos(-angle);
        sin = Math.sin(-angle);
        t1 = a * cos - a13 * sin;
        t2 = b * cos - a23 * sin;
        t3 = c * cos - a33 * sin;
        a43 = d * sin + a43 * cos;
        a = t1;
        b = t2;
        c = t3;
      } //rotationZ


      angle = _atan2(b, a);
      rotation = angle * _RAD2DEG;

      if (angle) {
        cos = Math.cos(angle);
        sin = Math.sin(angle);
        t1 = a * cos + b * sin;
        t2 = a12 * cos + a22 * sin;
        b = b * cos - a * sin;
        a22 = a22 * cos - a12 * sin;
        a = t1;
        a12 = t2;
      }

      if (rotationX && Math.abs(rotationX) + Math.abs(rotation) > 359.9) {
        //when rotationY is set, it will often be parsed as 180 degrees different than it should be, and rotationX and rotation both being 180 (it looks the same), so we adjust for that here.
        rotationX = rotation = 0;
        rotationY = 180 - rotationY;
      }

      scaleX = _round(Math.sqrt(a * a + b * b + c * c));
      scaleY = _round(Math.sqrt(a22 * a22 + a32 * a32));
      angle = _atan2(a12, a22);
      skewX = Math.abs(angle) > 0.0002 ? angle * _RAD2DEG : 0;
      perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
    }

    if (cache.svg) {
      //sense if there are CSS transforms applied on an SVG element in which case we must overwrite them when rendering. The transform attribute is more reliable cross-browser, but we can't just remove the CSS ones because they may be applied in a CSS rule somewhere (not just inline).
      t1 = target.getAttribute("transform");
      cache.forceCSS = target.setAttribute("transform", "") || !_isNullTransform(_getComputedProperty(target, _transformProp));
      t1 && target.setAttribute("transform", t1);
    }
  }

  if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
    if (invertedScaleX) {
      scaleX *= -1;
      skewX += rotation <= 0 ? 180 : -180;
      rotation += rotation <= 0 ? 180 : -180;
    } else {
      scaleY *= -1;
      skewX += skewX <= 0 ? 180 : -180;
    }
  }

  uncache = uncache || cache.uncache;
  cache.x = x - ((cache.xPercent = x && (!uncache && cache.xPercent || (Math.round(target.offsetWidth / 2) === Math.round(-x) ? -50 : 0))) ? target.offsetWidth * cache.xPercent / 100 : 0) + px;
  cache.y = y - ((cache.yPercent = y && (!uncache && cache.yPercent || (Math.round(target.offsetHeight / 2) === Math.round(-y) ? -50 : 0))) ? target.offsetHeight * cache.yPercent / 100 : 0) + px;
  cache.z = z + px;
  cache.scaleX = _round(scaleX);
  cache.scaleY = _round(scaleY);
  cache.rotation = _round(rotation) + deg;
  cache.rotationX = _round(rotationX) + deg;
  cache.rotationY = _round(rotationY) + deg;
  cache.skewX = skewX + deg;
  cache.skewY = skewY + deg;
  cache.transformPerspective = perspective + px;

  if (cache.zOrigin = parseFloat(origin.split(" ")[2]) || !uncache && cache.zOrigin || 0) {
    style[_transformOriginProp] = _firstTwoOnly(origin);
  }

  cache.xOffset = cache.yOffset = 0;
  cache.force3D = _config.force3D;
  cache.renderTransform = cache.svg ? _renderSVGTransforms : _supports3D ? _renderCSSTransforms : _renderNon3DTransforms;
  cache.uncache = 0;
  return cache;
},
    _firstTwoOnly = function _firstTwoOnly(value) {
  return (value = value.split(" "))[0] + " " + value[1];
},
    //for handling transformOrigin values, stripping out the 3rd dimension
_addPxTranslate = function _addPxTranslate(target, start, value) {
  var unit = getUnit(start);
  return _round(parseFloat(start) + parseFloat(_convertToUnit(target, "x", value + "px", unit))) + unit;
},
    _renderNon3DTransforms = function _renderNon3DTransforms(ratio, cache) {
  cache.z = "0px";
  cache.rotationY = cache.rotationX = "0deg";
  cache.force3D = 0;

  _renderCSSTransforms(ratio, cache);
},
    _zeroDeg = "0deg",
    _zeroPx = "0px",
    _endParenthesis = ") ",
    _renderCSSTransforms = function _renderCSSTransforms(ratio, cache) {
  var _ref = cache || this,
      xPercent = _ref.xPercent,
      yPercent = _ref.yPercent,
      x = _ref.x,
      y = _ref.y,
      z = _ref.z,
      rotation = _ref.rotation,
      rotationY = _ref.rotationY,
      rotationX = _ref.rotationX,
      skewX = _ref.skewX,
      skewY = _ref.skewY,
      scaleX = _ref.scaleX,
      scaleY = _ref.scaleY,
      transformPerspective = _ref.transformPerspective,
      force3D = _ref.force3D,
      target = _ref.target,
      zOrigin = _ref.zOrigin,
      transforms = "",
      use3D = force3D === "auto" && ratio && ratio !== 1 || force3D === true; // Safari has a bug that causes it not to render 3D transform-origin values properly, so we force the z origin to 0, record it in the cache, and then do the math here to offset the translate values accordingly (basically do the 3D transform-origin part manually)


  if (zOrigin && (rotationX !== _zeroDeg || rotationY !== _zeroDeg)) {
    var angle = parseFloat(rotationY) * _DEG2RAD,
        a13 = Math.sin(angle),
        a33 = Math.cos(angle),
        cos;

    angle = parseFloat(rotationX) * _DEG2RAD;
    cos = Math.cos(angle);
    x = _addPxTranslate(target, x, a13 * cos * -zOrigin);
    y = _addPxTranslate(target, y, -Math.sin(angle) * -zOrigin);
    z = _addPxTranslate(target, z, a33 * cos * -zOrigin + zOrigin);
  }

  if (transformPerspective !== _zeroPx) {
    transforms += "perspective(" + transformPerspective + _endParenthesis;
  }

  if (xPercent || yPercent) {
    transforms += "translate(" + xPercent + "%, " + yPercent + "%) ";
  }

  if (use3D || x !== _zeroPx || y !== _zeroPx || z !== _zeroPx) {
    transforms += z !== _zeroPx || use3D ? "translate3d(" + x + ", " + y + ", " + z + ") " : "translate(" + x + ", " + y + _endParenthesis;
  }

  if (rotation !== _zeroDeg) {
    transforms += "rotate(" + rotation + _endParenthesis;
  }

  if (rotationY !== _zeroDeg) {
    transforms += "rotateY(" + rotationY + _endParenthesis;
  }

  if (rotationX !== _zeroDeg) {
    transforms += "rotateX(" + rotationX + _endParenthesis;
  }

  if (skewX !== _zeroDeg || skewY !== _zeroDeg) {
    transforms += "skew(" + skewX + ", " + skewY + _endParenthesis;
  }

  if (scaleX !== 1 || scaleY !== 1) {
    transforms += "scale(" + scaleX + ", " + scaleY + _endParenthesis;
  }

  target.style[_transformProp] = transforms || "translate(0, 0)";
},
    _renderSVGTransforms = function _renderSVGTransforms(ratio, cache) {
  var _ref2 = cache || this,
      xPercent = _ref2.xPercent,
      yPercent = _ref2.yPercent,
      x = _ref2.x,
      y = _ref2.y,
      rotation = _ref2.rotation,
      skewX = _ref2.skewX,
      skewY = _ref2.skewY,
      scaleX = _ref2.scaleX,
      scaleY = _ref2.scaleY,
      target = _ref2.target,
      xOrigin = _ref2.xOrigin,
      yOrigin = _ref2.yOrigin,
      xOffset = _ref2.xOffset,
      yOffset = _ref2.yOffset,
      forceCSS = _ref2.forceCSS,
      tx = parseFloat(x),
      ty = parseFloat(y),
      a11,
      a21,
      a12,
      a22,
      temp;

  rotation = parseFloat(rotation);
  skewX = parseFloat(skewX);
  skewY = parseFloat(skewY);

  if (skewY) {
    //for performance reasons, we combine all skewing into the skewX and rotation values. Remember, a skewY of 10 degrees looks the same as a rotation of 10 degrees plus a skewX of 10 degrees.
    skewY = parseFloat(skewY);
    skewX += skewY;
    rotation += skewY;
  }

  if (rotation || skewX) {
    rotation *= _DEG2RAD;
    skewX *= _DEG2RAD;
    a11 = Math.cos(rotation) * scaleX;
    a21 = Math.sin(rotation) * scaleX;
    a12 = Math.sin(rotation - skewX) * -scaleY;
    a22 = Math.cos(rotation - skewX) * scaleY;

    if (skewX) {
      skewY *= _DEG2RAD;
      temp = Math.tan(skewX - skewY);
      temp = Math.sqrt(1 + temp * temp);
      a12 *= temp;
      a22 *= temp;

      if (skewY) {
        temp = Math.tan(skewY);
        temp = Math.sqrt(1 + temp * temp);
        a11 *= temp;
        a21 *= temp;
      }
    }

    a11 = _round(a11);
    a21 = _round(a21);
    a12 = _round(a12);
    a22 = _round(a22);
  } else {
    a11 = scaleX;
    a22 = scaleY;
    a21 = a12 = 0;
  }

  if (tx && !~(x + "").indexOf("px") || ty && !~(y + "").indexOf("px")) {
    tx = _convertToUnit(target, "x", x, "px");
    ty = _convertToUnit(target, "y", y, "px");
  }

  if (xOrigin || yOrigin || xOffset || yOffset) {
    tx = _round(tx + xOrigin - (xOrigin * a11 + yOrigin * a12) + xOffset);
    ty = _round(ty + yOrigin - (xOrigin * a21 + yOrigin * a22) + yOffset);
  }

  if (xPercent || yPercent) {
    //The SVG spec doesn't support percentage-based translation in the "transform" attribute, so we merge it into the translation to simulate it.
    temp = target.getBBox();
    tx = _round(tx + xPercent / 100 * temp.width);
    ty = _round(ty + yPercent / 100 * temp.height);
  }

  temp = "matrix(" + a11 + "," + a21 + "," + a12 + "," + a22 + "," + tx + "," + ty + ")";
  target.setAttribute("transform", temp);
  forceCSS && (target.style[_transformProp] = temp); //some browsers prioritize CSS transforms over the transform attribute. When we sense that the user has CSS transforms applied, we must overwrite them this way (otherwise some browser simply won't render the transform attribute changes!)
},
    _addRotationalPropTween = function _addRotationalPropTween(plugin, target, property, startNum, endValue) {
  var cap = 360,
      isString = _isString(endValue),
      endNum = parseFloat(endValue) * (isString && ~endValue.indexOf("rad") ? _RAD2DEG : 1),
      change = endNum - startNum,
      finalValue = startNum + change + "deg",
      direction,
      pt;

  if (isString) {
    direction = endValue.split("_")[1];

    if (direction === "short") {
      change %= cap;

      if (change !== change % (cap / 2)) {
        change += change < 0 ? cap : -cap;
      }
    }

    if (direction === "cw" && change < 0) {
      change = (change + cap * _bigNum) % cap - ~~(change / cap) * cap;
    } else if (direction === "ccw" && change > 0) {
      change = (change - cap * _bigNum) % cap - ~~(change / cap) * cap;
    }
  }

  plugin._pt = pt = new PropTween(plugin._pt, target, property, startNum, change, _renderPropWithEnd);
  pt.e = finalValue;
  pt.u = "deg";

  plugin._props.push(property);

  return pt;
},
    _assign = function _assign(target, source) {
  // Internet Explorer doesn't have Object.assign(), so we recreate it here.
  for (var p in source) {
    target[p] = source[p];
  }

  return target;
},
    _addRawTransformPTs = function _addRawTransformPTs(plugin, transforms, target) {
  //for handling cases where someone passes in a whole transform string, like transform: "scale(2, 3) rotate(20deg) translateY(30em)"
  var startCache = _assign({}, target._gsap),
      exclude = "perspective,force3D,transformOrigin,svgOrigin",
      style = target.style,
      endCache,
      p,
      startValue,
      endValue,
      startNum,
      endNum,
      startUnit,
      endUnit;

  if (startCache.svg) {
    startValue = target.getAttribute("transform");
    target.setAttribute("transform", "");
    style[_transformProp] = transforms;
    endCache = _parseTransform(target, 1);

    _removeProperty(target, _transformProp);

    target.setAttribute("transform", startValue);
  } else {
    startValue = getComputedStyle(target)[_transformProp];
    style[_transformProp] = transforms;
    endCache = _parseTransform(target, 1);
    style[_transformProp] = startValue;
  }

  for (p in _transformProps) {
    startValue = startCache[p];
    endValue = endCache[p];

    if (startValue !== endValue && exclude.indexOf(p) < 0) {
      //tweening to no perspective gives very unintuitive results - just keep the same perspective in that case.
      startUnit = getUnit(startValue);
      endUnit = getUnit(endValue);
      startNum = startUnit !== endUnit ? _convertToUnit(target, p, startValue, endUnit) : parseFloat(startValue);
      endNum = parseFloat(endValue);
      plugin._pt = new PropTween(plugin._pt, endCache, p, startNum, endNum - startNum, _renderCSSProp);
      plugin._pt.u = endUnit || 0;

      plugin._props.push(p);
    }
  }

  _assign(endCache, startCache);
}; // handle splitting apart padding, margin, borderWidth, and borderRadius into their 4 components. Firefox, for example, won't report borderRadius correctly - it will only do borderTopLeftRadius and the other corners. We also want to handle paddingTop, marginLeft, borderRightWidth, etc.


_forEachName("padding,margin,Width,Radius", function (name, index) {
  var t = "Top",
      r = "Right",
      b = "Bottom",
      l = "Left",
      props = (index < 3 ? [t, r, b, l] : [t + l, t + r, b + r, b + l]).map(function (side) {
    return index < 2 ? name + side : "border" + side + name;
  });

  _specialProps[index > 1 ? "border" + name : name] = function (plugin, target, property, endValue, tween) {
    var a, vars;

    if (arguments.length < 4) {
      // getter, passed target, property, and unit (from _get())
      a = props.map(function (prop) {
        return _get(plugin, prop, property);
      });
      vars = a.join(" ");
      return vars.split(a[0]).length === 5 ? a[0] : vars;
    }

    a = (endValue + "").split(" ");
    vars = {};
    props.forEach(function (prop, i) {
      return vars[prop] = a[i] = a[i] || a[(i - 1) / 2 | 0];
    });
    plugin.init(target, vars, tween);
  };
});

var CSSPlugin = {
  name: "css",
  register: _initCore,
  targetTest: function targetTest(target) {
    return target.style && target.nodeType;
  },
  init: function init(target, vars, tween, index, targets) {
    var props = this._props,
        style = target.style,
        startAt = tween.vars.startAt,
        startValue,
        endValue,
        endNum,
        startNum,
        type,
        specialProp,
        p,
        startUnit,
        endUnit,
        relative,
        isTransformRelated,
        transformPropTween,
        cache,
        smooth,
        hasPriority,
        inlineProps,
        finalTransformValue;
    _pluginInitted || _initCore(); // we may call init() multiple times on the same plugin instance, like when adding special properties, so make sure we don't overwrite the revert data or inlineProps

    this.styles = this.styles || _getStyleSaver(target);
    inlineProps = this.styles.props;
    this.tween = tween;

    for (p in vars) {
      if (p === "autoRound") {
        continue;
      }

      endValue = vars[p];

      if (_plugins[p] && _checkPlugin(p, vars, tween, index, target, targets)) {
        // plugins
        continue;
      }

      type = typeof endValue;
      specialProp = _specialProps[p];

      if (type === "function") {
        endValue = endValue.call(tween, index, target, targets);
        type = typeof endValue;
      }

      if (type === "string" && ~endValue.indexOf("random(")) {
        endValue = _replaceRandom(endValue);
      }

      if (specialProp) {
        specialProp(this, target, p, endValue, tween) && (hasPriority = 1);
      } else if (p.substr(0, 2) === "--") {
        //CSS variable
        startValue = (getComputedStyle(target).getPropertyValue(p) + "").trim();
        endValue += "";
        _colorExp.lastIndex = 0;

        if (!_colorExp.test(startValue)) {
          // colors don't have units
          startUnit = getUnit(startValue);
          endUnit = getUnit(endValue);
          endUnit ? startUnit !== endUnit && (startValue = _convertToUnit(target, p, startValue, endUnit) + endUnit) : startUnit && (endValue += startUnit);
        }

        this.add(style, "setProperty", startValue, endValue, index, targets, 0, 0, p);
        props.push(p);
        inlineProps.push(p, 0, style[p]);
      } else if (type !== "undefined") {
        if (startAt && p in startAt) {
          // in case someone hard-codes a complex value as the start, like top: "calc(2vh / 2)". Without this, it'd use the computed value (always in px)
          startValue = typeof startAt[p] === "function" ? startAt[p].call(tween, index, target, targets) : startAt[p];
          _isString(startValue) && ~startValue.indexOf("random(") && (startValue = _replaceRandom(startValue));
          getUnit(startValue + "") || startValue === "auto" || (startValue += _config.units[p] || getUnit(_get(target, p)) || ""); // for cases when someone passes in a unitless value like {x: 100}; if we try setting translate(100, 0px) it won't work.

          (startValue + "").charAt(1) === "=" && (startValue = _get(target, p)); // can't work with relative values
        } else {
          startValue = _get(target, p);
        }

        startNum = parseFloat(startValue);
        relative = type === "string" && endValue.charAt(1) === "=" && endValue.substr(0, 2);
        relative && (endValue = endValue.substr(2));
        endNum = parseFloat(endValue);

        if (p in _propertyAliases) {
          if (p === "autoAlpha") {
            //special case where we control the visibility along with opacity. We still allow the opacity value to pass through and get tweened.
            if (startNum === 1 && _get(target, "visibility") === "hidden" && endNum) {
              //if visibility is initially set to "hidden", we should interpret that as intent to make opacity 0 (a convenience)
              startNum = 0;
            }

            inlineProps.push("visibility", 0, style.visibility);

            _addNonTweeningPT(this, style, "visibility", startNum ? "inherit" : "hidden", endNum ? "inherit" : "hidden", !endNum);
          }

          if (p !== "scale" && p !== "transform") {
            p = _propertyAliases[p];
            ~p.indexOf(",") && (p = p.split(",")[0]);
          }
        }

        isTransformRelated = p in _transformProps; //--- TRANSFORM-RELATED ---

        if (isTransformRelated) {
          this.styles.save(p);
          finalTransformValue = endValue; // this is always the same as endValue except when it's a var(--) value, in which case we need to calculate the end value.

          if (type === "string" && endValue.substring(0, 6) === "var(--") {
            endValue = _getComputedProperty(target, endValue.substring(4, endValue.indexOf(")")));

            if (endValue.substring(0, 5) === "calc(") {
              var origPerspective = target.style.perspective;
              target.style.perspective = endValue;
              endValue = _getComputedProperty(target, "perspective");
              origPerspective ? target.style.perspective = origPerspective : _removeProperty(target, "perspective");
            }

            endNum = parseFloat(endValue);
          }

          if (!transformPropTween) {
            cache = target._gsap;
            cache.renderTransform && !vars.parseTransform || _parseTransform(target, vars.parseTransform); // if, for example, gsap.set(... {transform:"translateX(50vw)"}), the _get() call doesn't parse the transform, thus cache.renderTransform won't be set yet so force the parsing of the transform here.

            smooth = vars.smoothOrigin !== false && cache.smooth;
            transformPropTween = this._pt = new PropTween(this._pt, style, _transformProp, 0, 1, cache.renderTransform, cache, 0, -1); //the first time through, create the rendering PropTween so that it runs LAST (in the linked list, we keep adding to the beginning)

            transformPropTween.dep = 1; //flag it as dependent so that if things get killed/overwritten and this is the only PropTween left, we can safely kill the whole tween.
          }

          if (p === "scale") {
            this._pt = new PropTween(this._pt, cache, "scaleY", cache.scaleY, (relative ? _parseRelative(cache.scaleY, relative + endNum) : endNum) - cache.scaleY || 0, _renderCSSProp);
            this._pt.u = 0;
            props.push("scaleY", p);
            p += "X";
          } else if (p === "transformOrigin") {
            inlineProps.push(_transformOriginProp, 0, style[_transformOriginProp]);
            endValue = _convertKeywordsToPercentages(endValue); //in case something like "left top" or "bottom right" is passed in. Convert to percentages.

            if (cache.svg) {
              _applySVGOrigin(target, endValue, 0, smooth, 0, this);
            } else {
              endUnit = parseFloat(endValue.split(" ")[2]) || 0; //handle the zOrigin separately!

              endUnit !== cache.zOrigin && _addNonTweeningPT(this, cache, "zOrigin", cache.zOrigin, endUnit);

              _addNonTweeningPT(this, style, p, _firstTwoOnly(startValue), _firstTwoOnly(endValue));
            }

            continue;
          } else if (p === "svgOrigin") {
            _applySVGOrigin(target, endValue, 1, smooth, 0, this);

            continue;
          } else if (p in _rotationalProperties) {
            _addRotationalPropTween(this, cache, p, startNum, relative ? _parseRelative(startNum, relative + endValue) : endValue);

            continue;
          } else if (p === "smoothOrigin") {
            _addNonTweeningPT(this, cache, "smooth", cache.smooth, endValue);

            continue;
          } else if (p === "force3D") {
            cache[p] = endValue;
            continue;
          } else if (p === "transform") {
            _addRawTransformPTs(this, endValue, target);

            continue;
          }
        } else if (!(p in style)) {
          p = _checkPropPrefix(p) || p;
        }

        if (isTransformRelated || (endNum || endNum === 0) && (startNum || startNum === 0) && !_complexExp.test(endValue) && p in style) {
          startUnit = (startValue + "").substr((startNum + "").length);
          endNum || (endNum = 0); // protect against NaN

          endUnit = getUnit(endValue) || (p in _config.units ? _config.units[p] : startUnit);
          startUnit !== endUnit && (startNum = _convertToUnit(target, p, startValue, endUnit));
          this._pt = new PropTween(this._pt, isTransformRelated ? cache : style, p, startNum, (relative ? _parseRelative(startNum, relative + endNum) : endNum) - startNum, !isTransformRelated && (endUnit === "px" || p === "zIndex") && vars.autoRound !== false ? _renderRoundedCSSProp : _renderCSSProp);
          this._pt.u = endUnit || 0;

          if (isTransformRelated && finalTransformValue !== endValue) {
            this._pt.b = startValue;
            this._pt.e = finalTransformValue;
            this._pt.r = _renderCSSPropWithBeginningAndEnd;
          } else if (startUnit !== endUnit && endUnit !== "%") {
            //when the tween goes all the way back to the beginning, we need to revert it to the OLD/ORIGINAL value (with those units). We record that as a "b" (beginning) property and point to a render method that handles that. (performance optimization)
            this._pt.b = startValue;
            this._pt.r = _renderCSSPropWithBeginning;
          }
        } else if (!(p in style)) {
          if (p in target) {
            //maybe it's not a style - it could be a property added directly to an element in which case we'll try to animate that.
            this.add(target, p, startValue || target[p], relative ? relative + endValue : endValue, index, targets);
          } else if (p !== "parseTransform") {
            _missingPlugin(p, endValue);

            continue;
          }
        } else {
          _tweenComplexCSSString.call(this, target, p, startValue, relative ? relative + endValue : endValue);
        }

        isTransformRelated || (p in style ? inlineProps.push(p, 0, style[p]) : typeof target[p] === "function" ? inlineProps.push(p, 2, target[p]()) : inlineProps.push(p, 1, startValue || target[p]));
        props.push(p);
      }
    }

    hasPriority && _sortPropTweensByPriority(this);
  },
  render: function render(ratio, data) {
    if (data.tween._time || !_reverting()) {
      var pt = data._pt;

      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }
    } else {
      data.styles.revert();
    }
  },
  get: _get,
  aliases: _propertyAliases,
  getSetter: function getSetter(target, property, plugin) {
    //returns a setter function that accepts target, property, value and applies it accordingly. Remember, properties like "x" aren't as simple as target.style.property = value because they've got to be applied to a proxy object and then merged into a transform string in a renderer.
    var p = _propertyAliases[property];
    p && p.indexOf(",") < 0 && (property = p);
    return property in _transformProps && property !== _transformOriginProp && (target._gsap.x || _get(target, "x")) ? plugin && _recentSetterPlugin === plugin ? property === "scale" ? _setterScale : _setterTransform : (_recentSetterPlugin = plugin || {}) && (property === "scale" ? _setterScaleWithRender : _setterTransformWithRender) : target.style && !_isUndefined(target.style[property]) ? _setterCSSStyle : ~property.indexOf("-") ? _setterCSSProp : _getSetter(target, property);
  },
  core: {
    _removeProperty: _removeProperty,
    _getMatrix: _getMatrix
  }
};
gsap.utils.checkPrefix = _checkPropPrefix;
gsap.core.getStyleSaver = _getStyleSaver;

(function (positionAndScale, rotation, others, aliases) {
  var all = _forEachName(positionAndScale + "," + rotation + "," + others, function (name) {
    _transformProps[name] = 1;
  });

  _forEachName(rotation, function (name) {
    _config.units[name] = "deg";
    _rotationalProperties[name] = 1;
  });

  _propertyAliases[all[13]] = positionAndScale + "," + rotation;

  _forEachName(aliases, function (name) {
    var split = name.split(":");
    _propertyAliases[split[1]] = all[split[0]];
  });
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");

_forEachName("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function (name) {
  _config.units[name] = "px";
});

gsap.registerPlugin(CSSPlugin);

var gsapWithCSS = gsap.registerPlugin(CSSPlugin) || gsap;
    // to protect from tree shaking
gsapWithCSS.core.Tween;

/*!
 * @gsap/react 2.1.2
 * https://gsap.com
 *
 * Copyright 2008-2025, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license or for
 * Club GSAP members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/
/* eslint-disable */

let useIsomorphicLayoutEffect = typeof document !== "undefined" ? react.useLayoutEffect : react.useEffect,
    isConfig = value => value && !Array.isArray(value) && typeof(value) === "object",
    emptyArray = [],
    defaultConfig = {},
    _gsap = gsapWithCSS; // accommodates situations where different versions of GSAP may be loaded, so a user can gsap.registerPlugin(useGSAP);

const useGSAP = (callback, dependencies = emptyArray) => {
  let config = defaultConfig;
  if (isConfig(callback)) {
    config = callback;
    callback = null;
    dependencies = "dependencies" in config ? config.dependencies : emptyArray;
  } else if (isConfig(dependencies)) {
    config = dependencies;
    dependencies = "dependencies" in config ? config.dependencies : emptyArray;
  }
  (callback && typeof callback !== "function") && console.warn("First parameter must be a function or config object");
  const { scope, revertOnUpdate } = config,
        mounted = react.useRef(false),
        context = react.useRef(_gsap.context(() => { }, scope)),
        contextSafe = react.useRef((func) => context.current.add(null, func)),
        deferCleanup = dependencies && dependencies.length && !revertOnUpdate;
  deferCleanup && useIsomorphicLayoutEffect(() => {
    mounted.current = true;
    return () => context.current.revert();
  }, emptyArray);
  useIsomorphicLayoutEffect(() => {
    callback && context.current.add(callback, scope);
    if (!deferCleanup || !mounted.current) { // React renders bottom-up, thus there could be hooks with dependencies that run BEFORE the component mounts, thus cleanup wouldn't occur since a hook with an empty dependency Array would only run once the component mounts.
      return () => context.current.revert();
    }
  }, dependencies);
  return { context: context.current, contextSafe: contextSafe.current };
};
useGSAP.register = core => { _gsap = core; };
useGSAP.headless = true; // doesn't require the window to be registered.

/**
 * Particle Configuration
 *
 * Single source of truth for all particle type configurations.
 */
/**
 * Configuration for each particle type
 */
const PARTICLE_CONFIGS = {
    heart: {
        lifetime: 2,
        gravity: -100, // floats up
        initialVelocity: {
            x: { min: -30, max: 30 },
            y: { min: -80, max: -120 },
        },
        initialScale: { min: 0.5, max: 0.8 },
        rotationSpeed: { min: -45, max: 45 },
        fadeStart: 0.6,
    },
    sparkle: {
        lifetime: 1.5,
        gravity: -50,
        initialVelocity: {
            x: { min: -50, max: 50 },
            y: { min: -60, max: -100 },
        },
        initialScale: { min: 0.5, max: 0.9 },
        rotationSpeed: { min: -180, max: 180 },
        fadeStart: 0.5,
    },
    sweat: {
        lifetime: 1.2,
        gravity: 150, // falls down
        initialVelocity: {
            x: { min: -20, max: 20 },
            y: { min: 0, max: 20 },
        },
        initialScale: { min: 0.4, max: 0.6 },
        rotationSpeed: { min: 0, max: 0 },
        fadeStart: 0.7,
    },
    zzz: {
        lifetime: 2.5,
        gravity: -30, // floats up slowly
        initialVelocity: {
            x: { min: 10, max: 30 },
            y: { min: -40, max: -60 },
        },
        initialScale: { min: 0.6, max: 0.9 },
        rotationSpeed: { min: -20, max: 20 },
        fadeStart: 0.7,
    },
    confetti: {
        lifetime: 3.0,
        gravity: 250, // falls with gravity
        initialVelocity: {
            x: { min: -150, max: 150 },
            y: { min: -300, max: -150 },
        },
        initialScale: { min: 0.6, max: 1.2 },
        rotationSpeed: { min: -360, max: 360 },
        fadeStart: 0.8,
    },
};

/**
 * Canvas-based particle system for Anty
 * Uses GSAP ticker for 60fps rendering
 */
const AntyParticleCanvas = react.forwardRef(({ particles, width = 400, height = 400, sizeScale = 1 }, ref) => {
    const canvasRef = react.useRef(null);
    const particlesRef = react.useRef(particles);
    const [searchGlowActive, setSearchGlowActive] = react.useState(false);
    // Update particles ref when prop changes
    react.useEffect(() => {
        particlesRef.current = particles;
    }, [particles]);
    // Expose spawn method to parent
    react.useImperativeHandle(ref, () => ({
        spawnParticle: (type, x, y, color) => {
            const config = PARTICLE_CONFIGS[type];
            const timestamp = Date.now();
            const random = Math.random();
            // Scale initial velocities with sizeScale
            const newParticle = {
                id: `${type}-${timestamp}-${random}`,
                type,
                x,
                y,
                vx: gsapWithCSS.utils.random(config.initialVelocity.x.min, config.initialVelocity.x.max) * sizeScale,
                vy: gsapWithCSS.utils.random(config.initialVelocity.y.min, config.initialVelocity.y.max) * sizeScale,
                scale: gsapWithCSS.utils.random(config.initialScale.min, config.initialScale.max),
                rotation: 0,
                rotationSpeed: gsapWithCSS.utils.random(config.rotationSpeed.min, config.rotationSpeed.max),
                opacity: 1,
                life: 1,
                color: color || getParticleColor(type),
            };
            particlesRef.current = [...particlesRef.current, newParticle];
        },
        showSearchGlow: () => {
            setSearchGlowActive(true);
        },
        hideSearchGlow: () => {
            setSearchGlowActive(false);
        },
    }));
    // Setup canvas rendering with GSAP ticker
    react.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        // High DPI canvas setup
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);
        // Render loop using GSAP ticker
        const updateParticles = (time, deltaTime) => {
            // Clear canvas
            ctx.clearRect(0, 0, width, height);
            // Draw search glow if active (behind particles)
            if (searchGlowActive) {
                const centerX = width / 2;
                const centerY = height / 2;
                const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 500);
                gradient.addColorStop(0, 'rgba(229, 237, 255, 0.5)');
                gradient.addColorStop(0.4, 'rgba(229, 237, 255, 0.3)');
                gradient.addColorStop(0.7, 'rgba(229, 237, 255, 0.15)');
                gradient.addColorStop(1, 'rgba(229, 237, 255, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
            }
            // Update and draw particles
            const dt = deltaTime / 1000;
            const alive = [];
            for (let i = 0; i < particlesRef.current.length; i++) {
                const updated = updateParticle(particlesRef.current[i], dt, sizeScale);
                if (updated.life > 0) {
                    alive.push(updated);
                    drawParticle(ctx, updated, sizeScale);
                }
            }
            particlesRef.current = alive;
            if (particlesRef.current.length > 150) {
                console.warn(`[PARTICLES] High particle count: ${particlesRef.current.length}`);
            }
        };
        gsapWithCSS.ticker.add(updateParticles);
        return () => {
            gsapWithCSS.ticker.remove(updateParticles);
        };
    }, [width, height, searchGlowActive, sizeScale]);
    return (jsxRuntime.jsx("canvas", { ref: canvasRef, style: {
            position: 'absolute',
            pointerEvents: 'none',
            width,
            height,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
        } }));
});
AntyParticleCanvas.displayName = 'AntyParticleCanvas';
/**
 * Update particle physics
 */
function updateParticle(particle, dt, sizeScale) {
    const config = PARTICLE_CONFIGS[particle.type];
    // Scale gravity and velocities with sizeScale
    const scaledGravity = config.gravity * sizeScale;
    const newVy = particle.vy + scaledGravity * dt;
    const newX = particle.x + particle.vx * dt;
    const newY = particle.y + particle.vy * dt;
    const newRotation = particle.rotation + particle.rotationSpeed * dt;
    const lifeDecay = dt / config.lifetime;
    const newLife = Math.max(0, particle.life - lifeDecay);
    let newOpacity = particle.opacity;
    if (newLife < config.fadeStart) {
        newOpacity = newLife / config.fadeStart;
    }
    return {
        ...particle,
        x: newX,
        y: newY,
        vx: particle.vx,
        vy: newVy,
        rotation: newRotation,
        rotationSpeed: particle.rotationSpeed,
        opacity: newOpacity,
        life: newLife,
    };
}
/**
 * Draw particle on canvas
 */
function drawParticle(ctx, particle, sizeScale) {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate((particle.rotation * Math.PI) / 180);
    ctx.scale(particle.scale * sizeScale, particle.scale * sizeScale);
    ctx.globalAlpha = particle.opacity;
    ctx.fillStyle = particle.color || '#ff0000';
    switch (particle.type) {
        case 'heart':
            drawHeart(ctx);
            break;
        case 'sparkle':
            drawSparkle(ctx);
            break;
        case 'sweat':
            drawCircle(ctx, 8, '#87ceeb');
            break;
        case 'zzz':
            drawZzz(ctx);
            break;
        case 'confetti':
            drawConfetti(ctx, particle);
            break;
    }
    ctx.restore();
}
function drawCircle(ctx, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
}
function drawHeart(ctx) {
    ctx.fillStyle = '#ff69b4';
    ctx.beginPath();
    ctx.arc(-5, -5, 5, 0, Math.PI * 2);
    ctx.arc(5, -5, 5, 0, Math.PI * 2);
    ctx.lineTo(0, 8);
    ctx.closePath();
    ctx.fill();
}
function drawSparkle(ctx) {
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const x = Math.cos(angle) * 10;
        const y = Math.sin(angle) * 10;
        if (i === 0)
            ctx.moveTo(x, y);
        else
            ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
}
function drawZzz(ctx) {
    ctx.fillStyle = '#9370db';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Z', 0, 0);
}
function drawConfetti(ctx, particle) {
    ctx.fillStyle = particle.color || '#ffd700';
    const isSquare = particle.id.charCodeAt(0) % 2 === 0;
    if (isSquare) {
        ctx.fillRect(-6, -6, 12, 12);
    }
    else {
        ctx.fillRect(-8, -4, 16, 8);
    }
}
function getParticleColor(type) {
    switch (type) {
        case 'heart':
            return '#ff69b4';
        case 'sparkle':
            return '#ffd700';
        case 'sweat':
            return '#87ceeb';
        case 'zzz':
            return '#9370db';
        case 'confetti':
            const colors = ['#FF6B9D', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA',
                '#FCBAD3', '#FFE66D', '#A8DADC', '#F1C40F', '#3498DB'];
            return colors[Math.floor(Math.random() * colors.length)];
        default:
            return '#ff0000';
    }
}

/**
 * Animation System Types
 *
 * Type definitions for the Anty animation system.
 * Provides strict typing for animation states, emotions, and configurations.
 */
/**
 * Animation state machine states
 */
exports.AnimationState = void 0;
(function (AnimationState) {
    /** Default idle state with ambient animations */
    AnimationState["IDLE"] = "IDLE";
    /** Playing an emotion animation */
    AnimationState["EMOTION"] = "EMOTION";
    /** Transitioning between states */
    AnimationState["TRANSITION"] = "TRANSITION";
    /** Morphing between shapes/forms */
    AnimationState["MORPH"] = "MORPH";
    /** Responding to user interaction */
    AnimationState["INTERACTION"] = "INTERACTION";
    /** Powered off state */
    AnimationState["OFF"] = "OFF";
})(exports.AnimationState || (exports.AnimationState = {}));
/**
 * Type guard to check if a value is a valid emotion
 */
function isEmotionType(value) {
    // Legacy alias support
    if (value === 'idea')
        return true; // 'idea' was renamed to 'jump'
    const emotions = [
        'happy',
        'sad',
        'angry',
        'shocked',
        'excited',
        'celebrate', // Level 4 positive
        'pleased', // Level 2 positive
        'spin',
        'jump',
        'idea',
        'back-forth',
        'look-around',
        'wink',
        'nod',
        'headshake',
        'look-left',
        'look-right',
        'super',
        'smize',
    ];
    return emotions.includes(value);
}
/**
 * Default search bar configuration
 * These values produce the current polished look
 */
const DEFAULT_SEARCH_BAR_CONFIG = {
    width: 642,
    height: 70,
    borderRadius: 10,
    innerRadius: 8,
    bracketScale: 0.14,
    borderWidth: 2.75,
};

// Inline Kbd component (no external dependencies)
function Kbd({ children, style }) {
    return (jsxRuntime.jsx("kbd", { style: {
            backgroundColor: '#f4f4f5',
            color: '#71717a',
            pointerEvents: 'none',
            display: 'inline-flex',
            height: '20px',
            minWidth: '20px',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            borderRadius: '4px',
            padding: '0 4px',
            fontFamily: 'sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            userSelect: 'none',
            ...style,
        }, children: children }));
}
function AntySearchBar({ active, value, onChange, inputRef, barRef, borderRef, borderGradientRef, placeholderRef, kbdRef, glowRef, config = DEFAULT_SEARCH_BAR_CONFIG, placeholder = 'Search...', keyboardShortcut, }) {
    // Only hide placeholder when there's actual text typed
    const showPlaceholder = !value;
    // Extract config values
    const { width, height, borderRadius, innerRadius, borderWidth } = config;
    // Default height for content area (input stays at standard size)
    const defaultHeight = DEFAULT_SEARCH_BAR_CONFIG.height;
    // Calculate if we should center content or top-align
    // Single line height ~= font size (17.85px) + padding (~24px top/bottom) ≈ 65px
    // If bar is tall enough for 2+ lines, top-align; otherwise center
    const singleLineThreshold = 90; // px - anything above this is considered multi-line capable
    const isMultiLineHeight = height > singleLineThreshold;
    const contentTopPadding = 2; // px - top padding when top-aligned
    return (jsxRuntime.jsxs("div", { ref: barRef, style: {
            position: 'absolute',
            width: `${width}px`,
            height: `${height}px`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0, // GSAP controls opacity
            pointerEvents: active ? 'auto' : 'none',
            zIndex: 2,
        }, children: [jsxRuntime.jsx("div", { ref: glowRef, style: {
                    position: 'absolute',
                    width: `${width * 0.92}px`,
                    height: `${height * 1.8}px`, // Taller to create elongated ellipse effect
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0, // GSAP controls opacity and animation
                    zIndex: -1,
                    background: 'radial-gradient(ellipse 100% 50%, rgba(147, 197, 253, 0.5) 0%, rgba(167, 139, 250, 0.4) 30%, rgba(229, 237, 255, 0.2) 60%, transparent 85%)',
                    filter: 'blur(50px)',
                    pointerEvents: 'none',
                } }), jsxRuntime.jsx("div", { ref: borderGradientRef, style: {
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    borderRadius: `${borderRadius}px`,
                    padding: `${borderWidth}px`,
                    background: 'linear-gradient(white, white) padding-box, conic-gradient(from 0deg, #E5EDFF 0%, #C7D2FE 25%, #D8B4FE 50%, #C7D2FE 75%, #E5EDFF 100%) border-box',
                    border: `${borderWidth}px solid transparent`,
                    opacity: 0, // GSAP controls opacity
                }, children: jsxRuntime.jsx("div", { ref: borderRef, style: {
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'white',
                        borderRadius: `${innerRadius}px`,
                    }, children: jsxRuntime.jsxs("div", { style: {
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            height: `${defaultHeight - borderWidth * 2}px`,
                            ...(isMultiLineHeight
                                ? { top: `${contentTopPadding}px` }
                                : { top: '50%', transform: 'translateY(-50%)' }),
                        }, children: [jsxRuntime.jsx("div", { ref: placeholderRef, style: {
                                    position: 'absolute',
                                    left: '24px',
                                    top: 0,
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                    opacity: showPlaceholder ? 1 : 0,
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: 500,
                                    fontSize: '17.85px',
                                    color: '#D4D3D3',
                                    transition: showPlaceholder ? 'none' : 'opacity 0.15s ease-out',
                                }, children: placeholder }), jsxRuntime.jsx("div", { ref: kbdRef, style: {
                                    position: 'absolute',
                                    right: '24px',
                                    top: 0,
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                    opacity: showPlaceholder ? 1 : 0,
                                    transition: showPlaceholder ? 'none' : 'opacity 0.15s ease-out',
                                }, children: keyboardShortcut && (jsxRuntime.jsx(Kbd, { style: { fontSize: '12px', color: '#9ca3af' }, children: keyboardShortcut })) }), jsxRuntime.jsx("input", { ref: inputRef, type: "text", value: value, onChange: (e) => onChange(e.target.value), placeholder: "" // Empty placeholder since we use fake one
                                , style: {
                                    width: '100%',
                                    height: '100%',
                                    padding: '0 24px',
                                    backgroundColor: 'transparent',
                                    outline: 'none',
                                    border: 'none',
                                    color: '#052333',
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: 500,
                                    fontSize: '17.85px',
                                } })] }) }) })] }));
}

/**
 * Feature Flags for Animation System
 *
 * This module controls debug logging and other animation features.
 */
/**
 * Enable verbose logging for animation system transitions.
 */
const ENABLE_ANIMATION_DEBUG_LOGS = process.env.NODE_ENV === 'development';
/**
 * Log animation system startup information.
 */
function logAnimationSystemInfo() {
    if (!ENABLE_ANIMATION_DEBUG_LOGS)
        return;
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║ 🎬 Animation System Status                                    ║
╠═══════════════════════════════════════════════════════════════╣
║ Active System: AnimationController                            ║
║ Debug Logs:    ${ENABLE_ANIMATION_DEBUG_LOGS ? 'ENABLED'.padEnd(43) : 'DISABLED'.padEnd(43)} ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}
/**
 * Log an animation system event (respects debug flag).
 */
function logAnimationEvent(event, details) {
    if (!ENABLE_ANIMATION_DEBUG_LOGS)
        return;
    const detailsStr = details ? ` ${JSON.stringify(details)}` : '';
    console.log(`🎬 [AnimationController] ${event}${detailsStr}`);
}

/**
 * Animation State Machine
 *
 * Validates state transitions and enforces state transition rules.
 * Prevents invalid transitions and provides debugging information.
 */
/**
 * Priority levels for different animation states
 */
const STATE_PRIORITIES = {
    [exports.AnimationState.OFF]: 0, // Lowest - can be interrupted by anything
    [exports.AnimationState.IDLE]: 1, // Low - should be interrupted by most things
    [exports.AnimationState.TRANSITION]: 2, // Medium - brief transitions
    [exports.AnimationState.MORPH]: 2, // Medium - morphing animations
    [exports.AnimationState.INTERACTION]: 3, // High - user interactions are important
    [exports.AnimationState.EMOTION]: 4, // Highest - emotional expressions complete fully
};
/**
 * Valid state transition rules
 */
const TRANSITION_RULES = [
    // From IDLE
    { from: exports.AnimationState.IDLE, to: exports.AnimationState.IDLE, allowed: true, priority: 1 },
    { from: exports.AnimationState.IDLE, to: exports.AnimationState.TRANSITION, allowed: true, priority: 2 },
    { from: exports.AnimationState.IDLE, to: exports.AnimationState.MORPH, allowed: true, priority: 2 },
    { from: exports.AnimationState.IDLE, to: exports.AnimationState.EMOTION, allowed: true, priority: 4 },
    { from: exports.AnimationState.IDLE, to: exports.AnimationState.INTERACTION, allowed: true, priority: 3 },
    { from: exports.AnimationState.IDLE, to: exports.AnimationState.OFF, allowed: true, priority: 0 },
    // From TRANSITION
    { from: exports.AnimationState.TRANSITION, to: exports.AnimationState.IDLE, allowed: true, priority: 1 },
    { from: exports.AnimationState.TRANSITION, to: exports.AnimationState.TRANSITION, allowed: true, priority: 2 },
    { from: exports.AnimationState.TRANSITION, to: exports.AnimationState.MORPH, allowed: true, priority: 2 },
    { from: exports.AnimationState.TRANSITION, to: exports.AnimationState.EMOTION, allowed: true, priority: 4 },
    { from: exports.AnimationState.TRANSITION, to: exports.AnimationState.INTERACTION, allowed: true, priority: 3 },
    { from: exports.AnimationState.TRANSITION, to: exports.AnimationState.OFF, allowed: true, priority: 0 },
    // From MORPH
    { from: exports.AnimationState.MORPH, to: exports.AnimationState.IDLE, allowed: true, priority: 1 },
    { from: exports.AnimationState.MORPH, to: exports.AnimationState.TRANSITION, allowed: true, priority: 2 },
    { from: exports.AnimationState.MORPH, to: exports.AnimationState.MORPH, allowed: true, priority: 2 },
    { from: exports.AnimationState.MORPH, to: exports.AnimationState.EMOTION, allowed: true, priority: 4 },
    { from: exports.AnimationState.MORPH, to: exports.AnimationState.INTERACTION, allowed: true, priority: 3 },
    { from: exports.AnimationState.MORPH, to: exports.AnimationState.OFF, allowed: true, priority: 0 },
    // From EMOTION
    { from: exports.AnimationState.EMOTION, to: exports.AnimationState.IDLE, allowed: true, priority: 1 },
    { from: exports.AnimationState.EMOTION, to: exports.AnimationState.TRANSITION, allowed: true, priority: 2 },
    { from: exports.AnimationState.EMOTION, to: exports.AnimationState.MORPH, allowed: true, priority: 2 },
    { from: exports.AnimationState.EMOTION, to: exports.AnimationState.EMOTION, allowed: true, priority: 4 },
    { from: exports.AnimationState.EMOTION, to: exports.AnimationState.INTERACTION, allowed: false, priority: 3 }, // Emotions should complete
    { from: exports.AnimationState.EMOTION, to: exports.AnimationState.OFF, allowed: true, priority: 0 },
    // From INTERACTION
    { from: exports.AnimationState.INTERACTION, to: exports.AnimationState.IDLE, allowed: true, priority: 1 },
    { from: exports.AnimationState.INTERACTION, to: exports.AnimationState.TRANSITION, allowed: true, priority: 2 },
    { from: exports.AnimationState.INTERACTION, to: exports.AnimationState.MORPH, allowed: true, priority: 2 },
    { from: exports.AnimationState.INTERACTION, to: exports.AnimationState.EMOTION, allowed: true, priority: 4 },
    { from: exports.AnimationState.INTERACTION, to: exports.AnimationState.INTERACTION, allowed: true, priority: 3 },
    { from: exports.AnimationState.INTERACTION, to: exports.AnimationState.OFF, allowed: true, priority: 0 },
    // From OFF
    { from: exports.AnimationState.OFF, to: exports.AnimationState.IDLE, allowed: true, priority: 1 },
    { from: exports.AnimationState.OFF, to: exports.AnimationState.TRANSITION, allowed: true, priority: 2 },
    { from: exports.AnimationState.OFF, to: exports.AnimationState.MORPH, allowed: true, priority: 2 },
    { from: exports.AnimationState.OFF, to: exports.AnimationState.EMOTION, allowed: true, priority: 4 },
    { from: exports.AnimationState.OFF, to: exports.AnimationState.INTERACTION, allowed: true, priority: 3 },
    { from: exports.AnimationState.OFF, to: exports.AnimationState.OFF, allowed: true, priority: 0 },
];
class StateMachine {
    constructor(enableLogging = false) {
        this.currentState = exports.AnimationState.IDLE;
        this.previousState = null;
        this.stateHistory = [];
        this.maxHistorySize = 50;
        this.enableLogging = enableLogging;
        this.recordStateChange(exports.AnimationState.IDLE);
    }
    /**
     * Get current state
     */
    getCurrentState() {
        return this.currentState;
    }
    /**
     * Get previous state
     */
    getPreviousState() {
        return this.previousState;
    }
    /**
     * Check if a transition is allowed
     */
    canTransition(from, to) {
        const rule = TRANSITION_RULES.find(r => r.from === from && r.to === to);
        return rule ? rule.allowed : false;
    }
    /**
     * Get priority for a state
     */
    getPriority(state) {
        return STATE_PRIORITIES[state];
    }
    /**
     * Check if target state can interrupt current state based on priority
     */
    canInterrupt(targetState, force = false) {
        if (force)
            return true;
        const currentPriority = this.getPriority(this.currentState);
        const targetPriority = this.getPriority(targetState);
        // Higher priority can interrupt lower priority
        // Equal priority can interrupt (e.g., emotion -> emotion)
        return targetPriority >= currentPriority;
    }
    /**
     * Attempt to transition to a new state
     * Returns true if successful, false if invalid
     */
    transition(to, force = false) {
        const from = this.currentState;
        // Check if transition is allowed
        if (!this.canTransition(from, to)) {
            if (this.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.warn(`[StateMachine] Invalid transition: ${from} → ${to}`);
            }
            return false;
        }
        // Check priority
        if (!this.canInterrupt(to, force)) {
            if (this.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.warn(`[StateMachine] Cannot interrupt: ${from} (priority ${this.getPriority(from)}) with ${to} (priority ${this.getPriority(to)})`);
            }
            return false;
        }
        // Perform transition
        this.previousState = from;
        this.currentState = to;
        this.recordStateChange(to);
        if (this.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log(`[StateMachine] Transition: ${from} → ${to}`);
        }
        return true;
    }
    /**
     * Record state change in history
     */
    recordStateChange(state) {
        this.stateHistory.push({
            state,
            timestamp: Date.now(),
        });
        // Keep history size manageable
        if (this.stateHistory.length > this.maxHistorySize) {
            this.stateHistory.shift();
        }
    }
    /**
     * Get state history
     */
    getHistory() {
        return [...this.stateHistory];
    }
    /**
     * Get recent state changes (last N)
     */
    getRecentHistory(count = 10) {
        return this.stateHistory.slice(-count);
    }
    /**
     * Reset state machine to idle
     */
    reset() {
        this.previousState = this.currentState;
        this.currentState = exports.AnimationState.IDLE;
        this.recordStateChange(exports.AnimationState.IDLE);
        if (this.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log('[StateMachine] Reset to idle');
        }
    }
    /**
     * Get debug info
     */
    getDebugInfo() {
        const now = Date.now();
        const recentHistory = this.getRecentHistory(5).map(entry => ({
            ...entry,
            ago: `${((now - entry.timestamp) / 1000).toFixed(1)}s ago`,
        }));
        return {
            currentState: this.currentState,
            previousState: this.previousState,
            currentPriority: this.getPriority(this.currentState),
            historySize: this.stateHistory.length,
            recentHistory,
        };
    }
    /**
     * Validate transition rules (for testing)
     */
    static validateRules() {
        const states = Object.values(exports.AnimationState);
        let valid = true;
        // Check that every state has a rule for every possible transition
        states.forEach(from => {
            states.forEach(to => {
                const rule = TRANSITION_RULES.find(r => r.from === from && r.to === to);
                if (!rule) {
                    console.error(`Missing transition rule: ${from} → ${to}`);
                    valid = false;
                }
            });
        });
        return valid;
    }
}

/**
 * Animation Controller
 *
 * Main controller using Finite State Machine pattern.
 * Manages animation state, prevents conflicts, queues animations,
 * and guarantees idle always restarts.
 *
 * REFACTORED: Removed ElementRegistry and DebugTracker dependencies.
 * These were overengineered - element locking always used force=true anyway.
 */
class AnimationController {
    constructor(callbacks = {}, config = {}) {
        // Timeline tracking
        this.activeTimelines = new Map();
        this.idleTimeline = null;
        this.blinkControls = null;
        // Animation queue
        this.queue = [];
        this.isProcessingQueue = false;
        // State tracking
        this.currentEmotion = null;
        this.isIdleActive = false;
        this.idlePrevented = false; // Prevents auto-restart of idle (set by pauseIdle)
        // Super mode scale (when set, preserves scale during emotions)
        this.superModeScale = null;
        this.callbacks = callbacks;
        this.config = {
            enableLogging: config.enableLogging ?? false,
            enableQueue: config.enableQueue ?? true,
            maxQueueSize: config.maxQueueSize ?? 10,
            defaultPriority: config.defaultPriority ?? 2,
        };
        this.stateMachine = new StateMachine(this.config.enableLogging);
        if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log('[AnimationController] Initialized', this.config);
        }
    }
    /**
     * Get current state
     */
    getCurrentState() {
        return this.stateMachine.getCurrentState();
    }
    /**
     * Get current emotion
     */
    getCurrentEmotion() {
        return this.currentEmotion;
    }
    /**
     * Check if idle is currently active (started but may be paused)
     */
    isIdle() {
        return this.isIdleActive;
    }
    /**
     * Check if idle is actively playing (not paused)
     */
    isIdlePlaying() {
        return this.isIdleActive && this.idleTimeline !== null && this.idleTimeline.isActive();
    }
    /**
     * Start idle animation
     */
    startIdle(timeline, _elements, blinkControls) {
        if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log('[AnimationController] Starting idle animation');
        }
        // Transition to idle state
        if (!this.stateMachine.transition(exports.AnimationState.IDLE)) {
            if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.warn('[AnimationController] Failed to transition to idle');
            }
            return;
        }
        // Kill existing idle timeline and blink scheduler
        if (this.idleTimeline) {
            this.idleTimeline.kill();
        }
        if (this.blinkControls) {
            this.blinkControls.killBlinks();
        }
        // Store timeline and blink controls
        this.idleTimeline = timeline;
        this.blinkControls = blinkControls || null;
        this.isIdleActive = true;
        this.currentEmotion = null;
        // Setup callbacks
        timeline.eventCallback('onComplete', () => {
            if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.log('[AnimationController] Idle animation completed, restarting');
            }
            // Idle should always restart
            this.isIdleActive = false;
            this.callbacks.onComplete?.(exports.AnimationState.IDLE);
        });
        this.callbacks.onStart?.(exports.AnimationState.IDLE);
    }
    /**
     * Pause idle animation (and blink scheduler)
     * Also prevents auto-restart of idle until resumeIdle() is called
     */
    pauseIdle() {
        this.idlePrevented = true; // Prevent auto-restart
        if (this.idleTimeline && this.idleTimeline.isActive()) {
            this.idleTimeline.pause();
        }
        // Pause blinks - this kills the pending timer entirely
        if (this.blinkControls) {
            this.blinkControls.pauseBlinks();
        }
        if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log('[AnimationController] Paused idle animation and blink scheduler (auto-restart prevented)');
        }
    }
    /**
     * Resume idle animation (and blink scheduler)
     * Also allows auto-restart of idle again
     */
    resumeIdle() {
        this.idlePrevented = false; // Allow auto-restart again
        if (this.idleTimeline && !this.idleTimeline.isActive()) {
            this.idleTimeline.resume();
        }
        // Resume blinks - schedules a fresh random delay
        if (this.blinkControls) {
            this.blinkControls.resumeBlinks();
        }
        if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log('[AnimationController] Resumed idle animation and blink scheduler');
        }
    }
    /**
     * Check if idle auto-restart is prevented
     */
    isIdlePrevented() {
        return this.idlePrevented;
    }
    /**
     * Restart idle animation from origin
     * Use this for a clean handoff after emotions that significantly move the character
     *
     * Uses invalidate() to force GSAP to recapture starting values.
     * This is critical for super mode: the idle timeline uses relative scale (*=1.02),
     * so we need it to recapture the current scale (1.45 in super mode) as the base.
     */
    restartIdle() {
        if (this.idleTimeline) {
            // invalidate() clears cached starting values, forcing recapture on next render
            // This ensures relative scale (*=1.02) works from current scale, not creation-time scale
            this.idleTimeline.invalidate();
            this.idleTimeline.restart();
        }
        // Fresh blink timer
        if (this.blinkControls) {
            this.blinkControls.resumeBlinks();
        }
        if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log('[AnimationController] Restarted idle animation from origin');
        }
    }
    /**
     * Set super mode scale (preserves scale during emotions)
     * @param scale - Scale value (e.g., 1.45) or null to disable
     */
    setSuperMode(scale) {
        this.superModeScale = scale;
        if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log(`[AnimationController] Super mode scale: ${scale}`);
        }
    }
    /**
     * Get current super mode scale
     */
    getSuperModeScale() {
        return this.superModeScale;
    }
    /**
     * Kill idle animation (and blink scheduler)
     */
    killIdle() {
        if (this.idleTimeline) {
            this.idleTimeline.kill();
            this.idleTimeline = null;
        }
        if (this.blinkControls) {
            this.blinkControls.killBlinks();
            this.blinkControls = null;
        }
        this.isIdleActive = false;
        if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log('[AnimationController] Killed idle animation and blink scheduler');
        }
    }
    /**
     * Play an emotion animation
     */
    playEmotion(emotion, timeline, elements, options = {}) {
        const priority = options.priority ?? this.config.defaultPriority;
        const force = options.force ?? false;
        if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log(`[AnimationController] Play emotion: ${emotion} (priority: ${priority})`);
        }
        // Check if we can transition
        if (!this.stateMachine.canInterrupt(exports.AnimationState.EMOTION, force)) {
            // Queue if enabled
            if (this.config.enableQueue) {
                this.enqueue(exports.AnimationState.EMOTION, emotion, () => {
                    this.playEmotion(emotion, timeline, elements, options);
                }, priority);
            }
            return false;
        }
        // Kill any existing emotion timelines before starting new one
        for (const [id, ref] of this.activeTimelines.entries()) {
            if (id.startsWith('emotion-')) {
                if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                    console.log(`[AnimationController] Killing previous emotion: ${id}`);
                }
                // CRITICAL: Manually trigger onInterrupt before killing
                // GSAP's kill() does NOT trigger onInterrupt callback automatically
                const onInterruptCallback = ref.timeline.eventCallback('onInterrupt');
                if (onInterruptCallback) {
                    onInterruptCallback.call(ref.timeline);
                }
                ref.timeline.kill();
                this.activeTimelines.delete(id);
            }
        }
        // Transition to emotion state
        if (!this.stateMachine.transition(exports.AnimationState.EMOTION, force)) {
            if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.warn(`[AnimationController] Failed to transition to emotion: ${emotion}`);
            }
            return false;
        }
        // Pause idle (unless preserveIdle is true for eye-only emotions like smize)
        const preserveIdle = options.preserveIdle ?? false;
        if (!preserveIdle) {
            this.pauseIdle();
        }
        const animationId = `emotion-${emotion}-${Date.now()}`;
        // Store timeline
        this.activeTimelines.set(animationId, {
            timeline,
            element: elements[0],
            state: exports.AnimationState.EMOTION,
            startedAt: Date.now(),
            priority,
            id: animationId,
            emotion,
        });
        this.currentEmotion = emotion;
        // CRITICAL FIX: Pause timeline immediately to prevent auto-play before callbacks are set
        // GSAP timelines auto-play by default, which can cause onStart to fire before callbacks are registered
        timeline.pause();
        // CRITICAL: Capture original callbacks from emotion timeline BEFORE clearing them
        // This preserves eye reset and rotation cleanup logic from emotion-interpreter.ts
        const originalOnStart = timeline.eventCallback('onStart');
        const originalOnComplete = timeline.eventCallback('onComplete');
        const originalOnInterrupt = timeline.eventCallback('onInterrupt');
        // Clear existing callbacks to prevent duplicates
        timeline.eventCallback('onStart', null);
        timeline.eventCallback('onComplete', null);
        timeline.eventCallback('onInterrupt', null);
        // Track if onInterrupt was already called to prevent double-reset
        let interruptHandled = false;
        // Setup callbacks BEFORE playing timeline
        const animationStartTime = Date.now();
        timeline.eventCallback('onStart', () => {
            if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.log(`[AnimationController] Emotion ${emotion} motion START`);
            }
            // Call original onStart callback if it exists
            if (originalOnStart) {
                originalOnStart.call(timeline);
            }
            // Notify that GSAP motion has actually started
            this.callbacks.onEmotionMotionStart?.(emotion, animationId);
        });
        timeline.eventCallback('onComplete', () => {
            const duration = Date.now() - animationStartTime;
            if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.log(`[AnimationController] Emotion ${emotion} completed (${duration}ms)`);
            }
            // Call original onComplete callback FIRST (eye reset, rotation cleanup)
            if (originalOnComplete) {
                originalOnComplete.call(timeline);
            }
            // Cleanup
            this.activeTimelines.delete(animationId);
            // Return to idle (force transition to bypass priority check)
            this.stateMachine.transition(exports.AnimationState.IDLE, true);
            // Handle idle animation based on flags:
            // - preserveIdle: idle was never paused, do nothing
            // - resetIdle=false: resume idle from current position
            // - resetIdle=true (default): restart idle from origin
            if (!preserveIdle) {
                const shouldResetIdle = options.resetIdle !== false;
                if (shouldResetIdle) {
                    this.restartIdle();
                }
                else {
                    this.resumeIdle();
                }
            }
            // Process queue
            this.processQueue();
            // Notify that GSAP motion has actually completed
            this.callbacks.onEmotionMotionComplete?.(emotion, animationId, duration);
            this.callbacks.onComplete?.(exports.AnimationState.EMOTION, emotion);
            options.onComplete?.();
        });
        timeline.eventCallback('onInterrupt', () => {
            // Prevent double-handling
            if (interruptHandled)
                return;
            interruptHandled = true;
            if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.log(`[AnimationController] Emotion ${emotion} interrupted`);
            }
            // Call original onInterrupt callback - this does immediate eye reset
            // (emotion-interpreter.ts sets up onInterrupt to kill pending delays and reset immediately)
            if (originalOnInterrupt) {
                originalOnInterrupt.call(timeline);
            }
            // Cleanup
            this.activeTimelines.delete(animationId);
            this.callbacks.onInterrupt?.(exports.AnimationState.EMOTION, emotion);
        });
        this.callbacks.onStart?.(exports.AnimationState.EMOTION, emotion);
        // CRITICAL: Now play the timeline after all callbacks are set
        timeline.play();
        return true;
    }
    /**
     * Transition to a new state
     */
    transitionTo(state, emotion, timeline, elements, options = {}) {
        const priority = options.priority ?? this.config.defaultPriority;
        const force = options.force ?? false;
        if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log(`[AnimationController] Transition to: ${state}${emotion ? ` / ${emotion}` : ''} (priority: ${priority})`);
        }
        // Check if we can interrupt
        if (!this.stateMachine.canInterrupt(state, force)) {
            if (this.config.enableQueue) {
                this.enqueue(state, emotion, () => {
                    this.transitionTo(state, emotion, timeline, elements, options);
                }, priority);
            }
            return false;
        }
        // Perform transition
        if (!this.stateMachine.transition(state, force)) {
            if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.warn(`[AnimationController] Failed to transition to ${state}`);
            }
            return false;
        }
        // Pause idle if not transitioning to idle
        if (state !== exports.AnimationState.IDLE) {
            this.pauseIdle();
        }
        const animationId = `${state}-${emotion || 'none'}-${Date.now()}`;
        // Store timeline
        this.activeTimelines.set(animationId, {
            timeline,
            element: elements[0],
            state,
            startedAt: Date.now(),
            priority,
            id: animationId,
            emotion: emotion || undefined,
        });
        this.currentEmotion = emotion;
        // Setup callbacks
        timeline.eventCallback('onComplete', () => {
            if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.log(`[AnimationController] ${state}${emotion ? ` / ${emotion}` : ''} completed`);
            }
            // Cleanup
            this.activeTimelines.delete(animationId);
            // Return to idle if not already there (force transition to bypass priority check)
            if (state !== exports.AnimationState.IDLE) {
                this.stateMachine.transition(exports.AnimationState.IDLE, true);
                this.resumeIdle();
            }
            // Process queue
            this.processQueue();
            this.callbacks.onComplete?.(state, emotion || undefined);
            options.onComplete?.();
        });
        this.callbacks.onStart?.(state, emotion || undefined);
        return true;
    }
    /**
     * Kill all active animations
     */
    killAll() {
        if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log('[AnimationController] Killing all animations');
        }
        // Kill all active timelines
        this.activeTimelines.forEach(ref => {
            if (ref.timeline.isActive()) {
                ref.timeline.kill();
            }
        });
        this.activeTimelines.clear();
        // Kill idle
        this.killIdle();
        // Clear queue
        this.queue = [];
        // Reset state
        this.stateMachine.reset();
    }
    /**
     * Enqueue an animation
     */
    enqueue(state, emotion, callback, priority) {
        if (this.queue.length >= this.config.maxQueueSize) {
            if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.warn('[AnimationController] Queue full, dropping oldest item');
            }
            this.queue.shift();
        }
        const animation = {
            id: `queued-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            state,
            emotion: emotion || undefined,
            callback,
            priority,
            queuedAt: Date.now(),
        };
        this.queue.push(animation);
        // Sort by priority (highest first)
        this.queue.sort((a, b) => b.priority - a.priority);
        if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log(`[AnimationController] Queued ${state}${emotion ? `/${emotion}` : ''} (${this.queue.length} in queue)`);
        }
        this.callbacks.onQueueAdd?.(animation);
    }
    /**
     * Process animation queue
     */
    processQueue() {
        if (this.isProcessingQueue || this.queue.length === 0) {
            return;
        }
        this.isProcessingQueue = true;
        const animation = this.queue.shift();
        if (!animation) {
            this.isProcessingQueue = false;
            return;
        }
        if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log(`[AnimationController] Processing queued ${animation.state}${animation.emotion ? `/${animation.emotion}` : ''}`);
        }
        this.callbacks.onQueueProcess?.(animation);
        // Execute callback
        animation.callback();
        this.isProcessingQueue = false;
    }
    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            state: this.stateMachine.getDebugInfo(),
            activeTimelines: this.activeTimelines.size,
            queueSize: this.queue.length,
            isIdleActive: this.isIdleActive,
            currentEmotion: this.currentEmotion,
        };
    }
    /**
     * Cleanup on destroy
     */
    destroy() {
        if (this.config.enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log('[AnimationController] Destroying controller');
        }
        this.killAll();
    }
}

/**
 * Animation Constants for Anty V3
 *
 * This file is the SINGLE SOURCE OF TRUTH for all animation timings,
 * durations, scales, distances, and easing functions in the Anty character system.
 *
 * WARNING: Many of these values are carefully tuned and work in coordination.
 * Changing values marked as CRITICAL may break visual coherence.
 *
 * @module animation/constants
 */
// ============================================================================
// IDLE BREATHING ANIMATIONS
// ============================================================================
/**
 * Idle floating animation - character gently bobs up and down
 *
 * CRITICAL: This duration is synchronized with rotation animation.
 * DO NOT change without updating rotation.duration to match.
 */
const IDLE_FLOAT = {
    /** Vertical floating distance in pixels */
    amplitude: 12,
    /** Animation duration in seconds - MUST match rotation duration */
    duration: 2.5,
    /** GSAP easing function for smooth sine wave motion */
    ease: 'sine.inOut',
};
/**
 * Idle rotation animation - character gently tilts side to side
 *
 * CRITICAL: This is SYNCHRONIZED with floating animation.
 * Both animations share the same duration and ease for visual harmony.
 */
const IDLE_ROTATION = {
    /** Maximum rotation angle in degrees (0° to 2°) */
    degrees: 2.0};
/**
 * Idle breathing scale animation - character subtly expands/contracts
 *
 * This runs independently from float/rotation and is slightly slower
 * to create organic, non-mechanical movement.
 */
const IDLE_BREATHE = {
    /** Maximum scale during breathing cycle */
    scaleMax: 1.02};
// ============================================================================
// SHADOW ANIMATION (INVERSE RELATIONSHIP)
// ============================================================================
/**
 * Shadow animations - inverse relationship with character position
 *
 * CRITICAL INVERSE RELATIONSHIP:
 * When character floats UP, shadow scales DOWN and fades.
 * When character drops DOWN, shadow scales UP and becomes more opaque.
 * Shadow position is FIXED on ground - only scale and opacity animate.
 */
const SHADOW = {
    /** Shadow horizontal scale when character is at apex (floating up) */
    scaleXWhenUp: 0.7,
    /** Shadow vertical scale when character is at apex (floating up) */
    scaleYWhenUp: 0.55,
    /** Shadow horizontal scale when character is at ground (normal) */
    scaleXWhenDown: 1.0,
    /** Shadow vertical scale when character is at ground (normal) */
    scaleYWhenDown: 1.0,
    /** Shadow opacity when character is at ground (normal) */
    opacityWhenDown: 0.7};

/**
 * Eye Shape Definitions
 *
 * All shapes are stored as "left eye" versions (point 0 on left edge).
 * Right eye shapes are generated by mirroring X coordinates.
 *
 * This ensures smooth morphing where points never cross over:
 * - Left eye: point 0 stays on left edge during all morphs
 * - Right eye: point 0 stays on right edge during all morphs
 *
 * All paths use M, C, C, V, C, C, L structure for smooth morphing.
 */
/**
 * Mirror an SVG path horizontally around the center.
 * Transforms all X coordinates: newX = width - oldX
 *
 * This creates a "right eye" version where:
 * - The visual shape is the same (mirrored)
 * - Point indices stay on their respective sides
 * - Morphing between shapes keeps points stable
 */
function mirrorSvgPath(pathData, width) {
    // Regex to match SVG path commands and their parameters
    // Handles: M, L, C, S, Q, T, H, V, Z (and lowercase versions)
    const commandRegex = /([MLCSQTHVZmlcsqthvz])([^MLCSQTHVZmlcsqthvz]*)/g;
    let result = '';
    let match;
    while ((match = commandRegex.exec(pathData)) !== null) {
        const command = match[1];
        const params = match[2].trim();
        // Parse numbers from parameters
        const numbers = params.match(/-?[\d.]+(?:e[+-]?\d+)?/gi)?.map(Number) || [];
        switch (command.toUpperCase()) {
            case 'M': // moveto: x, y
            case 'L': // lineto: x, y
            case 'T': // smooth quadratic: x, y
                if (numbers.length >= 2) {
                    numbers[0] = width - numbers[0]; // Mirror X
                }
                break;
            case 'H': // horizontal line: x
                if (numbers.length >= 1) {
                    numbers[0] = width - numbers[0]; // Mirror X
                }
                break;
            case 'V': // vertical line: y - no X to mirror
                break;
            case 'C': // cubic bezier: x1, y1, x2, y2, x, y
                if (numbers.length >= 6) {
                    numbers[0] = width - numbers[0]; // Mirror x1
                    numbers[2] = width - numbers[2]; // Mirror x2
                    numbers[4] = width - numbers[4]; // Mirror x
                }
                break;
            case 'S': // smooth cubic: x2, y2, x, y
            case 'Q': // quadratic: x1, y1, x, y
                if (numbers.length >= 4) {
                    numbers[0] = width - numbers[0]; // Mirror x1/x2
                    numbers[2] = width - numbers[2]; // Mirror x
                }
                break;
        }
        // Reconstruct the command with mirrored coordinates
        result += command + numbers.join(' ');
    }
    return result;
}
// Cache for mirrored paths (computed once per shape)
const mirroredPathCache = new Map();
/**
 * Get the appropriate eye shape path for a given side.
 *
 * @param shapeName - The base shape name (e.g., 'IDLE', 'ANGRY')
 * @param side - Which eye ('left' uses base path, 'right' uses mirrored path)
 * @returns The SVG path data for that eye
 */
function getEyeShape(shapeName, side) {
    // Special case: OFF shapes are already side-specific
    if (shapeName === 'OFF_LEFT') {
        return EYE_SHAPES.OFF_LEFT;
    }
    if (shapeName === 'OFF_RIGHT') {
        return EYE_SHAPES.OFF_RIGHT;
    }
    const basePath = EYE_SHAPES[shapeName];
    if (side === 'left') {
        return basePath;
    }
    // For right eye, return mirrored path (cached)
    const cacheKey = `${shapeName}_right`;
    if (!mirroredPathCache.has(cacheKey)) {
        const dimensions = EYE_DIMENSIONS[shapeName];
        mirroredPathCache.set(cacheKey, mirrorSvgPath(basePath, dimensions.width));
    }
    return mirroredPathCache.get(cacheKey);
}
/**
 * Get dimensions for an eye shape (same for both sides)
 */
function getEyeDimensions(shapeName) {
    // Special case: OFF shapes
    if (shapeName === 'OFF_LEFT') {
        return EYE_DIMENSIONS.OFF_LEFT;
    }
    if (shapeName === 'OFF_RIGHT') {
        return EYE_DIMENSIONS.OFF_RIGHT;
    }
    return EYE_DIMENSIONS[shapeName];
}
// Base eye shapes (LEFT eye versions - point 0 on left edge)
const EYE_SHAPES = {
    // IDLE - Default tall pill shape (20×45)
    // Base shape that all other eyes morph from/to
    IDLE: "M1.00146e-10 35.5C-2.44505e-05 40.7467 4.47719 45 10.0001 45C15.5229 44.9999 20 40.7467 20 35.5V9.4999C20 4.25325 15.5229 0 10.0001 0C4.47727 0 0.000145614 4.25325 0.000121164 9.49992L1.00146e-10 35.5Z",
    // HAPPY - Shorter with smile curve at bottom (24×29)
    // Same structure as IDLE, bottom curves upward for smile
    HAPPY: "M0 29C0 29 5.37252 26.041 12 26.041C18.62736 26.041 24 29 24 29V11.2406C24 5.0345 18.62748 0 12.00012 0C5.37272 0 0.000175 5.0345 0.000145 11.2407L0 29Z",
    // LOOK - Wider, shorter pill for looking left/right (23×28)
    // Will be positioned left or right in container
    LOOK: "M1.15167e-10 17.36C-2.81181e-05 23.2363 5.14877 28.0001 11.5001 28C17.8513 27.9999 23 23.2363 23 17.36V10.6399C23 4.76364 17.8513 0 11.5001 0C5.14886 0 0.000167456 4.76364 0.000139339 10.6399L1.15167e-10 17.36Z",
    // HALF - Half-height eye with flat bottom (22×28)
    // Used for wink (one eye open, one half)
    HALF: "M0 28C0 28 4.925 28 11 28C17.075 28 22 28 22 28V10.857C22 4.861 17.075 0 11 0C4.925 0 0.00016 4.861 0.00013 10.857L0 28Z",
    // CLOSED - Thin horizontal line for closed eyes (23×8)
    // Used for blink and wink
    CLOSED: "M1.15e-10 4.493C-2.81e-05 6.995 5.14877 6.679 11.5001 6.679C17.8513 6.679 23 6.995 23 4.493V2.199C23 -0.302 17.8513 0.0128 11.5001 0.0128C5.14886 0.0128 0.000167 -0.302 0.000139 2.199L1.15e-10 4.493Z",
    // ANGRY - Flat top, curved bottom for angry brows (36×18)
    // Rotated 20deg in animation for left eye, flipped+rotated for right
    ANGRY: "M1.8e-10 2.147C-4.4e-05 9.482 8.058 18 18 18C27.95 18 36 9.482 36 2.147V0C36 0 27.95 3.857 18 3.857C8.058 3.857 0.000225 2.5e-05 0.000225 2.5e-05L1.8e-10 2.147Z",
    // SAD - Flat top, curved droopy bottom (27×14)
    // Rotated -15deg in animation for left eye, flipped+rotated for right
    SAD: "M1e-10 1.613C-2.9e-05 7.122 6.045 14 13.5 14C20.96 14 27 7.122 27 1.613V0C27 0 20.96 2.897 13.5 2.897C6.045 2.897 0.00014 1.9e-05 0.00014 1.9e-05L1e-10 1.613Z",
    // OFF/LOGO shapes - Triangular arrow shapes for OFF state (26x45 viewBox)
    // LEFT eye points RIGHT (>) toward center
    // RIGHT eye points LEFT (<) toward center
    // These are stored pre-computed to ensure instant snapping without morphing
    OFF_LEFT: "M0.119717 3.2515C0.128897 0.356275 3.62969 -1.08732 5.67695 0.959904L24.4925 19.7752C25.7639 21.0465 25.7639 23.1077 24.4926 24.379L5.55727 43.3143C3.50298 45.3686 -0.00919365 43.9073 1.80842e-05 41.0021L0.119717 3.2515Z",
    OFF_RIGHT: "M25.8803 3.2515C25.8711 0.356275 22.3703 -1.08732 20.323 0.959904L1.5075 19.7752C0.2361 21.0465 0.2361 23.1077 1.5074 24.379L20.4427 43.3143C22.497 45.3686 26.0092 43.9073 26 41.0021L25.8803 3.2515Z",
};
const EYE_DIMENSIONS = {
    IDLE: {
        width: 20,
        height: 45,
        viewBox: "0 0 20 45",
    },
    HAPPY: {
        width: 24,
        height: 29,
        viewBox: "0 0 24 29",
    },
    LOOK: {
        width: 23,
        height: 28,
        viewBox: "0 0 23 28",
    },
    HALF: {
        width: 22,
        height: 28,
        viewBox: "0 0 22 28",
    },
    CLOSED: {
        width: 23,
        height: 8,
        viewBox: "0 0 23 8",
    },
    ANGRY: {
        width: 36,
        height: 18,
        viewBox: "0 0 36 18",
    },
    SAD: {
        width: 27,
        height: 14,
        viewBox: "0 0 27 14",
    },
    OFF_LEFT: {
        width: 26,
        height: 45,
        viewBox: "0 0 26 45",
    },
    OFF_RIGHT: {
        width: 26,
        height: 45,
        viewBox: "0 0 26 45",
    },
};

/**
 * Eye Animation Definitions
 * Pure functions that create GSAP timelines for eye animations
 *
 * This file provides declarative eye animation functions for:
 * - Eye shape morphing (idle ↔ happy, angry, sad, wink, looking, off)
 * - Blink animations (single and double)
 * - Look animations (left/right with morphing)
 *
 * All functions return GSAP timelines that can be merged into emotion timelines
 * or played independently.
 */
// ===========================
// Constants
// ===========================
/**
 * Default animation timings
 */
const DEFAULTS = {
    /** Default morph duration */
    MORPH_DURATION: 0.2,
    /** Default morph ease */
    MORPH_EASE: 'power2.inOut',
    /** Blink closed scale (nearly flat) */
    BLINK_CLOSED_SCALE: 0.05,
    /** Single blink close duration */
    BLINK_CLOSE_DURATION: 0.1,
    /** Single blink open duration */
    BLINK_OPEN_DURATION: 0.15,
    /** Double blink close duration (slightly faster) */
    DOUBLE_BLINK_CLOSE_DURATION: 0.08,
    /** Double blink open duration */
    DOUBLE_BLINK_OPEN_DURATION: 0.12,
    /** Pause between blinks in double blink */
    DOUBLE_BLINK_PAUSE: 0.1,
    /** Look animation duration */
    LOOK_DURATION: 0.15,
    /** Look animation X offset */
    LOOK_X_OFFSET: 12,
    /** Look animation bunch (eyes move closer) */
    LOOK_BUNCH: 4,
};
// ===========================
// Core Animation Functions
// ===========================
/**
 * Creates eye animation timeline that morphs eyes to specified shapes
 *
 * Supports asymmetric animations where left and right eyes can have different shapes.
 * Morphs both the SVG path data AND the container dimensions for proper scaling.
 *
 * @param elements - DOM elements for eyes
 * @param shapeSpec - Target eye shape(s). Can be a string for symmetric or object for asymmetric
 * @param config - Animation configuration
 * @returns GSAP timeline for eye morph animation
 *
 * @example
 * // Symmetric animation (both eyes same)
 * createEyeAnimation(elements, 'HAPPY_LEFT', { duration: 0.3 });
 *
 * @example
 * // Asymmetric animation (wink)
 * createEyeAnimation(elements, { left: 'WINK_LEFT', right: 'IDLE' }, { duration: 0.2 });
 */
function createEyeAnimation(elements, shapeSpec, config = {}) {
    const { ease = DEFAULTS.MORPH_EASE, onComplete, sizeScale = 1, } = config;
    // Duration/delay NOT scaled - same timing at all sizes
    const duration = config.duration ?? DEFAULTS.MORPH_DURATION;
    const delay = config.delay ?? 0;
    const timeline = gsapWithCSS.timeline({
        delay,
        onComplete,
    });
    // Normalize shape spec to object form
    const shapes = typeof shapeSpec === 'string'
        ? { left: shapeSpec, right: shapeSpec }
        : { left: shapeSpec.left, right: shapeSpec.right ?? shapeSpec.left };
    // Animate left eye (uses base path - point 0 on left edge)
    if (elements.leftEyePath && elements.leftEyeSvg) {
        const leftShapeName = shapes.left;
        const leftPath = getEyeShape(leftShapeName, 'left');
        const leftDimensions = getEyeDimensions(leftShapeName);
        // Morph SVG path
        timeline.to(elements.leftEyePath, {
            attr: { d: leftPath },
            duration,
            ease,
        }, 0);
        // Morph viewBox to match new shape
        timeline.to(elements.leftEyeSvg, {
            attr: {
                viewBox: leftDimensions.viewBox,
            },
            duration,
            ease,
        }, 0);
        // Animate container dimensions to match shape's actual size (scaled)
        if (elements.leftEye) {
            timeline.to(elements.leftEye, {
                width: leftDimensions.width * sizeScale,
                height: leftDimensions.height * sizeScale,
                duration,
                ease,
            }, 0);
        }
    }
    // Animate right eye (uses mirrored path - point 0 on right edge)
    if (elements.rightEyePath && elements.rightEyeSvg) {
        const rightShapeName = shapes.right ?? shapes.left;
        const rightPath = getEyeShape(rightShapeName, 'right');
        const rightDimensions = getEyeDimensions(rightShapeName);
        // Morph SVG path (mirrored version for smooth animation)
        timeline.to(elements.rightEyePath, {
            attr: { d: rightPath },
            duration,
            ease,
        }, 0);
        // Morph viewBox to match new shape
        timeline.to(elements.rightEyeSvg, {
            attr: {
                viewBox: rightDimensions.viewBox,
            },
            duration,
            ease,
        }, 0);
        // Animate container dimensions to match shape's actual size (scaled)
        if (elements.rightEye) {
            timeline.to(elements.rightEye, {
                width: rightDimensions.width * sizeScale,
                height: rightDimensions.height * sizeScale,
                duration,
                ease,
            }, 0);
        }
    }
    return timeline;
}
/**
 * Creates a single blink animation timeline
 *
 * Blinks both eyes simultaneously by scaling vertically to nearly flat (0.05)
 * then expanding back to normal. This is a stackable animation that can be
 * played on top of other eye states.
 *
 * **Transform Origin Fix:** Ensures eyes scale from center (50% 50%) to prevent
 * shape distortion during blink.
 *
 * @param elements - DOM elements for eyes
 * @param config - Blink animation configuration
 * @returns GSAP timeline for blink animation
 *
 * @example
 * const blinkTl = createBlinkAnimation(elements);
 * blinkTl.play();
 */
function createBlinkAnimation(elements, config = {}) {
    const { closedScale = DEFAULTS.BLINK_CLOSED_SCALE, onComplete, sizeScale = 1, } = config;
    // Duration/delay NOT scaled - same timing at all sizes
    const closeDuration = config.closeDuration ?? DEFAULTS.BLINK_CLOSE_DURATION;
    const openDuration = config.openDuration ?? DEFAULTS.BLINK_OPEN_DURATION;
    const delay = config.delay ?? 0;
    const timeline = gsapWithCSS.timeline({
        delay,
        onComplete,
    });
    const eyeElements = [elements.leftEye, elements.rightEye].filter(Boolean);
    if (eyeElements.length === 0) {
        return timeline;
    }
    // Close eyes (collapse to horizontal line)
    timeline.to(eyeElements, {
        scaleY: closedScale,
        transformOrigin: '50% 50%', // FIX: Scale from center to preserve shape
        duration: closeDuration,
        ease: 'power2.in',
    });
    // Open eyes (expand back to normal)
    timeline.to(eyeElements, {
        scaleY: 1,
        transformOrigin: '50% 50%', // FIX: Scale from center to preserve shape
        duration: openDuration,
        ease: 'power2.out',
    });
    return timeline;
}
/**
 * Creates a double blink animation timeline
 *
 * Two quick blinks in succession with a brief pause between them.
 * Uses slightly faster timing than single blink for snappier feel.
 *
 * @param elements - DOM elements for eyes
 * @param config - Blink animation configuration
 * @returns GSAP timeline for double blink animation
 *
 * @example
 * const doubleBlinkTl = createDoubleBlinkAnimation(elements);
 * doubleBlinkTl.play();
 */
function createDoubleBlinkAnimation(elements, config = {}) {
    const { closedScale = DEFAULTS.BLINK_CLOSED_SCALE, onComplete, sizeScale = 1, } = config;
    // Duration/delay NOT scaled - same timing at all sizes
    const closeDuration = config.closeDuration ?? DEFAULTS.DOUBLE_BLINK_CLOSE_DURATION;
    const openDuration = config.openDuration ?? DEFAULTS.DOUBLE_BLINK_OPEN_DURATION;
    const delay = config.delay ?? 0;
    const blinkPause = DEFAULTS.DOUBLE_BLINK_PAUSE;
    const timeline = gsapWithCSS.timeline({
        delay,
        onComplete,
    });
    const eyeElements = [elements.leftEye, elements.rightEye].filter(Boolean);
    if (eyeElements.length === 0) {
        return timeline;
    }
    // First blink - close
    timeline.to(eyeElements, {
        scaleY: closedScale,
        transformOrigin: '50% 50%', // FIX: Scale from center to preserve shape
        duration: closeDuration,
        ease: 'power2.in',
    });
    // First blink - open
    timeline.to(eyeElements, {
        scaleY: 1,
        transformOrigin: '50% 50%', // FIX: Scale from center to preserve shape
        duration: openDuration,
        ease: 'power2.out',
    });
    // Pause between blinks
    timeline.to(eyeElements, {
        scaleY: 1,
        transformOrigin: '50% 50%',
        duration: blinkPause,
    });
    // Second blink - close
    timeline.to(eyeElements, {
        scaleY: closedScale,
        transformOrigin: '50% 50%', // FIX: Scale from center to preserve shape
        duration: closeDuration,
        ease: 'power2.in',
    });
    // Second blink - open
    timeline.to(eyeElements, {
        scaleY: 1,
        transformOrigin: '50% 50%', // FIX: Scale from center to preserve shape
        duration: openDuration,
        ease: 'power2.out',
    });
    return timeline;
}
/**
 * Creates a look left/right animation timeline
 *
 * Morphs eyes from IDLE to LOOKING shape (shorter, wider) and moves them
 * left or right with a bunching effect (eyes move closer together).
 *
 * This animation combines:
 * 1. Eye shape morphing (IDLE → LOOKING)
 * 2. Horizontal translation (left or right)
 * 3. Bunching effect (eyes move closer to center)
 *
 * @param elements - DOM elements for eyes
 * @param config - Look animation configuration
 * @returns GSAP timeline for look animation
 *
 * @example
 * // Look left
 * const lookLeftTl = createLookAnimation(elements, { direction: 'left' });
 *
 * @example
 * // Look right with custom offset
 * const lookRightTl = createLookAnimation(elements, {
 *   direction: 'right',
 *   xOffset: 15,
 *   bunch: 5
 * });
 */
function createLookAnimation(elements, config) {
    const { direction, ease = DEFAULTS.MORPH_EASE, xOffset = DEFAULTS.LOOK_X_OFFSET, bunch = DEFAULTS.LOOK_BUNCH, onComplete, sizeScale = 1, } = config;
    // Duration/delay NOT scaled - same timing at all sizes
    const duration = config.duration ?? DEFAULTS.LOOK_DURATION;
    const delay = config.delay ?? 0;
    const timeline = gsapWithCSS.timeline({
        delay,
        onComplete,
    });
    // Calculate direction multiplier
    const directionMultiplier = direction === 'left' ? -1 : 1;
    // Morph eyes to LOOK shape
    const morphTimeline = createEyeAnimation(elements, 'LOOK', { duration, ease, sizeScale });
    timeline.add(morphTimeline, 0);
    // Move eyes horizontally with bunching
    // Scale pixel values by sizeScale (designed for 160px base)
    const scaledXOffset = xOffset * sizeScale;
    const scaledBunch = bunch * sizeScale;
    if (elements.leftEye) {
        timeline.to(elements.leftEye, {
            x: directionMultiplier * scaledXOffset + scaledBunch, // Move in direction + bunch towards center
            duration,
            ease,
        }, 0);
    }
    if (elements.rightEye) {
        timeline.to(elements.rightEye, {
            x: directionMultiplier * scaledXOffset - scaledBunch, // Move in direction - bunch towards center
            duration,
            ease,
        }, 0);
    }
    return timeline;
}
/**
 * Creates a return from look animation (back to idle)
 *
 * Morphs eyes back to IDLE shape and resets horizontal position.
 *
 * @param elements - DOM elements for eyes
 * @param config - Animation configuration
 * @returns GSAP timeline for return animation
 *
 * @example
 * const returnTl = createReturnFromLookAnimation(elements);
 */
function createReturnFromLookAnimation(elements, config = {}) {
    const { ease = DEFAULTS.MORPH_EASE, onComplete, sizeScale = 1, } = config;
    // Duration/delay NOT scaled - same timing at all sizes
    const duration = config.duration ?? DEFAULTS.LOOK_DURATION;
    const delay = config.delay ?? 0;
    const timeline = gsapWithCSS.timeline({
        delay,
        onComplete,
    });
    // Morph eyes back to IDLE shape
    const morphTimeline = createEyeAnimation(elements, 'IDLE', { duration, ease, sizeScale });
    timeline.add(morphTimeline, 0);
    // Reset horizontal position
    const eyeElements = [elements.leftEye, elements.rightEye].filter(Boolean);
    if (eyeElements.length > 0) {
        timeline.to(eyeElements, {
            x: 0,
            duration,
            ease,
        }, 0);
    }
    return timeline;
}

/**
 * Idle Animation Definitions
 * Pure functions that create GSAP timelines for idle/breathing animations
 *
 * Includes built-in periodic blinking scheduler for natural secondary motion
 */
/**
 * Creates the idle breathing animation timeline
 *
 * Coordinates three synchronized animations:
 * 1. Vertical floating (up/down motion)
 * 2. Gentle rotation (synchronized with float)
 * 3. Breathing scale (subtle size changes)
 * 4. Periodic blinking (5-12 second intervals, 20% chance of double blink)
 *
 * Shadow inversely follows character movement (shrinks when character floats up)
 *
 * @param elements - Character and shadow DOM elements (plus optional eye elements for blinking)
 * @param options - Optional delay configuration
 * @returns Object with timeline and blink scheduler controls
 */
function createIdleAnimation(elements, options = {}) {
    const { character, shadow: _shadow, eyeLeft, eyeRight, eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg } = elements;
    const { delay = 0.2, baseScale = 1, sizeScale = 1 } = options;
    // Scale float amplitude by sizeScale so smaller characters have proportionally smaller bounce
    const scaledAmplitude = IDLE_FLOAT.amplitude * sizeScale;
    // Create coordinated timeline with infinite repeat
    const timeline = gsapWithCSS.timeline({
        repeat: -1,
        yoyo: true,
        delay,
    });
    // Reset character to base state immediately
    // Use baseScale to preserve super mode scale (1.45) when applicable
    gsapWithCSS.set(character, {
        scale: baseScale,
        rotation: 0,
        y: 0,
    });
    // Set eyes to IDLE shape immediately (not animated, to avoid yoyo oscillation)
    if (eyeLeft && eyeRight && eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg) {
        const idleDimensions = getEyeDimensions('IDLE');
        // Use gsap.set() to immediately set eyes to IDLE without animation
        // Left eye uses base path, right eye uses mirrored path
        gsapWithCSS.set(eyeLeftPath, {
            attr: { d: getEyeShape('IDLE', 'left') },
        });
        gsapWithCSS.set(eyeRightPath, {
            attr: { d: getEyeShape('IDLE', 'right') },
        });
        // Set viewBox for both eyes
        gsapWithCSS.set([eyeLeftSvg, eyeRightSvg], {
            attr: { viewBox: idleDimensions.viewBox },
        });
        // Reset eye transforms
        gsapWithCSS.set([eyeLeft, eyeRight], {
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            x: 0,
            y: 0,
        });
        // REMOVED: width/height properties - containers stay fixed at CSS defaults
    }
    // Character floats up with rotation and breathing
    // CRITICAL: Use relative scale (*=) so super mode scale persists across idle restarts
    // The timeline captures values at creation time, so absolute scale (baseScale * 1.02)
    // would target the wrong value if super mode was set after idle was created.
    timeline.to(character, {
        y: -scaledAmplitude, // Float up by scaled amplitude (proportional to size)
        rotation: IDLE_ROTATION.degrees, // Gentle rotation (2.5°)
        scale: `*=${IDLE_BREATHE.scaleMax}`, // Relative breathing (multiply by 1.02)
        duration: IDLE_FLOAT.duration, // Smooth timing (2.5s)
        ease: IDLE_FLOAT.ease, // Sine easing for smoothness
    }, 0 // Start at timeline beginning
    );
    // NOTE: Shadow is now handled by the ShadowTracker (shadow.ts)
    // which dynamically responds to character Y position for ALL animations,
    // not just idle. This eliminates disjointed shadow behavior.
    // ===========================
    // Spontaneous Action Scheduler
    // ===========================
    // Handles random eye-only actions: blinks and looks
    // Separate from idle timeline so it can be paused/resumed independently
    let schedulerActive = false;
    let schedulerPaused = false;
    let currentDelayedCall = null;
    const hasEyeElements = eyeLeft && eyeRight && eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg;
    const scheduleNextAction = () => {
        if (!schedulerActive || schedulerPaused || !hasEyeElements)
            return;
        const actionDelay = gsapWithCSS.utils.random(8, 15); // 8-15 seconds between actions (less frequent)
        currentDelayedCall = gsapWithCSS.delayedCall(actionDelay, () => {
            if (!schedulerActive || schedulerPaused)
                return;
            const eyeElements = {
                leftEye: eyeLeft,
                rightEye: eyeRight};
            // Pick a random spontaneous action:
            // 80% single blink, 20% double blink
            const roll = Math.random();
            if (roll < 0.20) {
                // Double blink
                if (ENABLE_ANIMATION_DEBUG_LOGS) {
                    console.log('[Spontaneous] Double blink');
                }
                createDoubleBlinkAnimation(eyeElements).play();
            }
            else {
                // Single blink
                if (ENABLE_ANIMATION_DEBUG_LOGS) {
                    console.log('[Spontaneous] Single blink');
                }
                createBlinkAnimation(eyeElements).play();
            }
            // Schedule next action
            scheduleNextAction();
        });
    };
    const pauseBlinks = () => {
        schedulerPaused = true;
        // Kill any pending delayed call
        if (currentDelayedCall) {
            currentDelayedCall.kill();
            currentDelayedCall = null;
        }
    };
    const resumeBlinks = () => {
        if (!schedulerActive)
            return;
        schedulerPaused = false;
        // Schedule a new action (fresh random delay)
        scheduleNextAction();
    };
    const killBlinks = () => {
        schedulerActive = false;
        schedulerPaused = false;
        if (currentDelayedCall) {
            currentDelayedCall.kill();
            currentDelayedCall = null;
        }
    };
    // Start the spontaneous action scheduler if we have eye elements
    if (hasEyeElements) {
        schedulerActive = true;
        scheduleNextAction();
    }
    // Also cleanup on timeline kill
    const originalKill = timeline.kill.bind(timeline);
    timeline.kill = function () {
        killBlinks();
        return originalKill();
    };
    return {
        timeline,
        pauseBlinks,
        resumeBlinks,
        killBlinks,
    };
}

/**
 * Character Initialization
 *
 * Single function that sets ALL animatable properties once on mount.
 * This is the SINGLE SOURCE OF TRUTH for initial animation state.
 *
 * Call this once when elements are registered to ensure clean starting state.
 */
/**
 * Initialize all animatable properties on the character
 *
 * Sets ALL properties that GSAP will animate to their base values.
 * This ensures:
 * 1. No conflicts with inline CSS styles
 * 2. Consistent starting state for all animations
 * 3. Single source of truth for initial values
 *
 * @param elements - All character elements to initialize
 * @param options - Initial state configuration
 */
function initializeCharacter(elements, options = {}) {
    const { isOff = false, logoMode = false, sizeScale = 1 } = options;
    const { character, shadow, eyeLeft, eyeRight, eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg, innerGlow, outerGlow, leftBody, rightBody, } = elements;
    // Use OFF eyes for both isOff and logoMode, but only dim character for isOff
    const useOffEyes = isOff || logoMode;
    // ===========================
    // Character transforms
    // ===========================
    gsapWithCSS.set(character, {
        x: 0,
        y: 0,
        scale: isOff ? 0.65 : 1, // Only shrink for OFF, not logoMode
        rotation: 0,
        rotationY: 0,
        opacity: isOff ? 0.25 : 1, // Only dim for OFF, not logoMode
        transformOrigin: 'center center',
    });
    // ===========================
    // Eye containers - position and transforms
    // ===========================
    // OFF/logo state: eyes move closer together (logo position)
    // Pixel values scaled by sizeScale (designed for 160px base)
    const eyeOffsetX = useOffEyes ? 3 * sizeScale : 0; // px toward center (scaled)
    const eyeOffsetY = useOffEyes ? 3 * sizeScale : 0; // px down (scaled)
    if (eyeLeft) {
        gsapWithCSS.set(eyeLeft, {
            x: eyeOffsetX, // Move right toward center when OFF
            y: eyeOffsetY,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            transformOrigin: 'center center',
        });
    }
    if (eyeRight) {
        gsapWithCSS.set(eyeRight, {
            x: -eyeOffsetX, // Move left toward center when OFF
            y: eyeOffsetY,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            transformOrigin: 'center center',
        });
    }
    // ===========================
    // Eye SVG paths - IDLE or OFF shape based on state
    // ===========================
    if (eyeLeftPath) {
        const leftShape = useOffEyes ? 'OFF_LEFT' : 'IDLE';
        gsapWithCSS.set(eyeLeftPath, {
            attr: { d: getEyeShape(leftShape, 'left') },
        });
    }
    if (eyeRightPath) {
        const rightShape = useOffEyes ? 'OFF_RIGHT' : 'IDLE';
        gsapWithCSS.set(eyeRightPath, {
            attr: { d: getEyeShape(rightShape, 'right') },
        });
    }
    // ===========================
    // Eye SVG viewBox - IDLE or OFF dimensions
    // ===========================
    if (eyeLeftSvg && eyeRightSvg) {
        const dimensions = useOffEyes ? getEyeDimensions('OFF_LEFT') : getEyeDimensions('IDLE');
        gsapWithCSS.set([eyeLeftSvg, eyeRightSvg], {
            attr: { viewBox: dimensions.viewBox },
        });
    }
    // ===========================
    // Eye container dimensions - match the shape, scaled appropriately
    // ===========================
    if (eyeLeft && eyeRight) {
        const dimensions = useOffEyes ? getEyeDimensions('OFF_LEFT') : getEyeDimensions('IDLE');
        gsapWithCSS.set([eyeLeft, eyeRight], {
            width: dimensions.width * sizeScale,
            height: dimensions.height * sizeScale,
        });
    }
    // ===========================
    // Shadow - initial state before ShadowTracker takes over
    // When ON: grounded state (full size, visible)
    // When OFF: shrunk state (wake-up will fade it in)
    // When logoMode: hidden (no shadow for logo state)
    // After init, ShadowTracker dynamically updates based on character Y
    // ===========================
    if (shadow) {
        gsapWithCSS.set(shadow, {
            xPercent: -50,
            scaleX: isOff ? 0.7 : 1,
            scaleY: isOff ? 0.55 : 1,
            opacity: logoMode ? 0 : (isOff ? 0.2 : 0.7), // Hidden in logoMode
        });
    }
    // ===========================
    // Glows - follow character at 75% distance
    // ===========================
    const glowElements = [innerGlow, outerGlow].filter(Boolean);
    if (glowElements.length > 0) {
        gsapWithCSS.set(glowElements, {
            x: 0,
            y: 0,
            scale: isOff ? 0.65 : 1,
            opacity: (isOff || logoMode) ? 0 : 1, // Hidden in both OFF and logoMode
        });
    }
    // ===========================
    // Body brackets - for shocked animation
    // ===========================
    if (leftBody && rightBody) {
        gsapWithCSS.set([leftBody, rightBody], {
            x: 0,
            y: 0,
        });
    }
}
/**
 * Reset eyes to IDLE state
 *
 * Used after emotion animations to return eyes to neutral.
 * This is a common pattern extracted to avoid duplication.
 *
 * @param elements - Eye elements to reset
 * @param duration - Animation duration (0 for instant)
 */
function resetEyesToIdle(elements, duration = 0, sizeScale = 1) {
    const { eyeLeft, eyeRight, eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg } = elements;
    if (!eyeLeft || !eyeRight || !eyeLeftPath || !eyeRightPath || !eyeLeftSvg || !eyeRightSvg) {
        return;
    }
    const idleDimensions = getEyeDimensions('IDLE');
    if (duration === 0) {
        // Instant reset - use mirrored path for right eye
        gsapWithCSS.set(eyeLeftPath, {
            attr: { d: getEyeShape('IDLE', 'left') },
        });
        gsapWithCSS.set(eyeRightPath, {
            attr: { d: getEyeShape('IDLE', 'right') },
        });
        gsapWithCSS.set([eyeLeftSvg, eyeRightSvg], {
            attr: { viewBox: idleDimensions.viewBox },
        });
        // Reset container dimensions to IDLE size (scaled)
        gsapWithCSS.set([eyeLeft, eyeRight], {
            width: idleDimensions.width * sizeScale,
            height: idleDimensions.height * sizeScale,
        });
        gsapWithCSS.set([eyeLeft, eyeRight], {
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            x: 0,
            y: 0,
        });
        return;
    }
    // Animated reset - use mirrored path for right eye
    const timeline = gsapWithCSS.timeline();
    timeline.to(eyeLeftPath, {
        attr: { d: getEyeShape('IDLE', 'left') },
        duration,
        ease: 'power2.inOut',
    }, 0);
    timeline.to(eyeRightPath, {
        attr: { d: getEyeShape('IDLE', 'right') },
        duration,
        ease: 'power2.inOut',
    }, 0);
    timeline.to([eyeLeftSvg, eyeRightSvg], {
        attr: { viewBox: idleDimensions.viewBox },
        duration,
        ease: 'power2.inOut',
    }, 0);
    timeline.to([eyeLeft, eyeRight], {
        width: idleDimensions.width * sizeScale,
        height: idleDimensions.height * sizeScale,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        x: 0,
        y: 0,
        duration,
        ease: 'power2.inOut',
    }, 0);
    return timeline;
}
/**
 * Reset eyes to LOGO/OFF state
 *
 * Used after emotion animations in logo mode to return eyes to logo state.
 * Similar to resetEyesToIdle but uses OFF eye shapes.
 *
 * @param elements - Eye elements to reset
 * @param duration - Animation duration (0 for instant)
 * @param sizeScale - Scale factor for the character
 */
function resetEyesToLogo(elements, duration = 0, sizeScale = 1) {
    const { eyeLeft, eyeRight, eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg } = elements;
    if (!eyeLeft || !eyeRight || !eyeLeftPath || !eyeRightPath || !eyeLeftSvg || !eyeRightSvg) {
        return;
    }
    const offDimensions = getEyeDimensions('OFF_LEFT');
    const eyeOffsetX = 3 * sizeScale; // Logo position offset
    const eyeOffsetY = 3 * sizeScale;
    if (duration === 0) {
        // Instant reset to logo eyes
        gsapWithCSS.set(eyeLeftPath, {
            attr: { d: getEyeShape('OFF_LEFT', 'left') },
        });
        gsapWithCSS.set(eyeRightPath, {
            attr: { d: getEyeShape('OFF_RIGHT', 'right') },
        });
        gsapWithCSS.set([eyeLeftSvg, eyeRightSvg], {
            attr: { viewBox: offDimensions.viewBox },
        });
        gsapWithCSS.set([eyeLeft, eyeRight], {
            width: offDimensions.width * sizeScale,
            height: offDimensions.height * sizeScale,
        });
        gsapWithCSS.set(eyeLeft, {
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            x: eyeOffsetX,
            y: eyeOffsetY,
        });
        gsapWithCSS.set(eyeRight, {
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            x: -eyeOffsetX,
            y: eyeOffsetY,
        });
        return;
    }
    // Animated reset to logo eyes
    const timeline = gsapWithCSS.timeline();
    timeline.to(eyeLeftPath, {
        attr: { d: getEyeShape('OFF_LEFT', 'left') },
        duration,
        ease: 'power2.inOut',
    }, 0);
    timeline.to(eyeRightPath, {
        attr: { d: getEyeShape('OFF_RIGHT', 'right') },
        duration,
        ease: 'power2.inOut',
    }, 0);
    timeline.to([eyeLeftSvg, eyeRightSvg], {
        attr: { viewBox: offDimensions.viewBox },
        duration,
        ease: 'power2.inOut',
    }, 0);
    timeline.to([eyeLeft, eyeRight], {
        width: offDimensions.width * sizeScale,
        height: offDimensions.height * sizeScale,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        duration,
        ease: 'power2.inOut',
    }, 0);
    timeline.to(eyeLeft, {
        x: eyeOffsetX,
        y: eyeOffsetY,
        duration,
        ease: 'power2.inOut',
    }, 0);
    timeline.to(eyeRight, {
        x: -eyeOffsetX,
        y: eyeOffsetY,
        duration,
        ease: 'power2.inOut',
    }, 0);
    return timeline;
}

/**
 * Emotion Animation Interpreter
 *
 * Generic interpreter that builds GSAP timelines from declarative EmotionConfig.
 * This is the ONLY place where emotion animations are created from configs.
 *
 * ~100 lines replacing the 960-line createEmotionAnimation function.
 */
// NOTE: GLOW_CONSTANTS removed - glow following now handled by GlowSystem
/**
 * Duration scale factor - adjusts how much sizeScale affects animation speed.
 * Uses INVERSE scaling: smaller = slower, larger = faster
 * 0 = no scaling (same speed at all sizes)
 * 1 = full inverse scaling
 * 0.3 = subtle inverse scaling (recommended)
 */
const DURATION_SCALE_FACTOR = 0;
/** Calculate scaled duration based on sizeScale and DURATION_SCALE_FACTOR */
function getScaledDuration(baseDuration, sizeScale) {
    // Inverse scaling: smaller characters get longer durations (slower)
    // larger characters get shorter durations (faster)
    const inverseScale = 1 / sizeScale;
    const effectiveScale = 1 + (inverseScale - 1) * DURATION_SCALE_FACTOR;
    return baseDuration * effectiveScale;
}
// Module-level tracking of pending eye reset calls
// This allows us to kill pending resets when a new emotion starts
let globalPendingResetCall = null;
/**
 * Kill any pending eye reset from a previous emotion
 * Call this before starting a new emotion animation
 */
function killPendingEyeReset() {
    if (globalPendingResetCall) {
        globalPendingResetCall.kill();
        globalPendingResetCall = null;
    }
}
/**
 * Interpret an EmotionConfig and build a GSAP timeline
 *
 * @param config - Declarative emotion configuration
 * @param elements - DOM elements to animate
 * @param sizeScale - Scale factor for the character (size / 160)
 * @param logoMode - If true, reset to logo eyes instead of idle after emotion
 * @returns GSAP timeline ready to play
 */
function interpretEmotionConfig(config, elements, sizeScale = 1, logoMode = false) {
    const { character, eyeLeft, eyeRight, eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg, innerGlow, outerGlow, leftBody, rightBody } = elements;
    const glowElements = [innerGlow, outerGlow].filter(Boolean);
    // Kill any pending reset from previous emotion BEFORE setting up new one
    killPendingEyeReset();
    const doReset = () => {
        // Clear the global pending reset since we're executing it
        globalPendingResetCall = null;
        // Reset rotation if configured
        if (config.resetRotation) {
            gsapWithCSS.set(character, { rotation: 0 });
        }
        if (config.resetRotationY) {
            gsapWithCSS.set(character, { rotationY: 0 });
        }
        // Defensive: ensure character x is reset to 0 after emotion completes
        // This ensures glow tracking stays aligned even if emotion animation
        // didn't fully return to x=0 due to timing edge cases
        gsapWithCSS.set(character, { x: 0 });
        // Reset eyes to IDLE or LOGO based on mode (duration NOT scaled - same timing at all sizes)
        if (logoMode) {
            resetEyesToLogo(elements, config.eyeResetDuration ?? 0, sizeScale);
        }
        else {
            resetEyesToIdle(elements, config.eyeResetDuration ?? 0, sizeScale);
        }
        // Reset body brackets if they were animated
        if (config.body && leftBody && rightBody) {
            gsapWithCSS.set([leftBody, rightBody], { x: 0, y: 0 });
        }
    };
    const timeline = gsapWithCSS.timeline({
        paused: true, // Don't auto-play - controller will play when ready
        onComplete: () => {
            // If holdDuration is set, wait before resetting (for look animations)
            // Duration NOT scaled - same timing at all sizes
            if (config.holdDuration) {
                globalPendingResetCall = gsapWithCSS.delayedCall(config.holdDuration, doReset);
            }
            else {
                doReset();
            }
        },
        onInterrupt: () => {
            // Kill any pending delayed reset when interrupted
            killPendingEyeReset();
            // Reset eye rotation/position immediately so next emotion starts clean
            // (critical for sad→idea where eye rotations would otherwise persist)
            if (eyeLeft && eyeRight) {
                gsapWithCSS.set([eyeLeft, eyeRight], { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 });
            }
            // Reset body brackets immediately (critical for shocked interruption)
            if (leftBody && rightBody) {
                gsapWithCSS.set([leftBody, rightBody], { x: 0, y: 0 });
            }
            // Reset character x position (critical for sad/angry interrupted mid-shake)
            // Note: Don't reset y as idle handles that, but x must be 0 for glow tracking
            gsapWithCSS.set(character, { x: 0 });
        },
    });
    // ===========================
    // Eye Animation (static, applied once at start)
    // ===========================
    if (config.eyes && eyeLeft && eyeRight && eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg) {
        addEyeAnimation(timeline, config.eyes, elements, sizeScale);
    }
    // ===========================
    // Body Bracket Animation (shocked)
    // ===========================
    if (config.body && leftBody && rightBody) {
        addBodyAnimation(timeline, config.body, leftBody, rightBody, sizeScale);
    }
    // ===========================
    // Character Movement Phases
    // ===========================
    addCharacterPhases(timeline, config.character, character, glowElements, config.glow, sizeScale);
    // ===========================
    // Eye Phases (dynamic, per-keyframe)
    // Must be added AFTER character phases so timeline has correct duration
    // ===========================
    if (config.eyePhases && eyeLeft && eyeRight && eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg) {
        addEyePhases(timeline, config.eyePhases, elements, sizeScale);
    }
    return timeline;
}
/**
 * Add eye animation to timeline
 */
function addEyeAnimation(timeline, eyeConfig, elements, sizeScale) {
    const { eyeLeft, eyeRight, eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg } = elements;
    if (!eyeLeft || !eyeRight || !eyeLeftPath || !eyeRightPath || !eyeLeftSvg || !eyeRightSvg) {
        return;
    }
    // Scale duration based on DURATION_SCALE_FACTOR (0 = no scaling, 1 = full scaling)
    const scaledDuration = getScaledDuration(eyeConfig.duration ?? 0.2, sizeScale);
    // Create eye morph animation
    const eyeTl = createEyeAnimation({
        leftEye: eyeLeft,
        rightEye: eyeRight,
        leftEyePath: eyeLeftPath,
        rightEyePath: eyeRightPath,
        leftEyeSvg: eyeLeftSvg,
        rightEyeSvg: eyeRightSvg,
    }, eyeConfig.shape, { duration: scaledDuration, sizeScale });
    // Timeline position NOT scaled - same timing at all sizes
    const eyePosition = eyeConfig.delay ?? 0;
    timeline.add(eyeTl, eyePosition);
    // Eye position/transform animations
    // All pixel values are scaled by sizeScale (designed for 160px base)
    if (eyeConfig.yOffset !== undefined || eyeConfig.xOffset !== undefined || eyeConfig.scale !== undefined || eyeConfig.bunch !== undefined) {
        const bunch = (eyeConfig.bunch ?? 0) * sizeScale;
        // Handle per-eye or shared offsets (scaled)
        const leftYOffset = (typeof eyeConfig.yOffset === 'object' ? eyeConfig.yOffset.left : (eyeConfig.yOffset ?? 0)) * sizeScale;
        const rightYOffset = (typeof eyeConfig.yOffset === 'object' ? eyeConfig.yOffset.right : (eyeConfig.yOffset ?? 0)) * sizeScale;
        const leftXOffset = (typeof eyeConfig.xOffset === 'object' ? eyeConfig.xOffset.left : (eyeConfig.xOffset ?? 0)) * sizeScale;
        const rightXOffset = (typeof eyeConfig.xOffset === 'object' ? eyeConfig.xOffset.right : (eyeConfig.xOffset ?? 0)) * sizeScale;
        // Left eye: moves in direction + bunches towards center
        timeline.to(eyeLeft, {
            y: leftYOffset,
            x: leftXOffset + bunch,
            scaleX: eyeConfig.scale ?? 1,
            scaleY: eyeConfig.scale ?? 1,
            duration: scaledDuration,
            ease: 'power2.out',
        }, eyePosition);
        // Right eye: moves in direction - bunches towards center
        timeline.to(eyeRight, {
            y: rightYOffset,
            x: rightXOffset - bunch,
            scaleX: eyeConfig.scale ?? 1,
            scaleY: eyeConfig.scale ?? 1,
            duration: scaledDuration,
            ease: 'power2.out',
        }, eyePosition);
    }
    // Eye rotations (for sad/angry) - happen during the morph, not after
    // Note: Right eye shape is already mirrored at the path level,
    // so rotation values are simply applied directly (no scaleX flip needed)
    if (eyeConfig.leftRotation !== undefined) {
        timeline.to(eyeLeft, {
            rotation: eyeConfig.leftRotation,
            duration: scaledDuration,
            ease: 'power2.out',
        }, eyePosition);
    }
    if (eyeConfig.rightRotation !== undefined) {
        timeline.to(eyeRight, {
            rotation: eyeConfig.rightRotation,
            duration: scaledDuration,
            ease: 'power2.out',
        }, eyePosition);
    }
    // Eye return animation (for shocked - scale back down)
    if (eyeConfig.returnPosition !== undefined) {
        // Duration/position NOT scaled - same timing at all sizes
        const returnDuration = eyeConfig.returnDuration ?? 0.25;
        const scaledReturnPosition = eyeConfig.returnPosition;
        timeline.to([eyeLeft, eyeRight], {
            scaleX: 1,
            scaleY: 1,
            y: 0,
            x: 0,
            duration: returnDuration,
            ease: 'power2.out',
        }, scaledReturnPosition);
    }
}
/**
 * Add per-phase eye animations (for dynamic eye changes during animation)
 */
function addEyePhases(timeline, eyePhases, elements, sizeScale) {
    const { eyeLeft, eyeRight, eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg } = elements;
    if (!eyeLeft || !eyeRight || !eyeLeftPath || !eyeRightPath || !eyeLeftSvg || !eyeRightSvg) {
        return;
    }
    for (const phase of eyePhases) {
        // Scale duration based on DURATION_SCALE_FACTOR (0 = no scaling, 1 = full scaling)
        const scaledDuration = getScaledDuration(phase.duration ?? 0.2, sizeScale);
        // Timeline position NOT scaled - same timing at all sizes
        const scaledPosition = phase.position;
        const eyeTl = createEyeAnimation({
            leftEye: eyeLeft,
            rightEye: eyeRight,
            leftEyePath: eyeLeftPath,
            rightEyePath: eyeRightPath,
            leftEyeSvg: eyeLeftSvg,
            rightEyeSvg: eyeRightSvg,
        }, phase.shape, { duration: scaledDuration, sizeScale });
        timeline.add(eyeTl, scaledPosition);
        // Handle eye position changes (xOffset, bunch)
        // All pixel values are scaled by sizeScale (designed for 160px base)
        if (phase.xOffset !== undefined || phase.bunch !== undefined) {
            const bunch = (phase.bunch ?? 0) * sizeScale;
            const xOffset = (phase.xOffset ?? 0) * sizeScale;
            // Left eye: xOffset + bunch towards center
            timeline.to(eyeLeft, {
                x: xOffset + bunch,
                duration: scaledDuration,
                ease: 'power2.out',
            }, scaledPosition);
            // Right eye: xOffset - bunch towards center
            timeline.to(eyeRight, {
                x: xOffset - bunch,
                duration: scaledDuration,
                ease: 'power2.out',
            }, scaledPosition);
        }
    }
}
/**
 * Add body bracket animation (shocked)
 */
function addBodyAnimation(timeline, bodyConfig, leftBody, rightBody, sizeScale = 1) {
    // Duration/position NOT scaled - same timing at all sizes
    const duration = bodyConfig.duration ?? 0.2;
    const ease = bodyConfig.ease ?? 'back.out(2)';
    const returnPosition = bodyConfig.returnPosition ?? '+=1.15';
    const returnDuration = bodyConfig.returnDuration ?? 0.25;
    const returnEase = bodyConfig.returnEase ?? 'elastic.out(1, 0.5)';
    // Separate brackets - scale pixel values by sizeScale (designed for 160px base)
    timeline.to(leftBody, {
        x: (bodyConfig.leftX ?? 0) * sizeScale,
        y: (bodyConfig.leftY ?? 0) * sizeScale,
        duration,
        ease,
    }, 0);
    timeline.to(rightBody, {
        x: (bodyConfig.rightX ?? 0) * sizeScale,
        y: (bodyConfig.rightY ?? 0) * sizeScale,
        duration,
        ease,
    }, 0);
    // Return brackets
    timeline.to([leftBody, rightBody], {
        x: 0,
        y: 0,
        duration: returnDuration,
        ease: returnEase,
    }, returnPosition);
}
/**
 * Add character movement phases
 * NOTE: Glow following is now handled by GlowSystem via physics-based tracking
 */
function addCharacterPhases(timeline, phases, character, _glowElements, _glowConfig, sizeScale = 1) {
    let isFirstPhase = true;
    for (const phase of phases) {
        // First phase starts at 0, others sequence naturally or use explicit position
        // Timeline position NOT scaled - same timing at all sizes
        const position = phase.position ?? (isFirstPhase ? 0 : undefined);
        isFirstPhase = false;
        // Scale x and y pixel values by sizeScale (designed for 160px base)
        // Other props like rotation, scale, opacity remain unchanged
        const scaledProps = { ...phase.props };
        if (typeof scaledProps.x === 'number') {
            scaledProps.x = scaledProps.x * sizeScale;
        }
        if (typeof scaledProps.y === 'number') {
            scaledProps.y = scaledProps.y * sizeScale;
        }
        // Scale duration based on DURATION_SCALE_FACTOR (0 = no scaling, 1 = full scaling)
        const scaledDuration = getScaledDuration(phase.duration, sizeScale);
        // Animate character
        timeline.to(character, {
            ...scaledProps,
            duration: scaledDuration,
            ease: phase.ease,
        }, position);
        // NOTE: Glow following removed - GlowSystem tracks character position via physics
    }
}

/**
 * Declarative Emotion Configurations
 *
 * All emotions defined as DATA, not code.
 * Each emotion is a configuration object that the interpreter uses
 * to build GSAP timelines.
 *
 * This makes emotions:
 * 1. Easy to understand at a glance
 * 2. Easy to modify without touching animation logic
 * 3. Easy to test in isolation
 * 4. Easy to add new emotions
 */
/**
 * Glow coordination constants
 * Glows follow character at 75% distance with 0.05s lag
 */
/**
 * All emotion configurations
 */
const EMOTION_CONFIGS = {
    // ===========================
    // HAPPY - Wiggle rotation
    // ===========================
    happy: {
        id: 'happy',
        eyes: {
            shape: 'HAPPY',
            duration: 0.2,
            yOffset: -10,
        },
        character: [
            { props: { rotation: 10 }, duration: 0.15, ease: 'power1.inOut' },
            { props: { rotation: -10 }, duration: 0.15, ease: 'power1.inOut' },
            { props: { rotation: 10 }, duration: 0.15, ease: 'power1.inOut' },
            { props: { rotation: -10 }, duration: 0.15, ease: 'power1.inOut' },
            { props: { rotation: 10 }, duration: 0.15, ease: 'power1.inOut' },
            { props: { rotation: 0 }, duration: 0.15, ease: 'power1.inOut' },
        ],
        glow: { follow: true },
        totalDuration: 0.9,
    },
    // ===========================
    // POSITIVE EMOTION SCALE (Level 5 to 1)
    // ===========================
    // ===========================
    // CELEBRATE (Level 5) - EPIC celebration with confetti
    // For: Major wins, big achievements, celebrations
    // ===========================
    celebrate: {
        id: 'celebrate',
        eyes: {
            shape: 'HAPPY',
            duration: 0.2,
            yOffset: -10,
            delay: 0.35, // Start during leap
        },
        character: [
            // Squat down (anticipation)
            { props: { y: 12 }, duration: 0.2, ease: 'power2.in' },
            // Spin up from crouch to apex
            { props: { y: -70, rotation: 360 }, duration: 0.4, ease: 'power2.out' },
            // Hang in air
            { props: { y: -70, rotation: 360 }, duration: 0.4, ease: 'none' },
            // Normal comedown with small bounce
            { props: { y: 0 }, duration: 0.3, ease: 'power2.in' },
            { props: { y: -12 }, duration: 0.12, ease: 'power2.out' },
            { props: { y: 0 }, duration: 0.1, ease: 'power2.in' },
        ],
        glow: { follow: true },
        totalDuration: 1.5,
        resetRotation: true,
        // Note: Confetti is spawned separately in anty-character-v3.tsx for this emotion
    },
    // ===========================
    // EXCITED (Level 4) - Jump + spin without confetti
    // For: Good accomplishments, victories, success
    // ===========================
    excited: {
        id: 'excited',
        eyes: {
            shape: 'HAPPY',
            duration: 0.2,
            yOffset: -10,
            delay: 0.2,
        },
        character: [
            // Quick squat
            { props: { y: 8 }, duration: 0.15, ease: 'power2.in' },
            // Jump up with spin
            { props: { y: -50, rotation: 360 }, duration: 0.35, ease: 'power2.out' },
            // Brief hang
            { props: { y: -50, rotation: 360 }, duration: 0.2, ease: 'none' },
            // Come down
            { props: { y: 0 }, duration: 0.25, ease: 'power2.in' },
            // Small bounce
            { props: { y: -8 }, duration: 0.1, ease: 'power2.out' },
            { props: { y: 0 }, duration: 0.08, ease: 'power2.in' },
        ],
        glow: { follow: true },
        totalDuration: 1.1,
        resetRotation: true,
    },
    // ===========================
    // HAPPY (Level 3) - Expressive wiggle
    // For: Good news, positive responses
    // (defined above)
    // ===========================
    // ===========================
    // PLEASED (Level 2) - Gentle bounce + happy eyes
    // For: Mild positive, acknowledgments, satisfaction
    // ===========================
    pleased: {
        id: 'pleased',
        eyes: {
            shape: 'HAPPY',
            duration: 0.15,
            yOffset: -8,
        },
        character: [
            // Small satisfied bounce up
            { props: { y: -18 }, duration: 0.2, ease: 'power2.out' },
            // Settle back down
            { props: { y: 0 }, duration: 0.25, ease: 'power2.in' },
            // Tiny rebound
            { props: { y: -4 }, duration: 0.1, ease: 'power1.out' },
            { props: { y: 0 }, duration: 0.1, ease: 'power1.in' },
        ],
        glow: { follow: true },
        totalDuration: 0.65,
        holdDuration: 0.4, // Hold happy eyes a bit after bounce
    },
    // CHANT (Level 1) - Happy eyes only
    // (defined at bottom of file)
    // ===========================
    // SAD - Droop down
    // ===========================
    sad: {
        id: 'sad',
        eyes: {
            shape: 'SAD',
            duration: 0.25,
            yOffset: 10, // Lower eyes
            leftRotation: -15,
            rightRotation: 15, // Mirrored: opposite of left for proper reflection
        },
        character: [
            // Drop down gently (faster)
            { props: { y: 18 }, duration: 0.5, ease: 'power2.out' },
            // Subtle slow sway starts parallel to drop (3 cycles instead of 4)
            { props: { x: -5 }, duration: 0.7, ease: 'sine.inOut', position: 0 },
            { props: { x: 5 }, duration: 0.7, ease: 'sine.inOut' },
            { props: { x: -5 }, duration: 0.7, ease: 'sine.inOut' },
            // Return to center
            { props: { x: 0 }, duration: 0.4, ease: 'sine.inOut' },
            // Rise back up gently
            { props: { y: 0 }, duration: 0.4, ease: 'power2.in' },
        ],
        glow: { follow: true },
        totalDuration: 3.4,
        showTeardrop: true,
    },
    // ===========================
    // ANGRY - Drop and shake
    // ===========================
    angry: {
        id: 'angry',
        eyes: {
            shape: 'ANGRY',
            duration: 0.2,
            leftRotation: 20,
            rightRotation: -20, // Mirrored: opposite of left for proper reflection
        },
        character: [
            // Drop down
            { props: { y: 15 }, duration: 0.4, ease: 'power2.out' },
            // Shake 3 times
            { props: { x: -8 }, duration: 0.15, ease: 'sine.inOut' },
            { props: { x: 8 }, duration: 0.15, ease: 'sine.inOut' },
            { props: { x: -8 }, duration: 0.15, ease: 'sine.inOut' },
            { props: { x: 8 }, duration: 0.15, ease: 'sine.inOut' },
            { props: { x: -8 }, duration: 0.15, ease: 'sine.inOut' },
            { props: { x: 8 }, duration: 0.15, ease: 'sine.inOut' },
            // Hold down
            { props: { x: 0 }, duration: 0.5, ease: 'sine.inOut' },
            // Return up
            { props: { y: 0 }, duration: 0.4, ease: 'power2.in' },
        ],
        glow: { follow: true },
        totalDuration: 2.2,
    },
    // ===========================
    // SHOCKED - Jump with bracket separation
    // ===========================
    shocked: {
        id: 'shocked',
        eyes: {
            shape: 'IDLE', // Keep idle shape but scale up
            duration: 0.2,
            scale: 1.4,
            returnPosition: 1.3, // Scale down when brackets close
            returnDuration: 0.3,
        },
        character: [
            // Jump up
            { props: { y: -30 }, duration: 0.2, ease: 'power2.out' },
            // Descend at 1.3s (parallel with bracket close)
            { props: { y: 0 }, duration: 0.3, ease: 'power2.in', position: 1.3 },
        ],
        body: {
            leftX: -15,
            leftY: -15,
            rightX: 15,
            rightY: 15,
            duration: 0.2,
            ease: 'back.out(2)',
            returnPosition: 1.3, // Close brackets parallel with descent
            returnDuration: 0.3,
            returnEase: 'power2.inOut',
        },
        glow: { follow: true },
        totalDuration: 1.6,
    },
    // ===========================
    // SPIN - Y-axis 360 spin with jump
    // ===========================
    spin: {
        id: 'spin',
        eyes: {
            shape: 'HALF',
            duration: 0.2,
            yOffset: -10,
            delay: 0.25, // Start during jump
        },
        character: [
            // Jump up
            { props: { y: -70 }, duration: 0.3, ease: 'power2.out' },
            // Double spin on Y-axis (overlaps with jump)
            { props: { rotationY: 720 }, duration: 1.1, ease: 'back.out(1.2)', position: '-=0.3' },
            // Descend (overlaps with end of spin)
            { props: { y: 0 }, duration: 0.35, ease: 'power2.in', position: '-=0.4' },
        ],
        glow: { follow: true },
        totalDuration: 1.35,
        resetRotationY: true,
    },
    // ===========================
    // JUMP - Classic Mario-style jump (space key)
    // ===========================
    jump: {
        id: 'jump',
        character: [
            // Rise up (fast launch, slow at apex)
            { props: { y: -55 }, duration: 0.3, ease: 'power2.out' },
            // Fall down (slow at apex, fast landing)
            { props: { y: 0 }, duration: 0.3, ease: 'power2.in' },
        ],
        glow: { follow: true },
        totalDuration: 0.6,
    },
    // ===========================
    // IDEA - Aha moment with lightbulb
    // ===========================
    idea: {
        id: 'idea',
        eyes: {
            shape: 'IDLE',
            duration: 0.2,
            scale: 1.15,
            yOffset: -10, // Eyes lift up with jump
        },
        character: [
            // Leap up higher
            { props: { y: -45 }, duration: 0.25, ease: 'power2.out' },
            // Hold in air longer while bulb rises
            { props: { y: -45 }, duration: 1.0, ease: 'none' },
            // Come back down smoothly (no bounce)
            { props: { y: 0 }, duration: 0.25, ease: 'power2.in' },
        ],
        glow: { follow: true },
        totalDuration: 1.5,
        showLightbulb: true,
        eyeResetDuration: 0.2,
    },
    // ===========================
    // BACK-FORTH - Look left then right with "considering" eyes
    // Eyes alternate: when looking one direction, opposite eye goes half-closed
    // ===========================
    'back-forth': {
        id: 'back-forth',
        eyePhases: [
            // Slightly before arriving left (anticipate the stop)
            { position: 0.2, shape: { left: 'IDLE', right: 'HALF' }, duration: 0.06 },
            // Slightly before arriving right
            { position: 1.1, shape: { left: 'HALF', right: 'IDLE' }, duration: 0.06 },
            // Hold second squint longer, return near end
            { position: 1.9, shape: 'IDLE', duration: 0.06 },
        ],
        character: [
            // Look left
            { props: { rotation: -8, x: -10 }, duration: 0.3, ease: 'power2.out' },
            // Hold left
            { props: { rotation: -8, x: -10 }, duration: 0.5, ease: 'none' },
            // Transition to right
            { props: { rotation: 8, x: 10 }, duration: 0.4, ease: 'power2.inOut' },
            // Hold right
            { props: { rotation: 8, x: 10 }, duration: 0.5, ease: 'none' },
            // Return to center
            { props: { rotation: 0, x: 0 }, duration: 0.3, ease: 'power2.in' },
        ],
        totalDuration: 2.0,
    },
    // ===========================
    // WINK - Asymmetric eye wink with tilt
    // ===========================
    wink: {
        id: 'wink',
        eyes: {
            shape: { left: 'CLOSED', right: 'HALF' },
            duration: 0.08, // Snap to wink quickly
            yOffset: { left: 0, right: -10 }, // Only right eye rises up
        },
        character: [
            // Tilt up (25% faster)
            { props: { rotation: -3, y: -5 }, duration: 0.19, ease: 'power1.inOut' },
            // Hold
            { props: { rotation: -3, y: -5 }, duration: 0.4, ease: 'none' },
            // Return
            { props: { rotation: 0, y: 0 }, duration: 0.25, ease: 'power1.inOut' },
        ],
        totalDuration: 0.84,
        resetIdle: false, // Subtle emotion - don't disrupt breathing
    },
    // ===========================
    // NOD - Vertical head bob (yes)
    // ===========================
    nod: {
        id: 'nod',
        character: [
            // First nod - tilt forward + dip down
            { props: { rotationX: -35, y: 8, transformPerspective: 600 }, duration: 0.15, ease: 'power2.out' },
            { props: { rotationX: 0, y: 0, transformPerspective: 600 }, duration: 0.15, ease: 'power2.inOut' },
            // Second nod
            { props: { rotationX: -35, y: 8, transformPerspective: 600 }, duration: 0.15, ease: 'power2.out' },
            { props: { rotationX: 0, y: 0, transformPerspective: 600 }, duration: 0.15, ease: 'power2.inOut' },
            // Third nod
            { props: { rotationX: -35, y: 8, transformPerspective: 600 }, duration: 0.15, ease: 'power2.out' },
            { props: { rotationX: 0, y: 0, transformPerspective: 600 }, duration: 0.15, ease: 'power2.in' },
        ],
        totalDuration: 0.9,
    },
    // ===========================
    // HEADSHAKE - Y-axis rotation shake (no)
    // ===========================
    headshake: {
        id: 'headshake',
        character: [
            // Ramping amplitude: starts smaller, builds up
            { props: { rotationY: -35, transformPerspective: 600 }, duration: 0.15, ease: 'power4.out' },
            { props: { rotationY: 40, transformPerspective: 600 }, duration: 0.18, ease: 'power4.inOut' },
            { props: { rotationY: -45, transformPerspective: 600 }, duration: 0.18, ease: 'power4.inOut' },
            { props: { rotationY: 50, transformPerspective: 600 }, duration: 0.18, ease: 'power4.inOut' },
            { props: { rotationY: -50, transformPerspective: 600 }, duration: 0.18, ease: 'power4.inOut' },
            { props: { rotationY: 0, transformPerspective: 600 }, duration: 0.2, ease: 'power2.inOut' },
        ],
        totalDuration: 1.07,
        resetRotationY: true,
    },
    // ===========================
    // LOOK-AROUND - Look left then right (eye-only)
    // Like holding [ for 1s then ] for 1s - doesn't interrupt idle
    // ===========================
    'look-around': {
        id: 'look-around',
        eyes: {
            shape: 'LOOK',
            duration: 0.15,
            xOffset: -12, // Start looking left
            bunch: 4,
        },
        eyePhases: [
            // Transition to looking right at 1.1s
            { position: 1.1, shape: 'LOOK', duration: 0.15, xOffset: 12, bunch: 4 },
            // Return to center at 2.2s
            { position: 2.2, shape: 'IDLE', duration: 0.15, xOffset: 0, bunch: 0 },
        ],
        character: [], // Eye-only, no body movement
        totalDuration: 2.35,
        preserveIdle: true, // Don't interrupt idle breathing
        resetIdle: false,
    },
    // ===========================
    // LOOK-LEFT - Eye-only look (no body movement)
    // Secondary action - doesn't interrupt main animation flow
    // ===========================
    'look-left': {
        id: 'look-left',
        eyes: {
            shape: 'LOOK',
            duration: 0.15,
            xOffset: -12,
            bunch: 4,
        },
        character: [], // Eye-only, no body movement
        totalDuration: 0.9,
        holdDuration: 0.6, // Hold before returning to idle
    },
    // ===========================
    // LOOK-RIGHT - Eye-only look (no body movement)
    // Secondary action - doesn't interrupt main animation flow
    // ===========================
    'look-right': {
        id: 'look-right',
        eyes: {
            shape: 'LOOK',
            duration: 0.15,
            xOffset: 12,
            bunch: 4,
        },
        character: [], // Eye-only, no body movement
        totalDuration: 0.9,
        holdDuration: 0.6, // Hold before returning to idle
    },
    // ===========================
    // SUPER - Mario-style power-up pulse
    // ===========================
    super: {
        id: 'super',
        eyes: {
            shape: 'IDLE',
            duration: 0.55,
            scale: 1.1,
        },
        character: [
            { props: { scale: 1.15, rotation: 0 }, duration: 0.1, ease: 'power1.out' },
            { props: { scale: 1.05 }, duration: 0.1, ease: 'power1.inOut' },
            { props: { scale: 1.2 }, duration: 0.1, ease: 'power1.out' },
            { props: { scale: 1.1 }, duration: 0.1, ease: 'power1.inOut' },
            { props: { scale: 1.45 }, duration: 0.15, ease: 'back.out(2)' },
        ],
        glow: { follow: true },
        totalDuration: 0.55,
    },
    // ===========================
    // SMIZE - Eye-only happy eyes (smile with eyes)
    // No body movement - just happy eyes for ~1.5s
    // ===========================
    smize: {
        id: 'smize',
        eyes: {
            shape: 'HAPPY',
            duration: 0.2,
            yOffset: -8, // Slight lift like happy
        },
        character: [], // Eye-only, no body movement
        totalDuration: 1.5,
        holdDuration: 1.2, // Hold happy eyes before returning to idle
        resetIdle: false, // Don't restart idle from origin
        preserveIdle: true, // Keep breathing animation running during eye change
    },
};
/**
 * Get emotion config by type
 */
function getEmotionConfig(emotion) {
    return EMOTION_CONFIGS[emotion];
}

/**
 * Transition Animation Definitions
 * Pure functions that create GSAP timelines for state transitions (wake-up, power-off)
 */
/**
 * Creates wake-up animation (OFF → ON transition)
 *
 * "Blink Awake" animation (~0.5s):
 * 1. Body smoothly rises (scale 0.65→1, y 50→0, opacity 0.45→1)
 * 2. Eyes snap from OFF arrows to CLOSED partway through
 * 3. Eyes morph from CLOSED → IDLE (opening like waking up)
 *
 * @param elements - Character, shadow, and optional glow elements
 * @param sizeScale - Scale factor for the character (size / 160)
 * @returns GSAP timeline for wake-up animation
 */
function createWakeUpAnimation(elements, sizeScale = 1) {
    const { character, shadow, eyeLeft, eyeRight, eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg } = elements;
    // NOTE: Glow animations removed - GlowSystem handles fade in via animation controller
    const timeline = gsapWithCSS.timeline();
    // Kill any existing animations on character, shadow, eyes
    // NOTE: Don't kill glow tweens - GlowSystem manages glow animations
    gsapWithCSS.killTweensOf([character, shadow]);
    if (eyeLeft && eyeRight) {
        gsapWithCSS.killTweensOf([eyeLeft, eyeRight]);
    }
    if (eyeLeftPath && eyeRightPath) {
        gsapWithCSS.killTweensOf([eyeLeftPath, eyeRightPath]);
    }
    // ============================================
    // WAKE-UP: Mirror of power-off sequence
    // ============================================
    // OFF does: climb to -60 (0.5s) → snap to 50 (0.1s) → fade
    // ON does:  snap to -60 (0.12s) → hang → settle to 0 (0.5s)
    // Scale all durations by sizeScale so smaller characters animate faster
    // ============================================
    // Phase 1: POP UP - quick but readable rise to apex
    // Opacity and scale come in with the rise
    timeline.fromTo(character, {
        opacity: 0.25,
        scale: 0.65,
        y: 50,
        x: 0,
        rotation: 0,
    }, {
        opacity: 1,
        scale: 1,
        y: -40,
        duration: 0.25,
        ease: 'power3.out', // Quick but visible rise
    });
    // Phase 2: HANG at apex - brief pause to let it read
    // (timeline just continues, this is the gap before settle)
    // Phase 3: SETTLE DOWN - smooth descent to idle (mirror of the climb)
    timeline.to(character, {
        y: 0,
        duration: 0.35,
        ease: 'power2.inOut',
        clearProps: 'willChange',
    }, 0.75 // Start after 0.5s hangtime at apex (0.25 rise + 0.5 hang)
    );
    // Shadow: starts small/faint, shrinks during rise
    timeline.fromTo(shadow, {
        xPercent: -50,
        scaleX: 0.65,
        scaleY: 0.65,
        opacity: 0,
    }, {
        scaleX: 0.5,
        scaleY: 0.35,
        opacity: 0.3,
        duration: 0.25,
        ease: 'power3.out',
    }, 0);
    // Shadow: grows as character settles
    timeline.to(shadow, {
        scaleX: 1,
        scaleY: 1,
        opacity: 0.7,
        duration: 0.35,
        ease: 'power2.inOut',
    }, 0.75);
    // ============================================
    // EYES: Snap to IDLE, then blink-awake before settle
    // ============================================
    if (eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg && eyeLeft && eyeRight) {
        const idleDimensions = getEyeDimensions('IDLE');
        // Kill any existing eye tweens
        gsapWithCSS.killTweensOf([eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg, eyeLeft, eyeRight]);
        // Start with HALF eyes (half-open) positioned higher
        const halfDimensions = getEyeDimensions('HALF');
        timeline.set(eyeLeftPath, { attr: { d: getEyeShape('HALF', 'left') } }, 0);
        timeline.set(eyeRightPath, { attr: { d: getEyeShape('HALF', 'right') } }, 0);
        timeline.set([eyeLeftSvg, eyeRightSvg], { attr: { viewBox: halfDimensions.viewBox } }, 0);
        timeline.set([eyeLeft, eyeRight], {
            width: halfDimensions.width * sizeScale,
            height: halfDimensions.height * sizeScale,
            x: 0,
            y: -10 * sizeScale, // Higher up (scaled)
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
        }, 0);
        // Morph to IDLE eyes and settle down during descent
        timeline.to(eyeLeftPath, { attr: { d: getEyeShape('IDLE', 'left') }, duration: 0.25, ease: 'power2.inOut' }, 0.75);
        timeline.to(eyeRightPath, { attr: { d: getEyeShape('IDLE', 'right') }, duration: 0.25, ease: 'power2.inOut' }, 0.75);
        timeline.to([eyeLeftSvg, eyeRightSvg], { attr: { viewBox: idleDimensions.viewBox }, duration: 0.25, ease: 'power2.inOut' }, 0.75);
        timeline.to([eyeLeft, eyeRight], {
            width: idleDimensions.width * sizeScale,
            height: idleDimensions.height * sizeScale,
            y: 0,
            duration: 0.35,
            ease: 'power2.inOut',
        }, 0.75);
    }
    return timeline;
}
/**
 * Creates power-off animation (ON → OFF transition)
 *
 * Dramatic three-phase choreography:
 * 1. Climb up (0.5s) - controlled rise to y: -60
 * 2. SNAP down HARD (0.1s) - explosive drop to y: 50, scale: 0.65 with expo.in easing
 * 3. Fade out (0.05-0.06s) - character to 0.45 opacity, glows/shadow to 0
 *
 * Shadow shrinks to 0.65 (NOT zero) and stays on ground
 * Glows follow character movement and fade out
 *
 * Total duration: ~0.66s
 *
 * @param elements - Character, shadow, and optional glow elements
 * @returns GSAP timeline for power-off animation
 */
function createPowerOffAnimation(elements, sizeScale = 1) {
    const { character, shadow, eyeLeft, eyeRight, eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg } = elements;
    // NOTE: Glow animations removed - GlowSystem handles fade out via animation controller
    const timeline = gsapWithCSS.timeline();
    // Kill any existing animations
    // NOTE: Don't kill glow tweens - GlowSystem manages glow animations
    gsapWithCSS.killTweensOf([character, shadow]);
    // NOTE: Duration scaling disabled - adjust DURATION_SCALE_FACTOR in emotion-interpreter.ts if needed
    // Phase 1: Climb up (0.5s) - eyes stay as idle
    timeline.to(character, {
        y: -60,
        duration: 0.5,
        ease: 'power2.out',
    });
    // Phase 2: SNAP down HARD - super fast shrink to 65% (0.1s)
    timeline.to(character, {
        y: 50,
        scale: 0.65,
        duration: 0.1, // Even faster - 100ms snap
        ease: 'expo.in', // Exponential acceleration for dramatic snap
    });
    // NOTE: Glow following removed - GlowSystem tracks character position via physics
    // Phase 2c: Shadow shrinks but stays on ground (no Y movement)
    // CRITICAL: Shadow shrinks to 0.65, NOT to zero!
    timeline.to(shadow, {
        xPercent: -50, // Keep centered (static, not animated)
        scaleX: 0.65,
        scaleY: 0.65,
        duration: 0.1,
        ease: 'expo.in',
    }, `-=0.1` // Parallel with character snap
    );
    // Phase 3: Fade character to transparent IMMEDIATELY after snap (0.05s)
    timeline.to(character, {
        opacity: 0.25, // Dim logo state (lighter gray)
        duration: 0.05, // Lightning fast - 50ms
        ease: 'power2.in',
    });
    // NOTE: Glow fade-out removed - GlowSystem handles fade out via animation controller
    // Phase 3b: Fade out shadow
    timeline.to(shadow, {
        opacity: 0,
        duration: 0.06, // Lightning fast - 60ms
        ease: 'power2.in',
    }, `-=0.05` // Start slightly before character fade finishes
    );
    // CRITICAL: Freeze rotation at 0° for logo state
    timeline.set(character, { rotation: 0 }, '>');
    // INSTANT SNAP: Set eyes to OFF/logo shape at the end
    // Using gsap.set (instant, no morphing) to avoid glitchy point flipping
    if (eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg && eyeLeft && eyeRight) {
        const offDimensions = getEyeDimensions('OFF_LEFT'); // Same for both sides
        // Kill any existing eye tweens to prevent conflicts
        gsapWithCSS.killTweensOf([eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg, eyeLeft, eyeRight]);
        // Snap to OFF shapes instantly (no animation = no morphing glitches)
        timeline.set(eyeLeftPath, { attr: { d: getEyeShape('OFF_LEFT', 'left') } }, '>');
        timeline.set(eyeRightPath, { attr: { d: getEyeShape('OFF_RIGHT', 'right') } }, '<');
        // Update viewBox to match OFF dimensions
        timeline.set([eyeLeftSvg, eyeRightSvg], { attr: { viewBox: offDimensions.viewBox } }, '<');
        // Update container dimensions and position for logo state
        // Eyes move closer together (toward center) and vertically centered
        const eyeOffsetX = 3; // px toward center
        const eyeOffsetY = 3; // px down
        timeline.set(eyeLeft, {
            width: offDimensions.width * sizeScale,
            height: offDimensions.height * sizeScale,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            x: eyeOffsetX * sizeScale, // Move right toward center
            y: eyeOffsetY * sizeScale,
        }, '<');
        timeline.set(eyeRight, {
            width: offDimensions.width * sizeScale,
            height: offDimensions.height * sizeScale,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            x: -eyeOffsetX * sizeScale, // Move left toward center
            y: eyeOffsetY * sizeScale,
        }, '<');
    }
    return timeline;
}

/**
 * Shadow Tracker - Dynamic shadow that responds to character Y position
 *
 * Instead of animating shadow in multiple disconnected places (idle, emotions, etc.),
 * this tracker continuously watches character Y position and updates shadow accordingly.
 *
 * The relationship is inverse:
 * - Higher Y (jumping up) → shadow shrinks + fades
 * - Lower Y (grounded) → shadow grows + darkens
 */
const DEFAULT_CONFIG$1 = {
    maxHeight: 70, // Max jump height in emotions (excited, jump)
    groundedScaleX: SHADOW.scaleXWhenDown,
    groundedScaleY: SHADOW.scaleYWhenDown,
    maxHeightScaleX: SHADOW.scaleXWhenUp,
    maxHeightScaleY: SHADOW.scaleYWhenUp,
    groundedOpacity: SHADOW.opacityWhenDown,
    maxHeightOpacity: 0, // Fully invisible at max height (jump apex)
};
/**
 * Creates a shadow tracker that updates shadow based on character Y position
 *
 * @param character - The character element to track Y position from
 * @param shadow - The shadow element to update
 * @param config - Optional configuration overrides
 * @returns Controls for starting/stopping the tracker
 */
function createShadowTracker(character, shadow, config = {}) {
    const cfg = { ...DEFAULT_CONFIG$1, ...config };
    let isRunning = false;
    let isPaused = false;
    /**
     * Calculate shadow properties from character Y position
     * Uses an eased curve to make idle breathing more visible while
     * shadow fully disappears at high jump heights.
     *
     * The power curve (t^0.6) front-loads changes so small movements
     * (idle float) create noticeable shadow breathing.
     */
    function updateShadow() {
        if (isPaused)
            return;
        // Get current Y position (negative = up, 0 = grounded)
        const y = gsapWithCSS.getProperty(character, 'y');
        // Calculate interpolation factor: 0 = grounded, 1 = max height
        // Y is negative when up, so we negate it
        const linearT = Math.min(1, Math.max(0, -y / cfg.maxHeight));
        // Apply power curve to front-load the change
        // At idle float (y=-12, linearT=0.17): easedT ≈ 0.29 → more noticeable shadow shrink
        // At jump apex (y=-70, linearT=1.0): easedT = 1.0 → shadow fully gone
        const easedT = Math.pow(linearT, 0.6);
        // Interpolate scale and opacity using eased t
        const scaleX = gsapWithCSS.utils.interpolate(cfg.groundedScaleX, cfg.maxHeightScaleX, easedT);
        const scaleY = gsapWithCSS.utils.interpolate(cfg.groundedScaleY, cfg.maxHeightScaleY, easedT);
        const opacity = gsapWithCSS.utils.interpolate(cfg.groundedOpacity, cfg.maxHeightOpacity, easedT);
        // Apply to shadow (using set for immediate update)
        gsapWithCSS.set(shadow, { scaleX, scaleY, opacity });
    }
    function start() {
        if (isRunning)
            return;
        isRunning = true;
        isPaused = false;
        gsapWithCSS.ticker.add(updateShadow);
    }
    function stop() {
        if (!isRunning)
            return;
        isRunning = false;
        isPaused = false;
        gsapWithCSS.ticker.remove(updateShadow);
    }
    function pause() {
        isPaused = true;
    }
    function resume() {
        isPaused = false;
    }
    function isActive() {
        return isRunning && !isPaused;
    }
    function setGrounded() {
        gsapWithCSS.set(shadow, {
            scaleX: cfg.groundedScaleX,
            scaleY: cfg.groundedScaleY,
            opacity: cfg.groundedOpacity,
        });
    }
    return {
        start,
        stop,
        pause,
        resume,
        isActive,
        setGrounded,
    };
}

/**
 * Glow System - Physics-based glow tracking with snake-like oscillation
 *
 * Two glow layers (inner/outer) that:
 * 1. Track character position via spring physics (delayed, natural response)
 * 2. Oscillate on X-axis with phase offsets (snake-like wave effect)
 * 3. Chain together: Anty → Outer glow → Inner glow
 *
 * The chained springs + phase-offset oscillation creates an ethereal,
 * snake-like trailing effect behind the character.
 */
// =============================================================================
// DEFAULT CONFIG
// =============================================================================
const DEFAULT_CONFIG = {
    // Spring physics
    outerStiffness: 0.08, // Outer glow follows character with slight lag
    innerStiffness: 0.12, // Inner glow follows outer (tighter, but still delayed)
    damping: 0.75, // Prevents excessive bouncing
    // Oscillation (snake wiggle + vertical bob)
    outerOscillationAmplitudeX: 40, // Outer glow swings ±40px horizontally
    innerOscillationAmplitudeX: 28, // Inner glow swings ±28px horizontally
    outerOscillationAmplitudeY: 18, // Outer glow bobs down 18px from base
    innerOscillationAmplitudeY: 10, // Inner glow bobs down 10px from base
    oscillationFrequency: 0.22, // ~4.5 second full cycle
    innerPhaseOffset: 1.8, // ~103 degrees behind outer
    // Visibility
    visibleOpacity: 1,
    hiddenOpacity: 0,
};
// =============================================================================
// GLOW SYSTEM FACTORY
// =============================================================================
/**
 * Creates a glow tracking system with spring physics and oscillation
 *
 * @param character - The character element to track position from
 * @param outerGlow - The outer (larger, softer) glow element
 * @param innerGlow - The inner (smaller, tighter) glow element
 * @param sizeScale - Scale factor for oscillation amplitudes (size / 160)
 * @param config - Optional configuration overrides
 * @returns Controls for the glow system
 */
function createGlowSystem(character, outerGlow, innerGlow, sizeScale = 1, config = {}) {
    // Mutable config that can be updated when sizeScale changes
    let currentSizeScale = sizeScale;
    const cfg = {
        ...DEFAULT_CONFIG,
        // Scale oscillation amplitudes by sizeScale (frequency stays in Hz, not pixels)
        outerOscillationAmplitudeX: DEFAULT_CONFIG.outerOscillationAmplitudeX * currentSizeScale,
        innerOscillationAmplitudeX: DEFAULT_CONFIG.innerOscillationAmplitudeX * currentSizeScale,
        outerOscillationAmplitudeY: DEFAULT_CONFIG.outerOscillationAmplitudeY * currentSizeScale,
        innerOscillationAmplitudeY: DEFAULT_CONFIG.innerOscillationAmplitudeY * currentSizeScale,
        ...config,
    };
    // State
    let isRunning = false;
    let isPaused = false;
    let time = 0;
    // Spring states for each glow layer
    const outerSpring = { x: 0, y: 0, velocityX: 0, velocityY: 0 };
    const innerSpring = { x: 0, y: 0, velocityX: 0, velocityY: 0 };
    // =============================================================================
    // PHYSICS UPDATE
    // =============================================================================
    /**
     * Update spring physics and oscillation each frame
     */
    function update() {
        if (isPaused)
            return;
        // Get delta time from GSAP ticker (seconds)
        const deltaTime = gsapWithCSS.ticker.deltaRatio() / 60;
        time += deltaTime;
        // Get character's current position
        const rawX = gsapWithCSS.getProperty(character, 'x');
        const rawY = gsapWithCSS.getProperty(character, 'y');
        // DEFENSIVE: Ensure we get valid numbers, default to 0
        const characterX = typeof rawX === 'number' && isFinite(rawX) ? rawX : 0;
        const characterY = typeof rawY === 'number' && isFinite(rawY) ? rawY : 0;
        // --- OUTER GLOW: follows character ---
        updateSpring(outerSpring, characterX, characterY, cfg.outerStiffness, cfg.damping);
        // --- INNER GLOW: follows outer glow (chained) ---
        updateSpring(innerSpring, outerSpring.x, outerSpring.y, cfg.innerStiffness, cfg.damping);
        // --- OSCILLATION: sine wave on X, cosine wave on Y (starts at top, bobs down) ---
        const phase = time * cfg.oscillationFrequency * Math.PI * 2;
        // X oscillation (left-right snake)
        const outerOscillationX = Math.sin(phase) * cfg.outerOscillationAmplitudeX;
        const innerOscillationX = Math.sin(phase + cfg.innerPhaseOffset) * cfg.innerOscillationAmplitudeX;
        // Y oscillation (up-down bob) - use (1 - cos) so 0 is top, amplitude is bottom
        const outerOscillationY = (1 - Math.cos(phase)) * cfg.outerOscillationAmplitudeY * 0.5;
        const innerOscillationY = (1 - Math.cos(phase + cfg.innerPhaseOffset)) * cfg.innerOscillationAmplitudeY * 0.5;
        // --- APPLY POSITIONS ---
        const outerX = outerSpring.x + outerOscillationX;
        const outerY = outerSpring.y + outerOscillationY;
        const innerX = innerSpring.x + innerOscillationX;
        const innerY = innerSpring.y + innerOscillationY;
        // Debug: log if values are unexpectedly large
        if (ENABLE_ANIMATION_DEBUG_LOGS && (Math.abs(outerX) > 100 || Math.abs(outerY) > 100)) {
            console.warn('[GlowSystem] Large values detected:', { outerX, outerY, innerX, innerY, characterX, characterY });
        }
        gsapWithCSS.set(outerGlow, { x: outerX, y: outerY });
        gsapWithCSS.set(innerGlow, { x: innerX, y: innerY });
    }
    /**
     * Update a single spring towards target
     */
    function updateSpring(spring, targetX, targetY, stiffness, damping) {
        // Calculate spring force (difference from target)
        const forceX = (targetX - spring.x) * stiffness;
        const forceY = (targetY - spring.y) * stiffness;
        // Apply force to velocity
        spring.velocityX += forceX;
        spring.velocityY += forceY;
        // Apply damping
        spring.velocityX *= damping;
        spring.velocityY *= damping;
        // Update position
        spring.x += spring.velocityX;
        spring.y += spring.velocityY;
    }
    // =============================================================================
    // LIFECYCLE CONTROLS
    // =============================================================================
    function start() {
        if (isRunning)
            return;
        isRunning = true;
        isPaused = false;
        gsapWithCSS.ticker.add(update);
    }
    function stop() {
        if (!isRunning)
            return;
        isRunning = false;
        isPaused = false;
        gsapWithCSS.ticker.remove(update);
    }
    function pause() {
        isPaused = true;
    }
    function resume() {
        isPaused = false;
    }
    function isActive() {
        return isRunning && !isPaused;
    }
    // =============================================================================
    // VISIBILITY CONTROLS
    // =============================================================================
    function fadeIn(duration = 0.4) {
        return gsapWithCSS.to([outerGlow, innerGlow], {
            opacity: cfg.visibleOpacity,
            duration,
            ease: 'power2.out',
        });
    }
    function fadeOut(duration = 0.3) {
        return gsapWithCSS.to([outerGlow, innerGlow], {
            opacity: cfg.hiddenOpacity,
            duration,
            ease: 'power2.in',
        });
    }
    function show() {
        gsapWithCSS.set([outerGlow, innerGlow], { opacity: cfg.visibleOpacity });
    }
    function hide() {
        gsapWithCSS.set([outerGlow, innerGlow], { opacity: cfg.hiddenOpacity });
    }
    // =============================================================================
    // UTILITY
    // =============================================================================
    /**
     * Snap glows to character position (reset spring lag)
     * Useful after teleporting character or on initialization
     */
    function snapToCharacter() {
        const rawX = gsapWithCSS.getProperty(character, 'x');
        const rawY = gsapWithCSS.getProperty(character, 'y');
        // DEFENSIVE: Ensure we get valid numbers, default to 0
        // gsap.getProperty can return unexpected values before element is fully initialized
        const characterX = typeof rawX === 'number' && isFinite(rawX) ? rawX : 0;
        const characterY = typeof rawY === 'number' && isFinite(rawY) ? rawY : 0;
        // Debug: Log if we got unexpected values
        if (ENABLE_ANIMATION_DEBUG_LOGS && (rawX !== characterX || rawY !== characterY)) {
            console.warn('[GlowSystem] snapToCharacter got invalid values, using 0:', { rawX, rawY });
        }
        // Reset outer spring
        outerSpring.x = characterX;
        outerSpring.y = characterY;
        outerSpring.velocityX = 0;
        outerSpring.velocityY = 0;
        // Reset inner spring
        innerSpring.x = characterX;
        innerSpring.y = characterY;
        innerSpring.velocityX = 0;
        innerSpring.velocityY = 0;
        // Apply immediately
        gsapWithCSS.set(outerGlow, { x: characterX, y: characterY });
        gsapWithCSS.set(innerGlow, { x: characterX, y: characterY });
    }
    /**
     * Update the size scale dynamically (e.g., when character size changes)
     * Recalculates oscillation amplitudes based on new scale
     */
    function updateSizeScale(newSizeScale) {
        currentSizeScale = newSizeScale;
        cfg.outerOscillationAmplitudeX = DEFAULT_CONFIG.outerOscillationAmplitudeX * currentSizeScale;
        cfg.innerOscillationAmplitudeX = DEFAULT_CONFIG.innerOscillationAmplitudeX * currentSizeScale;
        cfg.outerOscillationAmplitudeY = DEFAULT_CONFIG.outerOscillationAmplitudeY * currentSizeScale;
        cfg.innerOscillationAmplitudeY = DEFAULT_CONFIG.innerOscillationAmplitudeY * currentSizeScale;
    }
    // =============================================================================
    // RETURN CONTROLS
    // =============================================================================
    return {
        start,
        stop,
        pause,
        resume,
        isActive,
        fadeIn,
        fadeOut,
        show,
        hide,
        snapToCharacter,
        updateSizeScale,
    };
}

/**
 * React Hook for Animation Controller
 *
 * Provides a clean React API for the AnimationController.
 * Manages lifecycle, initialization, and state synchronization.
 */
/**
 * React hook that wraps AnimationController
 *
 * @param elements - DOM elements to animate
 * @param options - Controller configuration and callbacks
 * @returns Animation control methods
 *
 * @example
 * ```tsx
 * const {
 *   playEmotion,
 *   startIdle,
 *   getState,
 *   isReady
 * } = useAnimationController(
 *   {
 *     container: containerRef.current,
 *     character: characterRef.current,
 *     eyeLeft: leftEyeRef.current,
 *     eyeRight: rightEyeRef.current,
 *   },
 *   {
 *     enableLogging: true,
 *     isOff: false,
 *     searchMode: false,
 *   }
 * );
 *
 * // Play an emotion
 * playEmotion('happy', { priority: 3 });
 *
 * // Start idle
 * startIdle();
 * ```
 */
function useAnimationController(elements, options = {}) {
    const { enableLogging = false, enableQueue = true, maxQueueSize = 10, defaultPriority = 2, callbacks = {}, onStateChange, onAnimationSequenceChange, isOff = false, logoMode = false, searchMode = false, autoStartIdle = true, sizeScale = 1, } = options;
    // Controller instance (persistent across renders)
    const controllerRef = react.useRef(null);
    // Track initialization state
    const isInitialized = react.useRef(false);
    const isReady = react.useRef(false);
    // Track previous states for change detection
    const previousIsOffRef = react.useRef(isOff);
    const previousSearchModeRef = react.useRef(searchMode);
    // Track logoMode for use in callbacks (emotion completion)
    const logoModeRef = react.useRef(logoMode);
    logoModeRef.current = logoMode;
    // Track if we're in a wake-up transition (prevents auto-start idle race)
    const isWakingUpRef = react.useRef(false);
    // Shadow tracker - dynamically updates shadow based on character Y position
    const shadowTrackerRef = react.useRef(null);
    // Glow system - physics-based glow tracking with snake-like oscillation
    const glowSystemRef = react.useRef(null);
    // NOTE: idleTimelineRef REMOVED - controller is single owner of idle
    // The controller manages idle internally, hook just calls controller methods
    /**
     * Initialize controller
     */
    react.useEffect(() => {
        if (isInitialized.current)
            return;
        if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log('[useAnimationController] Initializing controller');
        }
        // Merge callbacks with state change handler
        const mergedCallbacks = {
            ...callbacks,
            onStateChange: (from, to) => {
                callbacks.onStateChange?.(from, to);
                onStateChange?.(from, to);
            },
            onEmotionMotionStart: (emotion, timelineId) => {
                // Eye-only actions (look-left, look-right) are secondary animations like blinks
                // They shouldn't trigger position tracking or verbose logging
                const isEyeOnlyAction = emotion === 'look-left' || emotion === 'look-right';
                if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS && !isEyeOnlyAction) {
                    console.log(`[useAnimationController] Emotion motion START: ${emotion}`);
                }
                // Only notify position tracker for body-moving animations
                if (!isEyeOnlyAction) {
                    onAnimationSequenceChange?.(`MOTION_START:${emotion.toUpperCase()}`);
                }
                callbacks.onEmotionMotionStart?.(emotion, timelineId);
            },
            onEmotionMotionComplete: (emotion, timelineId, duration) => {
                // Eye-only actions (look-left, look-right) are secondary animations like blinks
                // They shouldn't trigger position tracking or verbose logging
                const isEyeOnlyAction = emotion === 'look-left' || emotion === 'look-right';
                if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS && !isEyeOnlyAction) {
                    console.log(`[useAnimationController] Emotion motion COMPLETE: ${emotion} (${duration}ms)`);
                }
                // Only notify position tracker for body-moving animations
                if (!isEyeOnlyAction) {
                    onAnimationSequenceChange?.(`MOTION_COMPLETE:${emotion.toUpperCase()}:${duration}`);
                }
                // Call BOTH the callback from options AND any parent callback
                callbacks.onEmotionMotionComplete?.(emotion, timelineId, duration);
                // Reset to IDLE after a brief delay (allows position tracker to capture MOTION_COMPLETE)
                // Skip delay for eye-only actions since there's no position tracking
                if (!isEyeOnlyAction) {
                    setTimeout(() => {
                        onAnimationSequenceChange?.('CONTROLLER: Idle animation');
                    }, 100);
                }
            },
        };
        // Create controller
        controllerRef.current = new AnimationController(mergedCallbacks, {
            enableLogging,
            enableQueue,
            maxQueueSize,
            defaultPriority,
        });
        isInitialized.current = true;
        if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log('[useAnimationController] Controller initialized');
        }
        // Cleanup on unmount
        return () => {
            if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.log('[useAnimationController] Cleaning up controller');
            }
            // Stop shadow tracker
            shadowTrackerRef.current?.stop();
            shadowTrackerRef.current = null;
            // Stop glow system
            glowSystemRef.current?.stop();
            glowSystemRef.current = null;
            // Controller.destroy() kills all timelines including idle
            controllerRef.current?.destroy();
            controllerRef.current = null;
            isInitialized.current = false;
            isReady.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps - only initialize once
    /**
     * Check if elements are available and initialize character
     */
    react.useEffect(() => {
        const hasRequiredElements = elements.container !== null &&
            elements.container !== undefined &&
            elements.character !== null &&
            elements.character !== undefined;
        const wasReady = isReady.current;
        isReady.current = hasRequiredElements;
        if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS && wasReady !== isReady.current) {
            console.log('[useAnimationController] Ready state changed:', isReady.current);
        }
        // Initialize character when elements become ready
        if (hasRequiredElements && !wasReady && elements.character) {
            if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.log('[useAnimationController] Calling initializeCharacter()');
            }
            initializeCharacter({
                character: elements.character,
                shadow: elements.shadow || null,
                eyeLeft: elements.eyeLeft,
                eyeRight: elements.eyeRight,
                eyeLeftPath: elements.eyeLeftPath,
                eyeRightPath: elements.eyeRightPath,
                eyeLeftSvg: elements.eyeLeftSvg,
                eyeRightSvg: elements.eyeRightSvg,
                innerGlow: elements.innerGlow || null,
                outerGlow: elements.outerGlow || null,
                leftBody: elements.leftBody,
                rightBody: elements.rightBody,
            }, { isOff, logoMode, sizeScale });
            // Create shadow tracker - dynamically updates shadow based on character Y position
            // This replaces all the disjointed shadow animations in idle, emotions, etc.
            if (elements.shadow && !shadowTrackerRef.current) {
                shadowTrackerRef.current = createShadowTracker(elements.character, elements.shadow);
                // Start immediately (will track character Y at 60fps)
                // Don't start if in OFF mode or logo mode - wake-up transition handles shadow, logo mode hides it
                if (!isOff && !logoMode) {
                    shadowTrackerRef.current.start();
                }
                if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                    console.log('[useAnimationController] Shadow tracker created and started');
                }
            }
            // Create glow system - physics-based tracking with snake-like oscillation
            // This replaces all the disjointed glow animations scattered throughout
            if (elements.innerGlow && elements.outerGlow && !glowSystemRef.current) {
                glowSystemRef.current = createGlowSystem(elements.character, elements.outerGlow, elements.innerGlow, sizeScale);
                // CRITICAL: Snap to character position immediately after creation
                // Springs start at (0,0) but character may already have non-zero position
                glowSystemRef.current.snapToCharacter();
                // Start immediately (will track character position at 60fps)
                // Don't start if in OFF mode or logo mode - wake-up handles glow fade-in, logo mode hides it
                if (!isOff && !logoMode) {
                    glowSystemRef.current.start();
                    glowSystemRef.current.show();
                }
                else {
                    glowSystemRef.current.hide();
                }
                if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                    console.log('[useAnimationController] Glow system created and started');
                }
            }
        }
    }, [elements, enableLogging, isOff, logoMode]);
    /**
     * Update glow system when sizeScale changes
     * This ensures oscillation amplitudes stay proportional to character size
     * AND resets spring positions to account for CSS base position changes
     */
    react.useEffect(() => {
        if (glowSystemRef.current) {
            glowSystemRef.current.updateSizeScale(sizeScale);
            glowSystemRef.current.snapToCharacter();
        }
    }, [sizeScale]);
    /**
     * Handle OFF state changes (wake-up and power-off sequences)
     */
    react.useEffect(() => {
        if (!controllerRef.current)
            return;
        const wasOff = previousIsOffRef.current;
        const isNowOff = isOff;
        previousIsOffRef.current = isOff;
        // Wake-up sequence (OFF → ON)
        if (wasOff && !isNowOff) {
            if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.log('[useAnimationController] Wake-up sequence: OFF → ON - CALLING WAKE-UP ANIMATION');
            }
            // Set flag to prevent auto-start idle race condition
            isWakingUpRef.current = true;
            // Notify debug overlay
            onAnimationSequenceChange?.('CONTROLLER: Wake-up (OFF → ON)');
            // Kill all animations via controller (single source of truth)
            controllerRef.current.killAll();
            // CRITICAL FIX: Actually call the wake-up animation!
            if (elements.character && elements.shadow) {
                // Create and play wake-up timeline with CORRECT signature (expects object)
                const wakeUpTl = createWakeUpAnimation({
                    character: elements.character,
                    shadow: elements.shadow,
                    innerGlow: elements.innerGlow || undefined,
                    outerGlow: elements.outerGlow || undefined,
                    // Pass eye elements
                    eyeLeft: elements.eyeLeft || undefined,
                    eyeRight: elements.eyeRight || undefined,
                    eyeLeftPath: elements.eyeLeftPath || undefined,
                    eyeRightPath: elements.eyeRightPath || undefined,
                    eyeLeftSvg: elements.eyeLeftSvg || undefined,
                    eyeRightSvg: elements.eyeRightSvg || undefined,
                }, sizeScale);
                // Start glow immediately WITH the pop (not after)
                if (glowSystemRef.current) {
                    glowSystemRef.current.snapToCharacter(); // Reset spring positions
                    glowSystemRef.current.start();
                    glowSystemRef.current.fadeIn(0.3); // Fade in with the pop
                    if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                        console.log('[useAnimationController] Glow system started with wake-up');
                    }
                }
                // Start idle when wake-up completes - use controller's startIdle
                wakeUpTl.eventCallback('onComplete', () => {
                    // Clear wake-up flag
                    isWakingUpRef.current = false;
                    if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                        console.log('[useAnimationController] Wake-up complete, starting idle via controller');
                    }
                    // Create idle timeline and register with controller
                    if (autoStartIdle && elements.character && elements.shadow && controllerRef.current) {
                        const baseScale = controllerRef.current.getSuperModeScale() ?? 1;
                        const idleResult = createIdleAnimation({
                            character: elements.character,
                            shadow: elements.shadow,
                            eyeLeft: elements.eyeLeft || undefined,
                            eyeRight: elements.eyeRight || undefined,
                            eyeLeftPath: elements.eyeLeftPath || undefined,
                            eyeRightPath: elements.eyeRightPath || undefined,
                            eyeLeftSvg: elements.eyeLeftSvg || undefined,
                            eyeRightSvg: elements.eyeRightSvg || undefined,
                        }, { delay: 0, baseScale, sizeScale });
                        // Register with controller - controller owns idle and blink scheduler
                        const idleElements = [elements.character, elements.shadow].filter(Boolean);
                        controllerRef.current.startIdle(idleResult.timeline, idleElements, {
                            pauseBlinks: idleResult.pauseBlinks,
                            resumeBlinks: idleResult.resumeBlinks,
                            killBlinks: idleResult.killBlinks,
                        });
                        // Notify debug overlay
                        onAnimationSequenceChange?.('CONTROLLER: Idle animation');
                    }
                    // Start shadow tracker after wake-up (shadow fade-in is handled by wake-up animation)
                    if (shadowTrackerRef.current) {
                        shadowTrackerRef.current.start();
                        if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                            console.log('[useAnimationController] Shadow tracker started after wake-up');
                        }
                    }
                });
                wakeUpTl.play();
            }
            else {
                // Clear flag on failure so idle can still start
                isWakingUpRef.current = false;
                if (ENABLE_ANIMATION_DEBUG_LOGS) {
                    console.error('[useAnimationController] Wake-up failed - missing elements', {
                        hasCharacter: !!elements.character,
                        hasShadow: !!elements.shadow
                    });
                }
            }
        }
        // Power-off sequence (ON → OFF)
        if (!wasOff && isNowOff) {
            if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.log('[useAnimationController] Power-off sequence: ON → OFF - CALLING POWER-OFF ANIMATION');
            }
            // Stop shadow tracker - power-off animation handles its own shadow fade
            if (shadowTrackerRef.current) {
                shadowTrackerRef.current.stop();
                if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                    console.log('[useAnimationController] Shadow tracker stopped for power-off');
                }
            }
            // Fade out and stop glow system for power-off (gradual like shadow)
            if (glowSystemRef.current) {
                glowSystemRef.current.fadeOut(0.7); // Slower fade out
                // Stop after fade completes
                setTimeout(() => {
                    glowSystemRef.current?.stop();
                }, 700);
                if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                    console.log('[useAnimationController] Glow system fading out for power-off');
                }
            }
            // Notify debug overlay
            onAnimationSequenceChange?.('CONTROLLER: Power-off (ON → OFF)');
            // Kill all animations via controller (single source of truth)
            controllerRef.current.killAll();
            // CRITICAL FIX: Actually call the power-off animation!
            if (elements.character && elements.shadow) {
                // Create and play power-off timeline
                const powerOffTl = createPowerOffAnimation({
                    character: elements.character,
                    shadow: elements.shadow,
                    innerGlow: elements.innerGlow || undefined,
                    outerGlow: elements.outerGlow || undefined,
                    // Pass eye elements
                    eyeLeft: elements.eyeLeft || undefined,
                    eyeRight: elements.eyeRight || undefined,
                    eyeLeftPath: elements.eyeLeftPath || undefined,
                    eyeRightPath: elements.eyeRightPath || undefined,
                    eyeLeftSvg: elements.eyeLeftSvg || undefined,
                    eyeRightSvg: elements.eyeRightSvg || undefined,
                }, sizeScale);
                powerOffTl.play();
                if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                    console.log('[useAnimationController] Power-off animation started');
                }
            }
            else {
                if (ENABLE_ANIMATION_DEBUG_LOGS) {
                    console.error('[useAnimationController] Power-off failed - missing elements', {
                        hasCharacter: !!elements.character,
                        hasShadow: !!elements.shadow
                    });
                }
            }
        }
        // Only re-run when isOff changes - other deps are stable or captured in refs
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOff, enableLogging]);
    /**
     * Handle search mode changes
     */
    react.useEffect(() => {
        if (!controllerRef.current)
            return;
        const wasSearching = previousSearchModeRef.current;
        const isNowSearching = searchMode;
        previousSearchModeRef.current = searchMode;
        // Entering search mode
        if (!wasSearching && isNowSearching) {
            if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.log('[useAnimationController] Entering search mode - pausing idle');
            }
            // Pause idle animation
            controllerRef.current.pauseIdle();
            // Pause shadow tracker - shadow is hidden during search
            if (shadowTrackerRef.current) {
                shadowTrackerRef.current.pause();
            }
            // Pause and hide glow system during search
            if (glowSystemRef.current) {
                glowSystemRef.current.pause();
                glowSystemRef.current.hide(); // Instant hide for search mode
            }
        }
        // Exiting search mode
        if (wasSearching && !isNowSearching) {
            if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.log('[useAnimationController] Exiting search mode - restoring eyes and resuming idle');
            }
            // Restore eyes to IDLE before resuming idle
            if (elements.eyeLeft && elements.eyeRight && elements.eyeLeftPath && elements.eyeRightPath && elements.eyeLeftSvg && elements.eyeRightSvg) {
                // FIXED: Use static import instead of dynamic import for better performance
                const restoreTl = createEyeAnimation({
                    leftEye: elements.eyeLeft,
                    rightEye: elements.eyeRight,
                    leftEyePath: elements.eyeLeftPath,
                    rightEyePath: elements.eyeRightPath,
                    leftEyeSvg: elements.eyeLeftSvg,
                    rightEyeSvg: elements.eyeRightSvg,
                }, 'IDLE', { duration: 0.3, sizeScale });
                // NOTE: Glow show is now triggered from page.tsx via showGlows() for earlier timing
                restoreTl.eventCallback('onComplete', () => {
                    controllerRef.current?.resumeIdle();
                    // Resume shadow tracker after exiting search
                    if (shadowTrackerRef.current) {
                        shadowTrackerRef.current.resume();
                    }
                });
                restoreTl.play();
            }
            else {
                // Fallback if eye elements are not available
                controllerRef.current.resumeIdle();
                // Resume shadow tracker
                if (shadowTrackerRef.current) {
                    shadowTrackerRef.current.resume();
                }
                // NOTE: Glow show is now triggered from page.tsx via showGlows()
            }
        }
        // Only re-run when searchMode changes - eye elements are stable refs
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchMode, enableLogging]);
    /**
     * Auto-start idle animation when ready
     */
    react.useEffect(() => {
        if (!autoStartIdle || !isReady.current || !controllerRef.current)
            return;
        if (isOff || searchMode)
            return;
        // Skip if we're in a wake-up transition (wake-up handles its own idle start)
        if (isWakingUpRef.current)
            return;
        // Skip if idle is explicitly prevented (e.g., during search morph animation)
        if (controllerRef.current.isIdlePrevented())
            return;
        // Check controller's idle state, not a local ref
        if (controllerRef.current.isIdle())
            return; // Already running
        if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log('[useAnimationController] Auto-starting idle animation');
        }
        // Create idle timeline using createIdleAnimation with eye elements
        const baseScale = controllerRef.current.getSuperModeScale() ?? 1;
        const idleResult = createIdleAnimation({
            character: elements.character,
            shadow: elements.shadow,
            // Pass eye elements
            eyeLeft: elements.eyeLeft || undefined,
            eyeRight: elements.eyeRight || undefined,
            eyeLeftPath: elements.eyeLeftPath || undefined,
            eyeRightPath: elements.eyeRightPath || undefined,
            eyeLeftSvg: elements.eyeLeftSvg || undefined,
            eyeRightSvg: elements.eyeRightSvg || undefined,
        }, { delay: 0, baseScale, sizeScale });
        // Register idle with controller - controller owns idle and blink scheduler
        const idleElements = Array.from(new Set([
            elements.character,
            elements.shadow,
        ].filter(Boolean)));
        controllerRef.current.startIdle(idleResult.timeline, idleElements, {
            pauseBlinks: idleResult.pauseBlinks,
            resumeBlinks: idleResult.resumeBlinks,
            killBlinks: idleResult.killBlinks,
        });
    }, [autoStartIdle, isOff, searchMode, elements, enableLogging]);
    /**
     * Play emotion animation
     */
    const playEmotion = react.useCallback((emotion, animationOptions = {}) => {
        if (!controllerRef.current) {
            if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.warn('[useAnimationController] Controller not initialized');
            }
            return false;
        }
        if (!isReady.current) {
            if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.warn('[useAnimationController] Elements not ready');
            }
            return false;
        }
        // Validate emotion
        if (!isEmotionType(emotion)) {
            if (ENABLE_ANIMATION_DEBUG_LOGS) {
                console.error(`[useAnimationController] Invalid emotion: ${emotion}`);
            }
            return false;
        }
        if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log(`[useAnimationController] Playing emotion: ${emotion}`);
        }
        // Get emotion config from declarative system
        const emotionConfig = EMOTION_CONFIGS[emotion];
        if (!emotionConfig) {
            if (ENABLE_ANIMATION_DEBUG_LOGS) {
                console.error(`[useAnimationController] Unknown emotion: ${emotion}`);
            }
            return false;
        }
        if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log(`[useAnimationController] Playing emotion: ${emotion}`);
        }
        // CLEANUP: Kill any existing eye tweens for clean handoff on interruption
        const eyeElements = [
            elements.eyeLeft,
            elements.eyeRight,
            elements.eyeLeftPath,
            elements.eyeRightPath,
            elements.eyeLeftSvg,
            elements.eyeRightSvg,
        ].filter(Boolean);
        if (eyeElements.length > 0) {
            gsapWithCSS.killTweensOf(eyeElements);
        }
        // CLEANUP: Reset character transforms to baseline on interruption
        // Preserves super mode scale if active
        const superModeScale = controllerRef.current.getSuperModeScale();
        gsapWithCSS.set(elements.character, {
            rotation: 0,
            rotationY: 0,
            rotationX: 0,
            transformPerspective: 0,
            x: 0,
            y: 0,
            scale: superModeScale ?? 1,
        });
        const tl = interpretEmotionConfig(emotionConfig, {
            character: elements.character,
            eyeLeft: elements.eyeLeft,
            eyeRight: elements.eyeRight,
            eyeLeftPath: elements.eyeLeftPath,
            eyeRightPath: elements.eyeRightPath,
            eyeLeftSvg: elements.eyeLeftSvg,
            eyeRightSvg: elements.eyeRightSvg,
            innerGlow: elements.innerGlow,
            outerGlow: elements.outerGlow,
            leftBody: elements.leftBody,
            rightBody: elements.rightBody,
        }, sizeScale, logoModeRef.current);
        // Collect elements for this emotion (deduplicate to avoid double acquisition)
        const emotionElements = Array.from(new Set([
            elements.character,
            elements.eyeLeft,
            elements.eyeRight,
        ].filter(Boolean)));
        // Pass flags from emotion config
        const optionsWithFlags = {
            ...animationOptions,
            resetIdle: emotionConfig.resetIdle,
            preserveIdle: emotionConfig.preserveIdle,
        };
        return controllerRef.current.playEmotion(emotion, tl, emotionElements, optionsWithFlags);
    }, [elements, enableLogging]);
    /**
     * Transition to a new state
     */
    const transitionTo = react.useCallback((state, animationOptions = {}) => {
        if (!controllerRef.current) {
            if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.warn('[useAnimationController] Controller not initialized');
            }
            return false;
        }
        if (!isReady.current) {
            if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.warn('[useAnimationController] Elements not ready');
            }
            return false;
        }
        if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log(`[useAnimationController] Transitioning to: ${state}`);
        }
        // Create timeline for transition
        const tl = gsapWithCSS.timeline();
        // Collect elements for transition
        const transitionElements = [
            elements.character,
            elements.container,
        ].filter(Boolean);
        return controllerRef.current.transitionTo(state, null, tl, transitionElements, animationOptions);
    }, [elements, enableLogging]);
    /**
     * Start idle animation
     */
    const startIdle = react.useCallback(() => {
        if (!controllerRef.current) {
            if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.warn('[useAnimationController] Controller not initialized');
            }
            return;
        }
        if (!isReady.current) {
            if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
                console.warn('[useAnimationController] Elements not ready');
            }
            return;
        }
        if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log('[useAnimationController] Starting idle animation');
        }
        // Controller's startIdle already kills existing idle first
        // Create new idle timeline using createIdleAnimation with eye elements
        const baseScale = controllerRef.current.getSuperModeScale() ?? 1;
        const idleResult = createIdleAnimation({
            character: elements.character,
            shadow: elements.shadow,
            // Pass eye elements
            eyeLeft: elements.eyeLeft || undefined,
            eyeRight: elements.eyeRight || undefined,
            eyeLeftPath: elements.eyeLeftPath || undefined,
            eyeRightPath: elements.eyeRightPath || undefined,
            eyeLeftSvg: elements.eyeLeftSvg || undefined,
            eyeRightSvg: elements.eyeRightSvg || undefined,
        }, { delay: 0, baseScale, sizeScale });
        // Register with controller - controller owns idle and blink scheduler
        const idleElements = [
            elements.character,
            elements.shadow,
        ].filter(Boolean);
        controllerRef.current.startIdle(idleResult.timeline, idleElements, {
            pauseBlinks: idleResult.pauseBlinks,
            resumeBlinks: idleResult.resumeBlinks,
            killBlinks: idleResult.killBlinks,
        });
    }, [elements, enableLogging, sizeScale]);
    /**
     * Pause all animations
     */
    const pause = react.useCallback(() => {
        if (!controllerRef.current)
            return;
        if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log('[useAnimationController] Pausing animations');
        }
        controllerRef.current.pauseIdle();
    }, [enableLogging]);
    /**
     * Resume animations
     */
    const resume = react.useCallback(() => {
        if (!controllerRef.current)
            return;
        if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log('[useAnimationController] Resuming animations');
        }
        controllerRef.current.resumeIdle();
    }, [enableLogging]);
    /**
     * Kill all animations
     */
    const killAll = react.useCallback(() => {
        if (!controllerRef.current)
            return;
        if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log('[useAnimationController] Killing all animations');
        }
        // Controller.killAll() handles killing idle (single source of truth)
        controllerRef.current.killAll();
    }, [enableLogging]);
    /**
     * Get current state
     */
    const getState = react.useCallback(() => {
        if (!controllerRef.current) {
            return exports.AnimationState.IDLE;
        }
        return controllerRef.current.getCurrentState();
    }, []);
    /**
     * Get current emotion
     */
    const getEmotion = react.useCallback(() => {
        if (!controllerRef.current) {
            return null;
        }
        return controllerRef.current.getCurrentEmotion();
    }, []);
    /**
     * Check if idle is active (started but may be paused)
     */
    const isIdleActive = react.useCallback(() => {
        if (!controllerRef.current) {
            return false;
        }
        return controllerRef.current.isIdle();
    }, []);
    /**
     * Check if idle is actively playing (not paused)
     */
    const isIdlePlaying = react.useCallback(() => {
        if (!controllerRef.current) {
            return false;
        }
        return controllerRef.current.isIdlePlaying();
    }, []);
    /**
     * Get debug information
     */
    const getDebugInfo = react.useCallback(() => {
        if (!controllerRef.current) {
            throw new Error('Controller not initialized');
        }
        return controllerRef.current.getDebugInfo();
    }, []);
    /**
     * Set super mode scale (preserves scale during emotions)
     * @param scale - Scale value (e.g., 1.45) or null to disable
     */
    const setSuperMode = react.useCallback((scale) => {
        if (!controllerRef.current)
            return;
        if (enableLogging && ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log(`[useAnimationController] Setting super mode scale: ${scale}`);
        }
        controllerRef.current.setSuperMode(scale);
    }, [enableLogging]);
    /**
     * Show glows (for search exit - call early in morph animation)
     */
    const showGlows = react.useCallback((fadeIn = true) => {
        if (!glowSystemRef.current)
            return;
        // CRITICAL: Snap to character position before resuming
        // This ensures glows are correctly positioned after any layout changes
        // that occurred while they were hidden (e.g., search morph, window resize)
        glowSystemRef.current.snapToCharacter();
        glowSystemRef.current.resume();
        if (fadeIn) {
            glowSystemRef.current.fadeIn(0.3);
        }
        else {
            glowSystemRef.current.show();
        }
    }, []);
    /**
     * Hide glows (for search enter)
     */
    const hideGlows = react.useCallback(() => {
        if (!glowSystemRef.current)
            return;
        glowSystemRef.current.pause();
        glowSystemRef.current.hide();
    }, []);
    /**
     * Hide shadow (for search enter - pauses tracker and hides)
     */
    const hideShadow = react.useCallback(() => {
        if (shadowTrackerRef.current) {
            shadowTrackerRef.current.pause();
        }
        if (elements.shadow) {
            gsapWithCSS.to(elements.shadow, { opacity: 0, duration: 0.1, ease: 'power2.in' });
        }
    }, [elements.shadow]);
    /**
     * Show shadow (for search exit - resumes tracker)
     */
    const showShadow = react.useCallback(() => {
        if (shadowTrackerRef.current) {
            shadowTrackerRef.current.resume();
        }
    }, []);
    // CRITICAL: Memoize return object to prevent useEffect re-firing in consumers
    return react.useMemo(() => ({
        playEmotion,
        transitionTo,
        startIdle,
        pause,
        resume,
        killAll,
        getState,
        getEmotion,
        isIdle: isIdleActive,
        isIdlePlaying,
        getDebugInfo,
        setSuperMode,
        showGlows,
        hideGlows,
        hideShadow,
        showShadow,
        isReady: isReady.current,
    }), [playEmotion, transitionTo, startIdle, pause, resume, killAll, getState, getEmotion, isIdleActive, isIdlePlaying, getDebugInfo, setSuperMode, showGlows, hideGlows, hideShadow, showShadow]);
}

// Reference size at which bracketScale produces the desired visual size
const BRACKET_REFERENCE_SIZE = 160;
function useSearchMorph({ characterRef, searchBarRefs, config = DEFAULT_SEARCH_BAR_CONFIG, characterSize = BRACKET_REFERENCE_SIZE, onMorphStart, onMorphComplete, onReturnStart, onReturnComplete, }) {
    const morphingRef = react.useRef(false);
    // Track all active tweens so we can kill them if needed
    const activeTweensRef = react.useRef([]);
    const morphToSearchBar = react.useCallback(() => {
        // Prevent multiple simultaneous morphs
        if (morphingRef.current) {
            if (ENABLE_ANIMATION_DEBUG_LOGS) {
                console.log('[SEARCH] Already morphing, ignoring');
            }
            return;
        }
        morphingRef.current = true;
        if (ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log('[SEARCH] Opening search mode');
        }
        onMorphStart?.();
        // Kill any existing tweens
        activeTweensRef.current.forEach(tween => tween.kill());
        activeTweensRef.current = [];
        const leftBody = characterRef.current?.leftBodyRef?.current;
        const rightBody = characterRef.current?.rightBodyRef?.current;
        const leftEye = characterRef.current?.leftEyeRef?.current;
        const rightEye = characterRef.current?.rightEyeRef?.current;
        const searchBar = searchBarRefs.bar.current;
        const shadow = characterRef.current?.shadowRef?.current;
        if (ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log('[SEARCH] Elements:', {
                leftBody: !!leftBody,
                rightBody: !!rightBody,
                searchBar: !!searchBar,
                shadow: !!shadow,
            });
        }
        if (!leftBody || !rightBody || !searchBar) {
            morphingRef.current = false;
            return;
        }
        // CRITICAL: Pause idle BEFORE killing animations to prevent auto-restart
        if (characterRef.current?.pauseIdle) {
            characterRef.current.pauseIdle();
        }
        // Kill any running animations
        if (characterRef.current?.killAll) {
            characterRef.current.killAll();
        }
        // Kill ALL idle animations including character container
        const character = leftBody.parentElement;
        if (character) {
            gsapWithCSS.killTweensOf(character);
            gsapWithCSS.set(character, { x: 0, y: 0, rotation: 0, scale: 1 });
        }
        gsapWithCSS.killTweensOf([leftBody, rightBody, shadow]);
        // Reset bracket positions to 0 before starting
        gsapWithCSS.set([leftBody, rightBody], { x: 0, y: 0, scale: 1, rotation: 0 });
        // Kill any ongoing animations on eyes
        if (leftEye) {
            gsapWithCSS.killTweensOf(leftEye);
            gsapWithCSS.set(leftEye, { opacity: 1 });
        }
        if (rightEye) {
            gsapWithCSS.killTweensOf(rightEye);
            gsapWithCSS.set(rightEye, { opacity: 1 });
        }
        // Note: Shadow is now handled by hideShadow() which pauses tracker and animates out
        // Calculate positions
        // Compensate bracket scale so brackets are always the same visual size regardless of character size
        const baseBracketScale = config.bracketScale;
        const bracketScale = baseBracketScale * (BRACKET_REFERENCE_SIZE / characterSize);
        // Set search bar to final scale BEFORE reading position
        gsapWithCSS.set(searchBar, { scale: 1, opacity: 0 });
        // Get actual search bar position (at final scale)
        const searchBarRect = searchBar.getBoundingClientRect();
        // Get current bracket sizes (BEFORE scaling)
        const leftBracketRect = leftBody.getBoundingClientRect();
        const rightBracketRect = rightBody.getBoundingClientRect();
        const leftBracketSize = leftBracketRect.width;
        const rightBracketSize = rightBracketRect.width;
        const scaledLeftBracketSize = leftBracketSize * bracketScale;
        const scaledRightBracketSize = rightBracketSize * bracketScale;
        // Get CURRENT center positions of brackets
        const leftCurrentCenterX = leftBracketRect.left + (leftBracketRect.width / 2);
        const leftCurrentCenterY = leftBracketRect.top + (leftBracketRect.height / 2);
        const rightCurrentCenterX = rightBracketRect.left + (rightBracketRect.width / 2);
        const rightCurrentCenterY = rightBracketRect.top + (rightBracketRect.height / 2);
        // Calculate target bracket centers (so OUTER EDGES align with search bar)
        const leftTargetCenterX = searchBarRect.left + (scaledLeftBracketSize / 2);
        const leftTargetCenterY = searchBarRect.top + (scaledLeftBracketSize / 2);
        const rightTargetCenterX = searchBarRect.right - (scaledRightBracketSize / 2);
        const rightTargetCenterY = searchBarRect.bottom - (scaledRightBracketSize / 2);
        // Calculate transforms
        const leftTransformX = leftTargetCenterX - leftCurrentCenterX;
        const leftTransformY = leftTargetCenterY - leftCurrentCenterY;
        const rightTransformX = rightTargetCenterX - rightCurrentCenterX;
        const rightTransformY = rightTargetCenterY - rightCurrentCenterY;
        if (ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log('[MORPH] Transforms:', {
                left: { x: leftTransformX, y: leftTransformY },
                right: { x: rightTransformX, y: rightTransformY }
            });
        }
        // Set z-index on character container AND brackets
        const characterContainer = leftBody.parentElement;
        gsapWithCSS.set(characterContainer, { zIndex: 10 });
        gsapWithCSS.set([leftBody, rightBody], {
            zIndex: 3,
            transformOrigin: '50% 50%'
        });
        // === ANIMATIONS using setTimeout for delays (GSAP delay was being killed) ===
        const searchBorderGradient = searchBarRefs.borderGradient.current;
        const searchPlaceholder = searchBarRefs.placeholder.current;
        const searchKbd = searchBarRefs.kbd.current;
        const searchGlow = searchBarRefs.glow.current;
        // Immediate animations (0ms)
        // Hide shadow (pauses tracker and fades out)
        characterRef.current?.hideShadow?.();
        // Hide character glows (innerGlow/outerGlow) - they shouldn't show during search
        characterRef.current?.hideGlows?.();
        // Squash brackets
        gsapWithCSS.to([leftBody, rightBody], { y: 5, scaleY: 0.92, scaleX: 1.08, duration: 0.08, ease: 'power2.in' });
        // Fade out eyes
        const fadeTargets = [leftEye, rightEye].filter(Boolean);
        if (fadeTargets.length > 0) {
            gsapWithCSS.to(fadeTargets, { opacity: 0, y: -18, duration: 0.15, ease: 'power1.in' });
        }
        // 80ms: Leap up with stretch
        setTimeout(() => {
            gsapWithCSS.to([leftBody, rightBody], { y: -25, scaleY: 1.1, scaleX: 0.95, duration: 0.12, ease: 'power2.out' });
        }, 80);
        // 200ms: Morph out to corners + search bar fade in
        setTimeout(() => {
            gsapWithCSS.to(leftBody, {
                x: leftTransformX, y: leftTransformY,
                scale: bracketScale, scaleX: bracketScale, scaleY: bracketScale,
                duration: 0.35, ease: 'power2.inOut'
            });
            gsapWithCSS.to(rightBody, {
                x: rightTransformX, y: rightTransformY,
                scale: bracketScale, scaleX: bracketScale, scaleY: bracketScale,
                duration: 0.35, ease: 'power2.inOut'
            });
            gsapWithCSS.to(searchBar, { opacity: 1, duration: 0.25, ease: 'power1.out' });
        }, 200);
        // 300ms: Search bar ellipse glow starts fading in (after search bar bg is partly visible)
        setTimeout(() => {
            if (searchGlow) {
                // Start glow fade-in - glow element is sized to match search bar, blur creates the peek effect
                gsapWithCSS.set(searchGlow, { opacity: 0, scale: 0.92 });
                gsapWithCSS.to(searchGlow, { opacity: 0.7, scale: 0.95, duration: 0.35, ease: 'power2.out' });
            }
        }, 300);
        // 420ms: Placeholder and kbd reveal
        setTimeout(() => {
            if (searchPlaceholder) {
                gsapWithCSS.set(searchPlaceholder, { opacity: 0, filter: 'blur(6px)', y: 4 });
                gsapWithCSS.to(searchPlaceholder, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.18, ease: 'power2.out' });
            }
            if (searchKbd) {
                gsapWithCSS.set(searchKbd, { opacity: 0, filter: 'blur(6px)', y: 4 });
                gsapWithCSS.to(searchKbd, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.18, ease: 'power2.out' });
            }
        }, 420);
        // 450ms: Border gradient fade in
        setTimeout(() => {
            if (searchBorderGradient) {
                searchBorderGradient.style.background = `linear-gradient(white, white) padding-box, conic-gradient(from 0deg, #E5EDFF 0%, #C7D2FE 25%, #D8B4FE 50%, #C7D2FE 75%, #E5EDFF 100%) border-box`;
                gsapWithCSS.set(searchBorderGradient, { opacity: 0 });
                gsapWithCSS.to(searchBorderGradient, { opacity: 1, duration: 0.3, ease: 'power1.out' });
                // Start rotating gradient
                const rotationAnim = { deg: 0 };
                gsapWithCSS.to(rotationAnim, {
                    deg: 360, duration: 4, ease: 'none', repeat: -1,
                    onUpdate: () => {
                        if (searchBorderGradient) {
                            searchBorderGradient.style.background = `linear-gradient(white, white) padding-box, conic-gradient(from ${rotationAnim.deg}deg, #E5EDFF 0%, #C7D2FE 25%, #D8B4FE 50%, #C7D2FE 75%, #E5EDFF 100%) border-box`;
                        }
                    }
                });
            }
            // Glow continues to full opacity
            if (searchGlow) {
                gsapWithCSS.to(searchGlow, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' });
            }
        }, 450);
        // 850ms: Start breathing animation on glow
        setTimeout(() => {
            if (searchGlow) {
                gsapWithCSS.to(searchGlow, { scale: 1.12, opacity: 0.7, duration: 2, ease: 'sine.inOut', repeat: -1, yoyo: true });
            }
        }, 850);
        // Complete callback after animation duration (~850ms)
        setTimeout(() => {
            if (ENABLE_ANIMATION_DEBUG_LOGS) {
                console.log('[SEARCH] Animation complete (timeout)');
            }
            morphingRef.current = false;
            searchBarRefs.input.current?.focus();
            onMorphComplete?.();
        }, 900);
        if (ENABLE_ANIMATION_DEBUG_LOGS) {
            console.log('[SEARCH] Animations started with delays');
        }
    }, [characterRef, searchBarRefs, config, onMorphStart, onMorphComplete]);
    const morphToCharacter = react.useCallback(() => {
        // Prevent multiple simultaneous morphs
        if (morphingRef.current) {
            if (ENABLE_ANIMATION_DEBUG_LOGS) {
                console.log('[SEARCH] Already morphing, ignoring close');
            }
            return;
        }
        morphingRef.current = true;
        onReturnStart?.();
        // Kill any existing tweens
        activeTweensRef.current.forEach(tween => tween.kill());
        activeTweensRef.current = [];
        // Show glows when halves come back together
        setTimeout(() => {
            characterRef.current?.showGlows?.(true);
        }, 500);
        const leftBody = characterRef.current?.leftBodyRef?.current;
        const rightBody = characterRef.current?.rightBodyRef?.current;
        const leftEye = characterRef.current?.leftEyeRef?.current;
        const rightEye = characterRef.current?.rightEyeRef?.current;
        const searchBar = searchBarRefs.bar.current;
        characterRef.current?.shadowRef?.current;
        if (!leftBody || !rightBody || !searchBar) {
            morphingRef.current = false;
            return;
        }
        // Pause idle and kill running animations
        if (characterRef.current?.pauseIdle) {
            characterRef.current.pauseIdle();
        }
        if (characterRef.current?.killAll) {
            characterRef.current.killAll();
        }
        // Kill ongoing animations
        const searchBorderGradient = searchBarRefs.borderGradient.current;
        if (searchBorderGradient) {
            gsapWithCSS.killTweensOf(searchBorderGradient);
        }
        const searchPlaceholder = searchBarRefs.placeholder.current;
        if (searchPlaceholder) {
            gsapWithCSS.killTweensOf(searchPlaceholder);
        }
        const searchKbd = searchBarRefs.kbd.current;
        if (searchKbd) {
            gsapWithCSS.killTweensOf(searchKbd);
        }
        const searchGlow = searchBarRefs.glow.current;
        if (searchGlow) {
            gsapWithCSS.killTweensOf(searchGlow);
        }
        // Hide search glow canvas effect immediately
        characterRef.current?.hideSearchGlow?.();
        // Border gradient fades out (0s)
        if (searchBorderGradient) {
            activeTweensRef.current.push(gsapWithCSS.to(searchBorderGradient, {
                opacity: 0,
                duration: 0.15,
                ease: 'power1.in'
            }));
        }
        // Placeholder and kbd blur out (0s)
        const textElements = [searchPlaceholder, searchKbd].filter(Boolean);
        if (textElements.length > 0) {
            activeTweensRef.current.push(gsapWithCSS.to(textElements, {
                opacity: 0,
                filter: 'blur(6px)',
                y: -4,
                duration: 0.15,
                ease: 'power2.in'
            }));
        }
        // Search glow fades (0s)
        if (searchGlow) {
            activeTweensRef.current.push(gsapWithCSS.to(searchGlow, {
                opacity: 0,
                scale: 0.85,
                duration: 0.15,
                ease: 'power1.out'
            }));
        }
        // Search bar container fades out (150ms delay)
        activeTweensRef.current.push(gsapWithCSS.to(searchBar, {
            opacity: 0,
            scale: 0.95,
            duration: 0.2,
            delay: 0.15,
            ease: 'power2.in'
        }));
        // Clear z-index from character container
        const characterContainer = leftBody.parentElement;
        if (characterContainer) {
            gsapWithCSS.set(characterContainer, { clearProps: 'zIndex' });
        }
        // Snap back to center with upward leap (300ms delay)
        activeTweensRef.current.push(gsapWithCSS.to([leftBody, rightBody], {
            x: 0,
            y: -25,
            scale: 1,
            scaleX: 0.95,
            scaleY: 1.1,
            duration: 0.25,
            delay: 0.3,
            ease: 'power2.out',
            clearProps: 'zIndex'
        }));
        // Settle down to rest (550ms delay)
        activeTweensRef.current.push(gsapWithCSS.to([leftBody, rightBody], {
            y: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 0.17,
            delay: 0.55,
            ease: 'power2.in'
        }));
        // Eyes fade in (550ms delay)
        if (leftEye && rightEye) {
            gsapWithCSS.set([leftEye, rightEye], { y: -18 });
            activeTweensRef.current.push(gsapWithCSS.to([leftEye, rightEye], {
                opacity: 1,
                y: 0,
                duration: 0.17,
                delay: 0.55,
                ease: 'power2.in'
            }));
        }
        // Shadow fades back in (670ms delay) - resume tracker which handles opacity
        setTimeout(() => {
            characterRef.current?.showShadow?.();
        }, 670);
        // Complete and cleanup (720ms delay)
        setTimeout(() => {
            if (leftEye)
                gsapWithCSS.set(leftEye, { opacity: 1, y: 0 });
            if (rightEye)
                gsapWithCSS.set(rightEye, { opacity: 1, y: 0 });
            // Note: shadow is now managed by the shadow tracker (showShadow resumes it)
            if (searchBorderGradient)
                gsapWithCSS.set(searchBorderGradient, { opacity: 0 });
            if (searchPlaceholder)
                gsapWithCSS.set(searchPlaceholder, { opacity: 0, filter: 'blur(0px)', y: 0 });
            if (searchKbd)
                gsapWithCSS.set(searchKbd, { opacity: 0, filter: 'blur(0px)', y: 0 });
            if (searchGlow)
                gsapWithCSS.set(searchGlow, { opacity: 0, scale: 1 });
            gsapWithCSS.set([leftBody, rightBody], { x: 0, y: 0, scale: 1, rotation: 0, scaleX: 1, scaleY: 1 });
            // Resume idle animations after morph back is complete
            if (characterRef.current?.resumeIdle) {
                characterRef.current.resumeIdle();
            }
            morphingRef.current = false;
            onReturnComplete?.();
        }, 750);
    }, [characterRef, searchBarRefs, onReturnStart, onReturnComplete]);
    return {
        morphToSearchBar,
        morphToCharacter,
        isMorphing: morphingRef.current,
    };
}

gsapWithCSS.registerPlugin(useGSAP);
/** Preset configurations for common use cases */
const PRESETS = {
    /** Standard display with shadow and glow */
    default: {
        size: 160,
        showShadow: true,
        showGlow: true,
    },
    /** Large, centered display for landing pages */
    hero: {
        size: 240,
        showShadow: true,
        showGlow: true,
    },
    /** Small chat assistant (for floating in corner) */
    assistant: {
        size: 80,
        showShadow: true,
        showGlow: false,
    },
    /** Tiny icon for navbars/buttons */
    icon: {
        size: 32,
        showShadow: false,
        showGlow: false,
        frozen: false,
    },
    /** Static logo for branding */
    logo: {
        logoMode: true,
        showShadow: false,
        showGlow: false,
    },
};
// ============================================================================
// Inline Style Helpers (replacing Tailwind)
// ============================================================================
const styles = {
    // Container: relative positioning with visible overflow
    container: (size) => ({
        position: 'relative',
        width: size,
        height: size,
        overflow: 'visible',
    }),
    // Full container wrapper with shadow/glow space
    fullContainer: (size) => ({
        position: 'relative',
        width: size,
        height: size * 1.5, // Extra height for shadow
        overflow: 'visible',
    }),
    // Inner wrapper to position character at top of fullContainer
    characterArea: (size) => ({
        position: 'absolute',
        top: 0,
        left: 0,
        width: size,
        height: size,
        overflow: 'visible',
    }),
    // Character wrapper
    character: {
        position: 'relative',
        width: '100%',
        height: '100%',
        willChange: 'transform',
        overflow: 'visible',
    },
    // Super mode golden glow
    superGlow: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, rgba(255, 165, 0, 0.4) 50%, rgba(255, 215, 0, 0) 100%)',
        filter: 'blur(20px)',
        zIndex: 0,
    },
    // Body parts - using inset percentages from Figma
    rightBody: {
        position: 'absolute',
        top: '13.46%',
        right: '0',
        bottom: '0',
        left: '13.46%',
    },
    leftBody: {
        position: 'absolute',
        top: '0',
        right: '13.15%',
        bottom: '13.15%',
        left: '0',
    },
    bodyImage: {
        display: 'block',
        maxWidth: 'none',
        width: '100%',
        height: '100%',
    },
    // Eye containers - using inset percentages from Figma
    leftEyeContainer: {
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        top: '33.44%',
        right: '56.93%',
        bottom: '38.44%',
        left: '30.57%',
    },
    rightEyeContainer: {
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        top: '33.44%',
        right: '31.21%',
        bottom: '38.44%',
        left: '56.29%',
    },
    eyeWrapper: (width, height, scale = 1) => ({
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: `${width * scale}px`,
        height: `${height * scale}px`,
    }),
    // Inner glow (behind character)
    // NOTE: Using calc() for centering instead of transform, because GSAP needs full control of transforms
    innerGlow: (scale = 1) => {
        const width = 120 * scale;
        const height = 90 * scale;
        const centerY = 95 * scale; // Center point Y - positioned at body/face area
        return {
            position: 'absolute',
            left: `calc(50% - ${width / 2}px)`,
            top: `${centerY - height / 2}px`,
            width: `${width}px`,
            height: `${height}px`,
            borderRadius: '50%',
            opacity: 1,
            background: 'linear-gradient(90deg, #C5D4FF 0%, #E0C5FF 100%)',
            filter: `blur(${25 * scale}px)`,
            transformOrigin: 'center center',
            pointerEvents: 'none',
        };
    },
    // Outer glow (behind character, larger)
    // NOTE: Using calc() for centering instead of transform, because GSAP needs full control of transforms
    outerGlow: (scale = 1) => {
        const width = 170 * scale;
        const height = 130 * scale;
        const centerY = 95 * scale; // Center point Y - positioned at body/face area
        return {
            position: 'absolute',
            left: `calc(50% - ${width / 2}px)`,
            top: `${centerY - height / 2}px`,
            width: `${width}px`,
            height: `${height}px`,
            borderRadius: '50%',
            opacity: 1,
            background: 'linear-gradient(90deg, #D5E2FF 0%, #EED5FF 100%)',
            filter: `blur(${32 * scale}px)`,
            transformOrigin: 'center center',
            pointerEvents: 'none',
        };
    },
    // Shadow (below character) - positioned at bottom of fullContainer
    shadow: (scale = 1) => ({
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%) scaleX(1) scaleY(1)',
        bottom: '0px', // At bottom of fullContainer, not outside bounds
        width: `${160 * scale}px`,
        height: `${40 * scale}px`,
        background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 70%)',
        filter: `blur(${12 * scale}px)`,
        borderRadius: '50%',
        opacity: 0.7,
        transformOrigin: 'center center',
        pointerEvents: 'none',
    }),
    // Debug overlays
    debugBorder: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        border: '3px solid lime',
        pointerEvents: 'none',
        zIndex: 9999,
    },
    debugCrosshair: (top, left, color, isHorizontal) => ({
        position: 'absolute',
        top,
        left,
        width: isHorizontal ? '12px' : '2px',
        height: isHorizontal ? '2px' : '12px',
        backgroundColor: color,
        pointerEvents: 'none',
        zIndex: 9999,
    }),
};
// ============================================================================
// Component
// ============================================================================
/**
 * Main Anty Character component with GSAP animations
 *
 * Features:
 * - Continuous idle animations (floating, rotation, breathing)
 * - Emotion animations with eye morphing
 * - Canvas-based particle system
 * - Self-contained shadow and glow effects
 * - Power on/off animations
 */
const AntyCharacter = react.forwardRef((props, ref) => {
    // Get preset defaults if preset is specified
    const presetDefaults = props.preset ? PRESETS[props.preset] : {};
    // Merge preset defaults with explicit props (explicit props override preset)
    const { preset: _preset, // Extract and discard (already used above)
    expression = 'idle', size = presetDefaults.size ?? 160, isSuperMode = presetDefaults.isSuperMode ?? false, frozen = presetDefaults.frozen ?? false, logoMode = presetDefaults.logoMode ?? false, searchMode = presetDefaults.searchMode ?? false, debugMode = presetDefaults.debugMode ?? false, showShadow = presetDefaults.showShadow ?? true, showGlow = presetDefaults.showGlow ?? true, onSpontaneousExpression, onEmotionComplete, onAnimationSequenceChange, onRandomAction, className = '', style, 
    // Optional external refs (for playground where shadow/glow are rendered externally)
    shadowRef: externalShadowRef, innerGlowRef: externalInnerGlowRef, outerGlowRef: externalOuterGlowRef, 
    // Search bar integration
    searchEnabled = presetDefaults.searchEnabled ?? false, searchValue: externalSearchValue, onSearchChange, onSearchSubmit, searchPlaceholder = 'Search...', searchShortcut, searchConfig = DEFAULT_SEARCH_BAR_CONFIG, onSearchOpen, onSearchOpenComplete, onSearchClose, onSearchCloseComplete, } = props;
    // Refs for DOM elements
    const containerRef = react.useRef(null);
    const characterRef = react.useRef(null);
    const leftEyeRef = react.useRef(null);
    const rightEyeRef = react.useRef(null);
    const leftEyePathRef = react.useRef(null);
    const rightEyePathRef = react.useRef(null);
    const leftEyeSvgRef = react.useRef(null);
    const rightEyeSvgRef = react.useRef(null);
    const leftBodyRef = react.useRef(null);
    const rightBodyRef = react.useRef(null);
    const canvasRef = react.useRef(null);
    // Internal search bar refs (when searchEnabled)
    const searchBarRef = react.useRef(null);
    const searchBorderRef = react.useRef(null);
    const searchBorderGradientRef = react.useRef(null);
    const searchPlaceholderRef = react.useRef(null);
    const searchKbdRef = react.useRef(null);
    const searchGlowRef = react.useRef(null);
    const searchInputRef = react.useRef(null);
    // Internal search state
    const [internalSearchValue, setInternalSearchValue] = react.useState('');
    const [isSearchActive, setIsSearchActive] = react.useState(false);
    // Use external value if provided, otherwise internal
    const searchValueState = externalSearchValue !== undefined ? externalSearchValue : internalSearchValue;
    const handleSearchChange = react.useCallback((value) => {
        if (onSearchChange) {
            onSearchChange(value);
        }
        else {
            setInternalSearchValue(value);
        }
    }, [onSearchChange]);
    // Build search bar refs object for the hook
    const searchBarRefs = {
        bar: searchBarRef,
        border: searchBorderRef,
        borderGradient: searchBorderGradientRef,
        placeholder: searchPlaceholderRef,
        kbd: searchKbdRef,
        glow: searchGlowRef,
        input: searchInputRef,
    };
    // Internal refs for shadow/glow (self-contained, used if external refs not provided)
    const internalShadowRef = react.useRef(null);
    const internalInnerGlowRef = react.useRef(null);
    const internalOuterGlowRef = react.useRef(null);
    // Use external refs if provided, otherwise use internal
    const shadowRef = externalShadowRef || internalShadowRef;
    const innerGlowRef = externalInnerGlowRef || internalInnerGlowRef;
    const outerGlowRef = externalOuterGlowRef || internalOuterGlowRef;
    // Track whether we're using external refs (if so, don't render internal shadow/glow)
    const hasExternalShadow = !!externalShadowRef;
    const hasExternalGlow = !!externalInnerGlowRef || !!externalOuterGlowRef;
    // Super mode glow
    const superGlowRef = react.useRef(null);
    const superGlowTimelineRef = react.useRef(null);
    // State
    const [currentExpression, setCurrentExpression] = react.useState(expression);
    const [particles] = react.useState([]);
    const [isOffInternal, setIsOffInternal] = react.useState(false);
    const isOff = expression === 'off' || isOffInternal;
    const initialEyeDimensions = getEyeDimensions('IDLE');
    const sizeScale = size / 160; // Scale factor based on default 160px size
    const [refsReady, setRefsReady] = react.useState(false);
    react.useEffect(() => {
        if (containerRef.current && characterRef.current && !refsReady) {
            setRefsReady(true);
        }
    }, [refsReady]);
    // Animation controller
    const animationController = useAnimationController({
        container: containerRef.current,
        character: characterRef.current,
        shadow: shadowRef.current,
        eyeLeft: leftEyeRef.current,
        eyeRight: rightEyeRef.current,
        eyeLeftPath: leftEyePathRef.current,
        eyeRightPath: rightEyePathRef.current,
        eyeLeftSvg: leftEyeSvgRef.current,
        eyeRightSvg: rightEyeSvgRef.current,
        leftBody: leftBodyRef.current,
        rightBody: rightBodyRef.current,
        innerGlow: innerGlowRef.current,
        outerGlow: outerGlowRef.current,
    }, {
        enableLogging: ENABLE_ANIMATION_DEBUG_LOGS,
        enableQueue: true,
        maxQueueSize: 10,
        defaultPriority: 2,
        isOff,
        logoMode,
        searchMode: searchMode || isSearchActive, // Include internal search state
        autoStartIdle: !frozen && !logoMode, // Disable idle animation when frozen or in logo mode
        sizeScale, // Pass scale factor for proper eye sizing
        onStateChange: (from, to) => {
            if (ENABLE_ANIMATION_DEBUG_LOGS) {
                logAnimationEvent('State Change', { from, to });
            }
            if (onAnimationSequenceChange) {
                onAnimationSequenceChange(`CONTROLLER: ${from} → ${to}`);
            }
        },
        onAnimationSequenceChange: onAnimationSequenceChange,
        callbacks: {
            onEmotionMotionStart: (emotion) => {
                // Spawn confetti for celebrate animation
                if (emotion === 'celebrate' && canvasRef.current?.spawnParticle) {
                    setTimeout(() => {
                        const count = 40;
                        const canvasCenterX = (size * 5) / 2;
                        const canvasCenterY = (size * 5) / 2;
                        for (let i = 0; i < count; i++) {
                            setTimeout(() => {
                                canvasRef.current?.spawnParticle?.('confetti', canvasCenterX, canvasCenterY - 50 * sizeScale);
                            }, i * 10);
                        }
                    }, 550);
                }
                // Spawn yellow sparkles from right eye during wink
                if (emotion === 'wink' && canvasRef.current?.spawnParticle) {
                    const canvasCenterX = (size * 5) / 2;
                    const canvasCenterY = (size * 5) / 2;
                    const rightEyeX = canvasCenterX + 25;
                    const rightEyeY = canvasCenterY - 15;
                    for (let i = 0; i < 6; i++) {
                        setTimeout(() => {
                            const spawnX = rightEyeX + (Math.random() - 0.5) * 30;
                            const spawnY = rightEyeY + (Math.random() - 0.5) * 30;
                            canvasRef.current?.spawnParticle?.('sparkle', spawnX, spawnY, '#FFD700');
                        }, 50 + i * 40);
                    }
                }
                // Spawn lightbulb emoji for idea animation
                if (emotion === 'idea' && containerRef.current) {
                    setTimeout(() => {
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (!rect)
                            return;
                        const lightbulb = document.createElement('div');
                        lightbulb.textContent = '💡';
                        const bulbSize = (isSuperMode ? 70 : 48) * sizeScale;
                        const bulbOffset = (isSuperMode ? 32 : 22) * sizeScale;
                        lightbulb.style.cssText = `
                position: fixed;
                left: ${rect.left + rect.width / 2 - bulbOffset}px;
                top: ${rect.top - 80 * sizeScale}px;
                font-size: ${bulbSize}px;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
              `;
                        document.body.appendChild(lightbulb);
                        const bulbTl = gsapWithCSS.timeline({ onComplete: () => lightbulb.remove() });
                        bulbTl.to(lightbulb, { y: -25, duration: 0.9, ease: 'power2.out' }, 0);
                        bulbTl.to(lightbulb, { opacity: 1, duration: 0.12, ease: 'power2.out' }, 0);
                        bulbTl.to(lightbulb, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.65);
                    }, 180);
                }
                // Spawn teardrop emoji for sad animation
                if (emotion === 'sad' && containerRef.current) {
                    setTimeout(() => {
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (!rect)
                            return;
                        const teardrop = document.createElement('div');
                        teardrop.textContent = '💧';
                        const dropSize = (isSuperMode ? 52 : 36) * sizeScale;
                        const dropOffset = (isSuperMode ? 24 : 16) * sizeScale;
                        const xOffset = rect.width * 0.35;
                        teardrop.style.cssText = `
                position: fixed;
                left: ${rect.left + rect.width / 2 + xOffset - dropOffset}px;
                top: ${rect.top - 20 * sizeScale}px;
                font-size: ${dropSize}px;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
              `;
                        document.body.appendChild(teardrop);
                        const dropTl = gsapWithCSS.timeline({ onComplete: () => teardrop.remove() });
                        dropTl.to(teardrop, { y: 35, duration: 1.2, ease: 'power2.in' }, 0);
                        dropTl.to(teardrop, { opacity: 1, duration: 0.15, ease: 'power2.out' }, 0);
                        dropTl.to(teardrop, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.85);
                    }, 250);
                }
                // Spawn exclamation emoji for shocked animation
                if (emotion === 'shocked' && containerRef.current) {
                    setTimeout(() => {
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (!rect)
                            return;
                        const exclamation = document.createElement('div');
                        exclamation.textContent = '❗';
                        const emojiSize = (isSuperMode ? 70 : 48) * sizeScale;
                        const emojiOffset = (isSuperMode ? 32 : 22) * sizeScale;
                        const xOffset = rect.width * 0.35;
                        exclamation.style.cssText = `
                position: fixed;
                left: ${rect.left + rect.width / 2 + xOffset - emojiOffset}px;
                top: ${rect.top - 50 * sizeScale}px;
                font-size: ${emojiSize}px;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
              `;
                        document.body.appendChild(exclamation);
                        const exclamationTl = gsapWithCSS.timeline({ onComplete: () => exclamation.remove() });
                        exclamationTl.to(exclamation, { y: -25, duration: 0.9, ease: 'power2.out' }, 0);
                        exclamationTl.to(exclamation, { opacity: 1, duration: 0.12, ease: 'power2.out' }, 0);
                        exclamationTl.to(exclamation, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.65);
                    }, 180);
                }
            },
            onEmotionMotionComplete: (emotion, timelineId, duration) => {
                const isEyeOnlyAction = emotion === 'look-left' || emotion === 'look-right';
                if (ENABLE_ANIMATION_DEBUG_LOGS && !isEyeOnlyAction) {
                    logAnimationEvent('Emotion Motion Complete', { emotion, timelineId, duration });
                }
                if (onEmotionComplete) {
                    onEmotionComplete(emotion);
                }
            },
        },
    });
    // Log controller initialization
    react.useEffect(() => {
        if (ENABLE_ANIMATION_DEBUG_LOGS) {
            logAnimationEvent('Controller Initialization', {
                isReady: animationController.isReady,
                currentState: animationController.getState(),
            });
        }
    }, [animationController.isReady]);
    // Log when props change
    react.useEffect(() => {
        if (!ENABLE_ANIMATION_DEBUG_LOGS)
            return;
        logAnimationEvent('Props Changed', {
            expression,
            isOff,
            searchMode,
            controllerState: animationController.getState(),
            controllerEmotion: animationController.getEmotion(),
            isIdle: animationController.isIdle(),
        });
    }, [expression, isOff, searchMode]);
    // Create a self-ref object for the search morph hook
    // This mimics the AntyCharacterHandle interface so the hook can access internal refs
    const selfRef = react.useRef({
        spawnFeedingParticles: () => { },
        leftBodyRef,
        rightBodyRef,
        leftEyeRef,
        rightEyeRef,
        leftEyePathRef,
        rightEyePathRef,
        shadowRef,
        innerGlowRef,
        outerGlowRef,
        characterRef,
        killAll: () => animationController.killAll(),
        pauseIdle: () => animationController.pause(),
        resumeIdle: () => animationController.resume(),
        hideGlows: () => animationController.hideGlows(),
        showGlows: (fadeIn) => animationController.showGlows(fadeIn),
        hideShadow: () => animationController.hideShadow(),
        showShadow: () => animationController.showShadow(),
    });
    // Keep self-ref updated with latest refs
    react.useEffect(() => {
        selfRef.current = {
            ...selfRef.current,
            killAll: () => animationController.killAll(),
            pauseIdle: () => animationController.pause(),
            resumeIdle: () => animationController.resume(),
            hideGlows: () => animationController.hideGlows(),
            showGlows: (fadeIn) => animationController.showGlows(fadeIn),
            hideShadow: () => animationController.hideShadow(),
            showShadow: () => animationController.showShadow(),
        };
    }, [animationController]);
    // Use search morph hook (when searchEnabled)
    const { morphToSearchBar: internalMorphToSearchBar, morphToCharacter: internalMorphToCharacter, isMorphing } = useSearchMorph({
        characterRef: selfRef,
        searchBarRefs,
        config: searchConfig,
        characterSize: size,
        onMorphStart: () => {
            setIsSearchActive(true);
            onSearchOpen?.();
        },
        onMorphComplete: onSearchOpenComplete,
        onReturnStart: () => {
            // Clear search input when closing
            handleSearchChange('');
            onSearchClose?.();
        },
        onReturnComplete: () => {
            setIsSearchActive(false);
            onSearchCloseComplete?.();
        },
    });
    // Expose methods and refs to parent
    react.useImperativeHandle(ref, () => ({
        spawnSparkle: (x, y, color) => {
            if (canvasRef.current && canvasRef.current.spawnParticle) {
                canvasRef.current.spawnParticle('sparkle', x, y, color);
            }
        },
        leftBodyRef,
        rightBodyRef,
        shadowRef,
        innerGlowRef,
        outerGlowRef,
        characterRef,
        spawnLoveHearts: () => {
            const container = containerRef.current;
            if (!container)
                return;
            const containerRect = container.getBoundingClientRect();
            const antyX = containerRect.left + containerRect.width / 2;
            const antyY = containerRect.top + containerRect.height / 2;
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const heart = document.createElement('div');
                    heart.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 7.20312H6.08634V13.2895H0V7.20312Z" fill="#8B5CF6"/>
              <path d="M0 14.4004H6.08634V20.4867H0V14.4004Z" fill="#8B5CF6"/>
              <path d="M7.19922 7.20312H13.2856V13.2895H7.19922V7.20312Z" fill="#8B5CF6"/>
              <path d="M14.3984 7.20312H20.4848V13.2895H14.3984V7.20312Z" fill="#8B5CF6"/>
              <path d="M7.19922 0.00195312H13.2856V6.08829H7.19922V0.00195312Z" fill="#8B5CF6"/>
              <path d="M7.19922 14.4004H13.2856V20.4867H7.19922V14.4004Z" fill="#8B5CF6"/>
              <path d="M7.19922 21.6016H13.2856V27.6879H7.19922V21.6016Z" fill="#8B5CF6"/>
              <path d="M14.3984 28.8008H20.4848V34.8871H14.3984V28.8008Z" fill="#8B5CF6"/>
              <path d="M14.3984 21.6016H20.4848V27.6879H14.3984V21.6016Z" fill="#8B5CF6"/>
              <path d="M14.3984 14.4004H20.4848V20.4867H14.3984V14.4004Z" fill="#8B5CF6"/>
              <path d="M21.5996 7.20117H27.6859V13.2875H21.5996V7.20117Z" fill="#8B5CF6"/>
              <path d="M21.5996 0H27.6859V6.08634H21.5996V0Z" fill="#8B5CF6"/>
              <path d="M21.5996 14.4004H27.6859V20.4867H21.5996V14.4004Z" fill="#8B5CF6"/>
              <path d="M28.7988 14.4004H34.8852V20.4867H28.7988V14.4004Z" fill="#8B5CF6"/>
              <path d="M21.5996 21.6016H27.6859V27.6879H21.5996V21.6016Z" fill="#8B5CF6"/>
              <path d="M28.7988 7.20117H34.8852V13.2875H28.7988V7.20117Z" fill="#8B5CF6"/>
            </svg>
          `;
                    heart.style.position = 'fixed';
                    heart.style.left = `${antyX}px`;
                    heart.style.top = `${antyY}px`;
                    heart.style.pointerEvents = 'none';
                    heart.style.zIndex = '1000';
                    document.body.appendChild(heart);
                    const angle = (i / 8) * Math.PI * 2;
                    const distance = gsapWithCSS.utils.random(60, 100);
                    gsapWithCSS.fromTo(heart, { x: 0, y: 0, scale: 0.5, opacity: 0 }, {
                        x: Math.cos(angle) * distance,
                        y: Math.sin(angle) * distance,
                        scale: 1,
                        opacity: 1,
                        duration: 0.4,
                        ease: 'power2.out',
                        onComplete: () => {
                            gsapWithCSS.to(heart, {
                                opacity: 0,
                                scale: 0.3,
                                duration: 0.3,
                                ease: 'power2.in',
                                onComplete: () => heart.remove()
                            });
                        }
                    });
                }, i * 80);
            }
        },
        spawnFeedingParticles: () => {
            const container = containerRef.current;
            if (!container)
                return;
            const emojiFood = ['🧁', '🍪', '🍩', '🍰', '🎂', '🍬', '🍭', '🍫', '🍓', '🍌', '🍎', '🍊', '⭐', '✨', '💖', '🌟'];
            const particleCount = 60;
            const particles = [];
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.textContent = emojiFood[Math.floor(Math.random() * emojiFood.length)];
                particle.style.position = 'fixed';
                particle.style.fontSize = `${gsapWithCSS.utils.random(32, 56)}px`;
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '1000';
                const angle = (i / particleCount) * Math.PI * 2;
                const startDistance = gsapWithCSS.utils.random(400, 800);
                const startX = window.innerWidth / 2 + Math.cos(angle) * startDistance;
                const startY = window.innerHeight / 2 + Math.sin(angle) * startDistance;
                particle.style.left = `${startX}px`;
                particle.style.top = `${startY}px`;
                document.body.appendChild(particle);
                particles.push(particle);
            }
            const containerRect = container.getBoundingClientRect();
            const antyX = containerRect.left + containerRect.width / 2 - 12;
            const antyY = containerRect.top + containerRect.height / 2 - 30;
            particles.forEach((particle, i) => {
                const currentX = parseFloat(particle.style.left);
                const currentY = parseFloat(particle.style.top);
                const tl = gsapWithCSS.timeline({ onComplete: () => particle.remove() });
                tl.fromTo(particle, {
                    x: 0,
                    y: 0,
                    scale: 0.3,
                    opacity: 0,
                    rotation: gsapWithCSS.utils.random(-180, 180),
                }, {
                    duration: gsapWithCSS.utils.random(0.8, 1.4),
                    x: antyX - currentX,
                    y: antyY - currentY,
                    rotation: gsapWithCSS.utils.random(180, 540),
                    scale: gsapWithCSS.utils.random(0.8, 1.3),
                    opacity: 1,
                    ease: 'power2.in',
                });
                tl.to(particle, {
                    duration: 0.15,
                    scale: 0,
                    opacity: 0,
                    ease: 'power4.in',
                });
                tl.delay(i * 0.01);
            });
        },
        spawnConfetti: (x, y, count = 30) => {
            if (!canvasRef.current || !canvasRef.current.spawnParticle || !containerRef.current) {
                return;
            }
            const canvasWidth = size * 5;
            const canvasHeight = size * 5;
            const canvasCenterX = canvasWidth / 2;
            const canvasCenterY = canvasHeight / 2;
            const containerRect = containerRef.current.getBoundingClientRect();
            const charCenterX = containerRect.left + containerRect.width / 2;
            const charCenterY = containerRect.top + containerRect.height / 2;
            const offsetX = x - charCenterX;
            const offsetY = y - charCenterY;
            const canvasX = canvasCenterX + offsetX;
            const canvasY = canvasCenterY + offsetY;
            for (let i = 0; i < count; i++) {
                setTimeout(() => {
                    if (canvasRef.current?.spawnParticle) {
                        canvasRef.current.spawnParticle('confetti', canvasX, canvasY);
                    }
                }, i * 15);
            }
        },
        showSearchGlow: () => {
            if (canvasRef.current && canvasRef.current.showSearchGlow) {
                canvasRef.current.showSearchGlow();
            }
        },
        hideSearchGlow: () => {
            if (canvasRef.current && canvasRef.current.hideSearchGlow) {
                canvasRef.current.hideSearchGlow();
            }
        },
        playEmotion: (emotion, options) => {
            if (ENABLE_ANIMATION_DEBUG_LOGS) {
                logAnimationEvent('playEmotion called via handle', { emotion, options });
            }
            const validEmotions = {
                'happy': 'happy',
                'excited': 'excited',
                'celebrate': 'celebrate',
                'pleased': 'pleased',
                'smize': 'smize',
                'sad': 'sad',
                'angry': 'angry',
                'shocked': 'shocked',
                'spin': 'spin',
                'wink': 'wink',
                'jump': 'jump',
                'idea': 'idea',
                'back-forth': 'back-forth',
                'look-around': 'look-around',
                'nod': 'nod',
                'headshake': 'headshake',
                'look-left': 'look-left',
                'look-right': 'look-right',
                'super': 'super',
            };
            const emotionType = validEmotions[emotion];
            if (emotionType) {
                return animationController.playEmotion(emotionType, { priority: options?.isChatOpen ? 3 : 2 });
            }
            if (ENABLE_ANIMATION_DEBUG_LOGS) {
                console.log('[AnimationController] Emotion not supported:', emotion);
            }
            return false;
        },
        startLook: (direction) => {
            if (!leftEyeRef.current || !rightEyeRef.current || !leftEyePathRef.current || !rightEyePathRef.current || !leftEyeSvgRef.current || !rightEyeSvgRef.current) {
                return;
            }
            animationController.pause();
            const lookTl = createLookAnimation({
                leftEye: leftEyeRef.current,
                rightEye: rightEyeRef.current,
                leftEyePath: leftEyePathRef.current,
                rightEyePath: rightEyePathRef.current,
                leftEyeSvg: leftEyeSvgRef.current,
                rightEyeSvg: rightEyeSvgRef.current,
            }, { direction });
            lookTl.play();
        },
        endLook: () => {
            if (!leftEyeRef.current || !rightEyeRef.current || !leftEyePathRef.current || !rightEyePathRef.current || !leftEyeSvgRef.current || !rightEyeSvgRef.current) {
                return;
            }
            const returnTl = createReturnFromLookAnimation({
                leftEye: leftEyeRef.current,
                rightEye: rightEyeRef.current,
                leftEyePath: leftEyePathRef.current,
                rightEyePath: rightEyePathRef.current,
                leftEyeSvg: leftEyeSvgRef.current,
                rightEyeSvg: rightEyeSvgRef.current,
            });
            returnTl.eventCallback('onComplete', () => {
                animationController.resume();
            });
            returnTl.play();
        },
        killAll: () => {
            animationController.killAll();
        },
        pauseIdle: () => {
            animationController.pause();
        },
        resumeIdle: () => {
            animationController.resume();
        },
        setSuperMode: (scale) => {
            animationController.setSuperMode(scale);
        },
        showGlows: (fadeIn = true) => {
            animationController.showGlows(fadeIn);
        },
        hideGlows: () => {
            animationController.hideGlows();
        },
        // Power off/on transitions
        powerOff: () => {
            setIsOffInternal(true);
            animationController.transitionTo(exports.AnimationState.OFF);
        },
        wakeUp: () => {
            setIsOffInternal(false);
            animationController.transitionTo(exports.AnimationState.IDLE);
        },
        // Search bar morph (when searchEnabled)
        morphToSearchBar: searchEnabled ? internalMorphToSearchBar : undefined,
        morphToCharacter: searchEnabled ? internalMorphToCharacter : undefined,
        isSearchMode: () => isSearchActive,
        leftEyeRef,
        rightEyeRef,
        leftEyePathRef,
        rightEyePathRef,
    }), [size, animationController, isSuperMode, searchEnabled, internalMorphToSearchBar, internalMorphToCharacter, isSearchActive]);
    react.useEffect(() => {
        setCurrentExpression(expression);
    }, [expression]);
    // ESC key and click-outside to close search bar
    react.useEffect(() => {
        if (!isSearchActive)
            return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                internalMorphToCharacter();
            }
        };
        const handleClickOutside = (e) => {
            const target = e.target;
            // Ignore clicks on interactive elements (buttons, inputs, links)
            if (target.closest('button, input, a, [role="button"]')) {
                return;
            }
            // Check if click is outside the container
            if (containerRef.current && !containerRef.current.contains(target)) {
                internalMorphToCharacter();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSearchActive, internalMorphToCharacter]);
    // Play emotion when expression changes
    react.useEffect(() => {
        if (!animationController.isReady)
            return;
        if (isOff)
            return;
        const validEmotions = {
            'happy': 'happy',
            'excited': 'excited',
            'celebrate': 'celebrate',
            'pleased': 'pleased',
            'smize': 'smize',
            'sad': 'sad',
            'angry': 'angry',
            'shocked': 'shocked',
            'spin': 'spin',
            'wink': 'wink',
            'jump': 'jump',
            'idea': 'idea',
            'back-forth': 'back-forth',
            'look-around': 'look-around',
            'nod': 'nod',
            'headshake': 'headshake',
            'look-left': 'look-left',
            'look-right': 'look-right',
            'super': 'super',
        };
        const emotionType = validEmotions[expression];
        if (emotionType) {
            if (ENABLE_ANIMATION_DEBUG_LOGS) {
                logAnimationEvent('Expression changed → playEmotion', { expression, emotionType });
            }
            // Allow re-triggers - controller handles deduplication if needed
            animationController.playEmotion(emotionType, { priority: 2 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expression, isOff]);
    // Super mode glow animation
    react.useEffect(() => {
        if (!superGlowRef.current)
            return;
        if (isSuperMode) {
            superGlowTimelineRef.current?.kill();
            const glowTl = gsapWithCSS.timeline({ repeat: -1, yoyo: true });
            glowTl.to(superGlowRef.current, { opacity: 0.9, scale: 1.1, duration: 0.8, ease: 'sine.inOut' });
            superGlowTimelineRef.current = glowTl;
        }
        else {
            superGlowTimelineRef.current?.kill();
            superGlowTimelineRef.current = null;
            gsapWithCSS.set(superGlowRef.current, { opacity: 0, scale: 1 });
        }
        return () => { superGlowTimelineRef.current?.kill(); };
    }, [isSuperMode]);
    // Track expression in ref for scheduler
    const currentExpressionRef = react.useRef(expression);
    react.useEffect(() => {
        currentExpressionRef.current = expression;
    }, [expression]);
    const searchModeRef = react.useRef(searchMode);
    react.useEffect(() => {
        searchModeRef.current = searchMode;
    }, [searchMode]);
    const onSpontaneousExpressionRef = react.useRef(onSpontaneousExpression);
    react.useEffect(() => {
        onSpontaneousExpressionRef.current = onSpontaneousExpression;
    }, [onSpontaneousExpression]);
    // Idle duration tracking
    const idleStartTimeRef = react.useRef(Date.now());
    react.useEffect(() => {
        if (expression === 'idle') {
            idleStartTimeRef.current = Date.now();
        }
    }, [expression]);
    // Bored behavior scheduler
    useGSAP(() => {
        let isActive = true;
        const MIN_IDLE_TIME_MS = 120000; // 2 minutes
        const scheduleRandomBehavior = () => {
            if (!isActive)
                return;
            gsapWithCSS.delayedCall(gsapWithCSS.utils.random(60, 120), () => {
                if (!isActive)
                    return;
                const isIdlePlaying = animationController.isIdlePlaying();
                const hasBeenIdleLongEnough = (Date.now() - idleStartTimeRef.current) >= MIN_IDLE_TIME_MS;
                if (currentExpressionRef.current !== 'idle' || searchModeRef.current || !isIdlePlaying || !hasBeenIdleLongEnough) {
                    scheduleRandomBehavior();
                    return;
                }
                scheduleRandomBehavior();
            });
        };
        scheduleRandomBehavior();
        return () => { isActive = false; };
    }, { scope: containerRef, dependencies: [] });
    // Inlined SVG data URLs for body (no external assets needed)
    const bodyRightSvg = "data:image/svg+xml,%3Csvg%20preserveAspectRatio%3D%22none%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20overflow%3D%22visible%22%20style%3D%22display%3A%20block%3B%22%20viewBox%3D%220%200%20173.082%20173.082%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20id%3D%22RIGHT%22%20d%3D%22M173.082%20115.977C173.082%20147.515%20147.515%20173.082%20115.976%20173.082H4.18192C0.463682%20173.082%20-1.39842%20168.586%201.23077%20165.957L29.5407%20137.647H115.976C127.945%20137.647%20137.647%20127.945%20137.647%20115.977V29.5407L165.957%201.23077C168.586%20-1.39842%20173.082%200.463679%20173.082%204.18192V115.977Z%22%20fill%3D%22var%28--fill-0%2C%20%23052333%29%22%2F%3E%0A%3C%2Fsvg%3E";
    const bodyLeftSvg = "data:image/svg+xml,%3Csvg%20preserveAspectRatio%3D%22none%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20overflow%3D%22visible%22%20style%3D%22display%3A%20block%3B%22%20viewBox%3D%220%200%20173.694%20173.694%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20id%3D%22LEFT%22%20d%3D%22M144.153%2035.4344H57.1051C45.1368%2035.4345%2035.4344%2045.1368%2035.4344%2057.1051V144.153L7.12469%20172.463C4.4955%20175.092%200%20173.23%200%20169.512V57.1051C2.28235e-05%2025.5668%2025.5668%204.78163e-05%2057.1051%200H169.512C173.23%200%20175.092%204.49551%20172.463%207.1247L144.153%2035.4344Z%22%20fill%3D%22var%28--fill-0%2C%20%23052333%29%22%2F%3E%0A%3C%2Fsvg%3E";
    // Use fullContainer (1.5x height) when rendering internal shadow/glow
    // Use regular container when using external refs (main page manages its own container size)
    const useFullContainer = (showShadow && !hasExternalShadow) || (showGlow && !hasExternalGlow);
    const containerStyle = useFullContainer ? styles.fullContainer(size) : styles.container(size);
    return (jsxRuntime.jsxs("div", { ref: containerRef, style: {
            ...containerStyle,
            ...style,
        }, className: className, children: [jsxRuntime.jsx(AntyParticleCanvas, { ref: canvasRef, particles: particles, width: size * 5, height: size * 5, sizeScale: sizeScale }), jsxRuntime.jsxs("div", { style: useFullContainer ? styles.characterArea(size) : { position: 'relative', width: size, height: size }, children: [showGlow && !hasExternalGlow && (jsxRuntime.jsx("div", { ref: internalOuterGlowRef, style: styles.outerGlow(sizeScale) })), showGlow && !hasExternalGlow && (jsxRuntime.jsx("div", { ref: internalInnerGlowRef, style: styles.innerGlow(sizeScale) })), isSuperMode && (jsxRuntime.jsx("div", { ref: superGlowRef, style: styles.superGlow })), jsxRuntime.jsxs("div", { ref: characterRef, className: isSuperMode ? 'super-mode' : undefined, style: styles.character, children: [jsxRuntime.jsx("div", { ref: rightBodyRef, style: styles.rightBody, children: jsxRuntime.jsx("img", { alt: "", style: styles.bodyImage, src: bodyRightSvg }) }), jsxRuntime.jsx("div", { ref: leftBodyRef, style: styles.leftBody, children: jsxRuntime.jsx("img", { alt: "", style: styles.bodyImage, src: bodyLeftSvg }) }), jsxRuntime.jsx("div", { style: styles.leftEyeContainer, children: jsxRuntime.jsx("div", { ref: leftEyeRef, style: styles.eyeWrapper(initialEyeDimensions.width, initialEyeDimensions.height, sizeScale), children: jsxRuntime.jsx("svg", { ref: leftEyeSvgRef, width: "100%", height: "100%", viewBox: initialEyeDimensions.viewBox, fill: "none", xmlns: "http://www.w3.org/2000/svg", style: { display: 'block' }, children: jsxRuntime.jsx("path", { ref: leftEyePathRef, d: getEyeShape('IDLE', 'left'), fill: "#052333" }) }) }) }), jsxRuntime.jsx("div", { style: styles.rightEyeContainer, children: jsxRuntime.jsx("div", { ref: rightEyeRef, style: styles.eyeWrapper(initialEyeDimensions.width, initialEyeDimensions.height, sizeScale), children: jsxRuntime.jsx("svg", { ref: rightEyeSvgRef, width: "100%", height: "100%", viewBox: initialEyeDimensions.viewBox, fill: "none", xmlns: "http://www.w3.org/2000/svg", style: { display: 'block' }, children: jsxRuntime.jsx("path", { ref: rightEyePathRef, d: getEyeShape('IDLE', 'right'), fill: "#052333" }) }) }) }), debugMode && (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsx("div", { style: styles.debugBorder }), !isOff && (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsx("div", { style: styles.debugCrosshair('calc(33.41% + 13.915% - 1px)', 'calc(31.63% + 5.825% - 7px)', 'yellow', true) }), jsxRuntime.jsx("div", { style: styles.debugCrosshair('calc(33.41% + 13.915% - 6px)', 'calc(31.63% + 5.825% - 2px)', 'yellow', false) })] })), !isOff && (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsx("div", { style: styles.debugCrosshair('calc(33.41% + 13.915% - 1px)', 'calc(57.36% + 5.82% - 7px)', 'orange', true) }), jsxRuntime.jsx("div", { style: styles.debugCrosshair('calc(33.41% + 13.915% - 6px)', 'calc(57.36% + 5.82% - 2px)', 'orange', false) })] }))] }))] }), searchEnabled && (jsxRuntime.jsx(AntySearchBar, { active: isSearchActive, value: searchValueState, onChange: handleSearchChange, inputRef: searchInputRef, barRef: searchBarRef, borderRef: searchBorderRef, borderGradientRef: searchBorderGradientRef, placeholderRef: searchPlaceholderRef, kbdRef: searchKbdRef, glowRef: searchGlowRef, config: searchConfig, placeholder: searchPlaceholder, keyboardShortcut: searchShortcut }))] }), showShadow && !hasExternalShadow && (jsxRuntime.jsx("div", { ref: internalShadowRef, style: styles.shadow(sizeScale) }))] }));
});
AntyCharacter.displayName = 'AntyCharacter';

/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && array.indexOf(className) === index;
}).join(" ");

/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Icon = react.forwardRef(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => {
    return react.createElement(
      "svg",
      {
        ref,
        ...defaultAttributes,
        width: size,
        height: size,
        stroke: color,
        strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
        className: mergeClasses("lucide", className),
        ...rest
      },
      [
        ...iconNode.map(([tag, attrs]) => react.createElement(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    );
  }
);

/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const createLucideIcon = (iconName, iconNode) => {
  const Component = react.forwardRef(
    ({ className, ...props }, ref) => react.createElement(Icon, {
      ref,
      iconNode,
      className: mergeClasses(`lucide-${toKebabCase(iconName)}`, className),
      ...props
    })
  );
  Component.displayName = `${iconName}`;
  return Component;
};

/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const ChevronLeft = createLucideIcon("ChevronLeft", [
  ["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]
]);

/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const EllipsisVertical = createLucideIcon("EllipsisVertical", [
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
  ["circle", { cx: "12", cy: "5", r: "1", key: "gxeob9" }],
  ["circle", { cx: "12", cy: "19", r: "1", key: "lyex9k" }]
]);

/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const History = createLucideIcon("History", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
]);

/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Key = createLucideIcon("Key", [
  ["path", { d: "m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4", key: "g0fldk" }],
  ["path", { d: "m21 2-9.6 9.6", key: "1j0ho8" }],
  ["circle", { cx: "7.5", cy: "15.5", r: "5.5", key: "yqb3hr" }]
]);

/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const LoaderCircle = createLucideIcon("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);

/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const MessageSquarePlus = createLucideIcon("MessageSquarePlus", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }],
  ["path", { d: "M12 7v6", key: "lw1j43" }],
  ["path", { d: "M9 10h6", key: "9gxzsh" }]
]);

/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Send = createLucideIcon("Send", [
  ["path", { d: "m22 2-7 20-4-9-9-4Z", key: "1q3vgg" }],
  ["path", { d: "M22 2 11 13", key: "nzbqef" }]
]);

/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Trash2 = createLucideIcon("Trash2", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
]);

/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const X = createLucideIcon("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);

let OpenAIClient = null;
try {
    // Dynamic require for optional peer dependency
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    OpenAIClient = require('openai').default;
}
catch {
    // openai not installed - will error when AntyChat is used
}
class AntyChat {
    constructor(apiKey) {
        this.client = null;
        this.apiKey = null;
        this.apiKey = apiKey || null;
        if (this.apiKey) {
            this.ensureOpenAI();
            this.client = new OpenAIClient({
                apiKey: this.apiKey,
                dangerouslyAllowBrowser: true, // For demo purposes
            });
        }
    }
    ensureOpenAI() {
        if (!OpenAIClient) {
            throw new Error('The "openai" package is required for chat functionality. ' +
                'Install it with: npm install openai');
        }
    }
    setApiKey(apiKey) {
        this.ensureOpenAI();
        this.apiKey = apiKey;
        this.client = new OpenAIClient({
            apiKey,
            dangerouslyAllowBrowser: true,
        });
    }
    async sendMessage(messages, onChunk) {
        if (!this.client) {
            throw new Error('OpenAI client not initialized. Please set API key.');
        }
        const systemPrompt = {
            role: 'system',
            content: `You are Anty, a friendly AI assistant. You're chatting with someone who can see you react to the conversation.

EMOTION TAGS: Add emotion tags when the user's message has emotional weight or clearly invites a reaction. Skip emotions for purely factual/routine exchanges.

WHEN TO REACT (use emotions):
- User shares feelings ("I'm tired", "I don't want to play") → empathize (sad, smize)
- User shares news (good or bad) → react appropriately
- User is playful/teasing → play along (wink, happy)
- User asks something that invites agreement/disagreement → nod/headshake
- Surprising or unexpected info → shocked
- You figure something out → idea

WHEN TO SKIP emotions:
- Pure facts ("What's 2+2?", "What day is it?")
- Simple information requests
- When you JUST used the same emotion recently - VARY your reactions!

CRITICAL: Don't repeat the same emotion multiple times in a row. If you've been using "happy" a lot, try "smize", "pleased", or skip the emotion entirely. Variety matters more than constant reactions!

Available emotions:
POSITIVE (subtle → intense): smize, pleased, happy, excited, celebrate (confetti!)
NEGATIVE: sad (disappointment/empathy), angry (rare)
RESPONSES: nod (yes/agree), headshake (no/disagree)
OTHER: wink (playful), idea (insight), shocked (surprise), look-around (searching), back-forth (weighing options)

Format: [EMOTION:name] at START of message, or omit entirely.

Examples:
"What day is it?" → "It's Thursday!" (no emotion - just facts)
"I got the job!" → "[EMOTION:celebrate] That's amazing!"
"I don't want to play today" → "[EMOTION:sad] Aw, that's okay. Maybe another time!"
"You're funny" → "[EMOTION:wink] I try!"
[After already using happy twice] → vary it or skip

EMOJIS: Do NOT use emojis in your text responses unless you're also using a matching emotion tag. The user can see you animate - emojis without the visual reaction feel disconnected.

Keep responses concise and natural.`,
        };
        const allMessages = [systemPrompt, ...messages];
        try {
            const stream = await this.client.chat.completions.create({
                model: 'gpt-4o-mini', // Changed from gpt-4 for 60x cost savings
                messages: allMessages,
                stream: true,
                temperature: 0.8,
                max_tokens: 300,
            });
            let fullMessage = '';
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    fullMessage += content;
                    onChunk?.(content);
                }
            }
            // Parse emotion from response
            const emotionMatch = fullMessage.match(/\[EMOTION:(\w+(?:-\w+)?)\]/);
            const emotion = emotionMatch ? emotionMatch[1] : undefined;
            // Remove emotion tag from displayed message
            const cleanMessage = fullMessage.replace(/\[EMOTION:\w+(?:-\w+)?\]\s*/g, '');
            return {
                message: cleanMessage,
                emotion,
            };
        }
        catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('[CHAT] Error sending message:', error);
            }
            // Provide specific error messages
            let errorMessage = 'An unexpected error occurred. Please try again.';
            // Type guard for error with status/code/message properties
            const isApiError = (err) => typeof err === 'object' && err !== null;
            if (isApiError(error)) {
                if (error.status === 401) {
                    errorMessage = 'Invalid API key. Please check your OpenAI API key and try again.';
                }
                else if (error.status === 429) {
                    errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
                }
                else if (error.status === 500 || error.status === 503) {
                    errorMessage = 'OpenAI service is currently unavailable. Please try again later.';
                }
                else if (error.message?.includes('fetch')) {
                    errorMessage = 'Network error. Please check your internet connection.';
                }
                else if (error.code === 'insufficient_quota') {
                    errorMessage = 'Your OpenAI account has insufficient credits. Please add credits to your account.';
                }
            }
            throw new Error(errorMessage);
        }
    }
}
const createAntyChat = (apiKey) => new AntyChat(apiKey);

/**
 * Maps emotion tags from chat responses to Anty's emotion types
 */
function mapEmotionToExpression(emotion) {
    if (!emotion) {
        return null;
    }
    const emotionLower = emotion.toLowerCase();
    // Direct mappings
    const emotionMap = {
        // Core emotions
        'happy': 'happy',
        'excited': 'excited',
        'celebrate': 'celebrate',
        'pleased': 'pleased',
        'shocked': 'shocked',
        'sad': 'sad',
        'angry': 'angry',
        'wink': 'wink',
        'jump': 'jump',
        'idea': 'idea',
        'nod': 'nod',
        'headshake': 'headshake',
        'look-left': 'look-left',
        'look-right': 'look-right',
        'spin': 'spin',
        'back-forth': 'back-forth',
        'smize': 'smize',
        // ===========================================
        // POSITIVE EMOTION SCALE ALIASES
        // Level 5: celebrate (EPIC - confetti)
        // Level 4: excited (BIG - jump + spin)
        // Level 3: happy (EXPRESSIVE - wiggle)
        // Level 2: pleased (MODERATE - bounce + happy eyes)
        // Level 1: smize (SUBTLE - happy eyes only)
        // ===========================================
        // Level 5 - celebrate (major celebrations, confetti)
        'ecstatic': 'celebrate',
        'overjoyed': 'celebrate',
        'elated': 'celebrate',
        'thrilled': 'celebrate',
        'euphoric': 'celebrate',
        'celebrating': 'celebrate',
        // Level 4 - excited (victories, accomplishments, jump+spin)
        'victorious': 'excited',
        'triumphant': 'excited',
        'accomplished': 'excited',
        'pumped': 'excited',
        // Level 3 - happy (general positivity)
        'joy': 'happy',
        'joyful': 'happy',
        'delighted': 'happy',
        'cheerful': 'happy',
        'enthusiastic': 'happy',
        // Level 2 - pleased (mild positive)
        'content': 'pleased',
        'satisfied': 'pleased',
        'glad': 'pleased',
        'grateful': 'pleased',
        'thankful': 'pleased',
        'relieved': 'pleased',
        'amused': 'pleased',
        // Level 1 - smize (subtle contentment, eyes only)
        'warm': 'smize',
        'cozy': 'smize',
        'peaceful': 'smize',
        // ===========================================
        // OTHER EMOTION ALIASES
        // ===========================================
        // Shocked/surprised
        'surprised': 'shocked',
        'amazed': 'shocked',
        'astonished': 'shocked',
        'stunned': 'shocked',
        // Sad
        'unhappy': 'sad',
        'disappointed': 'sad',
        'upset': 'sad',
        'down': 'sad',
        'melancholy': 'sad',
        // Angry
        'mad': 'angry',
        'frustrated': 'angry',
        'annoyed': 'angry',
        'irritated': 'angry',
        // Playful
        'playful': 'wink',
        'flirty': 'wink',
        'cheeky': 'wink',
        'mischievous': 'wink',
        // Thinking
        'thinking': 'idea',
        'thoughtful': 'idea',
        'eureka': 'idea',
        'curious': 'idea',
        // Agreement/Disagreement
        'agree': 'nod',
        'yes': 'nod',
        'disagree': 'headshake',
        'no': 'headshake',
        // Considering
        'considering': 'look-left',
        'pondering': 'look-right',
        // Looking around
        'look-around': 'look-around',
        'scanning': 'look-around',
        'searching': 'look-around',
        'suspicious': 'look-around',
        'cautious': 'look-around',
    };
    const mappedExpression = emotionMap[emotionLower] || null;
    return mappedExpression;
}
/**
 * Extracts emotion tag from text
 * Format: [EMOTION:happy] or [EMOTION:back-forth]
 */
function extractEmotion(text) {
    const match = text.match(/\[EMOTION:(\w+(?:-\w+)?)\]/i);
    return match ? match[1] : null;
}
/**
 * Removes emotion tags from text
 */
function stripEmotionTags(text) {
    return text.replace(/\[EMOTION:\w+(?:-\w+)?\]\s*/gi, '').trim();
}
/**
 * Removes emotion tags from text during streaming (also handles partial tags)
 */
function stripEmotionTagsStreaming(text) {
    // First strip any complete emotion tags
    let result = text.replace(/\[EMOTION:\w+(?:-\w+)?\]\s*/gi, '');
    // Also strip any partial emotion tag at the end (still being streamed)
    // This handles cases like "[EMOT", "[EMOTION:", "[EMOTION:hap", etc.
    result = result.replace(/\[EMOTION[^\]]*$/i, '');
    result = result.replace(/\[EMOTIO$/i, '');
    result = result.replace(/\[EMOTI$/i, '');
    result = result.replace(/\[EMOT$/i, '');
    result = result.replace(/\[EMO$/i, '');
    result = result.replace(/\[EM$/i, '');
    result = result.replace(/\[E$/i, '');
    result = result.replace(/\[$/i, '');
    return result.trim();
}

/**
 * Chat history storage utilities
 * Manages conversation sessions in localStorage
 */
const STORAGE_KEY_SESSIONS = 'anty-chat-sessions';
const STORAGE_KEY_CURRENT_SESSION = 'anty-chat-current-session';
const MAX_SESSIONS = 50; // Keep last 50 conversations
/**
 * Generate a unique session ID
 */
function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
/**
 * Generate a title from the first user message
 */
function generateTitle(messages) {
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (!firstUserMessage)
        return 'New Chat';
    // Truncate to ~40 chars
    const content = firstUserMessage.content.trim();
    if (content.length <= 40)
        return content;
    return content.substring(0, 37) + '...';
}
/**
 * Get all saved sessions, sorted by most recent first
 */
function getSessions() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_SESSIONS);
        if (!stored)
            return [];
        const sessions = JSON.parse(stored);
        // Sort by updatedAt descending
        return sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('[CHAT HISTORY] Failed to parse stored sessions:', error);
        }
        return [];
    }
}
/**
 * Get a specific session by ID
 */
function getSession(id) {
    const sessions = getSessions();
    return sessions.find(s => s.id === id) || null;
}
/**
 * Save a session (create or update)
 */
function saveSession(session) {
    const sessions = getSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    if (existingIndex >= 0) {
        sessions[existingIndex] = session;
    }
    else {
        sessions.unshift(session);
    }
    // Trim to max sessions
    const trimmed = sessions.slice(0, MAX_SESSIONS);
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(trimmed));
}
/**
 * Delete a session by ID
 */
function deleteSession(id) {
    const sessions = getSessions();
    const filtered = sessions.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(filtered));
    // Clear current session if it was deleted
    if (getCurrentSessionId() === id) {
        clearCurrentSessionId();
    }
}
/**
 * Get the current session ID
 */
function getCurrentSessionId() {
    return localStorage.getItem(STORAGE_KEY_CURRENT_SESSION);
}
/**
 * Set the current session ID
 */
function setCurrentSessionId(id) {
    localStorage.setItem(STORAGE_KEY_CURRENT_SESSION, id);
}
/**
 * Clear the current session ID
 */
function clearCurrentSessionId() {
    localStorage.removeItem(STORAGE_KEY_CURRENT_SESSION);
}
/**
 * Create a new empty session and set it as current
 */
function createNewSession() {
    const now = new Date().toISOString();
    const session = {
        id: generateSessionId(),
        title: 'New Chat',
        messages: [],
        createdAt: now,
        updatedAt: now,
    };
    saveSession(session);
    setCurrentSessionId(session.id);
    return session;
}
/**
 * Format a date for display in the history list
 */
function formatSessionDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
        // Today - show time
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    else if (diffDays === 1) {
        return 'Yesterday';
    }
    else if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: 'long' });
    }
    else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
}

// Convert between UI Message and stored ChatMessage formats
function toStoredMessage(msg) {
    return {
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        emotion: msg.emotion,
    };
}
function fromStoredMessage(msg) {
    return {
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        emotion: msg.emotion,
    };
}
// Random greeting messages for Anty
const ANTY_GREETINGS = [
    "Hey! What's up?",
    "How's it going?",
    "What can I help you with?",
    "Heyo!",
    "Hey!",
    "What's going on?",
    "What's new?",
    "What can I do for you?",
    "What do you want to chat about?",
    "Hi there!",
    "Hey, good to see you!",
    "What's on your mind?",
    "Ready when you are!",
    "Let's chat!",
    "Hey friend!",
];
function AntyChatPanel({ isOpen, onClose, onEmotion }) {
    const [messages, setMessages] = react.useState([]);
    const [input, setInput] = react.useState('');
    const [isLoading, setIsLoading] = react.useState(false);
    const [apiKey, setApiKey] = react.useState('');
    const [showApiKeyInput, setShowApiKeyInput] = react.useState(true);
    const [chatClient, setChatClient] = react.useState(null);
    const [showMenu, setShowMenu] = react.useState(false);
    const [showHistory, setShowHistory] = react.useState(false);
    const [sessions, setSessions] = react.useState([]);
    const [currentSessionId, setCurrentSessionIdState] = react.useState(null);
    const [isVisible, setIsVisible] = react.useState(false); // For GSAP exit animation
    const messagesEndRef = react.useRef(null);
    const inputRef = react.useRef(null);
    const menuRef = react.useRef(null);
    const panelRef = react.useRef(null);
    const inputBorderRef = react.useRef(null);
    const borderTweenRef = react.useRef(null);
    const initialLoadDone = react.useRef(false);
    const greetingInitiated = react.useRef(false);
    const inactivityTimerRef = react.useRef(null);
    const lastActivityRef = react.useRef(Date.now());
    const isAnimatingRef = react.useRef(false);
    const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
    // Handle panel enter/exit animations with GSAP (replaces Framer Motion)
    react.useEffect(() => {
        if (isOpen && !isVisible) {
            // Opening: show immediately, then animate in
            setIsVisible(true);
        }
        else if (!isOpen && isVisible && panelRef.current && !isAnimatingRef.current) {
            // Closing: animate out, then hide
            isAnimatingRef.current = true;
            gsapWithCSS.to(panelRef.current, {
                x: '100%',
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    setIsVisible(false);
                    isAnimatingRef.current = false;
                },
            });
        }
    }, [isOpen, isVisible]);
    // Animate panel in when it becomes visible
    react.useEffect(() => {
        if (isVisible && panelRef.current) {
            gsapWithCSS.fromTo(panelRef.current, { x: '100%' }, { x: 0, duration: 0.4, ease: 'power3.out' });
        }
    }, [isVisible]);
    // Auto-scroll to bottom when new messages arrive or panel opens
    react.useEffect(() => {
        if (isOpen && messages.length > 0) {
            // Small delay to ensure panel animation has started and content is rendered
            const timer = setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [messages, isOpen]);
    // Focus input when panel opens or API key input is dismissed
    react.useEffect(() => {
        if (isOpen && !showApiKeyInput && !isLoading) {
            // Small delay to ensure input is rendered after animation starts
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [isOpen, showApiKeyInput, isLoading]);
    // Click outside to close menu
    react.useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);
    // Click outside to close panel
    react.useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            // Delay adding listener to avoid closing immediately on open
            const timer = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 100);
            return () => {
                clearTimeout(timer);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen, onClose]);
    // Load API key from localStorage
    react.useEffect(() => {
        const storedKey = localStorage.getItem('anty-chat-api-key');
        if (storedKey) {
            setApiKey(storedKey);
            setChatClient(new AntyChat(storedKey));
            setShowApiKeyInput(false);
        }
    }, []);
    // Load sessions and current session on mount
    react.useEffect(() => {
        if (initialLoadDone.current)
            return;
        initialLoadDone.current = true;
        // Load all sessions for history view
        setSessions(getSessions());
        // Try to restore current session
        const savedSessionId = getCurrentSessionId();
        if (savedSessionId) {
            const session = getSession(savedSessionId);
            if (session && session.messages.length > 0) {
                setCurrentSessionIdState(savedSessionId);
                setMessages(session.messages.map(fromStoredMessage));
            }
        }
    }, []);
    // Save messages to current session when they change
    react.useEffect(() => {
        if (!currentSessionId || messages.length === 0)
            return;
        const session = getSession(currentSessionId);
        if (session) {
            const updatedSession = {
                ...session,
                messages: messages.map(toStoredMessage),
                title: generateTitle(messages.map(toStoredMessage)),
                updatedAt: new Date().toISOString(),
            };
            saveSession(updatedSession);
            setSessions(getSessions()); // Refresh sessions list
        }
    }, [messages, currentSessionId]);
    // Add greeting when panel opens with no session
    react.useEffect(() => {
        // Reset when session changes
        if (!currentSessionId) {
            greetingInitiated.current = false;
        }
    }, [currentSessionId]);
    react.useEffect(() => {
        if (isOpen && !showApiKeyInput && messages.length === 0 && !currentSessionId) {
            // Create a new session
            const newSession = createNewSession();
            setCurrentSessionIdState(newSession.id);
        }
    }, [isOpen, showApiKeyInput, currentSessionId, messages.length]);
    react.useEffect(() => {
        if (isOpen && !showApiKeyInput && messages.length === 0 && currentSessionId && !greetingInitiated.current) {
            greetingInitiated.current = true;
            setIsLoading(true);
            const timer = setTimeout(() => {
                const randomGreeting = ANTY_GREETINGS[Math.floor(Math.random() * ANTY_GREETINGS.length)];
                const greetingMessage = {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: randomGreeting,
                    timestamp: new Date(),
                };
                setMessages([greetingMessage]);
                setIsLoading(false);
            }, 400 + Math.random() * 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, showApiKeyInput, currentSessionId, messages.length]);
    // Rotating gradient border animation
    react.useEffect(() => {
        if (!isOpen || showApiKeyInput)
            return;
        // Small delay to ensure ref is attached after render
        const timer = setTimeout(() => {
            if (!inputBorderRef.current)
                return;
            const rotationAnim = { deg: 0 };
            borderTweenRef.current = gsapWithCSS.to(rotationAnim, {
                deg: 360,
                duration: 4,
                ease: 'none',
                repeat: -1,
                onUpdate: () => {
                    if (inputBorderRef.current) {
                        inputBorderRef.current.style.background = `linear-gradient(white, white) padding-box, conic-gradient(from ${rotationAnim.deg}deg, #E5EDFF 0%, #C7D2FE 25%, #D8B4FE 50%, #C7D2FE 75%, #E5EDFF 100%) border-box`;
                    }
                },
            });
        }, 50);
        return () => {
            clearTimeout(timer);
            borderTweenRef.current?.kill();
            borderTweenRef.current = null;
        };
    }, [isOpen, showApiKeyInput]);
    // ESC key to close chat
    react.useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isOpen) {
                event.preventDefault();
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);
    // Inactivity timer - reset chat after 5 minutes of no user messages
    react.useEffect(() => {
        // Only run when panel is open and we have a session with user messages
        const hasUserMessages = messages.some(m => m.role === 'user');
        if (!isOpen || !currentSessionId || !hasUserMessages || showApiKeyInput) {
            return;
        }
        const checkInactivity = () => {
            const now = Date.now();
            const timeSinceLastActivity = now - lastActivityRef.current;
            if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
                // Save current session (already saved via messages effect) and start new chat
                const newSession = createNewSession();
                setCurrentSessionIdState(newSession.id);
                setMessages([]);
                greetingInitiated.current = false;
                setSessions(getSessions());
                // Show new greeting
                setIsLoading(true);
                setTimeout(() => {
                    const randomGreeting = ANTY_GREETINGS[Math.floor(Math.random() * ANTY_GREETINGS.length)];
                    const greetingMessage = {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: randomGreeting,
                        timestamp: new Date(),
                    };
                    setMessages([greetingMessage]);
                    setIsLoading(false);
                    lastActivityRef.current = Date.now();
                }, 400 + Math.random() * 300);
            }
        };
        // Check every 30 seconds
        inactivityTimerRef.current = setInterval(checkInactivity, 30000);
        return () => {
            if (inactivityTimerRef.current) {
                clearInterval(inactivityTimerRef.current);
                inactivityTimerRef.current = null;
            }
        };
    }, [isOpen, currentSessionId, messages, showApiKeyInput]);
    const handleSetApiKey = () => {
        if (!apiKey.trim())
            return;
        localStorage.setItem('anty-chat-api-key', apiKey);
        setChatClient(new AntyChat(apiKey));
        setShowApiKeyInput(false);
        // Show loading then add welcome message with random greeting
        setIsLoading(true);
        setTimeout(() => {
            const randomGreeting = ANTY_GREETINGS[Math.floor(Math.random() * ANTY_GREETINGS.length)];
            const welcomeMessage = {
                id: Date.now().toString(),
                role: 'assistant',
                content: randomGreeting,
                timestamp: new Date(),
            };
            setMessages([welcomeMessage]);
            setIsLoading(false);
            // Trigger happy emotion
            const expression = mapEmotionToExpression('happy');
            if (expression) {
                onEmotion?.(expression);
            }
        }, 400 + Math.random() * 300);
    };
    const handleSend = async () => {
        if (!input.trim() || !chatClient || isLoading)
            return;
        // Reset inactivity timer
        lastActivityRef.current = Date.now();
        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        // Reset textarea height
        if (inputRef.current) {
            inputRef.current.style.height = '48px';
        }
        setIsLoading(true);
        // Create a placeholder message for streaming
        const assistantMessageId = (Date.now() + 1).toString();
        const assistantMessage = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        try {
            const chatHistory = messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));
            chatHistory.push({
                role: 'user',
                content: userMessage.content,
            });
            let rawResponse = '';
            // Stream the response
            const response = await chatClient.sendMessage(chatHistory, (chunk) => {
                rawResponse += chunk;
                // Strip emotion tags from the displayed content during streaming (handles partial tags)
                const cleanChunk = stripEmotionTagsStreaming(rawResponse);
                setMessages((prev) => prev.map((msg) => msg.id === assistantMessageId
                    ? { ...msg, content: cleanChunk }
                    : msg));
            });
            // Update with final message including debug info
            setMessages((prev) => prev.map((msg) => msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: response.message,
                    emotion: response.emotion,
                    rawContent: rawResponse,
                }
                : msg));
            // Trigger emotion if present
            if (response.emotion) {
                const expression = mapEmotionToExpression(response.emotion);
                if (expression) {
                    onEmotion?.(expression);
                }
            }
        }
        catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('[CHAT UI] Error sending message:', error);
            }
            // Remove the placeholder message
            setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
            // Show specific error message
            const errorContent = error instanceof Error ? error.message : 'Oops! Something went wrong. Please try again.';
            const errorMessage = {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: errorContent,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
            // Trigger sad emotion
            const expression = mapEmotionToExpression('sad');
            if (expression) {
                onEmotion?.(expression);
            }
        }
        finally {
            setIsLoading(false);
            // Auto-focus input after sending message
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (showApiKeyInput) {
                handleSetApiKey();
            }
            else {
                handleSend();
            }
        }
    };
    // Auto-resize textarea up to 3 lines
    const handleInputChange = (e) => {
        setInput(e.target.value);
        const textarea = e.target;
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        // Calculate line height (approximately 24px per line with padding)
        const lineHeight = 24;
        const maxLines = 3;
        const maxHeight = lineHeight * maxLines;
        // Set height to scrollHeight, but cap at maxHeight
        const newHeight = Math.min(textarea.scrollHeight, maxHeight);
        textarea.style.height = `${newHeight}px`;
    };
    const handleClearApiKey = () => {
        localStorage.removeItem('anty-chat-api-key');
        setApiKey('');
        setChatClient(null);
        setShowApiKeyInput(true);
        setMessages([]);
        setCurrentSessionIdState(null);
        setShowMenu(false);
        setShowHistory(false);
    };
    const handleNewChat = () => {
        // Create a new session
        const newSession = createNewSession();
        setCurrentSessionIdState(newSession.id);
        setMessages([]);
        setShowMenu(false);
        setShowHistory(false);
        setSessions(getSessions());
        // Show new greeting after a brief delay
        setIsLoading(true);
        setTimeout(() => {
            const randomGreeting = ANTY_GREETINGS[Math.floor(Math.random() * ANTY_GREETINGS.length)];
            const greetingMessage = {
                id: Date.now().toString(),
                role: 'assistant',
                content: randomGreeting,
                timestamp: new Date(),
            };
            setMessages([greetingMessage]);
            setIsLoading(false);
        }, 400 + Math.random() * 300);
    };
    const handleSelectSession = (sessionId) => {
        const session = getSession(sessionId);
        if (session) {
            setCurrentSessionIdState(sessionId);
            setCurrentSessionId(sessionId);
            setMessages(session.messages.map(fromStoredMessage));
            setShowHistory(false);
            // Reset inactivity timer when loading a session
            lastActivityRef.current = Date.now();
        }
    };
    const handleDeleteSession = (sessionId, e) => {
        e.stopPropagation(); // Don't trigger select
        deleteSession(sessionId);
        setSessions(getSessions());
        // If we deleted the current session, clear it
        if (sessionId === currentSessionId) {
            setCurrentSessionIdState(null);
            setMessages([]);
        }
    };
    const toggleDebugInfo = (messageId) => {
        setMessages((prev) => prev.map((msg) => msg.id === messageId ? { ...msg, showDebug: !msg.showDebug } : msg));
    };
    // Inline styles to avoid Tailwind dependency
    const styles = {
        panel: {
            position: 'fixed',
            right: '10px',
            top: '10px',
            bottom: '10px',
            width: '384px',
            maxWidth: 'calc(100vw - 20px)',
            backgroundColor: 'white',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
        },
        headerTitle: {
            fontSize: '18px',
            fontWeight: 600,
            color: '#111827',
            paddingLeft: '8px',
        },
        headerButtons: {
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
        },
        iconButton: {
            padding: '8px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        messagesContainer: {
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
        },
        messageRow: (isUser) => ({
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
        }),
        messageBubble: (isUser) => ({
            maxWidth: '80%',
            borderRadius: '8px',
            padding: '8px 16px',
            backgroundColor: isUser ? '#8B5CF6' : '#f3f4f6',
            color: isUser ? 'white' : '#111827',
            cursor: !isUser ? 'pointer' : 'default',
        }),
        messageText: {
            fontSize: '14px',
            margin: 0,
        },
        messageTime: {
            fontSize: '12px',
            opacity: 0.7,
            marginTop: '4px',
        },
        inputContainer: {
            padding: '16px',
        },
        inputBorder: {
            position: 'relative',
            borderRadius: '12px',
            padding: '2px',
            background: 'linear-gradient(white, white) padding-box, conic-gradient(from 0deg, #E5EDFF 0%, #C7D2FE 25%, #D8B4FE 50%, #C7D2FE 75%, #E5EDFF 100%) border-box',
            border: '2px solid transparent',
        },
        textarea: {
            width: '100%',
            paddingLeft: '16px',
            paddingRight: '48px',
            paddingTop: '12px',
            paddingBottom: '12px',
            backgroundColor: 'white',
            borderRadius: '10px',
            outline: 'none',
            border: 'none',
            resize: 'none',
            fontSize: '14px',
            lineHeight: '24px',
            minHeight: '48px',
            maxHeight: '72px',
        },
        sendButton: (disabled) => ({
            position: 'absolute',
            right: '12px',
            bottom: '8px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: disabled ? '#e5e7eb' : '#8B5CF6',
            color: disabled ? '#6b7280' : 'white',
            opacity: disabled ? 0.3 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
        }),
        apiKeyContainer: {
            padding: '24px',
        },
        apiKeyTitle: {
            fontSize: '14px',
            fontWeight: 500,
            color: '#374151',
            marginBottom: '8px',
        },
        apiKeyDescription: {
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '16px',
        },
        apiKeyInput: {
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            outline: 'none',
            fontSize: '14px',
        },
        apiKeyButton: {
            width: '100%',
            padding: '8px 16px',
            backgroundColor: '#8B5CF6',
            color: 'white',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            marginTop: '16px',
            fontSize: '14px',
            fontWeight: 500,
        },
        historyItem: (isActive) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            cursor: 'pointer',
            backgroundColor: isActive ? '#f3e8ff' : 'transparent',
            borderBottom: '1px solid #f3f4f6',
        }),
        historyTitle: {
            fontSize: '14px',
            fontWeight: 500,
            color: '#111827',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        historyMeta: {
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '2px',
        },
        menu: {
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: '4px',
            width: '192px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '4px 0',
            zIndex: 10,
        },
        menuItem: {
            width: '100%',
            padding: '8px 16px',
            textAlign: 'left',
            fontSize: '14px',
            color: '#374151',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        loadingBubble: {
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            padding: '8px 16px',
        },
        backButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#4b5563',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            paddingLeft: '4px',
            fontSize: '18px',
            fontWeight: 600,
        },
        emptyHistory: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#9ca3af',
            padding: '32px',
        },
    };
    return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: isVisible && (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsxs("div", { ref: panelRef, style: { ...styles.panel, transform: 'translateX(100%)' }, children: [jsxRuntime.jsxs("div", { style: styles.header, children: [showHistory ? (jsxRuntime.jsxs("button", { onClick: () => setShowHistory(false), style: styles.backButton, children: [jsxRuntime.jsx(ChevronLeft, { size: 20 }), jsxRuntime.jsx("span", { children: "History" })] })) : (jsxRuntime.jsx("h2", { style: styles.headerTitle, children: "Anty Chat" })), jsxRuntime.jsxs("div", { style: styles.headerButtons, children: [!showApiKeyInput && !showHistory && (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsx("button", { onClick: handleNewChat, style: styles.iconButton, title: "New Chat", children: jsxRuntime.jsx(MessageSquarePlus, { size: 20, color: "#4b5563" }) }), jsxRuntime.jsx("button", { onClick: () => {
                                                        setSessions(getSessions()); // Refresh before showing
                                                        setShowHistory(true);
                                                    }, style: styles.iconButton, title: "Chat History", children: jsxRuntime.jsx(History, { size: 20, color: "#4b5563" }) }), jsxRuntime.jsxs("div", { style: { position: 'relative' }, ref: menuRef, children: [jsxRuntime.jsx("button", { onClick: () => setShowMenu(!showMenu), style: styles.iconButton, title: "Menu", children: jsxRuntime.jsx(EllipsisVertical, { size: 20, color: "#4b5563" }) }), showMenu && (jsxRuntime.jsx("div", { style: styles.menu, children: jsxRuntime.jsxs("button", { onClick: handleClearApiKey, style: styles.menuItem, children: [jsxRuntime.jsx(Key, { size: 16 }), "Change API Key"] }) }))] })] })), jsxRuntime.jsx("button", { onClick: onClose, style: styles.iconButton, children: jsxRuntime.jsx(X, { size: 20, color: "#4b5563" }) })] })] }), showApiKeyInput && (jsxRuntime.jsxs("div", { style: styles.apiKeyContainer, children: [jsxRuntime.jsxs("div", { children: [jsxRuntime.jsx("h3", { style: styles.apiKeyTitle, children: "Enter your OpenAI API Key" }), jsxRuntime.jsx("p", { style: styles.apiKeyDescription, children: "Your API key is stored locally and never sent to our servers." }), jsxRuntime.jsx("input", { type: "password", value: apiKey, onChange: (e) => setApiKey(e.target.value), onKeyDown: handleKeyDown, placeholder: "sk-...", style: styles.apiKeyInput })] }), jsxRuntime.jsx("button", { onClick: handleSetApiKey, disabled: !apiKey.trim(), style: {
                                        ...styles.apiKeyButton,
                                        opacity: !apiKey.trim() ? 0.5 : 1,
                                        cursor: !apiKey.trim() ? 'not-allowed' : 'pointer',
                                    }, children: "Start Chatting" }), jsxRuntime.jsxs("p", { style: { ...styles.apiKeyDescription, marginTop: '16px' }, children: ["Don't have an API key?", ' ', jsxRuntime.jsx("a", { href: "https://platform.openai.com/api-keys", target: "_blank", rel: "noopener noreferrer", style: { color: '#8B5CF6' }, children: "Get one here" })] })] })), !showApiKeyInput && showHistory && (jsxRuntime.jsx("div", { style: { flex: 1, overflowY: 'auto' }, children: sessions.filter(s => s.messages.some(m => m.role === 'user')).length === 0 ? (jsxRuntime.jsxs("div", { style: styles.emptyHistory, children: [jsxRuntime.jsx(History, { size: 48, style: { opacity: 0.5, marginBottom: '12px' } }), jsxRuntime.jsx("p", { style: { fontSize: '14px' }, children: "No chat history yet" })] })) : (jsxRuntime.jsx("div", { children: sessions.filter(s => s.messages.some(m => m.role === 'user')).map((session) => (jsxRuntime.jsxs("div", { onClick: () => handleSelectSession(session.id), style: styles.historyItem(session.id === currentSessionId), children: [jsxRuntime.jsxs("div", { style: { flex: 1, minWidth: 0, paddingRight: '12px' }, children: [jsxRuntime.jsx("p", { style: styles.historyTitle, children: session.title }), jsxRuntime.jsxs("p", { style: styles.historyMeta, children: [formatSessionDate(session.updatedAt), " \u00B7 ", session.messages.length, " messages"] })] }), jsxRuntime.jsx("button", { onClick: (e) => handleDeleteSession(session.id, e), style: { ...styles.iconButton, padding: '6px' }, title: "Delete chat", children: jsxRuntime.jsx(Trash2, { size: 16, color: "#9ca3af" }) })] }, session.id))) })) })), !showApiKeyInput && !showHistory && (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsxs("div", { style: styles.messagesContainer, children: [messages.map((message) => (jsxRuntime.jsx("div", { style: styles.messageRow(message.role === 'user'), children: jsxRuntime.jsxs("div", { style: styles.messageBubble(message.role === 'user'), onClick: () => {
                                                    if (message.role === 'assistant' && message.emotion) {
                                                        toggleDebugInfo(message.id);
                                                    }
                                                }, children: [jsxRuntime.jsx("p", { style: styles.messageText, children: message.content }), jsxRuntime.jsx("p", { style: styles.messageTime, children: message.timestamp.toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        }) }), message.role === 'assistant' && message.showDebug && message.emotion && (jsxRuntime.jsx("div", { style: { marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #d1d5db' }, children: jsxRuntime.jsxs("div", { style: { fontSize: '12px', color: '#4b5563' }, children: [jsxRuntime.jsx("span", { style: { fontWeight: 500 }, children: "Emotion:" }), " ", message.emotion] }) }))] }) }, message.id))), isLoading && (jsxRuntime.jsx("div", { style: { display: 'flex', justifyContent: 'flex-start' }, children: jsxRuntime.jsx("div", { style: styles.loadingBubble, children: jsxRuntime.jsx(LoaderCircle, { size: 20, color: "#4b5563", style: { animation: 'spin 1s linear infinite' } }) }) })), jsxRuntime.jsx("div", { ref: messagesEndRef })] }), jsxRuntime.jsxs("div", { style: styles.inputContainer, children: [!messages.some(m => m.role === 'user') && (jsxRuntime.jsx("div", { style: { fontSize: '12px', color: '#9ca3af', textAlign: 'left', marginBottom: '8px', paddingLeft: '4px' }, children: "GPT-4o-mini \u2014 API connected" })), jsxRuntime.jsxs("div", { ref: inputBorderRef, style: styles.inputBorder, children: [jsxRuntime.jsx("textarea", { ref: inputRef, value: input, onChange: handleInputChange, onKeyDown: handleKeyDown, placeholder: "Type a message...", disabled: isLoading, rows: 1, style: styles.textarea }), jsxRuntime.jsx("button", { onClick: handleSend, disabled: !input.trim() || isLoading, style: styles.sendButton(!input.trim() || isLoading), children: jsxRuntime.jsx(Send, { size: 16 }) })] })] })] }))] }), jsxRuntime.jsx("style", { children: `
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          ` })] })) }));
}

/**
 * Anty Style Helpers
 *
 * Centralized style definitions for Anty character elements.
 * Use these to ensure consistency between the package and consuming apps.
 */
/**
 * Style helper functions for Anty character elements.
 * All measurements are based on a 160px base size.
 * Pass scale = size / 160 for proper scaling.
 */
const ANTY_STYLES = {
    /**
     * Full container with extra height for shadow room.
     * Use this when you need the character + shadow to fit in a container.
     */
    getFullContainer: (size) => ({
        position: 'relative',
        width: size,
        height: size * 1.5, // Extra height for shadow
        overflow: 'visible',
    }),
    /**
     * Compact container (just the character, no shadow room).
     */
    getContainer: (size) => ({
        position: 'relative',
        width: size,
        height: size,
        overflow: 'visible',
    }),
    /**
     * Shadow style (positioned at bottom of container).
     * @param scale - Size scale factor (size / 160)
     */
    getShadow: (scale = 1) => ({
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: '0px',
        width: `${160 * scale}px`,
        height: `${40 * scale}px`,
        background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 70%)',
        filter: `blur(${12 * scale}px)`,
        borderRadius: '50%',
        opacity: 0.7,
        pointerEvents: 'none',
    }),
    /**
     * Inner glow style (smaller, behind character).
     * @param scale - Size scale factor (size / 160)
     */
    getInnerGlow: (scale = 1) => ({
        position: 'absolute',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        top: `${80 * scale}px`,
        width: `${120 * scale}px`,
        height: `${90 * scale}px`,
        borderRadius: '50%',
        background: 'linear-gradient(90deg, #C5D4FF 0%, #E0C5FF 100%)',
        filter: `blur(${25 * scale}px)`,
        pointerEvents: 'none',
    }),
    /**
     * Outer glow style (larger, behind inner glow).
     * @param scale - Size scale factor (size / 160)
     */
    getOuterGlow: (scale = 1) => ({
        position: 'absolute',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        top: `${80 * scale}px`,
        width: `${170 * scale}px`,
        height: `${130 * scale}px`,
        borderRadius: '50%',
        background: 'linear-gradient(90deg, #D5E2FF 0%, #EED5FF 100%)',
        filter: `blur(${32 * scale}px)`,
        pointerEvents: 'none',
    }),
    /**
     * Base size used for all style calculations.
     * Divide your target size by this to get the scale factor.
     */
    BASE_SIZE: 160,
    /**
     * Calculate scale factor from a given size.
     * @param size - Target size in pixels
     * @returns Scale factor to pass to style helpers
     */
    getScale: (size) => size / 160,
};

/**
 * @antfly/anty-embed
 *
 * Embeddable Anty character animation for web applications.
 *
 * @example
 * ```tsx
 * import { AntyCharacter } from '@antfly/anty-embed';
 *
 * function App() {
 *   const antyRef = useRef<AntyCharacterHandle>(null);
 *
 *   const handleClick = () => {
 *     antyRef.current?.playEmotion('happy');
 *   };
 *
 *   return (
 *     <AntyCharacter
 *       ref={antyRef}
 *       size={160}
 *       expression="idle"
 *       showShadow={true}
 *       showGlow={true}
 *     />
 *   );
 * }
 * ```
 */
// Main components
// List of available emotions (derived from EMOTION_CONFIGS)
const AVAILABLE_EMOTIONS = Object.keys(EMOTION_CONFIGS);

exports.ANTY_STYLES = ANTY_STYLES;
exports.AVAILABLE_EMOTIONS = AVAILABLE_EMOTIONS;
exports.AntyCharacter = AntyCharacter;
exports.AntyChat = AntyChat;
exports.AntyChatPanel = AntyChatPanel;
exports.AntyParticleCanvas = AntyParticleCanvas;
exports.AntySearchBar = AntySearchBar;
exports.DEFAULT_SEARCH_BAR_CONFIG = DEFAULT_SEARCH_BAR_CONFIG;
exports.EMOTION_CONFIGS = EMOTION_CONFIGS;
exports.ENABLE_ANIMATION_DEBUG_LOGS = ENABLE_ANIMATION_DEBUG_LOGS;
exports.EYE_DIMENSIONS = EYE_DIMENSIONS;
exports.EYE_SHAPES = EYE_SHAPES;
exports.PARTICLE_CONFIGS = PARTICLE_CONFIGS;
exports.PRESETS = PRESETS;
exports.clearCurrentSessionId = clearCurrentSessionId;
exports.createAntyChat = createAntyChat;
exports.createEyeAnimation = createEyeAnimation;
exports.createIdleAnimation = createIdleAnimation;
exports.createLookAnimation = createLookAnimation;
exports.createNewSession = createNewSession;
exports.createPowerOffAnimation = createPowerOffAnimation;
exports.createReturnFromLookAnimation = createReturnFromLookAnimation;
exports.createWakeUpAnimation = createWakeUpAnimation;
exports.deleteSession = deleteSession;
exports.extractEmotion = extractEmotion;
exports.formatSessionDate = formatSessionDate;
exports.generateTitle = generateTitle;
exports.getCurrentSessionId = getCurrentSessionId;
exports.getEmotionConfig = getEmotionConfig;
exports.getEyeDimensions = getEyeDimensions;
exports.getEyeShape = getEyeShape;
exports.getSession = getSession;
exports.getSessions = getSessions;
exports.isEmotionType = isEmotionType;
exports.logAnimationEvent = logAnimationEvent;
exports.logAnimationSystemInfo = logAnimationSystemInfo;
exports.mapEmotionToExpression = mapEmotionToExpression;
exports.saveSession = saveSession;
exports.setCurrentSessionId = setCurrentSessionId;
exports.stripEmotionTags = stripEmotionTags;
exports.stripEmotionTagsStreaming = stripEmotionTagsStreaming;
exports.useAnimationController = useAnimationController;
exports.useSearchMorph = useSearchMorph;
//# sourceMappingURL=index.js.map
