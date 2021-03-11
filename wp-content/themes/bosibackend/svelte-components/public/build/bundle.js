
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
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
                block.p(child_ctx, dirty);
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
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
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
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.35.0' }, detail)));
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
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
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

    /* src/components/atoms/Message.svelte generated by Svelte v3.35.0 */

    const file$7 = "src/components/atoms/Message.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let t1;
    	let p1;
    	let t2;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			p1 = element("p");
    			t2 = text(/*text*/ ctx[1]);
    			attr_dev(p0, "class", "title message__title svelte-1b5gslj");
    			add_location(p0, file$7, 22, 2, 422);
    			attr_dev(p1, "class", "message__text svelte-1b5gslj");
    			add_location(p1, file$7, 23, 2, 468);
    			attr_dev(div, "class", div_class_value = "nes-container is-dark message " + (/*title*/ ctx[0] && "with-title") + " svelte-1b5gslj");
    			add_location(div, file$7, 21, 0, 352);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    			append_dev(p1, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if (dirty & /*text*/ 2) set_data_dev(t2, /*text*/ ctx[1]);

    			if (dirty & /*title*/ 1 && div_class_value !== (div_class_value = "nes-container is-dark message " + (/*title*/ ctx[0] && "with-title") + " svelte-1b5gslj")) {
    				attr_dev(div, "class", div_class_value);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Message", slots, []);
    	let { title } = $$props;
    	let { text } = $$props;
    	const writable_props = ["title", "text"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Message> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({ title, text });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, text];
    }

    class Message extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { title: 0, text: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Message",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<Message> was created without expected prop 'title'");
    		}

    		if (/*text*/ ctx[1] === undefined && !("text" in props)) {
    			console.warn("<Message> was created without expected prop 'text'");
    		}
    	}

    	get title() {
    		throw new Error("<Message>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Message>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Message>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Message>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/atoms/SocialSection.svelte generated by Svelte v3.35.0 */

    const file$6 = "src/components/atoms/SocialSection.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let a0;
    	let i0;
    	let t0;
    	let a1;
    	let i1;
    	let t1;
    	let a2;
    	let i2;
    	let t2;
    	let a3;
    	let i3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a0 = element("a");
    			i0 = element("i");
    			t0 = space();
    			a1 = element("a");
    			i1 = element("i");
    			t1 = space();
    			a2 = element("a");
    			i2 = element("i");
    			t2 = space();
    			a3 = element("a");
    			i3 = element("i");
    			attr_dev(i0, "class", "nes-icon github is-large");
    			attr_dev(i0, "title", "GitHub");
    			add_location(i0, file$6, 17, 20, 286);
    			attr_dev(a0, "href", "https://github.com/bosifullstack");
    			attr_dev(a0, "rel", "noopener noreferrer");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$6, 14, 2, 189);
    			attr_dev(i1, "class", "nes-icon linkedin is-large");
    			attr_dev(i1, "title", "LinkedIn");
    			add_location(i1, file$6, 22, 20, 451);
    			attr_dev(a1, "href", "https://www.linkedin.com/in/felipebosi/");
    			attr_dev(a1, "rel", "noopener noreferrer");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$6, 19, 2, 347);
    			attr_dev(i2, "class", "nes-icon twitter is-large");
    			attr_dev(i2, "title", "Twitter");
    			add_location(i2, file$6, 29, 20, 628);
    			attr_dev(a2, "href", "https://twitter.com/bosiarquitetura");
    			attr_dev(a2, "rel", "noopener noreferrer");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$6, 26, 2, 528);
    			attr_dev(i3, "class", "nes-icon gmail is-large");
    			attr_dev(i3, "title", "Email");
    			add_location(i3, file$6, 34, 20, 786);
    			attr_dev(a3, "href", "mailto:bosifullstack@gmail.com");
    			attr_dev(a3, "rel", "noopener noreferrer");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$6, 31, 2, 691);
    			attr_dev(div, "class", "flex social svelte-1cx8meh");
    			add_location(div, file$6, 13, 0, 161);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a0);
    			append_dev(a0, i0);
    			append_dev(div, t0);
    			append_dev(div, a1);
    			append_dev(a1, i1);
    			append_dev(div, t1);
    			append_dev(div, a2);
    			append_dev(a2, i2);
    			append_dev(div, t2);
    			append_dev(div, a3);
    			append_dev(a3, i3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SocialSection", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SocialSection> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class SocialSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SocialSection",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/atoms/ItemWithDescription.svelte generated by Svelte v3.35.0 */

    const file$5 = "src/components/atoms/ItemWithDescription.svelte";

    function create_fragment$6(ctx) {
    	let li;
    	let a;
    	let t0_value = /*item*/ ctx[0].title + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let p;
    	let t2_value = /*item*/ ctx[0].description + "";
    	let t2;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			attr_dev(a, "class", "link svelte-1j02ay7");
    			attr_dev(a, "href", a_href_value = /*item*/ ctx[0].link);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "noopener noreferrer");
    			add_location(a, file$5, 18, 2, 225);
    			add_location(p, file$5, 21, 2, 327);
    			attr_dev(li, "class", "point svelte-1j02ay7");
    			add_location(li, file$5, 17, 0, 204);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);
    			append_dev(li, p);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*item*/ 1 && t0_value !== (t0_value = /*item*/ ctx[0].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*item*/ 1 && a_href_value !== (a_href_value = /*item*/ ctx[0].link)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*item*/ 1 && t2_value !== (t2_value = /*item*/ ctx[0].description + "")) set_data_dev(t2, t2_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ItemWithDescription", slots, []);
    	
    	let { item } = $$props;
    	const writable_props = ["item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ItemWithDescription> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({ item });

    	$$self.$inject_state = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [item];
    }

    class ItemWithDescription extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { item: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ItemWithDescription",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*item*/ ctx[0] === undefined && !("item" in props)) {
    			console.warn("<ItemWithDescription> was created without expected prop 'item'");
    		}
    	}

    	get item() {
    		throw new Error("<ItemWithDescription>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<ItemWithDescription>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/molecules/ListWithLinks.svelte generated by Svelte v3.35.0 */
    const file$4 = "src/components/molecules/ListWithLinks.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (36:4) {#each items as item, i (`${i}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let itemwithdescription;
    	let current;

    	itemwithdescription = new ItemWithDescription({
    			props: { item: /*item*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(itemwithdescription.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(itemwithdescription, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const itemwithdescription_changes = {};
    			if (dirty & /*items*/ 4) itemwithdescription_changes.item = /*item*/ ctx[3];
    			itemwithdescription.$set(itemwithdescription_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(itemwithdescription.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(itemwithdescription.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(itemwithdescription, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(36:4) {#each items as item, i (`${i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let h1;
    	let t0;
    	let t1;
    	let p;
    	let t2;
    	let t3;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*items*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key = ctx => `${/*i*/ ctx[5]}-${/*item*/ ctx[3].title}`;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			p = element("p");
    			t2 = text(/*description*/ ctx[1]);
    			t3 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "title svelte-68zjdk");
    			add_location(h1, file$4, 32, 2, 510);
    			attr_dev(p, "class", "description svelte-68zjdk");
    			add_location(p, file$4, 33, 2, 543);
    			attr_dev(ul, "class", "nes-list is-circle list svelte-68zjdk");
    			add_location(ul, file$4, 34, 2, 586);
    			attr_dev(div, "class", "lists svelte-68zjdk");
    			add_location(div, file$4, 31, 0, 488);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    			append_dev(div, t3);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if (!current || dirty & /*description*/ 2) set_data_dev(t2, /*description*/ ctx[1]);

    			if (dirty & /*items*/ 4) {
    				each_value = /*items*/ ctx[2];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				check_outros();
    			}
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
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ListWithLinks", slots, []);
    	
    	let { title } = $$props;
    	let { description } = $$props;
    	let { items } = $$props;
    	const writable_props = ["title", "description", "items"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ListWithLinks> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("items" in $$props) $$invalidate(2, items = $$props.items);
    	};

    	$$self.$capture_state = () => ({
    		ItemWithDescription,
    		title,
    		description,
    		items
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("items" in $$props) $$invalidate(2, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, description, items];
    }

    class ListWithLinks extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { title: 0, description: 1, items: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListWithLinks",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<ListWithLinks> was created without expected prop 'title'");
    		}

    		if (/*description*/ ctx[1] === undefined && !("description" in props)) {
    			console.warn("<ListWithLinks> was created without expected prop 'description'");
    		}

    		if (/*items*/ ctx[2] === undefined && !("items" in props)) {
    			console.warn("<ListWithLinks> was created without expected prop 'items'");
    		}
    	}

    	get title() {
    		throw new Error("<ListWithLinks>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ListWithLinks>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<ListWithLinks>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<ListWithLinks>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<ListWithLinks>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<ListWithLinks>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/atoms/StarItem.svelte generated by Svelte v3.35.0 */

    const file$3 = "src/components/atoms/StarItem.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (49:4) {#each starsArray as star}
    function create_each_block$1(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "nes-icon " + /*star*/ ctx[3] + " icon" + " svelte-yhekka");
    			add_location(i, file$3, 48, 30, 911);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(49:4) {#each starsArray as star}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let li;
    	let h3;
    	let t0;
    	let t1;
    	let div;
    	let each_value = /*starsArray*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			h3 = element("h3");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h3, "class", "title svelte-yhekka");
    			add_location(h3, file$3, 46, 2, 823);
    			attr_dev(div, "class", "stars__div");
    			add_location(div, file$3, 47, 2, 856);
    			attr_dev(li, "class", "item flex svelte-yhekka");
    			add_location(li, file$3, 45, 0, 798);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, h3);
    			append_dev(h3, t0);
    			append_dev(li, t1);
    			append_dev(li, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (dirty & /*starsArray*/ 2) {
    				each_value = /*starsArray*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_each(each_blocks, detaching);
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
    	validate_slots("StarItem", slots, []);
    	let { title } = $$props;
    	let { stars } = $$props;
    	const starsArray = [];

    	for (let i = 0; i < 5; i++) {
    		if (i < Math.floor(stars)) {
    			starsArray.push("star");
    		} else if (i === Math.floor(stars) && stars.toString().slice(-1) === "5") {
    			starsArray.push("star is-half");
    		} else {
    			starsArray.push("star is-transparent");
    		}
    	}

    	const writable_props = ["title", "stars"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<StarItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("stars" in $$props) $$invalidate(2, stars = $$props.stars);
    	};

    	$$self.$capture_state = () => ({ title, stars, starsArray });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("stars" in $$props) $$invalidate(2, stars = $$props.stars);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, starsArray, stars];
    }

    class StarItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { title: 0, stars: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StarItem",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<StarItem> was created without expected prop 'title'");
    		}

    		if (/*stars*/ ctx[2] === undefined && !("stars" in props)) {
    			console.warn("<StarItem> was created without expected prop 'stars'");
    		}
    	}

    	get title() {
    		throw new Error("<StarItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<StarItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stars() {
    		throw new Error("<StarItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stars(value) {
    		throw new Error("<StarItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/molecules/StarsList.svelte generated by Svelte v3.35.0 */
    const file$2 = "src/components/molecules/StarsList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (25:4) {#each stars as star}
    function create_each_block(ctx) {
    	let staritem;
    	let current;

    	staritem = new StarItem({
    			props: {
    				title: /*star*/ ctx[2].title,
    				stars: /*star*/ ctx[2].stars
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(staritem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(staritem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const staritem_changes = {};
    			if (dirty & /*stars*/ 2) staritem_changes.title = /*star*/ ctx[2].title;
    			if (dirty & /*stars*/ 2) staritem_changes.stars = /*star*/ ctx[2].stars;
    			staritem.$set(staritem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(staritem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(staritem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(staritem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(25:4) {#each stars as star}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let h2;
    	let t0;
    	let t1;
    	let ul;
    	let current;
    	let each_value = /*stars*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "title svelte-rqehmt");
    			add_location(h2, file$2, 22, 2, 322);
    			attr_dev(ul, "class", "nes-list is-disc svelte-rqehmt");
    			add_location(ul, file$2, 23, 2, 355);
    			add_location(div, file$2, 21, 0, 314);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (dirty & /*stars*/ 2) {
    				each_value = /*stars*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("StarsList", slots, []);
    	
    	let { title } = $$props;
    	let { stars } = $$props;
    	const writable_props = ["title", "stars"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<StarsList> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("stars" in $$props) $$invalidate(1, stars = $$props.stars);
    	};

    	$$self.$capture_state = () => ({ StarItem, title, stars });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("stars" in $$props) $$invalidate(1, stars = $$props.stars);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, stars];
    }

    class StarsList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { title: 0, stars: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StarsList",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<StarsList> was created without expected prop 'title'");
    		}

    		if (/*stars*/ ctx[1] === undefined && !("stars" in props)) {
    			console.warn("<StarsList> was created without expected prop 'stars'");
    		}
    	}

    	get title() {
    		throw new Error("<StarsList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<StarsList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stars() {
    		throw new Error("<StarsList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stars(value) {
    		throw new Error("<StarsList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Dialog.svelte generated by Svelte v3.35.0 */

    const file$1 = "src/components/Dialog.svelte";

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let dialog;
    	let form;
    	let p0;
    	let t2;
    	let p1;
    	let t4;
    	let menu;
    	let button0;
    	let t6;
    	let button1;
    	let t8;
    	let button2;
    	let t10;
    	let button3;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			dialog = element("dialog");
    			form = element("form");
    			p0 = element("p");
    			p0.textContent = "Hello,";
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "This website has a lot of diversified content. To help you have the best\n        experience, I would like to ask you a question first. On the options\n        bellow, what identify you the best:";
    			t4 = space();
    			menu = element("menu");
    			button0 = element("button");
    			button0.textContent = "Tech Recruiter";
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "Programmer / Tech Fan";
    			t8 = space();
    			button2 = element("button");
    			button2.textContent = "Philosopher";
    			t10 = space();
    			button3 = element("button");
    			button3.textContent = "Curious Person";
    			attr_dev(div0, "class", "bg svelte-khhr73");
    			add_location(div0, file$1, 29, 2, 490);
    			attr_dev(p0, "class", "title");
    			add_location(p0, file$1, 32, 6, 603);
    			add_location(p1, file$1, 33, 6, 637);
    			attr_dev(button0, "class", "nes-btn is-primary");
    			add_location(button0, file$1, 39, 8, 900);
    			attr_dev(button1, "class", "nes-btn is-primary");
    			add_location(button1, file$1, 40, 8, 967);
    			attr_dev(button2, "class", "nes-btn is-primary");
    			add_location(button2, file$1, 41, 8, 1041);
    			attr_dev(button3, "class", "nes-btn is-primary");
    			add_location(button3, file$1, 42, 8, 1105);
    			attr_dev(menu, "class", "dialog-menu menu svelte-khhr73");
    			add_location(menu, file$1, 38, 6, 860);
    			attr_dev(form, "method", "dialog");
    			add_location(form, file$1, 31, 4, 574);
    			attr_dev(dialog, "class", "nes-dialog dialog svelte-khhr73");
    			attr_dev(dialog, "id", "dialog-default");
    			add_location(dialog, file$1, 30, 2, 515);
    			add_location(div1, file$1, 28, 0, 482);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, dialog);
    			append_dev(dialog, form);
    			append_dev(form, p0);
    			append_dev(form, t2);
    			append_dev(form, p1);
    			append_dev(form, t4);
    			append_dev(form, menu);
    			append_dev(menu, button0);
    			append_dev(menu, t6);
    			append_dev(menu, button1);
    			append_dev(menu, t8);
    			append_dev(menu, button2);
    			append_dev(menu, t10);
    			append_dev(menu, button3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
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

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Dialog", slots, []);

    	window.onscroll = function () {
    		window.scrollTo(0, 0);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dialog> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Dialog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dialog",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/routes/home.svelte generated by Svelte v3.35.0 */
    const file = "src/routes/home.svelte";

    function create_fragment$1(ctx) {
    	let div2;
    	let dialog;
    	let t0;
    	let message;
    	let t1;
    	let socialsection;
    	let t2;
    	let listwithlinks0;
    	let t3;
    	let listwithlinks1;
    	let t4;
    	let article;
    	let div1;
    	let h1;
    	let t6;
    	let div0;
    	let starslist0;
    	let t7;
    	let starslist1;
    	let current;
    	dialog = new Dialog({ $$inline: true });

    	message = new Message({
    			props: {
    				title: "Felipe Azevedo Bosi",
    				text: "Frontend developer specialized in solutions for educational and health care systems."
    			},
    			$$inline: true
    		});

    	socialsection = new SocialSection({ $$inline: true });

    	listwithlinks0 = new ListWithLinks({
    			props: {
    				title: "Main open-source projects",
    				description: "Here are my main open-source projects. You can see the rest of them on my GitHub account.",
    				items: /*openSourceItems*/ ctx[0]
    			},
    			$$inline: true
    		});

    	listwithlinks1 = new ListWithLinks({
    			props: {
    				title: "Work experiences",
    				description: "Here you can see some of the private projects that I made or participate on the main developer team.",
    				items: /*workExperiencesItems*/ ctx[1]
    			},
    			$$inline: true
    		});

    	starslist0 = new StarsList({
    			props: {
    				title: "Programming Languages",
    				stars: /*programmingLanguages*/ ctx[2]
    			},
    			$$inline: true
    		});

    	starslist1 = new StarsList({
    			props: {
    				title: "Frameworks",
    				stars: /*frameworks*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			create_component(dialog.$$.fragment);
    			t0 = space();
    			create_component(message.$$.fragment);
    			t1 = space();
    			create_component(socialsection.$$.fragment);
    			t2 = space();
    			create_component(listwithlinks0.$$.fragment);
    			t3 = space();
    			create_component(listwithlinks1.$$.fragment);
    			t4 = space();
    			article = element("article");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Programming Abilities";
    			t6 = space();
    			div0 = element("div");
    			create_component(starslist0.$$.fragment);
    			t7 = space();
    			create_component(starslist1.$$.fragment);
    			attr_dev(h1, "class", "section-title svelte-zxa4z1");
    			add_location(h1, file, 121, 6, 3288);
    			attr_dev(div0, "class", "flex svelte-zxa4z1");
    			add_location(div0, file, 122, 6, 3347);
    			attr_dev(div1, "class", "lists");
    			add_location(div1, file, 120, 4, 3262);
    			attr_dev(article, "class", "container");
    			add_location(article, file, 119, 2, 3230);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file, 104, 0, 2629);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			mount_component(dialog, div2, null);
    			append_dev(div2, t0);
    			mount_component(message, div2, null);
    			append_dev(div2, t1);
    			mount_component(socialsection, div2, null);
    			append_dev(div2, t2);
    			mount_component(listwithlinks0, div2, null);
    			append_dev(div2, t3);
    			mount_component(listwithlinks1, div2, null);
    			append_dev(div2, t4);
    			append_dev(div2, article);
    			append_dev(article, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t6);
    			append_dev(div1, div0);
    			mount_component(starslist0, div0, null);
    			append_dev(div0, t7);
    			mount_component(starslist1, div0, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dialog.$$.fragment, local);
    			transition_in(message.$$.fragment, local);
    			transition_in(socialsection.$$.fragment, local);
    			transition_in(listwithlinks0.$$.fragment, local);
    			transition_in(listwithlinks1.$$.fragment, local);
    			transition_in(starslist0.$$.fragment, local);
    			transition_in(starslist1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dialog.$$.fragment, local);
    			transition_out(message.$$.fragment, local);
    			transition_out(socialsection.$$.fragment, local);
    			transition_out(listwithlinks0.$$.fragment, local);
    			transition_out(listwithlinks1.$$.fragment, local);
    			transition_out(starslist0.$$.fragment, local);
    			transition_out(starslist1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(dialog);
    			destroy_component(message);
    			destroy_component(socialsection);
    			destroy_component(listwithlinks0);
    			destroy_component(listwithlinks1);
    			destroy_component(starslist0);
    			destroy_component(starslist1);
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
    	validate_slots("Home", slots, []);
    	
    	

    	const openSourceItems = [
    		{
    			title: "StartPage",
    			link: "https://github.com/bosifullstack/startpage",
    			description: "A PWA StartPage made with svelte"
    		},
    		{
    			title: "React FakeStore",
    			link: "https://bosifullstack.github.io/fakeStore/",
    			description: "A fake store website made with React and Redux"
    		},
    		{
    			title: "Get Stock",
    			link: "https://github.com/bosifullstack/cotacoes",
    			description: "A website that get data of a stock from an API"
    		},
    		{
    			title: "To-Do CLI",
    			link: "https://github.com/bosifullstack/ToDo-CLI",
    			description: "A ToDo list CLI app made with Node.js"
    		}
    	];

    	const workExperiencesItems = [
    		{
    			title: "Luma Health",
    			link: "https://www.lumahealth.io/",
    			description: "Main developer of the blog and part of the frontend team responsible from the company's app. The blog is made in Wordpress and the app is in React"
    		},
    		{
    			title: "UVV",
    			link: "https://www.uvv.br/",
    			description: "Part of the front-end team responsible to maintain the site running"
    		},
    		{
    			title: "Phidelis",
    			link: "https://phidelis.com.br/",
    			description: "Part of the front-end/design team. Responsable for the implementation of Vue.js and Nuxt.js on the product."
    		},
    		{
    			title: "Foca Enem",
    			link: "https://focaenem.folhavitoria.com.br/",
    			description: "Part of the front-end/design team responsable refactor all of the product"
    		}
    	];

    	const programmingLanguages = [
    		{ title: "Java", stars: 3 },
    		{ title: "NodeJs", stars: 3 },
    		{ title: "JavaScript", stars: 5 },
    		{ title: "TypeScript", stars: 4 },
    		{ title: "PHP", stars: 2 }
    	];

    	const frameworks = [
    		{ title: "Spring Boot", stars: 3 },
    		{ title: "ExpressJs", stars: 3 },
    		{ title: "SvelteJs", stars: 4 },
    		{ title: "React", stars: 4 }
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Message,
    		SocialSection,
    		ListWithLinks,
    		StarsList,
    		Dialog,
    		openSourceItems,
    		workExperiencesItems,
    		programmingLanguages,
    		frameworks
    	});

    	return [openSourceItems, workExperiencesItems, programmingLanguages, frameworks];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.35.0 */

    const { console: console_1 } = globals;

    function create_fragment(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	console.log(({
    		"env": {
    			"wordpressRestUrl": "http://bosi-backend.local/wp-json/wp/v2"
    		}
    	}).env);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Home });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

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
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
