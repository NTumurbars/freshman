import withSidebar from './Components/withSidebar';
import { defineComponent } from 'react';

/**
 * Apply the sidebar HOC to multiple components at once
 *
 * @param {Object} components - An object of components to wrap
 * @returns {Object} - The wrapped components with sidebar support
 */
export function withSidebarComponents(components) {
    const wrapped = {};

    for (const [name, Component] of Object.entries(components)) {
        wrapped[name] = withSidebar(Component);
    }

    return wrapped;
}

/**
 * Create a component with sidebar support
 * This is a convenience function for creating pages
 *
 * @param {Function} render - The render function for the component
 * @returns {React.Component} - A component with sidebar support
 */
export function createPage(render) {
    // Create a named component
    const Component = defineComponent({
        render
    });

    // Wrap it with the sidebar HOC
    return withSidebar(Component);
}
