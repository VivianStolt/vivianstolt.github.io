import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Arrow.css';

import arrowUp from '../assets/icons/arrow-up.svg';
import arrowUpHover from '../assets/icons/arrow-up-hover.svg';
import arrowDown from '../assets/icons/arrow-down.svg';
import arrowDownHover from '../assets/icons/arrow-down-hover.svg';
import arrowLeft from '../assets/icons/arrow-left.svg';
import arrowLeftHover from '../assets/icons/arrow-left-hover.svg';
import arrowRight from '../assets/icons/arrow-right.svg';
import arrowRightHover from '../assets/icons/arrow-right-hover.svg';

const ARROWS = {
  up: { base: arrowUp, hover: arrowUpHover },
  down: { base: arrowDown, hover: arrowDownHover },
  left: { base: arrowLeft, hover: arrowLeftHover },
  right: { base: arrowRight, hover: arrowRightHover }
};

const Arrow = ({
  direction = 'right',
  size = 35,
  className = '',
  alt = '',
  ariaHidden = true,
  onClick,
  style = {},
  disabled = false,
  ...props
}) => {
  const [hovered, setHovered] = useState(false);
  const key = direction && direction.toLowerCase();
  const arrow = ARROWS[key] || ARROWS.right;

  const isActive = hovered && !disabled;

  return (
    <span
      className={`arrow-icon-wrapper ${className}`}
      style={{ width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size, ...style }}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => !disabled && setHovered(true)}
      onBlur={() => setHovered(false)}
      onClick={onClick}
      {...props}
    >
      <img
        src={arrow.base}
        alt={alt || `${direction} arrow`}
        className={`arrow-base ${isActive ? 'is-hidden' : 'is-visible'}`}
        aria-hidden={ariaHidden}
        width={size}
        height={size}
        draggable={false}
      />

      <img
        src={arrow.hover}
        alt={alt || `${direction} arrow hover`}
        className={`arrow-hover ${isActive ? 'is-visible' : 'is-hidden'}`}
        aria-hidden={ariaHidden}
        width={size}
        height={size}
        draggable={false}
      />
    </span>
  );
};

Arrow.propTypes = {
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right']),
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  alt: PropTypes.string,
  ariaHidden: PropTypes.bool,
  onClick: PropTypes.func,
  style: PropTypes.object,
  disabled: PropTypes.bool
};

export default Arrow;
