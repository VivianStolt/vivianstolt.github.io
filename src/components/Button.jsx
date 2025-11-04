import React from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import Arrow from './Arrow';
import './Button.css';

const Button = ({ 
  variant = 'default',
  size = 'medium',
  icon = null,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  children,
  className = '',
  onClick,
  // when true, do not add the `btn--${size}` class. Useful when a wrapper wants no size class.
  noSizeClass = false,
  ...props
}) => {
  const baseClass = 'btn';
  const classes = [
    baseClass,
    `btn--${variant}`,
    !noSizeClass && `btn--${size}`,
    disabled && 'btn--disabled',
    loading && 'btn--loading',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  const renderIcon = () => {
    if (loading) {
      return <Icon name="loading" className="btn__icon btn__icon--loading" />;
    }
    if (icon) {
      // support arrow icons as a dedicated component for hover states
      const arrowMatch = typeof icon === 'string' && icon.match(/^arrow-(up|down|left|right)$/);
      if (arrowMatch) {
        const direction = arrowMatch[1];
        return (
          <Arrow
            direction={direction}
            size={35}
            className={`btn__icon btn__icon--${iconPosition}`}
            ariaHidden={false}
            disabled={disabled}
          />
        );
      }

      return <Icon name={icon} className={`btn__icon btn__icon--${iconPosition}`} />;
    }
    return null;
  };

  return (
    <button 
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      {children && <span className="btn__text">{children}</span>}
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'carousel-nav', 'modal-nav']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  icon: PropTypes.string,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
  noSizeClass: PropTypes.bool,
  onClick: PropTypes.func
};

export default Button;