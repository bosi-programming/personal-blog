
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
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
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
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
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

    /* src/components/Dialog.svelte generated by Svelte v3.35.0 */
    const file$3 = "src/components/Dialog.svelte";

    function create_fragment$4(ctx) {
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
    	let mounted;
    	let dispose;

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
    			p1.textContent = "To help you have the best experience, I would like to ask you a question\n        first. On the options bellow, what identify you the best:";
    			t4 = space();
    			menu = element("menu");
    			button0 = element("button");
    			button0.textContent = "Tech\n          Recruiter";
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "Programmer";
    			t8 = space();
    			button2 = element("button");
    			button2.textContent = "Philosopher";
    			t10 = space();
    			button3 = element("button");
    			button3.textContent = "Curious Person";
    			attr_dev(div0, "class", "bg svelte-k7gzkz");
    			add_location(div0, file$3, 89, 2, 2403);
    			attr_dev(p0, "class", "title svelte-k7gzkz");
    			add_location(p0, file$3, 92, 6, 2542);
    			attr_dev(p1, "class", "svelte-k7gzkz");
    			add_location(p1, file$3, 93, 6, 2576);
    			attr_dev(button0, "class", "nes-btn is-primary svelte-k7gzkz");
    			add_location(button0, file$3, 98, 8, 2784);
    			attr_dev(button1, "class", "nes-btn is-primary svelte-k7gzkz");
    			add_location(button1, file$3, 102, 8, 2954);
    			attr_dev(button2, "class", "nes-btn is-primary svelte-k7gzkz");
    			add_location(button2, file$3, 105, 8, 3110);
    			attr_dev(button3, "class", "nes-btn is-primary svelte-k7gzkz");
    			add_location(button3, file$3, 108, 8, 3266);
    			attr_dev(menu, "class", "dialog-menu menu svelte-k7gzkz");
    			add_location(menu, file$3, 97, 6, 2744);
    			attr_dev(form, "method", "dialog");
    			attr_dev(form, "class", "svelte-k7gzkz");
    			add_location(form, file$3, 91, 4, 2513);
    			attr_dev(dialog, "class", "nes-dialog dialog svelte-k7gzkz");
    			attr_dev(dialog, "id", "dialog-default");
    			add_location(dialog, file$3, 90, 2, 2454);
    			attr_dev(div1, "class", "svelte-k7gzkz");
    			toggle_class(div1, "hide", /*isToHide*/ ctx[1]);
    			add_location(div1, file$3, 88, 0, 2373);
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

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(button0, "click", /*click_handler_1*/ ctx[6], false, false, false),
    					listen_dev(button1, "click", /*click_handler_2*/ ctx[7], false, false, false),
    					listen_dev(button2, "click", /*click_handler_3*/ ctx[8], false, false, false),
    					listen_dev(button3, "click", /*click_handler_4*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*isToHide*/ 2) {
    				toggle_class(div1, "hide", /*isToHide*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("Dialog", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	

    	window.onscroll = function () {
    		window.scrollTo(0, 0);
    	};

    	let { changeCategory } = $$props;
    	let categories = [];
    	let isToHide = false;

    	const url = ({
    		"env": {
    			"wordpressRestUrl": "https://bosibackend.com/wp-json/wp/v2"
    		}
    	}).env.wordpressRestUrl;

    	const fields = ["id", "name"];

    	const fetchCategories = () => __awaiter(void 0, void 0, void 0, function* () {
    		const response = yield fetch(`${url}/categories?_fields=${fields.toString()}`);
    		const responseJson = yield response.json();

    		responseJson.forEach(el => {
    			const categoryName = el.name;
    			$$invalidate(0, categories[categoryName] = el.id, categories);
    		});
    	});

    	onMount(() => fetchCategories());

    	const hideDialog = () => {
    		$$invalidate(1, isToHide = true);
    		window.onscroll = null;
    	};

    	const handleCategoryChange = newCategory => {
    		changeCategory(newCategory);
    		hideDialog();
    	};

    	const writable_props = ["changeCategory"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dialog> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => hideDialog();
    	const click_handler_1 = () => handleCategoryChange(categories["Programming"] || null);
    	const click_handler_2 = () => handleCategoryChange(categories["Programming"] || null);
    	const click_handler_3 = () => handleCategoryChange(categories["Philosophy"] || null);
    	const click_handler_4 = () => handleCategoryChange([categories["Philosophy"], categories["Programming"]].toString() || null);

    	$$self.$$set = $$props => {
    		if ("changeCategory" in $$props) $$invalidate(4, changeCategory = $$props.changeCategory);
    	};

    	$$self.$capture_state = () => ({
    		__awaiter,
    		onMount,
    		changeCategory,
    		categories,
    		isToHide,
    		url,
    		fields,
    		fetchCategories,
    		hideDialog,
    		handleCategoryChange
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("changeCategory" in $$props) $$invalidate(4, changeCategory = $$props.changeCategory);
    		if ("categories" in $$props) $$invalidate(0, categories = $$props.categories);
    		if ("isToHide" in $$props) $$invalidate(1, isToHide = $$props.isToHide);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		categories,
    		isToHide,
    		hideDialog,
    		handleCategoryChange,
    		changeCategory,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class Dialog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { changeCategory: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dialog",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*changeCategory*/ ctx[4] === undefined && !("changeCategory" in props)) {
    			console.warn("<Dialog> was created without expected prop 'changeCategory'");
    		}
    	}

    	get changeCategory() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set changeCategory(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/PostCard.svelte generated by Svelte v3.35.0 */

    const file$2 = "src/components/PostCard.svelte";

    function create_fragment$3(ctx) {
    	let article;
    	let a;
    	let h3;
    	let t0_value = /*item*/ ctx[0].title.rendered + "";
    	let t0;
    	let t1;
    	let p0;
    	let t2_value = /*renderHtml*/ ctx[1](/*item*/ ctx[0].excerpt.rendered) + "";
    	let t2;
    	let t3;
    	let p1;
    	let t4_value = /*handleDate*/ ctx[2](/*item*/ ctx[0].date) + "";
    	let t4;
    	let a_href_value;
    	let a_title_value;

    	const block = {
    		c: function create() {
    			article = element("article");
    			a = element("a");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			p0 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			p1 = element("p");
    			t4 = text(t4_value);
    			add_location(h3, file$2, 47, 4, 1080);
    			attr_dev(p0, "class", "card-text svelte-ttqf4r");
    			add_location(p0, file$2, 48, 4, 1115);
    			attr_dev(p1, "class", "card-text svelte-ttqf4r");
    			add_location(p1, file$2, 49, 4, 1180);
    			attr_dev(a, "class", "card-content svelte-ttqf4r");
    			attr_dev(a, "href", a_href_value = /*item*/ ctx[0].link);
    			attr_dev(a, "rel", "bookmark");
    			attr_dev(a, "title", a_title_value = "Permanent Link to " + /*item*/ ctx[0].title.rendered);
    			add_location(a, file$2, 42, 2, 955);
    			attr_dev(article, "class", "swiper-slide nes-container is-rounded post-card slide svelte-ttqf4r");
    			add_location(article, file$2, 41, 0, 881);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, a);
    			append_dev(a, h3);
    			append_dev(h3, t0);
    			append_dev(a, t1);
    			append_dev(a, p0);
    			append_dev(p0, t2);
    			append_dev(a, t3);
    			append_dev(a, p1);
    			append_dev(p1, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*item*/ 1 && t0_value !== (t0_value = /*item*/ ctx[0].title.rendered + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*item*/ 1 && t2_value !== (t2_value = /*renderHtml*/ ctx[1](/*item*/ ctx[0].excerpt.rendered) + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*item*/ 1 && t4_value !== (t4_value = /*handleDate*/ ctx[2](/*item*/ ctx[0].date) + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*item*/ 1 && a_href_value !== (a_href_value = /*item*/ ctx[0].link)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*item*/ 1 && a_title_value !== (a_title_value = "Permanent Link to " + /*item*/ ctx[0].title.rendered)) {
    				attr_dev(a, "title", a_title_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
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
    	validate_slots("PostCard", slots, []);
    	
    	let { item } = $$props;

    	const renderHtml = html => {
    		const stringWithoutTags = html.replace(/<[^>]*>?/gm, "");
    		const stringWithCorrectChars = stringWithoutTags.replace("&#8230;", "...");
    		const stringWithCorrectAposte = stringWithCorrectChars.replace("&#8217;", "'");
    		return stringWithCorrectAposte;
    	};

    	const handleDate = dateString => {
    		const date = new Date(dateString);
    		const dateOptions = { day: "numeric", month: "short" };
    		return date.toLocaleString("en-us", dateOptions);
    	};

    	const writable_props = ["item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PostCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({ item, renderHtml, handleDate });

    	$$self.$inject_state = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [item, renderHtml, handleDate];
    }

    class PostCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { item: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PostCard",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*item*/ ctx[0] === undefined && !("item" in props)) {
    			console.warn("<PostCard> was created without expected prop 'item'");
    		}
    	}

    	get item() {
    		throw new Error("<PostCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<PostCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/PostsWrapper.svelte generated by Svelte v3.35.0 */
    const file$1 = "src/components/PostsWrapper.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (36:2) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$1, 36, 4, 612);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(36:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (34:2) {#each articles as article}
    function create_each_block(ctx) {
    	let postcard;
    	let current;

    	postcard = new PostCard({
    			props: { item: /*article*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(postcard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(postcard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const postcard_changes = {};
    			if (dirty & /*articles*/ 1) postcard_changes.item = /*article*/ ctx[1];
    			postcard.$set(postcard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(postcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(postcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(postcard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(34:2) {#each articles as article}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let current;
    	let each_value = /*articles*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block(ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			attr_dev(div, "class", "posts-wrapper svelte-1vfdivw");
    			add_location(div, file$1, 32, 0, 508);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*articles*/ 1) {
    				each_value = /*articles*/ ctx[0];
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
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block(ctx);
    					each_1_else.c();
    					each_1_else.m(div, null);
    				}
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
    			if (each_1_else) each_1_else.d();
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
    	validate_slots("PostsWrapper", slots, []);
    	
    	let { articles = [] } = $$props;
    	const writable_props = ["articles"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PostsWrapper> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("articles" in $$props) $$invalidate(0, articles = $$props.articles);
    	};

    	$$self.$capture_state = () => ({ PostCard, articles });

    	$$self.$inject_state = $$props => {
    		if ("articles" in $$props) $$invalidate(0, articles = $$props.articles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [articles];
    }

    class PostsWrapper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { articles: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PostsWrapper",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get articles() {
    		throw new Error("<PostsWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set articles(value) {
    		throw new Error("<PostsWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/home.svelte generated by Svelte v3.35.0 */
    const file = "src/routes/home.svelte";

    // (39:2) {#if !categoryFromLocalStorage || categoryFromLocalStorage === ''}
    function create_if_block(ctx) {
    	let dialog;
    	let current;

    	dialog = new Dialog({
    			props: { changeCategory: /*fetchArticles*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(dialog.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dialog, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dialog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dialog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dialog, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(39:2) {#if !categoryFromLocalStorage || categoryFromLocalStorage === ''}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let t;
    	let postswrapper;
    	let current;
    	let if_block = (!/*categoryFromLocalStorage*/ ctx[1] || /*categoryFromLocalStorage*/ ctx[1] === "") && create_if_block(ctx);

    	postswrapper = new PostsWrapper({
    			props: { articles: /*articles*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			create_component(postswrapper.$$.fragment);
    			attr_dev(div, "class", "container");
    			add_location(div, file, 37, 0, 1779);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);
    			mount_component(postswrapper, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*categoryFromLocalStorage*/ ctx[1] || /*categoryFromLocalStorage*/ ctx[1] === "") if_block.p(ctx, dirty);
    			const postswrapper_changes = {};
    			if (dirty & /*articles*/ 1) postswrapper_changes.articles = /*articles*/ ctx[0];
    			postswrapper.$set(postswrapper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(postswrapper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(postswrapper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			destroy_component(postswrapper);
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

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	

    	const url = ({
    		"env": {
    			"wordpressRestUrl": "https://bosibackend.com/wp-json/wp/v2"
    		}
    	}).env.wordpressRestUrl;

    	const fields = ["link", "title", "date", "excerpt"];
    	const status = ["publish"];
    	const categoryFromLocalStorage = window.localStorage.getItem("category");
    	let articles = [];

    	const fetchArticles = (category = undefined) => __awaiter(void 0, void 0, void 0, function* () {
    		if (articles.length !== 0) {
    			$$invalidate(0, articles = []);
    		}

    		if (category) {
    			window.localStorage.setItem("category", category.toString());
    		}

    		const selectedCategory = categoryFromLocalStorage || category;

    		const response = yield fetch(`${url}/posts?status=${status.toString()}&_fields=${fields.toString()}${selectedCategory
		? `&categories=${selectedCategory}`
		: ""}`);

    		$$invalidate(0, articles = yield response.json());
    	});

    	onMount(() => __awaiter(void 0, void 0, void 0, function* () {
    		fetchArticles();
    	}));

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		__awaiter,
    		onMount,
    		Dialog,
    		PostsWrapper,
    		url,
    		fields,
    		status,
    		categoryFromLocalStorage,
    		articles,
    		fetchArticles
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("articles" in $$props) $$invalidate(0, articles = $$props.articles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [articles, categoryFromLocalStorage, fetchArticles];
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
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
        target: document.getElementById('main'),
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
