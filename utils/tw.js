import React from 'react';
import { motion } from 'motion/react';
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

// Add support for tw.motion
const motionProxy = new Proxy(function () { }, {
  apply(target, thisArg, args) {
    // tw.motion`...` defaults to motion.div
    return createStyledElement(motion.div)(...args);
  },
  get(target, prop) {
    // tw.motion.div, tw.motion.span, etc.
    if (typeof motion[prop] === 'function') {
      return createStyledElement(motion[prop]);
    }
    return target[prop];
  }
});

const twHandler = {
  apply(target, thisArg, args) {
    // tw`...` syntax, default to div
    return createStyledElement('div')(...args);
  },
  get(target, prop) {
    if (prop === 'motion') {
      return motionProxy;
    }
    if (elementTypes.includes(prop)) {
      return createStyledElement(prop);
    }
    // Support React components (e.g., motion.div)
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