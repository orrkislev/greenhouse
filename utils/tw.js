import React from 'react';
import { cn } from '@/lib/utils';

// Utility function to filter out props that start with '$'
export function filterProps(props) {
  const filtered = {};
  for (const key in props) {
    if (!key.startsWith('$')) {
      filtered[key] = props[key];
    }
  }
  return filtered;
}

function createStyledElement(elementType) {
  return (strings, ...values) => {
    const StyledComponent = React.forwardRef(({ children, className = '', ...props }, ref) => {
      // Resolve className dynamically with actual props
      const resolvedClassName = strings.reduce((acc, str, i) => {
        const val = values[i];
        const resolved = typeof val === 'function' ? val(props) : val || '';
        return acc + str + resolved;
      }, '').trim();

      const finalClassName = cn(resolvedClassName, className);

      return React.createElement(
        elementType,
        {
          className: finalClassName,
          ref,
          ...filterProps(props),
        },
        children
      );
    });

    StyledComponent.displayName = `Styled(${typeof elementType === 'string' ? elementType : elementType.displayName || elementType.name || 'Component'})`;
    return StyledComponent;
  };
}

const elementTypes = [
  'div', 'span', 'button', 'a', 'p', 'section', 'article', 'h1', 'form', 'input', 'textarea'
  // Add more as needed
];

const twHandler = {
  apply(target, thisArg, args) {
    // tw`...` syntax, default to div
    return createStyledElement('div')(...args);
  },
  get(target, prop) {
    if (elementTypes.includes(prop)) {
      return createStyledElement(prop);
    }
    // Support React components
    if (typeof prop === 'function' || (typeof prop === 'object' && prop !== null)) {
      return createStyledElement(prop);
    }
    // fallback to default
    return target[prop];
  }
};

export const tw = new Proxy(function () { }, twHandler);

// Optionally keep the old styled object for compatibility
export const styled = Object.fromEntries(
  elementTypes.map(type => [type, createStyledElement(type)])
);