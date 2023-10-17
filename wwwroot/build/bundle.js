
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop$1(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop$1(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all(updates);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    // external events
    const FINALIZE_EVENT_NAME = "finalize";
    const CONSIDER_EVENT_NAME = "consider";

    /**
     * @typedef {Object} Info
     * @property {string} trigger
     * @property {string} id
     * @property {string} source
     * @param {Node} el
     * @param {Array} items
     * @param {Info} info
     */
    function dispatchFinalizeEvent(el, items, info) {
        el.dispatchEvent(
            new CustomEvent(FINALIZE_EVENT_NAME, {
                detail: {items, info}
            })
        );
    }

    /**
     * Dispatches a consider event
     * @param {Node} el
     * @param {Array} items
     * @param {Info} info
     */
    function dispatchConsiderEvent(el, items, info) {
        el.dispatchEvent(
            new CustomEvent(CONSIDER_EVENT_NAME, {
                detail: {items, info}
            })
        );
    }

    // internal events
    const DRAGGED_ENTERED_EVENT_NAME = "draggedEntered";
    const DRAGGED_LEFT_EVENT_NAME = "draggedLeft";
    const DRAGGED_OVER_INDEX_EVENT_NAME = "draggedOverIndex";
    const DRAGGED_LEFT_DOCUMENT_EVENT_NAME = "draggedLeftDocument";

    const DRAGGED_LEFT_TYPES = {
        LEFT_FOR_ANOTHER: "leftForAnother",
        OUTSIDE_OF_ANY: "outsideOfAny"
    };

    function dispatchDraggedElementEnteredContainer(containerEl, indexObj, draggedEl) {
        containerEl.dispatchEvent(
            new CustomEvent(DRAGGED_ENTERED_EVENT_NAME, {
                detail: {indexObj, draggedEl}
            })
        );
    }

    /**
     * @param containerEl - the dropzone the element left
     * @param draggedEl - the dragged element
     * @param theOtherDz - the new dropzone the element entered
     */
    function dispatchDraggedElementLeftContainerForAnother(containerEl, draggedEl, theOtherDz) {
        containerEl.dispatchEvent(
            new CustomEvent(DRAGGED_LEFT_EVENT_NAME, {
                detail: {draggedEl, type: DRAGGED_LEFT_TYPES.LEFT_FOR_ANOTHER, theOtherDz}
            })
        );
    }

    function dispatchDraggedElementLeftContainerForNone(containerEl, draggedEl) {
        containerEl.dispatchEvent(
            new CustomEvent(DRAGGED_LEFT_EVENT_NAME, {
                detail: {draggedEl, type: DRAGGED_LEFT_TYPES.OUTSIDE_OF_ANY}
            })
        );
    }
    function dispatchDraggedElementIsOverIndex(containerEl, indexObj, draggedEl) {
        containerEl.dispatchEvent(
            new CustomEvent(DRAGGED_OVER_INDEX_EVENT_NAME, {
                detail: {indexObj, draggedEl}
            })
        );
    }
    function dispatchDraggedLeftDocument(draggedEl) {
        window.dispatchEvent(
            new CustomEvent(DRAGGED_LEFT_DOCUMENT_EVENT_NAME, {
                detail: {draggedEl}
            })
        );
    }

    const TRIGGERS = {
        DRAG_STARTED: "dragStarted",
        DRAGGED_ENTERED: DRAGGED_ENTERED_EVENT_NAME,
        DRAGGED_ENTERED_ANOTHER: "dragEnteredAnother",
        DRAGGED_OVER_INDEX: DRAGGED_OVER_INDEX_EVENT_NAME,
        DRAGGED_LEFT: DRAGGED_LEFT_EVENT_NAME,
        DRAGGED_LEFT_ALL: "draggedLeftAll",
        DROPPED_INTO_ZONE: "droppedIntoZone",
        DROPPED_INTO_ANOTHER: "droppedIntoAnother",
        DROPPED_OUTSIDE_OF_ANY: "droppedOutsideOfAny",
        DRAG_STOPPED: "dragStopped"
    };

    const SOURCES = {
        POINTER: "pointer",
        KEYBOARD: "keyboard"
    };

    const SHADOW_ITEM_MARKER_PROPERTY_NAME = "isDndShadowItem";
    const SHADOW_ELEMENT_ATTRIBUTE_NAME = "data-is-dnd-shadow-item-internal";
    const SHADOW_ELEMENT_HINT_ATTRIBUTE_NAME = "data-is-dnd-shadow-item-hint";
    const SHADOW_PLACEHOLDER_ITEM_ID = "id:dnd-shadow-placeholder-0000";
    const DRAGGED_ELEMENT_ID = "dnd-action-dragged-el";

    let ITEM_ID_KEY = "id";
    let activeDndZoneCount = 0;
    function incrementActiveDropZoneCount() {
        activeDndZoneCount++;
    }
    function decrementActiveDropZoneCount() {
        if (activeDndZoneCount === 0) {
            throw new Error("Bug! trying to decrement when there are no dropzones");
        }
        activeDndZoneCount--;
    }

    const isOnServer = typeof window === "undefined";

    // This is based off https://stackoverflow.com/questions/27745438/how-to-compute-getboundingclientrect-without-considering-transforms/57876601#57876601
    // It removes the transforms that are potentially applied by the flip animations
    /**
     * Gets the bounding rect but removes transforms (ex: flip animation)
     * @param {HTMLElement} el
     * @return {{top: number, left: number, bottom: number, right: number}}
     */
    function getBoundingRectNoTransforms(el) {
        let ta;
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const tx = style.transform;

        if (tx) {
            let sx, sy, dx, dy;
            if (tx.startsWith("matrix3d(")) {
                ta = tx.slice(9, -1).split(/, /);
                sx = +ta[0];
                sy = +ta[5];
                dx = +ta[12];
                dy = +ta[13];
            } else if (tx.startsWith("matrix(")) {
                ta = tx.slice(7, -1).split(/, /);
                sx = +ta[0];
                sy = +ta[3];
                dx = +ta[4];
                dy = +ta[5];
            } else {
                return rect;
            }

            const to = style.transformOrigin;
            const x = rect.x - dx - (1 - sx) * parseFloat(to);
            const y = rect.y - dy - (1 - sy) * parseFloat(to.slice(to.indexOf(" ") + 1));
            const w = sx ? rect.width / sx : el.offsetWidth;
            const h = sy ? rect.height / sy : el.offsetHeight;
            return {
                x: x,
                y: y,
                width: w,
                height: h,
                top: y,
                right: x + w,
                bottom: y + h,
                left: x
            };
        } else {
            return rect;
        }
    }

    /**
     * Gets the absolute bounding rect (accounts for the window's scroll position and removes transforms)
     * @param {HTMLElement} el
     * @return {{top: number, left: number, bottom: number, right: number}}
     */
    function getAbsoluteRectNoTransforms(el) {
        const rect = getBoundingRectNoTransforms(el);
        return {
            top: rect.top + window.scrollY,
            bottom: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            right: rect.right + window.scrollX
        };
    }

    /**
     * Gets the absolute bounding rect (accounts for the window's scroll position)
     * @param {HTMLElement} el
     * @return {{top: number, left: number, bottom: number, right: number}}
     */
    function getAbsoluteRect(el) {
        const rect = el.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            bottom: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            right: rect.right + window.scrollX
        };
    }

    /**
     * finds the center :)
     * @typedef {Object} Rect
     * @property {number} top
     * @property {number} bottom
     * @property {number} left
     * @property {number} right
     * @param {Rect} rect
     * @return {{x: number, y: number}}
     */
    function findCenter(rect) {
        return {
            x: (rect.left + rect.right) / 2,
            y: (rect.top + rect.bottom) / 2
        };
    }

    /**
     * @typedef {Object} Point
     * @property {number} x
     * @property {number} y
     * @param {Point} pointA
     * @param {Point} pointB
     * @return {number}
     */
    function calcDistance(pointA, pointB) {
        return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
    }

    /**
     * @param {Point} point
     * @param {Rect} rect
     * @return {boolean|boolean}
     */
    function isPointInsideRect(point, rect) {
        return point.y <= rect.bottom && point.y >= rect.top && point.x >= rect.left && point.x <= rect.right;
    }

    /**
     * find the absolute coordinates of the center of a dom element
     * @param el {HTMLElement}
     * @returns {{x: number, y: number}}
     */
    function findCenterOfElement(el) {
        return findCenter(getAbsoluteRect(el));
    }

    /**
     * @param {HTMLElement} elA
     * @param {HTMLElement} elB
     * @return {boolean}
     */
    function isCenterOfAInsideB(elA, elB) {
        const centerOfA = findCenterOfElement(elA);
        const rectOfB = getAbsoluteRectNoTransforms(elB);
        return isPointInsideRect(centerOfA, rectOfB);
    }

    /**
     * @param {HTMLElement|ChildNode} elA
     * @param {HTMLElement|ChildNode} elB
     * @return {number}
     */
    function calcDistanceBetweenCenters(elA, elB) {
        const centerOfA = findCenterOfElement(elA);
        const centerOfB = findCenterOfElement(elB);
        return calcDistance(centerOfA, centerOfB);
    }

    /**
     * @param {HTMLElement} el - the element to check
     * @returns {boolean} - true if the element in its entirety is off screen including the scrollable area (the normal dom events look at the mouse rather than the element)
     */
    function isElementOffDocument(el) {
        const rect = getAbsoluteRect(el);
        return rect.right < 0 || rect.left > document.documentElement.scrollWidth || rect.bottom < 0 || rect.top > document.documentElement.scrollHeight;
    }

    /**
     * If the point is inside the element returns its distances from the sides, otherwise returns null
     * @param {Point} point
     * @param {HTMLElement} el
     * @return {null|{top: number, left: number, bottom: number, right: number}}
     */
    function calcInnerDistancesBetweenPointAndSidesOfElement(point, el) {
        const rect = getAbsoluteRect(el);
        if (!isPointInsideRect(point, rect)) {
            return null;
        }
        return {
            top: point.y - rect.top,
            bottom: rect.bottom - point.y,
            left: point.x - rect.left,
            // TODO - figure out what is so special about right (why the rect is too big)
            right: Math.min(rect.right, document.documentElement.clientWidth) - point.x
        };
    }

    let dzToShadowIndexToRect;

    /**
     * Resets the cache that allows for smarter "would be index" resolution. Should be called after every drag operation
     */
    function resetIndexesCache() {
        dzToShadowIndexToRect = new Map();
    }
    resetIndexesCache();

    /**
     * Resets the cache that allows for smarter "would be index" resolution for a specific dropzone, should be called after the zone was scrolled
     * @param {HTMLElement} dz
     */
    function resetIndexesCacheForDz(dz) {
        dzToShadowIndexToRect.delete(dz);
    }

    /**
     * Caches the coordinates of the shadow element when it's in a certain index in a certain dropzone.
     * Helpful in order to determine "would be index" more effectively
     * @param {HTMLElement} dz
     * @return {number} - the shadow element index
     */
    function cacheShadowRect(dz) {
        const shadowElIndex = Array.from(dz.children).findIndex(child => child.getAttribute(SHADOW_ELEMENT_ATTRIBUTE_NAME));
        if (shadowElIndex >= 0) {
            if (!dzToShadowIndexToRect.has(dz)) {
                dzToShadowIndexToRect.set(dz, new Map());
            }
            dzToShadowIndexToRect.get(dz).set(shadowElIndex, getAbsoluteRectNoTransforms(dz.children[shadowElIndex]));
            return shadowElIndex;
        }
        return undefined;
    }

    /**
     * @typedef {Object} Index
     * @property {number} index - the would be index
     * @property {boolean} isProximityBased - false if the element is actually over the index, true if it is not over it but this index is the closest
     */
    /**
     * Find the index for the dragged element in the list it is dragged over
     * @param {HTMLElement} floatingAboveEl
     * @param {HTMLElement} collectionBelowEl
     * @returns {Index|null} -  if the element is over the container the Index object otherwise null
     */
    function findWouldBeIndex(floatingAboveEl, collectionBelowEl) {
        if (!isCenterOfAInsideB(floatingAboveEl, collectionBelowEl)) {
            return null;
        }
        const children = collectionBelowEl.children;
        // the container is empty, floating element should be the first
        if (children.length === 0) {
            return {index: 0, isProximityBased: true};
        }
        const shadowElIndex = cacheShadowRect(collectionBelowEl);

        // the search could be more efficient but keeping it simple for now
        // a possible improvement: pass in the lastIndex it was found in and check there first, then expand from there
        for (let i = 0; i < children.length; i++) {
            if (isCenterOfAInsideB(floatingAboveEl, children[i])) {
                const cachedShadowRect = dzToShadowIndexToRect.has(collectionBelowEl) && dzToShadowIndexToRect.get(collectionBelowEl).get(i);
                if (cachedShadowRect) {
                    if (!isPointInsideRect(findCenterOfElement(floatingAboveEl), cachedShadowRect)) {
                        return {index: shadowElIndex, isProximityBased: false};
                    }
                }
                return {index: i, isProximityBased: false};
            }
        }
        // this can happen if there is space around the children so the floating element has
        //entered the container but not any of the children, in this case we will find the nearest child
        let minDistanceSoFar = Number.MAX_VALUE;
        let indexOfMin = undefined;
        // we are checking all of them because we don't know whether we are dealing with a horizontal or vertical container and where the floating element entered from
        for (let i = 0; i < children.length; i++) {
            const distance = calcDistanceBetweenCenters(floatingAboveEl, children[i]);
            if (distance < minDistanceSoFar) {
                minDistanceSoFar = distance;
                indexOfMin = i;
            }
        }
        return {index: indexOfMin, isProximityBased: true};
    }

    const SCROLL_ZONE_PX = 25;

    function makeScroller() {
        let scrollingInfo;
        function resetScrolling() {
            scrollingInfo = {directionObj: undefined, stepPx: 0};
        }
        resetScrolling();
        // directionObj {x: 0|1|-1, y:0|1|-1} - 1 means down in y and right in x
        function scrollContainer(containerEl) {
            const {directionObj, stepPx} = scrollingInfo;
            if (directionObj) {
                containerEl.scrollBy(directionObj.x * stepPx, directionObj.y * stepPx);
                window.requestAnimationFrame(() => scrollContainer(containerEl));
            }
        }
        function calcScrollStepPx(distancePx) {
            return SCROLL_ZONE_PX - distancePx;
        }

        /**
         * If the pointer is next to the sides of the element to scroll, will trigger scrolling
         * Can be called repeatedly with updated pointer and elementToScroll values without issues
         * @return {boolean} - true if scrolling was needed
         */
        function scrollIfNeeded(pointer, elementToScroll) {
            if (!elementToScroll) {
                return false;
            }
            const distances = calcInnerDistancesBetweenPointAndSidesOfElement(pointer, elementToScroll);
            if (distances === null) {
                resetScrolling();
                return false;
            }
            const isAlreadyScrolling = !!scrollingInfo.directionObj;
            let [scrollingVertically, scrollingHorizontally] = [false, false];
            // vertical
            if (elementToScroll.scrollHeight > elementToScroll.clientHeight) {
                if (distances.bottom < SCROLL_ZONE_PX) {
                    scrollingVertically = true;
                    scrollingInfo.directionObj = {x: 0, y: 1};
                    scrollingInfo.stepPx = calcScrollStepPx(distances.bottom);
                } else if (distances.top < SCROLL_ZONE_PX) {
                    scrollingVertically = true;
                    scrollingInfo.directionObj = {x: 0, y: -1};
                    scrollingInfo.stepPx = calcScrollStepPx(distances.top);
                }
                if (!isAlreadyScrolling && scrollingVertically) {
                    scrollContainer(elementToScroll);
                    return true;
                }
            }
            // horizontal
            if (elementToScroll.scrollWidth > elementToScroll.clientWidth) {
                if (distances.right < SCROLL_ZONE_PX) {
                    scrollingHorizontally = true;
                    scrollingInfo.directionObj = {x: 1, y: 0};
                    scrollingInfo.stepPx = calcScrollStepPx(distances.right);
                } else if (distances.left < SCROLL_ZONE_PX) {
                    scrollingHorizontally = true;
                    scrollingInfo.directionObj = {x: -1, y: 0};
                    scrollingInfo.stepPx = calcScrollStepPx(distances.left);
                }
                if (!isAlreadyScrolling && scrollingHorizontally) {
                    scrollContainer(elementToScroll);
                    return true;
                }
            }
            resetScrolling();
            return false;
        }

        return {
            scrollIfNeeded,
            resetScrolling
        };
    }

    /**
     * @param {Object} object
     * @return {string}
     */
    function toString(object) {
        return JSON.stringify(object, null, 2);
    }

    /**
     * Finds the depth of the given node in the DOM tree
     * @param {HTMLElement} node
     * @return {number} - the depth of the node
     */
    function getDepth(node) {
        if (!node) {
            throw new Error("cannot get depth of a falsy node");
        }
        return _getDepth(node, 0);
    }
    function _getDepth(node, countSoFar = 0) {
        if (!node.parentElement) {
            return countSoFar - 1;
        }
        return _getDepth(node.parentElement, countSoFar + 1);
    }

    /**
     * A simple util to shallow compare objects quickly, it doesn't validate the arguments so pass objects in
     * @param {Object} objA
     * @param {Object} objB
     * @return {boolean} - true if objA and objB are shallow equal
     */
    function areObjectsShallowEqual(objA, objB) {
        if (Object.keys(objA).length !== Object.keys(objB).length) {
            return false;
        }
        for (const keyA in objA) {
            if (!{}.hasOwnProperty.call(objB, keyA) || objB[keyA] !== objA[keyA]) {
                return false;
            }
        }
        return true;
    }

    /**
     * Shallow compares two arrays
     * @param arrA
     * @param arrB
     * @return {boolean} - whether the arrays are shallow equal
     */
    function areArraysShallowEqualSameOrder(arrA, arrB) {
        if (arrA.length !== arrB.length) {
            return false;
        }
        for (let i = 0; i < arrA.length; i++) {
            if (arrA[i] !== arrB[i]) {
                return false;
            }
        }
        return true;
    }

    const INTERVAL_MS$1 = 200;
    const TOLERANCE_PX = 10;
    const {scrollIfNeeded: scrollIfNeeded$1, resetScrolling: resetScrolling$1} = makeScroller();
    let next$1;

    /**
     * Tracks the dragged elements and performs the side effects when it is dragged over a drop zone (basically dispatching custom-events scrolling)
     * @param {Set<HTMLElement>} dropZones
     * @param {HTMLElement} draggedEl
     * @param {number} [intervalMs = INTERVAL_MS]
     */
    function observe(draggedEl, dropZones, intervalMs = INTERVAL_MS$1) {
        // initialization
        let lastDropZoneFound;
        let lastIndexFound;
        let lastIsDraggedInADropZone = false;
        let lastCentrePositionOfDragged;
        // We are sorting to make sure that in case of nested zones of the same type the one "on top" is considered first
        const dropZonesFromDeepToShallow = Array.from(dropZones).sort((dz1, dz2) => getDepth(dz2) - getDepth(dz1));

        /**
         * The main function in this module. Tracks where everything is/ should be a take the actions
         */
        function andNow() {
            const currentCenterOfDragged = findCenterOfElement(draggedEl);
            const scrolled = scrollIfNeeded$1(currentCenterOfDragged, lastDropZoneFound);
            // we only want to make a new decision after the element was moved a bit to prevent flickering
            if (
                !scrolled &&
                lastCentrePositionOfDragged &&
                Math.abs(lastCentrePositionOfDragged.x - currentCenterOfDragged.x) < TOLERANCE_PX &&
                Math.abs(lastCentrePositionOfDragged.y - currentCenterOfDragged.y) < TOLERANCE_PX
            ) {
                next$1 = window.setTimeout(andNow, intervalMs);
                return;
            }
            if (isElementOffDocument(draggedEl)) {
                dispatchDraggedLeftDocument(draggedEl);
                return;
            }

            lastCentrePositionOfDragged = currentCenterOfDragged;
            // this is a simple algorithm, potential improvement: first look at lastDropZoneFound
            let isDraggedInADropZone = false;
            for (const dz of dropZonesFromDeepToShallow) {
                if (scrolled) resetIndexesCacheForDz(lastDropZoneFound);
                const indexObj = findWouldBeIndex(draggedEl, dz);
                if (indexObj === null) {
                    // it is not inside
                    continue;
                }
                const {index} = indexObj;
                isDraggedInADropZone = true;
                // the element is over a container
                if (dz !== lastDropZoneFound) {
                    lastDropZoneFound && dispatchDraggedElementLeftContainerForAnother(lastDropZoneFound, draggedEl, dz);
                    dispatchDraggedElementEnteredContainer(dz, indexObj, draggedEl);
                    lastDropZoneFound = dz;
                } else if (index !== lastIndexFound) {
                    dispatchDraggedElementIsOverIndex(dz, indexObj, draggedEl);
                    lastIndexFound = index;
                }
                // we handle looping with the 'continue' statement above
                break;
            }
            // the first time the dragged element is not in any dropzone we need to notify the last dropzone it was in
            if (!isDraggedInADropZone && lastIsDraggedInADropZone && lastDropZoneFound) {
                dispatchDraggedElementLeftContainerForNone(lastDropZoneFound, draggedEl);
                lastDropZoneFound = undefined;
                lastIndexFound = undefined;
                lastIsDraggedInADropZone = false;
            } else {
                lastIsDraggedInADropZone = true;
            }
            next$1 = window.setTimeout(andNow, intervalMs);
        }
        andNow();
    }

    // assumption - we can only observe one dragged element at a time, this could be changed in the future
    function unobserve() {
        clearTimeout(next$1);
        resetScrolling$1();
        resetIndexesCache();
    }

    const INTERVAL_MS = 300;
    let mousePosition;

    /**
     * Do not use this! it is visible for testing only until we get over the issue Cypress not triggering the mousemove listeners
     * // TODO - make private (remove export)
     * @param {{clientX: number, clientY: number}} e
     */
    function updateMousePosition(e) {
        const c = e.touches ? e.touches[0] : e;
        mousePosition = {x: c.clientX, y: c.clientY};
    }
    const {scrollIfNeeded, resetScrolling} = makeScroller();
    let next;

    function loop() {
        if (mousePosition) {
            const scrolled = scrollIfNeeded(mousePosition, document.documentElement);
            if (scrolled) resetIndexesCache();
        }
        next = window.setTimeout(loop, INTERVAL_MS);
    }

    /**
     * will start watching the mouse pointer and scroll the window if it goes next to the edges
     */
    function armWindowScroller() {
        window.addEventListener("mousemove", updateMousePosition);
        window.addEventListener("touchmove", updateMousePosition);
        loop();
    }

    /**
     * will stop watching the mouse pointer and won't scroll the window anymore
     */
    function disarmWindowScroller() {
        window.removeEventListener("mousemove", updateMousePosition);
        window.removeEventListener("touchmove", updateMousePosition);
        mousePosition = undefined;
        window.clearTimeout(next);
        resetScrolling();
    }

    /**
     * Fixes svelte issue when cloning node containing (or being) <select> which will loose it's value.
     * Since svelte manages select value internally.
     * @see https://github.com/sveltejs/svelte/issues/6717
     * @see https://github.com/isaacHagoel/svelte-dnd-action/issues/306
     *
     * @param {HTMLElement} el
     * @returns
     */
    function svelteNodeClone(el) {
        const cloned = el.cloneNode(true);

        const values = [];
        const elIsSelect = el.tagName === "SELECT";
        const selects = elIsSelect ? [el] : [...el.querySelectorAll("select")];
        for (const select of selects) {
            values.push(select.value);
        }

        if (selects.length <= 0) {
            return cloned;
        }

        const clonedSelects = elIsSelect ? [cloned] : [...cloned.querySelectorAll("select")];
        for (let i = 0; i < clonedSelects.length; i++) {
            const select = clonedSelects[i];
            const value = values[i];
            const optionEl = select.querySelector(`option[value="${value}"`);
            if (optionEl) {
                optionEl.setAttribute("selected", true);
            }
        }

        return cloned;
    }

    /**
     * @type {{USE_COMPUTED_STYLE_INSTEAD_OF_BOUNDING_RECT: string}}
     */
    const FEATURE_FLAG_NAMES = Object.freeze({
        // This flag exists as a workaround for issue 454 (basically a browser bug) - seems like these rect values take time to update when in grid layout. Setting it to true can cause strange behaviour in the REPL for non-grid zones, see issue 470
        USE_COMPUTED_STYLE_INSTEAD_OF_BOUNDING_RECT: "USE_COMPUTED_STYLE_INSTEAD_OF_BOUNDING_RECT"
    });

    const featureFlagsMap = {
        [FEATURE_FLAG_NAMES.USE_COMPUTED_STYLE_INSTEAD_OF_BOUNDING_RECT]: false
    };

    /**
     *
     * @param {FEATURE_FLAG_NAMES} flagName
     * @return {boolean}
     */
    function getFeatureFlag(flagName) {
        if (!FEATURE_FLAG_NAMES[flagName])
            throw new Error(`Can't get non existing feature flag ${flagName}! Supported flags: ${Object.keys(FEATURE_FLAG_NAMES)}`);
        return featureFlagsMap[flagName];
    }

    const TRANSITION_DURATION_SECONDS = 0.2;

    /**
     * private helper function - creates a transition string for a property
     * @param {string} property
     * @return {string} - the transition string
     */
    function trs(property) {
        return `${property} ${TRANSITION_DURATION_SECONDS}s ease`;
    }
    /**
     * clones the given element and applies proper styles and transitions to the dragged element
     * @param {HTMLElement} originalElement
     * @param {Point} [positionCenterOnXY]
     * @return {Node} - the cloned, styled element
     */
    function createDraggedElementFrom(originalElement, positionCenterOnXY) {
        const rect = originalElement.getBoundingClientRect();
        const draggedEl = svelteNodeClone(originalElement);
        copyStylesFromTo(originalElement, draggedEl);
        draggedEl.id = DRAGGED_ELEMENT_ID;
        draggedEl.style.position = "fixed";
        let elTopPx = rect.top;
        let elLeftPx = rect.left;
        draggedEl.style.top = `${elTopPx}px`;
        draggedEl.style.left = `${elLeftPx}px`;
        if (positionCenterOnXY) {
            const center = findCenter(rect);
            elTopPx -= center.y - positionCenterOnXY.y;
            elLeftPx -= center.x - positionCenterOnXY.x;
            window.setTimeout(() => {
                draggedEl.style.top = `${elTopPx}px`;
                draggedEl.style.left = `${elLeftPx}px`;
            }, 0);
        }
        draggedEl.style.margin = "0";
        // we can't have relative or automatic height and width or it will break the illusion
        draggedEl.style.boxSizing = "border-box";
        draggedEl.style.height = `${rect.height}px`;
        draggedEl.style.width = `${rect.width}px`;
        draggedEl.style.transition = `${trs("top")}, ${trs("left")}, ${trs("background-color")}, ${trs("opacity")}, ${trs("color")} `;
        // this is a workaround for a strange browser bug that causes the right border to disappear when all the transitions are added at the same time
        window.setTimeout(() => (draggedEl.style.transition += `, ${trs("width")}, ${trs("height")}`), 0);
        draggedEl.style.zIndex = "9999";
        draggedEl.style.cursor = "grabbing";

        return draggedEl;
    }

    /**
     * styles the dragged element to a 'dropped' state
     * @param {HTMLElement} draggedEl
     */
    function moveDraggedElementToWasDroppedState(draggedEl) {
        draggedEl.style.cursor = "grab";
    }

    /**
     * Morphs the dragged element style, maintains the mouse pointer within the element
     * @param {HTMLElement} draggedEl
     * @param {HTMLElement} copyFromEl - the element the dragged element should look like, typically the shadow element
     * @param {number} currentMouseX
     * @param {number} currentMouseY
     */
    function morphDraggedElementToBeLike(draggedEl, copyFromEl, currentMouseX, currentMouseY) {
        copyStylesFromTo(copyFromEl, draggedEl);
        const newRect = copyFromEl.getBoundingClientRect();
        const draggedElRect = draggedEl.getBoundingClientRect();
        const widthChange = newRect.width - draggedElRect.width;
        const heightChange = newRect.height - draggedElRect.height;
        if (widthChange || heightChange) {
            const relativeDistanceOfMousePointerFromDraggedSides = {
                left: (currentMouseX - draggedElRect.left) / draggedElRect.width,
                top: (currentMouseY - draggedElRect.top) / draggedElRect.height
            };
            if (!getFeatureFlag(FEATURE_FLAG_NAMES.USE_COMPUTED_STYLE_INSTEAD_OF_BOUNDING_RECT)) {
                draggedEl.style.height = `${newRect.height}px`;
                draggedEl.style.width = `${newRect.width}px`;
            }
            draggedEl.style.left = `${parseFloat(draggedEl.style.left) - relativeDistanceOfMousePointerFromDraggedSides.left * widthChange}px`;
            draggedEl.style.top = `${parseFloat(draggedEl.style.top) - relativeDistanceOfMousePointerFromDraggedSides.top * heightChange}px`;
        }
    }

    /**
     * @param {HTMLElement} copyFromEl
     * @param {HTMLElement} copyToEl
     */
    function copyStylesFromTo(copyFromEl, copyToEl) {
        const computedStyle = window.getComputedStyle(copyFromEl);
        Array.from(computedStyle)
            .filter(
                s =>
                    s.startsWith("background") ||
                    s.startsWith("padding") ||
                    s.startsWith("font") ||
                    s.startsWith("text") ||
                    s.startsWith("align") ||
                    s.startsWith("justify") ||
                    s.startsWith("display") ||
                    s.startsWith("flex") ||
                    s.startsWith("border") ||
                    s === "opacity" ||
                    s === "color" ||
                    s === "list-style-type" ||
                    // copying with and height to make up for rect update timing issues in some browsers
                    (getFeatureFlag(FEATURE_FLAG_NAMES.USE_COMPUTED_STYLE_INSTEAD_OF_BOUNDING_RECT) && (s === "width" || s === "height"))
            )
            .forEach(s => copyToEl.style.setProperty(s, computedStyle.getPropertyValue(s), computedStyle.getPropertyPriority(s)));
    }

    /**
     * makes the element compatible with being draggable
     * @param {HTMLElement} draggableEl
     * @param {boolean} dragDisabled
     */
    function styleDraggable(draggableEl, dragDisabled) {
        draggableEl.draggable = false;
        draggableEl.ondragstart = () => false;
        if (!dragDisabled) {
            draggableEl.style.userSelect = "none";
            draggableEl.style.WebkitUserSelect = "none";
            draggableEl.style.cursor = "grab";
        } else {
            draggableEl.style.userSelect = "";
            draggableEl.style.WebkitUserSelect = "";
            draggableEl.style.cursor = "";
        }
    }

    /**
     * Hides the provided element so that it can stay in the dom without interrupting
     * @param {HTMLElement} dragTarget
     */
    function hideElement(dragTarget) {
        dragTarget.style.display = "none";
        dragTarget.style.position = "fixed";
        dragTarget.style.zIndex = "-5";
    }

    /**
     * styles the shadow element
     * @param {HTMLElement} shadowEl
     */
    function decorateShadowEl(shadowEl) {
        shadowEl.style.visibility = "hidden";
        shadowEl.setAttribute(SHADOW_ELEMENT_ATTRIBUTE_NAME, "true");
    }

    /**
     * undo the styles the shadow element
     * @param {HTMLElement} shadowEl
     */
    function unDecorateShadowElement(shadowEl) {
        shadowEl.style.visibility = "";
        shadowEl.removeAttribute(SHADOW_ELEMENT_ATTRIBUTE_NAME);
    }

    /**
     * will mark the given dropzones as visually active
     * @param {Array<HTMLElement>} dropZones
     * @param {Function} getStyles - maps a dropzone to a styles object (so the styles can be removed)
     * @param {Function} getClasses - maps a dropzone to a classList
     */
    function styleActiveDropZones(dropZones, getStyles = () => {}, getClasses = () => []) {
        dropZones.forEach(dz => {
            const styles = getStyles(dz);
            Object.keys(styles).forEach(style => {
                dz.style[style] = styles[style];
            });
            getClasses(dz).forEach(c => dz.classList.add(c));
        });
    }

    /**
     * will remove the 'active' styling from given dropzones
     * @param {Array<HTMLElement>} dropZones
     * @param {Function} getStyles - maps a dropzone to a styles object
     * @param {Function} getClasses - maps a dropzone to a classList
     */
    function styleInactiveDropZones(dropZones, getStyles = () => {}, getClasses = () => []) {
        dropZones.forEach(dz => {
            const styles = getStyles(dz);
            Object.keys(styles).forEach(style => {
                dz.style[style] = "";
            });
            getClasses(dz).forEach(c => dz.classList.contains(c) && dz.classList.remove(c));
        });
    }

    /**
     * will prevent the provided element from shrinking by setting its minWidth and minHeight to the current width and height values
     * @param {HTMLElement} el
     * @return {function(): void} - run this function to undo the operation and restore the original values
     */
    function preventShrinking(el) {
        const originalMinHeight = el.style.minHeight;
        el.style.minHeight = window.getComputedStyle(el).getPropertyValue("height");
        const originalMinWidth = el.style.minWidth;
        el.style.minWidth = window.getComputedStyle(el).getPropertyValue("width");
        return function undo() {
            el.style.minHeight = originalMinHeight;
            el.style.minWidth = originalMinWidth;
        };
    }

    const DEFAULT_DROP_ZONE_TYPE$1 = "--any--";
    const MIN_OBSERVATION_INTERVAL_MS = 100;
    const DISABLED_OBSERVATION_INTERVAL_MS = 20;
    const MIN_MOVEMENT_BEFORE_DRAG_START_PX = 3;
    const DEFAULT_DROP_TARGET_STYLE$1 = {
        outline: "rgba(255, 255, 102, 0.7) solid 2px"
    };
    const ORIGINAL_DRAGGED_ITEM_MARKER_ATTRIBUTE = "data-is-dnd-original-dragged-item";

    let originalDragTarget;
    let draggedEl;
    let draggedElData;
    let draggedElType;
    let originDropZone;
    let originIndex;
    let shadowElData;
    let shadowElDropZone;
    let dragStartMousePosition;
    let currentMousePosition;
    let isWorkingOnPreviousDrag = false;
    let finalizingPreviousDrag = false;
    let unlockOriginDzMinDimensions;
    let isDraggedOutsideOfAnyDz = false;
    let scheduledForRemovalAfterDrop = [];

    // a map from type to a set of drop-zones
    const typeToDropZones$1 = new Map();
    // important - this is needed because otherwise the config that would be used for everyone is the config of the element that created the event listeners
    const dzToConfig$1 = new Map();
    // this is needed in order to be able to cleanup old listeners and avoid stale closures issues (as the listener is defined within each zone)
    const elToMouseDownListener = new WeakMap();

    /* drop-zones registration management */
    function registerDropZone$1(dropZoneEl, type) {
        if (!typeToDropZones$1.has(type)) {
            typeToDropZones$1.set(type, new Set());
        }
        if (!typeToDropZones$1.get(type).has(dropZoneEl)) {
            typeToDropZones$1.get(type).add(dropZoneEl);
            incrementActiveDropZoneCount();
        }
    }
    function unregisterDropZone$1(dropZoneEl, type) {
        typeToDropZones$1.get(type).delete(dropZoneEl);
        decrementActiveDropZoneCount();
        if (typeToDropZones$1.get(type).size === 0) {
            typeToDropZones$1.delete(type);
        }
    }

    /* functions to manage observing the dragged element and trigger custom drag-events */
    function watchDraggedElement() {
        armWindowScroller();
        const dropZones = typeToDropZones$1.get(draggedElType);
        for (const dz of dropZones) {
            dz.addEventListener(DRAGGED_ENTERED_EVENT_NAME, handleDraggedEntered);
            dz.addEventListener(DRAGGED_LEFT_EVENT_NAME, handleDraggedLeft);
            dz.addEventListener(DRAGGED_OVER_INDEX_EVENT_NAME, handleDraggedIsOverIndex);
        }
        window.addEventListener(DRAGGED_LEFT_DOCUMENT_EVENT_NAME, handleDrop$1);
        // it is important that we don't have an interval that is faster than the flip duration because it can cause elements to jump bach and forth
        const setIntervalMs = Math.max(...Array.from(dropZones.keys()).map(dz => dzToConfig$1.get(dz).dropAnimationDurationMs));
        const observationIntervalMs = setIntervalMs === 0 ? DISABLED_OBSERVATION_INTERVAL_MS : Math.max(setIntervalMs, MIN_OBSERVATION_INTERVAL_MS); //if setintervalms is 0 it goes to 20, otherwise it is max between it and min observation.
        observe(draggedEl, dropZones, observationIntervalMs * 1.07);
    }
    function unWatchDraggedElement() {
        disarmWindowScroller();
        const dropZones = typeToDropZones$1.get(draggedElType);
        for (const dz of dropZones) {
            dz.removeEventListener(DRAGGED_ENTERED_EVENT_NAME, handleDraggedEntered);
            dz.removeEventListener(DRAGGED_LEFT_EVENT_NAME, handleDraggedLeft);
            dz.removeEventListener(DRAGGED_OVER_INDEX_EVENT_NAME, handleDraggedIsOverIndex);
        }
        window.removeEventListener(DRAGGED_LEFT_DOCUMENT_EVENT_NAME, handleDrop$1);
        unobserve();
    }

    function findShadowElementIdx(items) {
        return items.findIndex(item => !!item[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
    }

    /* custom drag-events handlers */
    function handleDraggedEntered(e) {
        let {items, dropFromOthersDisabled} = dzToConfig$1.get(e.currentTarget);
        if (dropFromOthersDisabled && e.currentTarget !== originDropZone) {
            return;
        }
        isDraggedOutsideOfAnyDz = false;
        // this deals with another race condition. in rare occasions (super rapid operations) the list hasn't updated yet
        items = items.filter(item => item[ITEM_ID_KEY] !== shadowElData[ITEM_ID_KEY]);

        if (originDropZone !== e.currentTarget) {
            const originZoneItems = dzToConfig$1.get(originDropZone).items;
            const newOriginZoneItems = originZoneItems.filter(item => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
            dispatchConsiderEvent(originDropZone, newOriginZoneItems, {
                trigger: TRIGGERS.DRAGGED_ENTERED_ANOTHER,
                id: draggedElData[ITEM_ID_KEY],
                source: SOURCES.POINTER
            });
        }
        const {index, isProximityBased} = e.detail.indexObj;
        const shadowElIdx = isProximityBased && index === e.currentTarget.children.length - 1 ? index + 1 : index;
        shadowElDropZone = e.currentTarget;
        items.splice(shadowElIdx, 0, shadowElData);
        dispatchConsiderEvent(e.currentTarget, items, {trigger: TRIGGERS.DRAGGED_ENTERED, id: draggedElData[ITEM_ID_KEY], source: SOURCES.POINTER});
    }

    function handleDraggedLeft(e) {
        // dealing with a rare race condition on extremely rapid clicking and dropping
        if (!isWorkingOnPreviousDrag) return;
        const {items, dropFromOthersDisabled} = dzToConfig$1.get(e.currentTarget);
        if (dropFromOthersDisabled && e.currentTarget !== originDropZone && e.currentTarget !== shadowElDropZone) {
            return;
        }
        const shadowElIdx = findShadowElementIdx(items);
        const shadowItem = items.splice(shadowElIdx, 1)[0];
        shadowElDropZone = undefined;
        const {type, theOtherDz} = e.detail;
        if (
            type === DRAGGED_LEFT_TYPES.OUTSIDE_OF_ANY ||
            (type === DRAGGED_LEFT_TYPES.LEFT_FOR_ANOTHER && theOtherDz !== originDropZone && dzToConfig$1.get(theOtherDz).dropFromOthersDisabled)
        ) {
            isDraggedOutsideOfAnyDz = true;
            shadowElDropZone = originDropZone;
            const originZoneItems = dzToConfig$1.get(originDropZone).items;
            originZoneItems.splice(originIndex, 0, shadowItem);
            dispatchConsiderEvent(originDropZone, originZoneItems, {
                trigger: TRIGGERS.DRAGGED_LEFT_ALL,
                id: draggedElData[ITEM_ID_KEY],
                source: SOURCES.POINTER
            });
        }
        // for the origin dz, when the dragged is outside of any, this will be fired in addition to the previous. this is for simplicity
        dispatchConsiderEvent(e.currentTarget, items, {
            trigger: TRIGGERS.DRAGGED_LEFT,
            id: draggedElData[ITEM_ID_KEY],
            source: SOURCES.POINTER
        });
    }
    function handleDraggedIsOverIndex(e) {
        const {items, dropFromOthersDisabled} = dzToConfig$1.get(e.currentTarget);
        if (dropFromOthersDisabled && e.currentTarget !== originDropZone) {
            return;
        }
        isDraggedOutsideOfAnyDz = false;
        const {index} = e.detail.indexObj;
        const shadowElIdx = findShadowElementIdx(items);
        items.splice(shadowElIdx, 1);
        items.splice(index, 0, shadowElData);
        dispatchConsiderEvent(e.currentTarget, items, {trigger: TRIGGERS.DRAGGED_OVER_INDEX, id: draggedElData[ITEM_ID_KEY], source: SOURCES.POINTER});
    }

    // Global mouse/touch-events handlers
    function handleMouseMove(e) {
        e.preventDefault();
        const c = e.touches ? e.touches[0] : e;
        currentMousePosition = {x: c.clientX, y: c.clientY};
        draggedEl.style.transform = `translate3d(${currentMousePosition.x - dragStartMousePosition.x}px, ${
        currentMousePosition.y - dragStartMousePosition.y
    }px, 0)`;
    }

    function handleDrop$1() {
        finalizingPreviousDrag = true;
        // cleanup
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("touchmove", handleMouseMove);
        window.removeEventListener("mouseup", handleDrop$1);
        window.removeEventListener("touchend", handleDrop$1);
        unWatchDraggedElement();
        moveDraggedElementToWasDroppedState(draggedEl);

        if (!shadowElDropZone) {
            shadowElDropZone = originDropZone;
        }
        let {items, type} = dzToConfig$1.get(shadowElDropZone);
        styleInactiveDropZones(
            typeToDropZones$1.get(type),
            dz => dzToConfig$1.get(dz).dropTargetStyle,
            dz => dzToConfig$1.get(dz).dropTargetClasses
        );
        let shadowElIdx = findShadowElementIdx(items);
        // the handler might remove the shadow element, ex: dragula like copy on drag
        if (shadowElIdx === -1) shadowElIdx = originIndex;

        items = items.map(item => (item[SHADOW_ITEM_MARKER_PROPERTY_NAME] ? draggedElData : item));
        function finalizeWithinZone() {
            unlockOriginDzMinDimensions();
            dispatchFinalizeEvent(shadowElDropZone, items, {
                trigger: isDraggedOutsideOfAnyDz ? TRIGGERS.DROPPED_OUTSIDE_OF_ANY : TRIGGERS.DROPPED_INTO_ZONE,
                id: draggedElData[ITEM_ID_KEY],
                source: SOURCES.POINTER
            });
            if (shadowElDropZone !== originDropZone) {
                // letting the origin drop zone know the element was permanently taken away
                dispatchFinalizeEvent(originDropZone, dzToConfig$1.get(originDropZone).items, {
                    trigger: TRIGGERS.DROPPED_INTO_ANOTHER,
                    id: draggedElData[ITEM_ID_KEY],
                    source: SOURCES.POINTER
                });
            }
            unDecorateShadowElement(shadowElDropZone.children[shadowElIdx]);
            cleanupPostDrop();
        }
        animateDraggedToFinalPosition(shadowElIdx, finalizeWithinZone);
    }

    // helper function for handleDrop
    function animateDraggedToFinalPosition(shadowElIdx, callback) {
        const shadowElRect = getBoundingRectNoTransforms(shadowElDropZone.children[shadowElIdx]);
        const newTransform = {
            x: shadowElRect.left - parseFloat(draggedEl.style.left),
            y: shadowElRect.top - parseFloat(draggedEl.style.top)
        };
        const {dropAnimationDurationMs} = dzToConfig$1.get(shadowElDropZone);
        const transition = `transform ${dropAnimationDurationMs}ms ease`;
        draggedEl.style.transition = draggedEl.style.transition ? draggedEl.style.transition + "," + transition : transition;
        draggedEl.style.transform = `translate3d(${newTransform.x}px, ${newTransform.y}px, 0)`;
        window.setTimeout(callback, dropAnimationDurationMs);
    }

    function scheduleDZForRemovalAfterDrop(dz, destroy) {
        scheduledForRemovalAfterDrop.push({dz, destroy});
        window.requestAnimationFrame(() => {
            hideElement(dz);
            document.body.appendChild(dz);
        });
    }
    /* cleanup */
    function cleanupPostDrop() {
        draggedEl.remove();
        originalDragTarget.remove();
        if (scheduledForRemovalAfterDrop.length) {
            scheduledForRemovalAfterDrop.forEach(({dz, destroy}) => {
                destroy();
                dz.remove();
            });
            scheduledForRemovalAfterDrop = [];
        }
        draggedEl = undefined;
        originalDragTarget = undefined;
        draggedElData = undefined;
        draggedElType = undefined;
        originDropZone = undefined;
        originIndex = undefined;
        shadowElData = undefined;
        shadowElDropZone = undefined;
        dragStartMousePosition = undefined;
        currentMousePosition = undefined;
        isWorkingOnPreviousDrag = false;
        finalizingPreviousDrag = false;
        unlockOriginDzMinDimensions = undefined;
        isDraggedOutsideOfAnyDz = false;
    }

    function dndzone$2(node, options) {
        let initialized = false;
        const config = {
            items: undefined,
            type: undefined,
            flipDurationMs: 0,
            dragDisabled: false,
            morphDisabled: false,
            dropFromOthersDisabled: false,
            dropTargetStyle: DEFAULT_DROP_TARGET_STYLE$1,
            dropTargetClasses: [],
            transformDraggedElement: () => {},
            centreDraggedOnCursor: false
        };
        let elToIdx = new Map();

        function addMaybeListeners() {
            window.addEventListener("mousemove", handleMouseMoveMaybeDragStart, {passive: false});
            window.addEventListener("touchmove", handleMouseMoveMaybeDragStart, {passive: false, capture: false});
            window.addEventListener("mouseup", handleFalseAlarm, {passive: false});
            window.addEventListener("touchend", handleFalseAlarm, {passive: false});
        }
        function removeMaybeListeners() {
            window.removeEventListener("mousemove", handleMouseMoveMaybeDragStart);
            window.removeEventListener("touchmove", handleMouseMoveMaybeDragStart);
            window.removeEventListener("mouseup", handleFalseAlarm);
            window.removeEventListener("touchend", handleFalseAlarm);
        }
        function handleFalseAlarm() {
            removeMaybeListeners();
            originalDragTarget = undefined;
            dragStartMousePosition = undefined;
            currentMousePosition = undefined;
        }

        function handleMouseMoveMaybeDragStart(e) {
            e.preventDefault();
            const c = e.touches ? e.touches[0] : e;
            currentMousePosition = {x: c.clientX, y: c.clientY};
            if (
                Math.abs(currentMousePosition.x - dragStartMousePosition.x) >= MIN_MOVEMENT_BEFORE_DRAG_START_PX ||
                Math.abs(currentMousePosition.y - dragStartMousePosition.y) >= MIN_MOVEMENT_BEFORE_DRAG_START_PX
            ) {
                removeMaybeListeners();
                handleDragStart();
            }
        }
        function handleMouseDown(e) {
            // on safari clicking on a select element doesn't fire mouseup at the end of the click and in general this makes more sense
            if (e.target !== e.currentTarget && (e.target.value !== undefined || e.target.isContentEditable)) {
                return;
            }
            // prevents responding to any button but left click which equals 0 (which is falsy)
            if (e.button) {
                return;
            }
            if (isWorkingOnPreviousDrag) {
                return;
            }
            e.stopPropagation();
            const c = e.touches ? e.touches[0] : e;
            dragStartMousePosition = {x: c.clientX, y: c.clientY};
            currentMousePosition = {...dragStartMousePosition};
            originalDragTarget = e.currentTarget;
            addMaybeListeners();
        }

        function handleDragStart() {
            isWorkingOnPreviousDrag = true;

            // initialising globals
            const currentIdx = elToIdx.get(originalDragTarget);
            originIndex = currentIdx;
            originDropZone = originalDragTarget.parentElement;
            /** @type {ShadowRoot | HTMLDocument} */
            const rootNode = originDropZone.getRootNode();
            const originDropZoneRoot = rootNode.body || rootNode;
            const {items, type, centreDraggedOnCursor} = config;
            draggedElData = {...items[currentIdx]};
            draggedElType = type;
            shadowElData = {...draggedElData, [SHADOW_ITEM_MARKER_PROPERTY_NAME]: true, [ITEM_ID_KEY]: SHADOW_PLACEHOLDER_ITEM_ID};

            // creating the draggable element
            draggedEl = createDraggedElementFrom(originalDragTarget, centreDraggedOnCursor && currentMousePosition);
            originalDragTarget.setAttribute(ORIGINAL_DRAGGED_ITEM_MARKER_ATTRIBUTE, true);

            // We will keep the original dom node in the dom because touch events keep firing on it, we want to re-add it after the framework removes it
            function keepOriginalElementInDom() {
                if (!draggedEl.parentElement) {
                    originDropZoneRoot.appendChild(draggedEl);
                    // to prevent the outline from disappearing
                    draggedEl.focus();
                    watchDraggedElement();
                    hideElement(originalDragTarget);
                    originDropZoneRoot.appendChild(originalDragTarget);
                } else {
                    window.requestAnimationFrame(keepOriginalElementInDom);
                }
            }
            window.requestAnimationFrame(keepOriginalElementInDom);

            styleActiveDropZones(
                Array.from(typeToDropZones$1.get(config.type)).filter(dz => dz === originDropZone || !dzToConfig$1.get(dz).dropFromOthersDisabled),
                dz => dzToConfig$1.get(dz).dropTargetStyle,
                dz => dzToConfig$1.get(dz).dropTargetClasses
            );

            // removing the original element by removing its data entry
            items.splice(currentIdx, 1, shadowElData);
            unlockOriginDzMinDimensions = preventShrinking(originDropZone);

            dispatchConsiderEvent(originDropZone, items, {trigger: TRIGGERS.DRAG_STARTED, id: draggedElData[ITEM_ID_KEY], source: SOURCES.POINTER});

            // handing over to global handlers - starting to watch the element
            window.addEventListener("mousemove", handleMouseMove, {passive: false});
            window.addEventListener("touchmove", handleMouseMove, {passive: false, capture: false});
            window.addEventListener("mouseup", handleDrop$1, {passive: false});
            window.addEventListener("touchend", handleDrop$1, {passive: false});
        }

        function configure({
            items = undefined,
            flipDurationMs: dropAnimationDurationMs = 0,
            type: newType = DEFAULT_DROP_ZONE_TYPE$1,
            dragDisabled = false,
            morphDisabled = false,
            dropFromOthersDisabled = false,
            dropTargetStyle = DEFAULT_DROP_TARGET_STYLE$1,
            dropTargetClasses = [],
            transformDraggedElement = () => {},
            centreDraggedOnCursor = false
        }) {
            config.dropAnimationDurationMs = dropAnimationDurationMs;
            if (config.type && newType !== config.type) {
                unregisterDropZone$1(node, config.type);
            }
            config.type = newType;
            config.items = [...items];
            config.dragDisabled = dragDisabled;
            config.morphDisabled = morphDisabled;
            config.transformDraggedElement = transformDraggedElement;
            config.centreDraggedOnCursor = centreDraggedOnCursor;

            // realtime update for dropTargetStyle
            if (
                initialized &&
                isWorkingOnPreviousDrag &&
                !finalizingPreviousDrag &&
                (!areObjectsShallowEqual(dropTargetStyle, config.dropTargetStyle) ||
                    !areArraysShallowEqualSameOrder(dropTargetClasses, config.dropTargetClasses))
            ) {
                styleInactiveDropZones(
                    [node],
                    () => config.dropTargetStyle,
                    () => dropTargetClasses
                );
                styleActiveDropZones(
                    [node],
                    () => dropTargetStyle,
                    () => dropTargetClasses
                );
            }
            config.dropTargetStyle = dropTargetStyle;
            config.dropTargetClasses = [...dropTargetClasses];

            // realtime update for dropFromOthersDisabled
            function getConfigProp(dz, propName) {
                return dzToConfig$1.get(dz) ? dzToConfig$1.get(dz)[propName] : config[propName];
            }
            if (initialized && isWorkingOnPreviousDrag && config.dropFromOthersDisabled !== dropFromOthersDisabled) {
                if (dropFromOthersDisabled) {
                    styleInactiveDropZones(
                        [node],
                        dz => getConfigProp(dz, "dropTargetStyle"),
                        dz => getConfigProp(dz, "dropTargetClasses")
                    );
                } else {
                    styleActiveDropZones(
                        [node],
                        dz => getConfigProp(dz, "dropTargetStyle"),
                        dz => getConfigProp(dz, "dropTargetClasses")
                    );
                }
            }
            config.dropFromOthersDisabled = dropFromOthersDisabled;

            dzToConfig$1.set(node, config);
            registerDropZone$1(node, newType);
            const shadowElIdx = findShadowElementIdx(config.items);
            for (let idx = 0; idx < node.children.length; idx++) {
                const draggableEl = node.children[idx];
                styleDraggable(draggableEl, dragDisabled);
                if (idx === shadowElIdx) {
                    config.transformDraggedElement(draggedEl, draggedElData, idx);
                    if (!morphDisabled) {
                        morphDraggedElementToBeLike(draggedEl, draggableEl, currentMousePosition.x, currentMousePosition.y);
                    }
                    decorateShadowEl(draggableEl);
                    continue;
                }
                draggableEl.removeEventListener("mousedown", elToMouseDownListener.get(draggableEl));
                draggableEl.removeEventListener("touchstart", elToMouseDownListener.get(draggableEl));
                if (!dragDisabled) {
                    draggableEl.addEventListener("mousedown", handleMouseDown);
                    draggableEl.addEventListener("touchstart", handleMouseDown);
                    elToMouseDownListener.set(draggableEl, handleMouseDown);
                }
                // updating the idx
                elToIdx.set(draggableEl, idx);

                if (!initialized) {
                    initialized = true;
                }
            }
        }
        configure(options);

        return {
            update: newOptions => {
                configure(newOptions);
            },
            destroy: () => {
                function destroyDz() {
                    unregisterDropZone$1(node, dzToConfig$1.get(node).type);
                    dzToConfig$1.delete(node);
                }
                if (isWorkingOnPreviousDrag && !node.closest(`[${ORIGINAL_DRAGGED_ITEM_MARKER_ATTRIBUTE}]`)) {
                    scheduleDZForRemovalAfterDrop(node, destroyDz);
                } else {
                    destroyDz();
                }
            }
        };
    }

    const INSTRUCTION_IDs$1 = {
        DND_ZONE_ACTIVE: "dnd-zone-active",
        DND_ZONE_DRAG_DISABLED: "dnd-zone-drag-disabled"
    };
    const ID_TO_INSTRUCTION = {
        [INSTRUCTION_IDs$1.DND_ZONE_ACTIVE]: "Tab to one the items and press space-bar or enter to start dragging it",
        [INSTRUCTION_IDs$1.DND_ZONE_DRAG_DISABLED]: "This is a disabled drag and drop list"
    };

    const ALERT_DIV_ID = "dnd-action-aria-alert";
    let alertsDiv;

    function initAriaOnBrowser() {
        if (alertsDiv) {
            // it is already initialized
            return;
        }
        // setting the dynamic alerts
        alertsDiv = document.createElement("div");
        (function initAlertsDiv() {
            alertsDiv.id = ALERT_DIV_ID;
            // tab index -1 makes the alert be read twice on chrome for some reason
            //alertsDiv.tabIndex = -1;
            alertsDiv.style.position = "fixed";
            alertsDiv.style.bottom = "0";
            alertsDiv.style.left = "0";
            alertsDiv.style.zIndex = "-5";
            alertsDiv.style.opacity = "0";
            alertsDiv.style.height = "0";
            alertsDiv.style.width = "0";
            alertsDiv.setAttribute("role", "alert");
        })();
        document.body.prepend(alertsDiv);

        // setting the instructions
        Object.entries(ID_TO_INSTRUCTION).forEach(([id, txt]) => document.body.prepend(instructionToHiddenDiv(id, txt)));
    }

    /**
     * Initializes the static aria instructions so they can be attached to zones
     * @return {{DND_ZONE_ACTIVE: string, DND_ZONE_DRAG_DISABLED: string} | null} - the IDs for static aria instruction (to be used via aria-describedby) or null on the server
     */
    function initAria() {
        if (isOnServer) return null;
        if (document.readyState === "complete") {
            initAriaOnBrowser();
        } else {
            window.addEventListener("DOMContentLoaded", initAriaOnBrowser);
        }
        return {...INSTRUCTION_IDs$1};
    }

    /**
     * Removes all the artifacts (dom elements) added by this module
     */
    function destroyAria() {
        if (isOnServer || !alertsDiv) return;
        Object.keys(ID_TO_INSTRUCTION).forEach(id => document.getElementById(id)?.remove());
        alertsDiv.remove();
        alertsDiv = undefined;
    }

    function instructionToHiddenDiv(id, txt) {
        const div = document.createElement("div");
        div.id = id;
        div.innerHTML = `<p>${txt}</p>`;
        div.style.display = "none";
        div.style.position = "fixed";
        div.style.zIndex = "-5";
        return div;
    }

    /**
     * Will make the screen reader alert the provided text to the user
     * @param {string} txt
     */
    function alertToScreenReader(txt) {
        if (isOnServer) return;
        if (!alertsDiv) {
            initAriaOnBrowser();
        }
        alertsDiv.innerHTML = "";
        const alertText = document.createTextNode(txt);
        alertsDiv.appendChild(alertText);
        // this is needed for Safari
        alertsDiv.style.display = "none";
        alertsDiv.style.display = "inline";
    }

    const DEFAULT_DROP_ZONE_TYPE = "--any--";
    const DEFAULT_DROP_TARGET_STYLE = {
        outline: "rgba(255, 255, 102, 0.7) solid 2px"
    };

    let isDragging = false;
    let draggedItemType;
    let focusedDz;
    let focusedDzLabel = "";
    let focusedItem;
    let focusedItemId;
    let focusedItemLabel = "";
    const allDragTargets = new WeakSet();
    const elToKeyDownListeners = new WeakMap();
    const elToFocusListeners = new WeakMap();
    const dzToHandles = new Map();
    const dzToConfig = new Map();
    const typeToDropZones = new Map();

    /* TODO (potentially)
     * what's the deal with the black border of voice-reader not following focus?
     * maybe keep focus on the last dragged item upon drop?
     */

    let INSTRUCTION_IDs;

    /* drop-zones registration management */
    function registerDropZone(dropZoneEl, type) {
        if (typeToDropZones.size === 0) {
            INSTRUCTION_IDs = initAria();
            window.addEventListener("keydown", globalKeyDownHandler);
            window.addEventListener("click", globalClickHandler);
        }
        if (!typeToDropZones.has(type)) {
            typeToDropZones.set(type, new Set());
        }
        if (!typeToDropZones.get(type).has(dropZoneEl)) {
            typeToDropZones.get(type).add(dropZoneEl);
            incrementActiveDropZoneCount();
        }
    }
    function unregisterDropZone(dropZoneEl, type) {
        if (focusedDz === dropZoneEl) {
            handleDrop();
        }
        typeToDropZones.get(type).delete(dropZoneEl);
        decrementActiveDropZoneCount();
        if (typeToDropZones.get(type).size === 0) {
            typeToDropZones.delete(type);
        }
        if (typeToDropZones.size === 0) {
            window.removeEventListener("keydown", globalKeyDownHandler);
            window.removeEventListener("click", globalClickHandler);
            INSTRUCTION_IDs = undefined;
            destroyAria();
        }
    }

    function globalKeyDownHandler(e) {
        if (!isDragging) return;
        switch (e.key) {
            case "Escape": {
                handleDrop();
                break;
            }
        }
    }

    function globalClickHandler() {
        if (!isDragging) return;
        if (!allDragTargets.has(document.activeElement)) {
            handleDrop();
        }
    }

    function handleZoneFocus(e) {
        if (!isDragging) return;
        const newlyFocusedDz = e.currentTarget;
        if (newlyFocusedDz === focusedDz) return;

        focusedDzLabel = newlyFocusedDz.getAttribute("aria-label") || "";
        const {items: originItems} = dzToConfig.get(focusedDz);
        const originItem = originItems.find(item => item[ITEM_ID_KEY] === focusedItemId);
        const originIdx = originItems.indexOf(originItem);
        const itemToMove = originItems.splice(originIdx, 1)[0];
        const {items: targetItems, autoAriaDisabled} = dzToConfig.get(newlyFocusedDz);
        if (
            newlyFocusedDz.getBoundingClientRect().top < focusedDz.getBoundingClientRect().top ||
            newlyFocusedDz.getBoundingClientRect().left < focusedDz.getBoundingClientRect().left
        ) {
            targetItems.push(itemToMove);
            if (!autoAriaDisabled) {
                alertToScreenReader(`Moved item ${focusedItemLabel} to the end of the list ${focusedDzLabel}`);
            }
        } else {
            targetItems.unshift(itemToMove);
            if (!autoAriaDisabled) {
                alertToScreenReader(`Moved item ${focusedItemLabel} to the beginning of the list ${focusedDzLabel}`);
            }
        }
        const dzFrom = focusedDz;
        dispatchFinalizeEvent(dzFrom, originItems, {trigger: TRIGGERS.DROPPED_INTO_ANOTHER, id: focusedItemId, source: SOURCES.KEYBOARD});
        dispatchFinalizeEvent(newlyFocusedDz, targetItems, {trigger: TRIGGERS.DROPPED_INTO_ZONE, id: focusedItemId, source: SOURCES.KEYBOARD});
        focusedDz = newlyFocusedDz;
    }

    function triggerAllDzsUpdate() {
        dzToHandles.forEach(({update}, dz) => update(dzToConfig.get(dz)));
    }

    function handleDrop(dispatchConsider = true) {
        if (!dzToConfig.get(focusedDz).autoAriaDisabled) {
            alertToScreenReader(`Stopped dragging item ${focusedItemLabel}`);
        }
        if (allDragTargets.has(document.activeElement)) {
            document.activeElement.blur();
        }
        if (dispatchConsider) {
            dispatchConsiderEvent(focusedDz, dzToConfig.get(focusedDz).items, {
                trigger: TRIGGERS.DRAG_STOPPED,
                id: focusedItemId,
                source: SOURCES.KEYBOARD
            });
        }
        styleInactiveDropZones(
            typeToDropZones.get(draggedItemType),
            dz => dzToConfig.get(dz).dropTargetStyle,
            dz => dzToConfig.get(dz).dropTargetClasses
        );
        focusedItem = null;
        focusedItemId = null;
        focusedItemLabel = "";
        draggedItemType = null;
        focusedDz = null;
        focusedDzLabel = "";
        isDragging = false;
        triggerAllDzsUpdate();
    }
    //////
    function dndzone$1(node, options) {
        const config = {
            items: undefined,
            type: undefined,
            dragDisabled: false,
            zoneTabIndex: 0,
            zoneItemTabIndex: 0,
            dropFromOthersDisabled: false,
            dropTargetStyle: DEFAULT_DROP_TARGET_STYLE,
            dropTargetClasses: [],
            autoAriaDisabled: false
        };

        function swap(arr, i, j) {
            if (arr.length <= 1) return;
            arr.splice(j, 1, arr.splice(i, 1, arr[j])[0]);
        }

        function handleKeyDown(e) {
            switch (e.key) {
                case "Enter":
                case " ": {
                    // we don't want to affect nested input elements or clickable elements
                    if ((e.target.disabled !== undefined || e.target.href || e.target.isContentEditable) && !allDragTargets.has(e.target)) {
                        return;
                    }
                    e.preventDefault(); // preventing scrolling on spacebar
                    e.stopPropagation();
                    if (isDragging) {
                        // TODO - should this trigger a drop? only here or in general (as in when hitting space or enter outside of any zone)?
                        handleDrop();
                    } else {
                        // drag start
                        handleDragStart(e);
                    }
                    break;
                }
                case "ArrowDown":
                case "ArrowRight": {
                    if (!isDragging) return;
                    e.preventDefault(); // prevent scrolling
                    e.stopPropagation();
                    const {items} = dzToConfig.get(node);
                    const children = Array.from(node.children);
                    const idx = children.indexOf(e.currentTarget);
                    if (idx < children.length - 1) {
                        if (!config.autoAriaDisabled) {
                            alertToScreenReader(`Moved item ${focusedItemLabel} to position ${idx + 2} in the list ${focusedDzLabel}`);
                        }
                        swap(items, idx, idx + 1);
                        dispatchFinalizeEvent(node, items, {trigger: TRIGGERS.DROPPED_INTO_ZONE, id: focusedItemId, source: SOURCES.KEYBOARD});
                    }
                    break;
                }
                case "ArrowUp":
                case "ArrowLeft": {
                    if (!isDragging) return;
                    e.preventDefault(); // prevent scrolling
                    e.stopPropagation();
                    const {items} = dzToConfig.get(node);
                    const children = Array.from(node.children);
                    const idx = children.indexOf(e.currentTarget);
                    if (idx > 0) {
                        if (!config.autoAriaDisabled) {
                            alertToScreenReader(`Moved item ${focusedItemLabel} to position ${idx} in the list ${focusedDzLabel}`);
                        }
                        swap(items, idx, idx - 1);
                        dispatchFinalizeEvent(node, items, {trigger: TRIGGERS.DROPPED_INTO_ZONE, id: focusedItemId, source: SOURCES.KEYBOARD});
                    }
                    break;
                }
            }
        }
        function handleDragStart(e) {
            setCurrentFocusedItem(e.currentTarget);
            focusedDz = node;
            draggedItemType = config.type;
            isDragging = true;
            const dropTargets = Array.from(typeToDropZones.get(config.type)).filter(dz => dz === focusedDz || !dzToConfig.get(dz).dropFromOthersDisabled);
            styleActiveDropZones(
                dropTargets,
                dz => dzToConfig.get(dz).dropTargetStyle,
                dz => dzToConfig.get(dz).dropTargetClasses
            );
            if (!config.autoAriaDisabled) {
                let msg = `Started dragging item ${focusedItemLabel}. Use the arrow keys to move it within its list ${focusedDzLabel}`;
                if (dropTargets.length > 1) {
                    msg += `, or tab to another list in order to move the item into it`;
                }
                alertToScreenReader(msg);
            }
            dispatchConsiderEvent(node, dzToConfig.get(node).items, {trigger: TRIGGERS.DRAG_STARTED, id: focusedItemId, source: SOURCES.KEYBOARD});
            triggerAllDzsUpdate();
        }

        function handleClick(e) {
            if (!isDragging) return;
            if (e.currentTarget === focusedItem) return;
            e.stopPropagation();
            handleDrop(false);
            handleDragStart(e);
        }
        function setCurrentFocusedItem(draggableEl) {
            const {items} = dzToConfig.get(node);
            const children = Array.from(node.children);
            const focusedItemIdx = children.indexOf(draggableEl);
            focusedItem = draggableEl;
            focusedItem.tabIndex = config.zoneItemTabIndex;
            focusedItemId = items[focusedItemIdx][ITEM_ID_KEY];
            focusedItemLabel = children[focusedItemIdx].getAttribute("aria-label") || "";
        }

        function configure({
            items = [],
            type: newType = DEFAULT_DROP_ZONE_TYPE,
            dragDisabled = false,
            zoneTabIndex = 0,
            zoneItemTabIndex = 0,
            dropFromOthersDisabled = false,
            dropTargetStyle = DEFAULT_DROP_TARGET_STYLE,
            dropTargetClasses = [],
            autoAriaDisabled = false
        }) {
            config.items = [...items];
            config.dragDisabled = dragDisabled;
            config.dropFromOthersDisabled = dropFromOthersDisabled;
            config.zoneTabIndex = zoneTabIndex;
            config.zoneItemTabIndex = zoneItemTabIndex;
            config.dropTargetStyle = dropTargetStyle;
            config.dropTargetClasses = dropTargetClasses;
            config.autoAriaDisabled = autoAriaDisabled;
            if (config.type && newType !== config.type) {
                unregisterDropZone(node, config.type);
            }
            config.type = newType;
            registerDropZone(node, newType);
            if (!autoAriaDisabled) {
                node.setAttribute("aria-disabled", dragDisabled);
                node.setAttribute("role", "list");
                node.setAttribute("aria-describedby", dragDisabled ? INSTRUCTION_IDs.DND_ZONE_DRAG_DISABLED : INSTRUCTION_IDs.DND_ZONE_ACTIVE);
            }
            dzToConfig.set(node, config);

            if (isDragging) {
                node.tabIndex =
                    node === focusedDz ||
                    focusedItem.contains(node) ||
                    config.dropFromOthersDisabled ||
                    (focusedDz && config.type !== dzToConfig.get(focusedDz).type)
                        ? -1
                        : 0;
            } else {
                node.tabIndex = config.zoneTabIndex;
            }

            node.addEventListener("focus", handleZoneFocus);

            for (let i = 0; i < node.children.length; i++) {
                const draggableEl = node.children[i];
                allDragTargets.add(draggableEl);
                draggableEl.tabIndex = isDragging ? -1 : config.zoneItemTabIndex;
                if (!autoAriaDisabled) {
                    draggableEl.setAttribute("role", "listitem");
                }
                draggableEl.removeEventListener("keydown", elToKeyDownListeners.get(draggableEl));
                draggableEl.removeEventListener("click", elToFocusListeners.get(draggableEl));
                if (!dragDisabled) {
                    draggableEl.addEventListener("keydown", handleKeyDown);
                    elToKeyDownListeners.set(draggableEl, handleKeyDown);
                    draggableEl.addEventListener("click", handleClick);
                    elToFocusListeners.set(draggableEl, handleClick);
                }
                if (isDragging && config.items[i][ITEM_ID_KEY] === focusedItemId) {
                    // if it is a nested dropzone, it was re-rendered and we need to refresh our pointer
                    focusedItem = draggableEl;
                    focusedItem.tabIndex = config.zoneItemTabIndex;
                    // without this the element loses focus if it moves backwards in the list
                    draggableEl.focus();
                }
            }
        }
        configure(options);

        const handles = {
            update: newOptions => {
                configure(newOptions);
            },
            destroy: () => {
                unregisterDropZone(node, config.type);
                dzToConfig.delete(node);
                dzToHandles.delete(node);
            }
        };
        dzToHandles.set(node, handles);
        return handles;
    }

    /**
     * A custom action to turn any container to a dnd zone and all of its direct children to draggables
     * Supports mouse, touch and keyboard interactions.
     * Dispatches two events that the container is expected to react to by modifying its list of items,
     * which will then feed back in to this action via the update function
     *
     * @typedef {object} Options
     * @property {array} items - the list of items that was used to generate the children of the given node (the list used in the #each block
     * @property {string} [type] - the type of the dnd zone. children dragged from here can only be dropped in other zones of the same type, default to a base type
     * @property {number} [flipDurationMs] - if the list animated using flip (recommended), specifies the flip duration such that everything syncs with it without conflict, defaults to zero
     * @property {boolean} [dragDisabled]
     * @property {boolean} [morphDisabled] - whether dragged element should morph to zone dimensions
     * @property {boolean} [dropFromOthersDisabled]
     * @property {number} [zoneTabIndex] - set the tabindex of the list container when not dragging
     * @property {number} [zoneItemTabIndex] - set the tabindex of the list container items when not dragging
     * @property {object} [dropTargetStyle]
     * @property {string[]} [dropTargetClasses]
     * @property {function} [transformDraggedElement]
     * @param {HTMLElement} node - the element to enhance
     * @param {Options} options
     * @return {{update: function, destroy: function}}
     */
    function dndzone(node, options) {
        if (shouldIgnoreZone(node)) {
            return {
                update: () => {},
                destroy: () => {}
            };
        }
        validateOptions(options);
        const pointerZone = dndzone$2(node, options);
        const keyboardZone = dndzone$1(node, options);
        return {
            update: newOptions => {
                validateOptions(newOptions);
                pointerZone.update(newOptions);
                keyboardZone.update(newOptions);
            },
            destroy: () => {
                pointerZone.destroy();
                keyboardZone.destroy();
            }
        };
    }

    /**
     * If the user marked something in the ancestry of our node as shadow element, we can ignore it
     * We need the user to mark it for us because svelte updates the action from deep to shallow (but renders top down)
     * @param {HTMLElement} node
     * @return {boolean}
     */
    function shouldIgnoreZone(node) {
        return !!node.closest(`[${SHADOW_ELEMENT_HINT_ATTRIBUTE_NAME}="true"]`);
    }

    function validateOptions(options) {
        /*eslint-disable*/
        const {
            items,
            flipDurationMs,
            type,
            dragDisabled,
            morphDisabled,
            dropFromOthersDisabled,
            zoneTabIndex,
            zoneItemTabIndex,
            dropTargetStyle,
            dropTargetClasses,
            transformDraggedElement,
            autoAriaDisabled,
            centreDraggedOnCursor,
            ...rest
        } = options;
        /*eslint-enable*/
        if (Object.keys(rest).length > 0) {
            console.warn(`dndzone will ignore unknown options`, rest);
        }
        if (!items) {
            throw new Error("no 'items' key provided to dndzone");
        }
        const itemWithMissingId = items.find(item => !{}.hasOwnProperty.call(item, ITEM_ID_KEY));
        if (itemWithMissingId) {
            throw new Error(`missing '${ITEM_ID_KEY}' property for item ${toString(itemWithMissingId)}`);
        }
        if (dropTargetClasses && !Array.isArray(dropTargetClasses)) {
            throw new Error(`dropTargetClasses should be an array but instead it is a ${typeof dropTargetClasses}, ${toString(dropTargetClasses)}`);
        }
        if (zoneTabIndex && !isInt(zoneTabIndex)) {
            throw new Error(`zoneTabIndex should be a number but instead it is a ${typeof zoneTabIndex}, ${toString(zoneTabIndex)}`);
        }
        if (zoneItemTabIndex && !isInt(zoneItemTabIndex)) {
            throw new Error(`zoneItemTabIndex should be a number but instead it is a ${typeof zoneItemTabIndex}, ${toString(zoneItemTabIndex)}`);
        }
    }

    function isInt(value) {
        return (
            !isNaN(value) &&
            (function (x) {
                return (x | 0) === x;
            })(parseFloat(value))
        );
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function flip(node, { from, to }, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
        const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
        const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
            easing,
            css: (t, u) => {
                const x = u * dx;
                const y = u * dy;
                const sx = t + u * from.width / to.width;
                const sy = t + u * from.height / to.height;
                return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
            }
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* svelte-app\Tile.svelte generated by Svelte v3.59.2 */

    const file$4 = "svelte-app\\Tile.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let b;
    	let t;
    	let div1_class_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			b = element("b");
    			t = text(/*letter*/ ctx[0]);
    			add_location(b, file$4, 7, 8, 150);
    			attr_dev(div0, "class", "letter no-select svelte-ysb8u0");
    			add_location(div0, file$4, 6, 4, 110);
    			attr_dev(div1, "class", div1_class_value = "" + (/*className*/ ctx[1] + " tile" + " svelte-ysb8u0"));
    			add_location(div1, file$4, 5, 0, 74);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, b);
    			append_dev(b, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*letter*/ 1) set_data_dev(t, /*letter*/ ctx[0]);

    			if (dirty & /*className*/ 2 && div1_class_value !== (div1_class_value = "" + (/*className*/ ctx[1] + " tile" + " svelte-ysb8u0"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tile', slots, []);
    	let { letter } = $$props;
    	let { className } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (letter === undefined && !('letter' in $$props || $$self.$$.bound[$$self.$$.props['letter']])) {
    			console.warn("<Tile> was created without expected prop 'letter'");
    		}

    		if (className === undefined && !('className' in $$props || $$self.$$.bound[$$self.$$.props['className']])) {
    			console.warn("<Tile> was created without expected prop 'className'");
    		}
    	});

    	const writable_props = ['letter', 'className'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tile> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('letter' in $$props) $$invalidate(0, letter = $$props.letter);
    		if ('className' in $$props) $$invalidate(1, className = $$props.className);
    	};

    	$$self.$capture_state = () => ({ letter, className });

    	$$self.$inject_state = $$props => {
    		if ('letter' in $$props) $$invalidate(0, letter = $$props.letter);
    		if ('className' in $$props) $$invalidate(1, className = $$props.className);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [letter, className];
    }

    class Tile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { letter: 0, className: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tile",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get letter() {
    		throw new Error("<Tile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set letter(value) {
    		throw new Error("<Tile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get className() {
    		throw new Error("<Tile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<Tile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* svelte-app\Square.svelte generated by Svelte v3.59.2 */
    const file$3 = "svelte-app\\Square.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (58:4) {#each items as tile (tile.id)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let tile;
    	let current;

    	tile = new Tile({
    			props: {
    				letter: /*tile*/ ctx[8].letter,
    				className: /*tile*/ ctx[8].letter[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(tile.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(tile, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const tile_changes = {};
    			if (dirty & /*items*/ 4) tile_changes.letter = /*tile*/ ctx[8].letter;
    			if (dirty & /*items*/ 4) tile_changes.className = /*tile*/ ctx[8].letter[0];
    			tile.$set(tile_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(tile, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(58:4) {#each items as tile (tile.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div_style_value;
    	let dndzone_action;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*items*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*tile*/ ctx[8].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "square svelte-fv73y4");
    			attr_dev(div, "id", /*id*/ ctx[0]);

    			attr_dev(div, "style", div_style_value = /*items*/ ctx[2].find(/*func*/ ctx[6])
    			? "background: rgba(255, 255, 255, 0.2)"
    			: "");

    			add_location(div, file$3, 47, 0, 1536);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(dndzone_action = dndzone.call(null, div, /*options*/ ctx[3])),
    					listen_dev(div, "consider", /*handleDndConsider*/ ctx[4], false, false, false, false),
    					listen_dev(div, "finalize", /*handleDndFinalize*/ ctx[5], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*items*/ 4) {
    				each_value = /*items*/ ctx[2];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				check_outros();
    			}

    			if (!current || dirty & /*id*/ 1) {
    				attr_dev(div, "id", /*id*/ ctx[0]);
    			}

    			if (!current || dirty & /*items*/ 4 && div_style_value !== (div_style_value = /*items*/ ctx[2].find(/*func*/ ctx[6])
    			? "background: rgba(255, 255, 255, 0.2)"
    			: "")) {
    				attr_dev(div, "style", div_style_value);
    			}

    			if (dndzone_action && is_function(dndzone_action.update) && dirty & /*options*/ 8) dndzone_action.update.call(null, /*options*/ ctx[3]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let options;

    	let $letters,
    		$$unsubscribe_letters = noop,
    		$$subscribe_letters = () => ($$unsubscribe_letters(), $$unsubscribe_letters = subscribe(letters, $$value => $$invalidate(7, $letters = $$value)), letters);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_letters());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Square', slots, []);
    	let { id } = $$props;
    	let { letters } = $$props;
    	validate_store(letters, 'letters');
    	$$subscribe_letters();
    	let items = [];

    	function handleDndConsider(e) {
    		document.getElementById("rack").style.opacity = 0.5;
    		$$invalidate(2, items = e.detail.items);
    	}

    	function handleDndFinalize(e) {
    		const id = e.target.id;

    		// console.log(id);
    		const height = $letters.length;

    		const y = Math.floor(id / height); // the x values in the array are the columns in the elements, vice versa
    		const x = id % height; // It works hence you will not change it.

    		// I have y and x switched bc the letters must be [row][column] (see the example files)
    		// console.log(e.detail.items[0].letter);
    		if (e.detail.info.trigger === TRIGGERS.DROPPED_INTO_ZONE) {
    			let new_letter = e.detail.items[0].letter;
    			set_store_value(letters, $letters[x][y] = new_letter, $letters);
    		} else {
    			set_store_value(letters, $letters[x][y] = "X", $letters);
    		}

    		// console.log($letters[x][y], length, height, x, y);
    		// console.log($letters);
    		document.getElementById("rack").style.opacity = 1;

    		$$invalidate(2, items = e.detail.items);
    	}

    	$$self.$$.on_mount.push(function () {
    		if (id === undefined && !('id' in $$props || $$self.$$.bound[$$self.$$.props['id']])) {
    			console.warn("<Square> was created without expected prop 'id'");
    		}

    		if (letters === undefined && !('letters' in $$props || $$self.$$.bound[$$self.$$.props['letters']])) {
    			console.warn("<Square> was created without expected prop 'letters'");
    		}
    	});

    	const writable_props = ['id', 'letters'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Square> was created with unknown prop '${key}'`);
    	});

    	const func = tile => tile[SHADOW_ITEM_MARKER_PROPERTY_NAME];

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('letters' in $$props) $$subscribe_letters($$invalidate(1, letters = $$props.letters));
    	};

    	$$self.$capture_state = () => ({
    		dndzone,
    		TRIGGERS,
    		SHADOW_ITEM_MARKER_PROPERTY_NAME,
    		id,
    		letters,
    		Tile,
    		items,
    		handleDndConsider,
    		handleDndFinalize,
    		options,
    		$letters
    	});

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('letters' in $$props) $$subscribe_letters($$invalidate(1, letters = $$props.letters));
    		if ('items' in $$props) $$invalidate(2, items = $$props.items);
    		if ('options' in $$props) $$invalidate(3, options = $$props.options);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*items*/ 4) {
    			$$invalidate(3, options = {
    				dropFromOthersDisabled: items.length,
    				items,
    				dropTargetStyle: {},
    				flipDurationMs: 10
    			});
    		}
    	};

    	return [id, letters, items, options, handleDndConsider, handleDndFinalize, func];
    }

    class Square extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { id: 0, letters: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Square",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get id() {
    		throw new Error("<Square>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Square>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get letters() {
    		throw new Error("<Square>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set letters(value) {
    		throw new Error("<Square>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* svelte-app\Led.svelte generated by Svelte v3.59.2 */

    const file$2 = "svelte-app\\Led.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let h4;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			t = text(/*id*/ ctx[1]);
    			add_location(h4, file$2, 14, 4, 304);
    			attr_dev(div, "class", "led no-select svelte-8svndz");

    			set_style(div, "background", /*ledGrid*/ ctx[0][/*id*/ ctx[1]].isOn
    			? '#198754'
    			: 'red');

    			add_location(div, file$2, 9, 0, 174);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(h4, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "mousedown", /*toogle*/ ctx[2], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*id*/ 2) set_data_dev(t, /*id*/ ctx[1]);

    			if (dirty & /*ledGrid, id*/ 3) {
    				set_style(div, "background", /*ledGrid*/ ctx[0][/*id*/ ctx[1]].isOn
    				? '#198754'
    				: 'red');
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Led', slots, []);
    	let { id } = $$props;
    	let { ledGrid } = $$props;

    	let toogle = () => {
    		$$invalidate(0, ledGrid[id].isOn = !ledGrid[id].isOn, ledGrid);
    	};

    	$$self.$$.on_mount.push(function () {
    		if (id === undefined && !('id' in $$props || $$self.$$.bound[$$self.$$.props['id']])) {
    			console.warn("<Led> was created without expected prop 'id'");
    		}

    		if (ledGrid === undefined && !('ledGrid' in $$props || $$self.$$.bound[$$self.$$.props['ledGrid']])) {
    			console.warn("<Led> was created without expected prop 'ledGrid'");
    		}
    	});

    	const writable_props = ['id', 'ledGrid'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Led> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('ledGrid' in $$props) $$invalidate(0, ledGrid = $$props.ledGrid);
    	};

    	$$self.$capture_state = () => ({ id, ledGrid, toogle });

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('ledGrid' in $$props) $$invalidate(0, ledGrid = $$props.ledGrid);
    		if ('toogle' in $$props) $$invalidate(2, toogle = $$props.toogle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ledGrid, id, toogle];
    }

    class Led extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { id: 1, ledGrid: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Led",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get id() {
    		throw new Error("<Led>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Led>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ledGrid() {
    		throw new Error("<Led>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ledGrid(value) {
    		throw new Error("<Led>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* svelte-app\LedOut.svelte generated by Svelte v3.59.2 */

    const file$1 = "svelte-app\\LedOut.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let h4;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			t = text(/*id*/ ctx[0]);
    			add_location(h4, file$1, 9, 4, 177);
    			attr_dev(div, "class", "led no-select svelte-1uwx5lx");

    			set_style(div, "background", /*ledGridOut*/ ctx[1][/*id*/ ctx[0]].isOn
    			? '#198754'
    			: 'red');

    			add_location(div, file$1, 5, 0, 71);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(h4, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*id*/ 1) set_data_dev(t, /*id*/ ctx[0]);

    			if (dirty & /*ledGridOut, id*/ 3) {
    				set_style(div, "background", /*ledGridOut*/ ctx[1][/*id*/ ctx[0]].isOn
    				? '#198754'
    				: 'red');
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LedOut', slots, []);
    	let { id } = $$props;
    	let { ledGridOut } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (id === undefined && !('id' in $$props || $$self.$$.bound[$$self.$$.props['id']])) {
    			console.warn("<LedOut> was created without expected prop 'id'");
    		}

    		if (ledGridOut === undefined && !('ledGridOut' in $$props || $$self.$$.bound[$$self.$$.props['ledGridOut']])) {
    			console.warn("<LedOut> was created without expected prop 'ledGridOut'");
    		}
    	});

    	const writable_props = ['id', 'ledGridOut'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LedOut> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('ledGridOut' in $$props) $$invalidate(1, ledGridOut = $$props.ledGridOut);
    	};

    	$$self.$capture_state = () => ({ id, ledGridOut });

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('ledGridOut' in $$props) $$invalidate(1, ledGridOut = $$props.ledGridOut);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [id, ledGridOut];
    }

    class LedOut extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { id: 0, ledGridOut: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LedOut",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get id() {
    		throw new Error("<LedOut>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<LedOut>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ledGridOut() {
    		throw new Error("<LedOut>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ledGridOut(value) {
    		throw new Error("<LedOut>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* svelte-app\App.svelte generated by Svelte v3.59.2 */

    const { Object: Object_1, console: console_1, window: window_1 } = globals;
    const file = "svelte-app\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    // (136:3) {#each ledGrid as led}
    function create_each_block_4(ctx) {
    	let led;
    	let updating_ledGrid;
    	let current;

    	function led_ledGrid_binding(value) {
    		/*led_ledGrid_binding*/ ctx[16](value);
    	}

    	let led_props = { id: /*led*/ ctx[25].id };

    	if (/*ledGrid*/ ctx[4] !== void 0) {
    		led_props.ledGrid = /*ledGrid*/ ctx[4];
    	}

    	led = new Led({ props: led_props, $$inline: true });
    	binding_callbacks.push(() => bind(led, 'ledGrid', led_ledGrid_binding));

    	const block = {
    		c: function create() {
    			create_component(led.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(led, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const led_changes = {};
    			if (dirty[0] & /*ledGrid*/ 16) led_changes.id = /*led*/ ctx[25].id;

    			if (!updating_ledGrid && dirty[0] & /*ledGrid*/ 16) {
    				updating_ledGrid = true;
    				led_changes.ledGrid = /*ledGrid*/ ctx[4];
    				add_flush_callback(() => updating_ledGrid = false);
    			}

    			led.$set(led_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(led.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(led.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(led, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(136:3) {#each ledGrid as led}",
    		ctx
    	});

    	return block;
    }

    // (157:6) {#each col as row}
    function create_each_block_3(ctx) {
    	let square;
    	let updating_letters;
    	let current;

    	function square_letters_binding(value) {
    		/*square_letters_binding*/ ctx[17](value);
    	}

    	let square_props = { id: /*row*/ ctx[31].id };

    	if (/*letters*/ ctx[1] !== void 0) {
    		square_props.letters = /*letters*/ ctx[1];
    	}

    	square = new Square({ props: square_props, $$inline: true });
    	binding_callbacks.push(() => bind(square, 'letters', square_letters_binding));

    	const block = {
    		c: function create() {
    			create_component(square.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(square, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const square_changes = {};
    			if (dirty[0] & /*$boardGrid*/ 64) square_changes.id = /*row*/ ctx[31].id;

    			if (!updating_letters && dirty[0] & /*letters*/ 2) {
    				updating_letters = true;
    				square_changes.letters = /*letters*/ ctx[1];
    				add_flush_callback(() => updating_letters = false);
    			}

    			square.$set(square_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(square.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(square.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(square, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(157:6) {#each col as row}",
    		ctx
    	});

    	return block;
    }

    // (155:4) {#each $boardGrid as col}
    function create_each_block_2(ctx) {
    	let div;
    	let t;
    	let current;
    	let each_value_3 = /*col*/ ctx[28];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "column svelte-7be8e0");
    			add_location(div, file, 155, 5, 3896);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$boardGrid, letters*/ 66) {
    				each_value_3 = /*col*/ ctx[28];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, t);
    					}
    				}

    				group_outros();

    				for (i = each_value_3.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_3.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(155:4) {#each $boardGrid as col}",
    		ctx
    	});

    	return block;
    }

    // (179:3) {#each ledGridOut as led}
    function create_each_block_1(ctx) {
    	let ledout;
    	let updating_ledGridOut;
    	let current;

    	function ledout_ledGridOut_binding(value) {
    		/*ledout_ledGridOut_binding*/ ctx[18](value);
    	}

    	let ledout_props = { id: /*led*/ ctx[25].id };

    	if (/*ledGridOut*/ ctx[2] !== void 0) {
    		ledout_props.ledGridOut = /*ledGridOut*/ ctx[2];
    	}

    	ledout = new LedOut({ props: ledout_props, $$inline: true });
    	binding_callbacks.push(() => bind(ledout, 'ledGridOut', ledout_ledGridOut_binding));

    	const block = {
    		c: function create() {
    			create_component(ledout.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ledout, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const ledout_changes = {};
    			if (dirty[0] & /*ledGridOut*/ 4) ledout_changes.id = /*led*/ ctx[25].id;

    			if (!updating_ledGridOut && dirty[0] & /*ledGridOut*/ 4) {
    				updating_ledGridOut = true;
    				ledout_changes.ledGridOut = /*ledGridOut*/ ctx[2];
    				add_flush_callback(() => updating_ledGridOut = false);
    			}

    			ledout.$set(ledout_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ledout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ledout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ledout, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(179:3) {#each ledGridOut as led}",
    		ctx
    	});

    	return block;
    }

    // (193:2) {#each items as item (item.id)}
    function create_each_block(key_1, ctx) {
    	let div;
    	let tile;
    	let t;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	tile = new Tile({
    			props: {
    				letter: /*item*/ ctx[22].letter,
    				className: /*item*/ ctx[22].letter[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(tile.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "svelte-7be8e0");
    			add_location(div, file, 193, 3, 4767);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(tile, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const tile_changes = {};
    			if (dirty[0] & /*items*/ 1) tile_changes.letter = /*item*/ ctx[22].letter;
    			if (dirty[0] & /*items*/ 1) tile_changes.className = /*item*/ ctx[22].letter[0];
    			tile.$set(tile_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: flipDurationMs });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(tile);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(193:2) {#each items as item (item.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div7;
    	let div4;
    	let div0;
    	let t0;
    	let div2;
    	let button0;
    	let h10;
    	let t2;
    	let button1;
    	let h11;
    	let t4;
    	let div1;
    	let t5;
    	let button2;
    	let h12;
    	let t7;
    	let button3;
    	let h13;
    	let t9;
    	let div3;
    	let t10;
    	let div5;
    	let each_blocks = [];
    	let each3_lookup = new Map();
    	let dndzone_action;
    	let dndzone_action_1;
    	let t11;
    	let div6;
    	let button4;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_4 = /*ledGrid*/ ctx[4];
    	validate_each_argument(each_value_4);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_3[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const out = i => transition_out(each_blocks_3[i], 1, 1, () => {
    		each_blocks_3[i] = null;
    	});

    	let each_value_2 = /*$boardGrid*/ ctx[6];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out_1 = i => transition_out(each_blocks_2[i], 1, 1, () => {
    		each_blocks_2[i] = null;
    	});

    	let each_value_1 = /*ledGridOut*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out_2 = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[22].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each3_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div4 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t0 = space();
    			div2 = element("div");
    			button0 = element("button");
    			h10 = element("h1");
    			h10.textContent = "-";
    			t2 = space();
    			button1 = element("button");
    			h11 = element("h1");
    			h11.textContent = "-";
    			t4 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t5 = space();
    			button2 = element("button");
    			h12 = element("h1");
    			h12.textContent = "+";
    			t7 = space();
    			button3 = element("button");
    			h13 = element("h1");
    			h13.textContent = "+";
    			t9 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t10 = space();
    			div5 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t11 = space();
    			div6 = element("div");
    			button4 = element("button");
    			button4.textContent = "run";
    			attr_dev(div0, "class", "grid svelte-7be8e0");
    			add_location(div0, file, 134, 2, 3324);
    			add_location(h10, file, 143, 40, 3588);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "decrementLength btn btn-outline-secondary svelte-7be8e0");
    			add_location(button0, file, 140, 3, 3465);
    			set_style(h11, "margin-bottom", "0px");
    			set_style(h11, "line-height", "0.9em");
    			add_location(h11, file, 149, 5, 3746);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "decrementHeight btn btn-outline-secondary svelte-7be8e0");
    			add_location(button1, file, 145, 3, 3617);
    			attr_dev(div1, "class", "main grid svelte-7be8e0");
    			add_location(div1, file, 153, 3, 3835);
    			add_location(h12, file, 166, 40, 4168);
    			attr_dev(button2, "type", "button");
    			attr_dev(button2, "class", "incrementLength btn btn-outline-secondary svelte-7be8e0");
    			add_location(button2, file, 163, 3, 4045);
    			set_style(h13, "margin-bottom", "0px");
    			set_style(h13, "line-height", "0.9em");
    			add_location(h13, file, 172, 5, 4326);
    			attr_dev(button3, "type", "button");
    			attr_dev(button3, "class", "incrementHeight btn btn-outline-secondary svelte-7be8e0");
    			add_location(button3, file, 168, 3, 4197);
    			attr_dev(div2, "class", "gridContainer svelte-7be8e0");
    			add_location(div2, file, 139, 2, 3433);
    			attr_dev(div3, "class", "grid svelte-7be8e0");
    			add_location(div3, file, 177, 2, 4424);
    			attr_dev(div4, "class", "column svelte-7be8e0");
    			set_style(div4, "margin", "3em");
    			add_location(div4, file, 133, 1, 3279);
    			attr_dev(div5, "class", "rack svelte-7be8e0");
    			attr_dev(div5, "id", "rack");
    			add_location(div5, file, 184, 1, 4552);
    			attr_dev(button4, "class", "btn btn-primary btn-lg");
    			add_location(button4, file, 199, 2, 4944);
    			attr_dev(div6, "class", "main-container svelte-7be8e0");
    			add_location(div6, file, 198, 1, 4912);
    			attr_dev(div7, "class", "program-container svelte-7be8e0");
    			add_location(div7, file, 132, 0, 3245);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div4);
    			append_dev(div4, div0);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				if (each_blocks_3[i]) {
    					each_blocks_3[i].m(div0, null);
    				}
    			}

    			append_dev(div4, t0);
    			append_dev(div4, div2);
    			append_dev(div2, button0);
    			append_dev(button0, h10);
    			append_dev(div2, t2);
    			append_dev(div2, button1);
    			append_dev(button1, h11);
    			append_dev(div2, t4);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				if (each_blocks_2[i]) {
    					each_blocks_2[i].m(div1, null);
    				}
    			}

    			append_dev(div2, t5);
    			append_dev(div2, button2);
    			append_dev(button2, h12);
    			append_dev(div2, t7);
    			append_dev(div2, button3);
    			append_dev(button3, h13);
    			append_dev(div4, t9);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(div3, null);
    				}
    			}

    			append_dev(div7, t10);
    			append_dev(div7, div5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div5, null);
    				}
    			}

    			append_dev(div7, t11);
    			append_dev(div7, div6);
    			append_dev(div6, button4);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "keydown", /*run*/ ctx[13], false, false, false, false),
    					listen_dev(button0, "click", /*decrementBoardGridLength*/ ctx[12], false, false, false, false),
    					listen_dev(button1, "click", /*decrementBoardGridHeight*/ ctx[10], false, false, false, false),
    					listen_dev(button2, "click", /*incrementBoardGridLength*/ ctx[11], false, false, false, false),
    					listen_dev(button3, "click", /*incrementBoardGridHeight*/ ctx[9], false, false, false, false),
    					action_destroyer(dndzone_action = dndzone.call(null, div5, /*options*/ ctx[3])),
    					action_destroyer(dndzone_action_1 = dndzone.call(null, div5, { items: /*items*/ ctx[0], flipDurationMs })),
    					listen_dev(div5, "consider", /*handleDndConsider*/ ctx[7], false, false, false, false),
    					listen_dev(div5, "finalize", /*handleDndFinalize*/ ctx[8], false, false, false, false),
    					listen_dev(button4, "click", /*run*/ ctx[13], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*ledGrid*/ 16) {
    				each_value_4 = /*ledGrid*/ ctx[4];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    						transition_in(each_blocks_3[i], 1);
    					} else {
    						each_blocks_3[i] = create_each_block_4(child_ctx);
    						each_blocks_3[i].c();
    						transition_in(each_blocks_3[i], 1);
    						each_blocks_3[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_4.length; i < each_blocks_3.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*$boardGrid, letters*/ 66) {
    				each_value_2 = /*$boardGrid*/ ctx[6];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    						transition_in(each_blocks_2[i], 1);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						transition_in(each_blocks_2[i], 1);
    						each_blocks_2[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*ledGridOut*/ 4) {
    				each_value_1 = /*ledGridOut*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div3, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out_2(i);
    				}

    				check_outros();
    			}

    			if (dirty[0] & /*items*/ 1) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each3_lookup, div5, fix_and_outro_and_destroy_block, create_each_block, null, get_each_context);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}

    			if (dndzone_action && is_function(dndzone_action.update) && dirty[0] & /*options*/ 8) dndzone_action.update.call(null, /*options*/ ctx[3]);
    			if (dndzone_action_1 && is_function(dndzone_action_1.update) && dirty[0] & /*items*/ 1) dndzone_action_1.update.call(null, { items: /*items*/ ctx[0], flipDurationMs });
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_4.length; i += 1) {
    				transition_in(each_blocks_3[i]);
    			}

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_3 = each_blocks_3.filter(Boolean);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				transition_out(each_blocks_3[i]);
    			}

    			each_blocks_2 = each_blocks_2.filter(Boolean);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				transition_out(each_blocks_2[i]);
    			}

    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			destroy_each(each_blocks_3, detaching);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const flipDurationMs = 10;

    function instance($$self, $$props, $$invalidate) {
    	let boardGrid;
    	let ledGrid;
    	let options;

    	let $letters,
    		$$unsubscribe_letters = noop,
    		$$subscribe_letters = () => ($$unsubscribe_letters(), $$unsubscribe_letters = subscribe(letters, $$value => $$invalidate(21, $letters = $$value)), letters);

    	let $boardGrid,
    		$$unsubscribe_boardGrid = noop,
    		$$subscribe_boardGrid = () => ($$unsubscribe_boardGrid(), $$unsubscribe_boardGrid = subscribe(boardGrid, $$value => $$invalidate(6, $boardGrid = $$value)), boardGrid);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_letters());
    	$$self.$$.on_destroy.push(() => $$unsubscribe_boardGrid());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let idx = 0;

    	let items = [
    		{ id: idx++, letter: "W" },
    		{ id: idx++, letter: "r" },
    		{ id: idx++, letter: "R" },
    		{ id: idx++, letter: "B" }
    	];

    	let length = 6;
    	let height = 5;
    	let shouldIgnoreDndEvents = false;

    	function handleDndConsider(e) {
    		console.warn(`got consider ${JSON.stringify(e.detail, null, 2)}`);
    		const { trigger, id } = e.detail.info;

    		if (trigger === TRIGGERS.DRAG_STARTED) {
    			console.warn(`copying ${id}`);
    			const idx = items.findIndex(item => item.id === id);
    			const newId = `${id}_copy_${Math.round(Math.random() * 100000)}`;
    			e.detail.items = e.detail.items.filter(item => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
    			e.detail.items.splice(idx, 0, { ...items[idx], id: newId });
    			$$invalidate(0, items = e.detail.items);
    			shouldIgnoreDndEvents = true;
    		} else if (!shouldIgnoreDndEvents) {
    			$$invalidate(0, items = e.detail.items);
    		} else {
    			$$invalidate(0, items = [...items]);
    		}
    	}

    	function handleDndFinalize(e) {
    		console.warn(`got finalize ${JSON.stringify(e.detail, null, 2)}`);
    		const { id } = e.detail.info;

    		if (!shouldIgnoreDndEvents) {
    			window.setTimeout(
    				() => {
    					$$invalidate(0, items = items.filter(i => !i.id.toString().startsWith(`${id}_copy`)));
    				},
    				flipDurationMs
    			);

    			$$invalidate(0, items = e.detail.items);
    		} else {
    			$$invalidate(0, items = [...items]);
    			document.getElementById("rack").style.opacity = 1;
    			shouldIgnoreDndEvents = false;
    		}
    	}

    	let letters = writable(Array.from({ length: height }, () => Array.from({ length }, () => "X")));
    	validate_store(letters, 'letters');
    	$$subscribe_letters();

    	function incrementBoardGridHeight(_e) {
    		$$invalidate(15, height += 1);
    		$letters.push(Array.from({ height }, () => "X"));
    	}

    	function decrementBoardGridHeight(_e) {
    		$$invalidate(15, height -= 1);
    		$letters.pop();
    	}

    	function incrementBoardGridLength(_e) {
    		$$invalidate(14, length += 1);
    		$letters.forEach(array => array.push("X"));
    	}

    	function decrementBoardGridLength(_e) {
    		$$invalidate(14, length -= 1);
    		$letters.forEach(array => array.pop());
    	}

    	function run(e) {
    		if (e.key && e.key !== "Enter") return;

    		const leds = ledGrid.map(led => {
    			if (led.isOn) return `Q${led.id}`; else return "X";
    		}).join(" ");

    		const code = $letters.join("\n").replaceAll(",", " ");
    		const program = [length, height, leds, code].join("\n");
    		console.log(program);
    	}

    	// of type { id: number, isOn: bool}
    	let ledGridOut = Array.from({ length }, (_, i) => Object.create({ id: i, isOn: false }));

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function led_ledGrid_binding(value) {
    		ledGrid = value;
    		($$invalidate(4, ledGrid), $$invalidate(14, length));
    	}

    	function square_letters_binding(value) {
    		letters = value;
    		$$subscribe_letters($$invalidate(1, letters));
    	}

    	function ledout_ledGridOut_binding(value) {
    		ledGridOut = value;
    		$$invalidate(2, ledGridOut);
    	}

    	$$self.$capture_state = () => ({
    		dndzone,
    		TRIGGERS,
    		SHADOW_ITEM_MARKER_PROPERTY_NAME,
    		flip,
    		writable,
    		Tile,
    		Square,
    		Led,
    		LedOut,
    		idx,
    		items,
    		length,
    		height,
    		shouldIgnoreDndEvents,
    		handleDndConsider,
    		handleDndFinalize,
    		letters,
    		incrementBoardGridHeight,
    		decrementBoardGridHeight,
    		incrementBoardGridLength,
    		decrementBoardGridLength,
    		run,
    		ledGridOut,
    		flipDurationMs,
    		options,
    		ledGrid,
    		boardGrid,
    		$letters,
    		$boardGrid
    	});

    	$$self.$inject_state = $$props => {
    		if ('idx' in $$props) idx = $$props.idx;
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    		if ('length' in $$props) $$invalidate(14, length = $$props.length);
    		if ('height' in $$props) $$invalidate(15, height = $$props.height);
    		if ('shouldIgnoreDndEvents' in $$props) shouldIgnoreDndEvents = $$props.shouldIgnoreDndEvents;
    		if ('letters' in $$props) $$subscribe_letters($$invalidate(1, letters = $$props.letters));
    		if ('ledGridOut' in $$props) $$invalidate(2, ledGridOut = $$props.ledGridOut);
    		if ('options' in $$props) $$invalidate(3, options = $$props.options);
    		if ('ledGrid' in $$props) $$invalidate(4, ledGrid = $$props.ledGrid);
    		if ('boardGrid' in $$props) $$subscribe_boardGrid($$invalidate(5, boardGrid = $$props.boardGrid));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*length, height*/ 49152) {
    			$$subscribe_boardGrid($$invalidate(5, boardGrid = writable(Array.from({ length }, (_, i) => Array.from({ length: height }, (_, j) => ({ id: i * height + j }))))));
    		}

    		if ($$self.$$.dirty[0] & /*length*/ 16384) {
    			// of type { id: number, isOn: bool}
    			$$invalidate(4, ledGrid = Array.from({ length }, (_, i) => Object.create({ id: i, isOn: false })));
    		}

    		if ($$self.$$.dirty[0] & /*items*/ 1) {
    			$$invalidate(3, options = {
    				items,
    				flipDurationMs,
    				morphDisabled: true
    			});
    		}
    	};

    	return [
    		items,
    		letters,
    		ledGridOut,
    		options,
    		ledGrid,
    		boardGrid,
    		$boardGrid,
    		handleDndConsider,
    		handleDndFinalize,
    		incrementBoardGridHeight,
    		decrementBoardGridHeight,
    		incrementBoardGridLength,
    		decrementBoardGridLength,
    		run,
    		length,
    		height,
    		led_ledGrid_binding,
    		square_letters_binding,
    		ledout_ledGridOut_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'test'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
