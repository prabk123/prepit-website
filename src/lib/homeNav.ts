/**
 * The homepage header starts clear over the hero film and turns into the solid
 * bar once the page scrolls (PRE-447). This script runs in the document head,
 * before the first paint, so a load or reload part-way down the page (a #faq
 * link, a restored scroll position) shows the solid bar straight away instead
 * of light type over cream until React hydrates. It keeps two attributes on
 * <html> that globals.css reads:
 *
 * - `data-nav-solid` while the page is scrolled past SOLID_AFTER_PX.
 * - `data-nav-anim` from the visitor's first wheel, touch, key or pointer
 *   press, so the browser's own jump to a restored or #anchor position swaps
 *   the header at once and only the visitor's scrolling fades it.
 *
 * Every page runs it (it is cheap); only the homepage header (`.home-nav`) uses
 * the attributes, so a client-side visit to / from another page still works.
 */
export const SOLID_AFTER_PX = 8;

export const HOME_NAV_SCRIPT = `(function(){var d=document.documentElement;function u(){d.toggleAttribute('data-nav-solid',window.scrollY>${SOLID_AFTER_PX})}u();window.addEventListener('scroll',u,{passive:true});var e=['wheel','touchstart','keydown','pointerdown'];function a(){d.setAttribute('data-nav-anim','');e.forEach(function(t){window.removeEventListener(t,a,true)})}e.forEach(function(t){window.addEventListener(t,a,{capture:true,passive:true})})})()`;
