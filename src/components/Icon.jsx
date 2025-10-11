import React from 'react';
import PropTypes from 'prop-types';

const Icon = ({ 
  name, 
  size = 24, 
  color = 'currentColor', 
  className = '', 
  ...props 
}) => {
  const iconPath = `/src/assets/icons/${name}.svg`;

  return (
    <img
      src={iconPath}
      alt={`${name} icon`}
      width={size}
      height={size}
      className={`icon ${className}`}
      style={{ 
        filter: color !== 'currentColor' ? `hue-rotate(${color})` : 'none',
        ...props.style 
      }}
      {...props}
    />
  );
};

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number,
  color: PropTypes.string,
  className: PropTypes.string
};

export default Icon;